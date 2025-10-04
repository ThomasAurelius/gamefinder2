"use client";

import { useRouter } from "next/navigation";

type SendMessageButtonProps = {
  recipientId: string;
  recipientName: string;
};

export default function SendMessageButton({
  recipientId,
  recipientName,
}: SendMessageButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    const params = new URLSearchParams({
      recipientId,
      recipientName,
      compose: "true",
    });
    router.push(`/messages?${params.toString()}`);
  };

  return (
    <button
      onClick={handleClick}
      className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
    >
      Send Message
    </button>
  );
}
