require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-solhint');
require('hardhat-docgen');

module.exports = {
  solidity: '0.8.4',
  docgen: {
    path: './docs',
    clear: true,
    runOnCompile: true,
  },
};
