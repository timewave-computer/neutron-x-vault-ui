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

const aprWindowInDays = 30;

const getTimerange = (days: number) => {
  const nowInUtc = new Date().toISOString();
  const windowAgoInUtc = new Date(
    Date.now() - days * 24 * 60 * 60 * 1000,
  ).toISOString();
  return {
    from: windowAgoInUtc,
    to: nowInUtc,
  };
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ vaultAddress: string }> },
) {
  try {
    const { vaultAddress } = await params;
    const { from, to } = getTimerange(aprWindowInDays);

    const data = await fetchFromIndexer(
      vaultAddress,
      `rates?from=${from}&to=${to}&order=asc`,
    );

    const parsedData = ratesResponseSchema.parse(data);

    if (parsedData.data.length === 0) {
      return NextResponse.json({ error: "No rates found" }, { status: 404 });
    }

    let finalOverInitial = 1;
    if (parsedData.data.length >= 2) {
      const initialRate = parseFloat(parsedData.data[0].rate);
      const finalRate = parseFloat(
        parsedData.data[parsedData.data.length - 1].rate,
      );
      finalOverInitial = finalRate / initialRate;
    }

    const apr = Math.pow(finalOverInitial, 365 / aprWindowInDays) - 1;

    return NextResponse.json(apr.toString());
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch rates" },
      { status: 500 },
    );
  }
}
