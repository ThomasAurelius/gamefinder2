# Board Games Library Search Fix for Vercel

## Problem
The board games library search feature was working on local machines but not on Vercel deployments.

### Root Cause
The board games data is stored in a CSV file (`data/boardgames_ranks.csv`) which is:
1. **Gitignored** - Not included in the repository
2. **Local only** - The code was hardcoded to read from a local file path
3. **Not deployable** - Vercel's serverless environment doesn't have access to local files

## Solution
Modified `lib/boardgames/db.ts` to support two loading methods:

### 1. Remote URL Loading (for Production/Vercel)
When the environment variable `BOARDGAMES_CSV_URL` is set, the CSV file is fetched from a remote URL.

### 2. Local File Loading (for Development)
When `BOARDGAMES_CSV_URL` is not set, the code falls back to reading the local file from `data/boardgames_ranks.csv`.

## How to Configure for Vercel

### Step 1: Host the CSV File
Upload your `boardgames_ranks.csv` file to a publicly accessible location. Options include:

1. **GitHub Gist** (Free, easy)
   - Create a new Gist at https://gist.github.com/
   - Upload the CSV file
   - Click "Raw" to get the direct URL

2. **Vercel Blob Storage** (Integrated with Vercel)
   - Use Vercel's blob storage service
   - Upload the CSV file
   - Use the generated public URL

3. **AWS S3 / Google Cloud Storage** (Scalable)
   - Create a bucket with public read access
   - Upload the CSV file
   - Use the public URL

4. **Other options**
   - Dropbox public links
   - Any CDN or static file hosting service

### Step 2: Configure Vercel Environment Variable
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new environment variable:
   - **Key:** `BOARDGAMES_CSV_URL`
   - **Value:** The public URL of your hosted CSV file
   - **Environments:** Select Production, Preview, and Development as needed

Example:
```
BOARDGAMES_CSV_URL=https://gist.githubusercontent.com/username/abc123/raw/boardgames_ranks.csv
```

### Step 3: Redeploy
After adding the environment variable, trigger a new deployment in Vercel for the changes to take effect.

## Verification

### Check Vercel Logs
1. Go to your Vercel project dashboard
2. Navigate to **Deployments** → Select your latest deployment
3. Click on **Functions** → Select the API function (e.g., `/api/boardgames`)
4. Check the logs for:
   - `"Loading board games CSV from URL: ..."`
   - `"Successfully loaded X board games"`

### Test the API
Make a request to your deployed API endpoint:
```bash
curl https://your-app.vercel.app/api/boardgames?q=catan
```

You should receive a JSON response with matching games.

## Troubleshooting

### Issue: Still getting empty results
**Solutions:**
- Verify the `BOARDGAMES_CSV_URL` environment variable is set correctly in Vercel
- Check that the URL is publicly accessible (try opening it in a browser)
- Redeploy after adding the environment variable
- Check Vercel function logs for error messages

### Issue: CSV file is too large
**Solutions:**
- Use a CDN or cloud storage with good bandwidth
- Consider compressing the file (gzip) and updating the code to decompress
- Use Vercel Blob Storage which is optimized for large files

### Issue: CORS errors
**Solutions:**
- Ensure the hosting service allows CORS requests
- GitHub Gist and most CDNs handle this automatically
- For S3/GCS, configure CORS settings on the bucket

### Issue: Rate limiting
**Solutions:**
- Use a CDN or storage service with high rate limits
- The CSV is cached in memory after the first load, so subsequent requests are fast
- Consider using Vercel's Edge Config or KV for even better caching

## Local Development
No changes required! When `BOARDGAMES_CSV_URL` is not set, the code automatically falls back to reading from `data/boardgames_ranks.csv`.

Just make sure you have the CSV file in your local `data/` directory:
```bash
# Create data directory if it doesn't exist
mkdir -p data

# Download the CSV file
curl -L -o data/boardgames_ranks.csv https://github.com/user-attachments/files/22702456/boardgames_ranks.csv
```

## Code Changes
The key changes were made in `lib/boardgames/db.ts`:

```typescript
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
        throw new Error(`Failed to fetch CSV from URL: ${response.status}`);
      }
      fileContent = await response.text();
    } else {
      // Fall back to local file (for development)
      console.log("Loading board games CSV from local file:", CSV_FILE_PATH);
      fileContent = await fs.readFile(CSV_FILE_PATH, "utf-8");
    }
    
    // ... rest of CSV parsing logic
  }
}
```

## Benefits
- ✅ Works on Vercel and other serverless platforms
- ✅ No code changes needed between dev and production
- ✅ Easy to update the CSV file without redeploying
- ✅ Cached in memory for fast subsequent requests
- ✅ Better logging for debugging
- ✅ Graceful fallback for local development
