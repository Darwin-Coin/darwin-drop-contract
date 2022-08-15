const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");

async function main() {
    
    const [owner] = await hre.ethers.getSigners();

    // Get contract that we want to deploy
   
    const NotDrop = await hre.ethers.getContractFactory("NotCommunityDrop");
    

    let notCrypto = NotDrop.attach("0x9dfffc708d06b63079e89780802cd0bf0ca5de3e");

    await notCrypto.approve("0x02B345c33C73c64F7e37B5627aDA948277d7F55e", ethers.utils.parseEther('20'));

}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });