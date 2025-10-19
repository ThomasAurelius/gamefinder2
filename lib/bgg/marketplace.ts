import { BGGMarketplaceItem, BGGMarketplaceListing } from "./types";
import fs from "fs";
import path from "path";

/**
 * Fetches game thumbnails from BoardGameGeek XML API2
 * @param gameIds Array of BGG game IDs
 * @returns Map of game ID to thumbnail URL
 */
async function fetchBGGThumbnailsBatch(gameIds: string[]): Promise<Map<string, string>> {
  const thumbnails = new Map<string, string>();
  
  if (gameIds.length === 0) {
    return thumbnails;
  }
  
  try {
    // BGG API allows batch requests up to 20 items
    const batchSize = 20;
    
    for (let i = 0; i < gameIds.length; i += batchSize) {
      const batch = gameIds.slice(i, i + batchSize);
      const ids = batch.join(',');
      
      // Fetch from BGG XML API2
      const response = await fetch(`https://boardgamegeek.com/xmlapi2/thing?id=${ids}&type=boardgame`);
      
      if (!response.ok) {
        console.warn(`Failed to fetch BGG data for batch ${i}: ${response.status}`);
        continue;
      }
      
      const xml = await response.text();
      
      // Parse XML to extract thumbnails
      // Using simple regex parsing since we only need thumbnails
      // More robust XML parsing could be added if needed
      const itemMatches = xml.matchAll(/<item[^>]*id="(\d+)"[^>]*>[\s\S]*?<thumbnail>([^<]+)<\/thumbnail>[\s\S]*?<\/item>/g);
      
      for (const match of itemMatches) {
        const gameId = match[1];
        const thumbnailUrl = match[2];
        if (gameId && thumbnailUrl) {
          thumbnails.set(gameId, thumbnailUrl);
        }
      }
      
      // Respect BGG API rate limits - add small delay between batches
      if (i + batchSize < gameIds.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
  } catch (error) {
    console.error("Error fetching BGG thumbnails:", error);
  }
  
  return thumbnails;
}

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
    
    // Parse CSV and collect game IDs
    const gameData: Array<{id: string, name: string, year: string}> = [];
    
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
      
      gameData.push({ id, name, year: yearpublished });
    }
    
    // Filter by search query before fetching thumbnails
    let filteredGameData = gameData;
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredGameData = gameData.filter(item => 
        item.name.toLowerCase().includes(query)
      );
    }
    
    // Limit the results before fetching thumbnails to minimize API calls
    const limitedGameData = filteredGameData.slice(0, limit);
    
    // Fetch thumbnails for the filtered games
    const gameIds = limitedGameData.map(g => g.id);
    const thumbnails = await fetchBGGThumbnailsBatch(gameIds);
    
    // Create marketplace items with thumbnails
    // Use placeholder image if BGG thumbnail is not available
    const allGames: BGGMarketplaceItem[] = limitedGameData.map(game => ({
      id: game.id,
      name: game.name,
      yearpublished: game.year,
      thumbnail: thumbnails.get(game.id) || "/images/game-placeholder.svg",
      listings: [
        {
          listingid: `${game.id}-market`,
          listdate: new Date().toISOString(),
          price: {
            currency: "USD",
            value: "0.00" // Price varies by listing
          },
          condition: "various",
          notes: `Browse marketplace listings for ${game.name} on BoardGameGeek`,
          link: {
            href: `https://boardgamegeek.com/geekmarket/browse?objecttype=thing&objectid=${game.id}`,
            title: `View ${game.name} on BGG Marketplace`
          }
        }
      ]
    }));
    
    return allGames;
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
