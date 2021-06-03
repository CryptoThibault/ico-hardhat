// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Dev is ERC20, Ownable {
    constructor(uint initialSupply) ERC20("Dev Token", "DEV") Ownable() {
        _mint(msg.sender, initialSupply);
    }
    function approveFrom(uint amount) external virtual returns (bool) {
        _approve(owner(), msg.sender, amount);
        return true;
    }
}
