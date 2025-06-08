import { getWithdrawRequest } from "@/server/withdraw-request";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/const/query-keys";
import { useConfig } from "wagmi";
import { valenceVaultABI } from "@/const";
import { readContract } from "@wagmi/core";
import { parseUnits } from "viem";
import { formatBigInt } from "@/lib";

export const useVaultWithdrawRequests = ({
  vaultAddress,
  ownerAddress,
  tokenDecimals,
}: {
  vaultAddress: string;
  ownerAddress: string;
  tokenDecimals: number;
}) => {
  const config = useConfig();
  const query = useQuery({
    queryKey: [QUERY_KEYS.VAULT_WITHDRAW_REQUESTS, vaultAddress, ownerAddress],
    queryFn: async () => {
      if (!vaultAddress || !ownerAddress) return [];
      const data = await getWithdrawRequest(ownerAddress, vaultAddress);
      return Promise.all(
        data.map(async (item) => {
          const assetAmount = await readContract(config, {
            address: vaultAddress as `0x${string}`,
            abi: valenceVaultABI,
            functionName: "convertToAssets",
            args: [parseUnits(item.amount, tokenDecimals)],
          });

          return {
            ...item,
            isCompleted: false,
            convertedAssetAmount: formatBigInt(assetAmount, tokenDecimals),
          };
        }),
      );
    },
    refetchInterval: 5000,
    enabled: !!ownerAddress && !!vaultAddress,
  });

  const hasActiveWithdrawRequest = query.data?.some(
    (item) => !item.isCompleted,
  );

  return {
    ...query,
    hasActiveWithdrawRequest,
  };
};
