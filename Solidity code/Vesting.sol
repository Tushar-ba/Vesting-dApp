// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Vesting is Ownable {
    IERC20 public token;
    uint256 public startTimestamp;
    bool public vestingStarted;

    enum Role { User, Partner, Team }
    struct Beneficiary {
        uint256 allocation;
        uint256 claimed;
        Role role;
    }

    mapping(address => Beneficiary) public beneficiaries;

    event VestingStarted(uint256 timestamp);
    event BeneficiaryAdded(address beneficiary, Role role, uint256 allocation);
    event TokensClaimed(address beneficiary, uint256 amount);

    constructor(address _token) Ownable(msg.sender) {
        token = IERC20(_token);
    }

    function startVesting() external onlyOwner {
        require(!vestingStarted, "Vesting already started");
        vestingStarted = true;
        startTimestamp = block.timestamp;
        emit VestingStarted(startTimestamp);
    }

    function addBeneficiary(address _beneficiary, uint256 _role, uint256 _allocation) external onlyOwner {
        require(!vestingStarted, "Vesting already started");
        require(_beneficiary != address(0), "Invalid address");
        require(_role <= uint256(Role.Team), "Invalid role");
        require(_allocation > 0, "Invalid allocation");

        beneficiaries[_beneficiary] = Beneficiary({
            allocation: _allocation,
            claimed: 0,
            role: Role(_role)
        });

        emit BeneficiaryAdded(_beneficiary, Role(_role), _allocation);
    }

    function claimTokens() external {
        require(vestingStarted, "Vesting has not started");
        Beneficiary storage beneficiary = beneficiaries[msg.sender];
        require(beneficiary.allocation > 0, "Not a beneficiary");

        uint256 vestingAmount = calculateVestingAmount(msg.sender);
        require(vestingAmount > 0, "No tokens available for claim");

        beneficiary.claimed += vestingAmount;
        token.transfer(msg.sender, vestingAmount);

        emit TokensClaimed(msg.sender, vestingAmount);
    }

    function calculateVestingAmount(address _beneficiary) internal view returns (uint256) {
        Beneficiary storage beneficiary = beneficiaries[_beneficiary];

        uint256 vestedAmount = 0;
        if (beneficiary.role == Role.User) {
            uint256 cliffTime = startTimestamp + (30 days * 10);
            if (block.timestamp >= cliffTime) {
                uint256 vestingDuration = 730 days; // 2 years
                vestedAmount = (beneficiary.allocation * (block.timestamp - cliffTime)) / vestingDuration;
            }
        } else {
            uint256 cliffTime = startTimestamp + (30 days * 2);
            if (block.timestamp >= cliffTime) {
                uint256 vestingDuration = 365 days; // 1 year
                vestedAmount = (beneficiary.allocation * (block.timestamp - cliffTime)) / vestingDuration;
            }
        }

        return vestedAmount - beneficiary.claimed;
    }

    function getBeneficiaryDetails(address _beneficiary) external view returns (uint256, uint256, Role) {
        Beneficiary storage beneficiary = beneficiaries[_beneficiary];
        return (beneficiary.allocation, beneficiary.claimed, beneficiary.role);
    }
}
