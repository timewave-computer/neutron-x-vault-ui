import { useState } from "react";
import { Button, Input, Card } from "@/components";
import { handleNumberInput, shortenAddress } from "@/lib";
import { useMutation, useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/const";
import { useAccounts } from "@/hooks";
import { useWalletModal } from "@/context";

interface VaultWithdrawProps {
  vaultData: {
    vaultProxyAddress: string;
    token: string;
    copy: {
      withdraw: {
        title: string;
        description: string;
        cta: string;
      };
    };
  };
  maxRedeemableShares: string | undefined;
  previewRedeem: (amount: string) => Promise<string>;
  withdrawShares: ({
    shares,
    maxLossBps,
    allowSolverCompletion,
    neutronRecieverAddress,
  }: {
    shares: string;
    maxLossBps?: number;
    allowSolverCompletion?: boolean;
    neutronRecieverAddress: string;
  }) => Promise<`0x${string}` | undefined>;
  onWithdrawSuccess: (hash: `0x${string}`) => void;
  onWithdrawError: (error: Error) => void;
}

export const VaultWithdraw = ({
  vaultData,
  maxRedeemableShares,
  previewRedeem,
  withdrawShares,
  onWithdrawSuccess,
  onWithdrawError,
}: VaultWithdrawProps) => {
  const [withdrawInput, setWithdrawInput] = useState("");
  const { openModal } = useWalletModal();

  const { isConnected, isCosmosConnected, isEvmConnected, cosmosAccounts } =
    useAccounts();

  const cosmosAddress = cosmosAccounts?.find(
    (account) => account.chainId === "neutron-1",
  )?.address;

  const { data: previewRedeemAmount } = useQuery({
    enabled:
      !!vaultData?.vaultProxyAddress &&
      parseFloat(withdrawInput) > 0 &&
      isConnected,
    staleTime: 0,
    queryKey: [
      QUERY_KEYS.VAULT_PREVIEW_WITHDRAW,
      vaultData?.vaultProxyAddress,
      withdrawInput,
    ],
    queryFn: () => {
      return previewRedeem(withdrawInput);
    },
  });

  const { mutate: handleWithdraw, isPending: isWithdrawing } = useMutation({
    mutationFn: async (neutronRecieverAddress: string) => {
      if (!withdrawInput || !isConnected || !vaultData)
        throw new Error("Unable to initiate withdrawal");
      const result = await withdrawShares({
        shares: withdrawInput,
        neutronRecieverAddress,
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

  const isDisabled =
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
          {vaultData.copy.withdraw.title}
        </h3>
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-gray-500">
            {vaultData.copy.withdraw.description}
          </p>
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
          {vaultData.copy.withdraw.cta}
        </Button>
      ) : (
        <>
          {!isCosmosConnected || !cosmosAddress ? (
            <Button
              disabled={isDisabled}
              onClick={openModal}
              className="mt-4"
              fullWidth
            >
              Connect to Neutron
            </Button>
          ) : (
            <Button
              className="mt-4"
              onClick={() => handleWithdraw(cosmosAddress)}
              disabled={isDisabled}
              variant="primary"
              fullWidth
              isLoading={isWithdrawing}
            >
              {isWithdrawing
                ? "Confirm in Wallet..."
                : vaultData.copy.withdraw.cta}
            </Button>
          )}
        </>
      )}

      {/* Withdraw estimate and warning display */}
      <div className="h-6 mt-4 flex justify-between items-center">
        {withdrawInput &&
          parseFloat(withdrawInput) > 0 &&
          previewRedeemAmount && (
            <p className="text-sm text-gray-500">
              ≈ {previewRedeemAmount} {vaultData.token}{" "}
              {cosmosAddress ? "to " + shortenAddress(cosmosAddress) : ""}
            </p>
          )}
        {isConnected &&
          withdrawInput &&
          (!maxRedeemableShares || maxRedeemableShares === "0") && (
            <p className="text-sm text-secondary">
              You need vault shares to withdraw
            </p>
          )}
        {isConnected &&
          withdrawInput &&
          maxRedeemableShares &&
          parseFloat(withdrawInput) > parseFloat(maxRedeemableShares) && (
            <p className="text-sm text-secondary">Insufficient vault balance</p>
          )}
      </div>
    </Card>
  );
};
