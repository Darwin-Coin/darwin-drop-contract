import { ethers } from "hardhat";

import { expect } from "chai";
import { BigNumber, Signer } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";


import { DarwinDrop, TestErc20Token, PancakeFactory, IPancakeRouter02 } from "../typechain";
import { AirDropRequirementType, AirDropType, deployContracts } from "./utils";


describe("Darwin drop", async () => {

    let tokenAddress: string

    let others: SignerWithAddress[];
    let owner: SignerWithAddress, spender : SignerWithAddress, holder : SignerWithAddress;
    let accurateStartDate : number;
    let accurateEndDate : number;

    let darwinDrop: DarwinDrop;
    let token : TestErc20Token;

    beforeEach(async () => {

        [owner, spender, holder, ...others] = await ethers.getSigners();

        accurateEndDate = Math.floor(Date.now() / 1000)

        accurateStartDate = Math.floor(Date.now() + 10)

        const info = await deployContracts()

        darwinDrop = info.darwinDrop
        token = info.token;

        await token.mint(ethers.utils.parseEther("2000"));

    })

    
    describe("Create Air Drop", async function () {
        it("should fail when someone enters the end date too Soon", async function () {

            let now = Math.floor(Date.now() / 1000)

            await expect(darwinDrop.createAirdrop(
                {
                 airdropTokenAddress: token.address,
                 airdropTokenAmount: 100,
                 tokensPerUser: 0,
                 startTime: now,
                 endTime: now - 1,
                 airdropMaxParticipants: BigNumber.from(10 ** 8),
                 requirementTokenAddress: ethers.constants.AddressZero,
                 requirementTokenAmount: 0,
                 isPromoted:false,
                 airDropType: AirDropType.LOTTERY,
                 requirementType: AirDropRequirementType.NONE
                },
                1,
             
             {
                 value: ethers.utils.parseEther(".1")
             }
             )).to.be.revertedWith("InvalidEndDate");

        })

        it("should fail when someone sets Start date too early", async function () {

            let now =  Math.floor((Date.now() / 1000));
            let start = now - 1000;
            let end  =  now + 100;

            console.log(now);
            console.log(start)

            await expect(darwinDrop.createAirdrop(
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
               {value: ethers.utils.parseEther(".1")}
            
            )).to.be.revertedWith("InvalidStartTime");

        })

        it("should success on valid data", async function () {

            const tokensToAirdrop  = 100;

            await token.approve(darwinDrop.address, tokensToAirdrop)
        
            let now = Math.floor(Date.now() / 1000)
        
            const tnx = await darwinDrop.createAirdrop(
               {
                airdropTokenAddress: token.address,
                airdropTokenAmount: tokensToAirdrop,
                tokensPerUser: 0,
                startTime: now + 100,
                endTime: now + 12000,
                airdropMaxParticipants: BigNumber.from(10 ** 8),
                requirementTokenAddress: ethers.constants.AddressZero,
                requirementTokenAmount: 0,
                isPromoted:false,
                airDropType: AirDropType.LOTTERY,
                requirementType: AirDropRequirementType.NONE
               },
               1,
            
            {
                value: ethers.utils.parseEther(".1")
            }
        )

        })

        it("can get details of a drop", async function () {

            const tokensToAirdrop  = 100;

            await token.approve(darwinDrop.address, tokensToAirdrop)
        
            let now = Math.floor(Date.now() / 1000)
        
            const tnx = await darwinDrop.createAirdrop(
               {
                airdropTokenAddress: token.address,
                airdropTokenAmount: tokensToAirdrop,
                tokensPerUser: 0,
                startTime: now + 100,
                endTime: now + 12000,
                airdropMaxParticipants: BigNumber.from(10 ** 8),
                requirementTokenAddress: ethers.constants.AddressZero,
                requirementTokenAmount: 0,
                isPromoted:false,
                airDropType: AirDropType.LOTTERY,
                requirementType: AirDropRequirementType.NONE
               },
               1,
            
            {
                value: ethers.utils.parseEther(".1")
            }

            
            )

            let details = await darwinDrop.getAirDropDetails(0);

        })

        it("can create an airdrop with darwin", async function () {

            const tokensToAirdrop  = 100;

            await token.approve(darwinDrop.address, tokensToAirdrop)
        
            let now = Math.floor(Date.now() / 1000)

            let pancake = await deployPancakeswap(token.address);

            await token.approve(pancake.pancakeRouter.address, ethers.utils.parseEther("1000"));

            await pancake.pancakeRouter.addLiquidityETH(token.address, ethers.utils.parseEther("100"), 0, 0, owner.address, now + 200, {value: ethers.utils.parseEther("10")});

            let pair = await pancake.pancakeFactory.getPair(token.address, pancake.wBNB.address);

            console.log(pair);

            await darwinDrop.setPool(pair);

            let amountDarwin = await darwinDrop.getDarwinAmount(ethers.utils.parseEther("0.1"));

            console.log(amountDarwin)

            await token.approve(darwinDrop.address, amountDarwin.add(tokensToAirdrop))
        
            const tnx = await darwinDrop.createAirdropWithDarwin(
               {
                airdropTokenAddress: token.address,
                airdropTokenAmount: tokensToAirdrop,
                tokensPerUser: 0,
                startTime: now + 100,
                endTime: now + 12000,
                airdropMaxParticipants: BigNumber.from(10 ** 8),
                requirementTokenAddress: ethers.constants.AddressZero,
                requirementTokenAmount: 0,
                isPromoted:false,
                airDropType: AirDropType.LOTTERY,
                requirementType: AirDropRequirementType.NONE
               },
               1
            )

            let details = await darwinDrop.getAirDropDetails(0);

        })

        it("can cancel airdrop", async function () {

            const tokensToAirdrop  = 100;

            await token.approve(darwinDrop.address, tokensToAirdrop)
        
            let now = Math.floor(Date.now() / 1000)

            let pancake = await deployPancakeswap(token.address);

            await token.approve(pancake.pancakeRouter.address, ethers.utils.parseEther("1000"));

            await pancake.pancakeRouter.addLiquidityETH(token.address, ethers.utils.parseEther("100"), 0, 0, owner.address, now + 200, {value: ethers.utils.parseEther("10")});

            let pair = await pancake.pancakeFactory.getPair(token.address, pancake.wBNB.address);

            console.log(pair);

            await darwinDrop.setPool(pair);

            let amountDarwin = await darwinDrop.getDarwinAmount(ethers.utils.parseEther("0.1"));

            console.log(amountDarwin)

            await token.approve(darwinDrop.address, amountDarwin.add(tokensToAirdrop))
        
            const tnx = await darwinDrop.createAirdropWithDarwin(
               {
                airdropTokenAddress: token.address,
                airdropTokenAmount: tokensToAirdrop,
                tokensPerUser: 0,
                startTime: now + 100,
                endTime: now + 12000,
                airdropMaxParticipants: BigNumber.from(10 ** 8),
                requirementTokenAddress: ethers.constants.AddressZero,
                requirementTokenAmount: 0,
                isPromoted:false,
                airDropType: AirDropType.LOTTERY,
                requirementType: AirDropRequirementType.NONE
               },
               1
            )

            let details = await darwinDrop.getAirDropDetails(0);

            await darwinDrop.cancelAirDrop(0);

        })

        it("only owner or community can cancel airdrop", async function () {

            const tokensToAirdrop  = 100;

            await token.approve(darwinDrop.address, tokensToAirdrop)
        
            let now = Math.floor(Date.now() / 1000)

            let pancake = await deployPancakeswap(token.address);

            await token.approve(pancake.pancakeRouter.address, ethers.utils.parseEther("1000"));

            await pancake.pancakeRouter.addLiquidityETH(token.address, ethers.utils.parseEther("100"), 0, 0, owner.address, now + 200, {value: ethers.utils.parseEther("10")});

            let pair = await pancake.pancakeFactory.getPair(token.address, pancake.wBNB.address);

            console.log(pair);

            await darwinDrop.setPool(pair);

            let amountDarwin = await darwinDrop.getDarwinAmount(ethers.utils.parseEther("0.1"));

            console.log(amountDarwin)

            await token.approve(darwinDrop.address, amountDarwin.add(tokensToAirdrop))
        
            const tnx = await darwinDrop.createAirdropWithDarwin(
               {
                airdropTokenAddress: token.address,
                airdropTokenAmount: tokensToAirdrop,
                tokensPerUser: 0,
                startTime: now + 100,
                endTime: now + 12000,
                airdropMaxParticipants: BigNumber.from(10 ** 8),
                requirementTokenAddress: ethers.constants.AddressZero,
                requirementTokenAmount: 0,
                isPromoted:false,
                airDropType: AirDropType.LOTTERY,
                requirementType: AirDropRequirementType.NONE
               },
               1
            )

            let details = await darwinDrop.getAirDropDetails(0);

            await expect(darwinDrop.connect(others[0]).cancelAirDrop(0)).to.be.revertedWith("UnauthorizedToCancel");

        })


        it("should fail to send airdrop if still in progress", async function () {

            const tokensToAirdrop  = 100;

            await token.approve(darwinDrop.address, tokensToAirdrop)
        
            let now = Math.floor(Date.now() / 1000)

            let pancake = await deployPancakeswap(token.address);

            await token.approve(pancake.pancakeRouter.address, ethers.utils.parseEther("1000"));

            await pancake.pancakeRouter.addLiquidityETH(token.address, ethers.utils.parseEther("100"), 0, 0, owner.address, now + 2000, {value: ethers.utils.parseEther("10")});

            let pair = await pancake.pancakeFactory.getPair(token.address, pancake.wBNB.address);

            console.log(pair);

            await darwinDrop.setPool(pair);

            let amountDarwin = await darwinDrop.getDarwinAmount(ethers.utils.parseEther("0.1"));

            console.log(amountDarwin)

            await token.approve(darwinDrop.address, amountDarwin.add(tokensToAirdrop))
        
            const tnx = await darwinDrop.createAirdropWithDarwin(
               {
                airdropTokenAddress: token.address,
                airdropTokenAmount: tokensToAirdrop,
                tokensPerUser: 0,
                startTime: now + 100,
                endTime: now + 12000,
                airdropMaxParticipants: BigNumber.from(10 ** 8),
                requirementTokenAddress: ethers.constants.AddressZero,
                requirementTokenAmount: 0,
                isPromoted:false,
                airDropType: AirDropType.LOTTERY,
                requirementType: AirDropRequirementType.NONE
               },
               1
            )

            let toAirdrop = [others[0].address, others[1].address, others[2].address];

            await expect(darwinDrop.airDropTokens(toAirdrop, 0)).to.be.revertedWith("AirdropStillInProgress");

        })

        it("can send tokens via airdrop", async function () {

            const tokensToAirdrop  = 100;

            await token.approve(darwinDrop.address, tokensToAirdrop)
        
            let now = Math.floor(Date.now() / 1000)

            let pancake = await deployPancakeswap(token.address);

            await token.approve(pancake.pancakeRouter.address, ethers.utils.parseEther("1000"));

            await pancake.pancakeRouter.addLiquidityETH(token.address, ethers.utils.parseEther("100"), 0, 0, owner.address, now + 2000, {value: ethers.utils.parseEther("10")});

            let pair = await pancake.pancakeFactory.getPair(token.address, pancake.wBNB.address);

            console.log(pair);

            await darwinDrop.setPool(pair);

            let amountDarwin = await darwinDrop.getDarwinAmount(ethers.utils.parseEther("0.1"));

            console.log(amountDarwin)

            await token.approve(darwinDrop.address, amountDarwin.add(tokensToAirdrop))
        
            const tnx = await darwinDrop.createAirdropWithDarwin(
               {
                airdropTokenAddress: token.address,
                airdropTokenAmount: tokensToAirdrop,
                tokensPerUser: 0,
                startTime: now + 100,
                endTime: now + 12000,
                airdropMaxParticipants: BigNumber.from(10 ** 8),
                requirementTokenAddress: ethers.constants.AddressZero,
                requirementTokenAmount: 0,
                isPromoted:false,
                airDropType: AirDropType.LOTTERY,
                requirementType: AirDropRequirementType.NONE
               },
               1
            )

            let toAirdrop = [others[0].address, others[1].address, others[2].address];

            await setNetworkTimeStamp(BigNumber.from(now + 12000))

            await expect(darwinDrop.airDropTokens(toAirdrop, 0))

        })

        it("can send tokens via airdrop with requirments", async function () {

            const blockNumBefore = await ethers.provider.getBlockNumber();
            const blockBefore = await ethers.provider.getBlock(blockNumBefore);
            const timestampBefore = blockBefore.timestamp;

            const tokensToAirdrop  = 100;

            const start = timestampBefore + 100;
            const end = timestampBefore + 2000;

            await token.approve(darwinDrop.address, tokensToAirdrop)
        
            let now = Math.floor(Date.now() / 1000)

            let pancake = await deployPancakeswap(token.address);

            await token.approve(pancake.pancakeRouter.address, ethers.utils.parseEther("1000"));

            await pancake.pancakeRouter.addLiquidityETH(token.address, ethers.utils.parseEther("100"), 0, 0, owner.address, end, {value: ethers.utils.parseEther("10")});

            let pair = await pancake.pancakeFactory.getPair(token.address, pancake.wBNB.address);

            console.log(pair);

            await darwinDrop.setPool(pair);

            let amountDarwin = await darwinDrop.getDarwinAmount(ethers.utils.parseEther("0.1"));

            console.log(amountDarwin)

            await token.approve(darwinDrop.address, amountDarwin.add(tokensToAirdrop))
        
            const tnx = await darwinDrop.createAirdropWithDarwin(
               {
                airdropTokenAddress: token.address,
                airdropTokenAmount: tokensToAirdrop,
                tokensPerUser: 0,
                startTime: start,
                endTime: end,
                airdropMaxParticipants: BigNumber.from(10 ** 8),
                requirementTokenAddress: token.address,
                requirementTokenAmount: 10,
                isPromoted:false,
                airDropType: AirDropType.LOTTERY,
                requirementType: AirDropRequirementType.TOKEN_REQUIRED
               },
               1
            )

            let toAirdrop = [others[0].address, others[1].address, others[2].address];

            await token.transfer(others[0].address, 10);
            await token.transfer(others[1].address, 10);

            await setNetworkTimeStamp(BigNumber.from(end + 1));

            await darwinDrop.airDropTokens(toAirdrop, 0)

        })

        it("can withdraw remaining tokens", async function () {

            const blockNumBefore = await ethers.provider.getBlockNumber();
            const blockBefore = await ethers.provider.getBlock(blockNumBefore);
            const timestampBefore = blockBefore.timestamp;

            const tokensToAirdrop  = 100;

            const start = timestampBefore + 100;
            const end = timestampBefore + 2000;

            await token.approve(darwinDrop.address, tokensToAirdrop)
        
            let now = Math.floor(Date.now() / 1000)

            let pancake = await deployPancakeswap(token.address);

            await token.approve(pancake.pancakeRouter.address, ethers.utils.parseEther("1000"));

            await pancake.pancakeRouter.addLiquidityETH(token.address, ethers.utils.parseEther("100"), 0, 0, owner.address, end, {value: ethers.utils.parseEther("10")});

            let pair = await pancake.pancakeFactory.getPair(token.address, pancake.wBNB.address);

            console.log(pair);

            await darwinDrop.setPool(pair);

            let amountDarwin = await darwinDrop.getDarwinAmount(ethers.utils.parseEther("0.1"));

            console.log(amountDarwin)

            await token.approve(darwinDrop.address, amountDarwin.add(tokensToAirdrop))
        
            const tnx = await darwinDrop.createAirdropWithDarwin(
               {
                airdropTokenAddress: token.address,
                airdropTokenAmount: tokensToAirdrop,
                tokensPerUser: 0,
                startTime: start,
                endTime: end,
                airdropMaxParticipants: BigNumber.from(10 ** 8),
                requirementTokenAddress: token.address,
                requirementTokenAmount: 10,
                isPromoted:false,
                airDropType: AirDropType.LOTTERY,
                requirementType: AirDropRequirementType.TOKEN_REQUIRED
               },
               1
            )

            let toAirdrop = [others[0].address, others[1].address, others[2].address];

            await token.transfer(others[0].address, 10);
            await token.transfer(others[1].address, 10);

            await setNetworkTimeStamp(BigNumber.from(end + 1));

            await darwinDrop.airDropTokens(toAirdrop, 0)

            await darwinDrop.withdrawRemainingTokens(0);

        })

        it("can set airdrop creation price", async () => {

            await darwinDrop.setAirdropCreationPriceEth(ethers.utils.parseEther(".2"));

        })

        it("can set airdrop promotion price", async () => {

            await darwinDrop.setAirdropPromotionPriceEth(ethers.utils.parseEther(".2"));

        })

        it("can set community address", async () => {

            await darwinDrop.setCommunityAddress(others[0].address);

            await expect(darwinDrop.setAirdropPromotionPriceEth(ethers.utils.parseEther(".2"))).to.be.revertedWith("NotDarwinCommunity");

            await darwinDrop.connect(others[0]).setAirdropPromotionPriceEth(ethers.utils.parseEther(".2"));

        })

        it("can set deplay for airdrop start", async () => {

            await darwinDrop.setMaxDelayForAirdropStart(5);

        })

        it("can set max duration", async () => {

            await darwinDrop.setMaxAirdropDuration(5);

        })

        it("can set whitelist, and not spend eth on airdrop creation", async () => {

            await darwinDrop.setFeeWhitelist(others[0].address, true);

            const tokensToAirdrop  = 100;

            await token.transfer(others[0].address, tokensToAirdrop * 100)
            await token.connect(others[0]).approve(darwinDrop.address, tokensToAirdrop)
        
            const blockNumBefore = await ethers.provider.getBlockNumber();
            const blockBefore = await ethers.provider.getBlock(blockNumBefore);
            const timestampBefore = blockBefore.timestamp;


            const start = timestampBefore + 100;
            const end = timestampBefore + 2000;
        
            const tnx = await darwinDrop.connect(others[0]).createAirdrop(
               {
                airdropTokenAddress: token.address,
                airdropTokenAmount: tokensToAirdrop,
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
            
            {
                value: ethers.utils.parseEther("0")
            }

            
            )

            let pancake = await deployPancakeswap(token.address);

            await token.approve(pancake.pancakeRouter.address, ethers.utils.parseEther("1000"));

            await pancake.pancakeRouter.addLiquidityETH(token.address, ethers.utils.parseEther("100"), 0, 0, owner.address, end, {value: ethers.utils.parseEther("10")});

            let pair = await pancake.pancakeFactory.getPair(token.address, pancake.wBNB.address);

            console.log(pair);

            await darwinDrop.setPool(pair);

            let amountDarwin = await darwinDrop.getDarwinAmount(ethers.utils.parseEther("0.1"));

            console.log(amountDarwin)

            await token.transfer(others[0].address, amountDarwin)

            await token.connect(others[0]).approve(darwinDrop.address, amountDarwin.add(tokensToAirdrop))
        
            await darwinDrop.connect(others[0]).createAirdropWithDarwin(
               {
                airdropTokenAddress: token.address,
                airdropTokenAmount: tokensToAirdrop,
                tokensPerUser: 0,
                startTime: start,
                endTime: end,
                airdropMaxParticipants: BigNumber.from(10 ** 8),
                requirementTokenAddress: token.address,
                requirementTokenAmount: 10,
                isPromoted:false,
                airDropType: AirDropType.LOTTERY,
                requirementType: AirDropRequirementType.TOKEN_REQUIRED
               },
               1
            )

        })

        it("reverts when getting darwin price if no pair set", async() => {

            await expect(darwinDrop.getDarwinAmount(1)).to.be.revertedWith("PairNotSet");

        })

        it("reverts with invlid values", async() => {

            const tokensToAirdrop  = 100;

            await token.transfer(others[0].address, tokensToAirdrop * 100)
            await token.connect(others[0]).approve(darwinDrop.address, tokensToAirdrop)
        
            const blockNumBefore = await ethers.provider.getBlockNumber();
            const blockBefore = await ethers.provider.getBlock(blockNumBefore);
            const timestampBefore = blockBefore.timestamp;


            const start = timestampBefore + 100;
            const end = timestampBefore + 2000;
        
            await expect(darwinDrop.connect(others[0]).createAirdrop(
               {
                airdropTokenAddress: token.address,
                airdropTokenAmount: tokensToAirdrop,
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
            
            {
                value: ethers.utils.parseEther("0")
            })).to.be.revertedWith("InvalidValueSent")

        })

        it("reverts withdrawal if active", async() => {

            const tokensToAirdrop  = 100;

            await token.transfer(others[0].address, tokensToAirdrop * 100)
            await token.connect(others[0]).approve(darwinDrop.address, tokensToAirdrop)
        
            const blockNumBefore = await ethers.provider.getBlockNumber();
            const blockBefore = await ethers.provider.getBlock(blockNumBefore);
            const timestampBefore = blockBefore.timestamp;


            const start = timestampBefore + 100;
            const end = timestampBefore + 2000;
        
            await darwinDrop.connect(others[0]).createAirdrop(
               {
                airdropTokenAddress: token.address,
                airdropTokenAmount: tokensToAirdrop,
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
            
            {
                value: ethers.utils.parseEther("0.1")
            })

            await expect(darwinDrop.withdrawRemainingTokens(0)).to.be.revertedWith("NotAirdropOwner");

            await expect(darwinDrop.connect(others[0]).withdrawRemainingTokens(0)).to.be.revertedWith("AirdropActive");

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

    async function deployPancakeswap(token:string) {
        // Hardhat always runs the compile task when running scripts with its command
        const [owner, ...others] = await ethers.getSigners()
    
        const WBNB = await ethers.getContractFactory("WBNB")
        const PancakeFactory = await ethers.getContractFactory("PancakeFactory");
        const PancakeRouter01 = await ethers.getContractFactory("PancakeRouter01");
        const PancakeRouter = await ethers.getContractFactory("PancakeRouter");
    
    
        const wBNB = await WBNB.deploy();
        const pancakeFactory = await PancakeFactory.deploy(owner.address) as PancakeFactory
        const pancakeRouter01 = await PancakeRouter01.deploy(pancakeFactory.address, wBNB.address)
        const pancakeRouter = await PancakeRouter.deploy(pancakeFactory.address, wBNB.address) as IPancakeRouter02

        await pancakeFactory.createPair(token, wBNB.address)
    
        // console.log(` INIT_CODE_PAIR_HASH: ${await pancakeFactory.INIT_CODE_PAIR_HASH()}`)
    
        return {
            wBNB: wBNB,
            pancakeFactory: pancakeFactory,
            pancakeRouter01: pancakeRouter01,
            pancakeRouter: pancakeRouter
        }
    }

    const setNetworkTimeStamp = async (time: BigNumber) => {
        await ethers.provider.send("evm_setNextBlockTimestamp", [time.toNumber()])
        await ethers.provider.send("evm_mine", [])
    }
})
