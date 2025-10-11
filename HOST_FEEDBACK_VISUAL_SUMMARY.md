# Host Feedback System - Visual Summary

## User Interface Components

### 1. Feedback Dialog (HostFeedbackDialog)
**Location**: Appears as a modal when "Rate Host" is clicked

**Visual Elements**:
```
╔════════════════════════════════════════╗
║          Rate Your Host                ║
║                                        ║
║  Would you recommend [Host Name]      ║
║  to other players?                     ║
║                                        ║
║  ┌──────────────────────────────────┐ ║
║  │ 👍  Yes                          │ ║
║  │     I'd recommend this host      │ ║
║  └──────────────────────────────────┘ ║
║                                        ║
║  ┌──────────────────────────────────┐ ║
║  │ 👎  No                           │ ║
║  │     I wouldn't recommend host    │ ║
║  └──────────────────────────────────┘ ║
║                                        ║
║  ┌──────────────────────────────────┐ ║
║  │ ⏭️  Skip                          │ ║
║  │     I prefer not to answer       │ ║
║  └──────────────────────────────────┘ ║
║                                        ║
║  Comments (Optional)                  ║
║  Only the host and admins can see     ║
║  ┌──────────────────────────────────┐ ║
║  │ Share your feedback...           │ ║
║  │                                  │ ║
║  │                                  │ ║
║  └──────────────────────────────────┘ ║
║                                        ║
║  [Cancel]  [Submit Feedback]          ║
╚════════════════════════════════════════╝
```

**Behavior**:
- Selected option highlights with colored border and background
- Submit button only enabled when an option is selected
- Comment field is optional
- Error messages appear below the comment field if submission fails

---

### 2. Host Rating Display (HostRatingDisplay)
**Location**: User profile page below location info

**Visual Variants**:

**With Ratings** (Positive Score):
```
⭐ +7    (10 👍 / 3 👎 / 2 ⏭️)
```

**With Ratings** (Negative Score):
```
⭐ -2    (3 👍 / 5 👎 / 1 ⏭️)
```

**No Ratings Yet**:
```
⭐ No ratings yet
```

**Color Coding**:
- **Green** (+7, +3, etc.) - Positive ratings
- **Red** (-2, -5, etc.) - Negative ratings
- **Gray** (0) - Neutral or no ratings

---

### 3. Host Feedback Section (HostFeedbackSection)
**Location**: Host Dashboard, after Quick Actions section

**Visual Layout**:
```
╔═══════════════════════════════════════════════════╗
║  Host Rating                                      ║
║                                                   ║
║  ⭐ +7                                            ║
║                                                   ║
║  12 total ratings                                 ║
║  10 👍  3 👎  2 ⏭️                                 ║
║                                                   ║
║  ▾ View feedback comments (8)                     ║
║                                                   ║
║  ┌─────────────────────────────────────────────┐ ║
║  │ 👍  Jan 15, 2025                            │ ║
║  │                                             │ ║
║  │ Great host! Very organized and welcoming.   │ ║
║  │ Made sure everyone had fun.                 │ ║
║  └─────────────────────────────────────────────┘ ║
║                                                   ║
║  ┌─────────────────────────────────────────────┐ ║
║  │ 👍  Jan 12, 2025                            │ ║
║  │                                             │ ║
║  │ Excellent DM, great storytelling!           │ ║
║  └─────────────────────────────────────────────┘ ║
║                                                   ║
║  Only you and admins can see feedback comments   ║
╚═══════════════════════════════════════════════════╝
```

**Features**:
- Large score display at top
- Collapsible comments section (click to expand/collapse)
- Individual feedback cards with emoji, date, and comment
- Privacy notice at bottom
- Only shows feedback with comments

---

### 4. Past Sessions in Dashboard
**Location**: Player Dashboard, new section below upcoming sessions

**Visual Layout**:
```
╔═══════════════════════════════════════════════════════╗
║  Past Sessions                           Show (5) ▾   ║
║  Rate your hosts and review past games                ║
║                                                       ║
║  ┌─────────────────────────────────────────────────┐ ║
║  │ Dungeons & Dragons  [Campaign] [Past] [Playing] │ ║
║  │                                                 │ ║
║  │ Host: John Smith                                │ ║
║  │ Date: Jan 10, 2025 at 7:00 PM                   │ ║
║  │                                                 │ ║
║  │ [Rate Host]                                     │ ║
║  └─────────────────────────────────────────────────┘ ║
║                                                       ║
║  ┌─────────────────────────────────────────────────┐ ║
║  │ Call of Cthulhu  [Game] [Past] [Playing]       │ ║
║  │                                                 │ ║
║  │ Host: Jane Doe                                  │ ║
║  │ Date: Jan 5, 2025 at 6:00 PM                    │ ║
║  │                                                 │ ║
║  │ [Update Rating]                                 │ ║
║  └─────────────────────────────────────────────────┘ ║
╚═══════════════════════════════════════════════════════╝
```

**Features**:
- Collapsible section (click header to expand/collapse)
- Shows count of past sessions in header
- "Rate Host" button for unrated sessions
- "Update Rating" button for already-rated sessions
- Only shows for sessions where user was a player (not host)

---

### 5. User Profile Page Integration
**Location**: `/user/[userId]` page, below bio and above favorite games

**Before** (without feedback system):
```
┌─────────────────────────────────────┐
│  [Avatar]  John Smith               │
│            Seattle, WA               │
│                                     │
│  Bio text here...                   │
└─────────────────────────────────────┘

Favorite Games
[Dungeons & Dragons] [Call of Cthulhu]
```

**After** (with feedback system):
```
┌─────────────────────────────────────┐
│  [Avatar]  John Smith               │
│            Seattle, WA               │
│            ⭐ +7 (10👍 / 3👎 / 2⏭️) │  ← NEW
│                                     │
│  Bio text here...                   │
└─────────────────────────────────────┘

Favorite Games
[Dungeons & Dragons] [Call of Cthulhu]
```

---

## Color Scheme & Styling

### Consistent with App Theme
All components use the existing dark theme:
- **Background**: `bg-slate-900/40`, `bg-slate-950/40`
- **Borders**: `border-slate-800`, `border-slate-700`
- **Text**: `text-slate-100` (primary), `text-slate-400` (secondary)
- **Accent**: `text-sky-400`, `bg-sky-600` (buttons)

### Feedback-Specific Colors
- **Positive (Yes)**: Green highlights (`bg-green-500/20`, `text-green-400`)
- **Negative (No)**: Red highlights (`bg-red-500/20`, `text-red-400`)
- **Neutral (Skip)**: Gray highlights (`bg-slate-500/20`, `text-slate-400`)

### Button States
- **Default**: Gray with slate borders
- **Hover**: Lighter border and background
- **Selected**: Colored border and background tint
- **Disabled**: Reduced opacity (0.5)

---

## Responsive Design

### Mobile View
- Dialog takes full width on small screens
- Buttons stack vertically if needed
- Text sizes adjust for readability
- Touch-friendly button sizes (minimum 44px height)

### Desktop View
- Dialog is centered and max-width constrained
- Feedback cards show in single column
- Side-by-side layouts for dashboard sections
- Hover states for interactive elements

---

## Accessibility Features

### Screen Readers
- Proper ARIA labels on all interactive elements
- Semantic HTML structure
- Alt text for meaningful emojis (delivered via aria-label)

### Keyboard Navigation
- Tab order follows logical flow
- Enter/Space to submit forms
- Escape to close dialog
- Focus indicators visible

### Visual Clarity
- High contrast text (WCAG AA compliant)
- Clear button states
- Loading indicators for async operations
- Error messages are prominent and clear

---

## User Flow Diagrams

### Rating Flow
```
Player Dashboard
       ↓
Expand Past Sessions
       ↓
Click "Rate Host"
       ↓
Feedback Dialog Opens
       ↓
Select Yes/No/Skip
       ↓
(Optional) Add Comment
       ↓
Submit Feedback
       ↓
Success → Dialog Closes
       ↓
Button Updates to "Update Rating"
```

### Host Viewing Flow
```
Host Dashboard
       ↓
Scroll to Host Rating Section
       ↓
View Score & Stats
       ↓
Click "View feedback comments"
       ↓
Expand Comments Section
       ↓
Read Individual Feedback
       ↓
(Optional) Click "Hide" to Collapse
```

### Public Viewing Flow
```
Find User Profile
       ↓
Navigate to /user/[userId]
       ↓
View Host Rating Below Name
       ↓
See Score & Breakdown
       ↓
(Comments Not Visible)
```

---

## Edge Cases Handled

### UI Considerations
- **No ratings yet**: Shows friendly message
- **Loading states**: Displays "Loading..." while fetching
- **Error states**: Shows error message in red
- **Long comments**: Properly wrapped and scrollable
- **Many ratings**: Scrollable feedback list
- **Zero score**: Shows "0" without + or -

### Functional Safeguards
- Can't rate yourself (validated server-side)
- Must be logged in to rate
- Can update existing ratings
- Comments truncated if too long (client-side)
- Invalid session IDs handled gracefully

---

## Summary

The host feedback system provides a clean, intuitive interface for:
- **Players**: Easy rating submission with clear privacy messaging
- **Hosts**: Comprehensive feedback view with all comments
- **Public**: Transparent score display for community trust

All components follow the app's design system and are fully responsive across devices.
