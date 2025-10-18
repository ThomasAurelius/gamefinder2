# Ambassador Program - UI Visual Guide

## Admin Settings Panel - Ambassador Management Section

The ambassador management interface is located in the Settings page, visible only to administrators.

### Section Overview

```
┌─────────────────────────────────────────────────────────────────┐
│ Admin: Ambassador Management                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Grant or revoke ambassador status for DMs. Ambassadors pay     │
│ only Stripe transaction fees (no platform fee).                │
│                                                                 │
│ ┌───────────────────────────────────────────────────────────┐   │
│ │ Search User                                               │   │
│ │                                                           │   │
│ │ ┌─────────────────────────────┐  ┌──────────┐           │   │
│ │ │ Enter username              │  │ Search   │           │   │
│ │ └─────────────────────────────┘  └──────────┘           │   │
│ │                                                           │   │
│ │ ─────────────────────────────────────────────────────    │   │
│ │                                                           │   │
│ │ User: John Doe                                           │   │
│ │ Current Status: Regular User (15% platform fee)          │   │
│ │                                                           │   │
│ │ Ambassador Until (optional)                              │   │
│ │ ┌─────────────────────────────┐                          │   │
│ │ │ [Date Picker: mm/dd/yyyy]  │                          │   │
│ │ └─────────────────────────────┘                          │   │
│ │ Leave blank for permanent ambassador status              │   │
│ │                                                           │   │
│ │ ┌───────────────────────────────────────────┐            │   │
│ │ │     Grant Ambassador Status               │            │   │
│ │ └───────────────────────────────────────────┘            │   │
│ └───────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ┌───────────────────────────────────────────────────────────┐   │
│ │ Fee Structure                                             │   │
│ │                                                           │   │
│ │ • Ambassadors: 0% platform fee + Stripe transaction     │   │
│ │   fees (~2.9% + 30¢)                                     │   │
│ │ • Regular DMs: 15% platform fee + Stripe transaction    │   │
│ │   fees                                                    │   │
│ └───────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### After Granting Ambassador Status

```
┌───────────────────────────────────────────────────────────┐
│ User: John Doe                                           │
│ Current Status: ✓ Ambassador until 12/31/2024           │
│                                                           │
│ Ambassador Until (optional)                              │
│ ┌─────────────────────────────┐                          │
│ │ 2024-12-31                 │                          │
│ └─────────────────────────────┘                          │
│ Leave blank for permanent ambassador status              │
│                                                           │
│ ┌───────────────────────────────────────────┐            │
│ │     Revoke Ambassador Status              │            │
│ └───────────────────────────────────────────┘            │
└───────────────────────────────────────────────────────────┘
```

## User Flow

### 1. Search for User
- Admin types username in search field
- Clicks "Search" button or presses Enter
- System searches for user and displays current status

### 2. View Current Status
Status shows as one of:
- "Regular User (15% platform fee)" - Not an ambassador
- "Ambassador (permanent)" - Ambassador with no expiration
- "Ambassador until MM/DD/YYYY" - Ambassador with expiration date

### 3. Grant Ambassador Status
1. Admin can optionally set expiration date using date picker
2. Clicks "Grant Ambassador Status" button
3. System updates database
4. Success message displays: "Ambassador status granted successfully!"
5. Button changes to "Revoke Ambassador Status"

### 4. Revoke Ambassador Status
1. Admin clicks "Revoke Ambassador Status" button
2. System removes ambassador status
3. Success message displays: "Ambassador status removed successfully!"
4. Button changes to "Grant Ambassador Status"

## Color Scheme

- **Background**: Dark theme with amber accents (matching admin sections)
- **Primary Actions**: Sky blue buttons (consistent with site theme)
- **Success Messages**: Emerald green text
- **Error Messages**: Rose red text
- **Ambassador Status**: Emerald green (active) or Slate gray (inactive)

## Accessibility Features

- All form fields have proper labels
- Keyboard navigation supported (Enter to submit search)
- Clear visual feedback on button states (disabled, hover, active)
- Color contrast meets WCAG standards
- Error messages are descriptive and actionable

## Mobile Responsiveness

The interface is fully responsive and works on:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

Buttons and inputs stack vertically on smaller screens for better usability.

## Integration with Existing Settings

The Ambassador Management section appears in the admin settings area, alongside:
- Site Announcements
- Content Flags
- Advertisement Management
- Badge Management

It uses the same styling and layout patterns for consistency.
