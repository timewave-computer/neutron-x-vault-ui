import { MinimalWallet } from "@/types/wallet";
import { shortenAddress } from "@/lib";

export function ConnectedWalletDisplay({
  wallet,
  address,
  chainName,
  onDisconnect,
}: {
  chainName?: string;
  wallet: MinimalWallet;
  address?: string;
  onDisconnect: (chainId?: string) => void;
}) {
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
          <span className="text-xs text-gray-600">
            {address ? shortenAddress(address) : ""}
          </span>
          <span className="text-xs text-gray-500">{chainName}</span>
        </div>
      </div>
      <button
        onClick={() => onDisconnect()}
        className="px-3 py-1 border border-red-500 text-red-500 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors duration-200"
      >
        Disconnect
      </button>
    </div>
  );
}
