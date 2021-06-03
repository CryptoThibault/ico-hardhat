const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Dev', async function () {
  let ERC20, erc20, owner;
  const NAME = 'Dev Token';
  const SYMBOL = 'DEV';
  const INITIAL_SUPPLY = ethers.utils.parseEther('100');
  before(async function () {
    ;[owner] = await ethers.getSigners();
    ERC20 = await ethers.getContractFactory('Dev');
    erc20 = await ERC20.connect(owner).deploy(INITIAL_SUPPLY);
    await erc20.deployed();
  });
  it('Should be the good name', async function () {
    expect(await erc20.name()).to.equal(NAME);
  });
  it('Should be the good symbol', async function () {
    expect(await erc20.symbol()).to.equal(SYMBOL);
  });
  it('Should mint initial supply to owner', async function () {
    expect(await erc20.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
  });
  it('Should emits event Transfer when deploy', async function () {
    const receipt = await erc20.deployTransaction.wait();
    await expect(receipt.transactionHash)
      .to.emit(erc20, 'Transfer')
      .withArgs(ethers.constants.AddressZero, owner.address, INITIAL_SUPPLY);
  });
});
