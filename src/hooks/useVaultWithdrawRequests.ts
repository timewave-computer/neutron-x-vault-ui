import { getWithdrawRequests } from "@/server/withdraw-request";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/const/query-keys";
import { useConfig } from "wagmi";
import { valenceVaultABI } from "@/const";
import { readContract } from "@wagmi/core";
import { parseUnits } from "viem";
import { formatBigInt } from "@/lib";
import { useCosmWasmClient } from "graz";
import { type CosmWasmClient } from "@cosmjs/cosmwasm-stargate";

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
    chainId: "neutron-1", // temporary hardcode. it should always be neutron-1, but should be set in config somewhere
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

          const { isCompleted, isError } = await getObligationStatus(
            neutronClient,
            clearingQueueAddress,
            item.id,
          );

          return {
            ...item,
            isCompleted,
            isError,
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

enum ObligationStatus {
  InQueue = "in_queue",
  Processed = "processed",
}

const getObligationStatus = async (
  neutronClient: CosmWasmClient,
  clearingQueueAddress: string,
  obligationId: number,
): Promise<{
  isCompleted: boolean;
  isError: boolean;
}> => {
  try {
    const obligationStatus = await neutronClient.queryContractSmart(
      clearingQueueAddress,
      {
        obligation_status: {
          id: obligationId,
        },
      },
    );

    if (typeof obligationStatus === "string") {
      if (obligationStatus === ObligationStatus.Processed) {
        return {
          isCompleted: true,
          isError: false,
        };
      } else if (obligationStatus === ObligationStatus.InQueue) {
        return {
          isCompleted: false,
          isError: false,
        };
      } else {
        console.error("Unknown obligation status", obligationStatus);
        return {
          isCompleted: false,
          isError: true,
        };
      }
    } else if (
      typeof obligationStatus === "object" &&
      !!obligationStatus.error
    ) {
      console.error("Obligation error", obligationStatus);
      return {
        isCompleted: false,
        isError: true,
      };
    } else {
      console.error("Unknown obligation status", obligationStatus);
      return {
        isCompleted: false,
        isError: true,
      };
    }
  } catch (error) {
    console.error("Error getting obligation status", error);
    return {
      isCompleted: false,
      isError: true,
    };
  }
};
