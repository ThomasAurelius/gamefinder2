"use client";

interface SkipConfirmationModalProps {
	isOpen: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

export default function SkipConfirmationModal({
	isOpen,
	onConfirm,
	onCancel,
}: SkipConfirmationModalProps) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
			<div className="mx-4 w-full max-w-md space-y-6 rounded-2xl border border-white/10 bg-slate-900/95 p-8 shadow-2xl">
				<div className="text-center">
					<h2 className="text-2xl font-semibold text-slate-100">
						Skip for now?
					</h2>
					<p className="mt-4 text-slate-300">
						Don&apos;t worry! You can update all of this later in{" "}
						<span className="font-semibold text-sky-400">
							Account &gt; Profile
						</span>
					</p>
				</div>

				<div className="flex gap-3">
					<button
						type="button"
						onClick={onCancel}
						className="flex-1 rounded-md border border-white/10 bg-slate-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
					>
						Continue Setup
					</button>
					<button
						type="button"
						onClick={onConfirm}
						className="flex-1 rounded-md bg-gradient-to-r from-amber-500 via-purple-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:from-amber-400 hover:via-purple-400 hover:to-indigo-400"
					>
						Skip
					</button>
				</div>
			</div>
		</div>
	);
}
