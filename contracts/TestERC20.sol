// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import "./ERC20Permit.sol";

contract TestERC20 is ERC20Permit {
    constructor(uint256 supply, uint256 chainId)
        ERC20Permit("Test", "TST", chainId)
    {
        _mint(msg.sender, supply);
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) public {
        _burn(from, amount);
    }
}
