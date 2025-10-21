#!/usr/bin/env node

/**
 * Vendor Geocoding Migration Script
 * 
 * This script geocodes existing vendors that have a zip code but no latitude/longitude coordinates.
 * It updates the vendors collection with the geocoded coordinates.
 * 
 * Usage: npx tsx scripts/geocode-vendors.ts
 */

import { getDb } from "../lib/mongodb";
import { geocodeLocation } from "../lib/geolocation";
import type { VendorDocument } from "../lib/vendors";

async function geocodeVendors() {
  console.log('🌍 Vendor Geocoding Migration Script\n');
  console.log('='.repeat(50));

  try {
    const db = await getDb();
    const collection = db.collection<VendorDocument>("vendors");

    // Find vendors that have a zip code but no coordinates
    const vendorsToGeocode = await collection
      .find({
        zip: { $exists: true, $ne: "" },
        $or: [
          { latitude: { $exists: false } },
          { longitude: { $exists: false } },
          { latitude: null },
          { longitude: null }
        ]
      })
      .toArray();

    console.log(`\n📊 Found ${vendorsToGeocode.length} vendors to geocode\n`);

    if (vendorsToGeocode.length === 0) {
      console.log('✅ All vendors already have coordinates!');
      process.exit(0);
    }

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < vendorsToGeocode.length; i++) {
      const vendor = vendorsToGeocode[i];
      console.log(`\n[${i + 1}/${vendorsToGeocode.length}] Processing: ${vendor.vendorName}`);
      console.log(`   Zip: ${vendor.zip}`);

      try {
        const coords = await geocodeLocation(vendor.zip.trim());
        
        if (coords) {
          // Update the vendor with coordinates
          await collection.updateOne(
            { _id: vendor._id },
            {
              $set: {
                latitude: coords.latitude,
                longitude: coords.longitude,
                updatedAt: new Date()
              }
            }
          );
          
          console.log(`   ✅ Geocoded: ${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`);
          successCount++;
        } else {
          console.log(`   ⚠️  Could not geocode zip code: ${vendor.zip}`);
          failCount++;
        }

        // Add a small delay to respect rate limits (Nominatim has 1 req/sec limit)
        if (i < vendorsToGeocode.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1100)); // 1.1 seconds
        }
      } catch (error) {
        console.error(`   ❌ Error geocoding vendor:`, error);
        failCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('\n📊 Summary:');
    console.log(`   Total: ${vendorsToGeocode.length}`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log('\n✨ Migration complete!');

  } catch (error) {
    console.error('\n❌ Error running migration:', error);
    process.exit(1);
  }
}

// Run the migration
geocodeVendors()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
