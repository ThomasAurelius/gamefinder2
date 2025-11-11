"use client";

interface BadgeProps {
  name: string;
  text: string;
  color?: string;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

export default function Badge({ name, text, color, size = "md", showTooltip = true }: BadgeProps) {
  // Parse color to get background, text, and border colors
  const bgColor = color ? `${color}/20` : "bg-slate-500/20";
  const textColor = color ? getTextColorFromBg(color) : "text-slate-300";
  const borderColor = color ? `${color}/30` : "border-slate-500/30";
  
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
        color: color ? getTextColorFromHex(color) : undefined,
        borderColor: color ? `${color}4D` : undefined, // Add 4D for 30% opacity
      }}
      title={showTooltip ? name : undefined}
    >
      {text}
    </span>
  );
}

// Helper function to determine appropriate text color based on background color
function getTextColorFromHex(hexColor: string | null | undefined): string {
  // Return default color if hexColor is null or undefined
  if (!hexColor) {
    return '#f1f5f9';
  }
  
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return light color for dark backgrounds and vice versa
  return luminance > 0.5 ? '#1e293b' : '#f1f5f9';
}

function getTextColorFromBg(color: string): string {
  // This function is for backward compatibility
  return color;
}
