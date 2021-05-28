// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "./Dev.sol"

contract ICO {
    uint private _balance;
    uint private _offer;
    uint private _price;
    uint private _endTime;
    address private _owner;
    constructor(uint offer_, uint price_, uint time) {
        require(balanceOf(msg.sender) >= offer_, "ICO: balance of sender less than offer");
        _offer = offer_;
        _price = price_;
        _endTime = block.timestamp + time days;
        _owner = msg.sender;
    }
    function offer() public view returns (uint) {
        return _offer;
    }

    function buy() public payable {
        require(msg.value / _price >= _offer, "ICO: offer less than amount sent");
        _balance += msg.value;
        _transfer(_owner, msg.sender, msg.value / price);
    }
}
