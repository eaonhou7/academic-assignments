import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EaonAuctionV2{

    uint256 private currentId = 1;

    mapping(uint256 => Auction) public auctions;

    // 存投放地址
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

    function setFeeInfos(address FeedAddress, address tokenAddress, uint8 tokenDecimal) public {
        AggregatorV3Interface feed = AggregatorV3Interface(FeedAddress);
        feedInfos[tokenAddress] = FeedInfo(feed, feed.decimals(), tokenDecimal);
    }

    function getFeeInfoPrice(address tokenAddress)public view returns(int256){
        FeedInfo memory feedInfo = feedInfos[tokenAddress];
        (,int256 price,,,) = feedInfo.feed.latestRoundData();
        return price;
    }

    function getTokenPrice(address tokenAddress, uint256 tokenAmount)internal view returns(uint256 usdValue){
        FeedInfo memory feedInfo = feedInfos[tokenAddress];
        (,int256 price,,uint256 updatedAt,) = feedInfo.feed.latestRoundData();
        require(price > 0, "Invalid price");
        require(block.timestamp - updatedAt < 3600, "Price feed outdated (1h)"); 
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
        Auction storage auction = auctions[currentId];
        auction.id = currentId;
        auction.nftAddress = _nftAddress;
        auction.nftTokenId = _nftTokenId;
        auction.startPriceUsd = _startPriceUsd;
        auction.startTime = block.timestamp;
        auction.duration = _duration;
        auction.seller = payable(msg.sender);
        auction.status = true;
        currentId++;
        return auction.id;
    }

    // 解释 bidAddress 如果是ERC20的话为 智能合约部署，需要传入合约地址 如果是ETH 直接传入 地址为0即可
    function placedBid(uint _auctionId, address bidAddress, uint bidAmount)external payable {
         Auction storage auction = auctions[_auctionId];
        //  require(auction.status == 1, "auction is ending");

        // 校验数据
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

    }

    function endAuction(uint256 _auctionId) external returns(bool){
        Auction memory auction = auctions[_auctionId];
        require(auction.id > 0,"not found this auction");
        require(auction.status == true, "this auction is ended");
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
        return auction.status;
    }

    function actionWithdraw(uint256 _auctionId, address bidAddress) external payable{
        uint256 amount = bidInfos[_auctionId][msg.sender][bidAddress];
        require(amount > 0, "no bid");
        Auction memory auction = auctions[_auctionId];
        if(bidAddress == address(0)){
            (bool success, ) = payable(msg.sender).call{value: amount}("");
            require(success, "transfer failed");
        }else{
            IERC20 erc20 = IERC20(bidAddress);
            erc20.transfer(msg.sender, amount);
        }
        bidInfos[_auctionId][msg.sender][bidAddress] = 0;
    }

    function version() external pure returns(string memory){
        return 'V2';
    }

}