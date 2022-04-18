import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import {AirDropType, AirDropRequirement} from "./utils"
import { ethers} from 'hardhat'
import {Signer} from 'ethers'


describe("NotCrypto", () => {
    
  let addressOne : any
  let addressTwo : any
  let tokenAddress : any
  let NotCryptoAirDrop : any
  let contract : any
  let accounts: Signer[];
  let owner, spender, holder;


  beforeEach(async () => {
    tokenAddress = '0x8377ee6d3545bc6ff1425ee3015dc648b149c7b2'
    addressOne = '0xaCbAb4F91Aaf1aA18fe5AEf926BAAfA57E6273c7'
    addressTwo = '0xaCbAb4F91Aaf1aA18fe5AEf926BAAfA57E6273c7'
    NotCryptoAirDrop = await ethers.getContractFactory("NotCryptoAirDrop");

    accounts = await ethers.getSigners();

    [owner, spender, holder] = await ethers.getSigners();

    contract = await NotCryptoAirDrop.deploy();

    contract.initialize(addressOne);
    

})

describe("AirDrop Functions", async function () {

    it("should set price when value is entered"), async function () {

        const result = await contract.connect(addressTwo).setPrice(0.01);

        expect(contract.price).to.be.equal(0.01);

    }

    it ("should set NotCrypto address to set Address") , async function() {


        expect(contract.NotCryptoaddress).to.be.equal(addressTwo);
    }

    it ("should set limit to Days After Start Time") , async function() {

        await contract.connect(addressTwo).setDaysAfterStart(420);
        
        expect(contract.numberAfterStartDays).to.be.not.undefined;
        expect(contract.numberAfterStartDays).to.be.not.null;
        expect(contract.numberAfterStartDays).to.be.equal(420);
    }

    it ("should set limit to Time difference") , async function() {
        
       
        await contract.connect(addressTwo).setDaysDifference(420);

        expect(contract.timeDifference).to.be.not.undefined;
        expect(contract.timeDifference).to.be.not.null;
        expect(contract.timeDifference).to.be.equal(420);
    
    }

    
})


describe ("Create Air Drop", async function() {
    it("should fail when someone enters the Start Date too Soon", async function() {

        const result = await contract.connect(addressOne).createAirDropToken(
            10,
            100,
            tokenAddress,
            AirDropType.LOTTERY,
            1638352800,
            1638871200,
            tokenAddress,
            1,
            AirDropRequirement.NFT_REQUIRED
        )

        expect(result).to.be.revertedWith("Invalid Date");

    })

    it ("should fail when someone sets Start date too early", async function() {
        
        const result = await contract.connect(addressOne).createAirDropToken(
            10,
            100,
            tokenAddress,
            AirDropType.LOTTERY,
            1638352800,
            1638871200,
            tokenAddress,
            1,
            AirDropRequirement.NFT_REQUIRED
        )

        expect(result).to.be.revertedWith("Invalid Date");
    })

    it ("should fail when someone sets end Date too soon", async function () {
        const result = await contract.connect(addressOne).createAirDropToken(
            10,
            100,
            tokenAddress,
            AirDropType.LOTTERY,
            1638352800,
            1638871200,
            tokenAddress,
            1,
            AirDropRequirement.NFT_REQUIRED
        )

        expect(result).to.be.revertedWith("Invalid Date");
    })

    it ("should fail when someone sets end Date too late", async function () {
       
        const result = await contract.connect(addressOne).createAirDropToken(
            10,
            100,
            tokenAddress,
            AirDropType.LOTTERY,
            1638352800,
            1638871200,
            tokenAddress,
            1,
            AirDropRequirement.NFT_REQUIRED
        )

        expect(result).to.be.revertedWith("Invalid Date");
    })

    it ("should fail when not enough ETH is sent by the Owner", async function () {
        const result = await contract.connect(addressOne).createAirDropToken(
            10,
            100,
            tokenAddress,
            AirDropType.LOTTERY,
            1638352800,
            1638871200,
            tokenAddress,
            1,
            AirDropRequirement.NFT_REQUIRED
        )

        expect(result).to.be.revertedWith("Invalid Date");
    })

    it ("should fail when someone sets end Date too soon", async function () {
        const result = await contract.connect(addressOne).createAirDropToken(
            10,
            100,
            tokenAddress,
            AirDropType.LOTTERY,
            1638352800,
            1638871200,
            tokenAddress,
            1,
            AirDropRequirement.NFT_REQUIRED
        )

        expect(result).to.be.revertedWith("Invalid Date");
    })
}) 


describe ("AirDrop Distribution", async function () {
    it ("should fail when airDrop is cancelled", async function () {
        
        await contract.connect(addressTwo).cancelAirDrop(
            0,
            tokenAddress
        )

        const result =   await contract.airDropTokens(
            [addressOne, addressTwo], tokenAddress, 1, 2
        )

        expect(result).to.be.revertedWith("AirDrop Has Been Cancelled");
    })

    it ("should fail when recepient does not have enough token", async function () {
        const result =     await contract.airDropTokens(
            [addressOne, addressTwo], tokenAddress, 1, 2
        )

        expect(result).to.be.revertedWith("Recepient does not Qualify For Drop");
    })

    it ("should fail when someone recepient doesn't have enough NFT", async function () {
        const result =     await contract.airDropTokens(
            [addressOne, addressTwo], tokenAddress, 1, 2
        )

        expect(result).to.be.revertedWith("Recepient does not Qualify For Drop");
    })

    it ("should be Successful airdrop distribution for airdrop with no airdrop requirement", async function () {
        const result =   await contract.airDropTokens(
            [addressOne, addressTwo], tokenAddress, 1, 2
        )
        expect(result).to.be.equal(true);
    })

    it ("should show Equal amount of token distribution after distributing tokens", async function () {
        
        await contract.airDropTokens(
            [addressOne, addressTwo], tokenAddress, 1, 2
        )
        
        
       
    
    })

    
})


})

