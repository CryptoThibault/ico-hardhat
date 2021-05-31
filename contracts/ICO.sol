// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "./Dev.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract ICO is Dev {
    using Address for address payable;
    address private _erc20;
    uint256 private _price;
    uint256 private _endTime;
    uint256 private constant _TIMESTAMP = 0;

    constructor(
        address erc20_,
        uint256 offer_,
        uint256 price_,
        uint256 time
        ) Dev(0) {
        require(balanceOf(msg.sender) >= offer_, "ICO: balance of sender less than offer");
        _erc20 = erc20_;
        _price = price_;
        _endTime = _TIMESTAMP + time;
        approve(address(this), offer_);
    }

    function offer() public view returns (uint256) {
        return allowance(owner(), address(this));
    }
    function price() public view returns (uint256) {
        return _price;
    }
    function endTime() public view returns (uint256) {
        return _endTime;
    }
    function balance() public view onlyOwner returns (uint) {
        return address(this).balance;
    }

    function buy() public payable {
        uint amount = msg.value / _price;
        require(amount >= allowance(owner(), address(this)), "ICO: offer less than amount sent");
        require(_endTime < _TIMESTAMP, "ICO: cannot buy after end of ICO");
        transferFrom(owner(), address(this), amount);
        _transfer(address(this), msg.sender, amount);
    }
    function withdraw() public  onlyOwner {
        require(_endTime > _TIMESTAMP, "ICO: cannot withdraw before end of ICO");
        payable(msg.sender).sendValue(address(this).balance);
    } 
}
