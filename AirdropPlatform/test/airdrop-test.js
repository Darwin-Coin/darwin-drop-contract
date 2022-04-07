const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("NotCryptoAirDrop", function () {
    

    let NotCryptoAirDrop;
    let NotCryptoaddress;
    let contract;
    let addressOne;
    let addressTwo;

    beforeEach(async function () {

    // Get the ContractFactory and Signers here.
    NotCryptoAirDrop = await ethers.getContractFactory("NotCryptoAirDrop");

    contract = await NotCryptoAirDrop.deploy();

    NotCryptoaddress = 0x696958A7f7AFB33F7B6ccA1273719A129Bf6dB5C;

    await contract.deployed();

    contract.initialize(NotCryptoaddress);

  });
    

    describe("AirDrop Functions", function () {
        it("should return true when all parameters are passed"), async function () {
           
            const result = contract.createAirDropToken(1, addressTwo, "Bill");

            expect(result).to.equal(true);
        }

        it("should return true when all parameters are passed"), async function () {
           
            const result = contract.airDropTokens([addressTwo], addressOne, 0.5);

            expect(result).to.equal(true);
        }


    })



});
