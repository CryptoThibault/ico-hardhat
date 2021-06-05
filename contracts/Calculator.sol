// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "./Dev.sol";

/// @title Calculator
/// @author Thibault C.
/// @notice This contract will deploy a payable calculator. 
/// @dev Each calculation will cost a choosed price and return the return in the only event.
contract Calculator {
  Dev private _erc20;
  uint private _price;

  event Calculation(address indexed sender, int nb1, int nb2, string operator, int result);

    /** @notice
    * The sender of this calculator should be the same of the sender of the erc20 contract imported.
    *
    * @param erc20_: address of the erc20 imported
    * @param price_: price for one calculation
    */
  constructor(address erc20_, uint price_) {
    _erc20 = Dev(erc20_);
    require(msg.sender == _erc20.owner(), "Calculator: only owner of erc20 can deploy this calculator");
    _price = price_; 
  }

  /// @dev check user balance and execute transaction at each calculation
  modifier payWithTokens() {
    require(_erc20.balanceOf(msg.sender) >= _price, "Calculator: price exceeds user balance");
    _erc20.transferFrom(msg.sender, address(this), _price);
    _;
  }

  /// @dev check if sender is erc20 owner for restricted functions
  modifier erc20Owner() {
    require(msg.sender == _erc20.owner(), "Calculator: reserved to owner of the erc20");
    _;
  }

  /// @notice Only erc20 owner can withdraw tokens to his balance
  function withdrawTokens() public erc20Owner returns (bool) {
    _erc20.transfer(msg.sender, _erc20.balanceOf(address(this)));
    return true;
  }

  /// @notice function for addition of two numbers
  function add(int a, int b) public payWithTokens returns (int) {
    emit Calculation(msg.sender, a, b, "add", a + b);
    return a + b;
  }

  /// @notice function for substraction of two numbers
  function sub(int a, int b) public payWithTokens returns (int) {
    emit Calculation(msg.sender, a, b, "sub", a - b);
    return a - b;
  }
  
  /// @notice function for multiplication of two numbers
  function mul(int a, int b) public payWithTokens returns (int) {
    emit Calculation(msg.sender, a, b, "mul", a * b);
    return a * b;
  }

  /// @notice function for division of two numbers
  function div(int a, int b) public payWithTokens returns (int) {
    emit Calculation(msg.sender, a, b, "div", a / b);
    return a / b;
  }

  /// @notice function for modulo of two numbers
  function mod(int a, int b) public payWithTokens returns (int) {
    emit Calculation(msg.sender, a, b, "mod", a % b);
    return a % b;
  }

  /// @notice return token balance of this contract, call reserved to owner
  function tokenBalance() public view erc20Owner returns (uint) {
    return _erc20.balanceOf(address(this));
  }

  /// @notice return address of the erc20, call reserved to owner
  function erc20Address() public view erc20Owner returns (address) {
    return address(_erc20);
  }

  /// @notice return erc20 owner address, call reserved to owner
  function ownerAddress() public view erc20Owner returns (address) {
    return _erc20.owner();
  }

  /// @notice return price of a calculation
  function price() public view returns (uint) {
    return _price;
  }
}
