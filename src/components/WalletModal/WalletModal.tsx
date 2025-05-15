import * as Dialog from "@radix-ui/react-dialog";
import { useWalletModal } from "@/context";
import { useAccounts, useWalletList } from "@/hooks";
import { ChainType, MinimalWallet } from "@/types/wallet";
import { ConnectedWalletDisplay } from "./ConnectedWalletDisplay";
import { getChainInfo, useAccount as useCosmosAccount } from "graz";
import { useAccount as useEvmAccount } from "wagmi";

export function WalletModal() {
  const { isOpen, closeModal } = useWalletModal();

  const wallets = useWalletList();

  const { cosmosAccounts, evmAccount, checkIsConnected } = useAccounts();

  const getSectionTitle = (chainType: ChainType): string => {
    const isConnected = checkIsConnected(chainType);

    // Format chainType for display: EVM for "evm", Cosmos for "cosmos"
    const displayChainType =
      chainType === ChainType.Evm
        ? "EVM"
        : chainType.charAt(0).toUpperCase() + chainType.slice(1);
    if (isConnected) {
      return `${displayChainType} Wallet`;
    } else {
      return `Connect ${displayChainType} Wallet`;
    }
  };

  const renderWalletList = (chainType: "evm" | "cosmos") => {
    const walletsForChainType = wallets.filter(
      (w) => w.walletChainType === chainType,
    );
    const connectedWalletForChainType = walletsForChainType.find((w) =>
      checkIsConnected(w.walletChainType),
    );

    const walletsToRender = connectedWalletForChainType
      ? [connectedWalletForChainType]
      : walletsForChainType;

    return walletsToRender.map((wallet) => {
      if (checkIsConnected(wallet.walletChainType)) {
        if (wallet.walletChainType === ChainType.Evm) {
          const address = evmAccount.address;
          const chainName = evmAccount.chain?.name;
          return (
            <ConnectedWalletDisplay
              key={wallet.walletName}
              wallet={wallet}
              chainName={chainName}
              address={address}
              onDisconnect={() => wallet.disconnect()}
            />
          );
        } else {
          return (
            <div>
              {cosmosAccounts?.map((account) => {
                const chainName = getChainInfo({
                  chainId: account.chainId,
                })?.chainName;
                return (
                  <ConnectedWalletDisplay
                    key={`${wallet.walletName}-${account.address}`}
                    wallet={wallet}
                    address={account.address}
                    onDisconnect={() => wallet.disconnect(account.chainId)}
                    chainName={chainName}
                  />
                );
              })}
            </div>
          );
        }
      }

      return (
        <button
          key={`${wallet.walletName}-${wallet.walletChainType}`}
          onClick={() => wallet.connect()}
          disabled={!wallet.isAvailable}
          className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <div className="flex items-center space-x-3">
            <WalletLogo wallet={wallet} />
            <span className="font-medium">{wallet.walletPrettyName}</span>
          </div>
          <span
            className={`text-xs px-2 py-1 rounded ${
              wallet.isAvailable
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {wallet.isAvailable ? "Available" : "Not Available"}
          </span>
        </button>
      );
    });
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={closeModal}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-6 shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
          <Dialog.Title className="font-sans text-lg font-bold text-gray-900 mb-4">
            Connect Wallet
          </Dialog.Title>

          <div className="space-y-6">
            {Object.values(ChainType).map((chainType) => (
              <div key={chainType}>
                <h4 className="text-sm font-medium text-gray-700 mb-2 font-sans">
                  {getSectionTitle(chainType as ChainType)}
                </h4>
                <div className="space-y-2">
                  {renderWalletList(chainType as "evm" | "cosmos")}
                </div>
              </div>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const WalletLogo = ({ wallet }: { wallet: MinimalWallet }) => {
  if (wallet.walletInfo.logo) {
    return (
      <img
        src={wallet.walletInfo.logo}
        alt={wallet.walletPrettyName}
        className="w-6 h-6 rounded-md"
      />
    );
  }

  return (
    <div className="w-6 h-6 bg-gray-200 rounded-md flex items-center justify-center">
      <span className="text-sm font-medium">
        {wallet.walletPrettyName.charAt(0)}
      </span>
    </div>
  );
};
