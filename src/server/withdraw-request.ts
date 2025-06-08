"use server";

import { z } from "zod";

const INDEXER_URL = process.env.INDEXER_API_URL as string;

if (!INDEXER_URL) {
  throw new Error("INDEXER_API_URL is not set");
}

const INDEXER_API_KEY = process.env.INDEXER_API_KEY;
if (!INDEXER_API_KEY) {
  throw new Error("INDEXER_API_KEY is not set");
}

const withdrawRequestSchema = z.object({
  id: z.number(),
  amount: z.string(),
  owner_address: z.string(),
  receiver_address: z.string(),
  block_number: z.number(),
});

const responseSchema = z.object({
  data: z.array(withdrawRequestSchema),
});

const getUrl = (vaultAddress: string, ownerAddress: string) => {
  return `${INDEXER_URL}/v1/vault/${vaultAddress}/withdrawRequestsByAddress/${ownerAddress}`;
};

export async function getWithdrawRequest(
  _ownerAddress: string,
  vaultAddress: string,
) {
  const ownerAddress = "0xd9a23b58e684b985f661ce7005aa8e10630150c1";
  const response = await fetch(getUrl(vaultAddress, ownerAddress), {
    headers: {
      "X-Api-Key": INDEXER_API_KEY as string,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch withdraw request");
  }
  const data = await response.json();
  const parsedData = responseSchema.parse(data);
  return parsedData.data;
}
