import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { DarwinDrop__factory } from "../typechain";



const format = (number: BigNumber) => ethers.utils.formatEther(number)
async function main() {

    const [owner, ...accounts] = await ethers.getSigners();

    // Deploy contract with the correct constructor arguments
    const darwinDrop = DarwinDrop__factory.connect("0x9CaFe5f36631b6639453AA3B3560569e0dfa513f", owner)

    // console.log(await darwinDrop.getAirDropDetails(11))

    console.log(await (await darwinDrop.airDropTokens([owner.address],0)).wait(2))    
    // console.log(await (await darwinDrop.withdrawRemainingTokens(18)).wait(2))    

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });