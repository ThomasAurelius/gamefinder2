# Multi-Page Registration Onboarding Flow

This document describes the multi-page onboarding flow for The Gathering Call.

## Overview

The onboarding flow guides new users through account setup in 3 easy steps after registration:

1. **Timezone Selection** - Set your timezone for game scheduling
2. **Profile Personalization** - Upload avatar and add bio
3. **Feature Introduction** - Learn about Games and Campaigns

**Note:** Account creation (email/password) happens on the `/auth/register` page before entering the onboarding flow.

## Design Principles

- **Consistent Styling**: Matches the `/ambassador` page with gradient buttons and dark theme
- **Progressive Disclosure**: Each step focuses on one aspect of setup
- **Skip Functionality**: Users can skip optional steps with a confirmation modal
- **Authentication Protection**: All onboarding steps require authentication via AuthGuard
- **First-Time Detection**: Login page detects first-time users and redirects them to onboarding

## Flow Structure

### Routes

```
/auth/register              → Account creation (public)
/auth/login                 → Login page (detects first-time users)
/auth/onboarding            → Redirects to step2
/auth/onboarding/step1      → Deprecated, redirects to /auth/register
/auth/onboarding/step2      → Timezone selection (protected)
/auth/onboarding/step3      → Avatar & Bio (protected)
/auth/onboarding/step4      → Feature tour (protected)
```

### Registration & Login Flow

**New User Flow:**
1. User visits `/auth/register`
2. Completes registration form (name, email, password)
3. Account created in Firebase and MongoDB
4. Automatically redirected to `/auth/onboarding/step2` to begin onboarding

**Returning User Flow:**
1. User visits `/auth/login`
2. Enters email and password
3. Backend checks `onboardingCompleted` flag
4. If `onboardingCompleted === false`, redirects to `/auth/onboarding/step2`
5. If `onboardingCompleted === true`, redirects to `/dashboard`

### Step 2: Timezone Selection

**Location**: `/auth/onboarding/step2`

**Fields**:
- Timezone dropdown (all supported timezones)

**Features**:
- Pre-loads existing timezone if set
- Skip button with confirmation modal
- Updates profile via `/api/profile` endpoint (PUT method)

**Progress Indicator**: Step 1 of 3 (active)

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
- Updates profile via `/api/profile` endpoint (PUT method)

**Progress Indicator**: Step 2 of 3 (active)

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
- "Get Started" button → marks onboarding complete and redirects to `/dashboard`
- No skip option (final step)
- Calls `/api/auth/complete-onboarding` to set `onboardingCompleted` flag

**Progress Indicator**: Step 3 of 3 (active)

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
- **Progress Dots**: Gradient for active, emerald for complete, gray for pending (3 dots total)
- **Typography**: Gradient text for main headings

## Integration Points

### Modified Files

1. **`/app/auth/register/page.tsx`**
   - Changed redirect from `/auth/login` to `/auth/onboarding/step2`
   - Removed success message (immediate redirect)

2. **`/app/auth/login/page.tsx`**
   - Added first-time login detection
   - Redirects to `/auth/onboarding/step2` if `onboardingCompleted === false`
   - Redirects to `/dashboard` if `onboardingCompleted === true`

3. **`/app/api/auth/login/route.ts`**
   - Returns `onboardingCompleted` flag in response

4. **`/lib/user-types.ts`**
   - Added `onboardingCompleted?: boolean` field to UserDocument

5. **`/app/api/profile/route.ts`**
   - Added PUT method for partial profile updates (used by onboarding steps)

### New Files

1. **`/app/auth/onboarding/page.tsx`** - Root redirect to step2
2. **`/app/auth/onboarding/step1/page.tsx`** - Deprecated, redirects to register
3. **`/app/auth/onboarding/step2/page.tsx`** - Timezone selection
4. **`/app/auth/onboarding/step3/page.tsx`** - Avatar & bio
5. **`/app/auth/onboarding/step4/page.tsx`** - Feature tour
6. **`/app/api/auth/complete-onboarding/route.ts`** - Marks onboarding complete
7. **`/components/SkipConfirmationModal.tsx`** - Skip modal component

## User Experience

1. User visits `/auth/register` to create account
2. Completes registration → Automatically logged in
3. Redirected to `/auth/onboarding/step2` (timezone selection)
4. Guided through avatar/bio setup and feature tour
5. Can skip optional steps (2 & 3) with confirmation
6. Completes onboarding by clicking "Get Started" on step 4
7. `onboardingCompleted` flag set to `true` in database
8. Redirected to `/dashboard` ready to use the platform

**Returning Users:**
- Login at `/auth/login`
- If already completed onboarding → dashboard
- If not completed → resume onboarding at step 2

## Technical Details

### Database Fields

**UserDocument** (`users` collection):
- `onboardingCompleted?: boolean` - Tracks whether user has finished onboarding flow

### API Endpoints

- `POST /api/auth/login` - Returns user info with `onboardingCompleted` flag
- `POST /api/auth/complete-onboarding` - Sets `onboardingCompleted` to true
- `PUT /api/profile` - Partial profile updates (merges with existing data)

## Future Enhancements

Potential improvements:

- Add "Back" navigation between steps
- Save partial progress for steps 2-3
- Add animations between steps
- Track onboarding completion analytics
- Allow users to restart/review onboarding from settings
