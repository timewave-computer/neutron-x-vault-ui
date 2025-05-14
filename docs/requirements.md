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


## phase 2
Supporting signing. Based on the operation, sign with the approriate wallet. Unsure how this would be set up yet.