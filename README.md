# newgeocities

Pronounced `newg-eoc-ities`

## Installation

```
$ git clone https://github.com/numtel/newgeocities.git
$ cd newgeocities
$ npm install
```

Download the `solc` compiler. This is used instead of `solc-js` because it is much faster. Binaries for other systems can be found in the [Ethereum foundation repository](https://github.com/ethereum/solc-bin/).
```
$ curl -o solc https://binaries.soliditylang.org/linux-amd64/solc-linux-amd64-v0.8.15+commit.e14f2714
$ chmod +x solc
```

## Development Frontend

There's no build steps. You could start the frontend just as well by starting any HTTP server on the `rsc` directory without even installing any NPM packages.

Start the development frontend server, connecting to the contracts on Optimism using the settings in `src/config.js` with the following command:

```
$ npm run dev
```

## Development Chain

The development chain script runs Ganache on port 8545 as well deploying the contracts.

It also deploys the relevant factory contracts to the development chain and outputs their addresses to `build/config.js` for consumption by the frontend. For the frontend to read this file, the other configuration file at `src/config.js` must be removed.

```
# Contracts must be built before running the development chain
$ npm run build-dev

$ npm run dev-chain
```

## License

MIT
