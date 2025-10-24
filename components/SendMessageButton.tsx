"use client";

import { useRouter } from "next/navigation";

type SendMessageButtonProps = {
	recipientId: string;
	recipientName: string;
};

export default function SendMessageButton({
	recipientId,
	recipientName,
}: SendMessageButtonProps) {
	const router = useRouter();

	const handleClick = () => {
		const params = new URLSearchParams({
			recipientId,
			recipientName,
			compose: "true",
		});
		router.push(`/messages?${params.toString()}`);
	};

	return (
		<button
			onClick={handleClick}
			className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/30 transition hover:from-blue-400 hover:to-purple-400"
		>
			Send Message
		</button>
	);
}
