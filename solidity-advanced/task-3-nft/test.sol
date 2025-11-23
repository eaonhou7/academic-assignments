// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract PriceConsumerV3 {
    AggregatorV3Interface internal priceFeed;

    /**
     * 构造函数，初始化价格数据源地址。
     * 以 Sepolia 测试网上的 ETH/USD 价格源为例：
     * Address: 0x694AA1769357215DE4FAC081bf1f309aDC325306
     */
    constructor(address priceFeedAddress) {
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    /**
     * 获取最新价格数据。
     */
    function getLatestPrice() public view returns (int) {
        // latestRoundData 返回多个值，此处我们主要关心 `price`
        (
            uint80 roundId,
            int256 price,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();
        return price;
    }

    /**
     * 获取价格数据的小数位数。
     * 例如，如果数据源使用 8 位小数，那么实际价格需要将获取的整数值除以 10^8。
     */
    function getDecimals() public view returns (uint8) {
        return priceFeed.decimals();
    }

    /**
     * 一个更安全的价格获取函数，包含基本的数据验证[citation:4]。
     * 检查返回的时间戳以确保数据不是陈旧的。
     */
    function getLatestPriceSafe() public view returns (int) {
        (
            uint80 roundId,
            int256 price,
            uint256 startedAt,
            uint256 timestamp,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();
        // 检查数据是否足够新（例如，一小时以内）
        require(timestamp > 0, "Round not complete");
        require(block.timestamp - timestamp < 3600, "Stale data");
        return price;
    }
}