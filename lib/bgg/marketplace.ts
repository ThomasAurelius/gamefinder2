import { BGGMarketplaceItem, BGGMarketplaceListing } from "./types";
import fs from "fs";
import path from "path";

/**
 * Fetches marketplace listings from BoardGameGeek
 * Note: BGG doesn't provide a public marketplace API
 * This implementation uses BGG game data from CSV and links to BGG's marketplace
 */
export async function fetchBGGMarketplace(
  searchQuery?: string,
  limit: number = 50
): Promise<BGGMarketplaceItem[]> {
  try {
    // Read BGG game data from CSV
    const csvPath = path.join(process.cwd(), "data", "boardgames_ranks.csv");
    const csvContent = fs.readFileSync(csvPath, "utf-8");
    const lines = csvContent.split("\n").slice(1); // Skip header
    
    // Parse CSV and create marketplace items
    const allGames: BGGMarketplaceItem[] = [];
    
    for (let i = 0; i < Math.min(lines.length, 100); i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Parse CSV line (handle quoted fields)
      const matches = line.match(/(?:^|,)("(?:[^"]|"")*"|[^,]*)/g);
      if (!matches || matches.length < 4) continue;
      
      const fields = matches.map(field => 
        field.replace(/^,/, "").replace(/^"|"$/g, "").replace(/""/g, '"')
      );
      
      const id = fields[0];
      const name = fields[1];
      const yearpublished = fields[2];
      
      if (!id || !name) continue;
      
      // Create a marketplace item that links to BGG's marketplace for this game
      // Note: Thumbnail URLs would ideally be fetched from BGG XML API2
      // For now using a placeholder pattern that may or may not resolve
      // TODO: Implement BGG API call to fetch actual thumbnail URLs
      allGames.push({
        id: id,
        name: name,
        yearpublished: yearpublished,
        thumbnail: undefined, // BGG API required for actual thumbnails
        listings: [
          {
            listingid: `${id}-market`,
            listdate: new Date().toISOString(),
            price: {
              currency: "USD",
              value: "0.00" // Price varies by listing
            },
            condition: "various",
            notes: `Browse marketplace listings for ${name} on BoardGameGeek`,
            link: {
              href: `https://boardgamegeek.com/geekmarket/browse?objecttype=thing&objectid=${id}`,
              title: `View ${name} on BGG Marketplace`
            }
          }
        ]
      });
    }
    
    // Filter by search query if provided
    let filteredGames = allGames;
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredGames = allGames.filter(item => 
        item.name.toLowerCase().includes(query)
      );
    }
    
    return filteredGames.slice(0, limit);
  } catch (error) {
    console.error("Error fetching BGG marketplace data:", error);
    return [];
  }
}

/**
 * Parses BGG XML marketplace data
 * This would be used when fetching real data from BGG API2
 */
export function parseBGGMarketplaceXML(xml: string): BGGMarketplaceItem[] {
  // XML parsing would go here
  // For now, return empty array as we're using mock data
  return [];
}

/**
 * Fetches game thumbnails from BGG XML API2
 * @param gameIds Array of BGG game IDs
 * @returns Map of game ID to thumbnail URL
 */
export async function fetchBGGThumbnails(gameIds: string[]): Promise<Map<string, string>> {
  const thumbnails = new Map<string, string>();
  
  try {
    // BGG API allows batch requests up to 20 items
    // Example: https://boardgamegeek.com/xmlapi2/thing?id=174430,167791,224517
    const batchSize = 20;
    
    for (let i = 0; i < gameIds.length; i += batchSize) {
      const batch = gameIds.slice(i, i + batchSize);
      const ids = batch.join(',');
      
      // This would make the API call when network is available
      // const response = await fetch(`https://boardgamegeek.com/xmlapi2/thing?id=${ids}`);
      // const xml = await response.text();
      // Parse XML and extract thumbnails
      // For now, this is a placeholder for future implementation
      
      // Placeholder implementation
      for (const id of batch) {
        // thumbnails.set(id, extractedThumbnailUrl);
      }
    }
  } catch (error) {
    console.error("Error fetching BGG thumbnails:", error);
  }
  
  return thumbnails;
}
