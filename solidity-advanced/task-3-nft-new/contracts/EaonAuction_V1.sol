import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/utils/ERC721HolderUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EaonAuctionV1 is Initializable, OwnableUpgradeable, ERC721HolderUpgradeable{

    uint256 private currentId;

    function initialize(uint initialMessage) external initializer {
        __Ownable_init(msg.sender); // 修复：传入 msg.sender 作为初始所有者（v4.x 必需）
        currentId = initialMessage; // 状态变量初始化（正确）
    }

    mapping(uint256 => Auction) public auctions;

    // 存各拍卖用户竞拍地址与金额
    mapping(uint256 =>mapping (address => mapping ( address => uint256))) private bidInfos;

    mapping(address => FeedInfo) public feedInfos;

    struct FeedInfo{
        AggregatorV3Interface feed;
        uint8 decimals;
        uint8 tokenDecimals;
    }

    struct Auction{
        uint256 id;         // 拍卖id
        address nftAddress; //nft 地址
        uint256 nftTokenId; //nft tokenId
        uint256 startPriceUsd; //开始价格/美金
        address maxBidAddress; //最高价地址 ETH为address 0 / ERC20 为合约地址
        uint256 maxBidAmount; //最高金额
        uint256 maxBidPriceUsd; //最高金额 美元
        uint256 startTime;  //开始时间 默认区块当前时间
        uint256 duration;   //持续时间(秒) 用户自定义设置
        address seller;     //卖房
        address buyer;      //买放
        bool    status;     //状态 true 开启 false关闭
    }

    // 记录设置预言机器 分别为 tokenAddress: erc20合约地址 或 0(eth), feed : 预言机获取价格, decimals:预言机获取到代币的小数位， decimals：用户设置的代币小数位
    event FeedInfoSet(address indexed tokenAddress, address indexed feed, uint8 decimals, uint8 tokenDecimals);
    // 记录开始拍卖 id:拍卖id, nftAddress:nft 合约地址，nft代币地址：tokenId, startPriceUsd:开始美元价格， 拍卖持续时间:duration 秒 ，seller：拍卖者地址
    event AuctionStarted(uint256 indexed id, address indexed nftAddress, uint256 indexed tokenId, uint256 startPriceUsd, uint256 duration, address seller);
    // 记录拍卖竞价 id:拍卖id，bidder:竞拍人，bidToken：代币地址 erc20合约地址 或 0(eth), feed，amount：代币数量，priceUsd:转化为美元的价格
    event BidPlaced(uint256 indexed id, address indexed bidder, address indexed bidToken, uint256 amount, uint256 priceUsd);
    // 记录结束拍卖 id:拍卖id，seller：拍卖者地址,buyer:购买者地址 ，bidToken：代币地址 erc20合约地址 或 0(eth), feed，amount：代币数量，priceUsd:转化为美元的价格
    event AuctionEnded(uint256 indexed id, address indexed seller, address indexed buyer, address bidToken, uint256 amount, uint256 priceUsd);
    // 记录提币 id:拍卖id，bidder:竞拍人地址，bidToken：代币地址 erc20合约地址 或 0(eth),feed，amount：代币数量
    event Withdrawn(uint256 indexed id, address indexed bidder, address indexed bidToken, uint256 amount);

    // 配置预言机
    function setFeeInfos(address FeedAddress, address tokenAddress, uint8 tokenDecimal) public onlyOwner {
        AggregatorV3Interface feed = AggregatorV3Interface(FeedAddress);
        feedInfos[tokenAddress] = FeedInfo(feed, feed.decimals(), tokenDecimal);
        emit FeedInfoSet(tokenAddress, FeedAddress, feed.decimals(), tokenDecimal);
    }

    // 根据代币地址获取代币价格
    function getFeeInfoPrice(address tokenAddress)public view returns(int256){
        FeedInfo memory feedInfo = feedInfos[tokenAddress];
        require(address(feedInfo.feed) != address(0), "feed not set");
        (,int256 price,,,) = feedInfo.feed.latestRoundData();
        return price;
    }

    // 获取用户出价总价格转位美元
    function getTokenPrice(address tokenAddress, uint256 tokenAmount)internal view returns(uint256 usdValue){
        FeedInfo memory feedInfo = feedInfos[tokenAddress];
        require(address(feedInfo.feed) != address(0), "feed not exist");
        (,int256 price,,uint256 updatedAt,) = feedInfo.feed.latestRoundData();
        require(price > 0, "Invalid price");
        require(block.timestamp - updatedAt < 3600, "Price too later"); 
         // 2. 换算逻辑：USD 价值 = 代币金额 × 预言机价格 ÷ 代币小数位 ÷ 预言机小数位
         // 示例：ETH 出价 0.1 ETH（1e17 wei），预言机价格 2000 USD（2e11 → 2000 × 1e8）
         // 计算：1e17 × 2e11 ÷ 1e18（ETH小数位） ÷ 1e8（预言机小数位） = 2e4 → 200 USD（200 × 1e8）
        uint256 usdValue = (tokenAmount * uint256(price)) / (10 ** uint256(feedInfo.tokenDecimals)) / (10 ** uint256(feedInfo.decimals - 8));
        return usdValue;
    }

    function startAuction(
        address _nftAddress,
        uint256 _nftTokenId,
        uint256 _startPriceUsd, 
        uint256 _duration
    )external returns(uint){
        if (currentId == 0) {
            currentId = 1;
        }
        // 判断nft地址
        require(_nftAddress != address(0), "invalid nft address");
        // 判断执行时间
        require(_duration > 0, "invalid duration");
        // 判断开始价格
        require(_startPriceUsd > 0, "invalid start price");

        IERC721 erc721 = IERC721(_nftAddress);
        require(erc721.ownerOf(_nftTokenId) == msg.sender, "not nft owner");
        require(
            erc721.getApproved(_nftTokenId) == address(this) || erc721.isApprovedForAll(msg.sender, address(this)),
            "nft not approved"
        );

        Auction storage auction = auctions[currentId];
        auction.id = currentId;
        auction.nftAddress = _nftAddress;
        auction.nftTokenId = _nftTokenId;
        auction.startPriceUsd = _startPriceUsd;
        auction.startTime = block.timestamp;
        auction.duration = _duration;
        auction.seller = payable(msg.sender);
        auction.status = true;
        erc721.safeTransferFrom(msg.sender, address(this), _nftTokenId);
        // 记录日志
        emit AuctionStarted(auction.id, _nftAddress, _nftTokenId, _startPriceUsd, _duration, msg.sender);
        currentId++;
        return auction.id;
    }

    // 解释 bidAddress 如果是ERC20的话为 智能合约部署，需要传入合约地址 如果是ETH 直接传入 地址为0即可
    function placedBid(uint _auctionId, address bidAddress, uint bidAmount)external payable {
        Auction storage auction = auctions[_auctionId];

        // 校验数据
        require(auction.id > 0, "not found this auction");
        // 判断状态
        require(auction.status == true, "this auction is ended");
        // 时间判断
        require(block.timestamp < auction.startTime + auction.duration, "auction not active");

        if(bidAddress == address(0)){
            //ETH 代币处理
            require(bidAmount == msg.value, "amount not equan value");
        }else{
            // IERC20
            IERC20 erc20 = IERC20(bidAddress);
            uint256 approveAmount = erc20.allowance(msg.sender, address(this));
            require(approveAmount >= bidAmount, "not enough token");
        }

        uint256 currentPriceUsd = getTokenPrice(bidAddress, bidAmount);
        // 初始价格对比
        require(currentPriceUsd >= auction.startPriceUsd, "below start price");
        // 转为 USD 后进行比对，如果比最高价低直接跳过，如果比最高价高则替换
        require(currentPriceUsd > auction.maxBidPriceUsd, "bid price lower than max price");

        // 开始质押
        if(bidAddress != address(0)){
            IERC20 erc20 = IERC20(bidAddress);
            erc20.transferFrom(msg.sender, address(this), bidAmount);
        }

        auction.maxBidAddress = bidAddress;
        auction.maxBidAmount = bidAmount;
        auction.maxBidPriceUsd = currentPriceUsd;
        auction.buyer = payable(msg.sender);

        bidInfos[_auctionId][msg.sender][bidAddress] += bidAmount;
        emit BidPlaced(_auctionId, msg.sender, bidAddress, bidAmount, currentPriceUsd);
    }

    function endAuction(uint256 _auctionId) external returns(bool){
        Auction storage auction = auctions[_auctionId];
        // 存在校验
        require(auction.id > 0,"not found this auction");
        // 状态校验
        require(auction.status == true, "this auction is ended");
        // 时间校验
        require(block.timestamp >= auction.startTime + auction.duration, "auction not ended");
        // 竞拍校验
        require(auction.buyer != address(0), "no bids");
        // owner校验
        require(msg.sender == auction.seller, "not seller");
        // 处理转账
        if(auction.maxBidAddress == address(0)){
            // ETH 转账
            payable(auction.seller).transfer(auction.maxBidAmount);
        }else{
            // ERC20 等转账
            IERC20 erc20 = IERC20(auction.maxBidAddress);
            erc20.transfer(auction.seller, auction.maxBidAmount);
        }
        
        //处理 nft token 转移
        IERC721 erc721 = IERC721(auction.nftAddress);
        erc721.safeTransferFrom(address(this), auction.buyer, auction.nftTokenId);

        // 扣减金额
        bidInfos[_auctionId][auction.buyer][auction.maxBidAddress] -= auction.maxBidAmount;
        // 状态处理
        auction.status = false;
        emit AuctionEnded(_auctionId, auction.seller, auction.buyer, auction.maxBidAddress, auction.maxBidAmount, auction.maxBidPriceUsd);
        return auction.status;
    }

    function actionWithdraw(uint256 _auctionId, address bidAddress) external payable{
        Auction storage auction = auctions[_auctionId];
        require(auction.id > 0, "not found this auction");
        require(auction.status == false, "auction not ended");
        uint256 amount = bidInfos[_auctionId][msg.sender][bidAddress];
        require(amount > 0, "no bid");
        if(bidAddress == address(0)){
            (bool success, ) = payable(msg.sender).call{value: amount}("");
            require(success, "transfer failed");
        }else{
            IERC20 erc20 = IERC20(bidAddress);
            erc20.transfer(msg.sender, amount);
        }
        bidInfos[_auctionId][msg.sender][bidAddress] = 0;
        emit Withdrawn(_auctionId, msg.sender, bidAddress, amount);
    }

    function version() external pure virtual returns(string memory){
        return 'V1';
    }

}