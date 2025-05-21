import { CreateConfigParameters, createConfig, http } from "wagmi";
import { createClient } from "viem";

/***
 * Config Wagmi & AppKit support
 */

// default to simulation env if no account connected
export const defaultChainId = 31337;

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

export const networks = [anvilNetwork];

type WagmiChainParameters = CreateConfigParameters["chains"];

const wagmiChainConfig: WagmiChainParameters = networks.map((network) => ({
  id: network.id,
  name: network.name,
  nativeCurrency: network.nativeCurrency,
  rpcUrls: {
    default: { http: network.rpcUrls.default.http },
  },
  // Type requires at least 1 chain object. networks is guaranteed to always have at least mainnet, so type cast is safe
})) as unknown as WagmiChainParameters;

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
