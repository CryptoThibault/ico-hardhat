const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Calculator', async function () {
  let ERC20, erc20, CALCULATOR, calculator, owner, alice, bob;
  const INITIAL_SUPPLY = ethers.utils.parseEther('100');
  const USER_SUPPLY = ethers.utils.parseEther('10');
  const PRICE = 10;
  beforeEach(async function () {
    ;[owner, alice, bob] = await ethers.getSigners();
    ERC20 = await ethers.getContractFactory('Dev');
    erc20 = await ERC20.connect(owner).deploy(INITIAL_SUPPLY);
    await erc20.deployed();
    CALCULATOR = await ethers.getContractFactory('Calculator');
    calculator = await CALCULATOR.connect(owner).deploy(erc20.address, PRICE);
    await calculator.deployed();
    await erc20.transfer(alice.address, USER_SUPPLY);
  });
  describe('Deployment', async function () {
    it('Should be the good price', async function () {
      expect(await calculator.price()).to.equal(PRICE);
    });
    it('Should be the good erc20 address', async function () {
      expect(await calculator.erc20Address()).to.equal(erc20.address);
    });
    it('Should be the good owner address', async function () {
      expect(await calculator.ownerAddress()).to.equal(owner.address);
    });
  });
  describe('Calculation', async function () {
    it('Should emits event Approval when user approve calculator', async function () {
      expect(await erc20.connect(alice).approve(calculator.address, INITIAL_SUPPLY))
        .to.emit(erc20, 'Approval').withArgs(alice.address, calculator.address, INITIAL_SUPPLY);
    });
    it('Should increase allowance of calculator when user approve it', async function () {
      await erc20.connect(alice).approve(calculator.address, INITIAL_SUPPLY);
      expect(await erc20.allowance(alice.address, calculator.address)).to.be.equal(INITIAL_SUPPLY);
    });
    it('Should emits event Calculation for each operator', async function () {
      await erc20.connect(alice).approve(calculator.address, INITIAL_SUPPLY);
      expect(await calculator.connect(alice).add(10, 5))
        .to.emit(calculator, 'Calculation').withArgs(alice.address, 10, 5, 'add', 15);
      expect(await calculator.connect(alice).sub(10, 5))
        .to.emit(calculator, 'Calculation').withArgs(alice.address, 10, 5, 'sub', 5);
      expect(await calculator.connect(alice).mul(10, 5))
        .to.emit(calculator, 'Calculation').withArgs(alice.address, 10, 5, 'mul', 50);
      expect(await calculator.connect(alice).div(10, 5))
        .to.emit(calculator, 'Calculation').withArgs(alice.address, 10, 5, 'div', 2);
      expect(await calculator.connect(alice).mod(10, 5))
        .to.emit(calculator, 'Calculation').withArgs(alice.address, 10, 5, 'mod', 0);
    });
  });
  describe('Payable', async function () {
    let ADD, SUB, MUL, DIV, MOD;
    beforeEach(async function () {
      await erc20.connect(alice).approve(calculator.address, INITIAL_SUPPLY);
      ADD = await calculator.connect(alice).add(10, 5);
      SUB = await calculator.connect(alice).sub(10, 5);
      MUL = await calculator.connect(alice).mul(10, 5);
      DIV = await calculator.connect(alice).div(10, 5);
      MOD = await calculator.connect(alice).mod(10, 5);
    });
    it('Should change balances of user and calculator', async function () {
      expect(await erc20.balanceOf(alice.address)).to.equal(USER_SUPPLY.sub(PRICE * 5));
      expect(await erc20.balanceOf(calculator.address)).to.equal(PRICE * 5);
    });
    it('Should emits event Transfer for each operator', async function () {
      expect(ADD).to.emit(erc20, 'Transfer').withArgs(alice.address, calculator.address, PRICE);
      expect(SUB).to.emit(erc20, 'Transfer').withArgs(alice.address, calculator.address, PRICE);
      expect(MUL).to.emit(erc20, 'Transfer').withArgs(alice.address, calculator.address, PRICE);
      expect(DIV).to.emit(erc20, 'Transfer').withArgs(alice.address, calculator.address, PRICE);
      expect(MOD).to.emit(erc20, 'Transfer').withArgs(alice.address, calculator.address, PRICE);
    });
    it('Should revert calculation if balance of user is less than price', async function () {
      await expect(calculator.connect(bob).add(10, 5))
        .to.be.revertedWith('Calculator: price exceeds user balance');
    });
    it('Should revert calculation if allowance of user is less than price', async function () {
      await erc20.connect(owner).transfer(bob.address, USER_SUPPLY);
      await expect(calculator.connect(bob).add(10, 5))
        .to.be.revertedWith('ERC20: transfer amount exceeds allowance');
    });
  });
  describe('Withdraw', async function () {
    let WITHDRAW;
    beforeEach(async function () {
      await erc20.connect(alice).approve(calculator.address, INITIAL_SUPPLY);
      await calculator.connect(alice).add(10, 5);
      WITHDRAW = await calculator.connect(owner).withdrawTokens();
    });
    it('Should decrease calculator balance', async function () {
      expect(await erc20.balanceOf(calculator.address)).to.equal(0);
    });
    it('Should increase owner balance', async function () {
      expect(await erc20.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY.sub(USER_SUPPLY).add(PRICE));
    });
    it('Should emits event Transfer when owner get his tokens', async function () {
      expect(WITHDRAW).to.emit(erc20, 'Transfer')
        .withArgs(calculator.address, owner.address, PRICE);
    });
    it('Should revert transaction if sender is not owner of erc20', async function () {
      await expect(calculator.connect(bob).withdrawTokens())
        .to.be.revertedWith('Calculator: reserved to owner of the erc20');
    });
  });
});
