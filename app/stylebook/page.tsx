"use client";

export default function StyleBookPage() {
	return (
		<div className="mx-auto max-w-6xl space-y-12 px-4 py-12">
			{/* Page Header */}
			<div className="space-y-4 text-center">
				<h1 className="text-5xl font-bold bg-gradient-to-r from-amber-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
					Style Book
				</h1>
				<p className="text-lg text-slate-300 max-w-3xl mx-auto">
					A comprehensive reference for all gradient backgrounds, button
					styles, and text treatments used throughout The Gathering Call.
				</p>
			</div>

			{/* Text Gradients Section */}
			<section className="space-y-6">
				<h2 className="text-3xl font-bold text-slate-100 border-b border-white/10 pb-3">
					Text Gradients
				</h2>
				<div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
					<div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 space-y-3">
						<h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
							Primary Text Gradient
						</h3>
						<p className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
							Sample Text
						</p>
						<code className="block text-xs text-slate-300 bg-slate-800 p-3 rounded-md overflow-x-auto">
							bg-gradient-to-r from-amber-400 via-purple-400 to-indigo-400
							bg-clip-text text-transparent
						</code>
					</div>

					<div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 space-y-3">
						<h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
							Usage Example
						</h3>
						<p className="text-xl text-slate-300">
							This gradient is used for hero titles and important headings
							throughout the application.
						</p>
					</div>
				</div>
			</section>

			{/* Background Gradients Section */}
			<section className="space-y-6">
				<h2 className="text-3xl font-bold text-slate-100 border-b border-white/10 pb-3">
					Background Gradients
				</h2>

				<div className="space-y-4">
					{/* Primary Background Gradient */}
					<div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
						<h3 className="text-lg font-semibold text-slate-200">
							Primary Background Gradient
						</h3>
						<div className="rounded-2xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-600/20 via-purple-600/20 to-indigo-600/20 p-8">
							<p className="text-slate-200 font-medium">
								This is the primary background gradient used for featured
								sections and important content areas.
							</p>
						</div>
						<code className="block text-xs text-slate-300 bg-slate-800 p-3 rounded-md overflow-x-auto">
							bg-gradient-to-br from-amber-600/20 via-purple-600/20
							to-indigo-600/20
						</code>
					</div>

					{/* Subtle Background Gradient */}
					<div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
						<h3 className="text-lg font-semibold text-slate-200">
							Subtle Background Gradient
						</h3>
						<div className="rounded-lg border border-amber-500/30 bg-gradient-to-br from-amber-600/10 via-purple-600/10 to-indigo-600/10 p-8">
							<p className="text-slate-200 font-medium">
								This subtle gradient is used for sidebar sections and less
								prominent containers.
							</p>
						</div>
						<code className="block text-xs text-slate-300 bg-slate-800 p-3 rounded-md overflow-x-auto">
							bg-gradient-to-br from-amber-600/10 via-purple-600/10
							to-indigo-600/10
						</code>
					</div>

					{/* Hover Background Gradient */}
					<div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
						<h3 className="text-lg font-semibold text-slate-200">
							Interactive Background Gradient
						</h3>
						<div className="rounded-md bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-indigo-500/20 p-8 transition hover:from-amber-500/30 hover:via-purple-500/30 hover:to-indigo-500/30 cursor-pointer">
							<p className="text-slate-200 font-medium">
								Hover over this box to see the gradient transition effect.
								Used for interactive elements and menu items.
							</p>
						</div>
						<code className="block text-xs text-slate-300 bg-slate-800 p-3 rounded-md overflow-x-auto">
							bg-gradient-to-r from-amber-500/20 via-purple-500/20
							to-indigo-500/20 transition hover:from-amber-500/30
							hover:via-purple-500/30 hover:to-indigo-500/30
						</code>
					</div>

					{/* Accent Gradient Box */}
					<div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
						<h3 className="text-lg font-semibold text-slate-200">
							Accent Gradient Border
						</h3>
						<div className="rounded-2xl border-2 border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 p-8">
							<p className="text-slate-200 font-medium">
								This gradient with border is used for highlighted content
								boxes and call-to-action sections.
							</p>
						</div>
						<code className="block text-xs text-slate-300 bg-slate-800 p-3 rounded-md overflow-x-auto">
							border-2 border-amber-500/40 bg-gradient-to-r from-amber-500/10
							via-purple-500/10 to-indigo-500/10
						</code>
					</div>

					{/* Navbar Gradient */}
					<div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
						<h3 className="text-lg font-semibold text-slate-200">
							Navbar Background Gradient
						</h3>
						<div className="rounded-lg border border-white/10 bg-gradient-to-br from-amber-600/10 via-purple-600/10 to-indigo-600/10 backdrop-blur p-8">
							<p className="text-slate-200 font-medium">
								This gradient with backdrop blur is used for the navigation
								header.
							</p>
						</div>
						<code className="block text-xs text-slate-300 bg-slate-800 p-3 rounded-md overflow-x-auto">
							bg-gradient-to-br from-amber-600/10 via-purple-600/10
							to-indigo-600/10 backdrop-blur
						</code>
					</div>
				</div>
			</section>

			{/* Button Styles Section */}
			<section className="space-y-6">
				<h2 className="text-3xl font-bold text-slate-100 border-b border-white/10 pb-3">
					Button Styles
				</h2>

				<div className="space-y-6">
					{/* Primary Gradient Button */}
					<div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
						<h3 className="text-lg font-semibold text-slate-200">
							Primary Gradient Button
						</h3>
						<div className="flex gap-4 flex-wrap">
							<button
								type="button"
								className="rounded-md bg-gradient-to-r from-amber-500 via-purple-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:from-amber-400 hover:via-purple-400 hover:to-indigo-400"
							>
								Primary Action
							</button>
							<button
								type="button"
								className="rounded-lg bg-gradient-to-r from-amber-600 via-purple-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:from-amber-500 hover:via-purple-400 hover:to-indigo-400"
							>
								Primary Action (Large)
							</button>
							<button
								type="button"
								disabled
								className="rounded-md bg-gradient-to-r from-amber-500 via-purple-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:from-amber-400 hover:via-purple-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
							>
								Disabled State
							</button>
						</div>
						<code className="block text-xs text-slate-300 bg-slate-800 p-3 rounded-md overflow-x-auto">
							rounded-md bg-gradient-to-r from-amber-500 via-purple-500
							to-indigo-500 px-6 py-3 text-sm font-semibold text-white
							transition hover:from-amber-400 hover:via-purple-400
							hover:to-indigo-400
						</code>
					</div>

					{/* Blue-Purple Gradient Button */}
					<div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
						<h3 className="text-lg font-semibold text-slate-200">
							Blue-Purple Gradient Button
						</h3>
						<div className="flex gap-4 flex-wrap">
							<button
								type="button"
								className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/30 transition hover:from-blue-400 hover:to-purple-400"
							>
								Secondary Action
							</button>
						</div>
						<code className="block text-xs text-slate-300 bg-slate-800 p-3 rounded-md overflow-x-auto">
							rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2
							text-sm font-semibold text-white shadow-lg shadow-slate-900/30
							transition hover:from-blue-400 hover:to-purple-400
						</code>
					</div>

					{/* Emerald-Sky Gradient Button */}
					<div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
						<h3 className="text-lg font-semibold text-slate-200">
							Emerald-Sky Gradient Button
						</h3>
						<div className="flex gap-4 flex-wrap">
							<button
								type="button"
								className="rounded-lg bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-2 font-semibold text-white shadow-lg shadow-slate-900/30 transition hover:from-emerald-400 hover:to-sky-400"
							>
								Success Action
							</button>
						</div>
						<code className="block text-xs text-slate-300 bg-slate-800 p-3 rounded-md overflow-x-auto">
							rounded-lg bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-2
							font-semibold text-white shadow-lg shadow-slate-900/30 transition
							hover:from-emerald-400 hover:to-sky-400
						</code>
					</div>

					{/* Solid Color Buttons */}
					<div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
						<h3 className="text-lg font-semibold text-slate-200">
							Solid Color Buttons
						</h3>
						<div className="flex gap-4 flex-wrap">
							<button
								type="button"
								className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
							>
								Sky Button
							</button>
							<button
								type="button"
								className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700"
							>
								Purple Button
							</button>
							<button
								type="button"
								className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700"
							>
								Amber Button
							</button>
							<button
								type="button"
								className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
							>
								Red Button
							</button>
						</div>
						<code className="block text-xs text-slate-300 bg-slate-800 p-3 rounded-md overflow-x-auto">
							rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white
							transition hover:bg-sky-700
						</code>
					</div>

					{/* Bordered Buttons */}
					<div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
						<h3 className="text-lg font-semibold text-slate-200">
							Bordered Buttons
						</h3>
						<div className="flex gap-4 flex-wrap">
							<button
								type="button"
								className="rounded-md border-2 border-indigo-500/50 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
							>
								Secondary
							</button>
							<button
								type="button"
								className="inline-flex items-center rounded-lg border border-rose-500 px-4 py-2 font-medium text-rose-300 transition hover:bg-rose-500/10"
							>
								Cancel / Danger
							</button>
							<button
								type="button"
								className="rounded-md border border-indigo-500/70 px-3 py-1.5 text-xs font-medium text-indigo-200 transition hover:bg-indigo-500/10"
							>
								Edit
							</button>
							<button
								type="button"
								className="inline-flex items-center gap-2 rounded-lg border border-sky-500/40 bg-sky-500/20 px-4 py-2 text-sm font-medium text-sky-200 transition hover:border-sky-500 hover:bg-sky-500/30"
							>
								Link Style
							</button>
						</div>
						<code className="block text-xs text-slate-300 bg-slate-800 p-3 rounded-md overflow-x-auto">
							rounded-md border-2 border-indigo-500/50 px-6 py-3 text-sm
							font-semibold text-slate-200 transition hover:bg-white/10
						</code>
					</div>

					{/* Interactive Link Buttons */}
					<div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
						<h3 className="text-lg font-semibold text-slate-200">
							Interactive Link with Gradient Background
						</h3>
						<div className="flex gap-4 flex-wrap">
							<div className="rounded-2xl bg-gradient-to-r from-amber-600/50 via-purple-600/30 to-indigo-600/50 border border-amber-500/30 p-3 shadow-xl transition hover:from-amber-600/60 hover:via-purple-600/40 hover:to-indigo-600/60 cursor-pointer">
								<p className="text-amber-200 hover:text-white font-semibold text-sm">
									Learn more about hosting paid games →
								</p>
							</div>
						</div>
						<code className="block text-xs text-slate-300 bg-slate-800 p-3 rounded-md overflow-x-auto">
							rounded-2xl bg-gradient-to-r from-amber-600/50 via-purple-600/30
							to-indigo-600/50 border border-amber-500/30 p-3 shadow-xl
							transition hover:from-amber-600/60 hover:via-purple-600/40
							hover:to-indigo-600/60
						</code>
					</div>
				</div>
			</section>

			{/* Alert/Status Boxes Section */}
			<section className="space-y-6">
				<h2 className="text-3xl font-bold text-slate-100 border-b border-white/10 pb-3">
					Alert & Status Boxes
				</h2>

				<div className="space-y-4">
					{/* Success Box */}
					<div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
						<h3 className="text-lg font-semibold text-slate-200">
							Success / Info Box
						</h3>
						<div className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-200">
							<p>This is a success or informational message box.</p>
						</div>
						<code className="block text-xs text-slate-300 bg-slate-800 p-3 rounded-md overflow-x-auto">
							rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3
							text-sm text-green-200
						</code>
					</div>

					{/* Warning Box */}
					<div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
						<h3 className="text-lg font-semibold text-slate-200">
							Warning Box
						</h3>
						<div className="rounded-lg border border-amber-700/30 bg-amber-950/20 px-4 py-3 text-sm text-amber-200">
							<p>This is a warning or notice message box.</p>
						</div>
						<code className="block text-xs text-slate-300 bg-slate-800 p-3 rounded-md overflow-x-auto">
							rounded-lg border border-amber-700/30 bg-amber-950/20 px-4 py-3
							text-sm text-amber-200
						</code>
					</div>

					{/* Error Box */}
					<div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
						<h3 className="text-lg font-semibold text-slate-200">
							Error / Danger Box
						</h3>
						<div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
							<p>This is an error or danger message box.</p>
						</div>
						<code className="block text-xs text-slate-300 bg-slate-800 p-3 rounded-md overflow-x-auto">
							rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3
							text-sm text-red-400
						</code>
					</div>

					{/* Info Box (Sky/Blue) */}
					<div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
						<h3 className="text-lg font-semibold text-slate-200">
							Info Box (Sky)
						</h3>
						<div className="rounded-xl border border-sky-600/40 bg-sky-900/20 px-4 py-3 text-sm text-sky-200">
							<p>This is an informational message box with sky theme.</p>
						</div>
						<div className="rounded-lg bg-sky-600/20 border border-sky-600/40 px-3 py-2 text-sm text-sky-200">
							<p>Alternative sky info box style.</p>
						</div>
						<code className="block text-xs text-slate-300 bg-slate-800 p-3 rounded-md overflow-x-auto">
							rounded-xl border border-sky-600/40 bg-sky-900/20 px-4 py-3
							text-sm text-sky-200
						</code>
					</div>

					{/* Purple Box */}
					<div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
						<h3 className="text-lg font-semibold text-slate-200">
							Purple Accent Box
						</h3>
						<div className="rounded-lg border border-purple-500/20 bg-purple-900/10 px-4 py-3 text-sm text-purple-200">
							<p>This is a purple-themed content box.</p>
						</div>
						<code className="block text-xs text-slate-300 bg-slate-800 p-3 rounded-md overflow-x-auto">
							rounded-lg border border-purple-500/20 bg-purple-900/10 px-4 py-3
							text-sm text-purple-200
						</code>
					</div>
				</div>
			</section>

			{/* Color Palette Reference */}
			<section className="space-y-6">
				<h2 className="text-3xl font-bold text-slate-100 border-b border-white/10 pb-3">
					Color Palette
				</h2>
				<div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<div className="space-y-2">
							<div className="h-20 rounded-lg bg-amber-500"></div>
							<p className="text-xs text-slate-300">Amber (Primary)</p>
							<code className="text-xs text-slate-400">amber-500</code>
						</div>
						<div className="space-y-2">
							<div className="h-20 rounded-lg bg-purple-500"></div>
							<p className="text-xs text-slate-300">Purple (Primary)</p>
							<code className="text-xs text-slate-400">purple-500</code>
						</div>
						<div className="space-y-2">
							<div className="h-20 rounded-lg bg-indigo-500"></div>
							<p className="text-xs text-slate-300">Indigo (Primary)</p>
							<code className="text-xs text-slate-400">indigo-500</code>
						</div>
						<div className="space-y-2">
							<div className="h-20 rounded-lg bg-sky-500"></div>
							<p className="text-xs text-slate-300">Sky (Accent)</p>
							<code className="text-xs text-slate-400">sky-500</code>
						</div>
						<div className="space-y-2">
							<div className="h-20 rounded-lg bg-emerald-500"></div>
							<p className="text-xs text-slate-300">Emerald (Success)</p>
							<code className="text-xs text-slate-400">emerald-500</code>
						</div>
						<div className="space-y-2">
							<div className="h-20 rounded-lg bg-rose-500"></div>
							<p className="text-xs text-slate-300">Rose (Danger)</p>
							<code className="text-xs text-slate-400">rose-500</code>
						</div>
						<div className="space-y-2">
							<div className="h-20 rounded-lg bg-slate-800"></div>
							<p className="text-xs text-slate-300">Slate (Background)</p>
							<code className="text-xs text-slate-400">slate-800</code>
						</div>
						<div className="space-y-2">
							<div className="h-20 rounded-lg border border-white/20 bg-slate-950"></div>
							<p className="text-xs text-slate-300">Base (BG)</p>
							<code className="text-xs text-slate-400">slate-950</code>
						</div>
					</div>
				</div>
			</section>

			{/* Usage Notes */}
			<section className="space-y-6">
				<h2 className="text-3xl font-bold text-slate-100 border-b border-white/10 pb-3">
					Usage Guidelines
				</h2>
				<div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 space-y-4 text-slate-300">
					<div>
						<h3 className="text-lg font-semibold text-slate-100 mb-2">
							Primary Gradient (Amber → Purple → Indigo)
						</h3>
						<p className="text-sm">
							Use for primary actions, hero titles, and main call-to-action
							buttons. This is the signature gradient of The Gathering Call.
						</p>
					</div>
					<div>
						<h3 className="text-lg font-semibold text-slate-100 mb-2">
							Blue-Purple Gradient
						</h3>
						<p className="text-sm">
							Use for secondary actions and supporting interactive elements.
						</p>
					</div>
					<div>
						<h3 className="text-lg font-semibold text-slate-100 mb-2">
							Emerald-Sky Gradient
						</h3>
						<p className="text-sm">
							Use for success states, confirmations, and positive actions.
						</p>
					</div>
					<div>
						<h3 className="text-lg font-semibold text-slate-100 mb-2">
							Opacity Levels
						</h3>
						<ul className="text-sm list-disc list-inside space-y-1">
							<li>/10 - Very subtle backgrounds (navbar, sidebar)</li>
							<li>/20 - Light backgrounds (featured content boxes)</li>
							<li>/30 - Hover states and interactive elements</li>
							<li>/50 - Borders and medium emphasis</li>
							<li>Full opacity - Solid buttons and text</li>
						</ul>
					</div>
				</div>
			</section>
		</div>
	);
}
