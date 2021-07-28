require("@nomiclabs/hardhat-waffle");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const MY_PRIVATE_KEY =
  "a981e2c14fe041b9c0ec1c198fd0f05daf0922b9aa49a2a1c5eaf3eec7099dca";
module.exports = {
  solidity: "0.8.0",
  networks: {
    binanceTest: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      gasPrice: 20000000000,
      accounts: [`0x${MY_PRIVATE_KEY}`],
    },
  },
};
