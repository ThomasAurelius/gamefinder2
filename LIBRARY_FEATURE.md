# Board Games Library Feature

## Overview
This feature allows users to search through 169,000+ board games and manage their personal library with owned games and wishlists.

## Setup Instructions

### CSV Data File

#### Local Development
The board games data comes from a CSV file that needs to be placed in the `data/` directory:

1. Download the board games CSV file from: https://github.com/user-attachments/files/22702456/boardgames_ranks.csv
2. Place it in the project: `data/boardgames_ranks.csv`

**Note:** The `data/` directory is gitignored, so the CSV file won't be committed to the repository. Each developer needs to download and place the file manually.

#### Vercel Deployment
For Vercel deployments (or other serverless platforms), the CSV file cannot be included in the deployment because:
- The `data/` directory is gitignored
- Serverless filesystems are typically read-only

**Solution:** Host the CSV file externally and configure the URL via environment variable:

1. Upload the CSV file to a publicly accessible location (e.g., GitHub Gist, Google Cloud Storage, AWS S3, or Vercel Blob Storage)
2. Add the environment variable `BOARDGAMES_CSV_URL` in your Vercel project settings
3. Set its value to the public URL of your CSV file

Example:
```
BOARDGAMES_CSV_URL=https://your-storage-url.com/boardgames_ranks.csv
```

The application will automatically:
- Use the remote URL when `BOARDGAMES_CSV_URL` is set (production)
- Fall back to the local file when the variable is not set (development)

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
