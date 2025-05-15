import { MinimalWallet } from "@/types/wallet";
import { useEffect, useState } from "react";
import { shortenAddress } from "@/lib";

export function ConnectedWalletDisplay({ wallet }: { wallet: MinimalWallet }) {
  const [address, setAddress] = useState<string | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  useEffect(() => {
    if (wallet.isWalletConnected && wallet.getAddress) {
      setLoadingAddress(true);
      setAddress(null);
      setAddressError(null);
      wallet
        .getAddress()
        .then(setAddress)
        .catch((err) => {
          console.error("Failed to get address:", err);
          setAddressError("Failed to load address");
        })
        .finally(() => setLoadingAddress(false));
    }
  }, [wallet]);

  return (
    <div
      key={`${wallet.walletName}-${wallet.walletChainType}-connected`}
      className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg"
    >
      <div className="flex items-center space-x-3">
        {wallet.walletInfo.logo && (
          <img
            src={wallet.walletInfo.logo}
            alt={wallet.walletPrettyName}
            className="w-6 h-6 rounded-full"
          />
        )}
        <div className="flex flex-col">
          <span className="font-medium">{wallet.walletPrettyName}</span>
          {loadingAddress && (
            <span className="text-xs text-gray-500">Loading address...</span>
          )}
          {addressError && (
            <span className="text-xs text-red-500">{addressError}</span>
          )}
          {address && (
            <span className="text-xs text-gray-600">
              {shortenAddress(address)}
            </span>
          )}
        </div>
      </div>
      <button
        onClick={() => wallet.disconnect()}
        className="px-3 py-1 border border-red-500 text-red-500 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors duration-200"
      >
        Disconnect
      </button>
    </div>
  );
}
