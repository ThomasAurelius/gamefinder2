# Host Search Filter - Visual Guide

## Where to Find It

The host search filter appears in two places:
1. **Find Games** page (`/find`)
2. **Find Campaigns** page (`/find-campaigns`)

## Location in the UI

The host search field is located in the search filters section, positioned:
- After the "Game Date" field
- Before the "Location or Zip Code" field

## How It Looks

```
┌─────────────────────────────────────────────────┐
│  Find Games / Find Campaigns                    │
│                                                  │
│  [▼ Show search filters]                        │
└─────────────────────────────────────────────────┘

When expanded:

┌─────────────────────────────────────────────────┐
│  Select Game                                     │
│  [Choose a game...                          ▼]  │
│                                                  │
│  Game Date                                       │
│  [MM/DD/YYYY                                  ]  │
│                                                  │
│  Host Name                                       │
│  [Search for a host by name...              ]  │ ← NEW FIELD
│                                                  │
│  Location or Zip Code                            │
│  [Search for a city or enter zip code...    ]  │
│                                                  │
│  Preferred Time                                  │
│  [Time slot buttons...]                         │
│                                                  │
│  [Search Games]                                 │
└─────────────────────────────────────────────────┘
```

## Host Search Interaction Flow

### Step 1: User types in the host field
```
┌─────────────────────────────────────────────────┐
│  Host Name                                       │
│  [joh█                                       ]  │
│                                                  │
│  Find games hosted by a specific person          │
└─────────────────────────────────────────────────┘
```

### Step 2: Dropdown appears with matching hosts
```
┌─────────────────────────────────────────────────┐
│  Host Name                                       │
│  [john                                       ]  │
│  ┌────────────────────────────────────────────┐ │
│  │ [👤] John Smith                            │ │
│  │ [👤] Johnny Quest                          │ │
│  │ [👤] John Doe                              │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  Find games hosted by a specific person          │
└─────────────────────────────────────────────────┘
```

### Step 3: User selects a host
```
┌─────────────────────────────────────────────────┐
│  Host Name                                       │
│  [John Smith                                 ]  │
│  Filtering by: John Smith  [Clear]              │
│                                                  │
│  Find games hosted by a specific person          │
└─────────────────────────────────────────────────┘
```

### Step 4: Search results show filtered games
```
┌─────────────────────────────────────────────────┐
│  Search Results                                  │
│                                                  │
│  Showing games hosted by John Smith              │
│                                                  │
│  ┌─────────────────────────────────────────┐   │
│  │ Dungeons & Dragons 5e                   │   │
│  │ Host: John Smith                        │   │
│  │ Date: 2025-10-15                        │   │
│  │ ...                                     │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  ┌─────────────────────────────────────────┐   │
│  │ Pathfinder 2e                           │   │
│  │ Host: John Smith                        │   │
│  │ Date: 2025-10-20                        │   │
│  │ ...                                     │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

## Key Features

1. **Autocomplete**: Type-ahead search with dropdown suggestions
2. **Visual Feedback**: Shows selected host with avatar
3. **Clear Option**: Easy to remove the filter
4. **Debounced Search**: Waits 300ms before searching to reduce API calls
5. **Minimum Characters**: Requires at least 2 characters to search
6. **Click Outside**: Dropdown closes when clicking elsewhere
7. **Combined Filters**: Works with other search filters (game, date, time, location)

## Technical Implementation

- **Frontend**: React useState/useEffect hooks for state management
- **Backend**: MongoDB query filtering by userId field
- **API**: New `/api/users/search?name={searchTerm}` endpoint
- **Security**: Regex injection protection, result limiting (max 10)
