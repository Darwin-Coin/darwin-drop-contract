import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { DarwinDrop__factory } from "../typechain";



const format = (number: BigNumber) => ethers.utils.formatEther(number)
async function main() {

    const [owner, ...accounts] = await ethers.getSigners();

    // Deploy contract with the correct constructor arguments
    const darwinDrop = DarwinDrop__factory.connect("0xfb752888bb1175f49e02899b36b9805bF2B9504d", owner)

    console.log(await (await darwinDrop.airDropTokens([owner.address],14)).wait(2))    

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });