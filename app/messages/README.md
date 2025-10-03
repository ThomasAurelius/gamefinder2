# Messaging Feature

This directory contains the messaging functionality for GameFinder, allowing users to send and receive messages from each other.

## Features

- **Send Messages**: Users can compose and send messages to other users
- **View Conversations**: Messages are organized by conversation with other users
- **Unread Indicators**: Visual indicators show unread message counts
- **Mark as Read**: Recipients can mark messages as read
- **Real-time Updates**: Messages are fetched and displayed in real-time

## API Endpoints

### POST /api/messages
Send a new message to another user.

**Request Body:**
```json
{
  "senderId": "string",
  "senderName": "string",
  "recipientId": "string",
  "recipientName": "string",
  "subject": "string",
  "content": "string"
}
```

**Response:**
```json
{
  "message": "Message sent successfully",
  "data": {
    "id": "string",
    "senderId": "string",
    "senderName": "string",
    "recipientId": "string",
    "recipientName": "string",
    "subject": "string",
    "content": "string",
    "isRead": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /api/messages?userId={userId}
Fetch all messages for a specific user (both sent and received).

**Query Parameters:**
- `userId` (required): The ID of the user

**Response:**
```json
{
  "messages": [
    {
      "id": "string",
      "senderId": "string",
      "senderName": "string",
      "recipientId": "string",
      "recipientName": "string",
      "subject": "string",
      "content": "string",
      "isRead": boolean,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /api/messages/conversation?userId={userId}&otherUserId={otherUserId}
Fetch all messages in a conversation between two users.

**Query Parameters:**
- `userId` (required): The ID of the current user
- `otherUserId` (required): The ID of the other user in the conversation

**Response:**
```json
{
  "messages": [
    {
      "id": "string",
      "senderId": "string",
      "senderName": "string",
      "recipientId": "string",
      "recipientName": "string",
      "subject": "string",
      "content": "string",
      "isRead": boolean,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### PATCH /api/messages/mark-read
Mark a message as read.

**Request Body:**
```json
{
  "messageId": "string"
}
```

**Response:**
```json
{
  "message": "Message marked as read"
}
```

## Database Schema

The messaging feature uses MongoDB to store messages in a `messages` collection with the following schema:

```typescript
{
  _id: ObjectId,
  senderId: string,
  senderName: string,
  recipientId: string,
  recipientName: string,
  subject: string,
  content: string,
  isRead: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Usage

1. Navigate to `/messages` to view the messaging page
2. Click "New Message" to compose a message
3. Enter the recipient's user ID and name
4. Add a subject and message content
5. Click "Send Message"
6. View conversations in the left panel
7. Click on a conversation to view messages
8. Click "Mark as read" on received messages

## Configuration

The messaging feature requires MongoDB to be configured. Set the `MONGODB_URI` environment variable:

```bash
MONGODB_URI=mongodb://localhost:27017/gamefinder
```

Or use the alternative environment variables as documented in `lib/mongodb.ts`.

## Integration

The Messages link has been added to the main navigation bar, making it easily accessible from any page in the application.
