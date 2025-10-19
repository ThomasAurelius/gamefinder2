# BGG Marketplace Integration - Visual Summary

## Recent Updates (Issue Fix)

**Issue:** Marketplace was only showing 3 hardcoded listings with broken links to non-existent BGG product pages.

**Solution:** 
- Replaced mock data with real BGG game data from `boardgames_ranks.csv`
- Now displays up to 100 top-ranked games from BoardGameGeek
- Links now point to actual BGG marketplace browse pages for each specific game
- Each link uses the correct BGG game ID (e.g., `https://boardgamegeek.com/geekmarket/browse?objecttype=thing&objectid=174430` for Gloomhaven)
- Users can click through to view all available marketplace listings for that game on BGG
- Images are currently placeholders (future enhancement: fetch from BGG XML API2)

## Overview
This implementation replaces the internal marketplace with BoardGameGeek's marketplace feed and adds attribution images to pages using BGG API.

## Changes by Page

### 1. Marketplace Page (`/marketplace`)
**Before:**
- Internal marketplace listings from database
- Complex search with multiple filters (game system, tags, condition, location, price)
- "Post Listing" button to create internal listings
- Links to internal detail pages

**After:**
- BGG marketplace listings
- Simple search with single query input
- BGG attribution image in header (160x20px orange badge)
- Cards link directly to BGG marketplace
- Cleaner, simpler interface focused on browsing

**Visual Changes:**
```
Header:
┌────────────────────────────────────────────────┐
│ Game Marketplace                               │
│ Browse games for sale from BoardGameGeek's     │
│ marketplace.                                   │
│ [Powered by BGG] ← Attribution image           │
└────────────────────────────────────────────────┘

Search:
┌────────────────────────────────────────────────┐
│ Search Title or Description                    │
│ [                                            ] │
│ [Search Listings] [Clear]                     │
└────────────────────────────────────────────────┘

Previously had:
- Listing Type dropdown
- Game System dropdown  
- Tags multi-select
- Condition dropdown
- Price range inputs
- Location search with radius
```

### 2. Library Page (`/library`)
**Changes:**
- Added BGG attribution image to header
- No other functional changes (already used BGG data)

**Visual:**
```
┌────────────────────────────────────────────────┐
│ Board Game Library                             │
│ Search and manage your collection of owned     │
│ and wishlist games                             │
│ [Powered by BGG] ← NEW Attribution image       │
└────────────────────────────────────────────────┘
```

### 3. Post Listing Page (`/marketplace/post`)
**Before:**
- Full form to create marketplace listings
- Image upload
- Multiple fields for game details

**After:**
- Simple redirect page to BGG marketplace
- Message explaining the change
- Auto-redirects on page load

**Visual:**
```
┌────────────────────────────────────────────────┐
│                                                │
│  Redirecting to BoardGameGeek Marketplace      │
│                                                │
│  We now use BoardGameGeek's marketplace        │
│  for buying and selling games.                 │
│                                                │
│  If not redirected, click here                 │
│                                                │
└────────────────────────────────────────────────┘
```

### 4. Edit Listing Page (`/marketplace/[id]/edit`)
**Changes:**
- Same as Post page - now redirects to BGG marketplace
- No longer allows editing internal listings through UI

### 5. Listing Detail Page (`/marketplace/[id]`)
**Changes:**
- When fetching a BGG listing, auto-redirects to BGG marketplace
- API returns redirect URL with 410 Gone status

## New Files

### `/lib/bgg/types.ts`
```typescript
// TypeScript interfaces for BGG marketplace data
- BGGMarketplaceListing
- BGGMarketplaceItem  
- BGGApiResponse
```

### `/lib/bgg/marketplace.ts`
```typescript
// Service to fetch BGG marketplace listings
- fetchBGGMarketplace() - Reads from boardgames_ranks.csv and creates marketplace links
- parseBGGMarketplaceXML() - Placeholder for future XML parsing
- fetchBGGThumbnails() - Placeholder for future thumbnail fetching
- Currently uses 100 top-ranked games from CSV data
- Links to actual BGG marketplace pages with real game IDs
```

### `/public/images/bgg-placeholder.svg`
```svg
Orange badge with "Powered by BGG" text
Dimensions: 160px wide × 20px high
Used as attribution on marketplace and library pages
```

## API Changes

### GET `/api/marketplace`
**Before:**
- Fetched from internal MongoDB collection
- Supported complex filters
- Added host information from user database

**After:**
- Fetches from BGG marketplace via `fetchBGGMarketplace()`
- Simple search query parameter
- Returns transformed BGG data in same format

### GET `/api/marketplace/[id]`
**Before:**
- Fetched listing from database
- Returned full listing details

**After:**
- Returns 410 Gone with redirect URL
- Client auto-redirects to BGG marketplace

## Technical Details

### Data Transformation
BGG marketplace items are transformed to match the existing listing format:
```typescript
{
  id: `${gameId}-market`,
  title: gameName,
  description: `Browse available listings for ${gameName} on BoardGameGeek's marketplace. Published in ${year}.`,
  price: undefined, // Price varies by individual listings
  condition: "various",
  imageUrls: [], // Thumbnails would require BGG API integration
  listingType: "sell",
  hostName: "BoardGameGeek",
  externalLink: `https://boardgamegeek.com/geekmarket/browse?objecttype=thing&objectid=${gameId}`,
  bggGameId: gameId
}
```

### Data Source
Uses the existing `boardgames_ranks.csv` file which contains:
- Top 10,000+ board games from BoardGameGeek
- Game ID, name, year published, rank, ratings
- Real BGG game IDs that can be used to construct marketplace URLs
```

### Mock Data
Currently displays top-ranked games from boardgames_ranks.csv:
- Up to 100 games loaded from the CSV file
- All games have real BGG game IDs (e.g., 174430 for Gloomhaven)
- Links point to actual BGG marketplace browse pages
- Examples: Brass: Birmingham, Gloomhaven, Terraforming Mars, etc.
- Search functionality filters by game name
- No images currently (would require BGG XML API2 integration)

Future enhancement: Integrate BGG XML API2 to fetch:
- Game thumbnails
- Actual marketplace listing details
- Real-time pricing information

## User Experience Flow

### Browsing Marketplace
1. User visits `/marketplace`
2. Sees BGG attribution image
3. Sees up to 100 top-ranked games from BGG database
4. Can search for games by name
5. Clicks on listing card
6. Redirected to BGG marketplace browse page for that specific game
7. Can view all available listings for that game on BGG
8. Completes transaction on BGG

### Posting Listing
1. User clicks "Post Listing" (if button exists)
2. OR visits `/marketplace/post` directly
3. Auto-redirected to BGG marketplace
4. Can create listing on BGG

## Impact Summary

### Removed
- ~500 lines of complex marketplace UI code
- Internal listing creation forms
- Image upload functionality for marketplace
- Complex search filters
- Internal marketplace database queries (UI only, API preserved)

### Added
- BGG marketplace integration
- Attribution images
- Redirect pages
- BGG types and service layer
- Simpler, cleaner UI

### Preserved
- POST API for creating internal listings (for future use)
- Internal marketplace database (not displayed)
- Edit/delete APIs (for admin/cleanup)

## Browser Compatibility
- SVG attribution images supported in all modern browsers
- Auto-redirect uses standard `window.location.href`
- No compatibility issues expected

## Accessibility
- Attribution image includes `alt` text
- Redirect page provides fallback link
- All text content readable and clear
