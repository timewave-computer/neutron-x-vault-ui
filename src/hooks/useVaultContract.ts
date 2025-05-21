"use client";
import {
  useAccount,
  usePublicClient,
  useConfig,
  useReadContracts,
} from "wagmi";
import { parseUnits, erc20Abi, BaseError } from "viem";
import { type Address } from "viem";
import { valenceVaultABI } from "@/const";
import { formatBigInt } from "@/lib";
import { readContract } from "@wagmi/core";
import { useConvertToAssets, useWalletClient } from "@/hooks";
import { useState } from "react";
const REFRESH_INTERVAL = 5000;

/**
 * Hook for interacting with an ERC-4626 vault contract
 * Provides functionality for:
 * - Reading token and share balances
 * - Converting between assets and shares
 * - Depositing assets and withdrawing shares
 * - Viewing pending withdrawals
 */

interface UseVaultContractProps {
  vaultMetadata?: {
    vaultProxyAddress: `0x${string}`;
    tokenAddress: `0x${string}`;
    tokenDecimals: number;
    shareDecimals: number;
    transactionConfirmationTimeout: number;
    token: string;
  };
}

// temporary
export interface WithdrawRequest {
  sharesAmount: string;
  convertedAssetAmount?: string;
  evmAddress: Address;
  neutronReceiverAddress: string;
  withdrawId: number;
  redemptionRate: bigint;
}

export function useVaultContract(
  props: UseVaultContractProps,
): UseVaultContractReturnValue {
  const { vaultMetadata } = props;

  const {
    vaultProxyAddress,
    tokenAddress,
    tokenDecimals,
    shareDecimals,
    transactionConfirmationTimeout,
    token: symbol,
  } = vaultMetadata ?? {
    // placeholders
    tokenDecimals: 6,
    shareDecimals: 18,
    token: "",
  };

  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { evm: walletClient } = useWalletClient();
  const config = useConfig();
  // temporary state to mock withdraw in progress
  const [withdrawRequest, setWithdrawRequest] = useState<
    WithdrawRequest | undefined
  >(undefined);

  const vaultMetadataQuery = useReadContracts({
    query: {
      refetchInterval: REFRESH_INTERVAL,
    },
    contracts: [
      {
        // total assetss (tvl)
        abi: valenceVaultABI,
        functionName: "totalAssets",
        address: vaultProxyAddress as Address,
      },
      {
        // redemption rate
        abi: valenceVaultABI,
        functionName: "redemptionRate",
        address: vaultProxyAddress as Address,
      },
    ],
  });

  const tvl = vaultMetadataQuery.data?.[0]?.result;
  const redemptionRate = vaultMetadataQuery.data?.[1]?.result;

  const userDataQuery = useReadContracts({
    query: {
      enabled: isConnected && !!address,
      refetchInterval: REFRESH_INTERVAL,
    },
    contracts: [
      {
        // balance of underlying token
        abi: erc20Abi,
        functionName: "balanceOf",
        address: tokenAddress as Address,
        args: address ? [address] : undefined,
      },
      {
        // balance of vault shares
        abi: valenceVaultABI,
        functionName: "balanceOf",
        address: vaultProxyAddress as Address,
        args: address ? [address] : undefined,
      },
      {
        // maximum shares redeemable
        abi: valenceVaultABI,
        functionName: "maxRedeem",
        address: vaultProxyAddress as Address,
        args: [address as Address],
      },
    ],
  });

  const shareBalance = userDataQuery.data?.[1]?.result;
  const maxRedeemableShares = userDataQuery.data?.[2]?.result;

  // Convert user's share balance to assets
  const convertShareBalanceQuery = useConvertToAssets({
    vaultProxyAddress: vaultProxyAddress as Address,
    shares: shareBalance,
    refetchInterval: REFRESH_INTERVAL,
    enabled: isConnected && !!address && !!shareBalance,
  });

  const userAssetAmount = convertShareBalanceQuery.data;

  // Convert withdraw shares to assets
  const convertWithdrawSharesQuery = useConvertToAssets({
    vaultProxyAddress: vaultProxyAddress as Address,
    shares: parseUnits(
      withdrawRequest?.sharesAmount ?? "0",
      Number(shareDecimals),
    ),
    refetchInterval: REFRESH_INTERVAL,
    enabled: isConnected && !!address && !!withdrawRequest,
  });
  const convertedWithdrawAssetAmount = convertWithdrawSharesQuery.data;

  /**
   *  Vault queries
   */

  //Preview a deposit (tokens -> vault shares)
  const previewDeposit = async (amount: string) => {
    if (!vaultMetadata) throw new Error("Failed to preview deposit");
    if (!address) throw new Error("Not connected");
    if (!walletClient) throw new Error("Wallet not connected");
    if (!publicClient) throw new Error("Public client not initialized");

    const parsedAmount = parseUnits(amount, Number(tokenDecimals));
    const previewAmount = await readContract(config, {
      abi: valenceVaultABI,
      functionName: "previewDeposit",
      address: vaultProxyAddress as Address,
      args: [parsedAmount],
    });

    return formatBigInt(previewAmount, shareDecimals);
  };

  // Preview a withdrawal (vault shares -> tokens)
  const previewRedeem = async (shares: string) => {
    if (!vaultMetadata) throw new Error("Failed to preview redeem");
    if (!address) throw new Error("Not connected");
    if (!walletClient) throw new Error("Wallet not connected");
    if (!publicClient) throw new Error("Public client not initialized");

    const parsedShares = parseUnits(shares, Number(shareDecimals));
    const previewAmount = await readContract(config, {
      abi: valenceVaultABI,
      functionName: "previewRedeem",
      address: vaultProxyAddress as Address,
      args: [parsedShares],
    });

    return formatBigInt(previewAmount, tokenDecimals);
  };

  /**
   * Vault actions
   */

  //Deposit tokens into vault
  const depositWithAmount = async (amount: string) => {
    if (!vaultMetadata) throw new Error("Failed to initiate deposit");
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
        args: [vaultProxyAddress as Address, parsedAmount],
      });

      const approveHash = await walletClient.writeContract(approveRequest);

      // Wait for approval to be mined
      await publicClient.waitForTransactionReceipt({
        hash: approveHash,
        timeout: transactionConfirmationTimeout,
      });

      // deposit tokens into vault
      const { request: depositRequest } = await publicClient.simulateContract({
        address: vaultProxyAddress as Address,
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
    if (!vaultMetadata) throw new Error("Failed to initiate withdraw");
    if (!address) throw new Error("Not connected");
    if (!walletClient) throw new Error("Wallet not connected");
    if (!publicClient) throw new Error("Public client not initialized");

    // Validate share balance
    if (!shareBalance) throw new Error("No shares to withdraw");

    // TODO: include neutronReceiverAddress in the withdraw request

    try {
      setWithdrawRequest({
        sharesAmount: shares,
        evmAddress: address,
        neutronReceiverAddress,
        redemptionRate: redemptionRate ?? BigInt(0),
        withdrawId: 0,
      });
      return "0xplaceholder";

      // const parsedShares = parseUnits(shares, Number(shareDecimals));

      // approve the vault to spend vault shares (shares owned by user)
      // const { request: approveRequest } = await publicClient.simulateContract({
      //   address: vaultProxyAddress as Address,
      //   account: address,
      //   abi: valenceVaultABI,
      //   functionName: "approve",
      //   args: [vaultProxyAddress as Address, parsedShares],
      // });

      // const approveHash = await walletClient.writeContract(approveRequest);

      // // wait for approval to be mined
      // await publicClient.waitForTransactionReceipt({
      //   hash: approveHash,
      //   timeout: transactionConfirmationTimeout,
      // });

      // // redeem shares for tokens
      // const { request: redeemRequest } = await publicClient.simulateContract({
      //   account: address,
      //   address: vaultProxyAddress as Address,
      //   abi: valenceVaultABI,
      //   functionName: "redeem",
      //   args: [
      //     parsedShares,
      //     address,
      //     address,
      //     maxLossBps,
      //     allowSolverCompletion,
      //   ],
      // });

      // const redeemHash = await walletClient.writeContract(redeemRequest);

      // // Wait for withdrawal to be mined
      // const withdrawalReceipt = await publicClient.waitForTransactionReceipt({
      //   hash: redeemHash,
      //   timeout: transactionConfirmationTimeout,
      // });

      // if (withdrawalReceipt.status !== "success") {
      //   console.error("Transaction reciept:", withdrawalReceipt);
      //   throw new Error(
      //     `Transaction reciept status: ${withdrawalReceipt.status}`,
      //   );
      // }

      // return redeemHash;
    } catch (error) {
      handleAndThrowError(error, "Withdraw failed");
    }
  };

  // Refetch all data. Nice utility to use after performing an action
  const refetch = () => {
    vaultMetadataQuery.refetch();
    userDataQuery.refetch();
    convertWithdrawSharesQuery.refetch();
    convertShareBalanceQuery.refetch();
  };

  // statuses
  const isLoading =
    vaultMetadataQuery.isLoading ||
    userDataQuery.isLoading ||
    convertWithdrawSharesQuery.isLoading ||
    convertShareBalanceQuery.isLoading;

  const isError =
    vaultMetadataQuery.isError ||
    userDataQuery.isError ||
    convertWithdrawSharesQuery.isError ||
    convertShareBalanceQuery.isError;

  return {
    isLoading,
    isError,
    refetch,
    depositWithAmount,
    withdrawShares,
    previewDeposit,
    previewRedeem,
    tokenDecimals,
    shareDecimals,
    data: {
      tvl: formatBigInt(tvl, tokenDecimals),
      redemptionRate: formatBigInt(redemptionRate, shareDecimals),
      maxRedeemableShares: formatBigInt(maxRedeemableShares, shareDecimals),
      shareBalance: formatBigInt(shareBalance ?? BigInt(0), shareDecimals),
      assetBalance: formatBigInt(userAssetAmount ?? BigInt(0), tokenDecimals),
      withdrawRequest: withdrawRequest
        ? {
            ...withdrawRequest,
            convertedAssetAmount: formatBigInt(
              convertedWithdrawAssetAmount ?? BigInt(0),
              tokenDecimals,
            ),
          }
        : undefined,
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
  previewDeposit: (amount: string) => Promise<string>;
  previewRedeem: (shares: string) => Promise<string>;
  tokenDecimals: number;
  shareDecimals: number;
  data: {
    tvl?: string;
    redemptionRate?: string;
    maxRedeemableShares?: string;
    shareBalance: string;
    assetBalance: string;
    withdrawRequest?: WithdrawRequest & {
      convertedAssetAmount: string;
    };
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
