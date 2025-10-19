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
      allGames.push({
        id: id,
        name: name,
        yearpublished: yearpublished,
        thumbnail: `https://cf.geekdo-images.com/itemdb/img/${id}`,
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
