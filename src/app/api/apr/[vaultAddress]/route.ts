import { NextResponse } from "next/server";
import { fetchFromIndexer } from "@/lib";
import { z } from "zod";

const ratesResponseSchema = z.object({
  data: z.array(
    z.object({
      rate: z.string(),
      block_number: z.number(),
      block_timestamp: z.string(),
    }),
  ),
});

/***
 *
 * rate annualized over n day window
 *  APR = (finalRate / initialRate) ^ (365/n) - 1
 *
 * returns decimal value
 */

const APR_RANGE_IN_DAYS = 30;

const getTimestampsForRange = (days: number) => {
  const endTimestamp = new Date().toISOString();
  const startTimestamp = new Date(
    Date.now() - days * 24 * 60 * 60 * 1000,
  ).toISOString();
  return {
    from: startTimestamp,
    to: endTimestamp,
  };
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ vaultAddress: string }> },
) {
  try {
    const { vaultAddress } = await params;
    const { from, to } = getTimestampsForRange(APR_RANGE_IN_DAYS);

    const data = await fetchFromIndexer(
      vaultAddress,
      `rates?from=${from}&to=${to}&order=asc`,
    );

    const parsedData = ratesResponseSchema.parse(data);

    if (parsedData.data.length < 2) {
      return NextResponse.json(
        { error: "Not enough rate updates" },
        { status: 400 },
      );
    }

    const firstUpdate = parsedData.data[0];
    const lastUpdate = parsedData.data[parsedData.data.length - 1];

    const isMeetsMinimumTimeRange = checkMinimumTimeRange({
      timestamps: {
        from: firstUpdate.block_timestamp,
        to: lastUpdate.block_timestamp,
      },
      minimumHours: 24 * 3, // 5 days
    });

    if (!isMeetsMinimumTimeRange) {
      return NextResponse.json(
        { error: "Not enough time has passed to calculate APR" },
        { status: 400 },
      );
    }
    const firstRate = parseFloat(firstUpdate.rate);
    const lastRate = parseFloat(lastUpdate.rate);
    const finalOverInitial = lastRate / firstRate;

    const apr = Math.pow(finalOverInitial, 365 / APR_RANGE_IN_DAYS) - 1;

    return NextResponse.json(apr.toString());
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch rates" },
      { status: 500 },
    );
  }
}

const checkMinimumTimeRange = ({
  timestamps: { from, to },
  minimumHours,
}: {
  timestamps: {
    from: string;
    to: string;
  };
  minimumHours: number;
}) => {
  const timeDifference = new Date(to).getTime() - new Date(from).getTime();
  return timeDifference >= 1000 * 60 * 60 * minimumHours;
};
