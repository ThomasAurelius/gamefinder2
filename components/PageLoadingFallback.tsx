/**
 * Loading fallback component used in Suspense boundaries for page-level loading states.
 * Displays a simple centered loading message with consistent styling.
 */
export default function PageLoadingFallback() {
	return (
		<div className="space-y-6">
			<div className="text-center text-slate-400">Loading...</div>
		</div>
	);
}
