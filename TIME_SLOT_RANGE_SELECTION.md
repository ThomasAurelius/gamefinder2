# Time Slot Range Selection Feature

## Overview
This feature allows users to quickly select multiple consecutive time slots by using Shift+Click, making it much faster to set availability and game times.

## How to Use

### Basic Selection
- Click on any time slot to select or deselect it individually

### Range Selection
1. Click on a time slot (this becomes your "anchor" slot)
2. Hold the **Shift** key
3. Click on another time slot
4. All time slots between the two clicks (inclusive) will be selected

### Range Deselection
- If all slots in a range are already selected, Shift+Click will deselect the entire range
- This provides a quick way to clear a block of selected times

## Implementation

The feature is implemented in three pages:
- **Profile Page** (`app/profile/page.tsx`) - For setting weekly availability
- **Post Game Page** (`app/post/page.tsx`) - For selecting game session times
- **Find Games Page** (`app/find/page.tsx`) - For filtering by preferred times

## Technical Details

Each page tracks:
- The currently selected time slots
- The last clicked slot (used as the anchor for range selection)

When Shift+Click is detected:
1. The system finds the indices of both the anchor and the newly clicked slot in the TIME_SLOTS array
2. It determines the min and max indices to create the range
3. It checks if all slots in that range are already selected
4. If all are selected, it deselects them; otherwise, it selects all slots in the range

## Benefits
- **Speed**: Select 6+ hours in just 2 clicks instead of 6+ individual clicks
- **Convenience**: Works bidirectionally (forward or backward in time)
- **Intuitive**: Uses the familiar Shift+Click pattern from file managers and other applications
- **Smart**: Automatically handles toggling between select and deselect based on current state
