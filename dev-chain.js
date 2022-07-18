const fs = require('fs');
const Web3 = require('web3');
const ganache = require('ganache');

const devSeed = require('./dev-seed.json');

const PORT = 8545;
const BUILD_DIR = 'build/';
const GAS_AMOUNT = 20000000;

const ganacheServer = ganache.server({
  wallet: { mnemonic: devSeed.seed },
  logging: { quiet: false },
});
ganacheServer.listen(PORT, async err => {
  if (err) throw err;
  console.log(`Ganache listening on port ${PORT}...`);
  await deployContracts();
});
const web3 = new Web3(ganacheServer.provider);

const contracts = {
  Documents: {},
  UniqueId: {},
};

let accounts = [];

async function deployContracts() {
  accounts = await ganacheServer.provider.request({
    method: "eth_accounts",
    params: []
  });
  for(let contractName of Object.keys(contracts)) {
    console.log(`Deploying ${contractName}...`);
    const bytecode = fs.readFileSync(`${BUILD_DIR}${contractName}.bin`, { encoding: 'utf8' });
    const abi = JSON.parse(fs.readFileSync(`${BUILD_DIR}${contractName}.abi`, { encoding: 'utf8' }));
    const newContract = new web3.eth.Contract(abi);
    const deployed = await newContract.deploy({
      data: bytecode,
      arguments: 'constructorArgs' in contracts[contractName]
        ? contracts[contractName].constructorArgs.map(arg =>
            typeof arg === 'function' ? arg() : arg)
        : [],
    }).send({ from: accounts[0], gas: GAS_AMOUNT });
    contracts[contractName].instance = deployed;
  }
  // Provide contract addresses to frontend
  fs.writeFileSync(`${BUILD_DIR}config.js`, `
  window.config=${JSON.stringify({
    home: [ , '0x6E43Ed02ca36DB68917a853405b566b5D16A329d', ''],
    rpc: `http://localhost:${PORT}`,
    chain: '0x539',
    chainName: 'Localhost',
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18
    },
    blockExplorer: "https://etherscan.io",
    contracts: Object.keys(contracts).reduce((out, cur) => {
      out[cur] = {
        address: contracts[cur].instance.options.address,
      };
      return out;
    }, {}),
  })};
  `);
}
