import { ObjectId, type OptionalId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { normalizeHours, type VendorHours } from "@/lib/vendor-utils";
import type {
	VendorPayload,
	VendorResponse,
} from "@/lib/vendor-types";
import { geocodeLocation } from "@/lib/geolocation";

export type { VendorHours };

export type VendorDocument = {
	_id?: ObjectId;
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
	createdAt: Date;
	updatedAt: Date;
};

export type { VendorPayload, VendorResponse } from "@/lib/vendor-types";

export { createDefaultHours, sortTimeSlots } from "@/lib/vendor-utils";

function ensureString(
	value: unknown,
	field: string,
	options?: { optional?: false; allowEmpty?: boolean }
): string;
function ensureString(
	value: unknown,
	field: string,
	options: { optional: true; allowEmpty?: boolean }
): string | undefined;
function ensureString(
	value: unknown,
	field: string,
	{ optional = false, allowEmpty = false }: { optional?: boolean; allowEmpty?: boolean } = {}
): string | undefined {
	if (value === undefined || value === null) {
		if (optional) {
			return undefined;
		}
		throw new Error(`${field} is required`);
	}

	if (typeof value !== "string") {
		throw new Error(`${field} must be a string`);
	}

	const trimmed = value.trim();

	if (!allowEmpty && trimmed.length === 0) {
		if (optional) {
			return undefined;
		}
		throw new Error(`${field} cannot be empty`);
	}

	return trimmed;
}

function ensureStringArray(value: unknown, field: string): string[] {
	if (value === undefined || value === null) {
		return [];
	}

	if (
		!Array.isArray(value) ||
		value.some((item) => typeof item !== "string")
	) {
		throw new Error(`${field} must be an array of strings`);
	}

	const strings = value
		.map((item) => item.trim())
		.filter((item) => item.length > 0);

	return Array.from(new Set(strings));
}

export function parseVendorPayload(
	payload: unknown,
	options: { allowApprovalFields?: boolean } = {}
): VendorPayload {
	if (!payload || typeof payload !== "object") {
		throw new Error("Invalid vendor payload");
	}

	const {
		primaryImage,
		images,
		vendorName,
		description,
		address1,
		address2,
		city,
		state,
		zip,
		phone,
		website,
		hoursOfOperation,
		isApproved,
		isFeatured,
		latitude,
		longitude,
	} = payload as Partial<VendorPayload & { latitude?: number; longitude?: number }>;

	const normalized: VendorPayload = {
		primaryImage: ensureString(primaryImage, "primaryImage"),
		images: ensureStringArray(images, "images"),
		vendorName: ensureString(vendorName, "vendorName"),
		description: ensureString(description, "description"),
		address1: ensureString(address1, "address1"),
		address2: ensureString(address2, "address2", {
			optional: true,
			allowEmpty: true,
		}),
		city: ensureString(city, "city"),
		state: ensureString(state, "state"),
		zip: ensureString(zip, "zip"),
		phone: ensureString(phone, "phone", { optional: true, allowEmpty: true }),
		website: ensureString(website, "website", {
			optional: true,
			allowEmpty: true,
		}),
		hoursOfOperation: normalizeHours(hoursOfOperation),
	};

	if (options.allowApprovalFields) {
		const rawPayload = payload as Record<string, unknown>;
		if (Object.prototype.hasOwnProperty.call(rawPayload, "isApproved")) {
			normalized.isApproved = Boolean(isApproved);
		}
		if (Object.prototype.hasOwnProperty.call(rawPayload, "isFeatured")) {
			normalized.isFeatured = Boolean(isFeatured);
		}
		if (typeof latitude === "number" && typeof longitude === "number") {
			(normalized as VendorPayload & { latitude?: number; longitude?: number }).latitude = latitude;
			(normalized as VendorPayload & { latitude?: number; longitude?: number }).longitude = longitude;
		}
	}

	return normalized;
}

function toVendorResponse(document: VendorDocument): VendorResponse {
	const { _id, ...rest } = document;
	return {
		...rest,
		id: _id?.toString() ?? "",
	} as VendorResponse;
}

export async function listVendors(
	options: {
		includeUnapproved?: boolean;
		ownerUserId?: string;
	} = {}
): Promise<VendorResponse[]> {
	const db = await getDb();
	const collection = db.collection<VendorDocument>("vendors");

	const filter: Record<string, unknown> = {};
	if (options.ownerUserId) {
		filter.ownerUserId = options.ownerUserId;
	} else if (!options.includeUnapproved) {
		filter.isApproved = true;
	}

	const vendors = await collection
		.find(filter)
		.sort({ isFeatured: -1, vendorName: 1 })
		.toArray();

	return vendors.map(toVendorResponse);
}

export async function getVendorById(
	id: string
): Promise<VendorResponse | null> {
	if (!ObjectId.isValid(id)) {
		return null;
	}

	const db = await getDb();
	const collection = db.collection<VendorDocument>("vendors");

	const objectId = new ObjectId(id);
	const vendor = await collection.findOne({ _id: objectId });

	if (!vendor) {
		return null;
	}

	return toVendorResponse(vendor);
}

export async function createVendor(
	ownerUserId: string | undefined,
	payload: VendorPayload
): Promise<VendorResponse | null> {
	const db = await getDb();
	const collection = db.collection<VendorDocument>("vendors");

	const now = new Date();
	const document: OptionalId<VendorDocument> = {
		...payload,
		ownerUserId,
		isApproved: payload.isApproved ?? false,
		isFeatured: payload.isFeatured ?? false,
		createdAt: now,
		updatedAt: now,
	};

	// Geocode the zip code if provided
	if (payload.zip && payload.zip.trim()) {
		try {
			const coords = await geocodeLocation(payload.zip.trim());
			if (coords) {
				document.latitude = coords.latitude;
				document.longitude = coords.longitude;
			}
		} catch (error) {
			console.error("Failed to geocode vendor zip code:", error);
			// Continue without coordinates - vendor will not show in nearby results
		}
	}

	const { insertedId } = await collection.insertOne(document);

	return getVendorById(insertedId.toString());
}

export async function updateVendor(
	id: string,
	payload: VendorPayload,
	options: { allowApprovalFields?: boolean } = {}
): Promise<VendorResponse | null> {
	if (!ObjectId.isValid(id)) {
		return null;
	}

	const db = await getDb();
	const collection = db.collection<VendorDocument>("vendors");

	const objectId = new ObjectId(id);
	const update: Partial<VendorDocument> = {
		...payload,
		updatedAt: new Date(),
	};

	if (!options.allowApprovalFields) {
		delete update.isApproved;
		delete update.isFeatured;
	} else {
		update.isApproved = payload.isApproved ?? false;
		update.isFeatured = payload.isFeatured ?? false;
	}

	// Geocode the zip code if provided
	if (payload.zip && payload.zip.trim()) {
		try {
			const coords = await geocodeLocation(payload.zip.trim());
			if (coords) {
				update.latitude = coords.latitude;
				update.longitude = coords.longitude;
			}
		} catch (error) {
			console.error("Failed to geocode vendor zip code:", error);
			// Continue without coordinates - vendor will not show in nearby results
		}
	}

	const result = await collection.updateOne(
		{ _id: objectId },
		{ $set: update }
	);

	if (result.matchedCount === 0) {
		return null;
	}

	return getVendorById(id);
}

export async function deleteVendor(id: string): Promise<boolean> {
	if (!ObjectId.isValid(id)) {
		return false;
	}

	const db = await getDb();
	const collection = db.collection<VendorDocument>("vendors");

	const objectId = new ObjectId(id);
	const result = await collection.deleteOne({ _id: objectId });

	return result.deletedCount > 0;
}

/**
 * Calculate distance between two points in miles using Haversine formula
 */
function calculateDistance(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number
): number {
	const R = 3959; // Earth's radius in miles
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLon = ((lon2 - lon1) * Math.PI) / 180;
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos((lat1 * Math.PI) / 180) *
			Math.cos((lat2 * Math.PI) / 180) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
}

/**
 * List vendors within a certain radius of a location
 */
export async function listVendorsByLocation(
	userLat: number,
	userLon: number,
	radiusMiles: number = 50
): Promise<VendorResponse[]> {
	const db = await getDb();
	const collection = db.collection<VendorDocument>("vendors");

	// Get all approved vendors that have coordinates
	const vendors = await collection
		.find({
			isApproved: true,
			latitude: { $exists: true, $type: "number" } as unknown as number,
			longitude: { $exists: true, $type: "number" } as unknown as number,
		})
		.toArray();

	// Calculate distances and filter by radius
	const vendorsWithDistance = vendors
		.map((vendor) => {
			const distance = calculateDistance(
				userLat,
				userLon,
				vendor.latitude!,
				vendor.longitude!
			);
			return {
				...toVendorResponse(vendor),
				distance,
			};
		})
		.filter((vendor) => vendor.distance <= radiusMiles);

	// Sort: featured first, then by distance
	vendorsWithDistance.sort((a, b) => {
		if (a.isFeatured !== b.isFeatured) {
			return a.isFeatured ? -1 : 1;
		}
		return a.distance - b.distance;
	});

	return vendorsWithDistance;
}

export type VendorBasicInfo = {
	id: string;
	vendorName: string;
};

export async function getVendorsBasicInfo(
	vendorIds: string[]
): Promise<Map<string, VendorBasicInfo>> {
	const result = new Map<string, VendorBasicInfo>();

	try {
		const db = await getDb();
		const collection = db.collection<VendorDocument>("vendors");

		const validIds = vendorIds.filter((id) => ObjectId.isValid(id));

		if (validIds.length === 0) {
			return result;
		}

		const objectIds = validIds.map((id) => new ObjectId(id));

		const vendors = await collection
			.find(
				{ _id: { $in: objectIds } },
				{ projection: { _id: 1, vendorName: 1 } }
			)
			.toArray();

		for (const vendor of vendors) {
			const vendorId = vendor._id?.toString();
			if (vendorId) {
				result.set(vendorId, {
					id: vendorId,
					vendorName: vendor.vendorName || "Unknown Venue",
				});
			}
		}
	} catch (error) {
		console.error("Failed to fetch vendors basic info", error);
	}

	return result;
}

/**
 * Update vendor ownership (admin only)
 */
export async function updateVendorOwnership(
	vendorId: string,
	newOwnerUserId: string | undefined
): Promise<VendorResponse | null> {
	if (!ObjectId.isValid(vendorId)) {
		return null;
	}

	const db = await getDb();
	const collection = db.collection<VendorDocument>("vendors");

	const objectId = new ObjectId(vendorId);
	const result = await collection.updateOne(
		{ _id: objectId },
		{ 
			$set: { 
				ownerUserId: newOwnerUserId,
				updatedAt: new Date()
			} 
		}
	);

	if (result.matchedCount === 0) {
		return null;
	}

	return getVendorById(vendorId);
}
