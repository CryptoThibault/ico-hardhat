const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('ICO', async function () {
  let ERC20, erc20, ICO, ico, owner, alice, bob;
  const INITIAL_SUPPLY = ethers.utils.parseEther('100');
  const OFFER_SUPPLY = ethers.utils.parseEther('20');
  const BUY_AMOUNT = ethers.utils.parseEther('1');
  const PRICE = 100;
  const TIME = 3600;
  before(async function () {
    ;[owner, alice, bob] = await ethers.getSigners();
    ERC20 = await ethers.getContractFactory('Dev');
    erc20 = await ERC20.connect(owner).deploy(INITIAL_SUPPLY);
    await erc20.deployed();
    ICO = await ethers.getContractFactory('ICO');
    ico = await ICO.connect(owner).deploy(erc20.address, OFFER_SUPPLY, PRICE, TIME);
    await ico.deployed();
  });
  describe('Deployment', async function () {
    it('Should mint initial supply to owner', async function () {
      expect(await erc20.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
    });
    it('Should be the good erc20 address', async function () {
      expect(await ico.erc20()).to.equal(erc20.address);
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
    it('Should increase balance of user', async function () {
      expect(await erc20.balanceOf(alice.address)).to.equal(BUY_AMOUNT.div(PRICE));
    });
    it('Should decrease balance of owner', async function () {
      expect(await erc20.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY.sub(BUY_AMOUNT.div(PRICE)));
    });
    it('Should descrease allowance of ico', async function () {
      expect(await erc20.allowance(owner.address, ico.address)).to.equal(OFFER_SUPPLY.sub(BUY_AMOUNT.div(PRICE)));
    });
    it('Should increase balance of ico', async function () {
      expect(await ico.balance()).to.equal(BUY_AMOUNT);
    });
    it('Should emits event Transfer with good args (owner -> user)', async function () {
      expect(BUY)
        .to.emit(erc20, 'Transfer')
        .withArgs(owner.address, alice.address, BUY_AMOUNT.div(PRICE));
    });
    it('Should emits event Approval with good args (owner -> ico)', async function () {
      expect(BUY)
        .to.emit(erc20, 'Approval')
        .withArgs(owner.address, ico.address, OFFER_SUPPLY.sub(BUY_AMOUNT.div(PRICE)));
    });
    it('Should revert function if end time reach', async function () {
      await ethers.provider.send('evm_increaseTime', [TIME]);
      await ethers.provider.send('evm_mine');
      await expect(ico.connect(bob).buy({ value: BUY_AMOUNT })).to.be.revertedWith('ICO: cannot buy after end of ICO');
    });
  });
  describe('Withdraw', async function () {
    let WITHDRAW;
    before(async function () {
      await ethers.provider.send('evm_increaseTime', [TIME]);
      await ethers.provider.send('evm_mine');
      WITHDRAW = await ico.connect(owner).withdraw();
    });
    it('Should withdraw ico eth balance to owner', async function () {
      expect(WITHDRAW).to.changeEtherBalance(owner, BUY_AMOUNT);
    });
    it('Should set balance of ico to 0', async function () {
      expect(await ico.balance()).to.equal(0);
    });
    it('Should emits event Withdrew with good args (ico -> owner)', async function () {
      expect(WITHDRAW).to.emit(ico, 'Withdrew').withArgs(owner.address, BUY_AMOUNT);
    });
    it('Should emits event Approval with good args (owner -> ico)', async function () {
      expect(WITHDRAW).to.emit(erc20, 'Approval').withArgs(owner.address, ico.address, 0);
    });
    it('Should revert function if sender is not owner', async function () {
      await expect(ico.connect(bob).withdraw()).to.be.revertedWith('ICO: reserved too owner of erc20');
    });
    it('Should revert function if end time not reach', async function () {
      ico = await ICO.connect(owner).deploy(erc20.address, OFFER_SUPPLY, PRICE, TIME);
      await ico.deployed();
      await expect(ico.connect(owner).withdraw()).to.be.revertedWith('ICO: cannot withdraw before end of ICO');
    });
  });
});
