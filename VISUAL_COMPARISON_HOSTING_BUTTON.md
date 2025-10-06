# Visual Comparison - Hosting Button Feature

## Overview
This document shows the visual differences between the "Request to Join" button (for non-hosts) and the new "Hosting this game" button (for hosts) on the Find Games page.

## Button Styling Comparison

### Request to Join Button (Non-Host Users)
**Unchanged - Existing Functionality**

**Colors:**
- Background: `bg-sky-600` (#0284c7)
- Hover: `bg-sky-700` (#0369a1)
- Focus ring: `focus:ring-sky-500` (#0ea5e9)

**State Variants:**
- **Join**: Blue button (`bg-sky-600`)
- **Withdraw**: Red button (`bg-red-600`)
- **Processing**: Disabled with opacity-50

**CSS Classes:**
```css
rounded-lg px-4 py-2 text-sm font-medium text-white transition
focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950
disabled:cursor-not-allowed disabled:opacity-50
bg-sky-600 hover:bg-sky-700 focus:ring-sky-500
```

### Hosting this game Button (Host Users)
**NEW - Purple Theme**

**Colors:**
- Background: `bg-purple-600` (#9333ea)
- Hover: `bg-purple-700` (#7e22ce)
- Focus ring: `focus:ring-purple-500` (#a855f7)

**CSS Classes:**
```css
rounded-lg px-4 py-2 text-sm font-medium text-white transition
focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950
bg-purple-600 hover:bg-purple-700 focus:ring-purple-500
```

**Element Type:** Link component (navigates to `/games/${session.id}`)

## Visual Mockup

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FIND GAMES PAGE                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Dungeons & Dragons (5th Edition)                             │  │
│  │                                                              │  │
│  │ Host: Alice Johnson (clickable link)                        │  │
│  │ Date: January 20, 2025                                      │  │
│  │ Times: Evening, Night                                       │  │
│  │ Location: Portland, OR (15.3 mi away)                       │  │
│  │ Players: 3/6                                 ┌─────────────┐│  │
│  │                                              │  Request to ││  │
│  │ Looking for experienced players...           │    Join     ││  │
│  │                                              └─────────────┘│  │
│  │                                                (SKY BLUE)   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Pathfinder 2E                                                │  │
│  │                                                              │  │
│  │ Host: You (Your game!)                                      │  │
│  │ Date: January 22, 2025                                      │  │
│  │ Times: Afternoon, Evening                                   │  │
│  │ Location: Seattle, WA (0.0 mi away)                         │  │
│  │ Players: 4/5                                 ┌─────────────┐│  │
│  │                                              │  Hosting    ││  │
│  │ Epic campaign continuation...                │  this game  ││  │
│  │                                              └─────────────┘│  │
│  │                                                 (PURPLE)    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Call of Cthulhu                                              │  │
│  │                                                              │  │
│  │ Host: Bob Smith (clickable link)                            │  │
│  │ Date: January 25, 2025                                      │  │
│  │ Times: Night                                                │  │
│  │ Location: Tacoma, WA (25.8 mi away)                         │  │
│  │ Players: 2/4                                 ┌─────────────┐│  │
│  │                                              │  Withdraw   ││  │
│  │ Horror mystery awaits...                     │             ││  │
│  │                                              └─────────────┘│  │
│  │                                                  (RED)      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Color Reference

### Tailwind CSS Color Values

| Button State | Color Class | Hex Value | Usage |
|--------------|-------------|-----------|-------|
| **Host Button (Default)** | `bg-purple-600` | `#9333ea` | Default state for hosting |
| **Host Button (Hover)** | `bg-purple-700` | `#7e22ce` | Mouse hover |
| **Host Button (Focus)** | `focus:ring-purple-500` | `#a855f7` | Keyboard/accessibility focus |
| **Join Button (Default)** | `bg-sky-600` | `#0284c7` | Default state for joining |
| **Join Button (Hover)** | `bg-sky-700` | `#0369a1` | Mouse hover |
| **Withdraw Button (Default)** | `bg-red-600` | `#dc2626` | When user is already signed up |
| **Withdraw Button (Hover)** | `bg-red-700` | `#b91c1c` | Mouse hover |

## Button Behavior Comparison

### For Non-Host Games

| State | Button Text | Color | Action | Type |
|-------|-------------|-------|--------|------|
| Not joined | "Request to Join" | Blue (sky-600) | Opens character selection dialog | `<button>` |
| Joined/Waitlisted/Pending | "Withdraw" | Red (red-600) | Withdraws from game | `<button>` |
| Processing | "Requesting..." / "Withdrawing..." | Blue/Red (dimmed) | Disabled state | `<button>` |

### For Host Games (NEW!)

| State | Button Text | Color | Action | Type |
|-------|-------------|-------|--------|------|
| Is host | "Hosting this game" | Purple (purple-600) | Navigate to game detail page | `<Link>` |

## Consistency with Dashboard

The purple color scheme was chosen to match the existing host indicators on the Dashboard page:

### Dashboard Host Indicators
```tsx
// Card border and background
className="border-purple-500/50 bg-purple-950/20"

// Badge
className="bg-purple-500/20 text-purple-300"
text="Hosting"
```

### Find Games Host Button
```tsx
// Button
className="bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
text="Hosting this game"
```

## Accessibility Features

### Both Buttons Include:
- ✅ Proper focus states with visible focus rings
- ✅ Keyboard accessible (Tab, Enter, Space)
- ✅ Semantic HTML (button/link)
- ✅ Proper color contrast ratios
- ✅ Transition animations for smooth state changes

### Host Button Specifics:
- Uses Next.js `Link` component for client-side navigation
- Maintains focus styles for keyboard navigation
- Clear, descriptive text: "Hosting this game"
- Purple color differentiates from action buttons

### Join/Withdraw Button Specifics:
- Disabled state during processing
- Title attribute provides additional context
- Dynamic text based on current state
- Color coding: Blue = join, Red = leave

## Responsive Behavior

Both buttons maintain their styling across all screen sizes:

```css
/* Mobile (default) */
px-4 py-2 text-sm

/* Tablet/Desktop (no change) */
px-4 py-2 text-sm
```

The buttons are part of a flex container that ensures proper layout:

```tsx
<div className="flex flex-col items-end gap-2 flex-shrink-0">
  {/* Button here */}
  {/* Optional game image */}
</div>
```

## State Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    User Views Game Card                  │
└────────────────────────┬────────────────────────────────┘
                         │
                         ├─────────────────┬──────────────┐
                         │                 │              │
                    Is Host?          Is Joined?     Not Joined
                         │                 │              │
                         v                 v              v
              ┌──────────────────┐  ┌───────────┐  ┌──────────┐
              │  "Hosting this   │  │ "Withdraw"│  │"Request  │
              │      game"       │  │   (Red)   │  │to Join"  │
              │    (Purple)      │  │           │  │ (Blue)   │
              │      LINK        │  │  BUTTON   │  │ BUTTON   │
              └────────┬─────────┘  └─────┬─────┘  └────┬─────┘
                       │                  │             │
                       v                  v             v
              ┌──────────────┐   ┌────────────┐  ┌──────────┐
              │Navigate to   │   │Call leave  │  │Open char │
              │game detail   │   │API         │  │dialog    │
              └──────────────┘   └────────────┘  └──────────┘
```

## Implementation Details

### Logic Flow
```typescript
// In GameSessionCard component
const isHost = currentUserId === session.userId;

// Render logic
{isHost ? (
  // Purple "Hosting this game" link
  <Link href={`/games/${session.id}`} className="...purple...">
    Hosting this game
  </Link>
) : (
  // Blue/Red "Request to Join" / "Withdraw" button
  <button onClick={() => onJoin(session.id)} className="...blue or red...">
    {isUserSignedUp ? "Withdraw" : "Request to Join"}
  </button>
)}
```

### Key Differences

| Aspect | Host Button | Join/Withdraw Button |
|--------|-------------|----------------------|
| Element | `<Link>` | `<button>` |
| Purpose | Navigation | Action/API call |
| Color | Purple | Blue/Red |
| Text | Static: "Hosting this game" | Dynamic based on state |
| Disabled state | N/A (always active) | Yes (during processing) |
| Click behavior | Client-side navigation | Opens dialog or calls API |

## Testing Checklist

- [x] Build passes without errors
- [x] Lint passes (1 pre-existing warning)
- [x] Type checking passes
- [x] Purple color matches dashboard styling
- [x] Link navigates to correct game detail page
- [x] Non-host users see original button (unchanged)
- [x] Host users see new purple button
- [x] Button text is clear and descriptive
- [x] Focus states work correctly
- [x] Keyboard navigation works
- [x] Color contrast meets WCAG standards

## Screenshots Placeholder

> Note: Actual screenshots would show:
> 1. Non-host game card with blue "Request to Join" button
> 2. Host game card with purple "Hosting this game" button
> 3. Hover states for both buttons
> 4. Focus states for accessibility

## Future Enhancements

Possible future improvements:
- Add icon to host button (e.g., crown or star)
- Add badge showing "Your Game" on card border
- Add special background tint for hosted games (like dashboard)
- Add tooltip on hover with additional info

## Related Documentation
- `HOSTING_BUTTON_FEATURE.md` - Technical implementation details
- `HOST_PROFILE_LINK_FEATURE.md` - Host profile link feature
- `DASHBOARD_UPCOMING_GAMES.md` - Dashboard host indicators
