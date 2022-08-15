import { ethers, upgrades } from "hardhat";


async function main() {
    
    const DarwinDrop = await ethers.getContractFactory("DarwinDrop");


    // Deploy contract with the correct constructor arguments
    const contract = await upgrades.deployProxy(DarwinDrop, ["0xe9Fd06F179160Fa975432C20c5704347A6d80568"]);

    // Get contract address
    console.log("Deploying Contract");

    // Wait for this transaction to be mined
    await contract.deployed();

    // Get contract address
    console.log("DarwinDrop deployed to:", contract.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });