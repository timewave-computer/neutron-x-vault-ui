import { ChainType } from "@/const";
import { useAccount as useCosmosAccount } from "graz";
import { useCallback, useMemo } from "react";
import { useAccount as useEvmAccount } from "wagmi";

export const useAccounts = () => {
  const { data: _cosmosAccounts } = useCosmosAccount({
    multiChain: true,
  });
  const evmAccount = useEvmAccount();

  const cosmosAccounts = useMemo(
    () =>
      Object.entries(_cosmosAccounts ?? {}).map(([chainId, account]) => ({
        ...account,
        address: account?.bech32Address,
        chainId,
      })),
    [_cosmosAccounts],
  );

  const checkIsConnected = useCallback(
    (chainType: ChainType) => {
      if (chainType === ChainType.Evm) {
        return evmAccount.isConnected;
      }
      return cosmosAccounts.some((account) => !!account.address);
      // When _cosmosAccounts changes, it will trigger both the useMemo to update cosmosAccounts and our useCallback to update isConnected
    },
    [_cosmosAccounts, evmAccount],
  );

  return {
    cosmosAccounts,
    evmAccount,
    checkIsConnected,
    isEvmConnected: checkIsConnected(ChainType.Evm),
    isCosmosConnected: checkIsConnected(ChainType.Cosmos),
    isConnected:
      checkIsConnected(ChainType.Evm) || checkIsConnected(ChainType.Cosmos),
  };
};
