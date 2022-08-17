import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { AirDropRequirementType, AirDropType } from "../test/utils";
import { DarwinDrop__factory, TestErc20Token, TestErc20Token__factory } from "../typechain";


async function main() {
    
    const [owner, ...accounts] = await ethers.getSigners();

    // Deploy contract with the correct constructor arguments
    const darwinDrop = DarwinDrop__factory.connect("0x4A119c9875b25aAedaA9f3c1ceaD8dEFE7474b47", owner)
    const token = TestErc20Token__factory.connect("0x426F6F9e2339f614c4f13B551d74AA2401032dAC",owner) as TestErc20Token

    const tokensToAirdrop  = 100;

    await token.approve(darwinDrop.address, tokensToAirdrop)

    let now = Math.floor(Date.now() / 1000)

    console.log(now)

    const tnx = await darwinDrop.createAirdrop(
       {
        airdropTokenAddress: token.address,
        airdropTokenAmount: tokensToAirdrop,
        tokensPerUser: 0,
        startTime: now,
        endTime: now + 12000,
        airdropMaxParticipants: BigNumber.from(10 ** 8),
        requirementTokenAddress: ethers.constants.AddressZero,
        requirementTokenAmount: 0,
        isPromoted:false,
        airDropType: AirDropType.LOTTERY,
        requirementType: AirDropRequirementType.NONE
       },
       1,
    
    {
        value: ethers.utils.parseEther(".5")
    }
    )

  const log =  await tnx.wait()


    console.log(log);

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });