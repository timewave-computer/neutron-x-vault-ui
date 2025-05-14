# Requirements

## phase 1

- "Connect wallet" button renders custom modal
- Modal has two sections, "Connect cosmos wallet" and "Connect EVM wallet"
- Under each section, read what button + display name to render from a config file, where EVM and cosmos are a 'WalletType' enum.

```json
{
    evm: {
        ethereum: {
            chainId
            ...
        },
    },
    cosmos: {
        neutron: {
            chainId
            ...
        }
    }
}
- The config body should be a `MinimalWallet` type
    - wallet display name
    - chain Id
    - onConnect
    - address
    - disconnect
    - walletType
    - isConnected
    - isInstalled
```

- When modal is open, show which wallets are connected and their addresses, and let others be connected if you want
- If at least one wallet is connected, show a "Wallets" button instead of "Connect Wallet"
- In modal, show a "disconnect all" button
- Show "Installed" / "Not installed" per wallet in small secondary text. If not installed, disable button

### questions

- how to handle switching to custom network in EVM?

### todos

Define UI state transitions and edge cases
Specify what happens on connection success or failure, how the modal updates, and behavior when no supported wallets are installed. Outlining loading states, error handling, and fallback flows will lead to a more robust implementation.

## phase 2

Supporting signing. Based on the operation, sign with the approriate wallet. Unsure how this would be set up yet.
