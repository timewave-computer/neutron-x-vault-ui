"use server";

import { z } from "zod";
import { fetchFromIndexer } from "@/lib";

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

export async function getWithdrawRequests(
  ownerAddress: string,
  vaultAddress: string,
) {
  const data = await fetchFromIndexer(
    vaultAddress,
    `withdrawRequestsByAddress/${ownerAddress}`,
  );
  const parsedData = responseSchema.parse(data);
  return parsedData.data;
}
