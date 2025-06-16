"use client";
import {
  useAccount,
  usePublicClient,
  useConfig,
  useReadContracts,
  useReadContract,
} from "wagmi";
import { parseUnits, erc20Abi, BaseError } from "viem";
import { type Address } from "viem";
import { QUERY_KEYS, valenceVaultABI } from "@/const";
import { fetchAprFromApi, fetchAprFromContract, formatBigInt } from "@/lib";
import { readContract } from "@wagmi/core";
import { useWalletClient, useVaultWithdrawRequests } from "@/hooks";
import { useMemo } from "react";
import { useVaultsConfig } from "@/context";
import { useQuery } from "@tanstack/react-query";
const REFRESH_INTERVAL = 5000;

/**
 * Hook for interacting with an ERC-4626 vault contract
 * Provides functionality for:
 * - Reading token and share balances
 * - Converting between assets and shares
 * - Depositing assets and withdrawing shares
 * - Viewing pending withdrawals
 */

export function useVaultContract({
  vaultId,
}: {
  vaultId: string;
}): UseVaultContractReturnValue {
  const { getVaultConfig } = useVaultsConfig();

  const vaultConfig = useMemo(
    () => getVaultConfig(vaultId),
    [vaultId, getVaultConfig],
  );

  const vaultAddress = vaultConfig?.evm.vaultAddress;
  const tokenAddress = vaultConfig?.evm.tokenAddress;
  const transactionConfirmationTimeout =
    vaultConfig?.evm.transactionConfirmationTimeout;

  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { evm: walletClient } = useWalletClient();
  const config = useConfig();
  const vaultMetadataQuery = useReadContracts({
    query: {
      refetchInterval: REFRESH_INTERVAL,
    },
    contracts: [
      {
        abi: erc20Abi,
        address: tokenAddress,
        functionName: "decimals",
        args: [],
      },
      {
        abi: valenceVaultABI,
        address: vaultAddress,
        functionName: "decimals",
        args: [],
      },
      {
        // total assetss (tvl)
        abi: valenceVaultABI,
        functionName: "totalAssets",
        address: vaultAddress as Address,
      },
      {
        // redemption rate
        abi: valenceVaultABI,
        functionName: "redemptionRate",
        address: vaultAddress as Address,
      },
    ],
  });
  const tokenDecimals = vaultMetadataQuery.data?.[0]?.result ?? 0;
  const shareDecimals = vaultMetadataQuery.data?.[1]?.result ?? 0;
  const tvl = vaultMetadataQuery.data?.[2]?.result;
  const redemptionRate = vaultMetadataQuery.data?.[3]?.result;

  const aprQuery = useQuery({
    queryFn: async () => {
      if (!vaultConfig) throw new Error("Vault config not found");
      let apr: string | undefined = undefined;
      if (vaultConfig.aprRequest.type === "contract") {
        apr = await fetchAprFromContract(vaultConfig, config, tokenDecimals);
      } else if (vaultConfig.aprRequest.type === "api") {
        apr = await fetchAprFromApi(vaultConfig);
      }
      return apr ? (parseFloat(apr) * 100).toFixed(2) : undefined;
    },
    queryKey: [QUERY_KEYS.VAULT_APR, vaultId],
    enabled: !!vaultConfig,
    refetchInterval: REFRESH_INTERVAL,
  });

  const userDataQuery = useReadContracts({
    query: {
      enabled: isConnected && !!address,
      refetchInterval: REFRESH_INTERVAL,
    },
    contracts: [
      {
        // balance of vault shares
        abi: valenceVaultABI,
        functionName: "balanceOf",
        address: vaultAddress as Address,
        args: address ? [address] : undefined,
      },
      {
        // maximum shares redeemable
        abi: valenceVaultABI,
        functionName: "maxRedeem",
        address: vaultAddress as Address,
        args: [address as Address],
      },
    ],
  });

  const shareBalance = userDataQuery.data?.[0]?.result;
  const maxRedeemableShares = userDataQuery.data?.[1]?.result;

  // Convert user's share balance to assets
  const convertShareBalanceQuery = useReadContract({
    query: {
      enabled: isConnected && !!address && !!shareBalance,
      refetchInterval: REFRESH_INTERVAL,
    },
    abi: valenceVaultABI,
    functionName: "convertToAssets",
    address: vaultAddress as Address,
    args: shareBalance ? [shareBalance] : [BigInt(0)],
  });

  const userAssetAmount = convertShareBalanceQuery.data;

  /**
   *  Vault queries
   */

  const withdrawRequestsQuery = useVaultWithdrawRequests({
    vaultAddress: vaultAddress as Address,
    ownerAddress: address as Address,
    tokenDecimals: Number(tokenDecimals),
  });

  const convertToAssets = async (amountShares: string) => {
    if (!shareDecimals) throw new Error("Failed to convert to assets");
    if (!address) throw new Error("Not connected");
    if (!walletClient) throw new Error("Wallet not connected");
    if (!publicClient) throw new Error("Public client not initialized");

    const parsedShares = parseUnits(amountShares, Number(shareDecimals));

    const amountAssets = await readContract(config, {
      abi: valenceVaultABI,
      functionName: "convertToAssets",
      address: vaultAddress as Address,
      args: [parsedShares],
    });

    return formatBigInt(amountAssets, tokenDecimals);
  };

  //Preview a deposit (tokens -> vault shares)
  const previewDeposit = async (amountAssets: string) => {
    if (!shareDecimals) throw new Error("Failed to preview deposit");
    if (!address) throw new Error("Not connected");
    if (!walletClient) throw new Error("Wallet not connected");
    if (!publicClient) throw new Error("Public client not initialized");

    const depositFee = await calculateDepositFee(amountAssets);

    const assetsAfterFee = parseFloat(amountAssets) - parseFloat(depositFee);

    const parsedDepositAmount = parseUnits(
      assetsAfterFee.toString(),
      Number(tokenDecimals),
    );

    const previewSharesAmount = await readContract(config, {
      abi: valenceVaultABI,
      functionName: "previewDeposit",
      address: vaultAddress as Address,
      args: [parsedDepositAmount],
    });

    const depositAmount = formatBigInt(previewSharesAmount, shareDecimals);

    return {
      amount: depositAmount,
      fee: depositFee,
    };
  };

  // Preview a withdrawal (vault shares -> tokens)
  const previewRedeem = async (amountShares: string) => {
    if (!tokenDecimals) throw new Error("Failed to preview redeem");
    if (!address) throw new Error("Not connected");
    if (!walletClient) throw new Error("Wallet not connected");
    if (!publicClient) throw new Error("Public client not initialized");

    const withdrawFee = await calculateWithdrawFee(amountShares);

    const amountAfterFee = parseFloat(amountShares) - parseFloat(withdrawFee);

    const parsedAmountAfterFee = parseUnits(
      amountAfterFee.toString(),
      Number(shareDecimals),
    );

    const previewAmount = await readContract(config, {
      abi: valenceVaultABI,
      functionName: "previewRedeem",
      address: vaultAddress as Address,
      args: [parsedAmountAfterFee],
    });

    const withdrawAmount = formatBigInt(previewAmount, tokenDecimals);

    return {
      amount: withdrawAmount,
      fee: withdrawFee,
    };
  };

  // Calculate the deposit fee for a given amount of shares
  const calculateDepositFee = async (assets: string) => {
    if (!tokenDecimals) throw new Error("Failed to calculate deposit fee");
    if (!address) throw new Error("Not connected");
    if (!walletClient) throw new Error("Wallet not connected");
    if (!publicClient) throw new Error("Public client not initialized");

    const parsedAssets = parseUnits(assets, Number(tokenDecimals));
    const previewAmount = await readContract(config, {
      abi: valenceVaultABI,
      functionName: "calculateDepositFee",
      address: vaultAddress as Address,
      args: [parsedAssets],
    });

    return formatBigInt(previewAmount, tokenDecimals);
  };

  // Calculate the withdraw fee for a given amount of shares
  const calculateWithdrawFee = async (amountShares: string) => {
    if (!tokenDecimals) throw new Error("Failed to calculate withdraw fee");
    if (!address) throw new Error("Not connected");
    if (!walletClient) throw new Error("Wallet not connected");
    if (!publicClient) throw new Error("Public client not initialized");

    const amountAssets = await convertToAssets(amountShares);

    const parsedAmountAssets = parseUnits(amountAssets, Number(tokenDecimals));
    const previewAmount = await readContract(config, {
      abi: valenceVaultABI,
      functionName: "calculateWithdrawalFee",
      address: vaultAddress as Address,
      args: [parsedAmountAssets],
    });

    return formatBigInt(previewAmount, tokenDecimals);
  };

  /**
   * Vault actions
   */

  //Deposit tokens into vault
  const depositWithAmount = async (amount: string) => {
    if (!tokenDecimals) throw new Error("Failed to initiate deposit");
    if (!address) throw new Error("Not connected");
    if (!walletClient) throw new Error("Wallet not connected");
    if (!publicClient) throw new Error("Public client not initialized");

    try {
      const parsedAmount = parseUnits(amount, Number(tokenDecimals));

      // approve vault to spend tokens
      const { request: approveRequest } = await publicClient.simulateContract({
        address: tokenAddress as Address,
        account: address,
        abi: erc20Abi,
        functionName: "approve",
        args: [vaultAddress as Address, parsedAmount],
      });

      const approveHash = await walletClient.writeContract(approveRequest);

      // Wait for approval to be mined
      await publicClient.waitForTransactionReceipt({
        hash: approveHash,
        timeout: transactionConfirmationTimeout,
      });

      // deposit tokens into vault
      const { request: depositRequest } = await publicClient.simulateContract({
        address: vaultAddress as Address,
        abi: valenceVaultABI,
        functionName: "deposit",
        args: [parsedAmount, address],
        account: address,
      });

      const depositHash = await walletClient.writeContract(depositRequest);

      // Wait for deposit to be mined
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: depositHash,
        timeout: transactionConfirmationTimeout,
      });

      if (receipt.status !== "success") {
        console.error("Transaction reciept:", receipt);
        throw new Error(`Transaction reciept status: ${receipt.status}`);
      }
      return depositHash;
    } catch (error) {
      handleAndThrowError(error, "Deposit failed");
    }
  };

  // Withdraw shares from vault. Withdraw will be "pending" until the user completes the withdrawal.
  const withdrawShares = async ({
    shares,
    maxLossBps = 1000,
    allowSolverCompletion = false,
    neutronReceiverAddress,
  }: {
    shares: string;
    maxLossBps?: number;
    allowSolverCompletion?: boolean;
    neutronReceiverAddress: string;
  }) => {
    if (!address) throw new Error("Not connected");
    if (!walletClient) throw new Error("Wallet not connected");
    if (!publicClient) throw new Error("Public client not initialized");

    // Validate share balance
    if (!shareBalance) throw new Error("No shares to withdraw");

    try {
      const parsedShares = parseUnits(shares, Number(shareDecimals));

      // approve the vault to spend vault shares (shares owned by user)
      const { request: approveRequest } = await publicClient.simulateContract({
        address: vaultAddress as Address,
        account: address,
        abi: valenceVaultABI,
        functionName: "approve",
        args: [vaultAddress as Address, parsedShares],
      });

      const approveHash = await walletClient.writeContract(approveRequest);

      // wait for approval to be mined
      await publicClient.waitForTransactionReceipt({
        hash: approveHash,
        timeout: transactionConfirmationTimeout,
      });

      // redeem shares for tokens
      const { request: redeemRequest } = await publicClient.simulateContract({
        account: address,
        address: vaultAddress as Address,
        abi: valenceVaultABI,
        functionName: "redeem",
        args: [parsedShares, neutronReceiverAddress, address],
      });

      const redeemHash = await walletClient.writeContract(redeemRequest);

      // Wait for withdrawal to be mined
      const withdrawalReceipt = await publicClient.waitForTransactionReceipt({
        hash: redeemHash,
        timeout: transactionConfirmationTimeout,
      });

      if (withdrawalReceipt.status !== "success") {
        console.error("Transaction reciept:", withdrawalReceipt);
        throw new Error(
          `Transaction reciept status: ${withdrawalReceipt.status}`,
        );
      }

      return redeemHash;
    } catch (error) {
      handleAndThrowError(error, "Withdraw failed");
    }
  };

  // Refetch all data. Nice utility to use after performing an action
  const refetch = () => {
    vaultMetadataQuery.refetch();
    userDataQuery.refetch();
    withdrawRequestsQuery.refetch();
    convertShareBalanceQuery.refetch();
  };

  // statuses
  const isLoading =
    vaultMetadataQuery.isLoading ||
    userDataQuery.isLoading ||
    withdrawRequestsQuery.isLoading ||
    convertShareBalanceQuery.isLoading ||
    aprQuery.isLoading;

  const isError =
    vaultMetadataQuery.isError ||
    userDataQuery.isError ||
    withdrawRequestsQuery.isError ||
    convertShareBalanceQuery.isError ||
    aprQuery.isError;

  return {
    isLoading,
    isError,
    refetch,
    depositWithAmount,
    withdrawShares,
    previewDeposit,
    previewRedeem,
    calculateDepositFee,
    tokenDecimals: tokenDecimals,
    shareDecimals: shareDecimals,
    data: {
      tvl: formatBigInt(tvl, tokenDecimals),
      redemptionRate: formatBigInt(redemptionRate, shareDecimals),
      maxRedeemableShares: formatBigInt(maxRedeemableShares, shareDecimals),
      shareBalance: formatBigInt(shareBalance ?? BigInt(0), shareDecimals),
      assetBalance: formatBigInt(userAssetAmount ?? BigInt(0), tokenDecimals),
      apr: aprQuery.data,
      withdrawRequests: {
        data: withdrawRequestsQuery.data ?? [],
        hasActiveWithdrawRequest:
          withdrawRequestsQuery.hasActiveWithdrawRequest ?? false,
      },
    },
  };
}

interface UseVaultContractReturnValue {
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  depositWithAmount: (amount: string) => Promise<`0x${string}` | undefined>;
  withdrawShares: ({
    shares,
    maxLossBps,
    allowSolverCompletion,
    neutronReceiverAddress,
  }: {
    shares: string;
    maxLossBps?: number;
    allowSolverCompletion?: boolean;
    neutronReceiverAddress: string;
  }) => Promise<`0x${string}` | undefined>;
  previewDeposit: (amount: string) => Promise<PreviewTransactionData>;
  previewRedeem: (shares: string) => Promise<PreviewTransactionData>;
  calculateDepositFee: (amount: string) => Promise<string>;
  tokenDecimals: number;
  shareDecimals: number;
  data: {
    tvl?: string;
    redemptionRate?: string;
    maxRedeemableShares?: string;
    shareBalance: string;
    assetBalance: string;
    withdrawRequests: WithdrawRequests;
    apr?: string;
  };
}

/***
 * Resuable error handling function for contract operations
 * @param error - The error to handle
 * @param defaultMessage - The default message to throw
 */
const handleAndThrowError = (error: unknown, defaultMessage: string) => {
  console.error(defaultMessage, error);
  if (error instanceof BaseError) {
    // @ts-ignore
    // attempt to extract meaningful error message
    const errorName = error.cause?.data?.abiItem?.name;

    const errorMessage =
      errorName && typeof errorName === "string"
        ? `${errorName}. ${error.shortMessage}`
        : error.shortMessage;

    throw new Error(errorMessage);
  } else if (error instanceof Error) {
    throw new Error(error.message);
  } else {
    throw new Error(defaultMessage);
  }
};

export interface WithdrawRequests {
  data: Array<{
    id: number;
    amount: string;
    owner_address: string;
    receiver_address: string;
    block_number: number;
    isCompleted: boolean;
    convertedAssetAmount: string;
  }>;
  hasActiveWithdrawRequest: boolean;
}

export interface PreviewTransactionData {
  amount: string;
  fee: string;
}
