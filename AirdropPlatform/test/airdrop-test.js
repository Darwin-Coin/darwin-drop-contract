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
           
            const result = await contract.createAirDropToken(1, addressTwo, "Bill");

            expect(result).to.equal(true);
        }


        it("should set price when value is entered"), async function () {

            const result = await contract.setPrice(0.01);

            expect(contract.price == 0.01);

        }

        it ("should set NotCrypto address to set Address") , async function() {

            const result = await contract.setNotCryptoAddress(NotCryptoaddress);

            expect(contract.NotCryptoaddress == NotCryptoaddress);
        }

        it ("should set limit to Days After Start Time") , async function() {

            const result = await contract.setDaysAfterStart(420);

            expect(contract.numberAfterStartDays == 420);
        }

        it ("should set limit to Time difference") , async function() {

            const result = await contract.setDaysDifference(420);

            expect(contract.timeDifference == 420);
        
        }

        it("should return true when all parameters are passed"), async function () {
           
            const result = contract.airDropTokens([addressTwo], addressOne, 0.5);

            expect(result).to.equal(true);
        }


    })



});
