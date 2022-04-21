
const { utils } = require("ethers");


async function main() {
    

     const contractFactory = await hre.ethers.getContractFactory("NotCryptoAirDrop");

    // Deploy contract with the correct constructor arguments
    const contract = await contractFactory.deploy();

    // Get contract address
    console.log("Deploying Contract");

    // Wait for this transaction to be mined
    await contract.deployed();

    // Get contract address
    console.log("Contract deployed to:", contract.address);

    // Get contract address
    console.log("Initializing Contract");

    let txn = await contract.initialize("0x696958A7f7AFB33F7B6ccA1273719A129Bf6dB5C");

    txn.wait();

    console.log("Initialized Contract");

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });