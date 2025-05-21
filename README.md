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

````

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

## Deprecated npm scripts

start-anvil, manage-key, deploy-vaults, faucet are deprecated. They are for use with a local env.

# DEPRECATED DOCS

## Development

1. Enter environment and install dependencies:

   ```bash
   nix develop
````

This will automatically install all dependencies and set up your development environment.

2. Start the local Anvil node (Ethereum testnet):

   ```bash
   start-anvil
   ```

   This will start a local Ethereum node that forks mainnet, giving you access to real mainnet state while allowing local testing.

   The node will run with the following configuration:

   - Chain ID: 31337
   - Block time: 12 seconds
   - Initial account balance: 10,000 ETH
   - RPC URL: http://localhost:8545
   - Fork Block: 19,250,000

3. Generate a deployer key and deploy the vaults:

   ```bash
   # Generate a new deployer key, select option 1 to generate a new key
   manage-key

   # Deploy vaults
   deploy-vaults
   ```

   This will deploy the test tokens (WETH, USDC, DAI) and their corresponding vaults.

4. Configure your browser wallet:

   - Network Name: Anvil Local
   - RPC URL: http://localhost:8545
   - Chain ID: 31337
   - Currency Symbol: ETH

5. Get test tokens using the faucet:

   ```bash
   # Check your wallet's current balances
   faucet balance YOUR_WALLET_ADDRESS

   # Mint some test tokens
   faucet mint YOUR_WALLET_ADDRESS ETH 10   # Get 10 ETH
   faucet mint YOUR_WALLET_ADDRESS WETH 10  # Get 10 WETH
   faucet mint YOUR_WALLET_ADDRESS USDC 100 # Get 100 USDC
   faucet mint YOUR_WALLET_ADDRESS DAI 100  # Get 100 DAI
   ```

6. Start the development server:

   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

The project uses two environment files:

### `.env` (Persistent Environment)

This file stores persistent environment variables and is created by the `manage-key` command if it does not yet exist. It should contain:

```bash
# Persistent environment variables
DEPLOYER_PRIVATE_KEY=<your-deployer-private-key>
DEPLOYER_ADDRESS=<your-deployer-address>
NEXT_PUBLIC_REOWN_PROJECT_ID=<reown-project-id>
```

Do not commit this file to version control.

### `.env.local` (Session Environment)

**NOTE** `deploy-vaults` is deprecated. The UI will not read from these variables. See [#4](https://github.com/timewave-computer/x-vault-demo/issues/4).

This file is automatically generated by the `deploy-vaults` command and contains the deployed contract addresses:

```bash
# Session-specific environment variables
NEXT_PUBLIC_WETH_ADDRESS=<deployed-weth-address>
NEXT_PUBLIC_USDC_ADDRESS=<deployed-usdc-address>
NEXT_PUBLIC_DAI_ADDRESS=<deployed-dai-address>
NEXT_PUBLIC_WETH_VAULT_ADDRESS=<deployed-eth-vault-address>
NEXT_PUBLIC_USDC_VAULT_ADDRESS=<deployed-usdc-vault-address>
NEXT_PUBLIC_DAI_VAULT_ADDRESS=<deployed-dai-vault-address>
```

This file is regenerated each time you run `deploy-vaults` and should not be committed to version control.

## Available Commands

The development environment provides several useful commands:

- `start-anvil`: Start the local Ethereum testnet
- `manage-key`: Manage deployer private key
- `deploy-vaults`: Deploy test vaults to local network. NOTE: deprecated
- `faucet`: Manage token balances
  - `faucet balance <address>`: Show token balances
  - `faucet mint <address> <token> <amount>`: Mint tokens to address
  - `faucet burn <address> <token> <amount>`: Burn tokens from address
  - `faucet`: Show help menu
- `npm run dev`: Start Next.js development server

## Commit Hooks

The project is configured to reformat all staged files on commit, using `prettier` and `husky`.
