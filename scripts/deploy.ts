import { ethers, upgrades } from "hardhat";
import { TestErc20Token, TestErc321Token } from "../typechain";


async function main() {
    
    const DarwinDrop = await ethers.getContractFactory("DarwinDrop");
    const Token = await ethers.getContractFactory("TestErc20Token");
    const NFT = await ethers.getContractFactory("TestErc321Token");

    const [owner,address1, ...accounts] = await ethers.getSigners();

    // Deploy contract with the correct constructor arguments
    const contract = await upgrades.deployProxy(DarwinDrop, [owner.address]);

    // Wait for this transaction to be mined
    await contract.deployed();

    // Get contract address
    console.log("DarwinDrop deployed to:", contract.address);

    const token = await Token.deploy() as TestErc20Token

    // Wait for this transaction to be mined
    await token.deployed();

    console.log("Token Deployed at:", token.address);

    const nft = await NFT.deploy() as TestErc321Token

    // Wait for this transaction to be mined
    await nft.deployed();

    
    console.log("NFT Deployed at:", nft.address);

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });