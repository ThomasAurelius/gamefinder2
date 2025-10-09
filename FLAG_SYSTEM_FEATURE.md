# Flag System Implementation

## Overview
Implemented a comprehensive content flagging system for Tall Tales that allows users to report inappropriate content and provides admins with tools to review and manage these flags.

## Features

### User-Facing Features
1. **Flag Button**: Each tale displays a flag button in the top-right corner
2. **Flag Modal**: Users can report content by selecting:
   - **Reason**: Off-topic, Inappropriate, Spam, or Other
   - **Comments**: Optional additional context for the report
3. **Confirmation**: Success message after submitting a flag

### Admin Features
1. **Admin Dashboard Card**: Located in the Settings page (only visible to admins)
2. **Flag Review Interface**: Shows all unresolved flags with:
   - Tale title and preview
   - Flag reason
   - Reporter name
   - Optional comments
   - Tale content preview
3. **Resolution Actions**:
   - **Allow**: Marks the flag as resolved, content remains visible
   - **Delete**: Soft-deletes the content and marks the flag as resolved

## Database Schema

### ContentFlag Collection
```typescript
{
  id: string;              // UUID
  taleId: string;          // Reference to the tale
  flaggedBy: string;       // User ID of reporter
  flagReason: "offtopic" | "inappropriate" | "spam" | "other";
  flagComment?: string;    // Optional details
  flaggedAt: Date;         // Timestamp
  resolvedAt?: Date;       // When admin took action
  resolvedBy?: string;     // Admin user ID
  resolution?: "allowed" | "deleted";
}
```

### Updated TallTale Schema
```typescript
{
  // ... existing fields
  isDeleted?: boolean;     // Soft delete flag
  deletedAt?: Date;        // When deleted
  deletedBy?: string;      // Admin who deleted
}
```

## API Endpoints

### POST /api/tall-tales/[id]/flag
Flag a tale for review.

**Authentication**: Required

**Request Body**:
```json
{
  "flagReason": "spam",
  "flagComment": "This looks like promotional content"
}
```

**Response** (201):
```json
{
  "message": "Content flagged successfully",
  "flagId": "uuid"
}
```

### GET /api/admin/flags
List all unresolved flags (admin only).

**Authentication**: Required (Admin)

**Response** (200):
```json
[
  {
    "id": "flag-uuid",
    "taleId": "tale-uuid",
    "flaggedBy": "user-id",
    "flaggerName": "John Doe",
    "flagReason": "spam",
    "flagComment": "Promotional content",
    "flaggedAt": "2024-01-15T10:30:00Z",
    "tale": {
      "id": "tale-uuid",
      "title": "Tale Title",
      "content": "Tale content...",
      "userId": "author-id"
    }
  }
]
```

### POST /api/admin/flags
Resolve a flag (admin only).

**Authentication**: Required (Admin)

**Request Body**:
```json
{
  "flagId": "flag-uuid",
  "taleId": "tale-uuid",
  "action": "delete"  // or "allow"
}
```

**Response** (200):
```json
{
  "message": "Flag resolved and content deleted"
}
```

## Soft Delete Implementation

When an admin chooses to delete flagged content:
1. The tale's `isDeleted` field is set to `true`
2. The `deletedAt` timestamp is recorded
3. The `deletedBy` field stores the admin's user ID
4. The tale is filtered out of `listTallTales()` queries
5. The content remains in the database for record-keeping

## UI Components

### Flag Button
- Location: Top-right of each tale card
- Icon: Flag SVG
- Hover: Red highlight indicating warning action
- Click: Opens flag modal

### Flag Modal
- Centered overlay with backdrop
- Dropdown for selecting reason
- Textarea for optional comments
- Cancel and Submit buttons
- Success/error messages

### Admin Dashboard Card
- Location: Settings page (below announcements card)
- Amber-themed styling to indicate admin feature
- Automatic loading of unresolved flags
- Each flag shows:
  - Tale title
  - Flag reason (highlighted)
  - Reporter name
  - Comments (if provided)
  - Content preview (truncated)
  - Allow/Delete action buttons

## Security Features

1. **Authentication**: All endpoints require user authentication
2. **Authorization**: Admin endpoints check `isAdmin` status
3. **Ownership Validation**: Users can only flag content, not delete it
4. **Soft Deletes**: No permanent data loss, admin actions are auditable
5. **Input Validation**: Flag reasons are validated against allowed values

## Usage Guidelines

### For Users
1. Navigate to Tall Tales page
2. Click flag button on any tale
3. Select reason and optionally add comments
4. Submit report
5. Admins will review within 24-48 hours

### For Admins
1. Navigate to Settings page
2. Scroll to "Admin: Content Flags" section
3. Review flagged content details
4. Choose action:
   - **Allow**: If the flag is incorrect or content is acceptable
   - **Delete**: If the content violates guidelines
5. Flag is automatically resolved and removed from the list

## Future Enhancements

- Email notifications to admins when content is flagged
- User notification when their content is deleted
- Appeal system for deleted content
- Flag history tracking
- Duplicate flag detection (multiple reports on same content)
- Auto-hide content after threshold of flags
- Temporary suspension system for repeat offenders
