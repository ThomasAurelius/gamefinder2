# Avatar Cropping Feature

## Overview

This document describes the avatar cropping feature that allows users to reposition and adjust their avatar images before uploading them to their profile.

## Implementation

### Components

#### AvatarCropper Component (`components/AvatarCropper.tsx`)

A modal component that provides an interactive image cropping interface with the following features:

- **Drag to Reposition**: Users can click and drag the image to adjust what part of the image appears in the circular crop area
- **Zoom Control**: A slider (1x - 3x) allows users to zoom in/out on their image
- **Circular Crop**: The crop area is circular to match the avatar display format
- **Real-time Preview**: Users see exactly what their avatar will look like as they adjust it

**Props:**
- `imageSrc` (string): The source URL or data URL of the image to crop
- `onCropComplete` (function): Callback that receives the cropped image as a Blob
- `onCancel` (function): Callback when the user cancels cropping

### Integration in Profile Page

The avatar cropping feature has been integrated into `/app/profile/page.tsx`:

1. When a user selects an image via the file input, the image is loaded into memory as a data URL
2. The `AvatarCropper` modal opens automatically, displaying the selected image
3. The user can:
   - Drag the image to reposition it
   - Use the zoom slider to adjust the zoom level (1.0x to 3.0x)
   - Click "Save" to confirm the crop
   - Click "Cancel" to discard and select a different image
4. When "Save" is clicked:
   - The cropped area is extracted and converted to a JPEG blob
   - The blob is uploaded to Firebase Storage via the `/api/upload` endpoint
   - The resulting URL is saved to the user's profile

## Technical Details

### Dependencies

- **react-easy-crop**: A React component for image cropping with zoom and drag functionality
  - Lightweight and performant
  - Built-in support for circular crops
  - Touch-friendly for mobile devices

### Image Processing

The cropping process:

1. User uploads an image file
2. File is read as a data URL using `FileReader`
3. `react-easy-crop` provides the crop coordinates and dimensions
4. When saving, a canvas element is created with the dimensions of the crop area
5. The cropped portion of the image is drawn onto the canvas
6. Canvas is converted to a Blob with JPEG format (95% quality)
7. Blob is uploaded to Firebase Storage

### User Experience

- **Modal Overlay**: The cropper appears as a full-screen modal with a dark backdrop
- **Visual Feedback**: 
  - Zoom level is displayed (e.g., "Zoom: 2.0x")
  - The circular crop area has a visible border
  - The area outside the crop is dimmed
- **Responsive**: Works on desktop and mobile devices
- **Performance**: Image processing happens client-side, no server processing needed

## Usage Example

```tsx
import AvatarCropper from "@/components/AvatarCropper";

const [imageToCrop, setImageToCrop] = useState<string | null>(null);

const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = () => {
    setImageToCrop(reader.result as string);
  };
  reader.readAsDataURL(file);
};

const handleCropComplete = async (croppedBlob: Blob) => {
  // Upload the cropped image
  const formData = new FormData();
  formData.append("file", croppedBlob, "avatar.jpg");
  // ... upload logic
  
  setImageToCrop(null);
};

return (
  <>
    {imageToCrop && (
      <AvatarCropper
        imageSrc={imageToCrop}
        onCropComplete={handleCropComplete}
        onCancel={() => setImageToCrop(null)}
      />
    )}
    <input type="file" onChange={handleFileSelect} />
  </>
);
```

## Benefits

1. **Better User Control**: Users can frame their images exactly how they want
2. **Consistent Output**: All avatars are cropped to the same aspect ratio (1:1)
3. **Reduced Storage**: Only the relevant portion of the image is uploaded
4. **Improved UX**: Users can see the final result before uploading
5. **Professional Look**: Circular avatars look polished and consistent across the site

## Future Enhancements

Potential improvements for future iterations:

- Add rotation controls
- Support for different crop shapes (square, rounded square)
- Image filters (brightness, contrast, saturation)
- Upload progress indicator during cropping process
- Multiple crop presets (close-up, full body, etc.)
- Ability to re-crop existing avatars
