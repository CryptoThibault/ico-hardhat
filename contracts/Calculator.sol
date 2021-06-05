// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "./Dev.sol";

contract Calculator {
  Dev private _erc20;
  uint private _price;

  event Calculation(address indexed sender, int nb1, int nb2, string operator, int result);

  constructor(address erc20_, uint price_) {
    _erc20 = Dev(erc20_);
    require(msg.sender == _erc20.owner(), "Calculator: only owner of erc20 can deploy this calculator");
    _price = price_; 
  }
  modifier payWithTokens() {
    require(_erc20.balanceOf(msg.sender) >= _price, "Calculator: price exceeds user balance");
    _erc20.transferFrom(msg.sender, address(this), _price);
    _;
  }
  modifier erc20Owner() {
    require(msg.sender == _erc20.owner(), "Calculator: reserved to owner of the erc20");
    _;
  }

  function withdrawTokens() public erc20Owner returns (bool) {
    _erc20.transfer(msg.sender, _erc20.balanceOf(address(this)));
    return true;
  }

  function add(int a, int b) public payWithTokens returns (int) {
    emit Calculation(msg.sender, a, b, "add", a + b);
    return a + b;
  }
  function sub(int a, int b) public payWithTokens returns (int) {
    emit Calculation(msg.sender, a, b, "sub", a - b);
    return a - b;
  }
  function mul(int a, int b) public payWithTokens returns (int) {
    emit Calculation(msg.sender, a, b, "mul", a * b);
    return a * b;
  }
  function div(int a, int b) public payWithTokens returns (int) {
    emit Calculation(msg.sender, a, b, "div", a / b);
    return a / b;
  }
  function mod(int a, int b) public payWithTokens returns (int) {
    emit Calculation(msg.sender, a, b, "mod", a % b);
    return a % b;
  }

  function tokenBalance() public view erc20Owner returns (uint) {
    return _erc20.balanceOf(address(this));
  }
  function erc20Address() public view erc20Owner returns (address) {
    return address(_erc20);
  }
  function ownerAddress() public view erc20Owner returns (address) {
    return _erc20.owner();
  }
  function price() public view returns (uint) {
    return _price;
  }
}
