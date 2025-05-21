"use client";

import Link from "next/link";
import {
  useViewAllVaults,
  useVaultContract,
  useTokenBalances,
  useAccounts,
} from "@/hooks";
import { formatNumberString } from "@/lib";
import { useToast } from "@/context";
import { useMutation } from "@tanstack/react-query";
import { Card, WithdrawInProgress, DepositInProgress } from "@/components";
import { VaultDeposit } from "@/components/VaultDeposit";
import { VaultWithdraw } from "@/components/VaultWithdraw";

export default function VaultPage({ params }: { params: { id: string } }) {
  const { isConnected, evmAccount } = useAccounts();
  const { showToast } = useToast();
  const evmAddress = evmAccount?.address;
  const {
    vaults,
    isLoading: isLoadingVaults,
    isError: isVaultsError,
  } = useViewAllVaults();
  const vaultData = vaults?.find((v) => v.vaultId === params.id);
  const tokenSymbol = vaultData?.token ?? "";

  const { ethBalance, tokenBalances } = useTokenBalances({
    address: evmAddress,
    tokenAddresses: vaultData ? [vaultData.tokenAddress] : [],
  });
  const userTokenBalance = tokenBalances?.data?.find(
    (token) => token?.address === vaultData?.tokenAddress,
  )?.balance;

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
      withdrawRequest,
    },
    isLoading: isLoadingContract,
    isError: isContractError,
  } = useVaultContract({
    vaultMetadata: vaultData
      ? {
          vaultProxyAddress: vaultData.vaultProxyAddress,
          tokenAddress: vaultData.tokenAddress,
          tokenDecimals: vaultData.tokenDecimals,
          shareDecimals: vaultData.shareDecimals,
          token: vaultData.token,
          transactionConfirmationTimeout:
            vaultData.transactionConfirmationTimeout,
        }
      : undefined,
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

  const isLoading = isLoadingVaults || isLoadingContract;
  const isError = isVaultsError || isContractError;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-purple"></div>
      </div>
    );
  } else if (isError) {
    return <p>Error loading vault data.</p>;
  } else if (!vaultData) {
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
              {vaultData.copy.name}
            </h1>
            <div className="flex flex-col gap-1 mt-1 text-base text-gray-500">
              <p>
                Vault Address:{" "}
                <a
                  href={`https://etherscan.io/address/${vaultData.vaultProxyAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {vaultData.vaultProxyAddress}
                </a>
              </p>
              <p className="mt-2">{vaultData.copy.description}</p>
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
              {vaultData.aprPercentage ? `${vaultData.aprPercentage} %` : "N/A"}
            </dd>
          </Card>
        </dl>

        {/*shows when user has a deposit, and no pending withdrawal */}
        {isConnected &&
          maxRedeemableShares &&
          parseFloat(maxRedeemableShares) > 0 &&
          // contains copy for vault path and on deposit success
          !withdrawRequest && (
            <DepositInProgress copy={vaultData.copy.depositInProgress} />
          )}

        {/*shows when user has a pending withdrawal */}
        {isConnected && withdrawRequest && (
          <WithdrawInProgress
            withdrawRequest={withdrawRequest}
            copy={vaultData?.copy.withdrawInProgress}
          />
        )}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <VaultDeposit
            vaultData={vaultData}
            userTokenBalance={userTokenBalance}
            isConnected={isConnected}
            previewDeposit={previewDeposit}
            depositWithAmount={depositWithAmount}
            onDepositSuccess={(hash: `0x${string}`) => {
              const toastDescription = vaultData?.aprPercentage
                ? `Your funds are now earning ${vaultData?.aprPercentage}% APY!`
                : "Funds are now earning yield.";
              showToast({
                title: "Deposit successful",
                description: toastDescription,
                type: "success",
                txHash: hash,
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
            vaultData={vaultData}
            maxRedeemableShares={maxRedeemableShares}
            previewRedeem={previewRedeem}
            withdrawShares={withdrawShares}
            onWithdrawSuccess={(hash: `0x${string}`) => {
              showToast({
                title: "Withdraw submitted",
                description: "Assets will be sent to your Neutron account.",
                type: "success",
                txHash: hash,
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
