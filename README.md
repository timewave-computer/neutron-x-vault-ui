# X—Vault Demo App

![X—Vault Demo App Screenshot](./readme_screenshot.png)

A simple web application for interacting with ERC-4626 vault contracts on Ethereum mainnet in order to integrate with Valence cross-chain vaults. Built with Next.js, Tailwind CSS, and wagmi. Nix reproducible environment and Foundry/Anvil for local Ethereum development.

## Development

1. set up environment variables

```bash
cp .env.example .env
```

2. Customize `vaults.config.json` file
   This file tells the UI which contracts to read. The repo is set up to not commit the config.

3. start server

```bash
nix develop
npm install
npm run start
```

4. Add testnet to your browser wallet as a custom network:
   - Network Name: Vaults Test Env (or any name)
   - RPC URL: http://localhost:8545 (or any anvil rpc)
   - Chain ID: 31337
   - Currency Symbol: ETH

```

## About `vaults.config.json`

The `vaults.config.json` file contains an array of vault configurations. Each vault object has the following fields:

- `vaultId`: A unique identifier for the vault used internally by the application
- `symbol`: The symbol of the token accepted by the vault (e.g., "USDC", "ETH")

### EVM Configuration
- `evm`: Configuration for the Ethereum side of the vault
  - `chainId`: The ID of the blockchain network where the vault is deployed (e.g., 1 for Ethereum mainnet)
  - `vaultAddress`: The Ethereum address of the vault contract
  - `vaultProxyAddress`: The address of the proxy contract if the vault uses upgradeable contracts
  - `tokenAddress`: The address of the ERC-20 token that the vault accepts as deposits
  - `transactionConfirmationTimeout`: Maximum time (in milliseconds) to wait for transaction confirmations
  - `startBlock`: The block number from which to start scanning for vault events
  - `explorerUrl`: URL for the blockchain explorer (e.g., "https://etherscan.io")

### Cosmos Configuration
- `cosmos`: Configuration for the Cosmos side of the vault
  - `chainId`: The ID of the Cosmos chain (e.g., "neutron-1")
  - `explorerUrl`: URL for the Cosmos chain explorer
  - `token`: Token configuration
    - `denom`: The denomination of the token on the Cosmos chain
    - `decimals`: Number of decimal places for the token
  - `startBlock`: The block number from which to start scanning for vault events

### UI Copy Configuration
- `copy`: Text content for the UI
  - `name`: Human-readable name of the vault
  - `description`: A brief description of the vault's purpose
  - `deposit`: Deposit-related text
    - `title`: Title for the deposit section
    - `description`: Description of the deposit process
    - `cta`: Call-to-action text for deposit button
  - `depositInProgress`: Text for deposit in progress state
    - `title`: Title for the progress section
    - `steps`: Array of step descriptions
    - `description`: Description of the ongoing process
  - `withdraw`: Withdrawal-related text
    - `title`: Title for the withdrawal section
    - `description`: Description of the withdrawal process
    - `cta`: Call-to-action text for withdrawal button
  - `withdrawInProgress`: Text for withdrawal in progress state
    - `title`: Title for the progress section
    - `steps`: Array of step descriptions
    - `description`: Description of the ongoing process
  - `withdrawCompleted`: Text for completed withdrawal state
    - `title`: Title for the completion section
    - `description`: Description of the completed process

### APR Configuration
- `aprRequest`: Configuration for fetching the vault's APR (Annual Percentage Rate)
  - `type`: The source type for APR data ("api" or "contract")
  - For API requests:
    - `url`: The endpoint URL
    - `method`: HTTP method (GET, POST, etc.)
    - `headers`: Optional HTTP headers
    - `body`: Optional request body
  - For contract requests:
    - `address`: The contract address
    - `abi`: Contract ABI array
    - `functionName`: Name of the function to call
    - `args`: Optional arguments for the function call
```
