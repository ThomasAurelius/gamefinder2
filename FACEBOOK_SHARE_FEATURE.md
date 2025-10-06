# Facebook Share Feature

## Overview
This feature allows users to share game sessions to Facebook directly from the game detail page and after posting a new game. The shared post includes the game image, title, description, and a link back to the event on The Gathering Call.

## Implementation Details

### Components Created

#### 1. ShareToFacebook Component (`components/ShareToFacebook.tsx`)
A reusable React component that opens the Facebook share dialog in a popup window.

**Features:**
- Facebook-branded button with official Facebook blue color (#1877F2)
- Opens share dialog in a centered popup window (600x400)
- Includes Facebook icon (official Facebook "f" logo)
- Supports custom share quote/message
- Handles button disabled state during sharing

**Props:**
- `url`: The URL to share (required)
- `quote`: Optional custom message to include with the share

### Pages Modified

#### 1. Game Detail Page (`app/games/[id]/page.tsx`)

**Changes:**
- Added `generateMetadata` function to create dynamic Open Graph meta tags
- Imported and integrated ShareToFacebook component
- Positioned share button prominently below game title

**Open Graph Metadata:**
- `og:title`: Game name + "Game Session"
- `og:description`: Game description (truncated to 200 chars) or auto-generated summary
- `og:url`: Full URL to the game detail page
- `og:image`: Game session image (if available)
- `og:type`: website
- Twitter card metadata for better Twitter sharing support

**Share Button Location:**
- Placed in a new section below the game title and Edit/Delete buttons
- Visible to all users (not just the host)
- Includes pre-filled quote: "Join me for [Game Name] on [Date]!"

#### 2. Post Game Page (`app/post/page.tsx`)

**Changes:**
- Added state to track posted game ID (`postedGameId`)
- Updated success handler to capture game ID from API response
- Enhanced success message to include ShareToFacebook button
- Share button appears only after successful game post

**Success Message Enhancement:**
- Shows success message with green styling
- Displays ShareToFacebook button with game link
- Auto-generates share quote with game name

### Environment Variables

Added to `.env.example`:
```
NEXT_PUBLIC_APP_URL=https://thegatheringcall.com
```

This is used to generate absolute URLs for sharing. The code falls back to "https://thegatheringcall.com" if not set.

## How It Works

### 1. Sharing from Game Detail Page

When a user clicks "Share to Facebook" on a game detail page:

1. Component constructs a Facebook share URL: `https://www.facebook.com/sharer/sharer.php`
2. Adds the game detail page URL as the `u` parameter
3. Adds a custom quote with game name and date
4. Opens Facebook share dialog in a popup window (600x400, centered)
5. User can customize the message and complete the share on Facebook

### 2. Sharing After Posting

When a user successfully posts a game:

1. API returns the new game session including its ID
2. Success message displays with green styling
3. ShareToFacebook button appears with:
   - URL pointing to the new game detail page
   - Quote including the selected game name
4. User can immediately share their newly created game

### 3. Facebook Preview

When the shared link is posted on Facebook:

1. Facebook's crawler reads the Open Graph meta tags from the game detail page
2. Displays a rich preview with:
   - Game title
   - Game description or summary
   - Game session image (if available)
   - Link to the game detail page
3. Clicking the preview takes users to the game detail page

## Benefits

1. **Easy Promotion**: Hosts can easily promote their game sessions to Facebook
2. **Rich Previews**: Open Graph tags ensure posts look professional with images and descriptions
3. **Direct Links**: Shared posts link directly to the game detail page for easy sign-ups
4. **Immediate Sharing**: Share button appears right after posting for quick promotion
5. **Universal Access**: Any user can share any game (not restricted to hosts)

## Technical Details

### Facebook Share Dialog API

Uses Facebook's official sharer.php endpoint:
```
https://www.facebook.com/sharer/sharer.php?u={url}&quote={quote}
```

No Facebook App ID required - works with public sharer dialog.

### Open Graph Tags Structure

```html
<meta property="og:title" content="Game Name - Game Session" />
<meta property="og:description" content="Game description..." />
<meta property="og:url" content="https://thegatheringcall.com/games/123" />
<meta property="og:type" content="website" />
<meta property="og:image" content="https://..." />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
```

### Browser Compatibility

- Works in all modern browsers
- Opens popup window (users need to allow popups for the site)
- Gracefully degrades if popup is blocked (Facebook share page can still be opened)

## Testing

To test the feature:

1. **Create a game session** with title, description, and optional image
2. **Navigate to the game detail page**
3. **Click "Share to Facebook"** button
4. **Verify** Facebook share dialog opens with correct URL and quote
5. **Check preview** - Facebook should show game title, description, and image
6. **Complete share** on Facebook
7. **Test post page** - Create a new game and verify share button appears in success message

## Future Enhancements

Possible improvements:
- Add share buttons for other platforms (Twitter/X, LinkedIn, WhatsApp)
- Add copy-to-clipboard button for easy link sharing
- Track share analytics
- Add share count display
- Enable sharing to Facebook Groups directly
- Add Facebook Events integration to create actual Facebook Events

## Files Changed

1. `components/ShareToFacebook.tsx` - New component
2. `app/games/[id]/page.tsx` - Added metadata and share button
3. `app/post/page.tsx` - Added share button to success message
4. `.env.example` - Added NEXT_PUBLIC_APP_URL

## Build Status

✅ Build successful with no errors
✅ All linting passes
✅ TypeScript compilation successful
