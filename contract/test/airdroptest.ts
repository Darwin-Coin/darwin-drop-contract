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
    })


    describe("AirDrop Functions", async function () {
        // it("should set price when value is entered"), async function () {

        //     const result = await notDrop.connect(addressTwo).setPrice(0.01);

        //     expect(notDrop.price).to.be.equal(0.01);

        // }

        // it("should set NotCrypto address to set Address"), async function () {


        //     expect(await notDrop.notCryptoAddress()).to.be.equal(addressTwo);
        // }

        // it("should set limit to Days After Start Time"), async function () {

        //     await notDrop.connect(addressTwo).setDaysAfterStart(420);

        //     expect(notDrop.numberAfterStartDays).to.be.not.undefined;
        //     expect(notDrop.numberAfterStartDays).to.be.not.null;
        //     expect(notDrop.numberAfterStartDays).to.be.equal(420);
        // }

        // it("should set limit to Time difference"), async function () {


        //     await notDrop.connect(addressTwo).setDaysDifference(420);

        //     expect(notDrop.timeDifference).to.be.not.undefined;
        //     expect(notDrop.timeDifference).to.be.not.null;
        //     expect(notDrop.timeDifference).to.be.equal(420);

        // }


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

        //     it("should fail when someone sets Start date too early", async function () {

        //         const result = await notDrop.connect(addressOne).createAirDropToken(
        //             10,
        //             100,
        //             tokenAddress,
        //             AirDropType.LOTTERY,
        //             1638352800,
        //             1638871200,
        //             tokenAddress,
        //             1,
        //             AirDropRequirement.NFT_REQUIRED
        //         )

        //         expect(result).to.be.revertedWith("Invalid Date");
        //     })

        //     it("should fail when someone sets end Date too soon", async function () {
        //         const result = await notDrop.connect(addressOne).createAirDropToken(
        //             10,
        //             100,
        //             tokenAddress,
        //             AirDropType.LOTTERY,
        //             1638352800,
        //             1638871200,
        //             tokenAddress,
        //             1,
        //             AirDropRequirement.NFT_REQUIRED
        //         )

        //         expect(result).to.be.revertedWith("Invalid Date");
        //     })

        //     it("should fail when someone sets end Date too late", async function () {

        //         const result = await notDrop.connect(addressOne).createAirDropToken(
        //             10,
        //             100,
        //             tokenAddress,
        //             AirDropType.LOTTERY,
        //             1638352800,
        //             1638871200,
        //             tokenAddress,
        //             1,
        //             AirDropRequirement.NFT_REQUIRED
        //         )

        //         expect(result).to.be.revertedWith("Invalid Date");
        //     })

        //     it("should fail when not enough ETH is sent by the Owner", async function () {
        //         const result = await notDrop.connect(addressOne).createAirDropToken(
        //             10,
        //             100,
        //             tokenAddress,
        //             AirDropType.LOTTERY,
        //             1638352800,
        //             1638871200,
        //             tokenAddress,
        //             1,
        //             AirDropRequirement.NFT_REQUIRED
        //         )

        //         expect(result).to.be.revertedWith("Invalid Date");
        //     })

        //     it("should fail when someone sets end Date too soon", async function () {
        //         const result = await notDrop.connect(addressOne).createAirDropToken(
        //             10,
        //             100,
        //             tokenAddress,
        //             AirDropType.LOTTERY,
        //             1638352800,
        //             1638871200,
        //             tokenAddress,
        //             1,
        //             AirDropRequirement.NFT_REQUIRED
        //         )

        //         expect(result).to.be.revertedWith("Invalid Date");
        //     })
        // })


        // describe("AirDrop Distribution", async function () {
        //     it("should fail when airDrop is cancelled", async function () {

        //         await notDrop.connect(addressTwo).cancelAirDrop(
        //             0,
        //             tokenAddress
        //         )

        //         const result = await notDrop.airDropTokens(
        //             [addressOne, addressTwo], tokenAddress, 1, 2
        //         )

        //         expect(result).to.be.revertedWith("AirDrop Has Been Cancelled");
        //     })

        //     it("should fail when recepient does not have enough token", async function () {
        //         const result = await notDrop.airDropTokens(
        //             [addressOne, addressTwo], tokenAddress, 1, 2
        //         )

        //         expect(result).to.be.revertedWith("Recepient does not Qualify For Drop");
        //     })

        //     it("should fail when someone recepient doesn't have enough NFT", async function () {
        //         const result = await notDrop.airDropTokens(
        //             [addressOne, addressTwo], tokenAddress, 1, 2
        //         )

        //         expect(result).to.be.revertedWith("Recepient does not Qualify For Drop");
        //     })

        //     it("should be Successful airdrop distribution for airdrop with no airdrop requirement", async function () {
        //         const result = await notDrop.airDropTokens(
        //             [addressOne, addressTwo], tokenAddress, 1, 2
        //         )
        //         expect(result).to.be.equal(true);
        //     })

        //     it("should show Equal amount of token distribution after distributing tokens", async function () {

        //         await notDrop.airDropTokens(
        //             [addressOne, addressTwo], tokenAddress, 1, 2
        //         )

        //     })
    })
})

