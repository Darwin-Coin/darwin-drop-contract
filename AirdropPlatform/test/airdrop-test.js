const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("NotCryptoAirDrop", function () {
    

    let NotCryptoAirDrop;
    let NotCryptoaddress;
    let contract;

    beforeEach(async function () {

    // Get the ContractFactory and Signers here.
    NotCryptoAirDrop = await ethers.getContractFactory("NotCryptoAirDrop");

    contract = await NotCryptoAirDrop.deploy();


    await contract.deployed();

    contract.initialize(0xaCbAb4F91Aaf1aA18fe5AEf926BAAfA57E6273c7);

  });
    

    describe("AirDrop Functions", function () {
        it("should return true when all parameters are passed"), async function () {
           
            const result = contract.createAirDropToken(1, 0x696958A7f7AFB33F7B6ccA1273719A129Bf6dB5C, "Bill");

            expect(result).to.equal(true);
        }

        it("should return true when all parameters are passed"), async function () {
           
            const result = contract.createAirDropToken(1, 0x696958A7f7AFB33F7B6ccA1273719A129Bf6dB5C, "Bill");

            expect(result).to.equal(true);
        }


    })



});
