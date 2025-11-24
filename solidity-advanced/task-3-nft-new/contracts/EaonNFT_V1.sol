// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract EaonNftV1 is 
    Initializable,       // 可升级合约核心：替代构造函数
    ERC721Upgradeable,   // 可升级 ERC721
    ERC721URIStorageUpgradeable, // 可升级 TokenURI 存储
    OwnableUpgradeable   // 可升级权限控制
{
    // 状态变量：不能在声明时初始化，必须移到 initialize
    uint256 private _tokenIdCounter; // NFT 编号计数器
    string private _customBaseURI;         // 基础 URI（用于拼接 tokenURI）

    function initialize(
        string memory name,
        string memory symbol,
        string memory initialBaseURI
    ) external initializer {
        // 初始化父合约（必须调用，顺序无强制要求）
        __ERC721_init(name, symbol); // v4.x 版本需传 name/symbol；v5.x 无参数（在 initialize 中设置）
        __ERC721URIStorage_init();
        __Ownable_init(msg.sender); // v4.x 需传初始所有者；v5.x 无参数（默认 msg.sender）

        // 状态变量初始化（之前声明时的初始值移到这里）
        _tokenIdCounter = 1; // 从 1 开始 mint
        _customBaseURI = initialBaseURI;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable) // 声明覆盖两个父合约
        returns (bool)
    {
        // 调用父类的实现（自动检测 ERC721、ERC721URIStorage 相关接口）
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function mintNFT(address to, uint256 tokenId)external{
        _mint(to, tokenId);
    }

    function transferNFTFrom(address from, address to, uint256 tokenId)external {
        transferFrom(from, to, tokenId);
    }

    function version()external pure virtual returns(string memory){
        return 'V1';
    }

}