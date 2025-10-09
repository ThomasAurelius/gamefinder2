// BoardGameGeek API integration
// API documentation: https://boardgamegeek.com/wiki/page/BGG_XML_API2

const BGG_API_BASE = "https://boardgamegeek.com/xmlapi2";

export type BggHotItem = {
  id: string;
  rank: string;
  name: string;
  yearPublished?: string;
  thumbnail?: string;
};

export type BggMarketplaceListing = {
  listdate: string;
  price: {
    currency: string;
    value: string;
  };
  condition: string;
  notes: string;
  link: {
    href: string;
    title: string;
  };
};

/**
 * Fetch the "hot" items from BoardGameGeek
 */
export async function fetchBggHotItems(): Promise<BggHotItem[]> {
  try {
    const response = await fetch(`${BGG_API_BASE}/hot?type=boardgame`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`BGG API error: ${response.statusText}`);
    }

    const xmlText = await response.text();
    const items = parseHotItemsXml(xmlText);
    return items;
  } catch (error) {
    console.error("Failed to fetch BGG hot items:", error);
    throw error;
  }
}

/**
 * Parse the XML response from the BGG hot items API
 */
function parseHotItemsXml(xmlText: string): BggHotItem[] {
  const items: BggHotItem[] = [];
  
  // Simple XML parsing for the hot items
  const itemMatches = xmlText.matchAll(/<item[^>]*id="(\d+)"[^>]*rank="(\d+)"[^>]*>([\s\S]*?)<\/item>/g);
  
  for (const match of itemMatches) {
    const [, id, rank, content] = match;
    const nameMatch = content.match(/<name[^>]*value="([^"]+)"/);
    const yearMatch = content.match(/<yearpublished[^>]*value="([^"]+)"/);
    const thumbnailMatch = content.match(/<thumbnail[^>]*value="([^"]+)"/);
    
    items.push({
      id,
      rank,
      name: nameMatch ? nameMatch[1] : "Unknown",
      yearPublished: yearMatch ? yearMatch[1] : undefined,
      thumbnail: thumbnailMatch ? thumbnailMatch[1] : undefined,
    });
  }
  
  return items;
}

/**
 * Fetch marketplace listings for a specific game
 * Note: This is a placeholder as the actual BGG marketplace API may require authentication
 */
export async function fetchBggMarketplace(): Promise<{ message: string }> {
  // The BGG marketplace doesn't have a simple public API endpoint
  // This would typically require web scraping or a BGG API key
  // For now, we'll return a message directing users to BGG
  return {
    message: "Please visit BoardGameGeek directly to browse marketplace listings.",
  };
}
