import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { AirDropType, AirDropRequirementType } from "../test/utils";
import { DarwinDrop__factory, TestErc20Token, TestErc20Token__factory, TestErc321Token, TestErc321Token__factory } from "../typechain";
import { AirDropCreatedEvent } from "../typechain/DarwinDrop";
import { daysToSeconds, lastBlockTime, setNetworkTimeStamp } from "./utils";



const format = (number: BigNumber) => ethers.utils.formatEther(number)
async function main() {

    const [owner, ...accounts] = await ethers.getSigners();

    // Deploy contract with the correct constructor arguments
    const darwinDrop = DarwinDrop__factory.connect("0xe71D0b5cb4258b06EEB33186496cFD1e8568106a", owner)
    const token = TestErc20Token__factory.connect("0xc3D726a3bA3e72eB3928c11D31cAF3E754726adC", owner) as TestErc20Token
    const nft = TestErc321Token__factory.connect("0x63849CC67165CD00fb3E4D01200Ac56eD3234b39", owner) as TestErc321Token

    console.log(ethers.utils.formatEther(await owner.provider!!.getBalance(darwinDrop.address)))

   console.log(await darwinDrop.takeFees())

   console.log(ethers.utils.formatEther(await owner.provider!!.getBalance(darwinDrop.address)))

    const tokensToAirdrop = 100;

    await token.approve(darwinDrop.address, tokensToAirdrop)


    let now = await lastBlockTime()

    const endTime = daysToSeconds(1).add(now)

    const tnx = await darwinDrop.createAirdrop(
        {
            airdropTokenAddress: token.address,
            airdropTokenAmount: tokensToAirdrop,
            tokensPerUser: 0,
            startTime: now,
            endTime: 0,
            airdropMaxParticipants: BigNumber.from(10 ** 8),
            requirementTokenAddress: token.address,// ethers.constants.AddressZero,
            requirementTokenAmount: 1,
            isPromoted: false,
            airDropType: AirDropType.LOTTERY,
            requirementType: AirDropRequirementType.TOKEN_REQUIRED
        },
        1,
        {
            value: ethers.utils.parseEther(".5")
        }
    )

    const log = await tnx.wait(2)

    const airdropCreatedEvent = log.events?.filter(it => it.event == darwinDrop.interface.getEvent("AirDropCreated").name)?.[0] as AirDropCreatedEvent

    console.log(airdropCreatedEvent.args.airdrop.id);

    await setNetworkTimeStamp(BigNumber.from(endTime.add(10)))

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });