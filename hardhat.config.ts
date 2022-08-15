import * as dotenv from "dotenv";

import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import { HardhatUserConfig, task } from "hardhat/config";
import "solidity-coverage";

import { } from '@openzeppelin/hardhat-upgrades';

require('@openzeppelin/hardhat-upgrades')

dotenv.config();


// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
        console.log(account.address);
        
    }
});

const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.4",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            },
        }
    },
    gasReporter: {
        currency: 'BNB',
    },
    networks: {
        hardhat: {
            forking: {
                enabled:false,
                url: "https://data-seed-prebsc-1-s1.binance.org:8545",
              },
            loggingEnabled: false,
            gasMultiplier: 0.1,
            accounts: {
                mnemonic: String(process.env.TEST_MNEMONICS),
                count: 5,
                initialIndex: 0,
            }
        },
        bscTestNet: {
            loggingEnabled : true,
            gasPrice: 35000000000,
            url: "https://data-seed-prebsc-1-s1.binance.org:8545",
            accounts: {
                mnemonic: String(process.env.TEST_MNEMONICS),
                count: 5,
                initialIndex: 0
            }
        },
    },
    mocha: {
        timeout: 400000
    }

    
};

export default config;