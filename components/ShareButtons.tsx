"use client";

import { useState } from "react";

type ShareButtonsProps = {
	url: string;
	title: string;
	description?: string;
};

export default function ShareButtons({ url, title, description }: ShareButtonsProps) {
	const [isCopied, setIsCopied] = useState(false);
	const [isSharing, setIsSharing] = useState(false);

	const handleFacebookShare = () => {
		setIsSharing(true);
		
		// Construct the Facebook share URL
		const facebookShareUrl = new URL("https://www.facebook.com/sharer/sharer.php");
		facebookShareUrl.searchParams.append("u", url);
		if (description) {
			facebookShareUrl.searchParams.append("quote", description);
		}

		// Open Facebook share dialog in a popup window
		const width = 600;
		const height = 400;
		const left = window.screen.width / 2 - width / 2;
		const top = window.screen.height / 2 - height / 2;

		window.open(
			facebookShareUrl.toString(),
			"facebook-share-dialog",
			`width=${width},height=${height},top=${top},left=${left}`
		);

		setIsSharing(false);
	};

	const handleDiscordShare = () => {
		// Discord doesn't have a direct share URL, but we can copy a formatted message
		const discordMessage = `**${title}**\n${description || ""}\n${url}`;
		
		navigator.clipboard.writeText(discordMessage).then(() => {
			alert("Discord message copied to clipboard! Paste it in your Discord channel.");
		}).catch(() => {
			alert("Failed to copy to clipboard");
		});
	};

	const handleEmailShare = () => {
		const subject = encodeURIComponent(title);
		const body = encodeURIComponent(`${description || ""}\n\n${url}`);
		window.location.href = `mailto:?subject=${subject}&body=${body}`;
	};

	const handleCopyLink = async () => {
		try {
			await navigator.clipboard.writeText(url);
			setIsCopied(true);
			setTimeout(() => setIsCopied(false), 2000);
		} catch (err) {
			alert("Failed to copy link");
		}
	};

	return (
		<div className="flex flex-wrap gap-2">
			{/* Facebook Share Button */}
			<button
				onClick={handleFacebookShare}
				disabled={isSharing}
				className="flex items-center gap-2 rounded-lg bg-[#1877F2] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#166FE5] disabled:cursor-not-allowed disabled:opacity-50"
				title="Share to Facebook"
			>
				<svg
					className="h-4 w-4"
					fill="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
				</svg>
				<span className="hidden sm:inline">Facebook</span>
			</button>

			{/* Discord Share Button */}
			<button
				onClick={handleDiscordShare}
				className="flex items-center gap-2 rounded-lg bg-[#5865F2] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#4752C4]"
				title="Share to Discord"
			>
				<svg
					className="h-4 w-4"
					fill="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
				</svg>
				<span className="hidden sm:inline">Discord</span>
			</button>

			{/* Email Share Button */}
			<button
				onClick={handleEmailShare}
				className="flex items-center gap-2 rounded-lg bg-slate-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-600"
				title="Share via Email"
			>
				<svg
					className="h-4 w-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
					/>
				</svg>
				<span className="hidden sm:inline">Email</span>
			</button>

			{/* Copy Link Button */}
			<button
				onClick={handleCopyLink}
				className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white transition ${
					isCopied
						? "bg-green-600 hover:bg-green-700"
						: "bg-slate-700 hover:bg-slate-600"
				}`}
				title="Copy Link"
			>
				{isCopied ? (
					<>
						<svg
							className="h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M5 13l4 4L19 7"
							/>
						</svg>
						<span className="hidden sm:inline">Copied!</span>
					</>
				) : (
					<>
						<svg
							className="h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
							/>
						</svg>
						<span className="hidden sm:inline">Copy Link</span>
					</>
				)}
			</button>
		</div>
	);
}
