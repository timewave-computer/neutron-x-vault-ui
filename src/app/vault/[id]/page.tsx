"use client";

import Link from "next/link";
import { useVaultContract, useTokenBalances, useAccounts } from "@/hooks";
import { formatNumberString } from "@/lib";
import { useToast, useVaultsConfig } from "@/context";
import {
  Card,
  WithdrawInProgress,
  DepositInProgress,
  VaultWithdraw,
  VaultDeposit,
  WithdrawRequestsTable,
} from "@/components";
import { useMemo } from "react";

export default function VaultPage({ params }: { params: { id: string } }) {
  const { isConnected, evmAccount } = useAccounts();
  const { showToast } = useToast();
  const evmAddress = evmAccount?.address;
  const { getVaultConfig } = useVaultsConfig();
  const vaultConfig = useMemo(
    () => getVaultConfig(params.id),
    [params.id, getVaultConfig],
  );
  const tokenSymbol = vaultConfig?.symbol ?? "";

  const { ethBalance, tokenBalances } = useTokenBalances({
    address: evmAddress,
    tokenAddresses: vaultConfig ? [vaultConfig.evm.tokenAddress] : [],
  });
  const userTokenBalance =
    tokenBalances?.data?.find(
      (token) => token?.address === vaultConfig?.evm.tokenAddress,
    )?.balance ?? 0;

  const {
    depositWithAmount,
    withdrawShares,
    refetch: refetchVaultContract,
    previewRedeem,
    previewDeposit,
    data: {
      tvl,
      maxRedeemableShares,
      shareBalance: userShares,
      assetBalance: userVaultAssets,
      withdrawRequests,
      apr,
    },
    isLoading: isLoadingContract,
    isError: isContractError,
  } = useVaultContract({
    vaultId: params.id,
  });

  const userSharesFormatted = formatNumberString(userShares, "shares", {
    displayDecimals: 2,
  });

  const userVaultAssetsFormatted = formatNumberString(
    userVaultAssets,
    tokenSymbol,
    {
      displayDecimals: 2,
    },
  );

  const vaultTvlFormatted = formatNumberString(tvl, tokenSymbol, {
    displayDecimals: 2,
  });

  const isLoading = isLoadingContract;
  const isError = isContractError;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-purple"></div>
      </div>
    );
  } else if (isError) {
    return <p>Error loading vault data.</p>;
  } else if (!vaultConfig) {
    return (
      <div className="text-center">
        <h1 className="text-3xl font-beast text-accent-purple sm:text-4xl">
          Vault Not Found
        </h1>
        <p className="mt-4 text-gray-500">
          The vault you are looking for does not exist.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-lg bg-accent-purple px-8 py-3 text-sm font-medium text-white transition hover:scale-110 hover:shadow-xl focus:outline-none focus:ring active:bg-accent-purple-hover"
        >
          Go back home
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Content */}
      <div className="relative">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-beast text-primary sm:text-4xl">
              {vaultConfig.copy.name}
            </h1>
            <div className="flex flex-col gap-1 mt-1 text-base text-gray-500">
              <p>
                Vault Address:{" "}
                <a
                  href={`${vaultConfig.evm.explorerUrl}/address/${vaultConfig.evm.vaultAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {vaultConfig.evm.vaultAddress}
                </a>
              </p>
              <p className="mt-2">{vaultConfig.copy.description}</p>
            </div>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-4">
          <Card variant="secondary" className="text-center">
            <dt className="text-base text-black">Your Balance</dt>
            <dd className="mt-2 text-2xl font-beast text-accent-purple text-wrap break-words">
              {isConnected ? userSharesFormatted : "-"}
            </dd>
          </Card>

          <Card variant="secondary" className="text-center">
            <dt className="text-base text-black">Your Position</dt>
            <dd className="mt-2 text-2xl font-beast text-accent-purple text-wrap break-words">
              {isConnected ? userVaultAssetsFormatted : "-"}
            </dd>
          </Card>

          <Card variant="secondary" className="text-center">
            <dt className="text-base text-black">Vault TVL</dt>
            <dd className="mt-2 text-2xl font-beast text-accent-purple text-wrap break-words">
              {vaultTvlFormatted}
            </dd>
          </Card>

          <Card variant="secondary" className="text-center">
            <dt className="text-base text-black">APR</dt>
            <dd className="mt-2 text-2xl font-beast text-secondary text-wrap break-words">
              {apr ? `${apr} %` : "N/A"}
            </dd>
          </Card>
        </dl>

        {/*shows when user has a deposit, and no pending withdrawal */}
        {isConnected &&
          maxRedeemableShares &&
          parseFloat(maxRedeemableShares) > 0 &&
          // contains copy for vault path and on deposit success
          !withdrawRequests.hasActiveWithdrawRequest && (
            <DepositInProgress copy={vaultConfig.copy.depositInProgress} />
          )}

        {/*shows when user has a pending withdrawal */}
        {isConnected && withdrawRequests.hasWithdrawRequests && (
          <>
            <WithdrawInProgress
              key={withdrawRequests.latest?.id}
              vaultConfig={vaultConfig}
              withdrawRequest={withdrawRequests.latest}
            />
            <WithdrawRequestsTable
              withdrawRequests={withdrawRequests.data}
              vaultSymbol={vaultConfig.symbol}
            />
          </>
        )}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <VaultDeposit
            vaultConfig={vaultConfig}
            userTokenBalance={userTokenBalance.toString() ?? "0"}
            isConnected={isConnected}
            previewDeposit={previewDeposit}
            depositWithAmount={depositWithAmount}
            onDepositSuccess={(hash: `0x${string}`) => {
              const toastDescription = apr
                ? `Your funds are now earning ${apr}% APY!`
                : "Funds are now earning yield.";
              showToast({
                title: "Deposit successful",
                description: toastDescription,
                type: "success",
                txUrl: `${vaultConfig.evm.explorerUrl}/tx/${hash}`,
              });
              refetchVaultContract();
              ethBalance.refetch();
            }}
            onDepositError={(err: Error) => {
              showToast({
                title: "Transaction failed",
                description: err.message,
                type: "error",
              });
            }}
          />

          <VaultWithdraw
            vaultConfig={vaultConfig}
            maxRedeemableShares={maxRedeemableShares}
            previewRedeem={previewRedeem}
            withdrawShares={withdrawShares}
            onWithdrawSuccess={(hash: `0x${string}`) => {
              showToast({
                title: "Withdraw submitted",
                description: "Assets will be sent to your Neutron account.",
                type: "success",
                txUrl: `${vaultConfig.evm.explorerUrl}/tx/${hash}`,
              });
              ethBalance.refetch();
              refetchVaultContract();
            }}
            onWithdrawError={(err: Error) => {
              showToast({
                title: "Transaction failed",
                description: err.message,
                type: "error",
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}
