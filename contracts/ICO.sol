// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "./Dev.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract ICO {
    using Address for address payable;
    Dev private _erc20;
    uint private _price;
    uint private _endTime;
    bool private _locked;
    mapping(address => uint) private _tokensLocked;

    event Bought(address indexed buyer, uint value);
    event Withdrew(address indexed owner, uint value);
    event Claimed(address indexed claimer, uint tokens);

    constructor(
        address erc20_,
        uint offer_,
        uint price_,
        uint time,
        bool locked_
        ) {
        _erc20 = Dev(erc20_);
        require(msg.sender == _erc20.owner(), "ICO: only owner of erc20 can deploy this ico");
        require(_erc20.balanceOf(msg.sender) >= offer_, "ICO: balance of sender less than offer");
        _price = price_;
        _endTime = block.timestamp + time;
        _locked = locked_;
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
    function balance() public view returns (uint) {
        return address(this).balance;
    }

    function buy() public payable returns (bool) {
        require(msg.sender != _erc20.owner(), "ICO: owner cannot buy his tokens");
        require(_endTime > block.timestamp, "ICO: cannot buy after end of ico");
        uint amount = msg.value / _price;
        require(amount <= _erc20.allowance(_erc20.owner(), address(this)), "ICO: offer less than amount sent");
        if(_locked) {
            _erc20.transferFrom(_erc20.owner(), address(this), amount);
            _tokensLocked[msg.sender] += amount;
        } else _erc20.transferFrom(_erc20.owner(), msg.sender, amount);
        emit Bought(msg.sender, msg.value);
        return true;
    }
    function withdraw() public returns (bool) {
        require(msg.sender == _erc20.owner(), "ICO: reserved too owner of erc20");
        require(_endTime < block.timestamp, "ICO: cannot withdraw before end of ico");
        uint amount = address(this).balance;
        payable(msg.sender).sendValue(amount);
        emit Withdrew(msg.sender, amount);
        return true;
    }

    function claim() public returns (bool) {
        require(_endTime < block.timestamp, "ICO: cannot claim before end of ico");
        uint amount = _tokensLocked[msg.sender];
        _tokensLocked[msg.sender] = 0;
        _erc20.transfer(msg.sender, amount);
        emit Claimed(msg.sender, amount);
        return true;
    }
}
