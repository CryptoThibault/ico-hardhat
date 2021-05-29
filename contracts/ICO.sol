// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "./Dev.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract ICO {
    uint256 private _balance;
    uint256 private _offer;
    uint256 private _price;
    uint256 private _endTime;
    address private _owner;

    constructor(
        uint256 offer_,
        uint256 price_,
        uint256 time
    ) {
        //require(balanceOf(msg.sender) >= offer_, "ICO: balance of sender less than offer");
        _offer = offer_;
        _price = price_;
        _endTime = block.timestamp + time;
        _owner = msg.sender;
    }

    function offer() public view returns (uint256) {
        return _offer;
    }

    function buy() public payable {
        require(msg.value / _price >= _offer, "ICO: offer less than amount sent");
        _balance += msg.value;
        //_transfer(_owner, msg.sender, msg.value / _price);
    }

    function withdraw() public {
        require(msg.sender == _owner, "ICO: reserved to owner");
        // payable(msg.sender).sendValue(address(this).balance);
    }
}
