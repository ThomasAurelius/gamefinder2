"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useLogout } from "./logout-handler";

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
	{ href: "/tall-tales", label: "Tall Tales" },
	{ href: "/library", label: "Library" },
	{ href: "/players", label: "Players & DMs" },
	{ href: "/venues", label: "Venues" },
	{ href: "/find", label: "Board Games" },
	{ href: "/find-campaigns", label: "Tabletop Campaigns" },
];

const getAccountLinks = (isAdmin: boolean): NavLink[] => {
	const links: NavLink[] = [
		{ href: "/profile", label: "Profile" },
		{ href: "/host/dashboard", label: "Host Dashboard" },
		{ href: "/subscriptions", label: "Subscriptions" },
		{ href: "/messages", label: "Messages" },
		{ href: "/settings", label: "Settings" },
		{ href: "/characters", label: "Characters" },
		{ href: "/settings/games-history", label: "Sessions History" },
	];

	if (isAdmin) {
		links.push({ href: "/settings/vendors", label: "Vendors" });
		links.push({ href: "/advertisements", label: "Advertisements" });
	}

	return links;
};

function isActive(pathname: string, href: string) {
	return pathname === href;
}

function NotificationBadge({ count }: { count?: number }) {
	return (
		<span className="ml-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-medium text-white">
			{count !== undefined ? count : ""}
		</span>
	);
}

/**
 * Delay in milliseconds before closing navigation menus/dropdowns after a link is clicked.
 * This delay ensures that Next.js Link component has time to initiate navigation before
 * the menu DOM element is removed. Without this delay, navigation can fail, especially
 * after the app has been running for an extended period.
 *
 * @constant {number}
 */
const NAVIGATION_DELAY_MS = 100;

export function Navbar() {
	const pathname = usePathname();
	const [menuOpen, setMenuOpen] = useState(false);
	const [accountOpen, setAccountOpen] = useState(false);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [authLoading, setAuthLoading] = useState(true);
	const [hasIncompleteSettings, setHasIncompleteSettings] = useState(false);
	const [unreadMessageCount, setUnreadMessageCount] = useState(0);
	const [newPostsCount, setNewPostsCount] = useState(0);
	const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);
	const [userCommonName, setUserCommonName] = useState<string>("");
	const [isAdmin, setIsAdmin] = useState(false);
	const handleLogout = useLogout();

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

	useEffect(() => {
		const fetchNotifications = async () => {
			if (!isAuthenticated || authLoading) return;

			try {
				const response = await fetch("/api/notifications");
				if (response.ok) {
					const data = await response.json();
					setHasIncompleteSettings(data.hasIncompleteSettings);
					setUnreadMessageCount(data.unreadMessageCount);
					setNewPostsCount(data.newPostsCount || 0);
				}
			} catch (error) {
				console.error("Failed to fetch notifications:", error);
			}
		};

		const fetchUserProfile = async () => {
			if (!isAuthenticated || authLoading) return;

			try {
				const response = await fetch("/api/profile");
				if (response.ok) {
					const profile = await response.json();
					setUserAvatarUrl(profile.avatarUrl || null);
					setUserCommonName(profile.commonName || profile.name || "");
				}
			} catch (error) {
				console.error("Failed to fetch user profile:", error);
			}
		};

		const fetchAdminStatus = async () => {
			if (!isAuthenticated || authLoading) return;

			try {
				const response = await fetch("/api/admin/status");
				if (response.ok) {
					const data = await response.json();
					setIsAdmin(data.isAdmin);
				}
			} catch (error) {
				console.error("Failed to fetch admin status:", error);
			}
		};

		fetchNotifications();
		fetchUserProfile();
		fetchAdminStatus();
	}, [isAuthenticated, authLoading, pathname]);

	const toggleMenu = () => setMenuOpen((open) => !open);
	const closeMenu = () => setMenuOpen(false);
	const toggleAccount = () => setAccountOpen((open) => !open);

	return (
		<header className="relative z-30 border-b border-white/10 bg-gradient-to-br from-amber-600/10 via-purple-600/10 to-indigo-600/10 backdrop-blur">
			<div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-  bg-gradient-to-br from-amber-600/10 via-purple-600/10 to-indigo-600/10">
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
					{/* <span className="hidden sm:inline">The Gathering Call</span> */}
				</Link>
				<div className="flex items-center gap-3">
					{/* Mobile avatar - shown only on mobile when authenticated */}
					{!authLoading && isAuthenticated && (
						<Link href="/profile" className="md:hidden">
							{userAvatarUrl ? (
								<img
									src={userAvatarUrl}
									alt={userCommonName || "User avatar"}
									className="h-9 w-9 rounded-full border border-white/20 object-cover"
								/>
							) : (
								<div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-slate-800 text-xs font-semibold text-slate-300">
									{userCommonName
										? userCommonName.charAt(0).toUpperCase()
										: "U"}
								</div>
							)}
						</Link>
					)}
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
				<nav className="hidden items-center gap-2 text-sm font-medium text-slate-200 md:flex">
					{primaryLinks.map((item) => {
						if (isSubmenu(item)) {
							const isAnySubmenuActive = item.submenu.some((link) =>
								isActive(pathname, link.href)
							);
							// This code block is kept for future submenu support but is not currently used
							const isOpen = false;
							const toggleOpen = () => {};

							return (
								<div key={item.label} className="relative">
									<button
										type="button"
										className={`flex items-center gap-1 rounded-md px-2 py-2 text-slate-200 transition hover:bg-white/10 ${
											isOpen || isAnySubmenuActive
												? "bg-white/10 text-white"
												: ""
										}`}
										onClick={toggleOpen}
										aria-haspopup="menu"
										aria-expanded={isOpen}
									>
										{item.label}
										<svg
											aria-hidden
											className={`h-4 w-4 transition-transform ${
												isOpen ? "rotate-180" : ""
											}`}
											viewBox="0 0 20 20"
											fill="currentColor"
										>
											<path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.585l3.71-3.354a.75.75 0 0 1 1.02 1.1l-4.25 3.84a.75.75 0 0 1-1.02 0l-4.25-3.84a.75.75 0 0 1 .02-1.06z" />
										</svg>
									</button>
									{isOpen ? (
										<div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-lg border border-white/10 bg-slate-900 shadow-lg">
											{item.submenu.map((link) => (
												<Link
													key={link.href}
													href={link.href}
													onClick={() => {
														// Delay closing dropdown to ensure navigation completes
														setTimeout(() => {
															closeMenu();
														}, NAVIGATION_DELAY_MS);
													}}
													className={`flex items-center justify-between px-4 py-2 text-sm transition hover:bg-white/10 ${
														isActive(pathname, link.href)
															? "bg-white/10 text-white"
															: "text-slate-200"
													}`}
												>
													<span>{link.label}</span>
													{link.href === "/find" &&
														newPostsCount > 0 && (
															<NotificationBadge
																count={newPostsCount}
															/>
														)}
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
									className={`flex items-center rounded-md px-2 py-2 transition hover:bg-white/10 ${
										isActive(pathname, item.href)
											? "bg-white/10 text-white"
											: "text-slate-200"
									}`}
								>
									{item.label}
									{item.href === "/find" && newPostsCount > 0 && (
										<NotificationBadge count={newPostsCount} />
									)}
								</Link>
							);
						}
					})}
					{!authLoading &&
						(isAuthenticated ? (
							<>
								<div className="relative">
									<button
										type="button"
										className={`flex items-center gap-1 rounded-md px-2 py-2 text-slate-200 transition hover:bg-white/10 ${
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
											{getAccountLinks(isAdmin).map((link) => (
												<Link
													key={link.href}
													href={link.href}
													onClick={() => {
														// Delay closing dropdown to ensure navigation completes
														setTimeout(() => {
															setAccountOpen(false);
															closeMenu();
														}, NAVIGATION_DELAY_MS);
													}}
													className={`flex items-center justify-between px-4 py-2 text-sm transition hover:bg-white/10 ${
														isActive(pathname, link.href)
															? "bg-white/10 text-white"
															: "text-slate-200"
													}`}
												>
													<span>{link.label}</span>
													{link.href === "/profile" &&
														hasIncompleteSettings && (
															<NotificationBadge />
														)}
													{link.href === "/messages" &&
														unreadMessageCount > 0 && (
															<NotificationBadge
																count={unreadMessageCount}
															/>
														)}
												</Link>
											))}
											<button
												onClick={() => {
													setAccountOpen(false);
													closeMenu();
													handleLogout();
												}}
												className="flex w-full items-center justify-between px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
											>
												<span>Logout</span>
											</button>
										</div>
									) : null}
								</div>
								<Link href="/profile">
									{userAvatarUrl ? (
										<img
											src={userAvatarUrl}
											alt={userCommonName || "User avatar"}
											className="h-12 w-12 rounded-full border border-white/20 object-cover"
										/>
									) : (
										<div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-slate-800 text-sm font-semibold text-slate-300">
											{userCommonName
												? userCommonName.charAt(0).toUpperCase()
												: "U"}
										</div>
									)}
								</Link>
							</>
						) : (
							<Link
								href="/auth/login"
								className={`rounded-md px-2 py-2 transition hover:bg-white/10 ${
									isActive(pathname, "/auth/login")
										? "bg-white/10 text-white"
										: "text-slate-200"
								}`}
							>
								Login
							</Link>
						))}
				</nav>
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
												onClick={() => {
													// Delay closing menu to ensure navigation completes
													setTimeout(
														closeMenu,
														NAVIGATION_DELAY_MS
													);
												}}
												className={`flex items-center justify-between rounded-md px-3 py-2 transition hover:bg-white/10 ${
													isActive(pathname, link.href)
														? "bg-white/10 text-white"
														: "text-slate-200"
												}`}
											>
												<span>{link.label}</span>
												{link.href === "/find" &&
													newPostsCount > 0 && (
														<NotificationBadge
															count={newPostsCount}
														/>
													)}
											</Link>
										))}
									</div>
								);
							} else {
								return (
									<Link
										key={item.href}
										href={item.href}
										onClick={() => {
											// Delay closing menu to ensure navigation completes
											setTimeout(closeMenu, NAVIGATION_DELAY_MS);
										}}
										className={`flex items-center justify-between rounded-md px-3 py-2 transition hover:bg-white/10 ${
											isActive(pathname, item.href)
												? "bg-white/10 text-white"
												: "text-slate-200"
										}`}
									>
										<span>{item.label}</span>
										{item.href === "/find" && newPostsCount > 0 && (
											<NotificationBadge count={newPostsCount} />
										)}
									</Link>
								);
							}
						})}
						{!authLoading &&
							(isAuthenticated ? (
								<div className="border-t border-white/5 pt-2">
									<div className="flex items-center gap-3 px-3 pb-2">
										{userAvatarUrl ? (
											<img
												src={userAvatarUrl}
												alt={userCommonName || "User avatar"}
												className="h-10 w-10 rounded-full border border-white/20 object-cover"
											/>
										) : (
											<div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-slate-800 text-sm font-semibold text-slate-300">
												{userCommonName
													? userCommonName.charAt(0).toUpperCase()
													: "U"}
											</div>
										)}
										<div className="text-sm text-slate-200">
											{userCommonName || "User"}
										</div>
									</div>
									<p className="px-3 text-xs uppercase tracking-wide text-slate-400">
										Account
									</p>
									{getAccountLinks(isAdmin).map((link) => (
										<Link
											key={link.href}
											href={link.href}
											onClick={() => {
												// Delay closing menu to ensure navigation completes
												setTimeout(closeMenu, NAVIGATION_DELAY_MS);
											}}
											className={`mt-1 flex items-center justify-between rounded-md px-3 py-2 transition hover:bg-white/10 ${
												isActive(pathname, link.href)
													? "bg-white/10 text-white"
													: "text-slate-200"
											}`}
										>
											<span>{link.label}</span>
											{link.href === "/messages" &&
												unreadMessageCount > 0 && (
													<NotificationBadge
														count={unreadMessageCount}
													/>
												)}
											{link.href === "/profile" &&
												hasIncompleteSettings && (
													<NotificationBadge />
												)}
										</Link>
									))}
									<button
										onClick={() => {
											closeMenu();
											handleLogout();
										}}
										className="mt-1 flex w-full items-center justify-between rounded-md px-3 py-2 text-slate-200 transition hover:bg-white/10"
									>
										<span>Logout</span>
									</button>
								</div>
							) : (
								<div className="border-t border-white/5 pt-2">
									<Link
										href="/auth/login"
										onClick={() => {
											// Delay closing menu to ensure navigation completes
											setTimeout(closeMenu, NAVIGATION_DELAY_MS);
										}}
										className={`block rounded-md px-3 py-2 transition hover:bg-white/10 ${
											isActive(pathname, "/auth/login")
												? "bg-white/10 text-white"
												: "text-slate-200"
										}`}
									>
										Login
									</Link>
								</div>
							))}
					</div>
				</div>
			) : null}
		</header>
	);
}
