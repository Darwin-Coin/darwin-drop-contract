import { ethers, upgrades } from "hardhat";
import { DarwinDrop, TestErc20Token } from "../typechain";

export enum AirDropType {
    LOTTERY,
    USER_LIMITED,
    TOKEN_LIMITED
}

export enum AirDropRequirementType {
    TOKEN_REQUIRED,
    NFT_REQUIRED,
    PASSWORD,
    NONE
}

export enum AirdropStatus {
    ACTIVE,
    CANCELLED,
    TOKEN_DISTRIBUTED
}

export const deployContracts = async()=>{
    const DarwinDrop = await ethers.getContractFactory("DarwinDrop");
    const Token = await ethers.getContractFactory("TestErc20Token");

    const [owner, ...accounts] = await ethers.getSigners();

    // Deploy contract with the correct constructor arguments
    const darwinDrop = await upgrades.deployProxy(DarwinDrop, [owner.address]) as DarwinDrop;

    await darwinDrop.deployed()

    const token = await Token.deploy() as TestErc20Token

    // Wait for this transaction to be mined
    await token.deployed();

    return {
        darwinDrop,
        token
    }
}