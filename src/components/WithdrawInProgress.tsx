"use client";
import React, { useState, useEffect } from "react";
import { Card, TimelineAnimation } from "@/components";
import { WithdrawRequest } from "@/hooks";
import { useStargateClient } from "graz";
import { useQuery } from "@tanstack/react-query";
import { shortenAddress, microToBase } from "@/lib/helper";
import { QUERY_KEYS } from "@/const";
import { VaultConfig } from "@/context";

export const WithdrawInProgress = ({
  vaultConfig: _vaultConfig,
  withdrawRequest,
}: {
  vaultConfig: VaultConfig;
  withdrawRequest: WithdrawRequest;
}) => {
  const {
    symbol,
    cosmos: {
      chainId: cosmosChainId,
      explorerUrl: cosmosExplorerUrl,
      token: { denom: cosmosTokenDenom, decimals: cosmosTokenDecimals },
    },
    copy: {
      withdrawInProgress: withdrawInProgressCopy,
      withdrawCompleted: withdrawCompletedCopy,
    },
  } = _vaultConfig;

  const [isCompleted, setIsCompleted] = useState(false);

  const { data: neutronClient } = useStargateClient({
    chainId: cosmosChainId,
  });

  useEffect(() => {
    // temporary to simulate the success of the transfer.
    if (!isCompleted) {
      const timer = setInterval(() => {
        setIsCompleted(true);
      }, 10000);

      return () => clearInterval(timer);
    }
  }, [isCompleted, setIsCompleted]);

  const { data: neutronAccountBalance, isLoading } = useQuery({
    queryKey: [
      QUERY_KEYS.NEUTRON_ACCOUNT_BALANCE,
      withdrawRequest?.evmAddress,
      withdrawRequest?.neutronReceiverAddress,
    ],
    enabled: !!neutronClient && !!withdrawRequest?.neutronReceiverAddress,
    refetchInterval: 5000,
    queryFn: async () => {
      const balance = await neutronClient?.getBalance(
        withdrawRequest?.neutronReceiverAddress ?? "",
        cosmosTokenDenom,
      );
      return microToBase(balance?.amount ?? 0, cosmosTokenDecimals);
    },
  });

  if (!withdrawRequest) {
    return null;
  }

  const { convertedAssetAmount, neutronReceiverAddress } = withdrawRequest;

  return (
    <div className="mt-8">
      <Card variant="secondary">
        <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-accent-purple/5 rounded-full blur-xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 -ml-10 -mb-10 bg-accent-purple/5 rounded-full blur-xl"></div>

        <div className="py-4">
          <div className="flex flex-col px-4 max-w-[1200px]">
            <div className="text-xl font-beast text-accent-purple mb-2">
              {isCompleted
                ? withdrawCompletedCopy.title
                : withdrawInProgressCopy.title}
            </div>
            <div>
              <div className="space-y-1">
                <p>
                  {isCompleted
                    ? withdrawCompletedCopy.description
                    : withdrawInProgressCopy.description}
                </p>
                <p>
                  {isCompleted
                    ? `Withdrawal complete. ${convertedAssetAmount} ${symbol} has been transferred to your wallet.`
                    : `Withdrawing ${convertedAssetAmount} ${symbol} to ${shortenAddress(neutronReceiverAddress)}.`}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* col 1 */}
              <div className="flex flex-col w-full items-center pb-2">
                <TimelineAnimation
                  currentStep={isCompleted ? 1 : 0}
                  steps={withdrawInProgressCopy.steps}
                ></TimelineAnimation>
              </div>

              {/* col 2 */}
              <div>
                <div className="flex flex-col w-full items-center">
                  <div className="text-xs text-gray-500 mb-1">
                    Real-time Balance
                  </div>
                  {isLoading ? (
                    <div className="text-3xl font-beast text-accent-purple animate-pulse">
                      ...
                    </div>
                  ) : (
                    <div className="text-3xl font-beast text-accent-purple">
                      {neutronAccountBalance ? neutronAccountBalance : "0.00"}{" "}
                      {symbol}
                    </div>
                  )}
                  <a
                    href={`${cosmosExplorerUrl}/accounts/${neutronReceiverAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-sm font-light text-gray-400 mb-1"
                  >
                    {neutronReceiverAddress}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
