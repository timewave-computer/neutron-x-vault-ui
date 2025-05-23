import { CreateConfigParameters, createConfig, http } from "wagmi";
import { createClient } from "viem";

/***
 * Config Wagmi & AppKit support
 */

export const defaultEvmChainId = 31337;

const anvilRpcUrl = process.env.NEXT_PUBLIC_ANVIL_RPC_URL as string;
if (!anvilRpcUrl) {
  // TODO: once this is live on mainnet, this can be optional / opt-in
  throw new Error("NEXT_PUBLIC_ANVIL_RPC_URL is not set");
}

// Create configuration for private testnet
export const anvilNetwork = {
  id: 31337,
  testnet: true,
  name: "Anvil",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: [anvilRpcUrl] },
  },
};

const wagmiChainConfig: CreateConfigParameters["chains"] = [anvilNetwork];

// Configure Wagmi client for Ethereum interactions
export const wagmiConfig = createConfig({
  chains: wagmiChainConfig,
  ssr: true, // for nextjs hydration errors
  client({ chain }) {
    return createClient({
      chain,
      transport: http(chain.rpcUrls.default.http[0]),
    });
  },
});
