// SPDX-License-Identifier: MIT
pragma solidity ~0.8.0;

// ✅ 创建一个名为Voting的合约，包含以下功能：
// 一个mapping来存储候选人的得票数
// 一个vote函数，允许用户投票给某个候选人
// 一个getVotes函数，返回某个候选人的得票数
// 一个resetVotes函数，重置所有候选人的得票数

contract Voting{
    mapping(address => uint) public votes;
    address[] public voteAddresses;

    function vote(address _address) external {
        if(votes[_address] == 0){
            voteAddresses.push(_address);
        }
        votes[_address]++;
    }

    function getVotes(address _address) external view returns(uint){
        return votes[_address];
    }

    function resetVotes() external {
        uint addressLen = voteAddresses.length;
        for(uint i= 0; i< addressLen; i++){
            delete votes[voteAddresses[i]];
            delete voteAddresses[i];
        }
    }
}