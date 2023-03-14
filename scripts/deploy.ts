import * as hardhat from "hardhat";
import { ethers, upgrades } from "hardhat";


async function main() {
    const wallet1 = "0x5Baa5b0eCB4d81DEbb15be26cc967E01a4c6b3e0";
    const kieran = "0xe4e672ED86b8f6782e889F125e977bcF54018232";
    const marketing = "0xB997c232019487d49c4b45238401434e8c852cAe";

    const DarwinDrop = await ethers.getContractFactory("DarwinDrop");

    const drop = await upgrades.deployProxy(
        DarwinDrop,
        [
            wallet1,
            kieran,
            marketing
        ],
        {
            initializer: "initialize"
        }
    );
    await drop.deployed();
    console.log("DarwinDrop deployed to: ", drop.address);

    //? [VERIFY] DARWIN PROTOCOL
    await hardhat.run("verify:verify", {
        address: drop.address,
        constructorArguments: []
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });