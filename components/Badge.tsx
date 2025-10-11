"use client";

import Image from "next/image";

interface BadgeProps {
  name: string;
  imageUrl: string;
  color?: string;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

export default function Badge({ name, imageUrl, color, size = "md", showTooltip = true }: BadgeProps) {
  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const borderColor = color || "#94a3b8"; // Default to slate-400

  return (
    <div
      className="relative inline-block"
      title={showTooltip ? name : undefined}
    >
      <div
        className={`${sizeClasses[size]} relative overflow-hidden rounded-full border-2`}
        style={{
          borderColor: borderColor,
        }}
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
