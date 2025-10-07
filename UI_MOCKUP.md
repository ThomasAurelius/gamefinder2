# Campaign DM Notes - UI Overview

## Page Layout

When a campaign creator visits `/campaigns/[id]`, they see:

```
┌─────────────────────────────────────────────────────────┐
│ ← Back to campaigns                                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Campaign Name                              [Image]    │
│  Date: March 15, 2024                                  │
│  Times: 6:00 PM - 9:00 PM                              │
│  Location: Seattle, WA                                 │
│  Players: 3/5                                          │
│  Waitlist: 2                                           │
│                                                         │
│  Description: An epic adventure awaits...              │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Campaign Details  │  DM Notes                          │
│ ═══════════════════════════════════════════════════════ │
│                                                         │
│  DM Notes                                              │
│  Private notes visible only to you as the campaign    │
│  creator.                                              │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Add a new note...                                 │ │
│  │                                                   │ │
│  │                                                   │ │
│  └───────────────────────────────────────────────────┘ │
│  [Add Note]                                            │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Remember to prepare encounter maps for session 5 │ │
│  │ January 15, 2024, 3:45 PM               [Delete] │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Player preferences:                               │ │
│  │ - John prefers roleplay-heavy sessions            │ │
│  │ - Sarah loves combat                              │ │
│  │ January 10, 2024, 10:30 AM              [Delete] │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Features Demonstrated

1. **Tab Navigation**: Two tabs - "Campaign Details" and "DM Notes"
2. **Add Note Form**: Textarea with "Add Note" button
3. **Note List**: Each note shows:
   - Content (supports multi-line text)
   - Timestamp (automatically generated)
   - Delete button (for cleanup)
4. **Empty State**: "No notes yet. Add your first note above."
5. **Visibility**: Only the campaign creator sees the DM Notes tab

## User Flow

1. Campaign creator navigates to `/campaigns/[campaign-id]`
2. They see two tabs (non-creators only see Campaign Details)
3. Click "DM Notes" tab
4. Type note in textarea
5. Click "Add Note"
6. Note appears in the list below with timestamp
7. Can delete notes using the Delete button

## Security

- Backend validates that only campaign creators can:
  - View notes (GET)
  - Create notes (POST)
  - Delete notes (DELETE)
- Non-creators attempting API access get 403 Forbidden
