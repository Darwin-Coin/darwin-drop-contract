import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import hardhat, { ethers } from "hardhat";

import { expect } from "chai";
import { BigNumber, BigNumberish, constants, Overrides, Signer, } from "ethers";
import { BytesLike, FormatTypes, keccak256, toUtf8Bytes, toUtf8String } from "ethers/lib/utils";


import { AirDrop, NotDrop } from "../typechain"
import { AirDropRequirement, AirDropType } from "./utils";


describe("NotCrypto", async () => {

    let addressOne: string
    let addressTwo: string
    let tokenAddress: string


    let accounts: Signer[];
    let owner, spender, holder;
    let accurateStartDate : number
    let accurateEndDate : number


    let notDrop: NotDrop

    beforeEach(async () => {
        tokenAddress = '0x8377ee6d3545bc6ff1425ee3015dc648b149c7b2'
        addressOne = '0xaCbAb4F91Aaf1aA18fe5AEf926BAAfA57E6273c7'
        addressTwo = '0xaCbAb4F91Aaf1aA18fe5AEf926BAAfA57E6273c7'

        let NotDrop = await ethers.getContractFactory("NotDrop");

        accounts = await ethers.getSigners();

        [owner, spender, holder] = await ethers.getSigners();

        notDrop = await NotDrop.deploy();

        await notDrop.initialize(addressOne);

        accurateEndDate = Math.floor(Date.now() / 1000)

        accurateStartDate = Math.floor(Date.now() + 10)

    })

    




    describe("Create Air Drop", async function () {
        it("should fail when someone enters the Start Date too Soon", async function () {

            let now = Math.floor(Date.now() / 1000)

            const result = notDrop.createAirDropToken(
                10,
                100,
                tokenAddress,
                AirDropType.LOTTERY,
                now,
                now,
                tokenAddress,
                1,
                AirDropRequirement.NFT_REQUIRED
            )

            expect(result).to.be.revertedWith("Invalid Date");

        })

        it("should fail when someone sets Start date too early", async function () {

                let date = Math.floor((new Date().getDate() - 5) / 1000);

                const result = notDrop.createAirDropToken(
                    10,
                    100,
                    tokenAddress,
                    AirDropType.LOTTERY,
                    date,
                    date,
                    tokenAddress,
                    1,
                    AirDropRequirement.NFT_REQUIRED
                )
    
                expect(result).to.be.revertedWith("Invalid Date");
            })

            it("should fail when someone sets end Date too soon", async function () {
                
                let now = Math.floor(Date.now() / 1000 + 1);

                const result = notDrop.createAirDropToken(
                    10,
                    100,
                    tokenAddress,
                    AirDropType.LOTTERY,
                    accurateStartDate,
                    now,
                    tokenAddress,
                    1,
                    AirDropRequirement.NFT_REQUIRED
                )
    
                expect(result).to.be.revertedWith("Invalid Date");
            })

            it("should fail when someone sets end Date too late", async function () {

                let now = Math.floor((Date.now() * 5) / 1000)

                const result = notDrop.createAirDropToken(
                    10,
                    100,
                    tokenAddress,
                    AirDropType.LOTTERY,
                    now,
                    now,
                    tokenAddress,
                    1,
                    AirDropRequirement.NFT_REQUIRED
                )
    
                expect(result).to.be.revertedWith("Time Difference Exceeded");

            })

            it("should fail when not enough ETH is sent by the Owner", async function () {
                
                let start = Math.floor(Date.now() / 1000)

                let end = Math.floor(new Date().getDate() / 1000 + 1)


                const result = notDrop.createAirDropToken(
                    10,
                    100,
                    tokenAddress,
                    AirDropType.LOTTERY,
                    start,
                    end,
                    tokenAddress,
                    1,
                    AirDropRequirement.NFT_REQUIRED, {
                        value : BigNumber.from(1000)
                    }
                )
    
                expect(result).to.be.revertedWith("Not enough Paid to List Token");


            })

 

    //     describe("AirDrop Distribution", async function () {
    //         it("should fail when airDrop is cancelled", async function () {
               
    //             let start = Math.floor(Date.now()  + 10)

    //             let end = Math.floor(Date.now() + 25)

    //             console.log(Date);

    //             console.log(end.toLocaleString());

    //             const dropId = await notDrop.createAirDropToken(
    //                 10,
    //                 100,
    //                 tokenAddress,
    //                 AirDropType.LOTTERY,
    //                 start,
    //                 end,
    //                 tokenAddress,
    //                 1,
    //                 AirDropRequirement.NFT_REQUIRED
    //             )
                
    //             await notDrop.cancelAirDrop(
    //                 dropId.value,
    //                 tokenAddress
    //             )

    //             const result = await notDrop.airDropTokens(
    //                 [addressOne, addressTwo], tokenAddress, 1, 2
    //             )

    //             expect(result).to.be.revertedWith("AirDrop Has Been Cancelled");
    //         })

    //         it("should fail when recepient does not have enough token", async function () {
                
                
    //             const result = await notDrop.airDropTokens(
    //                 [addressOne, addressTwo], tokenAddress, 1, 2
    //             )

                

    //             expect(result).to.be.revertedWith("Recepient does not Qualify For Drop");
    //         })

    //         it("should fail when someone recepient doesn't have enough NFT", async function () {
                
                
                
    //             const result = await notDrop.airDropTokens(
    //                 [addressOne, addressTwo], tokenAddress, 1, 2
    //             )

    //             expect(result).to.be.revertedWith("Recepient does not Qualify For Drop");
    //         })

    //     //     it("should be Successful airdrop distribution for airdrop with no airdrop requirement", async function () {
    //     //         const result = await notDrop.airDropTokens(
    //     //             [addressOne, addressTwo], tokenAddress, 1, 2
    //     //         )
    //     //         expect(result).to.be.equal(true);
    //     //     })

    //     //     it("should show Equal amount of token distribution after distributing tokens", async function () {

    //     //         await notDrop.airDropTokens(
    //     //             [addressOne, addressTwo], tokenAddress, 1, 2
    //     //         )

    //     //     })
    // })
})
})