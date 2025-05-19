import { WalletModal } from "@/components";
import { useWalletModal } from "@/context";
import { useAccounts } from "@/hooks";
import { cn } from "@/lib";

export function ConnectButton() {
  const { openModal } = useWalletModal();
  const { isConnected } = useAccounts();

  return (
    <>
      <button
        onClick={openModal}
        className={cn(
          "inline-block rounded-md px-12 py-4 text-base font-beast transition-all focus:outline-none  ",
          isConnected
            ? "bg-white text-accent-purple border-2 border-accent-purple hover:scale-110 hover:shadow-xl "
            : "bg-secondary text-white hover:scale-110 hover:shadow-xl hover:bg-secondary-hover active:bg-secondary-hover",
        )}
      >
        {isConnected ? "Wallets" : "Connect Wallet"}
      </button>

      <WalletModal />
    </>
  );
}
