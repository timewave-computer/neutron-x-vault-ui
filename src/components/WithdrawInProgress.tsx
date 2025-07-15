"use client";
import React from "react";
import { Card, TimelineAnimation } from "@/components";
import { useStargateClient } from "graz";
import { useQuery } from "@tanstack/react-query";
import { shortenAddress, microToBase, formatNumberString } from "@/lib/helper";
import { QUERY_KEYS } from "@/const";
import { VaultConfig } from "@/context";
import { type WithdrawRequestData } from "@/hooks";

export const WithdrawInProgress = ({
  vaultConfig: _vaultConfig,
  withdrawRequest,
}: {
  vaultConfig: VaultConfig;
  withdrawRequest: WithdrawRequestData["latest"];
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

  const { data: neutronClient } = useStargateClient({
    chainId: cosmosChainId,
  });

  const { data: neutronAccountBalance, isLoading } = useQuery({
    queryKey: [
      QUERY_KEYS.NEUTRON_ACCOUNT_BALANCE,
      withdrawRequest?.owner_address,
      withdrawRequest?.receiver_address,
    ],
    enabled: !!neutronClient && !!withdrawRequest?.receiver_address,
    refetchInterval: 5000,
    queryFn: async () => {
      const balance = await neutronClient?.getBalance(
        withdrawRequest?.receiver_address ?? "",
        cosmosTokenDenom,
      );
      return microToBase(balance?.amount ?? 0, cosmosTokenDecimals);
    },
  });

  if (!withdrawRequest) {
    return null;
  }

  const { convertedAssetAmount, receiver_address } = withdrawRequest;

  return (
    <div className="mt-8">
      <Card variant="secondary">
        <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-accent-purple/5 rounded-full blur-xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 -ml-10 -mb-10 bg-accent-purple/5 rounded-full blur-xl"></div>

        <div className="py-4">
          <div className="flex flex-col px-4 max-w-[1200px]">
            <div className="text-2xl font-beast text-accent-purple mb-2">
              {withdrawRequest.isCompleted
                ? withdrawCompletedCopy.title
                : withdrawInProgressCopy.title}
            </div>
            <div>
              <div>
                <p className="text-sm font-light text-gray-500 pb-1">
                  Reciever Address:{" "}
                  <a
                    href={`${cosmosExplorerUrl}/accounts/${receiver_address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {receiver_address}
                  </a>
                </p>
                <p className="text-sm font-light text-gray-500 pb-2">
                  Withdraw Quantity:{" "}
                  {formatNumberString(convertedAssetAmount, symbol, {
                    displayDecimals: _vaultConfig.displayDecimals,
                    useSignificantFigures: true,
                  })}
                </p>

                <p className="mt-2">
                  {withdrawRequest.isCompleted
                    ? withdrawCompletedCopy.description
                    : withdrawInProgressCopy.description}
                </p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* col 1 */}
              <div className="flex flex-col w-full items-center pb-2">
                <TimelineAnimation
                  currentStep={withdrawRequest.isCompleted ? 1 : 0}
                  steps={withdrawInProgressCopy.steps}
                ></TimelineAnimation>
              </div>

              {/* col 2 */}
              <div>
                <div className="flex flex-col w-full items-center">
                  <div className="text-sm text-accent-purple mb-1">
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
                    href={`${cosmosExplorerUrl}/accounts/${receiver_address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-sm font-light text-gray-500 mb-1"
                  >
                    {shortenAddress(receiver_address)}
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
