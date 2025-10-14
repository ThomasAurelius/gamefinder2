import { notFound } from "next/navigation";
import { getCampaign } from "@/lib/campaigns/db";
import { getUserBasicInfo } from "@/lib/users";
import { formatDateInTimezone, DEFAULT_TIMEZONE } from "@/lib/timezone";
import CampaignDetail from "@/components/CampaignDetail";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const campaign = await getCampaign(id);

  if (!campaign) {
    return {
      title: "Campaign Not Found",
    };
  }

  const formattedDate = formatDateInTimezone(campaign.date, DEFAULT_TIMEZONE);
  
  // Get host information
  const host = await getUserBasicInfo(campaign.userId);
  const hostName = host?.name || "Unknown Host";
  
  // Create a descriptive summary including date and times
  const baseDescription = campaign.description
    ? `${campaign.description.substring(0, 150)}${campaign.description.length > 150 ? "..." : ""}`
    : `Join ${hostName}'s ${campaign.game} campaign. ${campaign.maxPlayers - campaign.signedUpPlayers.length} spots available!`;
  
  // Format times for display
  const timesStr = campaign.times.length > 0 ? ` | Times: ${campaign.times.join(", ")}` : "";
  const description = `${baseDescription} | Date: ${formattedDate}${timesStr}`;

  const url = `${process.env.NEXT_PUBLIC_APP_URL || "https://thegatheringcall.com"}/campaigns/${id}`;

  return {
    title: `${campaign.game} Campaign - ${hostName}`,
    description,
    openGraph: {
      title: `${campaign.game} on ${formattedDate}`,
      description,
      url,
      type: "website",
      images: campaign.imageUrl
        ? [
            {
              url: campaign.imageUrl,
              width: 1200,
              height: 630,
              alt: campaign.game,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${campaign.game} on ${formattedDate}`,
      description,
      images: campaign.imageUrl ? [campaign.imageUrl] : [],
    },
  };
}

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaign = await getCampaign(id);

  if (!campaign) {
    notFound();
  }

  // Get the full URL for sharing
  const campaignUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://thegatheringcall.com"}/campaigns/${id}`;

  return <CampaignDetail campaignId={id} campaignUrl={campaignUrl} />;
}
