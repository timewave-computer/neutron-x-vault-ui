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

/**
 * Formats a number to show a specific number of significant figures
 * Useful for small numbers like 0.000047 to show as 0.000047 (4 sig figs)
 */
function formatToSignificantFigures(
  value: number,
  significantFigures: number = 4,
): string {
  if (value === 0) return "0";

  // Convert to scientific notation to count significant figures
  const scientific = value.toExponential(significantFigures - 1);

  // Parse the scientific notation to get the coefficient and exponent
  const [coefficient, exponentStr] = scientific.split("e");
  const exponent = parseInt(exponentStr);

  // For negative exponents, we need to show leading zeros
  if (exponent < 0) {
    // Calculate how many zeros we need after the decimal point
    const zerosNeeded = Math.abs(exponent) - 1;
    const zeros = "0".repeat(zerosNeeded);

    // Remove the decimal point from coefficient and add zeros
    const digits = coefficient.replace(".", "");
    return `0.${zeros}${digits}`;
  }

  // For non-negative exponents, just return the coefficient
  return coefficient;
}

export function formatNumberString(
  _value: string | undefined,
  symbol: string,
  options?: {
    displayDecimals?: number; // fraction precision
    useSignificantFigures?: boolean; // for small numbers
  },
): string {
  const value = _value ?? "0";
  const displayDecimals = options?.displayDecimals ?? defaultDisplayDecimals;
  const useSignificantFigures = options?.useSignificantFigures ?? false;
  const numValue = parseFloat(value);

  if (numValue === 0) {
    return symbol === "" ? "0" : symbol === "%" ? "0%" : `0 ${symbol}`;
  }

  // For very small numbers, use significant figures
  if (numValue < 0.001 && numValue > 0 && useSignificantFigures) {
    const formatted = formatToSignificantFigures(numValue, displayDecimals);

    if (symbol === "") {
      return formatted;
    }
    if (symbol === "%") {
      return `${formatted}%`;
    }
    return `${formatted} ${symbol}`;
  }

  const formatted = numValue.toFixed(displayDecimals);

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
