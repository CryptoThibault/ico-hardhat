// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Dev
/// @author Thibault C.
/// @notice This contract will deploy basic erc20 for test payable application. 
contract Dev is ERC20, Ownable {

    /// @notice It is ownable by the msg.sender, he can choose an initial supply to mint.
    constructor(uint initialSupply) ERC20("Dev Token", "DEV") Ownable() {
        _mint(msg.sender, initialSupply);
    }
}
