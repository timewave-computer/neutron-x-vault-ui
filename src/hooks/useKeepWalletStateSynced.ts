"use client";
import { ChainType } from "@/const";
import { cosmosWalletAtom, evmWalletAtom } from "@/state";
import { useAccount as useCosmosAccount } from "graz";
import { useAtom } from "jotai";
import { useCallback, useEffect } from "react";
import { useAccount as useEvmAccount } from "wagmi";

export const useKeepWalletStateSynced = () => {
  const [evmWallet, setEvmWallet] = useAtom(evmWalletAtom);
  const [cosmosWallet, setCosmosWallet] = useAtom(cosmosWalletAtom);

  const { data: cosmosAccounts, walletType } = useCosmosAccount({
    multiChain: true,
  });

  const currentCosmosId = cosmosAccounts
    ? cosmosAccounts[Object.keys(cosmosAccounts)[0]]?.bech32Address
    : "";

  const evmAccount = useEvmAccount();

  const updateCosmosWallet = useCallback(async () => {
    if (cosmosAccounts && walletType) {
      setCosmosWallet({
        id: currentCosmosId,
        walletName: walletType,
        chainType: ChainType.Cosmos,
      });
    }
  }, [cosmosAccounts, currentCosmosId, setCosmosWallet, walletType]);

  const updateEvmWallet = useCallback(async () => {
    const provider = await evmAccount.connector?.getProvider?.();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const walletConnectMetadata = (provider as any)?.session?.peer?.metadata;
    if (evmAccount.connector) {
      setEvmWallet({
        id: evmAccount.address,
        walletName: evmAccount.connector.id,
        chainType: ChainType.Evm,
        logo: walletConnectMetadata?.icons[0] ?? evmAccount.connector?.icon,
      });
    }
  }, [evmAccount.address, evmAccount.connector, setEvmWallet]);

  useEffect(() => {
    const currentEvmId = evmAccount.address;

    if (walletType && cosmosWallet?.id !== currentCosmosId) {
      updateCosmosWallet();
    }
    if (evmAccount.connector && evmWallet?.id !== currentEvmId) {
      updateEvmWallet();
    }
  }, [
    walletType,
    cosmosWallet,
    evmAccount.connector,
    evmWallet,
    setCosmosWallet,
    setEvmWallet,
    updateEvmWallet,
    cosmosAccounts,
    evmAccount.address,
    updateCosmosWallet,
    currentCosmosId,
  ]);
};
