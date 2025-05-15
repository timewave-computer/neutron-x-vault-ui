import { mainnetChainsArray, testnetChainsArray } from "graz/chains";

export const allCosmosChains = [...mainnetChainsArray, ...testnetChainsArray];

export const getChainInfo = (chainId: string) => {
  const chain = allCosmosChains.find((chain) => chain.chainId === chainId);
  if (!chain) return undefined;
  return chain;
};
