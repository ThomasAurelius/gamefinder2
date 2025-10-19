"use client";

import { useEffect } from "react";

export default function EditMarketplaceListingPage() {
  useEffect(() => {
    // Redirect to BGG marketplace since we're now using BGG data
    window.location.href = "https://boardgamegeek.com/geekmarket/browse?nosession=1";
  }, []);

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-8 text-center">
        <h1 className="text-2xl font-semibold text-slate-100 mb-4">
          Redirecting to BoardGameGeek Marketplace
        </h1>
        <p className="text-slate-400 mb-4">
          We now use BoardGameGeek&apos;s marketplace for buying and selling games.
        </p>
        <p className="text-sm text-slate-500">
          If you are not redirected automatically,{" "}
          <a 
            href="https://boardgamegeek.com/geekmarket/browse?nosession=1" 
            className="text-sky-400 hover:underline"
          >
            click here to visit BGG Marketplace
          </a>
          .
        </p>
      </div>
    </section>
  );
}
