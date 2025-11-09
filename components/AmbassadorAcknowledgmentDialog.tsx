"use client";

import { useState, useEffect, useRef } from "react";

interface AmbassadorAcknowledgmentDialogProps {
	onAcknowledge: () => void;
	onCancel: () => void;
}

export default function AmbassadorAcknowledgmentDialog({
	onAcknowledge,
	onCancel,
}: AmbassadorAcknowledgmentDialogProps) {
	const [hasReadAll, setHasReadAll] = useState(false);
	const contentRef = useRef<HTMLDivElement>(null);

	// Prevent body scroll when modal is open
	useEffect(() => {
		const originalOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = originalOverflow;
		};
	}, []);

	// Check if content needs scrolling, if not, automatically mark as read
	useEffect(() => {
		const checkScrollNeeded = () => {
			if (contentRef.current) {
				const { scrollHeight, clientHeight } = contentRef.current;
				if (scrollHeight <= clientHeight) {
					setHasReadAll(true);
				}
			}
		};

		const timeoutId = setTimeout(checkScrollNeeded, 100);
		return () => clearTimeout(timeoutId);
	}, []);

	const handleBackdropClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			onCancel();
		}
	};

	const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
		const target = e.currentTarget;
		const isAtBottom =
			target.scrollHeight - target.scrollTop <= target.clientHeight + 10;
		if (isAtBottom && !hasReadAll) {
			setHasReadAll(true);
		}
	};

	return (
		<div
			className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
			onClick={handleBackdropClick}
		>
			<div
				className="w-full max-w-xl rounded-xl border-2 border-amber-500 bg-slate-900 shadow-2xl shadow-amber-500/20"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="border-b border-slate-800 px-6 py-4 bg-amber-900/20">
					<h2 className="text-xl font-semibold text-slate-100">
						Ambassador Expectations
					</h2>
					<p className="mt-1 text-sm text-slate-400">
						Please read and acknowledge the following
					</p>
				</div>

				<div
					ref={contentRef}
					className="p-6 space-y-4 max-h-[60vh] overflow-y-auto"
					onScroll={handleScroll}
				>
					<div className="space-y-3">
						<p className="text-sm text-slate-200">
							In consideration for the reduced fees and benefits,
							Ambassadors are expected to share their games on social
							media, in person, and help attract players.
						</p>

						<p className="text-sm text-slate-200">
							I don&apos;t have a way to monitor this, so we are going with
							the old fashioned trust system.
						</p>
					</div>

					{!hasReadAll && (
						<p className="text-xs text-amber-400 italic text-center py-2">
							Please scroll to read all expectations
						</p>
					)}
				</div>

				<div className="flex justify-end gap-3 border-t border-slate-800 px-6 py-4">
					<button
						type="button"
						onClick={onCancel}
						className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={onAcknowledge}
						disabled={!hasReadAll}
						className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
						title={
							!hasReadAll
								? "Please scroll to read all expectations"
								: ""
						}
					>
						I Acknowledge
					</button>
				</div>
			</div>
		</div>
	);
}
