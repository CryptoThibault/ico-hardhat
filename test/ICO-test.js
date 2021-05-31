const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('ICO', async function () {
  let ICO, ico, owner;
  before(async function () {
    ;[owner] = await ethers.getSigners();
    ICO = await ethers.getContractFactory('ICO');
    ico = await ICO.connect(owner).deploy();
    await ico.deployed();
  });
  describe('Deployment', async function () {
    it('Should be the good erc20 address', async function () {
      expect(await ico.owner()).to.equal(owner.address);
    });
  });
});
