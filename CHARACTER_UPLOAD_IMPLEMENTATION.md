# Character Sheet Upload Implementation

## Overview
Extended character sheet upload functionality to support PDF and image files for Pathfinder, Shadowdark, and Other game systems, in addition to the existing D&D and Starfinder support.

## Changes Made

### 1. API Route Updates (`app/api/upload-pdf/route.ts`)
- **Extended file type support**: Added support for image files (JPEG, PNG, WebP, GIF) in addition to PDFs
- **Updated ALLOWED_TYPES**: Now includes `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- **Updated error messages**: Reflects support for both PDF and image files
- **Maintained file size limit**: 10MB per file, maximum 3 files per upload

### 2. Character Page Updates (`app/characters/page.tsx`)

#### Upload Section
- **Extended system support**: File upload now available for:
  - D&D 5e
  - Starfinder
  - Pathfinder 2e (NEW)
  - Shadowdark (NEW)
  - Other/Custom (NEW)
  
- **Updated UI text**: Changed from system-specific instructions to generic character sheet upload instructions
- **Updated file input**: Changed `accept` attribute from `application/pdf` only to `application/pdf,image/jpeg,image/png,image/webp,image/gif`
- **Updated validation**: Extended file type validation to check for both PDF and image files

#### Display Section
- **Removed system restrictions**: Character sheets and Demiplane links now display for ALL systems
- **Consistent display**: Both the main character list and the "Current Values" editing section show uploaded files regardless of game system

#### Demiplane Integration
- **Extended availability**: Demiplane URL field now available for all game systems (previously limited to D&D and Starfinder)
- **Updated placeholder text**: Generic placeholder instead of system-specific examples

## Features

### Multi-Page Support
- PDFs inherently support multiple pages
- Multiple files can be uploaded (up to 3) to represent different sheets or pages
- Each uploaded file is displayed as a separate link with numbering (e.g., "Character Sheet 1", "Character Sheet 2")

### File Type Support
- **PDF**: For official character sheets exported from digital tools
- **JPEG/JPG**: For photographed or scanned sheets
- **PNG**: For screenshots or digital exports
- **WebP**: For modern, optimized web images
- **GIF**: For animated or legacy image formats

### User Experience
- Upload button clearly indicates file types accepted
- File size and count limits are displayed
- Error messages provide clear feedback for validation failures
- Uploaded files can be previewed via links and removed before saving
- When files are uploaded, only Name, Campaign, and Avatar fields remain editable (simplifies form)

## Technical Details

### Storage
- Files are stored in Firebase Storage under `character-sheets/{userId}/{filename}`
- Filenames are UUID-based to prevent conflicts
- Original file extensions are preserved

### Validation
- Client-side validation for file type and count
- Server-side validation for file type, size, and count
- Maximum 3 files per character
- Maximum 10MB per file

### Database
- Character data model already included `pdfUrls?: string[]` field
- No schema changes required
- Field name remains `pdfUrls` even though it now stores both PDF and image URLs

## Testing Recommendations

1. **File Upload Testing**:
   - Upload single PDF file
   - Upload multiple PDF files (up to 3)
   - Upload single image file (JPEG, PNG, WebP, GIF)
   - Upload multiple image files
   - Upload mixed PDF and image files
   - Attempt to upload more than 3 files (should show error)
   - Attempt to upload files larger than 10MB (should show error)
   - Attempt to upload unsupported file types (should show error)

2. **System Testing**:
   - Test file upload for each game system (Pathfinder, Shadowdark, Other, D&D, Starfinder)
   - Verify files display correctly after upload
   - Verify files persist after character is saved
   - Verify files display in both editing and viewing modes

3. **Edge Cases**:
   - Upload files, then remove them before saving
   - Upload files for a character, save, then edit and upload different files
   - Verify file links open correctly in new tab
   - Test with slow network connections

## Future Enhancements (Not Implemented)

- Image preview/thumbnail generation
- PDF preview within the app
- Drag-and-drop file upload
- File compression for large images
- OCR support to extract character data from uploaded sheets
- Direct image annotation/editing
