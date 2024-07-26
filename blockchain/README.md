## Compile Contracts

```bash
npm run hardhat -- compile
```

## Extract Contract ABIs

You only need to do this when you change the contract or add a new one.

```bash
cp ./blockchain/artifacts/contracts/CONTRACT_NAME.sol/CONTRACT_NAME.json ./blockchain/abis/CONTRACT_NAME.json
```
e.g. `cp ./blockchain/artifacts/contracts/ERC20Token.sol/ERC20Token.json ./blockchain/abis/ERC20Token.json`

## Deploy Contracts (from scripts)

```bash
dotenvx run -- node blockchain/scripts/deploy-contracts.mjs
```

## Run DvP End-to-End (from scripts)

```bash
dotenvx run -- node blockchain/scripts/dvp-end-to-end.mjs
```