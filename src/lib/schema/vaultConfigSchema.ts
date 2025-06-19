import { z } from "zod";

/***
 * For validating the vaults.config.json file
 * Useful if fetching file from a remote source
 */

const aprContractRequestSchema = z.object({
  type: z.literal("contract"),
  address: z.string(),
  abi: z.array(z.string()),
  functionName: z.string(),
  args: z.array(z.string()),
});

const aprApiRequestSchema = z.object({
  type: z.literal("api"),
  url: z.string(),
  method: z.string(),
  headers: z.record(z.string(), z.string()),
  body: z.record(z.string(), z.string()),
});

const aprRequestSchema = z.union([
  aprContractRequestSchema,
  aprApiRequestSchema,
]);

const evmSchema = z.object({
  chainId: z.number(),
  vaultAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid vault address"),
  transactionConfirmationTimeout: z.number(),
  tokenAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid token address"),
  startBlock: z.number(),
  explorerUrl: z.string(),
});

const cosmosSchema = z.object({
  chainId: z.string(),
  explorerUrl: z.string(),
  token: z.object({
    denom: z.string(),
    decimals: z.number(),
  }),
  startBlock: z.number(),
  clearingQueueAddress: z.string(),
});
export const vaultConfigSchema = z.object({
  vaultId: z.string(),
  symbol: z.string(),
  evm: evmSchema,
  cosmos: cosmosSchema,
  copy: z.object({
    name: z.string(),
    description: z.string(),
    deposit: z.object({
      title: z.string(),
      description: z.string(),
      cta: z.string(),
    }),
    depositInProgress: z.object({
      title: z.string(),
      steps: z.array(z.string()),
      description: z.string(),
    }),
    withdraw: z.object({
      title: z.string(),
      description: z.string(),
      cta: z.string(),
    }),
    withdrawInProgress: z.object({
      title: z.string(),
      description: z.string(),
      steps: z.array(z.string()),
    }),
    withdrawCompleted: z.object({
      title: z.string(),
      description: z.string(),
    }),
  }),
  aprRequest: aprRequestSchema,
});
