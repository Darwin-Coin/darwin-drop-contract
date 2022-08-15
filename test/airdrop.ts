import { ethers } from "hardhat";

import { expect } from "chai";
import { BigNumber, Signer } from "ethers";


import { DarwinDrop, TestErc20Token } from "../typechain";
import { AirDropRequirementType, AirDropType, deployContracts } from "./utils";


describe("NotCrypto", async () => {

    let tokenAddress: string

    let others: Signer[];
    let owner: Signer, spender : Signer, holder : Signer;
    let accurateStartDate : number
    let accurateEndDate : number

    let darwinDrop: DarwinDrop
    let token : TestErc20Token;

    beforeEach(async () => {

        [owner, spender, holder, ...others] = await ethers.getSigners();

        accurateEndDate = Math.floor(Date.now() / 1000)

        accurateStartDate = Math.floor(Date.now() + 10)

        const info = await deployContracts()

        darwinDrop = info.darwinDrop
        token = info.token;
    })

    
    describe("Create Air Drop", async function () {
        it("should fail when someone enters the Start Date too Soon", async function () {

            let now = Math.floor(Date.now() / 1000)

            const result = darwinDrop.createAirdrop(
               {
                airdropTokenAddress: token.address,
                airdropTokenAmount: 100,
                tokensPerUser: 0,
                startTime: now,
                endTime: now,
                airdropMaxParticipants: BigNumber.from(10 ** 8),
                requirementTokenAddress: ethers.constants.AddressZero,
                requirementTokenAmount: 0,
                isPromoted:false,
                airDropType: AirDropType.LOTTERY,
                requirementType: AirDropRequirementType.NONE
               },
               1,
            
            )

            await expect(result).to.be.revertedWith("DD::createAirdrop: invalid end date");

        })

        it.only("should fail when someone sets Start date too early", async function () {


            let now =  Math.floor((new Date().getDate()) / 1000);
            let start = now - 1000;
            let end  =  now + 100;

            const result = darwinDrop.createAirdrop(
               {
                airdropTokenAddress: token.address,
                airdropTokenAmount: 100,
                tokensPerUser: 0,
                startTime: start,
                endTime: end,
                airdropMaxParticipants: BigNumber.from(10 ** 8),
                requirementTokenAddress: ethers.constants.AddressZero,
                requirementTokenAmount: 0,
                isPromoted:false,
                airDropType: AirDropType.LOTTERY,
                requirementType: AirDropRequirementType.NONE
               },
               1,
            
            )

        })

        //     it("should fail when someone sets end Date too soon", async function () {
                
        //         let now = Math.floor(Date.now() / 1000 + 1);

        //         const result = darwinDrop.createAirDropToken(
        //             10,
        //             100,
        //             tokenAddress,
        //             AirDropType.LOTTERY,
        //             accurateStartDate,
        //             now,
        //             tokenAddress,
        //             1,
        //             AirDropRequirement.NFT_REQUIRED,
        //             1
        //         )
    
        //         expect(result).to.be.revertedWith("Invalid Date");
        //     })

        //     it("should fail when someone sets end Date too late", async function () {

        //         let now = Math.floor((Date.now() * 5) / 1000)

        //         const result = darwinDrop.createAirDropToken(
        //             10,
        //             100,
        //             tokenAddress,
        //             AirDropType.LOTTERY,
        //             now,
        //             now,
        //             tokenAddress,
        //             1,
        //             AirDropRequirement.NFT_REQUIRED,
        //             1
        //         )
    
        //         expect(result).to.be.revertedWith("Time Difference Exceeded");

        //     })

        //     it("should fail when not enough ETH is sent by the Owner", async function () {
                
        //         let start = Math.floor(Date.now() / 1000)

        //         let end = Math.floor(new Date().getDate() / 1000 + 1)


        //         const result = darwinDrop.createAirDropToken(
        //             10,
        //             100,
        //             tokenAddress,
        //             AirDropType.LOTTERY,
        //             start,
        //             end,
        //             tokenAddress,
        //             1,
        //             AirDropRequirement.NFT_REQUIRED,
        //             1, {
        //                 value : BigNumber.from(1000)
        //             }
        //         )
    
        //         expect(result).to.be.revertedWith("Not enough Paid to List Token");


        //     })

 

        // describe("AirDrop Distribution", async function () {
        //     it("should fail when airDrop is cancelled", async function () {
               
        //         let start = Math.floor(Date.now()  + 10)

        //         let end = Math.floor(Date.now() + 25)

        //         console.log(Date);

        //         console.log(end.toLocaleString());

        //         const dropId = await darwinDrop.createAirDropToken(
        //             5,
        //             200,
        //             '0x94f94036451a1bc628DE41D35Fa86D68F05Ab43c',
        //             0,
        //             1651622400,
        //             1651968000,
        //             '0x0000000000000000000000000000000000000000',
        //             0,
        //             0,
        //             1
        //         )
                
        //         // await darwinDrop.cancelAirDrop(
        //         //     dropId.value,
        //         //     tokenAddress
        //         // )

        //         // const result = await darwinDrop.airDropTokens(
        //         //     [addressOne, addressTwo], tokenAddress, 1, 2
        //         // )

        //         // expect(result).to.be.revertedWith("AirDrop Has Been Cancelled");
        //     })
        // })

    })
})
