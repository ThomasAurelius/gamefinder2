# Campaign DM Notes Feature

## Overview
This feature allows campaign creators (Dungeon Masters) to add private notes to their campaigns. These notes are only visible to the campaign creator and include timestamps.

## Files Added/Modified

### Database Layer
- `lib/campaigns/notes.ts` - Database functions for campaign notes CRUD operations
  - `createCampaignNote()` - Create a new note
  - `getCampaignNotes()` - Get all notes for a campaign
  - `updateCampaignNote()` - Update an existing note
  - `deleteCampaignNote()` - Delete a note

### API Endpoints
- `app/api/campaigns/[id]/route.ts` - Get campaign details
- `app/api/campaigns/[id]/join/route.ts` - Join a campaign
- `app/api/campaigns/[id]/leave/route.ts` - Leave a campaign
- `app/api/campaigns/[id]/notes/route.ts` - GET/POST notes for a campaign
- `app/api/campaigns/[id]/notes/[noteId]/route.ts` - PUT/DELETE individual notes

### UI Components
- `app/campaigns/[id]/page.tsx` - Campaign detail page with tabs
  - Campaign Details tab (for all users)
  - DM Notes tab (only visible to campaign creator)

## Features
1. **Private Notes**: Notes are only visible to the campaign creator
2. **Timestamps**: Each note includes creation and update timestamps
3. **CRUD Operations**: Create, read, and delete notes
4. **Tab Interface**: Clean tab-based UI separating campaign details from notes
5. **Validation**: Server-side validation ensures only campaign creators can manage notes

## Database Schema
Campaign notes are stored in the `campaign_notes` collection with the following structure:
```typescript
{
  _id: ObjectId,
  campaignId: string,
  userId: string,
  content: string,
  createdAt: Date,
  updatedAt: Date
}
```

## Usage
1. Navigate to a campaign detail page at `/campaigns/[id]`
2. If you're the campaign creator, you'll see two tabs:
   - "Campaign Details" - General campaign information
   - "DM Notes" - Private notes section
3. In the DM Notes tab, you can:
   - Add new notes using the text area
   - View all existing notes with timestamps
   - Delete notes you no longer need

## Security
- All note operations require authentication
- Only campaign creators can view, create, or delete notes
- Server-side validation prevents unauthorized access
