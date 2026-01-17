/**
 * Audius SDK Client
 *
 * Modern client using the native @audius/sdk v11+
 * Replaces the legacy MinimalAudiusSDK wrapper.
 */

import { sdk, type AudiusSdk } from "@audius/sdk";

let audiusClient: AudiusSdk | null = null;

/**
 * Initialize and return the Audius SDK client.
 * Uses singleton pattern to avoid multiple initializations.
 */
export async function getAudiusClient(): Promise<AudiusSdk> {
  if (audiusClient) {
    return audiusClient;
  }

  const apiKey = process.env.AUDIUS_API_KEY;

  if (!apiKey) {
    throw new Error(
      "AUDIUS_API_KEY environment variable is required. " +
      "Get one at https://audius.co/settings -> Manage Your Apps"
    );
  }

  audiusClient = sdk({
    apiKey,
    // apiSecret is only needed for write operations (backend only)
    // apiSecret: process.env.AUDIUS_API_SECRET,
  });

  return audiusClient;
}

/**
 * Reset the SDK client (useful for testing)
 */
export function resetAudiusClient(): void {
  audiusClient = null;
}

// Re-export types from SDK for convenience
export type { AudiusSdk } from "@audius/sdk";
