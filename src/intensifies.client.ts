import * as gifenc from "gifenc";
import gifsicle from "gifsicle-wasm-browser";
import { z } from "zod";

const { GIFEncoder, quantize } = gifenc as any;

const MAX_FILE_SIZE_BYTES = 128 * 1024;

export const inputSchema = z.object({
	imageData: z.string().startsWith("data:image/"),
	fileName: z.string(),
});

export async function generateIntensifiesGif(data: z.infer<typeof inputSchema>) {
	const { imageData, fileName } = inputSchema.parse(data);

	const base64Data = imageData.split(",")[1];
	const buffer = Uint8Array.from(atob(base64Data), (char) => char.charCodeAt(0));
	const blob = new Blob([buffer]);

	const size = 128;
	const tempImage = await createImageBitmap(blob);
	const aspectRatio = tempImage.width / tempImage.height;
	let resizeWidth: number;
	let resizeHeight: number;

	if (aspectRatio > 1) {
		resizeWidth = size;
		resizeHeight = Math.round(size / aspectRatio);
	} else {
		resizeWidth = Math.round(size * aspectRatio);
		resizeHeight = size;
	}
	tempImage.close();

	const image = await createImageBitmap(blob, {
		resizeWidth,
		resizeHeight,
		resizeQuality: "high",
	});

	const width = size;
	const height = size;

	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d")!;

	const drawWidth = image.width;
	const drawHeight = image.height;

	const gif = GIFEncoder();
	const numFrames = 8;

	for (let i = 0; i < numFrames; i++) {
		ctx.clearRect(0, 0, width, height);
		ctx.save();

		ctx.translate(width / 2, height / 2);

		const rotation = (i % 2 === 0 ? 1 : -1) * 0.08;
		const jitterX = (Math.random() * 2 - 1) * 8;
		const jitterY = (Math.random() * 2 - 1) * 8;
		const scale = 1 + (i / numFrames) * 0.1;

		ctx.rotate(rotation);
		ctx.translate(jitterX, jitterY);
		ctx.scale(scale, scale);

		ctx.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

		ctx.restore();

		const imageData = ctx.getImageData(0, 0, width, height);
		const palette = quantize(imageData.data, 255, { clearAlpha: false, oneBitAlpha: true });

		palette.push([0, 0, 0, 0]);
		const transparentIndex = palette.length - 1;

		const index = new Uint8Array(width * height);
		for (let j = 0; j < imageData.data.length; j += 4) {
			const alpha = imageData.data[j + 3];
			if (alpha < 128) {
				index[j / 4] = transparentIndex;
			} else {
				const r = imageData.data[j];
				const g = imageData.data[j + 1];
				const b = imageData.data[j + 2];
				let minDist = Number.POSITIVE_INFINITY;
				let bestIdx = 0;
				for (let k = 0; k < palette.length - 1; k++) {
					const dr = r - palette[k][0];
					const dg = g - palette[k][1];
					const db = b - palette[k][2];
					const dist = dr * dr + dg * dg + db * db;
					if (dist < minDist) {
						minDist = dist;
						bestIdx = k;
					}
				}
				index[j / 4] = bestIdx;
			}
		}

		gif.writeFrame(index, width, height, {
			palette,
			delay: 50,
			transparent: true,
			transparentIndex,
		});
	}

	gif.finish();
	const gifBuffer = new Uint8Array(gif.bytes());

	const optimizedBuffer = await optimizeGif(gifBuffer);

	let binary = "";
	const chunkSize = 8192;
	for (let i = 0; i < optimizedBuffer.length; i += chunkSize) {
		const chunk = optimizedBuffer.subarray(i, i + chunkSize);
		binary += String.fromCharCode(...chunk);
	}
	const base64Gif = btoa(binary);

	const baseName = fileName.replace(/\.[^/.]+$/, "");
	const outputFileName = `${baseName}_intensifies.gif`;

	return { gifUrl: `data:image/gif;base64,${base64Gif}`, fileName: outputFileName };
}

async function optimizeGif(buffer: Uint8Array<ArrayBuffer>): Promise<Uint8Array> {
	const inputFile = new File([buffer], "input.gif", { type: "image/gif" });

	let lossyValue = 30;
	let result = await runGifsicle(inputFile, lossyValue);

	while (result.size > MAX_FILE_SIZE_BYTES && lossyValue < 200) {
		lossyValue += 20;
		result = await runGifsicle(inputFile, lossyValue);
	}

	return new Uint8Array(await result.arrayBuffer());
}

async function runGifsicle(inputFile: File, lossyValue: number): Promise<File> {
	const output = await gifsicle.run({
		input: [{ file: inputFile, name: "input.gif" }],
		command: [`-O3 --lossy=${lossyValue} input.gif -o /out/output.gif`],
	});

	return output[0];
}
