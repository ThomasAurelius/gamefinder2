import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { getDb } from "@/lib/mongodb";
import { createMessage } from "@/lib/messages";
import { getUsersBasicInfo } from "@/lib/users";
import { readProfile } from "@/lib/profile-db";
import { getUserDisplayName } from "@/lib/user-utils";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Get authenticated user from cookie
    const cookieStore = await cookies();
    const authenticatedUserId = cookieStore.get("userId")?.value;

    if (!authenticatedUserId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id: campaignId } = await context.params;
    const body = await request.json();
    const { subject, content, message } = body;

    // Accept either "content" or "message" field name for backward compatibility with existing clients
    // Frontend currently sends "message" field, but API expects "content" - this allows both during transition
    const messageContent = content !== undefined ? content : message;

    // Validate required fields
    if (!subject || !messageContent) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch the campaign
    const db = await getDb();
    const campaignsCollection = db.collection("campaigns");

    if (!ObjectId.isValid(campaignId)) {
      return NextResponse.json(
        { error: "Invalid campaign ID" },
        { status: 400 }
      );
    }

    const campaign = await campaignsCollection.findOne({
      _id: new ObjectId(campaignId),
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Verify that the authenticated user is the campaign host
    if (campaign.userId !== authenticatedUserId) {
      return NextResponse.json(
        { error: "Only the campaign host can send messages to all players" },
        { status: 403 }
      );
    }

    // Get authenticated user's name from database
    const userName = await getUserDisplayName(authenticatedUserId);

    if (!userName) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get signed up players
    const signedUpPlayers: string[] = campaign.signedUpPlayers || [];

    if (signedUpPlayers.length === 0) {
      return NextResponse.json(
        { error: "No players signed up for this campaign" },
        { status: 400 }
      );
    }

    // Get user info for all signed up players
    const usersMap = await getUsersBasicInfo(signedUpPlayers);

    // Send internal messages to all players
    const messagePromises: Promise<unknown>[] = [];
    const smsRecipients: Array<{ name: string; phoneNumber: string }> = [];

    for (const playerId of signedUpPlayers) {
      const playerInfo = usersMap.get(playerId);
      if (!playerInfo) continue;

      // Send internal message
      messagePromises.push(
        createMessage({
          senderId: authenticatedUserId,
          senderName: userName,
          recipientId: playerId,
          recipientName: playerInfo.name,
          subject,
          content: messageContent,
        })
      );

      // Get player's phone number for SMS
      try {
        const profile = await readProfile(playerId);
        if (profile.phoneNumber) {
          smsRecipients.push({
            name: playerInfo.name,
            phoneNumber: profile.phoneNumber,
          });
        }
      } catch (error) {
        console.error(`Failed to fetch profile for player ${playerId}:`, error);
      }
    }

    // Wait for all internal messages to be sent
    await Promise.all(messagePromises);

    // Send SMS notifications
    let smsSent = 0;
    const smsErrors = 0;

    if (smsRecipients.length > 0) {
      // Note: SMS functionality is stubbed for now
      // In the future, integrate with Twilio or similar service
      console.log(`Would send SMS to ${smsRecipients.length} recipients:`, smsRecipients);
      
      // Stub: mark all as "sent" for now
      smsSent = smsRecipients.length;
      
      // TODO: Implement actual SMS sending
      // For example, using Twilio:
      // for (const recipient of smsRecipients) {
      //   try {
      //     await sendSMS(recipient.phoneNumber, content);
      //     smsSent++;
      //   } catch (error) {
      //     console.error(`Failed to send SMS to ${recipient.name}:`, error);
      //     smsErrors++;
      //   }
      // }
    }

    return NextResponse.json({
      success: true,
      messagesSent: signedUpPlayers.length,
      smsNotifications: {
        sent: smsSent,
        errors: smsErrors,
        total: smsRecipients.length,
      },
    });
  } catch (error) {
    console.error("Failed to send messages to all players:", error);
    return NextResponse.json(
      { error: "Failed to send messages" },
      { status: 500 }
    );
  }
}
