# Bidirectional Rating System Implementation

## Overview
This feature extends the existing host rating system to include player ratings, creating a complete bidirectional rating system where hosts can rate players and players can rate hosts. A dedicated "Games History" page has been added to the settings section for easy access to past sessions and rating functionality.

## Features Implemented

### 1. Player Feedback System

Similar to the host feedback system, players can now be rated by hosts using the same yes/no/skip rating system.

#### Database Schema
Created a new collection `playerFeedback` with the following structure:

**Fields:**
- `id` (string): Unique identifier for the feedback
- `hostId` (string): User ID of the host who gave the feedback
- `playerId` (string): User ID of the player being rated
- `sessionId` (string): Game or campaign session ID
- `sessionType` ("game" | "campaign"): Type of session
- `recommend` ("yes" | "no" | "skip"): Rating choice
- `comment` (string, optional): Private comment visible only to player and admins
- `createdAt` (string): Timestamp of when feedback was submitted

**Stats Calculation:**
- `score`: yesCount - noCount (displayed as a number with + or - prefix)
- Total ratings count
- Individual counts for yes, no, and skip responses

### 2. API Endpoints

#### POST `/api/player-feedback`
- **Purpose**: Submit or update feedback for a player
- **Authentication**: Required (user must be logged in via cookies)
- **Request Body**: 
  ```json
  {
    "playerId": "string",
    "sessionId": "string",
    "sessionType": "game" | "campaign",
    "recommend": "yes" | "no" | "skip",
    "comment": "string (optional)"
  }
  ```
- **Response**: Returns the created/updated feedback object
- **Validation**: Prevents hosts from rating themselves

#### GET `/api/player-feedback/stats/[playerId]`
- **Purpose**: Get feedback statistics for a specific player
- **Authentication**: Optional (affects whether comments are included)
- **Response**: 
  - Public view: Basic stats (score, counts)
  - Player/Admin view: Stats + all feedback comments
- **Access Control**: Comments only visible to the player being rated or admins

### 3. UI Components

#### PlayerFeedbackDialog
A modal dialog that allows hosts to rate players:
- Three choice buttons: Yes (👍), No (👎), Skip (⏭️)
- Optional comment textarea with privacy notice
- Visual feedback on selection
- Submit and cancel buttons
- Error handling and loading states

**Features:**
- Updates existing ratings if host has already rated the player for that session
- Clear privacy messaging: "Only the player and admins can see your comments"
- Responsive design matching the app's dark theme

#### PlayerRatingDisplay
Displays player rating on public profiles:
- Shows game controller emoji (🎮) with score number
- Color-coded score (green for positive, red for negative, gray for neutral)
- Optional detailed view showing breakdown of yes/no/skip counts
- "No player ratings yet" message for players without ratings
- Loading state while fetching data

#### PlayerFeedbackSection
Comprehensive feedback view for players on their dashboard:
- Large game controller display with total score
- Breakdown of total ratings and counts
- Expandable comments section (toggle button)
- Individual feedback cards showing:
  - Rating emoji
  - Date of feedback
  - Comment text
- Privacy reminder at bottom

### 4. Games History Page

A dedicated page at `/settings/games-history` that shows all past game sessions and campaigns.

**Features:**
- Shows all past sessions (games and campaigns) sorted by date
- For players: Shows "Rate Host" button on sessions they participated in
- For hosts: Shows "Rate Players" button with expandable list of all players in the session
- Clicking "Rate Players" loads player information and displays inline rating buttons
- Reuses existing game session card component for consistency
- Integrates with both HostFeedbackDialog and PlayerFeedbackDialog

**Navigation:**
- Accessible from Settings page via "View Games History" link
- Listed in the settings menu alongside Profile Settings and Subscriptions

### 5. Integration Points

#### Settings Page (`/settings`)
- Added "Games History" card with link to `/settings/games-history`
- Positioned between Profile Settings and Subscriptions for easy access

#### User Profile Page (`/user/[userId]`)
- Added PlayerRatingDisplay component below HostRatingDisplay
- Shows both host and player ratings on public profiles
- Labels clearly distinguish between "Host Rating" and "Player Rating"
- Includes detailed breakdown for both rating types

#### Player Dashboard (`/dashboard`)
- Added rating sections showing both host and player feedback stats
- Displays HostFeedbackSection and PlayerFeedbackSection side by side
- Users can view their ratings from both perspectives

#### Host Dashboard (`/host/dashboard`)
- Added PlayerFeedbackSection after HostFeedbackSection
- Hosts can see their ratings as both host and player

#### Games History Page (`/settings/games-history`)
- Dedicated page for viewing and rating past sessions
- Shows all past games and campaigns
- Provides inline rating interface for both hosts and players

### 6. User Experience Flow

**For Hosts Rating Players:**
1. Complete a game session or campaign as a host
2. Navigate to Settings → Games History
3. Find the completed session
4. Click "Rate Players" button
5. System loads player information for that session
6. Click "Rate" next to each player
7. Select Yes/No/Skip and optionally add comment
8. Submit feedback

**For Players Rating Hosts:**
1. Complete a game session or campaign as a player
2. Navigate to Settings → Games History (or Dashboard)
3. Find the completed session
4. Click "Rate Host" button
5. Select Yes/No/Skip and optionally add comment
6. Submit feedback
7. Button updates to "Update Host Rating"

**Viewing Your Ratings:**
1. Navigate to Dashboard to see rating summary
2. Click to expand feedback comments (if any)
3. View detailed breakdown of ratings
4. See individual comments from hosts/players

**Viewing Others' Ratings:**
1. Visit any user's profile at `/user/[userId]`
2. See both host rating (⭐) and player rating (🎮)
3. See breakdown of ratings
4. Comments remain private

### 7. Privacy & Security

**Privacy Features:**
- Comments only visible to:
  - The person being rated (host or player)
  - System administrators
- Clear messaging to users about comment privacy
- Public scores visible to everyone
- Individual ratings remain anonymous (rater ID not shown in UI)

**Security Measures:**
- Authentication required to submit feedback (via cookies)
- Validation prevents self-rating (hosts can't rate themselves, players can't rate themselves)
- Users can only rate others they've played with (session-based validation)
- Database queries properly filter by user permissions
- Uses MongoDB driver properly to prevent injection vulnerabilities

### 8. Database Functions

**lib/player-feedback/db.ts:**
- `submitPlayerFeedback`: Create or update feedback for a player
- `getPlayerFeedbackStats`: Get public statistics
- `getPlayerFeedbackWithComments`: Get feedback with comments (admin/player only)
- `hasHostSubmittedFeedback`: Check if host already rated a player in a session
- `getMultiplePlayersStats`: Batch fetch stats for multiple players (for optimization)

### 9. Type Definitions

**lib/player-feedback/types.ts:**
- `PlayerFeedbackPayload`: Input data for submitting feedback
- `StoredPlayerFeedback`: Complete feedback record from database
- `PlayerFeedbackStats`: Aggregated statistics for a player

## Technical Details

### Rating Calculation
- **Score = Yes Count - No Count**
- Skip votes don't affect the score but are counted
- Example: 10 yes, 3 no, 2 skip = Score of +7
- Consistent with host rating calculation

### Performance Considerations
- Feedback stats cached on client side during page load
- Batch fetching capability for multiple players
- Lazy loading of player information (only when "Rate Players" is clicked)
- Comments only fetched when player/admin views them
- Games History page loads all sessions once, then filters locally

### Responsive Design
- Mobile-friendly dialogs and components
- Touch-friendly button sizes
- Readable text sizes across devices
- Dark theme consistent with app design
- Grid layout for rating sections on larger screens

### Code Reuse
- Mirrored host feedback system architecture for consistency
- Reused game session card component in Games History page
- Similar UI patterns for both host and player rating dialogs
- Consistent API patterns across all feedback endpoints

## Files Created

**New Files:**
1. `lib/player-feedback/types.ts` - Type definitions for player feedback
2. `lib/player-feedback/db.ts` - Database operations for player feedback
3. `app/api/player-feedback/route.ts` - Submit player feedback endpoint
4. `app/api/player-feedback/stats/[playerId]/route.ts` - Get player stats endpoint
5. `components/PlayerFeedbackDialog.tsx` - Dialog for rating players
6. `components/PlayerRatingDisplay.tsx` - Rating display for profiles
7. `components/PlayerFeedbackSection.tsx` - Feedback view for players
8. `app/settings/games-history/page.tsx` - Dedicated games history page
9. `BIDIRECTIONAL_RATING_SYSTEM.md` - This documentation

**Modified Files:**
1. `app/settings/page.tsx` - Added Games History navigation link
2. `app/user/[userId]/page.tsx` - Added player rating display
3. `app/dashboard/page.tsx` - Added rating sections for host and player feedback
4. `app/host/dashboard/page.tsx` - Added player feedback section

## Usage Examples

### For Hosts
Rate players after a session:
```
1. Go to Settings → Games History
2. Find the completed session
3. Click "Rate Players"
4. Click "Rate" next to each player
5. Choose Yes/No/Skip
6. Optionally add comment
7. Submit
```

### For Players
Rate hosts after a session:
```
1. Go to Settings → Games History (or Dashboard)
2. Find the completed session
3. Click "Rate Host"
4. Choose Yes/No/Skip
5. Optionally add comment
6. Submit
```

### View Your Ratings
```
1. Go to Dashboard
2. View "Host Rating" and "Player Rating" sections
3. Click to expand feedback comments
4. See detailed breakdown
```

### View Others' Ratings
```
1. Visit user profile: /user/[userId]
2. See both host (⭐) and player (🎮) ratings
3. View score and breakdown
4. Comments are private
```

## Future Enhancements (Not Implemented)

Potential improvements that could be added:
1. Email notifications when receiving feedback
2. Trending/recent ratings view
3. Badge system for highly-rated hosts and players
4. Filter feedback by time period
5. Export feedback data
6. Moderation tools for inappropriate comments
7. Statistics dashboard showing rating trends
8. Ability to reply to feedback (private messaging)

## Testing Checklist

Manual testing should cover:
- [ ] Submitting feedback as a host for a player
- [ ] Submitting feedback as a player for a host
- [ ] Viewing ratings on public profiles (both host and player)
- [ ] Viewing feedback on dashboards
- [ ] Privacy of comments (not visible to non-rated-person/admin)
- [ ] Cannot rate yourself
- [ ] Can update existing ratings
- [ ] Games History page loads all past sessions
- [ ] Rate Players button expands to show player list
- [ ] Rate Host button opens dialog
- [ ] Feedback dialogs close after submission
- [ ] Navigation from Settings page works
- [ ] Both ratings display on user profiles
- [ ] Rating sections display on dashboards

## Conclusion

This implementation creates a complete bidirectional rating system that promotes community accountability while protecting user privacy. The simple yes/no/skip system makes it easy for both hosts and players to provide feedback, while the comment system allows for more detailed, private communication. The dedicated Games History page provides a centralized location for viewing past sessions and managing ratings, making it easy for users to engage with the rating system after games conclude.
