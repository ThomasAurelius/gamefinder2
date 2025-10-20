import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { listCampaigns } from "@/lib/campaigns/db";
import { getUsersBasicInfo } from "@/lib/users";
import { getVendorsBasicInfo } from "@/lib/vendors";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Fetch campaigns where user is hosting or participating
    const campaigns = await listCampaigns({ userFilter: userId });
    
    // Fetch host information for all campaigns
    const hostIds = [...new Set(campaigns.map(c => c.userId))];
    const hostsMap = await getUsersBasicInfo(hostIds);
    
    // Fetch vendor information for all campaigns that have a vendorId
    const vendorIds = [...new Set(campaigns.map(c => c.vendorId).filter((id): id is string => !!id))];
    const vendorsMap = await getVendorsBasicInfo(vendorIds);
    
    // Add host and vendor information to campaigns
    const campaignsWithHosts = campaigns.map(campaign => ({
      ...campaign,
      hostName: hostsMap.get(campaign.userId)?.name || "Unknown Host",
      hostAvatarUrl: hostsMap.get(campaign.userId)?.avatarUrl,
      vendorName: campaign.vendorId ? vendorsMap.get(campaign.vendorId)?.vendorName : undefined,
    }));
    
    return NextResponse.json(campaignsWithHosts, { status: 200 });
  } catch (error) {
    console.error("Failed to list user campaigns", error);
    return NextResponse.json(
      { error: "Failed to load campaigns" },
      { status: 500 }
    );
  }
}
