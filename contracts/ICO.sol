// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "./Dev.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract ICO {
    using Address for address payable;
    Dev private _erc20;
    uint private _price;
    uint private _endTime;

    constructor(
        address erc20_,
        uint offer_,
        uint price_,
        uint time
        ) {
        _erc20 = Dev(erc20_);
        require(_erc20.balanceOf(msg.sender) >= offer_, "ICO: balance of sender less than offer");
        _price = price_;
        _endTime = block.timestamp + time;
        _erc20.approveFrom(_erc20.owner(), address(this), offer_);
    }

    modifier onlyOwner {
        require(msg.sender == _erc20.owner(), "ICO: reserved too owner of erc20");
        _;
    }

    function erc20() public view returns (address) {
        return address(_erc20);
    }
    function erc20Owner() public view returns (address) {
        return _erc20.owner();
    }
    function offer() public view returns (uint) {
        return _erc20.allowance(_erc20.owner(), address(this));
    }
    function price() public view returns (uint) {
        return _price;
    }
    function endTime() public view returns (uint) {
        return _endTime;
    }
    function balance() public view onlyOwner returns (uint) {
        return address(this).balance;
    }

    function buy() public payable {
        uint amount = msg.value / _price;
        require(amount <= _erc20.allowance(_erc20.owner(), address(this)), "ICO: offer less than amount sent");
        require(_endTime > block.timestamp, "ICO: cannot buy after end of ICO");
        _erc20.transferFrom(_erc20.owner(), address(this), amount);
        _erc20.transfer(address(this), msg.sender, amount);
    }
    function withdraw() public  onlyOwner {
        require(_endTime < block.timestamp, "ICO: cannot withdraw before end of ICO");
        payable(msg.sender).sendValue(address(this).balance);
    } 
}
