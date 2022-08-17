import { ethers, upgrades } from "hardhat";
import { TestErc20Token } from "../typechain";


async function main() {
    
    const DarwinDrop = await ethers.getContractFactory("DarwinDrop");
    const Token = await ethers.getContractFactory("TestErc20Token");

    const [owner, ...accounts] = await ethers.getSigners();

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

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });