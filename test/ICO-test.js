const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('ICO', async function () {
  let ERC20, erc20, ICO, ico, owner, alice;
  const INITIAL_SUPPLY = ethers.utils.parseEther('100');
  const OFFER_SUPPLY = ethers.utils.parseEther('20');
  const BUY_AMOUNT = ethers.utils.parseEther('1');
  const PRICE = 100;
  const TIME = 3600;
  before(async function () {
    ;[owner, alice] = await ethers.getSigners();
    ERC20 = await ethers.getContractFactory('Dev');
    erc20 = await ERC20.connect(owner).deploy(INITIAL_SUPPLY);
    await erc20.deployed();
    ICO = await ethers.getContractFactory('ICO');
    ico = await ICO.connect(owner).deploy(erc20.address, OFFER_SUPPLY, PRICE, TIME);
    await ico.deployed();
    await erc20.approve(ico.address, OFFER_SUPPLY);
  });
  describe('Deployment', async function () {
    it('Should mint initial supply to owner', async function () {
      expect(await erc20.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
    });
    it('Should be the good erc20 address', async function () {
      expect(await ico.erc20().to.equal(erc20.address));
    });
    it('Should be the good owner address', async function () {
      expect(await ico.erc20Owner()).to.equal(owner.address);
    });
    it('Should approve ico address for offer', async function () {
      expect(await ico.offer()).to.equal(OFFER_SUPPLY);
    });
    it('Should have the good price', async function () {
      expect(await ico.price()).to.equal(PRICE);
    });
    it('Should have the good end time', async function () {
      expect(await ico.endTime()).to.above(TIME);
    });
  });
  describe('Buy', async function () {
    let BUY;
    before(async function () {
      BUY = await ico.connect(alice).buy({ value: BUY_AMOUNT });
    });
    it('Should transfer tokens to user balance', async function () {
      expect(await erc20.balanceOf(alice.address)).to.equal(BUY_AMOUNT);
    });
    it('Should descrease allowance of ico', async function () {
      expect(await erc20.allowance(owner.address, ico.address)).to.equal(OFFER_SUPPLY.sub(BUY_AMOUNT));
    });
    it('Should increase balance of ico', async function () {
      expect(await ico.balance()).to.equal(BUY_AMOUNT.mul(PRICE));
    });
    it('Should emits event Transfer with good args (owner -> ico)', async function () {
      expect(BUY).to.emit('Transfer').withArgs(owner.address, ico.address, BUY_AMOUNT);
    });
    it('Should emits event Approve with good args (owner -> ico)', async function () {
      expect(BUY).to.emit('Approve').withArgs(owner.address, ico.address, OFFER_SUPPLY.sub(BUY_AMOUNT));
    });
    it('Should emits event Transfer with good args (ico -> user)', async function () {
      expect(BUY).to.emit('Transfer').withArgs(ico.address, alice.address, BUY_AMOUNT);
    });
  });
  describe('Withdraw', async function () {
    let WITHDRAW;
    it('Should revert function if time not reach', async function () {
      expect(await ico.connect(owner).withdraw()).to.revertedWith();
    });
    before(async function () {
      await ethers.provider.send('evm_increaseTime', [TIME]);
      await ethers.provider.send('evm_mine');
      WITHDRAW = await ico.connect(owner).withdraw();
    });
    it('Should withdraw eth balance to owner eth balance', async function () {
      expect(WITHDRAW).to.changeEtherBalance(owner, BUY_AMOUNT);
    });
    it('Should set balance of ico to 0', async function () {
      expect(await ico.balance()).to.equal(0);
    });
    it('Should emits event Transfer with good args (ico -> owner)', async function () {
      expect(WITHDRAW).to.emit('Transfer').withArgs(ico.address, owner.address, BUY_AMOUNT);
    });
    it('Should emits event Approve with good args (owner -> ico)', async function () {
      expect(WITHDRAW).to.emit('Approve').withArgs(owner.address, ico.address, 0);
    });
  });
});
