import type { VendorHours } from "@/lib/vendor-utils";

export type VendorBase = {
  primaryImage: string;
  images: string[];
  vendorName: string;
  description: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  website?: string;
  hoursOfOperation: VendorHours;
  ownerUserId?: string;
  isApproved: boolean;
  isFeatured: boolean;
  latitude?: number;
  longitude?: number;
};

export type VendorPayload = Omit<VendorBase, "ownerUserId" | "isApproved" | "isFeatured"> & {
  isApproved?: boolean;
  isFeatured?: boolean;
};

export type VendorResponse = VendorBase & {
  id: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  distance?: number;
};
