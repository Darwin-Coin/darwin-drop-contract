import { HardhatUserConfig, task } from "hardhat/config";
import '@nomicfoundation/hardhat-toolbox';
import '@nomicfoundation/hardhat-chai-matchers';
import '@nomiclabs/hardhat-solhint';
import { } from "@openzeppelin/hardhat-upgrades";
import "@openzeppelin/hardhat-upgrades";
import "@nomiclabs/hardhat-etherscan";

import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {

    solidity: {

        compilers: [
            {
                version: "0.8.2",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    },
                }
            },
            {
                version: "0.8.14",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    },
                }
            }

        ],
    },

    networks: {
        local: {
            url: "http://127.0.0.1:8545",
            accounts: {
                mnemonic: String(process.env.TEST_MNEMONICS),
                count: 100,
                initialIndex: 0
            }
        },
        localMainNetFork: {
            url: "http://127.0.0.1:8545",
            accounts: {
                mnemonic: String(process.env.TEST_MNEMONICS),
                count: 100,
                initialIndex: 0
            }
        },

        localBscTestNetFork: {
            url: "http://127.0.0.1:8545",
            accounts: {
                mnemonic: String(process.env.TEST_MNEMONICS),
                count: 100,
                initialIndex: 6
            }
        },
        bscTestNet: {
            url: "https://data-seed-prebsc-2-s1.binance.org:8545/",
            chainId: 97,
            accounts: [String(process.env.TESTNET_PRIVATEKEY)]
        },
        bscMainNet: {
            url: "https://bsc-dataseed1.binance.org/",
            chainId: 56,
            accounts: [String(process.env.MAINNET_PRIVATEKEY)]
        },
        arbitrumGoerli: {
            url: "https://endpoints.omniatech.io/v1/arbitrum/goerli/public",
            chainId: 421613,
            accounts: [String(process.env.TESTNET_PRIVATEKEY)]
        },
        arbitrum: {
            url: "https://arbitrum-one.public.blastapi.io",
            chainId: 42161,
            accounts: [String(process.env.MAINNET_PRIVATEKEY)]
        },
        hardhat: {
            loggingEnabled: false,
            // mining : {
            //     auto:true,
            //     interval : 1000
            // },
            // initialBaseFeePerGas: 10,
            // gasMultiplier:1,
            // gasPrice: 10,
            // forking:{
            //     enabled:true,
            //     url : "https://bsc-dataseed3.ninicoin.io/"
            // },
            accounts: {
                // mnemonic: String(process.env.TEST_MNEMONICS),
                count: 100,
                initialIndex: 0
            }
        }
    },

    // gasReporter: {
    //     enabled: Boolean(process.env.REPORT_GAS),
    //     currency: "USD",
    // },
    etherscan: {
        apiKey: {
            bsc: String(process.env.BSCSCAN_API_KEY),
            bscTestnet: String(process.env.BSCSCAN_API_KEY),
            arbitrumOne: String(process.env.ARBISCAN_API_KEY)
        }
    },
    mocha: {
        parallel: false
    }
};

export default config;
