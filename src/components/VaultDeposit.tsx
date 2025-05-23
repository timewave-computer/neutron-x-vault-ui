"use client";
import { useState } from "react";
import { Button, Input, Card } from "@/components";
import { handleNumberInput } from "@/lib";
import { useMutation, useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/const";
import { VaultConfig } from "@/context";

interface VaultDepositProps {
  vaultConfig: VaultConfig;
  userTokenBalance: string | undefined;
  isConnected: boolean;
  previewDeposit: (amount: string) => Promise<string>;
  depositWithAmount: (amount: string) => Promise<`0x${string}` | undefined>;
  onDepositSuccess: (hash: `0x${string}`) => void;
  onDepositError: (error: Error) => void;
}

export const VaultDeposit = ({
  vaultConfig,
  userTokenBalance,
  isConnected,
  previewDeposit,
  depositWithAmount,
  onDepositSuccess,
  onDepositError,
}: VaultDepositProps) => {
  const {
    symbol,
    copy: { deposit: depositCopy },
    evm: { vaultAddress },
  } = vaultConfig;

  const [depositInput, setDepositInput] = useState("");

  const { data: previewDepositAmount } = useQuery({
    enabled: !!vaultAddress && parseFloat(depositInput) > 0 && isConnected,
    staleTime: 0,
    queryKey: [QUERY_KEYS.VAULT_PREVIEW_DEPOSIT, vaultAddress, depositInput],
    queryFn: () => {
      return previewDeposit(depositInput);
    },
  });

  const { mutate: handleDeposit, isPending: isDepositing } = useMutation({
    mutationFn: async () => {
      if (!depositInput || !isConnected || !vaultConfig)
        throw new Error("Unable to initiate deposit");
      const result = await depositWithAmount(depositInput);
      if (!result) throw new Error("Transaction failed");
      return result;
    },
    onSuccess: (hash) => {
      setDepositInput("");
      onDepositSuccess(hash);
    },
    onError: (err) => {
      if (err instanceof Error) {
        onDepositError(err);
      }
    },
  });

  const isDepositDisabled =
    !isConnected ||
    !depositInput ||
    isDepositing ||
    !userTokenBalance ||
    parseFloat(depositInput) > parseFloat(userTokenBalance) ||
    parseFloat(depositInput) <= 0;

  return (
    <Card variant="primary">
      <div className="mb-6">
        <h3 className="text-lg font-beast text-accent-purple">
          {depositCopy.title}
        </h3>
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-gray-500">{depositCopy.description}</p>
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500">
              Available: {`${userTokenBalance} ${symbol}`}
            </p>
            <Button
              onClick={() => setDepositInput(userTokenBalance ?? "0")}
              disabled={!isConnected}
              variant="secondary"
              size="sm"
            >
              MAX
            </Button>
          </div>
        </div>
      </div>

      {/* Deposit input */}
      <div className="flex rounded-lg border-2 border-primary/40">
        <Input
          type="number"
          id="depositInput"
          name="depositInput"
          aria-label={`Deposit amount in ${symbol}`}
          placeholder="0.0"
          min="0"
          step="any"
          inputMode="decimal"
          value={depositInput}
          onChange={(e) => {
            const value = e.target.value;
            handleNumberInput(value, setDepositInput);
          }}
          isEnabled={isConnected && !isDepositing}
          isError={
            parseFloat(depositInput) > parseFloat(userTokenBalance ?? "0")
          }
        />

        <div className="flex items-center bg-primary-light px-4 text-base text-black border-l-2 border-primary/40 rounded-r-lg">
          {symbol}
        </div>
      </div>

      <Button
        className="mt-4"
        onClick={() => handleDeposit()}
        disabled={isDepositDisabled}
        variant="primary"
        fullWidth
        isLoading={isDepositing}
      >
        {isDepositing ? "Confirm in Wallet..." : depositCopy.cta}
      </Button>

      {/* Deposit estimate and warning display */}
      <div className="h-6 mt-2 flex justify-between items-center">
        {depositInput &&
          previewDepositAmount &&
          parseFloat(depositInput) > 0 && (
            <p className="text-sm text-gray-500">
              ≈ {previewDepositAmount} shares
            </p>
          )}
        {isConnected &&
          depositInput &&
          userTokenBalance &&
          parseFloat(depositInput) > parseFloat(userTokenBalance) && (
            <p className="text-sm text-secondary">
              Insufficient {symbol} balance
            </p>
          )}
      </div>
    </Card>
  );
};
