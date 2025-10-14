# Marketplace Feature Documentation

## Overview

The marketplace feature allows users to buy and sell games, accessories, and post want ads for items they're looking for. Payment is handled off-site, with users providing their own contact information for transactions.

## Features

### Listing Types
- **For Sale**: List items you want to sell
- **Want Ads**: Post requests for items you're looking for

### Search & Filter Options
- **Text Search**: Search by title, description, or tags
- **Game System**: Filter by specific game systems (D&D, Pathfinder, etc.)
- **Tags**: Tag-based filtering with common tags (Core Rulebooks, Dice Sets, Miniatures, etc.) plus custom tags
- **Condition**: Filter by item condition (new, like-new, good, fair, poor)
- **Price Range**: Set min/max price filters
- **Location**: Distance-based filtering using zip codes or city names

### Listing Details
- Title and description
- Optional game system
- Multiple tags for categorization
- Optional price
- Condition (for sale listings)
- Location and zip code for distance calculation
- Multiple image URLs
- Contact information for off-site payment coordination

## Database Schema

### Collection: `marketplaceListings`

```typescript
{
  id: string;              // Unique listing ID
  userId: string;          // Owner's user ID
  title: string;           // Listing title
  description: string;     // Detailed description
  gameSystem?: string;     // Game system (optional)
  tags: string[];          // Searchable tags
  price?: number;          // Price in dollars (optional)
  condition?: string;      // Item condition (for sale listings)
  location?: string;       // City, State
  zipCode?: string;        // Zip code for distance calculation
  latitude?: number;       // Geocoded coordinates
  longitude?: number;      // Geocoded coordinates
  imageUrls?: string[];    // Array of image URLs
  listingType: string;     // "sell" or "want"
  contactInfo?: string;    // Contact information
  status: string;          // "active", "sold", or "closed"
  createdAt: string;       // ISO timestamp
  updatedAt: string;       // ISO timestamp
}
```

## API Endpoints

### GET /api/marketplace
List and search marketplace listings with filters.

**Query Parameters:**
- `gameSystem` - Filter by game system
- `tags` - Comma-separated list of tags
- `listingType` - "sell" or "want"
- `condition` - Item condition
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `location` - Location for distance filtering
- `radius` - Search radius in miles (default: 50)

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "D&D Player's Handbook",
    "description": "5th edition, like new condition",
    "price": 35.00,
    "condition": "like-new",
    "tags": ["Core Rulebooks", "Dungeons & Dragons"],
    "listingType": "sell",
    "location": "Austin, TX",
    "distance": 12.5,
    "hostName": "John Doe",
    ...
  }
]
```

### POST /api/marketplace
Create a new marketplace listing.

**Request Body:**
```json
{
  "title": "D&D Player's Handbook",
  "description": "5th edition, like new condition",
  "gameSystem": "Dungeons & Dragons",
  "tags": ["Core Rulebooks"],
  "price": 35.00,
  "condition": "like-new",
  "location": "Austin, TX",
  "zipCode": "78701",
  "imageUrls": ["https://example.com/image.jpg"],
  "listingType": "sell",
  "contactInfo": "Email: john@example.com"
}
```

**Response:** Returns the created listing with ID and timestamps.

### GET /api/marketplace/[id]
Get details of a specific listing.

**Response:** Returns the listing object with host information.

## UI Pages

### /marketplace
Browse and search marketplace listings with filters.

### /marketplace/post
Create a new marketplace listing.

### /marketplace/[id]
View detailed information about a specific listing.

## Integration with Existing Features

- **Authentication**: Uses the existing cookie-based authentication system
- **Geolocation**: Leverages the existing `geocodeLocation` and `calculateDistance` utilities
- **Database**: Integrates with the MongoDB setup via `getDb()`
- **User Information**: Uses `getUsersBasicInfo()` to fetch host details
- **UI Components**: Reuses `CityAutocomplete` component for location search

## Usage Guidelines

1. Users must be authenticated to create listings
2. Location and zip code are optional but recommended for distance-based searching
3. Images are provided as URLs (users host their own images)
4. Payment is handled off-site - the platform only facilitates listing discovery
5. Contact information is optional but recommended for coordination
6. Tags help with discoverability - use common tags when possible

## Future Enhancements

Potential improvements for future iterations:
- Image upload functionality (instead of URLs)
- Messaging integration for buyer-seller communication
- Listing expiration dates
- User ratings and reviews
- Saved searches and favorites
- Email notifications for new listings matching saved searches
- Report listing functionality
- Admin moderation tools
