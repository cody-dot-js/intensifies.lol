declare module "gifsicle-wasm-browser" {
	interface InputFile {
		file: File | Blob | ArrayBuffer | string;
		name: string;
	}

	interface RunOptions {
		input: InputFile[];
		command: string[];
	}

	interface Gifsicle {
		run(options: RunOptions): Promise<File[]>;
	}

	const gifsicle: Gifsicle;
	export default gifsicle;
}
