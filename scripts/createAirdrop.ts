import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { AirDropRequirementType, AirDropType } from "../test/utils";
import { DarwinDrop__factory, TestErc20Token, TestErc20Token__factory } from "../typechain";


async function main() {
    
    const [owner, ...accounts] = await ethers.getSigners();

    // Deploy contract with the correct constructor arguments
    const darwinDrop = DarwinDrop__factory.connect("0xfb752888bb1175f49e02899b36b9805bF2B9504d", owner)
    const token = TestErc20Token__factory.connect("0xE3750C0062979b91499D4B74F3a3329566E6401C",owner) as TestErc20Token

    const tokensToAirdrop  = 100;

    await token.approve(darwinDrop.address, tokensToAirdrop)

    let now = Math.floor(Date.now() / 1000)

    const tnx = await darwinDrop.createAirdrop(
       {
        airdropTokenAddress: token.address,
        airdropTokenAmount: tokensToAirdrop,
        tokensPerUser: 0,
        startTime: now,
        endTime: now + 1200000,
        airdropMaxParticipants: BigNumber.from(10 ** 8),
        requirementTokenAddress:token.address ,// ethers.constants.AddressZero,
        requirementTokenAmount: 1,
        isPromoted:false,
        airDropType: AirDropType.LOTTERY,
        requirementType: AirDropRequirementType.NFT_REQUIRED
       },
       4,
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