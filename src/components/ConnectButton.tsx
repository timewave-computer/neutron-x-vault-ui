import { WalletModal } from "@/components/WalletModal";
import { useWalletModal } from "@/context";
import { useAccounts } from "@/hooks";
export function ConnectButton() {
  const { openModal } = useWalletModal();
  const { isConnected } = useAccounts();

  return (
    <>
      <button
        onClick={openModal}
        className="inline-block rounded-md px-12 py-4 text-base font-beast bg-secondary text-white hover:scale-110 hover:shadow-xl hover:bg-secondary-hover active:bg-secondary-hover transition-all focus:outline-none focus:ring focus:ring-secondary/20"
      >
        {isConnected ? "Wallets" : "Connect Wallet"}
      </button>

      <WalletModal />
    </>
  );
}
