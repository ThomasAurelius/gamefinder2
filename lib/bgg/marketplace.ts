import { BGGMarketplaceItem, BGGMarketplaceListing } from "./types";

/**
 * Fetches marketplace listings from BoardGameGeek API2
 * BGG API2 uses XML format, so we need to parse it
 */
export async function fetchBGGMarketplace(
  searchQuery?: string,
  limit: number = 50
): Promise<BGGMarketplaceItem[]> {
  try {
    // BGG API2 doesn't have a direct marketplace search endpoint
    // We'll fetch popular games with marketplace listings
    // For a real implementation, you would need to:
    // 1. Search for games using /xmlapi2/search?query={query}
    // 2. For each game, fetch marketplace listings using /xmlapi2/thing?id={id}&marketplace=1
    
    // Since we're working with BGG data from CSV, we'll use that for game IDs
    // and simulate marketplace data for demonstration purposes
    // In production, you would fetch actual marketplace data from BGG API
    
    const mockMarketplaceData: BGGMarketplaceItem[] = [
      {
        id: "174430",
        name: "Gloomhaven",
        yearpublished: "2017",
        thumbnail: "https://cf.geekdo-images.com/sZYp_3BTDGjh2unaZfZmuA__thumb/img/pBaOL7vJAiGu8K5XRH0YnTh33-o=/fit-in/200x150/filters:strip_icc()/pic2437871.jpg",
        listings: [
          {
            listingid: "1001",
            listdate: new Date().toISOString(),
            price: {
              currency: "USD",
              value: "89.99"
            },
            condition: "new",
            notes: "Brand new sealed copy",
            link: {
              href: "https://boardgamegeek.com/market/product/1001",
              title: "View on BGG Marketplace"
            }
          }
        ]
      },
      {
        id: "167791",
        name: "Terraforming Mars",
        yearpublished: "2016",
        thumbnail: "https://cf.geekdo-images.com/wg9oOLcsKvDesSUdZQ4rxw__thumb/img/thIqWDnH9utKuoKx4FD8w3m8dYc=/fit-in/200x150/filters:strip_icc()/pic3536616.jpg",
        listings: [
          {
            listingid: "1002",
            listdate: new Date().toISOString(),
            price: {
              currency: "USD",
              value: "45.00"
            },
            condition: "like-new",
            notes: "Played once, excellent condition",
            link: {
              href: "https://boardgamegeek.com/market/product/1002",
              title: "View on BGG Marketplace"
            }
          }
        ]
      },
      {
        id: "224517",
        name: "Brass: Birmingham",
        yearpublished: "2018",
        thumbnail: "https://cf.geekdo-images.com/x3zxjr-Vw5iU4yDPg70Jgw__thumb/img/7bY4b4fZ8RjVdf5dOT3kHEJ1S6I=/fit-in/200x150/filters:strip_icc()/pic3490053.jpg",
        listings: [
          {
            listingid: "1003",
            listdate: new Date().toISOString(),
            price: {
              currency: "USD",
              value: "75.00"
            },
            condition: "good",
            notes: "Played several times, all components present",
            link: {
              href: "https://boardgamegeek.com/market/product/1003",
              title: "View on BGG Marketplace"
            }
          }
        ]
      }
    ];

    // Filter by search query if provided
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return mockMarketplaceData
        .filter(item => item.name.toLowerCase().includes(query))
        .slice(0, limit);
    }

    return mockMarketplaceData.slice(0, limit);
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
