import { useWalletClient as useEvmWalletClient } from "wagmi";

export const useWalletClient = () => {
  const { data: evmWalletClient } = useEvmWalletClient();

  return {
    evm: evmWalletClient,
  };
};
