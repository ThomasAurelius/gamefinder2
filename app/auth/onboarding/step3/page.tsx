"use client";

import { useState, type FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import SkipConfirmationModal from "@/components/SkipConfirmationModal";
import AvatarCropper from "@/components/AvatarCropper";
import { AuthGuard } from "@/components/auth-guard";
import Image from "next/image";

export default function OnboardingStep3() {
	const router = useRouter();
	const [bio, setBio] = useState("");
	const [avatarUrl, setAvatarUrl] = useState("");
	const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
	const [imageToCrop, setImageToCrop] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showSkipModal, setShowSkipModal] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Load current profile
		const loadProfile = async () => {
			try {
				const response = await fetch("/api/profile");
				if (response.ok) {
					const profile = await response.json();
					setBio(profile.bio || "");
					setAvatarUrl(profile.avatarUrl || "");
				}
			} catch (error) {
				console.error("Failed to load profile:", error);
			} finally {
				setIsLoading(false);
			}
		};

		loadProfile();
	}, []);

	const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = () => {
			setImageToCrop(reader.result as string);
		};
		reader.readAsDataURL(file);
	};

	const handleCropComplete = async (croppedImage: Blob) => {
		setIsUploadingAvatar(true);
		setError(null);

		try {
			const formData = new FormData();
			formData.append("file", croppedImage, "avatar.jpg");
			formData.append("type", "avatar");

			const response = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to upload avatar");
			}

			const { url } = await response.json();
			setAvatarUrl(url);
			setImageToCrop(null);
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to upload avatar";
			setError(errorMessage);
		} finally {
			setIsUploadingAvatar(false);
		}
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError(null);
		setIsSubmitting(true);

		try {
			const response = await fetch("/api/profile", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					bio: bio.trim(),
					avatarUrl,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to save profile");
			}

			// Move to step 4
			router.push("/auth/onboarding/step4");
		} catch (submitError) {
			console.error("Failed to save profile", submitError);
			setError("Failed to save profile. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleSkip = () => {
		setShowSkipModal(true);
	};

	const confirmSkip = () => {
		router.push("/auth/onboarding/step4");
	};

	const remainingBioCharacters = 2000 - bio.length;

	return (
		<AuthGuard>
			<div className="mx-auto max-w-5xl space-y-8 py-8">
				{/* Progress Indicator */}
				<div className="flex items-center justify-center gap-2">
					<div className="h-2 w-2 rounded-full bg-emerald-500" />
					<div className="h-2 w-2 rounded-full bg-emerald-500" />
					<div className="h-2 w-2 rounded-full bg-gradient-to-r from-amber-500 via-purple-500 to-indigo-500" />
					<div className="h-2 w-2 rounded-full bg-slate-700" />
				</div>

				<div className="mx-auto max-w-md space-y-6 rounded-2xl border border-white/10 bg-slate-900/60 p-8">
					<div className="text-center">
						<h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
							Personalize Your Profile
						</h1>
						<p className="mt-4 text-sm text-slate-300">
							Add an avatar and tell us about yourself
						</p>
					</div>

					{isLoading ? (
						<div className="py-12 text-center">
							<p className="text-slate-400">Loading...</p>
						</div>
					) : (
						<form className="space-y-6" onSubmit={handleSubmit}>
							{/* Avatar Upload */}
							<div className="space-y-3">
								<label className="block text-sm text-slate-200">
									Profile Picture
								</label>
								<div className="flex items-center gap-4">
									{avatarUrl ? (
										<div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-white/10">
											<Image
												src={avatarUrl}
												alt="Avatar preview"
												fill
												className="object-cover"
											/>
										</div>
									) : (
										<div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-white/10 bg-slate-950">
											<svg
												className="h-10 w-10 text-slate-500"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
												/>
											</svg>
										</div>
									)}
									<label
										htmlFor="avatar-upload"
										className="cursor-pointer rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
									>
										{isUploadingAvatar
											? "Uploading..."
											: avatarUrl
												? "Change Avatar"
												: "Upload Avatar"}
									</label>
									<input
										id="avatar-upload"
										type="file"
										accept="image/jpeg,image/png,image/webp"
										onChange={handleAvatarChange}
										disabled={isUploadingAvatar}
										className="hidden"
									/>
								</div>
							</div>

							{/* Bio */}
							<div className="space-y-2">
								<label className="block text-sm text-slate-200">
									About You
								</label>
								<textarea
									value={bio}
									onChange={(e) => setBio(e.target.value)}
									placeholder="Tell us about your gaming experience, favorite games, or what you're looking for..."
									rows={5}
									maxLength={2000}
									className="w-full resize-none rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
								/>
								<p className="text-xs text-slate-400">
									{remainingBioCharacters} characters remaining
								</p>
							</div>

							{error ? (
								<p className="text-sm text-rose-400" role="alert">
									{error}
								</p>
							) : null}

							<div className="flex gap-3">
								<button
									type="button"
									onClick={handleSkip}
									className="flex-1 rounded-md border border-white/10 bg-slate-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
								>
									Skip
								</button>
								<button
									type="submit"
									disabled={isSubmitting}
									className="flex-1 rounded-md bg-gradient-to-r from-amber-500 via-purple-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:from-amber-400 hover:via-purple-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
								>
									{isSubmitting ? "Saving..." : "Continue"}
								</button>
							</div>
						</form>
					)}
				</div>

				{imageToCrop && (
					<AvatarCropper
						imageSrc={imageToCrop}
						onCropComplete={handleCropComplete}
						onCancel={() => setImageToCrop(null)}
					/>
				)}

				<SkipConfirmationModal
					isOpen={showSkipModal}
					onConfirm={confirmSkip}
					onCancel={() => setShowSkipModal(false)}
				/>
			</div>
		</AuthGuard>
	);
}
