"use client";

interface BadgeProps {
  name: string;
  text: string;
  color?: string;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

export default function Badge({ name, text, color, size = "md", showTooltip = true }: BadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2 py-1 text-sm",
    lg: "px-3 py-1 text-sm",
  };

  return (
    <span
      className={`inline-block rounded-full border ${sizeClasses[size]} font-medium`}
      style={{
        backgroundColor: color ? `${color}33` : undefined, // Add 33 for 20% opacity
        color: '#ffffff', // Always use white text color
        borderColor: color ? `${color}4D` : undefined, // Add 4D for 30% opacity
      }}
      title={showTooltip ? name : undefined}
    >
      {text}
    </span>
  );
}
