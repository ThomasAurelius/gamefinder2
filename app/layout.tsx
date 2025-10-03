import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "The Gathering Call",
  description: "Discover tabletop games and manage your sessions with ease.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-slate-950">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <Navbar />
        <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
          {children}
        </main>
      </body>
    </html>
  );
}
