"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function Advertisement() {
	const [advertisement, setAdvertisement] = useState<{
		id?: string;
		imageUrl: string;
		isActive: boolean;
		url?: string;
	} | null>(null);

	useEffect(() => {
		async function fetchAdvertisement() {
			try {
				const response = await fetch("/api/advertisements");
				if (response.ok) {
					const data = await response.json();
					setAdvertisement(data);
				}
			} catch (error) {
				console.error("Failed to fetch advertisement:", error);
			}
		}

		fetchAdvertisement();
	}, []);

	const handleClick = async () => {
		if (!advertisement?.url || !advertisement?.id) return;

		// Track the click - don't block on this
		try {
			fetch("/api/advertisements/click", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ advertisementId: advertisement.id }),
			}).catch(error => {
				// Log but don't show to user - tracking failure shouldn't impact UX
				console.error("Failed to track click:", error);
			});
		} catch (error) {
			console.error("Failed to initiate click tracking:", error);
		}

		// Open URL in new window regardless of tracking status
		window.open(advertisement.url, "_blank", "noopener,noreferrer");
	};

	// Don't render anything if there's no active advertisement
	if (!advertisement || !advertisement.isActive || !advertisement.imageUrl) {
		return null;
	}

	const content = (
		<div className="relative w-[90%] lg:w-full lg:max-w-[800px]" style={{ paddingBottom: "50%" }}>
			<Image
				src={advertisement.imageUrl}
				alt="Advertisement"
				fill
				className="object-contain"
				sizes="(max-width: 900px) 90vw, 800px"
				priority
			/>
		</div>
	);

	return (
		<div className="w-full flex justify-center mb-6">
			{advertisement.url ? (
				<button
					onClick={handleClick}
					className="cursor-pointer transition-opacity hover:opacity-90"
					aria-label="View advertisement"
				>
					{content}
				</button>
			) : (
				content
			)}
		</div>
	);
}
