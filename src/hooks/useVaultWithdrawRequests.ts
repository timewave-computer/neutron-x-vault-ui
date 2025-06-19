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
      const data = await getWithdrawRequests(
        "0x510c4a1d637ff374399826f421003b775dc3e8dc",
        vaultAddress,
      );
      return Promise.all(
        data.map(async (item) => {
          console.log(
            "item amount",
            item.amount,
            "tokenDecimals",
            tokenDecimals,
          );
          const assetAmount = await readContract(config, {
            address: vaultAddress as `0x${string}`,
            abi: valenceVaultABI,
            functionName: "convertToAssets",
            args: [parseUnits(item.amount, tokenDecimals)],
          });

          console.log("assetAmount", assetAmount);

          let isCompleted = false;
          try {
            isCompleted = await neutronClient?.queryContractSmart(
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

  return {
    ...query,
    hasWithdrawRequests,
  };
};
