"use client";
import { useState } from "react";
import { Button, Input, Card } from "@/components";
import { handleNumberInput, shortenAddress } from "@/lib";
import { useMutation, useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/const";
import { type PreviewTransactionData, useAccounts } from "@/hooks";
import { useWalletModal, type VaultConfig } from "@/context";
import { getChainInfo } from "@/config";

interface VaultWithdrawProps {
  vaultConfig: VaultConfig;
  maxRedeemableShares: string | undefined;
  previewRedeem: (amount: string) => Promise<PreviewTransactionData>;
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
  onWithdrawSuccess: (hash: `0x${string}`) => void;
  onWithdrawError: (error: Error) => void;
}

export const VaultWithdraw = ({
  vaultConfig,
  maxRedeemableShares,
  previewRedeem,
  withdrawShares,
  onWithdrawSuccess,
  onWithdrawError,
}: VaultWithdrawProps) => {
  const {
    symbol,
    cosmos: { chainId: cosmosChainId },
    copy: { withdraw: withdrawCopy },
    evm: { vaultAddress },
  } = vaultConfig;
  const [withdrawInput, setWithdrawInput] = useState("");
  const { openModal } = useWalletModal();

  const { isConnected, isCosmosConnected, isEvmConnected, cosmosAccounts } =
    useAccounts();

  const userCosmosAddress = cosmosAccounts?.find(
    (account) => account.chainId === cosmosChainId,
  )?.address;
  const cosmosChainInfo = getChainInfo(cosmosChainId);
  const cosmosChainName = cosmosChainInfo?.chainName;

  const { data: previewRedeemData } = useQuery({
    enabled: !!vaultAddress && parseFloat(withdrawInput) > 0 && isConnected,
    staleTime: 0,
    queryKey: [QUERY_KEYS.VAULT_PREVIEW_WITHDRAW, vaultAddress, withdrawInput],
    queryFn: () => {
      return previewRedeem(withdrawInput);
    },
  });

  const { mutate: handleWithdraw, isPending: isWithdrawing } = useMutation({
    mutationFn: async (neutronReceiverAddress: string) => {
      if (!withdrawInput || !isConnected || !vaultConfig)
        throw new Error("Unable to initiate withdrawal");
      const result = await withdrawShares({
        shares: withdrawInput,
        neutronReceiverAddress,
      });
      if (!result) throw new Error("Transaction failed");
      return result;
    },
    onSuccess: (hash) => {
      setWithdrawInput("");
      onWithdrawSuccess(hash);
    },
    onError: (err) => {
      if (err instanceof Error) {
        onWithdrawError(err);
      }
    },
  });

  const isWithdrawDisabled =
    !isEvmConnected ||
    !withdrawInput ||
    isWithdrawing ||
    !maxRedeemableShares ||
    maxRedeemableShares === "0" ||
    parseFloat(withdrawInput) > parseFloat(maxRedeemableShares) ||
    parseFloat(withdrawInput) <= 0;

  return (
    <Card variant="primary">
      <div className="mb-6">
        <h3 className="text-lg font-beast text-accent-purple mb-1">
          {withdrawCopy.title}
        </h3>
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-gray-500">{withdrawCopy.description}</p>
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500">
              Available: {maxRedeemableShares} shares
            </p>
            <Button
              onClick={() => setWithdrawInput(maxRedeemableShares ?? "0")}
              disabled={!isConnected}
              variant="secondary"
              size="sm"
            >
              MAX
            </Button>
          </div>
        </div>
      </div>

      {/* Withdraw input */}
      <div className="flex rounded-lg border-2 border-primary/40">
        <Input
          type="number"
          id="withdrawInput"
          name="withdrawInput"
          aria-label="Withdraw shares amount"
          min="0"
          step="any"
          inputMode="decimal"
          value={withdrawInput}
          placeholder="0.0"
          onChange={(e) => {
            const value = e.target.value;
            handleNumberInput(value, setWithdrawInput);
          }}
          isEnabled={isEvmConnected && !isWithdrawing}
          isError={
            parseFloat(withdrawInput) > parseFloat(maxRedeemableShares ?? "0")
          }
        />
        <div className="flex items-center bg-primary-light px-4 text-base text-black border-l-2 border-primary/40 rounded-r-lg">
          Shares
        </div>
      </div>

      {!isEvmConnected ? (
        <Button className="mt-4" disabled={true} variant="primary" fullWidth>
          {withdrawCopy.cta}
        </Button>
      ) : (
        <>
          {!isCosmosConnected || !userCosmosAddress ? (
            <Button
              disabled={isWithdrawDisabled}
              onClick={openModal}
              className="mt-4"
              fullWidth
            >
              Connect to {cosmosChainName}
            </Button>
          ) : (
            <Button
              className="mt-4"
              onClick={() => handleWithdraw(userCosmosAddress)}
              disabled={isWithdrawDisabled}
              variant="primary"
              fullWidth
              isLoading={isWithdrawing}
            >
              {isWithdrawing ? "Confirm in Wallet..." : withdrawCopy.cta}
            </Button>
          )}
        </>
      )}

      {/* Withdraw estimate and warning display */}
      <div className=" mt-2 flex flex-col gap-1">
        <div className="h-4 flex gap-2 justify-between items-center">
          {withdrawInput &&
            parseFloat(withdrawInput) > 0 &&
            previewRedeemData && (
              <>
                <p className="text-sm text-gray-500">
                  ≈ {previewRedeemData.amount} {symbol}{" "}
                  {userCosmosAddress
                    ? "to " + shortenAddress(userCosmosAddress)
                    : ""}
                </p>
                <p className="text-sm text-gray-500">
                  {previewRedeemData.fee} {symbol} withdraw fee
                </p>
              </>
            )}
        </div>
        {isConnected &&
          withdrawInput &&
          maxRedeemableShares &&
          parseFloat(withdrawInput) > parseFloat(maxRedeemableShares) && (
            <p className="text-sm text-secondary text-right">
              Insufficient vault balance
            </p>
          )}
      </div>
    </Card>
  );
};
