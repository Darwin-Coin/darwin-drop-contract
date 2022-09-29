import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { AirDropType, AirDropRequirementType } from "../test/utils";
import { DarwinDrop__factory, TestErc20Token, TestErc20Token__factory } from "../typechain";
import { AirDropCreatedEvent } from "../typechain/DarwinDrop";
import { daysToSeconds, lastBlockTime, now, setNetworkTimeStamp } from "./utils";



const format = (number: BigNumber) => ethers.utils.formatEther(number)
async function main() {

    const [owner, ...accounts] = await ethers.getSigners();

    // Deploy contract with the correct constructor arguments
    const darwinDrop = DarwinDrop__factory.connect("0xe71D0b5cb4258b06EEB33186496cFD1e8568106a", owner)
    const token = TestErc20Token__factory.connect("0xc3D726a3bA3e72eB3928c11D31cAF3E754726adC", owner) as TestErc20Token

    const tokensToAirdrop = 100;

    await token.approve(darwinDrop.address, tokensToAirdrop)

    const averageGasPrice = await owner.getGasPrice()

    // console.log(gasToTransferSingleToken.toString(), averageGasPrice.toString())

    const actualTnx = await (await token.transfer(accounts[0].address, 100)).wait(2);

    // console.log(actualTnx.gasUsed.toString(), actualTnx.effectiveGasPrice.toString(),)

    // console.log(actualTnx)

    // console.log(ethers.utils.formatEther(gasToTransferSingleToken.mul(averageGasPrice)))

    // console.log(ethers.utils.formatEther(actualTnx.effectiveGasPrice.mul(actualTnx.cumulativeGasUsed)))

    // if (true == true)
    //     return;

    let now = await lastBlockTime()

    const endTime = daysToSeconds(1).add(now)

    const tnx = await darwinDrop.createAirdrop(
        {
            airdropTokenAddress: token.address,
            airdropTokenAmount: tokensToAirdrop,
            tokensPerUser: 0,
            startTime: now,
            endTime: endTime,
            airdropMaxParticipants: BigNumber.from(10 ** 8),
            requirementTokenAddress: token.address,// ethers.constants.AddressZero,
            requirementTokenAmount: 1,
            isPromoted: false,
            airDropType: AirDropType.LOTTERY,
            requirementType: AirDropRequirementType.NONE
        },
        4,
        {
            value: ethers.utils.parseEther(".5")
        }
    )

    const log = await tnx.wait(2)

    const airdropCreatedEvent = log.events?.filter(it => it.event == darwinDrop.interface.getEvent("AirDropCreated").name)?.[0] as AirDropCreatedEvent

    console.log(airdropCreatedEvent.args.airdrop.id);

    await setNetworkTimeStamp(BigNumber.from(endTime.add(10)))

    const airdropId = airdropCreatedEvent.args.airdrop.id;
    const baseGas = 21000
    // const averageGasPrice = await owner.getGasPrice()

    // const tnx = await token.transfer(accounts[0].address, 100);

    console.log(tnx)

    const gasToTransferSingleToken = await token.estimateGas.transfer(accounts[0].address, 100);

    const airdropTnxForOneAddress = await darwinDrop.estimateGas.airDropTokens([accounts[1].address], airdropId)
    const airdropTnxForTwo = await darwinDrop.estimateGas.airDropTokens([accounts[0].address, accounts[1].address], airdropId)
    const airdropTnxForThree = await darwinDrop.estimateGas.airDropTokens([owner.address, accounts[0].address, accounts[1].address], airdropId)


    const gasOnlyForTokenTnx = gasToTransferSingleToken.sub(baseGas)
    const airdropUtilityCost = airdropTnxForOneAddress.sub(gasOnlyForTokenTnx)

    const estimatedCostForTwo  = airdropUtilityCost.add(gasOnlyForTokenTnx.mul(2)).add(baseGas)
    const estimatedCostForThree  = airdropUtilityCost.add(gasOnlyForTokenTnx.mul(3)).add(baseGas)

    console.log(format(airdropTnxForTwo.mul(averageGasPrice)))
    console.log(format(estimatedCostForTwo.mul(averageGasPrice)))
    console.log(format(airdropTnxForThree.mul(averageGasPrice)))
    console.log(format(estimatedCostForThree.mul(averageGasPrice)))

    // console.log({
    //     gasToTransferSingleToken : format(gasToTransferSingleToken.mul(averageGasPrice)),
    //     airdropTnxForOneAddress: format(airdropTnxForOneAddress.mul(averageGasPrice)),
    //     airdropTnxForTwo: format(airdropTnxForTwo.mul(averageGasPrice)),
    //     estimatedCostForTwo: format(estimatedCostForTwo.mul(averageGasPrice)),
    //     airdropTnxForThree: format(airdropTnxForThree.mul(averageGasPrice)),
    // })

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });