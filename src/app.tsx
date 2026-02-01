import { Alert } from "@ngrok/mantle/alert";
import { Button } from "@ngrok/mantle/button";
import { Card } from "@ngrok/mantle/card";
import { cx } from "@ngrok/mantle/cx";
import { DownloadSimpleIcon, ImageSquareIcon, SmileyMeltingIcon } from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { useRef, useState } from "react";

import { generateIntensifiesGif, inputSchema } from "./intensifies.client";

export function App() {
	const [gifUrl, setGifUrl] = useState<string | null>(null);
	const [gifFileName, setGifFileName] = useState<string>("");
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			imageData: "",
			fileName: "",
		},
		validators: {
			onChange: inputSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				const result = await generateIntensifiesGif(value);
				setGifUrl(result.gifUrl);
				setGifFileName(result.fileName);
			} catch (error) {
				setErrorMessage(`Failed to generate GIF: ${getErrorMessage(error)}`);
			}
		},
	});

	function processFile(file: File) {
		if (!file.type.startsWith("image/")) {
			setErrorMessage(`Received bad file type as input: "${file.type}". Please try again using an image.`);
			return;
		}

		form.setFieldValue("fileName", file.name);
		const reader = new FileReader();
		reader.onload = (event) => {
			const result = event.target?.result as string;
			form.setFieldValue("imageData", result);
			setGifUrl(null);
		};
		reader.onerror = () => {
			setErrorMessage("Failed to read the image file. Please try again.");
		};
		reader.readAsDataURL(file);
	}

	function handleReset() {
		form.reset();
		setGifUrl(null);
		setGifFileName("");
		setErrorMessage(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	}

	return (
		<div className="flex min-h-screen flex-col items-center justify-center p-8">
			<div className="w-full max-w-2xl space-y-8">
				<div className="text-center">
					<h1 className="mb-4 text-6xl font-bold">INTENSIFIES.LOL</h1>
					<p className="text-muted-foreground">
						Upload an image and make it an{" "}
						<span className="animate-intensify text-strong inline-block">INTENSIFIED</span> gif!
					</p>
				</div>

				<Card.Root>
					<Card.Body>
						{errorMessage && (
							<Alert.Root priority="danger" className="mb-4">
								<Alert.Icon />
								<Alert.Content>
									<Alert.Title>
										Something went wrong <SmileyMeltingIcon className="inline-block" />
									</Alert.Title>
									<Alert.Description>{errorMessage}</Alert.Description>
								</Alert.Content>
							</Alert.Root>
						)}
						<form.Field name="imageData">
							{(field) => (
								<>
									{!field.state.value ? (
										<div
											data-dragging={isDragging}
											className={cx(
												"border-card-muted data-[dragging~='true']:border-accent-500 data-[dragging~='true']:bg-card-hover rounded-lg border-2 border-dashed p-12 text-center transition-colors",
											)}
											onDragOver={(event) => {
												event.preventDefault();
												event.stopPropagation();
												setIsDragging(true);
											}}
											onDragLeave={(event) => {
												event.preventDefault();
												event.stopPropagation();
												setIsDragging(false);
											}}
											onDrop={(event) => {
												event.preventDefault();
												event.stopPropagation();
												setIsDragging(false);
												setErrorMessage(null);
												const file = event.dataTransfer.files?.[0];
												if (file) {
													processFile(file);
												}
											}}
										>
											<input
												ref={fileInputRef}
												type="file"
												accept="image/*"
												onChange={(event) => {
													setErrorMessage(null);
													const file = event.target.files?.[0];
													if (file) {
														processFile(file);
													}
												}}
												className="hidden"
												id="file-upload"
											/>
											<div className="space-y-2">
												<p className="text-muted-foreground text-sm">Drag and drop an image here, or</p>
												<Button
													type="button"
													appearance="filled"
													onClick={() => fileInputRef.current?.click()}
													icon={<ImageSquareIcon />}
												>
													Choose image
												</Button>
											</div>
										</div>
									) : (
										<form
											onSubmit={(event) => {
												event.preventDefault();
												event.stopPropagation();
												form.handleSubmit();
											}}
											className="space-y-6"
										>
											<div className="flex justify-center gap-4">
												{!gifUrl && (
													<Card.Root className="max-w-md p-4">
														<p className="text-muted-foreground mb-2 text-sm">Preview:</p>
														<img src={field.state.value} alt="Preview" className="w-full rounded" />
													</Card.Root>
												)}

												{gifUrl && (
													<Card.Root className="max-w-md p-4">
														<p className="text-muted-foreground mb-2 text-sm">Result:</p>
														<img src={gifUrl} alt="Intensified" className="w-full rounded" />
													</Card.Root>
												)}
											</div>

											<div className="mx-auto flex max-w-sm flex-col items-center justify-center gap-4">
												{!gifUrl ? (
													<>
														<Button
															type="submit"
															className={cx(form.state.isSubmitting && "animate-intensify")}
															disabled={form.state.isSubmitting}
															priority="default"
															appearance="filled"
														>
															{form.state.isSubmitting ? "INTENSIFYING..." : "INTENSIFY"}
														</Button>
														<Button type="reset" onClick={handleReset} className="text-muted" appearance="link">
															Cancel
														</Button>
													</>
												) : (
													<>
														<Button
															type="button"
															onClick={() => {
																if (!gifUrl) {
																	return;
																}

																const link = document.createElement("a");
																link.href = gifUrl;
																link.download = gifFileName || "intensifies.gif";
																link.click();
															}}
															appearance="filled"
															icon={<DownloadSimpleIcon />}
														>
															Download GIF
														</Button>
														<Button type="reset" onClick={handleReset} priority="neutral">
															New Image
														</Button>
													</>
												)}
											</div>
										</form>
									)}
								</>
							)}
						</form.Field>
					</Card.Body>
				</Card.Root>
			</div>
		</div>
	);
}

function getErrorMessage(error: unknown) {
	return error instanceof Error ? error.message : String(error);
}
