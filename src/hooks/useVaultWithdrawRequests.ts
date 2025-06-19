import { getWithdrawRequests } from "@/server/withdraw-request";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/const/query-keys";
import { useConfig } from "wagmi";
import { valenceVaultABI } from "@/const";
import { readContract } from "@wagmi/core";
import { parseUnits } from "viem";
import { formatBigInt } from "@/lib";
import { useCosmWasmClient } from "graz";

export const useVaultWithdrawRequests = ({
  vaultAddress,
  ownerAddress,
  tokenDecimals,
  clearingQueueAddress,
  cosmosChainId,
}: {
  vaultAddress: string;
  ownerAddress: string;
  tokenDecimals: number;
  clearingQueueAddress: string;
  cosmosChainId: string;
}) => {
  const config = useConfig();

  const { data: neutronClient } = useCosmWasmClient({
    chainId: cosmosChainId,
  });

  const query = useQuery({
    queryKey: [
      QUERY_KEYS.VAULT_WITHDRAW_REQUESTS,
      vaultAddress,
      ownerAddress,
      tokenDecimals,
    ],
    queryFn: async () => {
      if (!vaultAddress || !ownerAddress) return [];
      if (!neutronClient) throw new Error("Neutron client not found");
      const data = await getWithdrawRequests(ownerAddress, vaultAddress);
      return Promise.all(
        data.map(async (item) => {
          const assetAmount = await readContract(config, {
            address: vaultAddress as `0x${string}`,
            abi: valenceVaultABI,
            functionName: "convertToAssets",
            args: [parseUnits(item.amount, tokenDecimals)],
          });

          let isCompleted = false;
          try {
            isCompleted = await neutronClient.queryContractSmart(
              clearingQueueAddress,
              {
                obligation_status: {
                  id: item.id,
                },
              },
            );
          } catch (error) {
            console.error(error);
          }

          return {
            ...item,
            isCompleted: isCompleted,
            convertedAssetAmount: formatBigInt(assetAmount, tokenDecimals),
          };
        }),
      );
    },
    refetchInterval: 5000,
    enabled:
      !!ownerAddress &&
      !!vaultAddress &&
      !!tokenDecimals &&
      tokenDecimals !== 0,
  });

  const hasWithdrawRequests = (query.data && query.data.length > 0) ?? false;

  const hasActiveWithdrawRequest =
    query.data?.some((item) => !item.isCompleted) ?? false;

  return {
    ...query,
    hasWithdrawRequests,
    hasActiveWithdrawRequest,
  };
};
