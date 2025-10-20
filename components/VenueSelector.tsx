"use client";

import { useState, useEffect } from "react";

type Vendor = {
  id: string;
  vendorName: string;
  address1: string;
  city: string;
  state: string;
  zip: string;
};

type VenueSelectorProps = {
  zipCode: string;
  value: string;
  onChange: (vendorId: string) => void;
  className?: string;
};

export default function VenueSelector({
  zipCode,
  value,
  onChange,
  className = "",
}: VenueSelectorProps) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVendors = async () => {
      if (!zipCode) {
        setVendors([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/vendors");
        if (!response.ok) {
          throw new Error("Failed to fetch vendors");
        }

        const data = await response.json();
        
        // Filter vendors by zipCode (only approved vendors are returned by API)
        const filteredVendors = data.vendors.filter(
          (vendor: Vendor) => vendor.zip === zipCode
        );
        
        setVendors(filteredVendors);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load venues");
        setVendors([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVendors();
  }, [zipCode]);

  return (
    <div className="space-y-2">
      <select
        id="venue"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={!zipCode || isLoading}
        className={className}
      >
        <option value="">No venue selected</option>
        {vendors.map((vendor) => (
          <option key={vendor.id} value={vendor.id}>
            {vendor.vendorName} - {vendor.address1}, {vendor.city}
          </option>
        ))}
      </select>
      
      {!zipCode && (
        <p className="text-xs text-slate-500">
          Enter a zip code above to see available venues
        </p>
      )}
      
      {zipCode && !isLoading && vendors.length === 0 && (
        <p className="text-xs text-slate-500">
          No approved venues found in this zip code
        </p>
      )}
      
      {isLoading && (
        <p className="text-xs text-slate-400">
          Loading venues...
        </p>
      )}
      
      {error && (
        <p className="text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
