import { formatUnits } from "viem";

const defaultDisplayDecimals = 4;

export function formatBigInt(
  _value: bigint | undefined,
  decimals: number,
): string {
  const value = _value ?? BigInt(0);

  // Use formatUnits to shift the decimal point
  return formatUnits(value, decimals);
}

export function formatNumberString(
  _value: string | undefined,
  symbol: string,
  options?: {
    displayDecimals?: number; // fraction precision
  },
): string {
  const value = _value ?? "0";
  const displayDecimals = options?.displayDecimals ?? defaultDisplayDecimals;

  const formatted = parseFloat(value).toFixed(displayDecimals);

  if (symbol === "") {
    return `${formatted}`;
  }
  if (symbol === "%") {
    return `${formatted}%`;
  }

  return `${formatted} ${symbol}`;
}

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
