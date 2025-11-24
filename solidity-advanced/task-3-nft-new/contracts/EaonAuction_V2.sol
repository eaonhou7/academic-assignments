import {EaonAuctionV1} from "./EaonAuction_V1.sol";

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @custom:oz-upgrades-unsafe-allow missing-initializer missing-initializer-call
contract EaonAuctionV2 is EaonAuctionV1{

    function version() external pure override virtual returns(string memory){
        return 'V2';
    }

}