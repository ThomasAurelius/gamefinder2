"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import AnnouncementPopup from "@/components/AnnouncementPopup";

export default function HomePage() {
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
	}, []);

	return (
		<>
			<AnnouncementPopup />
			<div className="space-y-10 flex flex-col items-center py-16 text-center">
				<h1 className="text-3xl font-bold sm:text-4xl">Welcome!</h1>
				<Image
					src="/newlogo.png"
					alt="The Gathering Call Logo "
					width={320}
					height={320}
					className="h-60 w-auto"
				/>
				<section className="rounded-2xl border border-white/10 bg-slate-900/50 p-8 shadow-xl max-w-2xl">
					<ul className="space-y-3 text-left">
						<li className="flex items-start gap-3">
							<span className="text-indigo-400 mt-1">✓</span>
							<p className="text-slate-300">
								<strong className="text-slate-100">
									Your Hub for Tabletop & Board Gaming:
								</strong>{" "}
								Whether you&apos;re a player or a Game Master, The
								Gathering Call is your go-to platform for all things
								tabletop and board gaming.
							</p>
						</li>
						<li className="flex items-start gap-3">
							<span className="text-indigo-400 mt-1">✓</span>
							<p className="text-slate-300">
								<strong className="text-slate-100">Free to Use:</strong>{" "}
								Enjoy a robust set of features at no cost. Optional paid
								campaigns are available for those seeking premium
								experiences.
							</p>
						</li>
						<li className="flex items-start gap-3">
							<span className="text-indigo-400 mt-1">✓</span>
							<p className="text-slate-300">
								<strong className="text-slate-100">
									Find and Join Games:
								</strong>{" "}
								Discover new games and campaigns that match your
								interests.
							</p>
						</li>
					</ul>

					<p className="mt-4 max-w-2xl text-base text-slate-300">
						Use the navigation above to explore the dashboard, curate your
						library, or find the perfect game night.
					</p>
				</section>

				{!authLoading && !isAuthenticated && (
					<section>
						<div className="mt-6 flex gap-4 justify-center">
							<Link
								href="/auth/register"
								className="rounded-md bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
							>
								Create an Account
							</Link>
							<Link
								href="/auth/login"
								className="rounded-md border border-white/10 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
							>
								Log In
							</Link>
						</div>
					</section>
				)}

				<section className="grid gap-6 sm:grid-cols-2 max-w-4xl">
					<article className="rounded-2xl border border-white/10 bg-slate-900/50 p-8 shadow-xl">
						<h2 className="text-2xl font-bold text-slate-100 mb-4">
							Stay Organized
						</h2>
						<ul className="space-y-3 text-left">
							<li className="flex items-start gap-3">
								<span className="text-indigo-400 mt-1">✓</span>
								<p className="text-slate-300">
									<strong className="text-slate-100">
										Campaign Management:
									</strong>{" "}
									Track multiple campaigns with detailed notes and
									player information.
								</p>
							</li>
							<li className="flex items-start gap-3">
								<span className="text-indigo-400 mt-1">✓</span>
								<p className="text-slate-300">
									<strong className="text-slate-100">
										Session Scheduling:
									</strong>{" "}
									Monitor upcoming sessions and keep your group
									synchronized.
								</p>
							</li>
							<li className="flex items-start gap-3">
								<span className="text-indigo-400 mt-1">✓</span>
								<p className="text-slate-300">
									<strong className="text-slate-100">
										Character Library:
									</strong>{" "}
									Manage all your characters in one convenient hub.
								</p>
							</li>
						</ul>
					</article>
					<article className="rounded-2xl border border-white/10 bg-slate-900/50 p-8 shadow-xl">
						<h2 className="text-2xl font-bold text-slate-100 mb-4">
							Discover &amp; Share
						</h2>
						<ul className="space-y-3 text-left">
							<li className="flex items-start gap-3">
								<span className="text-indigo-400 mt-1">✓</span>
								<p className="text-slate-300">
									<strong className="text-slate-100">
										Find Games:
									</strong>{" "}
									Browse available game sessions and campaigns in your
									area.
								</p>
							</li>
							<li className="flex items-start gap-3">
								<span className="text-indigo-400 mt-1">✓</span>
								<p className="text-slate-300">
									<strong className="text-slate-100">
										Connect with Players:
									</strong>{" "}
									Join groups and make new friends who share your
									gaming interests.
								</p>
							</li>
							<li className="flex items-start gap-3">
								<span className="text-indigo-400 mt-1">✓</span>
								<p className="text-slate-300">
									<strong className="text-slate-100">
										Share Adventures:
									</strong>{" "}
									Tell your epic tales and inspire the community.
								</p>
							</li>
						</ul>
					</article>
				</section>
				<section className="rounded-2xl border border-white/10 bg-slate-900/50 p-8 shadow-xl max-w-2xl">
					<h2 className="text-2xl font-bold text-slate-100 mb-4">
						Games vs. Campaigns
					</h2>
					<div className="space-y-4 text-left">
						<div>
							<h3 className="text-lg font-semibold text-indigo-400 mb-2">
								Games (One-Time Sessions)
							</h3>
							<p className="text-slate-300">
								Perfect for board game nights or standalone adventures.
								Games are single-session events that complete in one
								sitting. Great for trying new games or playing with
								different groups.
							</p>
						</div>
						<div>
							<h3 className="text-lg font-semibold text-indigo-400 mb-2">
								Campaigns (Multiple Sessions)
							</h3>
							<p className="text-slate-300">
								Ongoing adventures that span multiple sessions. Ideal
								for TTRPGs like D&amp;D where your story unfolds over
								time. Campaigns can be free or paid, depending on the
								Game Master&apos;s preference.
							</p>
						</div>
					</div>
				</section>
				<section className="rounded-2xl border border-white/10 bg-slate-900/50 p-8 shadow-xl max-w-2xl">
					<article className="">
						<h2 className="text-2xl font-bold text-slate-100 mb-4">
							Why choose Paid Campaigns?
						</h2>
						<ul className="space-y-3 text-left">
							<li className="flex items-start gap-3">
								<span className="text-indigo-400 mt-1">✓</span>
								<p className="text-slate-300">
									<strong className="text-slate-100">
										Professional Game Masters:
									</strong>{" "}
									Offer dedicated preparation, engaging storytelling,
									and consistent quality.
								</p>
							</li>
							<li className="flex items-start gap-3">
								<span className="text-indigo-400 mt-1">✓</span>
								<p className="text-slate-300">
									<strong className="text-slate-100">
										Financial Commitment:
									</strong>{" "}
									Financial commitment encourages better attendance and
									more engaged participants.
								</p>
							</li>
							<li className="flex items-start gap-3">
								<span className="text-indigo-400 mt-1">✓</span>
								<p className="text-slate-300">
									<strong className="text-slate-100">
										Share Adventures:
									</strong>{" "}
									Tell your epic tales and inspire the community.
								</p>
							</li>
							<li className="flex items-start gap-3">
								<span className="text-indigo-400 mt-1">✓</span>
								<p className="text-slate-300">
									<strong className="text-slate-100">
										Free Games and Campaigns will always be an option.
									</strong>{" "}
									Paid games are hosted at the discretion of the host,
									and not required.
								</p>
							</li>
						</ul>

						<Link
							href="/about-hosting-paid-games"
							className="inline-block  text-sm  hover:underline"
						>
							<div className="flex justify-center items-center rounded-2xl bg-amber-600/50 p-2 m-4 shadow-xl">
								<p className="text-amber-200 hover:text-white font-medium">
									Learn more about hosting paid games →
								</p>
							</div>
						</Link>
					</article>
				</section>
			</div>
		</>
	);
}
