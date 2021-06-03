const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Calculator', async function () {
  let ERC20, erc20, CALCULATOR, calculator, owner, alice, bob;
  let APPROVE, ADD;
  const INITIAL_SUPPLY = ethers.utils.parseEther('100');
  const USER_SUPPLY = ethers.utils.parseEther('10');
  const PRICE = 10;
  before(async function () {
    ;[owner, alice, bob] = await ethers.getSigners();
    ERC20 = await ethers.getContractFactory('Dev');
    erc20 = await ERC20.connect(owner).deploy(INITIAL_SUPPLY);
    await erc20.deployed();
    CALCULATOR = await ethers.getContractFactory('Calculator');
    calculator = await CALCULATOR.connect(owner).deploy(erc20.address, PRICE);
    await calculator.deployed();
  });
  describe('Deployment', async function () {
    it('Should be the good price', async function () {
      expect(await calculator.price()).to.equal(PRICE);
    });
    it('Should be the good erc20 address', async function () {
      expect(await calculator.erc20Address()).to.equal(erc20.address);
    });
    it('Should be the good owner address', async function () {
      expect(await calculator._erc20.owner()).to.equal(erc20.address);
    });
  });
  describe('Calculation', async function () {
    before(async function () {
      await erc20.transfer(alice.address, USER_SUPPLY);
      APPROVE = await calculator.connect(alice).approveContract();
    });
    it('Should emits event Approval at start', async function () {
      expect(APPROVE).to.emit(erc20, 'Approval').withArgs(alice.address, calculator.address, 10 ^ 18);
    });
    it('ADD: 10 + 5 = 15', async function () {
      expect(ADD = await calculator.add(10, 5)).to.equal(15);
    });
    it('SUB: 10 - 5 = 5', async function () {
      expect(await calculator.sub(10, 5)).to.equal(5);
    });
    it('MUL: 10 * 5 = 50', async function () {
      expect(await calculator.mul(10, 5)).to.equal(50);
    });
    it('DIV: 10 / 5 = 2', async function () {
      expect(await calculator.div(10, 5)).to.equal(2);
    });
    it('MOD: 10 % 5 = 0', async function () {
      expect(await calculator.mod(10, 5)).to.equal(0);
    });
    it('Should emits event Calculation', async function () {
      expect(ADD).to.emit(calculator, 'Calculation').withArgs(alice.address, 10, 5, 1, 15);
    });
  });
  describe('Payable', async function () {
    it('Should decrease user balance', async function () {
      expect(await erc20.balanceOf(alice.address)).to.equal(USER_SUPPLY.sub(PRICE.mul(5)));
    });
    it('Should increase calculator balance', async function () {
      expect(await erc20.balanceOf(calculator.address)).to.equal(PRICE.mul(5));
    });
    it('Should emits event Transfer at each calculation', async function () {
      expect(ADD).to.emit(erc20, 'Transfer').withArgs(alice.address, calculator.address, PRICE);
    });
    it('Should revert calculation if balance of user less than price', async function () {
      await expect(calculator.connect(bob).add(10, 5))
        .to.be.revertedWith('Calculator: balance of sender lower than price');
    });
  });
});
