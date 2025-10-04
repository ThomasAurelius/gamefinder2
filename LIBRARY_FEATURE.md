# Board Games Library Feature

## Overview
This feature allows users to search through 169,000+ board games and manage their personal library with owned games and wishlists.

## Setup Instructions

### CSV Data File
The board games data comes from a CSV file that needs to be placed in the `data/` directory:

1. Download the board games CSV file from: https://github.com/user-attachments/files/22702456/boardgames_ranks.csv
2. Place it in the project: `data/boardgames_ranks.csv`

**Note:** The `data/` directory is gitignored, so the CSV file won't be committed to the repository. Each developer/deployment needs to download and place the file manually.

### CSV File Format
The CSV file should have the following columns:
- `id` - Unique game identifier
- `name` - Game name
- `yearpublished` - Year published
- `rank` - BoardGameGeek rank
- `bayesaverage` - Bayesian average rating
- `average` - Average rating
- `usersrated` - Number of user ratings

## Features

### Search Functionality
- Search through 169,000+ board games
- Smart ranking: exact matches → starts with matches → ranked by popularity
- Shows game details: year, rank, rating, and number of ratings
- Returns up to 50 results per search
- Empty query returns top-ranked games

### Library Management
- **Owned Games**: Track games in your collection
- **Wishlist**: Track games you want to acquire
- Add games directly from search results
- Move games between owned and wishlist
- Remove games from library
- Prevents duplicate entries

### API Endpoints

#### Search Board Games
```
GET /api/boardgames?q={search_query}&limit={number}
```

#### Get User Library
```
GET /api/library
```
Requires authentication (userId cookie)

#### Manage Library
```
POST /api/library
Content-Type: application/json

{
  "action": "add" | "remove" | "move",
  "gameId": "string",
  "gameName": "string",
  "type": "owned" | "wishlist",
  "fromType": "owned" | "wishlist",  // for move action
  "toType": "owned" | "wishlist"     // for move action
}
```

## Technical Details

### Data Storage
- CSV file is loaded once and cached in memory for performance
- User library data is stored in MongoDB user documents under `library.owned` and `library.wishlist`
- Each library entry includes: `gameId`, `gameName`, `addedAt` timestamp

### Performance Optimization
- CSV parsing and caching prevents repeated file reads
- Smart search algorithm prioritizes relevance
- MongoDB queries prevent duplicate entries

## File Structure
```
data/
  └── boardgames_ranks.csv          # Board games data (not in git)
lib/
  └── boardgames/
      ├── types.ts                  # TypeScript type definitions
      ├── db.ts                     # CSV parsing and search logic
      └── library.ts                # MongoDB library operations
app/
  ├── library/
  │   └── page.tsx                  # Library UI component
  └── api/
      ├── boardgames/
      │   └── route.ts              # Search API endpoint
      └── library/
          └── route.ts              # Library management API
```
