# Host Feedback System Implementation

## Overview
This feature allows players to rate their hosts after completing a game session or campaign with a simple "Would you recommend this host to other players" system. The rating is tracked with yes/no responses and an optional skip option. Players can also leave private comments that only the host and admins can see.

## Features Implemented

### 1. Database Schema
Created a new collection `hostFeedback` with the following structure:

**Fields:**
- `id` (string): Unique identifier for the feedback
- `playerId` (string): User ID of the player who gave the feedback
- `hostId` (string): User ID of the host being rated
- `sessionId` (string): Game or campaign session ID
- `sessionType` ("game" | "campaign"): Type of session
- `recommend` ("yes" | "no" | "skip"): Rating choice
- `comment` (string, optional): Private comment visible only to host and admins
- `createdAt` (string): Timestamp of when feedback was submitted

**Stats Calculation:**
- `score`: yesCount - noCount (displayed as a number with + or - prefix)
- Total ratings count
- Individual counts for yes, no, and skip responses

### 2. API Endpoints

#### POST `/api/host-feedback`
- **Purpose**: Submit or update feedback for a host
- **Authentication**: Required (user must be logged in)
- **Request Body**: 
  ```json
  {
    "hostId": "string",
    "sessionId": "string",
    "sessionType": "game" | "campaign",
    "recommend": "yes" | "no" | "skip",
    "comment": "string (optional)"
  }
  ```
- **Response**: Returns the created/updated feedback object
- **Validation**: Prevents players from rating themselves

#### GET `/api/host-feedback/stats/[hostId]`
- **Purpose**: Get feedback statistics for a specific host
- **Authentication**: Optional (affects whether comments are included)
- **Response**: 
  - Public view: Basic stats (score, counts)
  - Host/Admin view: Stats + all feedback comments
- **Access Control**: Comments only visible to the host being rated or admins

#### GET `/api/auth/me`
- **Purpose**: Get current user's ID and admin status
- **Authentication**: Required
- **Response**: `{ userId: string, isAdmin: boolean }`

### 3. UI Components

#### HostFeedbackDialog
A modal dialog that allows players to rate hosts:
- Three choice buttons: Yes (👍), No (👎), Skip (⏭️)
- Optional comment textarea with privacy notice
- Visual feedback on selection
- Submit and cancel buttons
- Error handling and loading states

**Features:**
- Updates existing ratings if player has already rated
- Clear privacy messaging: "Only the host and admins can see your comments"
- Responsive design matching the app's dark theme

#### HostRatingDisplay
Displays host rating on public profiles:
- Shows star emoji (⭐) with score number
- Color-coded score (green for positive, red for negative, gray for neutral)
- Optional detailed view showing breakdown of yes/no/skip counts
- "No ratings yet" message for hosts without ratings
- Loading state while fetching data

#### HostFeedbackSection
Comprehensive feedback view for hosts on their dashboard:
- Large star display with total score
- Breakdown of total ratings and counts
- Expandable comments section (toggle button)
- Individual feedback cards showing:
  - Rating emoji
  - Date of feedback
  - Comment text
- Privacy reminder at bottom

### 4. Integration Points

#### User Profile Page (`/user/[userId]`)
- Added HostRatingDisplay component below location
- Shows rating to all visitors
- Includes detailed breakdown (yes/no/skip counts)

#### Host Dashboard (`/host/dashboard`)
- Added HostFeedbackSection after Quick Actions
- Only visible to authenticated users on their own dashboard
- Shows all feedback with comments
- Expandable comments section

#### Player Dashboard (`/dashboard`)
- Enhanced GameSessionCard component to detect past sessions
- Added "Rate Host" button for past sessions where user was a player
- Opens HostFeedbackDialog when clicked
- Shows "Update Rating" if already rated
- Added collapsible "Past Sessions" section
- Past sessions marked with "Past" badge

### 5. User Experience Flow

**For Players:**
1. Complete a game session or campaign as a player
2. Navigate to dashboard
3. Expand "Past Sessions" section
4. Click "Rate Host" button on completed session
5. Select Yes/No/Skip and optionally add comment
6. Submit feedback
7. Button updates to "Update Rating"

**For Hosts:**
1. Navigate to Host Dashboard
2. View Host Rating section
3. See overall score and rating counts
4. Click to expand feedback comments
5. Read individual feedback with dates
6. View ratings on public profile at `/user/[userId]`

**For Public Users:**
1. View any user's profile at `/user/[userId]`
2. See host rating (star and score)
3. See breakdown of ratings (if detailed view enabled)
4. Comments remain private

### 6. Privacy & Security

**Privacy Features:**
- Comments only visible to:
  - The host being rated
  - System administrators
- Clear messaging to users about comment privacy
- Public score visible to everyone
- Individual ratings remain anonymous (player ID not shown in UI)

**Security Measures:**
- Authentication required to submit feedback
- Validation prevents self-rating
- Users can only rate hosts they've played with
- Database queries properly filter by user permissions
- No SQL injection vulnerabilities (using MongoDB driver properly)

### 7. Database Functions

**lib/host-feedback/db.ts:**
- `submitHostFeedback`: Create or update feedback
- `getHostFeedbackStats`: Get public statistics
- `getHostFeedbackWithComments`: Get feedback with comments (admin/host only)
- `hasPlayerSubmittedFeedback`: Check if player already rated
- `getMultipleHostsStats`: Batch fetch stats for multiple hosts (for optimization)

### 8. Type Definitions

**lib/host-feedback/types.ts:**
- `HostFeedbackPayload`: Input data for submitting feedback
- `StoredHostFeedback`: Complete feedback record from database
- `HostFeedbackStats`: Aggregated statistics for a host

## Technical Details

### Rating Calculation
- **Score = Yes Count - No Count**
- Skip votes don't affect the score but are counted
- Example: 10 yes, 3 no, 2 skip = Score of +7

### Performance Considerations
- Feedback stats cached on client side during page load
- Batch fetching capability for multiple hosts
- Lazy loading of past sessions (collapsed by default)
- Comments only fetched when host/admin views them

### Responsive Design
- Mobile-friendly dialog and components
- Touch-friendly button sizes
- Readable text sizes across devices
- Dark theme consistent with app design

## Future Enhancements (Not Implemented)

Potential improvements that could be added:
1. Email notification to host when they receive feedback
2. Prevent duplicate ratings by tracking more granularly
3. Add trending/recent ratings view
4. Badge system for highly-rated hosts
5. Filter feedback by time period
6. Export feedback data for hosts
7. Anonymous feedback option
8. Moderation tools for inappropriate comments

## Testing

The system includes:
- Input validation at API level
- Authentication checks
- Permission-based access control
- Error handling throughout the flow
- Loading states for all async operations

Manual testing should cover:
- [ ] Submitting feedback as a player
- [ ] Viewing ratings on public profiles
- [ ] Viewing feedback on host dashboard
- [ ] Privacy of comments (not visible to non-host/admin)
- [ ] Cannot rate yourself
- [ ] Can update existing ratings
- [ ] Past sessions show rate button
- [ ] Feedback dialog closes after submission

## Files Created/Modified

**New Files:**
- `lib/host-feedback/types.ts` - Type definitions
- `lib/host-feedback/db.ts` - Database operations
- `app/api/host-feedback/route.ts` - Submit feedback endpoint
- `app/api/host-feedback/stats/[hostId]/route.ts` - Get stats endpoint
- `app/api/auth/me/route.ts` - Get current user endpoint
- `components/HostFeedbackDialog.tsx` - Feedback submission UI
- `components/HostRatingDisplay.tsx` - Rating display for profiles
- `components/HostFeedbackSection.tsx` - Feedback view for hosts
- `HOST_FEEDBACK_SYSTEM.md` - This documentation

**Modified Files:**
- `app/user/[userId]/page.tsx` - Added rating display
- `app/host/dashboard/page.tsx` - Added feedback section
- `app/dashboard/page.tsx` - Added past sessions and rate buttons

## Usage Examples

### For Players
After playing a session, rate the host:
```
1. Go to Dashboard
2. Expand "Past Sessions"
3. Find the completed session
4. Click "Rate Host"
5. Choose Yes/No/Skip
6. Optionally add comment
7. Submit
```

### For Hosts
View your ratings:
```
1. Go to Host Dashboard
2. View "Host Rating" section
3. See your score and stats
4. Click "View feedback comments" to see details
```

### For Anyone
View a host's rating:
```
1. Visit user profile: /user/[userId]
2. See star rating below their name
3. View score and breakdown
```

## Conclusion

This implementation provides a complete host feedback system that encourages community accountability while protecting user privacy. The simple yes/no/skip system makes it easy for players to provide feedback, while the comment system allows for more detailed, private communication between players and hosts.
