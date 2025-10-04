import { promises as fs } from "fs";
import path from "path";
import { BoardGame } from "./types";

const CSV_FILE_PATH = path.join(process.cwd(), "data", "boardgames_ranks.csv");

let cachedGames: BoardGame[] | null = null;

async function loadBoardGames(): Promise<BoardGame[]> {
  if (cachedGames) {
    return cachedGames;
  }

  try {
    let fileContent: string;
    
    // Check if a remote CSV URL is configured (for Vercel deployments)
    const csvUrl = process.env.BOARDGAMES_CSV_URL;
    
    if (csvUrl) {
      console.log("Loading board games CSV from URL:", csvUrl);
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV from URL: ${response.status} ${response.statusText}`);
      }
      fileContent = await response.text();
    } else {
      // Fall back to local file (for development)
      console.log("Loading board games CSV from local file:", CSV_FILE_PATH);
      fileContent = await fs.readFile(CSV_FILE_PATH, "utf-8");
    }
    
    const lines = fileContent.split("\n");
    
    // Skip header line
    const dataLines = lines.slice(1);
    
    const games: BoardGame[] = [];
    
    for (const line of dataLines) {
      if (!line.trim()) continue;
      
      // Parse CSV line (handle quoted values)
      const matches = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g);
      if (!matches || matches.length < 7) continue;
      
      const id = matches[0].replace(/"/g, "").trim();
      const name = matches[1].replace(/"/g, "").trim();
      const yearpublished = matches[2].replace(/"/g, "").trim();
      const rank = parseInt(matches[3].replace(/"/g, "").trim()) || 0;
      const bayesaverage = parseFloat(matches[4].replace(/"/g, "").trim()) || 0;
      const average = parseFloat(matches[5].replace(/"/g, "").trim()) || 0;
      const usersrated = parseInt(matches[6].replace(/"/g, "").trim()) || 0;
      
      if (id && name) {
        games.push({
          id,
          name,
          yearpublished,
          rank,
          bayesaverage,
          average,
          usersrated,
        });
      }
    }
    
    cachedGames = games;
    console.log(`Successfully loaded ${games.length} board games`);
    return games;
  } catch (error) {
    console.error("Failed to load board games CSV:", error);
    console.error("Tried loading from:", process.env.BOARDGAMES_CSV_URL || CSV_FILE_PATH);
    return [];
  }
}

export async function searchBoardGames(
  query: string,
  limit: number = 20
): Promise<BoardGame[]> {
  const games = await loadBoardGames();
  
  if (!query.trim()) {
    // Return top ranked games when no query
    return games
      .filter((g) => g.rank > 0)
      .sort((a, b) => a.rank - b.rank)
      .slice(0, limit);
  }
  
  const lowerQuery = query.toLowerCase();
  
  // Filter games that match the query
  const matches = games.filter((game) =>
    game.name.toLowerCase().includes(lowerQuery)
  );
  
  // Sort by relevance: exact matches first, then by rank
  return matches
    .sort((a, b) => {
      const aExact = a.name.toLowerCase() === lowerQuery ? 1 : 0;
      const bExact = b.name.toLowerCase() === lowerQuery ? 1 : 0;
      
      if (aExact !== bExact) {
        return bExact - aExact;
      }
      
      const aStarts = a.name.toLowerCase().startsWith(lowerQuery) ? 1 : 0;
      const bStarts = b.name.toLowerCase().startsWith(lowerQuery) ? 1 : 0;
      
      if (aStarts !== bStarts) {
        return bStarts - aStarts;
      }
      
      // Sort by rank (lower rank is better, 0 means unranked)
      if (a.rank === 0 && b.rank === 0) return 0;
      if (a.rank === 0) return 1;
      if (b.rank === 0) return -1;
      return a.rank - b.rank;
    })
    .slice(0, limit);
}

export async function getBoardGameById(id: string): Promise<BoardGame | null> {
  const games = await loadBoardGames();
  return games.find((game) => game.id === id) || null;
}
