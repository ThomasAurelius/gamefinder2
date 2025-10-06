# Quick Start: Admin Role Setup

## Initial Setup

To enable admin features for a user, you need to manually set the `isAdmin` flag in MongoDB:

```javascript
// Connect to your MongoDB database
// Then run this command:

db.users.updateOne(
  { email: "your-admin-email@example.com" },
  { $set: { isAdmin: true } }
)
```

## Admin Capabilities

Once you have admin access and log in, you'll see:

### 1. Settings Page - Announcements
- Navigate to `/settings`
- You'll see an "Admin: Site Announcement" section (amber/yellow colored)
- Create announcements that appear on the homepage
- Toggle them on/off

### 2. Player Profiles - Hide/Show
- Visit any player profile at `/players/[userId]`
- You'll see an "Admin Controls" section at the top
- Click "Hide Profile" to remove them from search results
- Click "Show Profile" to make them visible again

### 3. Game Sessions - Edit/Delete Any
- Visit any game session page
- Even if you didn't create it, you'll see Edit/Delete buttons
- You can modify or remove any game session

## Example Usage

### Creating an Announcement
1. Log in as admin
2. Go to Settings
3. Type your message (e.g., "Site maintenance scheduled for Saturday")
4. Check "Show announcement to users"
5. Click "Save Announcement"
6. Visit homepage in incognito to see the popup

### Hiding a Problem Profile
1. Log in as admin
2. Go to Players page and find the user
3. Click on their profile
4. In the "Admin Controls" section, click "Hide Profile"
5. The user won't appear in search results anymore

### Deleting Inappropriate Game Session
1. Log in as admin
2. Navigate to the game session
3. Click "Delete" button
4. Confirm deletion

## Important Notes

- **Admin status is permanent** - Only set for trusted users
- **No audit log yet** - Admin actions aren't tracked (future enhancement)
- **Hidden users can still log in** - They just won't appear in searches
- **Announcements persist** - They show until you disable or update them

## Security Considerations

- Never share admin credentials
- Admin flag can only be set in database (not through UI or API)
- Consider creating a dedicated admin email/account
- Test admin features in a development environment first
