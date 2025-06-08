import { CreateConfigParameters, createConfig, http } from "wagmi";
import { Chain, createClient } from "viem";
import { mainnet } from "wagmi/chains";

/***
 * Config Wagmi & AppKit support
 */

let wagmiChainConfig: CreateConfigParameters["chains"] = [mainnet];

const anvilRpcUrl = process.env.NEXT_PUBLIC_ANVIL_RPC_URL as string;
if (anvilRpcUrl) {
  const anvilNetwork = {
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
  wagmiChainConfig = [...wagmiChainConfig, anvilNetwork as Chain];
}

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
