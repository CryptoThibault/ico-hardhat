// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "./Dev.sol";

contract Calculator {
  Dev private _erc20;
  uint private _price;

  event Calculation(address indexed sender, int nb1, int nb2, uint operator, int result);

  constructor(address erc20_, uint price_) {
    require(msg.sender == _erc20.owner(), "Calculator: only owner of erc20 can deploy this calculator");
    _erc20 = Dev(erc20_);
    _price = price_; 
  }
  modifier payWithTokens() {
    require(_erc20.balanceOf(msg.sender) > _price, "Calculator: balance of sender lower than price");
    _erc20.transferFrom(msg.sender, address(this), _price);
    _;
  }
  modifier erc20Owner() {
    require(msg.sender == _erc20.owner(), "Calculator: reserved to owner of the erc20");
    _;
  }

  function approveContract() public returns (bool) {
    _erc20.approve(msg.sender, 10^18);
    return(true);
  }

  function withdrawTokens() public erc20Owner returns (bool) {
    _erc20.transfer(msg.sender, _erc20.balanceOf(address(this)));
    return true;
  }

  function add(int a, int b) public payWithTokens returns (int) {
    emit Calculation(msg.sender, a, b, 1, a + b);
    return a + b;
  }
  function sub(int a, int b) public payWithTokens returns (int) {
    emit Calculation(msg.sender, a, b, 2, a - b);
    return a - b;
  }
  function mul(int a, int b) public payWithTokens returns (int) {
    emit Calculation(msg.sender, a, b, 3, a * b);
    return a * b;
  }
  function div(int a, int b) public payWithTokens returns (int) {
    emit Calculation(msg.sender, a, b, 4, a / b);
    return a / b;
  }
  function mod(int a, int b) public payWithTokens returns (int) {
    emit Calculation(msg.sender, a, b, 5, a % b);
    return a % b;
  }

  function tokenBalance() public view erc20Owner returns (uint) {
    return _erc20.balanceOf(address(this));
  }
  function erc20Address() public view erc20Owner returns (address) {
    return address(_erc20);
  }
  function price() public view returns (uint) {
    return _price;
  }
}
