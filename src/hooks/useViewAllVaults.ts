"use client";

import { useCallback } from "react";
import { useAccount, useConfig } from "wagmi";
import { QUERY_KEYS, valenceVaultABI } from "@/const";
import { readContract, readContracts } from "@wagmi/core";
import { erc20Abi } from "viem";
import { fetchAprFromApi, fetchAprFromContract, formatBigInt } from "@/lib";
import { useQueries } from "@tanstack/react-query";
import { useVaultsConfig, type VaultConfig } from "@/context";

export function useViewAllVaults(): UseViewAllVaultsReturnValue {
  const { address, chainId } = useAccount();
  const config = useConfig();
  const { vaultsConfig } = useVaultsConfig();

  // fetches vault data for a single vault
  const fetchVaultData = useCallback(
    async (vault: VaultConfig) => {
      const generalVaultData = await readContracts(config, {
        contracts: [
          {
            abi: erc20Abi,
            address: vault.evm.tokenAddress,
            functionName: "decimals",
            args: [],
          },
          {
            abi: valenceVaultABI,
            address: vault.evm.vaultProxyAddress,
            functionName: "decimals",
            args: [],
          },
          {
            // tvl
            abi: valenceVaultABI,
            address: vault.evm.vaultProxyAddress,
            functionName: "totalAssets",
            args: [],
          },
          {
            // total shares
            abi: valenceVaultABI,
            address: vault.evm.vaultProxyAddress,
            functionName: "totalSupply",
            args: [],
          },
          {
            abi: valenceVaultABI,
            address: vault.evm.vaultProxyAddress,
            functionName: "redemptionRate",
            args: [],
          },
        ],
      });

      if (!generalVaultData) {
        throw new Error("Failed to fetch all vault data");
      }
      const tokenDecimals = Number(generalVaultData[0].result);
      const shareDecimals = Number(generalVaultData[1].result);
      const tvl = generalVaultData[2].result;
      const totalShares = generalVaultData[3].result;
      const redemptionRate = generalVaultData[4].result;
      if (!tokenDecimals || !shareDecimals) {
        // if these are undefined, unit conversions cannot be done
        throw new Error("Failed to fetch all vault data");
      }

      let userVaultShares = BigInt(0);
      let userVaultAssets = BigInt(0);

      if (address) {
        userVaultShares = await readContract(config, {
          abi: valenceVaultABI,
          address: vault.evm.vaultProxyAddress,
          functionName: "balanceOf",
          args: [address as `0x${string}`],
        });

        userVaultAssets = await readContract(config, {
          abi: valenceVaultABI,
          address: vault.evm.vaultProxyAddress,
          functionName: "convertToAssets",
          args: [userVaultShares],
        });
      }

      let apr: string | undefined = undefined;
      if (vault.aprRequest.type === "contract") {
        apr = await fetchAprFromContract(vault, config, tokenDecimals);
      } else if (vault.aprRequest.type === "api") {
        apr = await fetchAprFromApi(vault);
      }
      const aprPercentage = apr
        ? (parseFloat(apr) * 100).toString()
        : undefined;

      const result = {
        ...vault,
        tokenDecimals,
        shareDecimals,
        aprPercentage,
        totalShares: formatBigInt(totalShares ?? BigInt(0), shareDecimals),
        tvl: formatBigInt(tvl ?? BigInt(0), tokenDecimals),
        userVaultShares: formatBigInt(userVaultShares, shareDecimals),
        userVaultAssets: formatBigInt(userVaultAssets, tokenDecimals),
        redemptionRate: formatBigInt(
          redemptionRate ?? BigInt(0),
          shareDecimals,
        ),
      };
      return result;
    },
    [config, address],
  );

  const {
    data: vaults,
    isLoading,
    isError,
  } = useQueries({
    queries: vaultsConfig
      .filter((vaultConfig) =>
        chainId ? vaultConfig.evm.chainId === chainId : true,
      )
      .map((vaultConfig) => ({
        refetchInterval: 30000, // 30 seconds
        enabled: vaultsConfig?.length > 0,
        queryKey: [QUERY_KEYS.VAULT_DATA, vaultConfig.vaultId, address],
        queryFn: async () => {
          return fetchVaultData(vaultConfig);
        },
      })),
    combine: (results) => {
      const _errors = results
        .filter((result) => result.isError)
        .map((result) => result.error);
      const combinedResults = {
        data: results
          .flatMap((result) => result.data)
          .filter((data) => data !== undefined),
        isLoading: results.some((result) => result.isLoading),
        isError: results.some((result) => result.isError),
        errors: _errors.length > 0 ? _errors : undefined,
      };
      if (combinedResults.errors) {
        console.error(
          "Error fetching vault data. Errors:",
          combinedResults.errors,
        );
      }
      return combinedResults;
    },
  });

  return {
    isLoading: isLoading,
    isError,
    vaults,
    chainId,
  };
}

export type VaultSummaryData = VaultConfig & {
  tokenDecimals: number;
  shareDecimals: number;
  aprPercentage?: string;
  totalShares: string;
  userVaultShares: string;
  userVaultAssets: string;
  tvl: string;
  redemptionRate: string;
};

export type UseViewAllVaultsReturnValue = {
  isLoading: boolean;
  isError: boolean;
  vaults: Array<VaultSummaryData>;
  chainId?: number;
};
