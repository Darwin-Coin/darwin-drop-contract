import { BigNumber } from "ethers"
import { ethers } from "hardhat"

export const now = () => Math.floor(Date.now() / 1000)
export const lastBlockTime = async () => (await ethers.provider.getBlock("latest")).timestamp
export const setNetworkTimeStamp = async (time: BigNumber) => {
    await ethers.provider.send("evm_setNextBlockTimestamp", [time.toNumber()])
    await ethers.provider.send("evm_mine", [])
}
export const hoursToSeconds = (hours: number): BigNumber => BigNumber.from(Math.floor(hours * 60 * 60))
export const daysToSeconds = (days: number): BigNumber => hoursToSeconds(days * 24)
export const weeksToSeconds = (weeks: number): BigNumber => daysToSeconds(weeks * 7)