# Multi-Page Registration Onboarding Flow

This document describes the new multi-page onboarding flow for The Gathering Call.

## Overview

The onboarding flow guides new users through account setup in 4 easy steps:

1. **Account Creation** - Username, email, and password
2. **Timezone Selection** - Set your timezone for game scheduling
3. **Profile Personalization** - Upload avatar and add bio
4. **Feature Introduction** - Learn about Games and Campaigns

## Design Principles

- **Consistent Styling**: Matches the `/ambassador` page with gradient buttons and dark theme
- **Progressive Disclosure**: Each step focuses on one aspect of setup
- **Skip Functionality**: Users can skip optional steps with a confirmation modal
- **Authentication Protection**: Steps 2-4 require authentication via AuthGuard

## Flow Structure

### Routes

```
/auth/onboarding          → Redirects to step1
/auth/onboarding/step1    → Account creation (public)
/auth/onboarding/step2    → Timezone selection (protected)
/auth/onboarding/step3    → Avatar & Bio (protected)
/auth/onboarding/step4    → Feature tour (protected)
```

### Step 1: Account Creation

**Location**: `/auth/onboarding/step1`

**Fields**:
- Display name (optional)
- Email (required)
- Password (required, min 6 chars)
- Confirm Password (required)

**Features**:
- Password visibility toggle (eye icon)
- Firebase Authentication integration
- Redirects to step 2 on success
- Link to login page

**Progress Indicator**: 1 of 4 (active)

### Step 2: Timezone Selection

**Location**: `/auth/onboarding/step2`

**Fields**:
- Timezone dropdown (all supported timezones)

**Features**:
- Pre-loads existing timezone if set
- Skip button with confirmation modal
- Updates profile via `/api/profile` endpoint

**Progress Indicator**: 2 of 4 (active)

### Step 3: Avatar & Bio

**Location**: `/auth/onboarding/step3`

**Fields**:
- Avatar upload with crop functionality
- Bio textarea (max 2000 characters)

**Features**:
- Avatar cropper modal (circular crop)
- Character counter for bio
- Skip button with confirmation modal
- Pre-loads existing avatar/bio if set

**Progress Indicator**: 3 of 4 (active)

### Step 4: Feature Introduction

**Location**: `/auth/onboarding/step4`

**Content**:
- Welcome message
- **One-Shot Games** card:
  - Find single-session games
  - Try different systems
  - Meet new players
- **Campaigns** card:
  - Join ongoing adventures
  - Build lasting groups
  - Track character progression
- Additional features grid:
  - Find Local Venues
  - Browse Players
  - Share Stories

**Features**:
- "Get Started" button → redirects to `/dashboard`
- No skip option (final step)

**Progress Indicator**: 4 of 4 (active)

## Skip Confirmation Modal

**Component**: `SkipConfirmationModal.tsx`

**Message**: 
> Don't worry! You can update all of this later in **Account > Profile**

**Buttons**:
- "Continue Setup" - Returns to current step
- "Skip" - Proceeds to next step

## Styling

All pages use consistent styling with the ambassador page:

- **Background**: Dark theme with `slate-900/60` cards
- **Borders**: White 10% opacity (`border-white/10`)
- **Gradient Buttons**: `from-amber-500 via-purple-500 to-indigo-500`
- **Progress Dots**: Gradient for active, emerald for complete, gray for pending
- **Typography**: Gradient text for main headings

## Integration Points

### Modified Files

1. **`/app/auth/register/page.tsx`**
   - Changed redirect from `/auth/login` to `/auth/onboarding/step2`
   - Removed success message (immediate redirect)

### New Files

1. **`/app/auth/onboarding/page.tsx`** - Root redirect
2. **`/app/auth/onboarding/step1/page.tsx`** - Account creation
3. **`/app/auth/onboarding/step2/page.tsx`** - Timezone selection
4. **`/app/auth/onboarding/step3/page.tsx`** - Avatar & bio
5. **`/app/auth/onboarding/step4/page.tsx`** - Feature tour
6. **`/components/SkipConfirmationModal.tsx`** - Skip modal component

## User Experience

1. User visits `/auth/register` or `/auth/onboarding/step1`
2. Completes account creation → Automatically logged in
3. Guided through timezone, avatar/bio, and feature tour
4. Can skip optional steps (2 & 3) with confirmation
5. Ends up at dashboard ready to use the platform

## Future Enhancements

Potential improvements:

- Add completion tracking to prevent re-showing onboarding
- Add "Back" navigation between steps
- Save partial progress for steps 2-3
- Add animations between steps
- Track onboarding completion analytics
