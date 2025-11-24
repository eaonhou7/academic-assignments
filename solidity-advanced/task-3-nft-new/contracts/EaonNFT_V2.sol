

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {EaonNftV1} from "./EaonNFT_V1.sol";

/// @custom:oz-upgrades-unsafe-allow missing-initializer missing-initializer-call
contract EaonNftV2 is EaonNftV1{

    function version() external pure override virtual returns(string memory){
        return 'V2';
    }

    /// @custom:oz-upgrades-validate-as-initializer
    function initializeV2() external reinitializer(2) {
    }

}