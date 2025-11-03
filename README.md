# The Gathering Call (GameFinder2)

A Next.js-based platform for finding and hosting tabletop gaming sessions, including board games, D&D, Pathfinder, and other TTRPGs. Connect with players, manage campaigns, and build your gaming community.

## 🎮 Project Overview

**The Gathering Call** is a comprehensive tabletop gaming platform that enables players to find games, hosts to create and manage campaigns, and communities to thrive through features like messaging, ratings, marketplace, and more.

## ✨ Key Features

### Core Gaming Features
- **Game Sessions & Campaigns**: Create and join one-time game sessions or ongoing campaigns
- **Player Matching**: Find players and games based on location, game type, and preferences
- **Campaign Management**: Track campaign notes, manage players (pending, approved, waitlist)
- **Character Management**: Build, upload, and share D&D characters with PDF support
- **DND Character Builder**: Integrated character creation tool

### Payment & Monetization
- **Paid Games & Campaigns**: Host paid sessions with Stripe Connect integration
- **Subscription Support**: Recurring payments for ongoing campaigns
- **Payment Splitting**: 80% to hosts, 20% platform fee (0% for ambassadors)
- **Refund System**: Automated refund handling with fee management
- **One-Time Payments**: Pay-per-session support for individual games

### Community Features
- **Messaging System**: Direct messages between players and hosts
- **Message All**: Broadcast messages to all campaign players
- **Host Feedback System**: Bidirectional rating system for hosts and players
- **Player Feedback**: Rate and review players after games
- **Tall Tales**: Community storytelling feature with flagging system
- **User Profiles**: Public profiles with customizable character showcases

### Discovery & Search
- **Find Games**: Search for one-time game sessions near you
- **Find Campaigns**: Browse ongoing campaigns seeking players
- **Player Search**: Find players by location, badges, and preferences
- **Host Search**: Discover game hosts with ratings and specialties
- **City-Based Filtering**: Location-aware game discovery

### Gamification & Recognition
- **Badge System**: Admin-awarded badges with user display control
- **Self-Assignable Badges**: Users can assign descriptive badges to themselves
- **Ambassador Program**: Special status for trusted hosts with fee exemptions
- **User Ratings**: Comprehensive rating system for hosts and players

### Administration
- **Advertisement System**: Location-based ads with impression/click tracking
- **Admin Dashboard**: Manage users, badges, flags, and ambassador status
- **Content Moderation**: Flag and moderate tall tales and user content
- **User Management**: Profile administration and badge assignment

### Additional Features
- **Library**: Track your board game collection
- **Marketplace**: Buy/sell gaming items with image uploads
- **SMS Consent**: Twilio integration for SMS notifications
- **Calendar Integration**: Session scheduling with calendar views
- **Social Sharing**: Share profiles and games on social media
- **Announcements**: Platform-wide announcement system

## 📱 Main Screens/Pages

### Public Pages
- **Home** (`/`) - Hero landing page with platform overview
- **Find Games** (`/find-game`, `/find`) - Browse one-time game sessions
- **Find Campaigns** (`/find-campaigns`) - Search for ongoing campaigns
- **Player Search** (`/players`) - Find players in your area
- **Tall Tales** (`/tall-tales`) - Community story sharing
- **Mission** (`/mission`) - Platform mission and values

### User Pages
- **Dashboard** (`/dashboard`) - Personal dashboard with games and campaigns
- **Profile** (`/profile`, `/user/[userId]`) - User profile management
- **Public Profile** (`/public/profiles/[username]`) - Shareable user profiles
- **Settings** (`/settings`) - Account settings and preferences
- **My Campaigns** (`/my-campaigns`) - Manage your campaigns
- **Messages** (`/messages`) - Direct messaging inbox
- **Library** (`/library`) - Personal board game collection
- **Characters** (`/characters`) - Character management
- **Subscriptions** (`/subscriptions`) - Manage payment subscriptions

### Game Management
- **Post Game** (`/post`) - Create new game session
- **Post Campaign** (`/post-campaign`) - Create new campaign
- **Game Details** (`/games/[id]`) - View game session details
- **Campaign Details** (`/campaigns/[id]`) - View campaign details
- **Edit Game** (`/games/[id]/edit`) - Edit game session
- **Edit Campaign** (`/campaigns/[id]/edit`) - Edit campaign
- **Game Payment** (`/games/[id]/payment`) - Process payment for game
- **Campaign Payment** (`/campaigns/[id]/payment`) - Process campaign subscription

### Host Features
- **Host Dashboard** (`/host/dashboard`) - Host-specific dashboard with earnings
- **Host Onboarding** (`/host/onboarding`) - Stripe Connect setup

### Other Features
- **Marketplace** (`/marketplace`) - Buy/sell gaming items
- **D&D Character Builder** (`/dnd-character-builder`) - Character creation tool
- **Ambassador Program** (`/ambassador`) - Ambassador information
- **Advertising** (`/advertising`) - Advertising information page

### Authentication
- **Login** (`/auth/login`) - User login
- **Register** (`/auth/register`) - User registration
- **Reset Password** (`/auth/reset-password`) - Password recovery

### Legal
- **Privacy Policy** (`/privacy`) - Privacy policy
- **Terms of Service** (`/terms`) - General terms
- **Paid Games Terms** (`/terms-paid-games`) - Terms for paid games
- **SMS Consent** (`/sms-consent`) - SMS notification consent

## 🔌 API Endpoints

### Authentication & Users
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/status` - Check authentication status
- `GET /api/auth/me` - Get current user
- `GET /api/auth/user` - Get user details
- `POST /api/auth/request-reset` - Request password reset
- `POST /api/auth/reset` - Reset password
- `GET /api/user/me` - Get current user profile
- `GET /api/users/search` - Search users
- `GET /api/users/batch` - Get multiple users

### Profile Management
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `POST /api/profile/enable-paid-games` - Enable paid game hosting
- `GET /api/public/profiles/[username]` - Get public profile
- `GET /api/public/profiles/[username]/characters/[slug]` - Get public character
- `GET /api/public/users/[userId]` - Get public user data
- `GET /api/public/users/search` - Public user search

### Games & Campaigns
- `GET /api/games` - List game sessions
- `POST /api/games` - Create game session
- `GET /api/games/[id]` - Get game details
- `PUT /api/games/[id]` - Update game
- `DELETE /api/games/[id]` - Delete game
- `POST /api/games/[id]/join` - Join game
- `POST /api/games/[id]/leave` - Leave game
- `POST /api/games/[id]/approve` - Approve player
- `POST /api/games/[id]/deny` - Deny player
- `POST /api/games/[id]/remove-player` - Remove player
- `GET /api/games/my-games` - Get user's games

- `GET /api/campaigns` - List campaigns
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns/[id]` - Get campaign details
- `GET /api/campaigns/[id]/enriched` - Get campaign with enriched data
- `PUT /api/campaigns/[id]` - Update campaign
- `DELETE /api/campaigns/[id]` - Delete campaign
- `POST /api/campaigns/[id]/join` - Join campaign
- `POST /api/campaigns/[id]/leave` - Leave campaign
- `POST /api/campaigns/[id]/approve` - Approve player
- `POST /api/campaigns/[id]/deny` - Deny player
- `POST /api/campaigns/[id]/remove-player` - Remove player
- `POST /api/campaigns/[id]/message-all` - Send message to all players
- `GET /api/campaigns/my-campaigns` - Get user's campaigns

### Campaign Notes
- `GET /api/campaigns/[id]/notes` - Get campaign notes
- `POST /api/campaigns/[id]/notes` - Create note
- `PUT /api/campaigns/[id]/notes/[noteId]` - Update note
- `DELETE /api/campaigns/[id]/notes/[noteId]` - Delete note

### Characters
- `GET /api/characters` - List characters
- `POST /api/characters` - Create character
- `GET /api/characters/[id]` - Get character
- `PUT /api/characters/[id]` - Update character
- `DELETE /api/characters/[id]` - Delete character

### Stripe Payments
- `POST /api/stripe/create-payment-intent` - Create payment for game
- `POST /api/stripe/finalize-subscription-payment` - Create campaign subscription
- `POST /api/stripe/create-portal-session` - Access customer portal
- `GET /api/stripe/subscription-status` - Check subscription status
- `GET /api/stripe/check-subscription` - Verify subscription
- `POST /api/stripe/delete-incomplete-subscription` - Clean up failed subscriptions
- `GET /api/stripe/list-subscriptions` - List user subscriptions
- `GET /api/stripe/check-players-subscriptions` - Check campaign players' subscriptions
- `POST /api/stripe/refund` - Process refund
- `GET /api/stripe/campaign-payments` - Get campaign payment details

### Stripe Connect (Host Features)
- `POST /api/stripe/connect/onboard` - Start Stripe Connect onboarding
- `GET /api/stripe/connect/status` - Check Connect account status
- `POST /api/stripe/connect/dashboard` - Access Stripe dashboard

### Feedback & Ratings
- `POST /api/host-feedback` - Submit host feedback
- `GET /api/host-feedback` - Get host feedback
- `GET /api/host-feedback/stats/[hostId]` - Get host rating stats
- `GET /api/host-feedback/check` - Check if feedback can be submitted

- `POST /api/player-feedback` - Submit player feedback
- `GET /api/player-feedback` - Get player feedback
- `GET /api/player-feedback/stats/[playerId]` - Get player rating stats
- `GET /api/player-feedback/check` - Check if feedback can be submitted

### Messaging
- `GET /api/messages` - Get messages
- `POST /api/messages` - Send message
- `GET /api/messages/conversation` - Get conversation
- `PUT /api/messages/mark-read` - Mark messages as read

### Badges
- `GET /api/badges` - List all badges
- `POST /api/badges` - Create badge (admin)
- `PUT /api/badges` - Update badge (admin)
- `DELETE /api/badges` - Delete badge (admin)
- `GET /api/user-badges` - Get user's badges
- `PUT /api/user-badges` - Update badge display settings

### Admin - Badge Management
- `POST /api/admin/user-badges` - Award badge to user
- `DELETE /api/admin/user-badges` - Remove badge from user
- `GET /api/admin/user-badges` - Get users with badge

### Admin - Other
- `GET /api/admin/status` - Check admin status
- `GET /api/admin/profiles` - List profiles (admin)
- `PUT /api/admin/profiles` - Update profile (admin)
- `GET /api/admin/flags` - Get flagged content
- `PUT /api/admin/flags` - Update flag status
- `GET /api/admin/ambassador` - List ambassadors
- `POST /api/admin/ambassador` - Update ambassador status

### Marketplace
- `GET /api/marketplace` - List marketplace items
- `POST /api/marketplace` - Create marketplace item
- `PUT /api/marketplace/[id]` - Update item
- `DELETE /api/marketplace/[id]` - Delete item

### Tall Tales
- `GET /api/tall-tales` - List stories
- `POST /api/tall-tales` - Create story
- `GET /api/tall-tales/[id]` - Get story
- `PUT /api/tall-tales/[id]` - Update story
- `DELETE /api/tall-tales/[id]` - Delete story
- `POST /api/tall-tales/[id]/flag` - Flag story

### Advertisements
- `GET /api/advertisements` - Get current advertisement
- `POST /api/advertisements` - Set advertisement (admin)
- `POST /api/advertisements/click` - Track ad click

### Other
- `GET /api/library` - Get user's game library
- `POST /api/library` - Add game to library
- `DELETE /api/library` - Remove from library
- `GET /api/boardgames` - Search board games
- `GET /api/cities` - Get city suggestions
- `GET /api/dnd` - D&D character builder utilities
- `POST /api/upload` - Upload image
- `POST /api/upload-pdf` - Upload PDF (character sheets)
- `GET /api/notifications` - Get notifications
- `GET /api/announcements` - Get announcements
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update settings
- `GET /api/players` - Search players
- `GET /api/host/sessions` - Get host sessions

## 🛠️ Technology Stack

- **Framework**: Next.js 15.5.4 (React 19.1.0)
- **Language**: TypeScript 5.9.3
- **Styling**: Tailwind CSS 4.0
- **Database**: MongoDB 6.12.0
- **Authentication**: Firebase Auth 12.3.0
- **File Storage**: Google Cloud Storage 7.17.1
- **Payments**: Stripe 19.1.0 with Stripe Connect
- **Email**: Resend 4.0.0
- **SMS**: Twilio 5.10.2
- **Calendar**: @schedule-x 3.2.0
- **Other**: React Markdown, React Easy Crop, GetStream

## ⭐ Payment Integration

### Stripe Connect Payment Splitting

The platform supports **automatic payment splitting** for subscription-based campaigns:

- **80%** goes directly to campaign hosts (via Stripe Connect account)
- **20%** stays with the platform as application fee
- **0%** platform fee for Ambassador program members

### Does Subscriptions Work in Test Mode?

**YES!** See [SUBSCRIPTIONS_WORK_IN_TEST_MODE.md](./SUBSCRIPTIONS_WORK_IN_TEST_MODE.md) for details.

### Host Features
- Simple onboarding flow via Stripe Express
- Dedicated Host Dashboard at `/host/dashboard`
- Automatic payout management through Stripe
- View account status and payment terms
- One-click access to Stripe Express Dashboard

### Payment Documentation
- [Stripe Connect Setup Guide](./STRIPE_CONNECT_GUIDE.md) - Complete technical guide
- [Visual Summary](./STRIPE_CONNECT_VISUAL_SUMMARY.md) - Flowcharts and diagrams
- [Test Mode Verification](./TEST_MODE_VERIFICATION.md) - Verify your setup
- [Stripe Setup Guide](./STRIPE_SETUP.md) - Complete setup instructions
- [Subscription FAQ](./STRIPE_SUBSCRIPTION_FAQ.md) - Common questions
- [Refund Documentation](./REFUND_FUNCTIONALITY.md) - Refund system details

### Verify Stripe Configuration

Before starting development, validate your Stripe setup:

```bash
npm run validate:stripe
```

This checks:
- ✅ Environment variables are properly set
- ✅ API keys have correct format (test vs live)
- ✅ Both keys are in the same mode
- ✅ Connection to Stripe API works

See [STRIPE_SETUP.md](./STRIPE_SETUP.md) for setup instructions.

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- MongoDB database
- Firebase project (for authentication and storage)
- Stripe account (for payments)
- Google Cloud Storage account
- (Optional) Twilio account (for SMS)
- (Optional) Resend account (for emails)

### Environment Variables

Create a `.env.local` file with the required environment variables. See `.env.example` for the complete list:

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
# ... (see .env.example for all variables)

# MongoDB
MONGODB_URI=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=

# Google Cloud Storage
GOOGLE_APPLICATION_CREDENTIALS=
GCS_BUCKET_NAME=

# (Optional) Twilio, Resend, etc.
```

**Important:** For detailed Firebase configuration instructions (including multiple credential methods and troubleshooting), see [FIREBASE_CONFIGURATION_GUIDE.md](./FIREBASE_CONFIGURATION_GUIDE.md).

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ThomasAurelius/gamefinder2.git
cd gamefinder2
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (see above)

4. Validate configurations:
```bash
# Validate Stripe configuration
npm run validate:stripe

# Validate Firebase configuration
npm run validate:firebase
```

5. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

6. Open [http://localhost:3000](http://localhost:3000) to see the application

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## 📚 Additional Documentation

The repository includes extensive documentation for various features:

### Feature Documentation
- [Advertisement Feature](./ADVERTISEMENT_FEATURE.md) - Advertisement system details
- [Ambassador Program](./AMBASSADOR_PROGRAM_IMPLEMENTATION.md) - Ambassador program guide
- [Badge System](./BADGE_SYSTEM_DOCUMENTATION.md) - Badge system implementation
- [Character Upload](./CHARACTER_UPLOAD_IMPLEMENTATION.md) - Character PDF uploads
- [Host Feedback System](./HOST_FEEDBACK_SYSTEM.md) - Bidirectional rating system
- [Marketplace Feature](./MARKETPLACE_FEATURE.md) - Marketplace implementation
- [Message All Feature](./MESSAGE_ALL_FEATURE.md) - Broadcast messaging
- [Paid Games](./PAID_GAMES_IMPLEMENTATION.md) - Paid game sessions
- [Refund Functionality](./REFUND_FUNCTIONALITY.md) - Refund system
- [Location-Based Ads](./LOCATION_BASED_ADVERTISEMENTS.md) - Geographic targeting

### Implementation Summaries
- [Final Implementation Report](./FINAL_IMPLEMENTATION_REPORT.md)
- [Advertising Enhancements](./ADVERTISING_ENHANCEMENTS_SUMMARY.md)
- [Badge Implementation](./IMPLEMENTATION_SUMMARY_BADGES.md)

### Visual Guides
- [Campaign Host Features](./CAMPAIGN_HOST_FEATURES_VISUAL_GUIDE.md)
- [Host Feedback Visual Summary](./HOST_FEEDBACK_VISUAL_SUMMARY.md)
- [Character Upload Visual](./VISUAL_SUMMARY_CHARACTER_UPLOAD.md)
- [Advertising Visual Summary](./VISUAL_SUMMARY_ADVERTISING.md)

## 🎯 Core Functionality

### For Players
1. **Find Games**: Browse and join one-time sessions or ongoing campaigns
2. **Create Profile**: Showcase your characters and gaming preferences
3. **Messaging**: Communicate with hosts and other players
4. **Ratings**: Rate hosts and receive feedback
5. **Library**: Track your board game collection
6. **Characters**: Build and manage D&D characters

### For Hosts
1. **Create Games**: Post one-time sessions or recurring campaigns
2. **Manage Players**: Approve/deny join requests, manage waitlists
3. **Monetization**: Set up paid games with Stripe Connect
4. **Campaign Notes**: Keep organized session notes
5. **Message All**: Broadcast to all campaign players
6. **Host Dashboard**: Track sessions and earnings

### For Administrators
1. **Badge Management**: Create and award badges
2. **Ambassador Program**: Manage special host status
3. **Advertisements**: Manage platform advertisements
4. **Content Moderation**: Handle flagged content
5. **User Management**: Manage user profiles and permissions

## 🔒 Security & Privacy

- Firebase Authentication for secure user management
- Stripe for PCI-compliant payment processing
- Environment-based configuration for sensitive data
- Role-based access control (admin, ambassador, user)
- Content flagging and moderation system

## 📄 License

This project is private and proprietary.

## 🤝 Contributing

This is a private repository. Contact the repository owner for contribution guidelines.

## 📞 Support

For issues or questions:
- Check the documentation files in the repository
- Review the [Stripe Setup Guide](./STRIPE_SETUP.md) for payment-related issues
- See [SUBSCRIPTIONS_WORK_IN_TEST_MODE.md](./SUBSCRIPTIONS_WORK_IN_TEST_MODE.md) for subscription troubleshooting

## 🔗 Learn More About Next.js

To learn more about Next.js, check out the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial

## 🚀 Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

See the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

**Built with Next.js** | **Powered by Stripe Connect** | **Community-Driven Gaming**
