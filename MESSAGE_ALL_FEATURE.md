# Message All Players Feature

## Overview

This feature allows campaign hosts to send bulk messages to all signed-up players simultaneously. Messages are delivered through the internal messaging system, and the system supports SMS notifications for players who have phone numbers in their profiles.

## Features

### For Campaign Hosts

- **Message All Button**: Visible only to campaign hosts in the Campaign Management section
- **Bulk Messaging**: Send a single message to all signed-up players at once
- **Dual Delivery**: Messages sent via internal messaging system + SMS (when phone number available)
- **Status Feedback**: Success/error messages with delivery statistics

### For Players

- **Internal Messages**: All messages appear in the player's message inbox
- **SMS Notifications** (optional): Players can add phone numbers to receive SMS alerts
- **Profile Privacy**: Phone numbers are optional and only used for notifications

## User Flow

### 1. Adding Phone Number (Optional)

Players can add their phone number to their profile:

1. Navigate to Profile page
2. Scroll to "Phone Number" field
3. Enter phone number in format: `(555) 123-4567`
4. Save profile

### 2. Sending Messages (Host Only)

Campaign hosts can message all players:

1. Navigate to campaign detail page
2. In the "Campaign Management" section, click "Message All"
3. Enter message subject and content
4. Click "Send to All Players"
5. Confirmation shows number of messages sent

## Technical Details

### API Endpoint

**POST** `/api/campaigns/[id]/message-all`

**Request Body:**
```json
{
  "userId": "string",      // Host's user ID
  "userName": "string",    // Host's display name
  "subject": "string",     // Message subject
  "content": "string"      // Message content
}
```

**Response:**
```json
{
  "success": true,
  "messagesSent": 5,
  "smsNotifications": {
    "sent": 3,
    "errors": 0,
    "total": 3
  }
}
```

### Security

- Only the campaign host can send messages to all players
- Host verification is performed on the server side
- Invalid campaigns return 404 error
- Unauthorized attempts return 403 error

## SMS Integration

The SMS functionality is currently **stubbed** for future integration. To enable SMS:

### Requirements

1. Twilio account (or similar SMS service)
2. Environment variables:
   ```
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

### Implementation

1. Install Twilio SDK:
   ```bash
   npm install twilio
   ```

2. Update `/app/api/campaigns/[id]/message-all/route.ts`:
   ```typescript
   import twilio from 'twilio';
   
   const client = twilio(
     process.env.TWILIO_ACCOUNT_SID,
     process.env.TWILIO_AUTH_TOKEN
   );
   
   // Replace stubbed code with:
   for (const recipient of smsRecipients) {
     try {
       await client.messages.create({
         body: content,
         from: process.env.TWILIO_PHONE_NUMBER,
         to: recipient.phoneNumber,
       });
       smsSent++;
     } catch (error) {
       console.error(`Failed to send SMS to ${recipient.name}:`, error);
       smsErrors++;
     }
   }
   ```

## Database Schema

### Profile Record

```typescript
type ProfileRecord = {
  // ... existing fields ...
  phoneNumber?: string;  // E.164 format recommended: +12345678900
}
```

## Files Modified

1. `lib/profile-db.ts` - Added phoneNumber field to ProfileRecord
2. `app/profile/page.tsx` - Added phone number input field
3. `app/api/campaigns/[id]/message-all/route.ts` - Created bulk messaging endpoint
4. `app/campaigns/[id]/page.tsx` - Added Message All button and modal

## Testing

### Manual Testing Steps

1. **Setup**:
   - Create a test campaign as a host
   - Have 2+ test players sign up for the campaign
   - Add phone number to at least one player's profile

2. **Send Message**:
   - As host, navigate to campaign detail page
   - Click "Message All" button
   - Fill in subject: "Test Message"
   - Fill in content: "This is a test bulk message"
   - Submit form

3. **Verify**:
   - Check each player's message inbox for the message
   - Verify console logs show SMS recipients (if stubbed)
   - Verify success message appears

### Error Cases

- **Not logged in**: Message button should not appear
- **Not campaign host**: Message button should not appear
- **No players signed up**: Message button should not appear
- **Empty subject/content**: Form validation prevents submission
- **Invalid campaign ID**: Returns 404 error

## Future Enhancements

1. **Message Templates**: Pre-defined templates for common scenarios (cancellation, date change, etc.)
2. **Scheduled Messages**: Ability to schedule messages for future delivery
3. **Message History**: Track all bulk messages sent for a campaign
4. **Delivery Receipts**: Track who received/read the messages
5. **SMS Opt-out**: Allow players to opt-out of SMS notifications
6. **Character Count**: Show character count for SMS messages (160 char limit)
7. **Rich Text**: Support for basic formatting in messages
8. **Attachments**: Ability to attach files or images

## Cost Considerations

SMS messages typically cost $0.01-0.02 per message depending on the provider and destination country. Budget accordingly based on campaign sizes and messaging frequency.

## Support

For issues or questions about this feature:
1. Check the console for error messages
2. Verify phone numbers are in valid format
3. Ensure Twilio credentials are properly configured (if SMS enabled)
4. Check campaign host permissions
