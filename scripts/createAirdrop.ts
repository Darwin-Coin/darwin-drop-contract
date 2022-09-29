import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { DarwinDrop__factory, TestErc20Token, TestErc20Token__factory } from "../typechain";



const format = (number: BigNumber) => ethers.utils.formatEther(number)
async function main() {

    const [owner, ...accounts] = await ethers.getSigners();

    // Deploy contract with the correct constructor arguments
    const darwinDrop = DarwinDrop__factory.connect("0x9CaFe5f36631b6639453AA3B3560569e0dfa513f", owner)
    const token = TestErc20Token__factory.connect("0x5e303C966E53837d9044f1A2eA1DBd6352d0AB15", owner) as TestErc20Token

    const tokenAmount  = BigNumber.from(100000000).toString()


    const formatToken = (amount:BigNumber | string, decimalPlaces:number) : string => {

        const decimals = BigNumber.from(10).pow(decimalPlaces)

        const tokens = BigNumber.from(amount)

        const beforeDecimal = tokens.div(decimals)
        const afterDecimal = tokens.mod(decimals)

        return `${beforeDecimal}.${afterDecimal}`
    }

    // console.log(formatToken(tokenAmount,8))

    // console.log(ethers.utils.formatEther(await owner.provider!!.getBalance(darwinDrop.address)))

   console.log(await darwinDrop.takeFees())

//    console.log(ethers.utils.formatEther(await owner.provider!!.getBalance(darwinDrop.address)))

    // const tokensToAirdrop = 100;

    // await token.approve(darwinDrop.address, tokensToAirdrop)


    // let now = await lastBlockTime()

    // const endTime = daysToSeconds(1).add(now)

    // const tnx = await darwinDrop.createAirdrop(
    //     {
    //         airdropTokenAddress: token.address,
    //         airdropTokenAmount: tokensToAirdrop,
    //         tokensPerUser: 0,
    //         startTime: now,
    //         endTime: 0,
    //         airdropMaxParticipants: BigNumber.from(10 ** 8),
    //         requirementTokenAddress: token.address,// ethers.constants.AddressZero,
    //         requirementTokenAmount: 1,
    //         isPromoted: false,
    //         airDropType: AirDropType.LOTTERY,
    //         requirementType: AirDropRequirementType.TOKEN_REQUIRED
    //     },
    //     1,
    //     {
    //         value: ethers.utils.parseEther(".5")
    //     }
    // )

    // const log = await tnx.wait(2)

    // const airdropCreatedEvent = log.events?.filter(it => it.event == darwinDrop.interface.getEvent("AirDropCreated").name)?.[0] as AirDropCreatedEvent

    // console.log(airdropCreatedEvent.args.airdrop.id);

    // await setNetworkTimeStamp(BigNumber.from(endTime.add(10)))

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });