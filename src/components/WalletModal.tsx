import * as Dialog from "@radix-ui/react-dialog";
import { useWalletModal } from "@/context";
import { useWalletList } from "@/hooks";
import { ChainType } from "@/types/wallet";

export function WalletModal() {
  const { isOpen, closeModal } = useWalletModal();

  const wallets = useWalletList();

  const renderWalletList = (chainType: "evm" | "cosmos") => {
    return wallets
      .filter((w) => w.walletChainType === chainType)
      .map((wallet) => (
        <button
          key={`${wallet.walletName}-${wallet.walletChainType}`}
          onClick={() => wallet.connect()}
          disabled={!wallet.isAvailable}
          className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <span className="font-medium">{wallet.walletPrettyName}</span>
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
      ));
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
            {/* EVM Section */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 font-sans">
                Connect EVM Wallet
              </h4>
              <div className="space-y-2">{renderWalletList(ChainType.Evm)}</div>
            </div>

            {/* Cosmos Section */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 font-sans">
                Connect Cosmos Wallet
              </h4>
              <div className="space-y-2">
                {renderWalletList(ChainType.Cosmos)}
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
