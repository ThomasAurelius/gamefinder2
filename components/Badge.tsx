"use client";

import Image from "next/image";

interface BadgeProps {
  name: string;
  imageUrl: string;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

export default function Badge({ name, imageUrl, size = "md", showTooltip = true }: BadgeProps) {
  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div
      className="relative inline-block"
      title={showTooltip ? name : undefined}
    >
      <div
        className={`${sizeClasses[size]} relative overflow-hidden`}
      >
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
          sizes="32px"
        />
      </div>
    </div>
  );
}
