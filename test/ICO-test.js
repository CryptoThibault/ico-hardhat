const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('ICO', async function () {
  let ERC20, erc20, ICO, ico, owner;
  const INITIAL_SUPPLY = ethers.utils.parseEther('100');
  const OFFER_SUPPLY = ethers.utils.parseEther('20');
  const PRICE = '100';
  const TIME = '3600';
  before(async function () {
    ;[owner] = await ethers.getSigners();
    ERC20 = await ethers.getContractFactory('Dev');
    erc20 = await ERC20.connect(owner).deploy(INITIAL_SUPPLY);
    await erc20.deployed();
    ICO = await ethers.getContractFactory('ICO');
    ico = await ICO.connect(owner).deploy(erc20, OFFER_SUPPLY, PRICE, TIME);
    await ico.deployed();
  });
  describe('Deployment', async function () {
    it('Should mint initial supply to owner', async function () {
      expect(await erc20.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
    });
    it('Should be the good erc20 address', async function () {
      expect(await ico.owner()).to.equal(owner.address);
    });
  });
});
