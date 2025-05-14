import { CreateConfigParameters, createConfig, http } from "wagmi";
import { networks } from "@/config";
import { createClient } from "viem";

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
  // Configure network transport methods
  // transports:wagmiTransportConfig,
  client({ chain }) {
    return createClient({
      chain,
      transport: http(chain.rpcUrls.default.http[0]),
    });
  },
});
