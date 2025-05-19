# Wallet Client

The `useWalletClient` hook provides access to both EVM and Cosmos wallet clients for signing transactions. This hook is essential for interacting with both EVM and Cosmos blockchains in your application.

## Usage

```typescript
import { useWalletClient } from "@/hooks";

function YourComponent() {
  const { evm, cosmos } = useWalletClient();

  // Use the clients...
}
```

## EVM Client

The EVM client is provided by wagmi and allows you to interact with EVM-compatible blockchains.

### Example: Signing an EVM Transaction

```typescript
const { evm: walletClient } = useWalletClient();

// Example of signing a contract interaction
const handleTransaction = async () => {
  if (!walletClient) throw new Error("Wallet not connected");

  try {
    // Simulate the contract interaction first
    const { request } = await publicClient.simulateContract({
      address: contractAddress,
      abi: contractABI,
      functionName: "yourFunction",
      args: [
        /* your args */
      ],
      account: address,
    });

    // Sign and send the transaction
    const hash = await walletClient.writeContract(request);

    // Wait for transaction confirmation
    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
      timeout: 30000, // 30 seconds
    });

    if (receipt.status !== "success") {
      throw new Error("Transaction failed");
    }

    return hash;
  } catch (error) {
    // Handle error
    console.error(error);
  }
};
```

## Cosmos Client

The Cosmos client is provided by graz and allows you to interact with Cosmos-based blockchains.

### Example: Sending Cosmos Tokens

```typescript
const { cosmos: cosmosSigningClients } = useWalletClient();

const handleCosmosTransfer = async () => {
  const chainId = "neutron-1"; // or your target chain
  const client = cosmosSigningClients?.[chainId];

  if (!client) {
    throw new Error("No client found for chain");
  }

  try {
    const tx = await client.sendTokens(
      fromAddress,
      toAddress,
      [
        {
          denom: "untrn", // token denomination
          amount: "1000", // amount as string
        },
      ],
      {
        amount: [
          {
            denom: "untrn",
            amount: "2000", // fee amount
          },
        ],
        gas: "200000", // gas limit
      },
    );

    return tx;
  } catch (error) {
    // Handle error
    console.error(error);
  }
};
```

## Important Notes

1. Always check if the client exists before using it:

   ```typescript
   if (!walletClient) throw new Error("Wallet not connected");
   ```

2. For EVM transactions:

   - Always simulate the transaction first using `publicClient.simulateContract`
   - Use `walletClient.writeContract` to sign and send the transaction
   - Wait for transaction confirmation using `publicClient.waitForTransactionReceipt`

3. For Cosmos transactions:

   - Get the specific chain client using the chain ID: `cosmosSigningClients[chainId]`
   - Ensure you have the correct chain ID and token denominations
   - Handle gas and fee parameters appropriately

4. Error Handling:
   - Always wrap transactions in try-catch blocks
   - Provide meaningful error messages
   - Handle transaction failures appropriately

## Dependencies

This hook relies on:

- wagmi for EVM interactions
- graz for Cosmos interactions
- Your application's wallet connection setup

Make sure these dependencies are properly configured in your application before using the wallet client.
