"use client";
import React, { useState, useEffect } from "react";
import { Card, TimelineAnimation } from "@/components";
import { WithdrawRequest } from "@/hooks";
import { useStargateClient } from "graz";
import { useQuery } from "@tanstack/react-query";
import { shortenAddress } from "@/lib/helper";
import { QUERY_KEYS } from "@/const";

interface WithdrawInProgressProps {
  copy: {
    title: string;
    description: string;
    cta: string;
  };
  withdrawRequest?: WithdrawRequest;
}

const NTRN_DECIMALS = 6;

export const WithdrawInProgress: React.FC<WithdrawInProgressProps> = ({
  copy,
  withdrawRequest,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { data: neutronClient } = useStargateClient({
    chainId: "neutron-1",
  });

  useEffect(() => {
    // temporary to simulate the success of the transfer.
    if (currentStep === 0) {
      const timer = setInterval(() => {
        setCurrentStep((prevStep) => (prevStep < 1 ? prevStep + 1 : prevStep));
      }, 5000);

      return () => clearInterval(timer);
    }
  }, [currentStep]);

  const { data: neutronAccountBalance } = useQuery({
    queryKey: [
      QUERY_KEYS.NEUTRON_ACCOUNT_BALANCE,
      withdrawRequest?.evmAddress,
      withdrawRequest?.neutronRecieverAddress,
    ],
    enabled: !!neutronClient && !!withdrawRequest?.neutronRecieverAddress,
    refetchInterval: 5000,
    queryFn: async () => {
      const balance = await neutronClient?.getBalance(
        withdrawRequest?.neutronRecieverAddress ?? "",
        "untrn",
      );
      return microToBase(balance?.amount ?? 0, NTRN_DECIMALS);
    },
  });

  if (!withdrawRequest) {
    return null;
  }

  const { convertedAssetAmount, neutronRecieverAddress } = withdrawRequest;

  return (
    <div className="mt-8">
      <Card variant="secondary">
        <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-accent-purple/5 rounded-full blur-xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 -ml-10 -mb-10 bg-accent-purple/5 rounded-full blur-xl"></div>

        <div className="py-4">
          <div className="flex flex-col px-4 max-w-[1200px]">
            <div className="text-xl font-beast text-accent-purple mb-2">
              {copy.title}
            </div>
            <div>
              <div className="space-y-1">
                <p>{copy.description}</p>
                <p>
                  Withdrawing {convertedAssetAmount} LBTC to{" "}
                  {shortenAddress(neutronRecieverAddress)}.
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* col 1 */}
              <div className="flex flex-col w-full items-center pb-2">
                <TimelineAnimation
                  currentStep={currentStep}
                  steps={[`Astroport Supervault`, `Neutron Account`]}
                ></TimelineAnimation>
              </div>

              {/* col 2 */}
              <div>
                <div className="flex flex-col w-full items-center">
                  <div className="text-xs text-gray-500 mb-1">
                    Real-time Balance
                  </div>
                  <div className="text-3xl font-beast text-accent-purple">
                    {neutronAccountBalance ? neutronAccountBalance : "0.00"}{" "}
                    LBTC
                  </div>
                  <a
                    href={`https://neutron.celat.one/neutron-1/accounts/${neutronRecieverAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-sm font-light text-gray-400 mb-1"
                  >
                    {neutronRecieverAddress}
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

// convert micro denom to denom
export const microToBase = (
  amount: number | string,
  decimals: number,
): number => {
  if (typeof amount === "string") {
    amount = Number(amount);
  }
  amount = amount / Math.pow(10, decimals);
  return isNaN(amount) ? 0 : amount;
};
