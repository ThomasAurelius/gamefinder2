"use client";

import { useState } from "react";

type ShareToFacebookProps = {
	url: string;
	quote?: string;
};

export default function ShareToFacebook({ url, quote }: ShareToFacebookProps) {
	const [isSharing, setIsSharing] = useState(false);

	const handleShare = () => {
		setIsSharing(true);
		
		// Construct the Facebook share URL
		const facebookShareUrl = new URL("https://www.facebook.com/sharer/sharer.php");
		facebookShareUrl.searchParams.append("u", url);
		if (quote) {
			facebookShareUrl.searchParams.append("quote", quote);
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

	return (
		<button
			onClick={handleShare}
			disabled={isSharing}
			className="flex items-center gap-2 rounded-lg bg-[#1877F2] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#166FE5] disabled:cursor-not-allowed disabled:opacity-50"
			title="Share to Facebook"
		>
			<svg
				className="h-5 w-5"
				fill="currentColor"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
			</svg>
			<span>Share to Facebook</span>
		</button>
	);
}
