"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

type NavLink = {
	href: string;
	label: string;
};

type NavLinkWithSubmenu = {
	label: string;
	submenu: NavLink[];
};

type NavItem = NavLink | NavLinkWithSubmenu;

function isSubmenu(item: NavItem): item is NavLinkWithSubmenu {
	return "submenu" in item;
}

const primaryLinks: NavItem[] = [
	{ href: "/dashboard", label: "Dashboard" },
	{ href: "/library", label: "Library" },
	{
		label: "Games",
		submenu: [
			{ href: "/find", label: "Find Games" },
			{ href: "/post", label: "Post Game" },
		],
	},
	{ href: "/messages", label: "Messages" },
];

const accountLinks: NavLink[] = [
	{ href: "/profile", label: "Profile" },
	{ href: "/settings", label: "Settings" },
	{ href: "/characters", label: "Characters" },
	{ href: "/auth/login", label: "Logout" },
];

function isActive(pathname: string, href: string) {
	return pathname === href;
}

export function Navbar() {
	const pathname = usePathname();
	const [menuOpen, setMenuOpen] = useState(false);
	const [accountOpen, setAccountOpen] = useState(false);
	const [gamesOpen, setGamesOpen] = useState(false);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [authLoading, setAuthLoading] = useState(true);

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const response = await fetch("/api/auth/status");
				const data = await response.json();
				setIsAuthenticated(data.isAuthenticated);
			} catch (error) {
				console.error("Failed to check auth status:", error);
				setIsAuthenticated(false);
			} finally {
				setAuthLoading(false);
			}
		};

		checkAuth();
	}, [pathname]);

	const toggleMenu = () => setMenuOpen((open) => !open);
	const closeMenu = () => setMenuOpen(false);
	const toggleAccount = () => setAccountOpen((open) => !open);
	const toggleGames = () => setGamesOpen((open) => !open);

	return (
		<header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
			<div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
				<Link
					href="/"
					className="flex items-center gap-2 text-lg font-semibold text-white"
					onClick={closeMenu}
				>
					<img
						src="/icon.png"
						alt="The Gathering Call Logo"
						className="h-9 w-9"
					/>
					<span className="hidden sm:inline">The Gathering Call</span>
				</Link>
				<nav className="hidden items-center gap-6 text-sm font-medium text-slate-200 md:flex">
					{primaryLinks.map((item) => {
						if (isSubmenu(item)) {
							const isAnySubmenuActive = item.submenu.some((link) =>
								isActive(pathname, link.href)
							);
							return (
								<div key={item.label} className="relative">
									<button
										type="button"
										className={`flex items-center gap-1 rounded-md px-3 py-2 text-slate-200 transition hover:bg-white/10 ${
											gamesOpen || isAnySubmenuActive
												? "bg-white/10 text-white"
												: ""
										}`}
										onClick={toggleGames}
										aria-haspopup="menu"
										aria-expanded={gamesOpen}
									>
										{item.label}
										<svg
											aria-hidden
											className={`h-4 w-4 transition-transform ${
												gamesOpen ? "rotate-180" : ""
											}`}
											viewBox="0 0 20 20"
											fill="currentColor"
										>
											<path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.585l3.71-3.354a.75.75 0 0 1 1.02 1.1l-4.25 3.84a.75.75 0 0 1-1.02 0l-4.25-3.84a.75.75 0 0 1 .02-1.06z" />
										</svg>
									</button>
									{gamesOpen ? (
										<div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-lg border border-white/10 bg-slate-900 shadow-lg">
											{item.submenu.map((link) => (
												<Link
													key={link.href}
													href={link.href}
													onClick={() => {
														setGamesOpen(false);
														closeMenu();
													}}
													className={`block px-4 py-2 text-sm transition hover:bg-white/10 ${
														isActive(pathname, link.href)
															? "bg-white/10 text-white"
															: "text-slate-200"
													}`}
												>
													{link.label}
												</Link>
											))}
										</div>
									) : null}
								</div>
							);
						} else {
							return (
								<Link
									key={item.href}
									href={item.href}
									className={`rounded-md px-3 py-2 transition hover:bg-white/10 ${
										isActive(pathname, item.href)
											? "bg-white/10 text-white"
											: "text-slate-200"
									}`}
								>
									{item.label}
								</Link>
							);
						}
					})}
					{!authLoading && (
						isAuthenticated ? (
							<div className="relative">
								<button
									type="button"
									className={`flex items-center gap-1 rounded-md px-3 py-2 text-slate-200 transition hover:bg-white/10 ${
										accountOpen ? "bg-white/10 text-white" : ""
									}`}
									onClick={toggleAccount}
									aria-haspopup="menu"
									aria-expanded={accountOpen}
								>
									Account
									<svg
										aria-hidden
										className={`h-4 w-4 transition-transform ${
											accountOpen ? "rotate-180" : ""
										}`}
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.585l3.71-3.354a.75.75 0 0 1 1.02 1.1l-4.25 3.84a.75.75 0 0 1-1.02 0l-4.25-3.84a.75.75 0 0 1 .02-1.06z" />
									</svg>
								</button>
								{accountOpen ? (
									<div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-lg border border-white/10 bg-slate-900 shadow-lg">
										{accountLinks.map((link) => (
											<Link
												key={link.href}
												href={link.href}
												onClick={() => {
													setAccountOpen(false);
													closeMenu();
												}}
												className={`block px-4 py-2 text-sm transition hover:bg-white/10 ${
													isActive(pathname, link.href)
														? "bg-white/10 text-white"
														: "text-slate-200"
												}`}
											>
												{link.label}
											</Link>
										))}
									</div>
								) : null}
							</div>
						) : (
							<Link
								href="/auth/login"
								className={`rounded-md px-3 py-2 transition hover:bg-white/10 ${
									isActive(pathname, "/auth/login")
										? "bg-white/10 text-white"
										: "text-slate-200"
								}`}
							>
								Login
							</Link>
						)
					)}
				</nav>
				<button
					type="button"
					className="inline-flex items-center justify-center rounded-md border border-white/10 p-2 text-slate-200 transition hover:bg-white/10 md:hidden"
					onClick={toggleMenu}
					aria-label="Toggle navigation"
				>
					{menuOpen ? (
						<svg
							className="h-5 w-5"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={1.5}
							fill="none"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M6 6l12 12M6 18L18 6" />
						</svg>
					) : (
						<svg
							className="h-5 w-5"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={1.5}
							fill="none"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M4 7h16M4 12h16M4 17h16" />
						</svg>
					)}
				</button>
			</div>
			{menuOpen ? (
				<div className="border-t border-white/10 bg-slate-950/90 md:hidden">
					<div className="space-y-1 px-4 pb-4 pt-2 text-sm font-medium text-slate-200">
						{primaryLinks.map((item) => {
							if (isSubmenu(item)) {
								return (
									<div key={item.label}>
										<p className="px-3 py-2 text-xs uppercase tracking-wide text-slate-400">
											{item.label}
										</p>
										{item.submenu.map((link) => (
											<Link
												key={link.href}
												href={link.href}
												onClick={closeMenu}
												className={`block rounded-md px-3 py-2 transition hover:bg-white/10 ${
													isActive(pathname, link.href)
														? "bg-white/10 text-white"
														: "text-slate-200"
												}`}
											>
												{link.label}
											</Link>
										))}
									</div>
								);
							} else {
								return (
									<Link
										key={item.href}
										href={item.href}
										onClick={closeMenu}
										className={`block rounded-md px-3 py-2 transition hover:bg-white/10 ${
											isActive(pathname, item.href)
												? "bg-white/10 text-white"
												: "text-slate-200"
										}`}
									>
										{item.label}
									</Link>
								);
							}
						})}
						{!authLoading && (
							isAuthenticated ? (
								<div className="border-t border-white/5 pt-2">
									<p className="px-3 text-xs uppercase tracking-wide text-slate-400">
										Account
									</p>
									{accountLinks.map((link) => (
										<Link
											key={link.href}
											href={link.href}
											onClick={closeMenu}
											className={`mt-1 block rounded-md px-3 py-2 transition hover:bg-white/10 ${
												isActive(pathname, link.href)
													? "bg-white/10 text-white"
													: "text-slate-200"
											}`}
										>
											{link.label}
										</Link>
									))}
								</div>
							) : (
								<div className="border-t border-white/5 pt-2">
									<Link
										href="/auth/login"
										onClick={closeMenu}
										className={`block rounded-md px-3 py-2 transition hover:bg-white/10 ${
											isActive(pathname, "/auth/login")
												? "bg-white/10 text-white"
												: "text-slate-200"
										}`}
									>
										Login
									</Link>
								</div>
							)
						)}
					</div>
				</div>
			) : null}
		</header>
	);
}
