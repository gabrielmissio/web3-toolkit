// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

contract DvP is Ownable, ERC165, IERC1155Receiver {
    IERC20 public erc20Token;
    IERC1155 public erc1155Token;

    // Mapping from ERC1155 token ID to its value in ERC20 tokens
    mapping(uint256 => uint256) public tokenValues;

    constructor(address initialOwner, address _erc20Token, address _erc1155Token) Ownable(initialOwner) {
        erc20Token = IERC20(_erc20Token);
        erc1155Token = IERC1155(_erc1155Token);
    }

    function setTokenValue(uint256 tokenId, uint256 value) external onlyOwner {
        tokenValues[tokenId] = value;
    }

    function exchange(uint256 tokenId, uint256 amount) external {
        uint256 totalValue = tokenValues[tokenId] * amount;
        require(erc20Token.balanceOf(msg.sender) >= totalValue, "Insufficient ERC20 balance");
        require(erc20Token.allowance(msg.sender, address(this)) >= totalValue, "ERC20 allowance too low");
        erc20Token.transferFrom(msg.sender, address(this), totalValue);
        erc1155Token.safeTransferFrom(address(this), msg.sender, tokenId, amount, "");
    }

    function withdrawERC20(uint256 amount) external onlyOwner {
        erc20Token.transfer(msg.sender, amount);
    }

    function withdrawERC1155(uint256 tokenId, uint256 amount) external onlyOwner {
        erc1155Token.safeTransferFrom(address(this), msg.sender, tokenId, amount, "");
    }

    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) external override returns (bytes4) {
        emit Received(operator, from, id, value, data);
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) external override returns (bytes4) {
        emit BatchReceived(operator, from, ids, values, data);
        return this.onERC1155BatchReceived.selector;
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC165, IERC165) returns (bool) {
        return interfaceId == type(IERC1155Receiver).interfaceId || super.supportsInterface(interfaceId);
    }

    event Received(address operator, address from, uint256 id, uint256 value, bytes data);
    event BatchReceived(address operator, address from, uint256[] ids, uint256[] values, bytes data);
}
