import { getWithdrawRequest } from "@/server/withdraw-request";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/const/query-keys";

export const useVaultWithdrawRequests = ({
  vaultAddress,
  ownerAddress,
}: {
  vaultAddress: string;
  ownerAddress: string;
}) => {
  const { data } = useQuery({
    queryKey: [QUERY_KEYS.VAULT_WITHDRAW_REQUEST, vaultAddress, ownerAddress],
    queryFn: () => {
      return getWithdrawRequest(ownerAddress, vaultAddress);
    },
    refetchInterval: 5000,
    enabled: !!ownerAddress && !!vaultAddress,
  });

  console.log("withdrawRequests", data);
  return data;
};
