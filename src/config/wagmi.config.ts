import { CreateConfigParameters, createConfig, http } from "wagmi";
import { createClient } from "viem";

/***
 * Config Wagmi & AppKit support
 */

// default to simulation env if no account connected
export const defaultEvmChainId = 31337;

// Get Anvil RPC URL from environment variables
const anvilRpcUrl = process.env.NEXT_PUBLIC_ANVIL_RPC_URL as string;
if (!anvilRpcUrl) {
  throw new Error("NEXT_PUBLIC_ANVIL_RPC_URL is not set");
}

export const anvilNetwork = {
  // If testnet RPC URL is provided, add Anvil network
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
  // Define available blockchain networks
  chains: wagmiChainConfig,
  ssr: true, // for nextjs hydration errors
  // Configure network transport methods
  // transports:wagmiTransportConfig,
  client({ chain }) {
    return createClient({
      chain,
      transport: http(chain.rpcUrls.default.http[0]),
    });
  },
});
