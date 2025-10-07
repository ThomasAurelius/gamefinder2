import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export type StripeAccountInfo = {
  userId: string;
  stripeAccountId: string;
  onboardingComplete: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Get Stripe account information for a user
 */
export async function getStripeAccount(userId: string): Promise<StripeAccountInfo | null> {
  try {
    const db = await getDb();
    const stripeAccountsCollection = db.collection("stripe_accounts");
    
    const account = await stripeAccountsCollection.findOne({ userId });
    
    if (!account) {
      return null;
    }
    
    return {
      userId: account.userId,
      stripeAccountId: account.stripeAccountId,
      onboardingComplete: account.onboardingComplete || false,
      chargesEnabled: account.chargesEnabled || false,
      payoutsEnabled: account.payoutsEnabled || false,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  } catch (error) {
    console.error("Failed to fetch Stripe account:", error);
    return null;
  }
}

/**
 * Create or update Stripe account information for a user
 */
export async function upsertStripeAccount(accountInfo: Partial<StripeAccountInfo> & { userId: string }): Promise<void> {
  try {
    const db = await getDb();
    const stripeAccountsCollection = db.collection("stripe_accounts");
    
    await stripeAccountsCollection.updateOne(
      { userId: accountInfo.userId },
      {
        $set: {
          ...accountInfo,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );
  } catch (error) {
    console.error("Failed to upsert Stripe account:", error);
    throw error;
  }
}

/**
 * Get Stripe account ID for a user
 */
export async function getStripeAccountId(userId: string): Promise<string | null> {
  const account = await getStripeAccount(userId);
  return account?.stripeAccountId || null;
}

/**
 * Check if user has completed Stripe onboarding
 */
export async function hasCompletedStripeOnboarding(userId: string): Promise<boolean> {
  const account = await getStripeAccount(userId);
  return account?.onboardingComplete && account?.chargesEnabled && account?.payoutsEnabled || false;
}
