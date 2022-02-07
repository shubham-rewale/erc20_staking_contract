// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./DSMath.sol";

contract Alt_token is ERC20, DSMath {

    struct StakingPlan {
        uint period;
        uint APR;
    }

    struct Stake {
        bool status;
        address stakeHolder;
        uint stakedAmount;
        uint periodOfStake;
        uint depositDate;
        uint withdrawalDate;
        uint APR;
    }

    uint stakeId = 1;

    mapping(uint => Stake) private stakeList;
    mapping(string => StakingPlan) private stakingOptions;
    mapping(address => uint) private rewards;

    event stake_has_been_plcaed(uint _stakeId, address _stakeHolder, uint _stakedAmount, uint _duration, uint _APR);
    event stake_has_been_removed(uint _stakeId, address _stakeHolder);
    event reward_has_been_credited(address _receipient, uint _rewardAmount);
    
    constructor(uint _initialSupply) ERC20("Alt Token", "ALT") {
        _mint(msg.sender, _initialSupply);
        stakingOptions["3_months"] = StakingPlan(12 weeks, 15);
        stakingOptions["6_months"] = StakingPlan(24 weeks, 30);
        stakingOptions["9_months"] = StakingPlan(36 weeks, 45);
    }

    function decimals() public view virtual override returns (uint8) {
        return 6;
    }

    function getStakingOptionDetails(string memory _stakingOption) public view returns(StakingPlan memory) {
        return stakingOptions[_stakingOption];
    }

    function stakeTokens(uint _amountToStake, string memory _stakingOptions) public {
        require(_amountToStake > 0, "Number of tokens is zero");
        uint tokenBalance = balanceOf(msg.sender);
        require(tokenBalance >= _amountToStake, "You don't have enough funds to stake");
        _burn(msg.sender, _amountToStake);
        stakeList[stakeId] = Stake(true, msg.sender, _amountToStake, stakingOptions[_stakingOptions].period, block.timestamp, block.timestamp + stakingOptions[_stakingOptions].period, stakingOptions[_stakingOptions].APR);
        emit stake_has_been_plcaed(stakeId, msg.sender, _amountToStake, stakingOptions[_stakingOptions].period, stakingOptions[_stakingOptions].APR);
        stakeId += 1;
    }

    function viewStake(uint _stakeId) public view returns(Stake memory){
        return stakeList[_stakeId];
    }

    function removeStake(uint _stakeId) public {
        require(stakeList[_stakeId].status == true, "Stake is not present");
        require(msg.sender == stakeList[_stakeId].stakeHolder, "You do not own this stake");
        require(block.timestamp > stakeList[_stakeId].withdrawalDate, "You can not remove your stake before predefined date");
        stakeList[_stakeId].status = false;
        uint periodicInterestRate = rdiv(stakeList[_stakeId].APR, 5200);
        uint interesrOverDuration;
        if (stakeList[_stakeId].periodOfStake == 12 weeks) { interesrOverDuration = periodicInterestRate * 12; }
        if (stakeList[_stakeId].periodOfStake == 24 weeks) { interesrOverDuration = periodicInterestRate * 24; }
        if (stakeList[_stakeId].periodOfStake == 36 weeks) { interesrOverDuration = periodicInterestRate * 36; }
        uint reward = stakeList[_stakeId].stakedAmount * interesrOverDuration;
        rewards[msg.sender] += reward / 10**27;
        _mint(msg.sender, stakeList[_stakeId].stakedAmount);
        emit stake_has_been_removed(_stakeId, stakeList[_stakeId].stakeHolder);
    }

    function viewReward() public view returns(uint) {
        return rewards[msg.sender];
    }

    function claimReward() public {
        require(rewards[msg.sender] > 0, "You don't have any reward to claim");
        uint rewardAmount = rewards[msg.sender];
        rewards[msg.sender] = 0;
        _mint(msg.sender, rewardAmount);
        emit reward_has_been_credited(msg.sender, rewardAmount);
    }
}