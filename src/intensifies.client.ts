import * as gifenc from "gifenc";
import { z } from "zod";

const { GIFEncoder, quantize } = gifenc as any;

export const inputSchema = z.object({
	imageData: z.string().startsWith("data:image/"),
	fileName: z.string(),
});

export async function generateIntensifiesGif(data: z.infer<typeof inputSchema>) {
	const { imageData, fileName } = inputSchema.parse(data);

	const base64Data = imageData.split(",")[1];
	const buffer = Uint8Array.from(atob(base64Data), (char) => char.charCodeAt(0));

	const image = await createImageBitmap(new Blob([buffer]));
	const width = 128;
	const height = 128;

	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d")!;

	const aspectRatio = image.width / image.height;
	let drawWidth = width;
	let drawHeight = height;

	if (aspectRatio > 1) {
		drawHeight = width / aspectRatio;
	} else {
		drawWidth = height * aspectRatio;
	}

	const gif = GIFEncoder();
	const numFrames = 12;

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
			delay: 40,
			transparent: true,
			transparentIndex,
		});
	}

	gif.finish();
	const gifBuffer = new Uint8Array(gif.bytes());
	const base64Gif = btoa(String.fromCharCode(...gifBuffer));

	const baseName = fileName.replace(/\.[^/.]+$/, "");
	const outputFileName = `${baseName}_intensifies.gif`;

	return { gifUrl: `data:image/gif;base64,${base64Gif}`, fileName: outputFileName };
}
