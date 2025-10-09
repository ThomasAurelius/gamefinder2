# Tall Tales Feature Implementation

## Overview
The Tall Tales feature allows users to share campaign stories, memorable game moments, and boardgame-related content with the community. This is similar to a social media post feature, with support for rich text (Markdown) and image uploads.

## User Flow
1. User navigates to `/tall-tales` via the navbar link
2. On first visit, a disclaimer popup explains the purpose and guidelines
3. User fills out the form with:
   - Title (required)
   - Story content (required, max 5000 characters, Markdown supported)
   - Images (optional, up to 5)
4. Character counter shows remaining characters
5. User submits the tale
6. Tale appears in the "Recent Tales" list below the form

## Key Features
- ✅ Markdown support for rich text formatting
- ✅ Character counter (5000 char limit)
- ✅ Image uploads (up to 5 per post)
- ✅ Disclaimer popup (shown once per user)
- ✅ Authentication required for posting
- ✅ Display all tales with author information
- ✅ **Content flagging system** (see [FLAG_SYSTEM_FEATURE.md](FLAG_SYSTEM_FEATURE.md))
- ✅ **Admin moderation dashboard**

## API Endpoints

### GET /api/tall-tales
Returns all tall tales with author information.

**Response:**
```json
[
  {
    "id": "uuid",
    "userId": "userId",
    "title": "Tale Title",
    "content": "Tale content...",
    "imageUrls": ["url1", "url2"],
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z",
    "authorName": "Author Name",
    "authorAvatarUrl": "avatar-url"
  }
]
```

### POST /api/tall-tales
Creates a new tall tale. Requires authentication.

**Request:**
```json
{
  "title": "Tale Title",
  "content": "Tale content...",
  "imageUrls": ["url1", "url2"]
}
```

### GET /api/tall-tales/[id]
Retrieves a specific tall tale.

### PUT /api/tall-tales/[id]
Updates a tall tale. Requires authentication and ownership.

### DELETE /api/tall-tales/[id]
Deletes a tall tale. Requires authentication and ownership.

## Database Schema

Collection: `tallTales`

```typescript
{
  id: string;           // UUID
  userId: string;       // Author's user ID
  title: string;        // Tale title
  content: string;      // Tale content (Markdown)
  imageUrls: string[];  // Array of image URLs
  createdAt: Date;      // Creation timestamp
  updatedAt: Date;      // Last update timestamp
}
```

## Security Features

1. **Authentication**: Required for POST/PUT/DELETE operations
2. **URL Validation**: 
   - Only HTTPS URLs allowed
   - Must be from trusted domains (Firebase Storage)
   - Secure domain matching prevents subdomain bypass
3. **Content Validation**:
   - Title and content are required
   - Content limited to 5000 characters
   - Maximum 5 images per post
4. **XSS Prevention**: Content displayed as plain text
5. **MongoDB Safety**: Update operations exclude immutable _id field
6. **SSR Safety**: localStorage access protected with window check

## Files Structure

```
app/
  tall-tales/
    page.tsx                      # Main page component
  api/
    tall-tales/
      route.ts                    # List/Create endpoints
      [id]/
        route.ts                  # Get/Update/Delete endpoints
    upload/
      route.ts                    # Modified to support "tale" type

components/
  TallTalesDisclaimer.tsx         # Disclaimer popup component
  navbar.tsx                      # Modified to add Tall Tales link

lib/
  tall-tales/
    db.ts                         # Database operations
    types.ts                      # TypeScript types
    validation.ts                 # Validation utilities
```

## Usage Guidelines (From Disclaimer)

Posts should be:
- Relevant to tabletop gaming or boardgames
- Respectful and appropriate for all audiences
- Original content or properly attributed
- Free from spam or promotional material

## Future Enhancements (Not Implemented)

- Full markdown rendering with react-markdown
- Like/comment functionality
- Search and filter capabilities
- User's own tales management page
- Markdown preview in form
- Image gallery view
- Pagination for tales list
