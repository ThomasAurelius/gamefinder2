"use client";

import { useState, FormEvent, useEffect } from "react";
import TallTalesDisclaimer from "@/components/TallTalesDisclaimer";
import TaleActions from "@/components/TaleActions";
import { Tale, TaleFromAPI } from "@/lib/tall-tales/client-types";
import { GAME_OPTIONS } from "@/lib/constants";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function TallTalesPage() {
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [imageUrls, setImageUrls] = useState<string[]>([]);
	const [gameSystem, setGameSystem] = useState("");
	const [customGameSystem, setCustomGameSystem] = useState("");
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
		gameSystem?: string;
		customGameSystem?: string;
		createdAt: Date;
		authorName: string;
		authorAvatarUrl?: string;
	}>>([]);
	const [isLoadingTales, setIsLoadingTales] = useState(true);
	const [flagModalOpen, setFlagModalOpen] = useState(false);
	const [flagTaleId, setFlagTaleId] = useState("");
	const [flagReason, setFlagReason] = useState<"offtopic" | "inappropriate" | "spam" | "other">("offtopic");
	const [flagComment, setFlagComment] = useState("");
	const [flagSubmitting, setFlagSubmitting] = useState(false);
	const [flagMessage, setFlagMessage] = useState("");
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [currentUserId, setCurrentUserId] = useState<string | null>(null);
	const [isAdmin, setIsAdmin] = useState(false);
	const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);

	const remainingCharacters = 5000 - content.length;

	useEffect(() => {
		// Load user info
		loadUserInfo();
	}, []);

	useEffect(() => {
		// Load tales after disclaimer is shown
		if (disclaimerClosed) {
			loadTales();
		}
	}, [disclaimerClosed]);

	const loadUserInfo = async () => {
		try {
			const response = await fetch("/api/user/me");
			if (response.ok) {
				const data = await response.json();
				if (data.authenticated) {
					setCurrentUserId(data.userId);
					setIsAdmin(data.isAdmin || false);
				}
			}
		} catch (error) {
			console.error("Failed to load user info:", error);
		}
	};

	// Handle Escape key to close modal
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && modalImageUrl) {
				setModalImageUrl(null);
			}
		};
		window.addEventListener('keydown', handleEscape);
		return () => window.removeEventListener('keydown', handleEscape);
	}, [modalImageUrl]);

	const loadTales = async () => {
		try {
			setIsLoadingTales(true);
			const response = await fetch("/api/tall-tales");
			if (response.ok) {
				const data: TaleFromAPI[] = await response.json();
				// Convert date strings back to Date objects
				const talesWithDates: Tale[] = data.map((tale) => ({
					...tale,
					createdAt: new Date(tale.createdAt),
				}));
				setTales(talesWithDates);
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

	const resetForm = () => {
		setTitle("");
		setContent("");
		setImageUrls([]);
		setError("");
	};

	const handleToggleForm = () => {
		if (isFormOpen) {
			resetForm();
			setSubmitted(false);
		}
		setIsFormOpen(!isFormOpen);
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
					gameSystem: gameSystem || undefined,
					customGameSystem: gameSystem === "Other" && customGameSystem ? customGameSystem.trim() : undefined,
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
			setGameSystem("");
			setCustomGameSystem("");
			
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

	const handleFlagClick = (taleId: string) => {
		setFlagTaleId(taleId);
		setFlagReason("offtopic");
		setFlagComment("");
		setFlagMessage("");
		setFlagModalOpen(true);
	};

	const handleFlagSubmit = async () => {
		setFlagSubmitting(true);
		setFlagMessage("");

		try {
			const response = await fetch(`/api/tall-tales/${flagTaleId}/flag`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					flagReason,
					flagComment: flagComment.trim() || undefined,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to flag content");
			}

			setFlagMessage("Content flagged successfully. Admins will review your report.");
			setTimeout(() => {
				setFlagModalOpen(false);
			}, 2000);
		} catch (err) {
			setFlagMessage(err instanceof Error ? err.message : "Failed to flag content");
		} finally {
			setFlagSubmitting(false);
		}
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

			<div className="rounded-lg border border-slate-800 bg-slate-950/60">
				<button
					type="button"
					onClick={handleToggleForm}
					className="flex w-full items-center justify-between gap-2 bg-slate-900/50 px-4 py-3 text-left text-sm font-semibold text-slate-100 transition hover:bg-slate-900/80"
				>
					<span>
						{isFormOpen ? "Hide post form" : "Share a Tale"}
					</span>
					<span className="text-xs uppercase tracking-wide text-slate-400">
						{isFormOpen ? "Collapse" : "Expand"}
					</span>
				</button>
				{isFormOpen && (
					<form
						onSubmit={handleSubmit}
						className="space-y-6 border-t border-slate-800 p-6"
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
					<label
						htmlFor="game-system"
						className="block text-sm font-medium text-slate-200"
					>
						Game System (Optional)
					</label>
					<select
						id="game-system"
						value={gameSystem}
						onChange={(e) => setGameSystem(e.target.value)}
						className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
					>
						<option value="">Choose a game system...</option>
						{GAME_OPTIONS.map((game) => (
							<option key={game} value={game}>
								{game}
							</option>
						))}
					</select>
					<p className="text-xs text-slate-500">
						Select the game system your story is about.
					</p>
				</div>

				{gameSystem === "Other" && (
					<div className="space-y-2">
						<label
							htmlFor="custom-game-system"
							className="block text-sm font-medium text-slate-200"
						>
							Game System Name
						</label>
						<input
							id="custom-game-system"
							type="text"
							value={customGameSystem}
							onChange={(e) => setCustomGameSystem(e.target.value)}
							placeholder="Enter the name of the game system"
							className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
						/>
						<p className="text-xs text-slate-500">
							Please enter the specific name of the game system.
						</p>
					</div>
				)}

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
				)}
			</div>

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
							className="space-y-4 rounded-2xl border border-slate-800/60 bg-slate-900/40 overflow-hidden shadow-lg shadow-slate-900/30"
						>
							{/* Primary image at the top, full width */}
							{tale.imageUrls && tale.imageUrls.length > 0 && (
								<img
									src={tale.imageUrls[0]}
									alt={tale.title}
									className="w-full max-h-96 object-cover cursor-pointer transition hover:opacity-90"
									onClick={() => tale.imageUrls && setModalImageUrl(tale.imageUrls[0])}
								/>
							)}
							
							<div className="p-6 space-y-4">
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
											{tale.gameSystem && (
												<p className="text-xs text-slate-400 mt-1">
													{tale.gameSystem === "Other" && tale.customGameSystem
														? tale.customGameSystem
														: tale.gameSystem}
												</p>
											)}
										</div>
									</div>
									<div className="flex items-center gap-2">
										{(currentUserId === tale.userId || isAdmin) && (
											<TaleActions
												tale={tale}
												onUpdate={loadTales}
											/>
										)}
										<button
											onClick={() => handleFlagClick(tale.id)}
											className="rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-xs text-slate-300 transition hover:border-red-500/50 hover:bg-red-900/20 hover:text-red-400"
											title="Flag content"
										>
											<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
											</svg>
										</button>
									</div>
								</div>
								
								<div>
									<h3 className="text-xl font-semibold text-slate-100 mb-2">{tale.title}</h3>
									<div className="prose prose-invert prose-slate max-w-none prose-headings:text-slate-100 prose-p:text-slate-300 prose-strong:text-slate-100 prose-em:text-slate-300 prose-li:text-slate-300 prose-blockquote:text-slate-400">
										<ReactMarkdown remarkPlugins={[remarkGfm]}>
											{tale.content}
										</ReactMarkdown>
									</div>
								</div>
								
								{/* Additional images after the content */}
								{tale.imageUrls && tale.imageUrls.length > 1 && (
									<div className="flex flex-wrap gap-3 pt-2">
										{tale.imageUrls.slice(1).map((url: string, index: number) => (
											<img
												key={index}
												src={url}
												alt={`Tale image ${index + 2}`}
												className="h-24 w-24 rounded-lg border border-slate-700 object-cover cursor-pointer transition hover:opacity-80"
												onClick={() => setModalImageUrl(url)}
											/>
										))}
									</div>
								)}
							</div>
						</article>
					))
				)}
			</div>

			{/* Image Modal */}
			{modalImageUrl && (
				<div 
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4"
					onClick={() => setModalImageUrl(null)}
				>
					<button
						onClick={() => setModalImageUrl(null)}
						className="absolute right-4 top-4 rounded-full bg-slate-800/80 p-2 text-slate-200 transition hover:bg-slate-700"
						aria-label="Close modal"
					>
						<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
					<img
						src={modalImageUrl}
						alt="Enlarged view"
						className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
						onClick={(e) => e.stopPropagation()}
					/>
				</div>
			)}

			{/* Flag Modal */}
			{flagModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
					<div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
						<div className="mb-4 flex items-center justify-between">
							<h3 className="text-lg font-semibold text-slate-100">Flag Content</h3>
							<button
								onClick={() => setFlagModalOpen(false)}
								className="text-slate-400 hover:text-slate-200"
							>
								<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>

						<p className="mb-4 text-sm text-slate-400">
							Help us keep the community safe by reporting inappropriate content.
						</p>

						<div className="space-y-4">
							<div>
								<label className="mb-2 block text-sm font-medium text-slate-200">
									Reason
								</label>
								<select
									value={flagReason}
									onChange={(e) => setFlagReason(e.target.value as typeof flagReason)}
									className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
								>
									<option value="offtopic">Off-topic</option>
									<option value="inappropriate">Inappropriate</option>
									<option value="spam">Spam</option>
									<option value="other">Other</option>
								</select>
							</div>

							<div>
								<label className="mb-2 block text-sm font-medium text-slate-200">
									Additional Comments (Optional)
								</label>
								<textarea
									value={flagComment}
									onChange={(e) => setFlagComment(e.target.value)}
									rows={3}
									placeholder="Provide additional context..."
									className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
								/>
							</div>

							{flagMessage && (
								<div className={`rounded-lg border px-3 py-2 text-sm ${
									flagMessage.includes("successfully") 
										? "border-green-500/20 bg-green-500/10 text-green-400" 
										: "border-red-500/20 bg-red-500/10 text-red-400"
								}`}>
									{flagMessage}
								</div>
							)}

							<div className="flex gap-3">
								<button
									onClick={() => setFlagModalOpen(false)}
									className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
								>
									Cancel
								</button>
								<button
									onClick={handleFlagSubmit}
									disabled={flagSubmitting}
									className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
								>
									{flagSubmitting ? "Submitting..." : "Submit Report"}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</section>
	);
}
