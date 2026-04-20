import type { InfluencerChannel } from "@/data/mockAdminInfluencers";
import { INFLUENCER_CHANNELS } from "@/data/mockAdminInfluencers";

/** Snapshot for the current month (demo). Production would filter by billing period. */
export type AdminChannelOverviewRow = {
  channel: InfluencerChannel;
  users: number;
  /** Percentage 0–100 (e.g. 4.2 = 4,2% conversion). */
  conversionPercent: number;
  mrrGenerated: number;
  estimatedCac: number;
  avgLtv: number;
};

/** One demo row per known acquisition channel. */
export const MOCK_CHANNEL_OVERVIEW_ROWS: AdminChannelOverviewRow[] = [
  {
    channel: "YouTube",
    users: 2_840,
    conversionPercent: 5.8,
    mrrGenerated: 48_920.0,
    estimatedCac: 42.5,
    avgLtv: 1_180.0,
  },
  {
    channel: "Instagram",
    users: 1_960,
    conversionPercent: 4.1,
    mrrGenerated: 31_200.0,
    estimatedCac: 58.0,
    avgLtv: 920.0,
  },
  {
    channel: "TikTok",
    users: 3_420,
    conversionPercent: 3.2,
    mrrGenerated: 36_450.0,
    estimatedCac: 38.0,
    avgLtv: 640.0,
  },
  {
    channel: "Podcast",
    users: 890,
    conversionPercent: 6.4,
    mrrGenerated: 22_100.0,
    estimatedCac: 35.0,
    avgLtv: 1_420.0,
  },
  {
    channel: "Google Ads",
    users: 4_120,
    conversionPercent: 2.9,
    mrrGenerated: 52_800.0,
    estimatedCac: 72.0,
    avgLtv: 780.0,
  },
  {
    channel: "Meta Ads",
    users: 3_650,
    conversionPercent: 3.5,
    mrrGenerated: 44_600.0,
    estimatedCac: 68.0,
    avgLtv: 710.0,
  },
  {
    channel: "Indicação",
    users: 720,
    conversionPercent: 12.1,
    mrrGenerated: 28_400.0,
    estimatedCac: 22.0,
    avgLtv: 1_950.0,
  },
  {
    channel: "Outro",
    users: 410,
    conversionPercent: 4.0,
    mrrGenerated: 9_850.0,
    estimatedCac: 95.0,
    avgLtv: 540.0,
  },
];

function assertFullChannelCoverage(): void {
  const set = new Set(MOCK_CHANNEL_OVERVIEW_ROWS.map((r) => r.channel));
  for (const c of INFLUENCER_CHANNELS) {
    if (!set.has(c)) {
      throw new Error(`mockInfluencerChannelsOverview: missing channel "${c}"`);
    }
  }
}
assertFullChannelCoverage();

/** Best channel by MRR for the current period (demo: same as mock rows). */
export function getBestChannelThisMonth(
  rows: AdminChannelOverviewRow[],
): AdminChannelOverviewRow {
  if (rows.length === 0) {
    throw new Error("getBestChannelThisMonth: empty rows");
  }
  return rows.reduce((best, row) =>
    row.mrrGenerated > best.mrrGenerated ? row : best,
  );
}
