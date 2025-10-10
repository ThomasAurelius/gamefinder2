"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function Advertisement() {
	const [advertisement, setAdvertisement] = useState<{
		imageUrl: string;
		isActive: boolean;
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

	// Don't render anything if there's no active advertisement
	if (!advertisement || !advertisement.isActive || !advertisement.imageUrl) {
		return null;
	}

	return (
		<div className="w-full flex justify-center mb-6">
			<div className="relative w-[90%] lg:w-full lg:max-w-[800px]" style={{ aspectRatio: "2/1" }}>
				<Image
					src={advertisement.imageUrl}
					alt="Advertisement"
					fill
					className="object-contain"
					sizes="(max-width: 900px) 90vw, 800px"
					priority
				/>
			</div>
		</div>
	);
}
