/**
 * Utility functions for campaign-related checks
 */

interface CampaignWithPayment {
  costPerSession?: number;
}

/**
 * Check if a campaign requires payment
 */
export function isPaidCampaign(campaign: CampaignWithPayment | null | undefined): boolean {
  return !!(campaign?.costPerSession && campaign.costPerSession > 0);
}
