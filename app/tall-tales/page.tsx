"use client";

import { useState, FormEvent, useEffect } from "react";
import TallTalesDisclaimer from "@/components/TallTalesDisclaimer";

export default function TallTalesPage() {
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [imageUrls, setImageUrls] = useState<string[]>([]);
	const [submitted, setSubmitted] = useState(false);
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isUploadingImage, setIsUploadingImage] = useState(false);
	const [showDisclaimer, setShowDisclaimer] = useState(true);
	const [disclaimerClosed, setDisclaimerClosed] = useState(false);
	const [tales, setTales] = useState<Array<{
		id: string;
		userId: string;
		title: string;
		content: string;
		imageUrls?: string[];
		createdAt: Date;
		authorName: string;
		authorAvatarUrl?: string;
	}>>([]);
	const [isLoadingTales, setIsLoadingTales] = useState(true);

	const remainingCharacters = 5000 - content.length;

	useEffect(() => {
		// Load tales after disclaimer is shown
		if (disclaimerClosed) {
			loadTales();
		}
	}, [disclaimerClosed]);

	const loadTales = async () => {
		try {
			setIsLoadingTales(true);
			const response = await fetch("/api/tall-tales");
			if (response.ok) {
				const data = await response.json();
				setTales(data);
			}
		} catch (error) {
			console.error("Failed to load tall tales:", error);
		} finally {
			setIsLoadingTales(false);
		}
	};

	const handleImageUpload = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = event.target.files?.[0];
		if (!file) return;

		if (imageUrls.length >= 5) {
			setError("Maximum 5 images allowed per post");
			return;
		}

		setIsUploadingImage(true);
		setError("");

		try {
			const formData = new FormData();
			formData.append("file", file);
			formData.append("type", "tale");

			const response = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to upload image");
			}

			const { url } = await response.json();
			setImageUrls([...imageUrls, url]);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to upload image"
			);
		} finally {
			setIsUploadingImage(false);
		}
	};

	const removeImage = (index: number) => {
		setImageUrls(imageUrls.filter((_, i) => i !== index));
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setError("");
		setIsSubmitting(true);

		try {
			if (!title.trim()) {
				throw new Error("Title is required");
			}

			if (!content.trim()) {
				throw new Error("Content is required");
			}

			if (content.length > 5000) {
				throw new Error("Content must not exceed 5000 characters");
			}

			const response = await fetch("/api/tall-tales", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					title: title.trim(),
					content: content.trim(),
					imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to post tall tale");
			}

			setSubmitted(true);
			setTitle("");
			setContent("");
			setImageUrls([]);
			
			// Reload tales
			await loadTales();

			// Reset success message after 5 seconds
			setTimeout(() => setSubmitted(false), 5000);
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setIsSubmitting(false);
		}
	};

	const formatDate = (date: Date) => {
		const d = new Date(date);
		return d.toLocaleDateString('en-US', { 
			month: 'short', 
			day: 'numeric', 
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	return (
		<section className="mx-auto max-w-4xl space-y-8 px-4 py-8">
			{showDisclaimer && (
				<TallTalesDisclaimer onClose={() => {
					setShowDisclaimer(false);
					setDisclaimerClosed(true);
				}} />
			)}

			<div className="space-y-2">
				<h1 className="text-3xl font-bold text-slate-100">Tall Tales</h1>
				<p className="text-sm text-slate-400">
					Share your campaign stories, memorable game moments, and boardgame-related content with the community.
				</p>
			</div>

			<form
				onSubmit={handleSubmit}
				className="space-y-6 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 shadow-lg shadow-slate-900/30"
			>
				<div className="space-y-2">
					<label
						htmlFor="title"
						className="block text-sm font-medium text-slate-200"
					>
						Title
					</label>
					<input
						id="title"
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Give your story a catchy title..."
						maxLength={200}
						className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
					/>
				</div>

				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<label
							htmlFor="content"
							className="block text-sm font-medium text-slate-200"
						>
							Your Story (Markdown supported)
						</label>
						<span className={`text-xs ${remainingCharacters < 0 ? 'text-red-400' : remainingCharacters < 500 ? 'text-amber-400' : 'text-slate-500'}`}>
							{remainingCharacters} characters remaining
						</span>
					</div>
					<textarea
						id="content"
						value={content}
						onChange={(e) => setContent(e.target.value)}
						rows={12}
						placeholder="Share your epic tale here... You can use Markdown for formatting:&#10;&#10;# Heading&#10;**bold** or *italic*&#10;- List items&#10;&#10;Tell us about that critical hit, the hilarious roleplay moment, or the strategic victory!"
						className="w-full resize-y rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm leading-relaxed text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
					/>
					<p className="text-xs text-slate-500">
						You can use Markdown for headings (#), emphasis (**bold**, *italic*), and lists (-)
					</p>
				</div>

				<div className="space-y-2">
					<label className="block text-sm font-medium text-slate-200">
						Images (Optional, up to 5)
					</label>
					<div className="flex flex-wrap gap-3">
						{imageUrls.map((url, index) => (
							<div key={index} className="relative">
								<img
									src={url}
									alt={`Upload ${index + 1}`}
									className="h-24 w-24 rounded-lg border border-slate-700 object-cover"
								/>
								<button
									type="button"
									onClick={() => removeImage(index)}
									className="absolute -right-2 -top-2 rounded-full bg-red-600 p-1 text-white hover:bg-red-700"
								>
									<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>
						))}
						{imageUrls.length < 5 && (
							<label
								htmlFor="image-upload"
								className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-700 bg-slate-800/50 transition hover:border-slate-600 hover:bg-slate-800"
							>
								{isUploadingImage ? (
									<span className="text-xs text-slate-400">Uploading...</span>
								) : (
									<svg className="h-8 w-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
									</svg>
								)}
							</label>
						)}
					</div>
					<input
						id="image-upload"
						type="file"
						accept="image/jpeg,image/png,image/webp,image/gif"
						onChange={handleImageUpload}
						disabled={isUploadingImage || imageUrls.length >= 5}
						className="hidden"
					/>
					<p className="text-xs text-slate-500">
						JPG, PNG, WebP or GIF. Max 5MB per image.
					</p>
				</div>

				{error && (
					<div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
						{error}
					</div>
				)}

				{submitted && (
					<div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
						Your tale has been shared successfully!
					</div>
				)}

				<button
					type="submit"
					disabled={isSubmitting || content.length > 5000}
					className="w-full rounded-xl bg-sky-500 px-6 py-3 font-medium text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{isSubmitting ? "Posting..." : "Share Your Tale"}
				</button>
			</form>

			{/* Tales List */}
			<div className="space-y-6">
				<h2 className="text-2xl font-bold text-slate-100">Recent Tales</h2>
				
				{isLoadingTales ? (
					<div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-8 text-center">
						<p className="text-slate-400">Loading tales...</p>
					</div>
				) : tales.length === 0 ? (
					<div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-8 text-center">
						<p className="text-slate-400">No tales yet. Be the first to share your story!</p>
					</div>
				) : (
					tales.map((tale) => (
						<article 
							key={tale.id}
							className="space-y-4 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 shadow-lg shadow-slate-900/30"
						>
							<div className="flex items-start justify-between gap-4">
								<div className="flex items-center gap-3">
									{tale.authorAvatarUrl ? (
										<img
											src={tale.authorAvatarUrl}
											alt={tale.authorName}
											className="h-10 w-10 rounded-full border border-slate-700 object-cover"
										/>
									) : (
										<div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-sm font-semibold text-slate-300">
											{tale.authorName.charAt(0).toUpperCase()}
										</div>
									)}
									<div>
										<p className="font-medium text-slate-200">{tale.authorName}</p>
										<p className="text-xs text-slate-500">{formatDate(tale.createdAt)}</p>
									</div>
								</div>
							</div>
							
							<div>
								<h3 className="text-xl font-semibold text-slate-100 mb-2">{tale.title}</h3>
								<p className="whitespace-pre-line text-slate-300">{tale.content}</p>
							</div>
							
							{tale.imageUrls && tale.imageUrls.length > 0 && (
								<div className="flex flex-wrap gap-3">
									{tale.imageUrls.map((url: string, index: number) => (
										<img
											key={index}
											src={url}
											alt={`Tale image ${index + 1}`}
											className="h-32 w-32 rounded-lg border border-slate-700 object-cover"
										/>
									))}
								</div>
							)}
						</article>
					))
				)}
			</div>
		</section>
	);
}
