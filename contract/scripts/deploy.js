const { ethers, upgrades } = require("hardhat");


async function main() {
    

     const contractFactory = await ethers.getContractFactory("NotDrop");

    // Deploy contract with the correct constructor arguments
    const contract = await upgrades.deployProxy(contractFactory, ["0xe9Fd06F179160Fa975432C20c5704347A6d80568"]);

    // Get contract address
    console.log("Deploying Contract");

    // Wait for this transaction to be mined
    await contract.deploy();

    // Get contract address
    console.log("Contract deployed to:", contract.address);

    

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });