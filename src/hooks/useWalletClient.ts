import { useWalletClient as useEvmWalletClient } from "wagmi";
import { useStargateSigningClient } from "graz";

export const useWalletClient = () => {
  const { data: cosmosSigningClients } = useStargateSigningClient({
    multiChain: true,
  });

  const { data: evmWalletClient } = useEvmWalletClient();

  return {
    evm: evmWalletClient,
    cosmos: cosmosSigningClients,
  };
};
