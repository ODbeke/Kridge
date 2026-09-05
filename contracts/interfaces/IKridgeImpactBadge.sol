// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IKridgeImpactBadge {
    function mintBadge(address donor, uint8 tier, uint256 dollarsRescued) external returns (uint256 tokenId);
    function getDonorTier(address donor) external view returns (uint8);
}
