"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Area } from "react-easy-crop";

interface AvatarCropperProps {
	imageSrc: string;
	onCropComplete: (croppedImage: Blob) => void;
	onCancel: () => void;
}

export default function AvatarCropper({
	imageSrc,
	onCropComplete,
	onCancel,
}: AvatarCropperProps) {
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);

	const onCropChange = (location: { x: number; y: number }) => {
		setCrop(location);
	};

	const onZoomChange = (zoom: number) => {
		setZoom(zoom);
	};

	const onCropCompleteHandler = useCallback(
		(_croppedArea: Area, croppedAreaPixels: Area) => {
			setCroppedAreaPixels(croppedAreaPixels);
		},
		[]
	);

	const createCroppedImage = async () => {
		if (!croppedAreaPixels) return;

		setIsProcessing(true);
		try {
			const image = await createImage(imageSrc);
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");

			if (!ctx) {
				throw new Error("Failed to get canvas context");
			}

			// Set canvas size to the cropped area size
			canvas.width = croppedAreaPixels.width;
			canvas.height = croppedAreaPixels.height;

			// Draw the cropped image
			ctx.drawImage(
				image,
				croppedAreaPixels.x,
				croppedAreaPixels.y,
				croppedAreaPixels.width,
				croppedAreaPixels.height,
				0,
				0,
				croppedAreaPixels.width,
				croppedAreaPixels.height
			);

			// Convert canvas to blob
			return new Promise<Blob>((resolve, reject) => {
				canvas.toBlob((blob) => {
					if (blob) {
						resolve(blob);
					} else {
						reject(new Error("Failed to create blob"));
					}
				}, "image/jpeg", 0.95);
			});
		} catch (error) {
			console.error("Error cropping image:", error);
			throw error;
		} finally {
			setIsProcessing(false);
		}
	};

	const handleSave = async () => {
		try {
			const croppedImage = await createCroppedImage();
			if (croppedImage) {
				onCropComplete(croppedImage);
			}
		} catch (error) {
			console.error("Failed to crop image:", error);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
			<div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 p-6 shadow-2xl">
				<h2 className="mb-4 text-xl font-semibold text-slate-100">
					Adjust Your Avatar
				</h2>

				<div className="relative mb-6 h-96 w-full rounded-lg bg-slate-950">
					<Cropper
						image={imageSrc}
						crop={crop}
						zoom={zoom}
						aspect={1}
						cropShape="round"
						showGrid={false}
						onCropChange={onCropChange}
						onZoomChange={onZoomChange}
						onCropComplete={onCropCompleteHandler}
					/>
				</div>

				<div className="mb-6 space-y-2">
					<label className="text-sm font-medium text-slate-200">
						Zoom: {zoom.toFixed(1)}x
					</label>
					<input
						type="range"
						min="1"
						max="3"
						step="0.1"
						value={zoom}
						onChange={(e) => setZoom(Number(e.target.value))}
						className="w-full accent-sky-500"
					/>
				</div>

				<div className="flex justify-end gap-3">
					<button
						type="button"
						onClick={onCancel}
						disabled={isProcessing}
						className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={handleSave}
						disabled={isProcessing}
						className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{isProcessing ? "Processing..." : "Save"}
					</button>
				</div>
			</div>
		</div>
	);
}

// Helper function to create an image element from a source
function createImage(url: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.addEventListener("load", () => resolve(image));
		image.addEventListener("error", (error) => reject(error));
		image.src = url;
	});
}
