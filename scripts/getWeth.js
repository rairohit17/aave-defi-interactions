const { ethers } = require("hardhat");
const abi = require("../abi/Iweth.json");
const wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"

const amount = ethers.parseEther("20");
async function getWeth() {

    const [deployer] = await ethers.getSigners();

    const iweth = await ethers.getContractAt(abi, wethAddress,  deployer);
    const initialBalance = await iweth.balanceOf(deployer.address);
    console.log(`initial balance of ${deployer.address}  : ` + initialBalance);
    const tx = await iweth.deposit({ value: amount });
    await tx.wait(1);

    const wethBalance = await iweth.balanceOf(deployer.address); // 
    console.log(`The balance of deployer ${deployer.address} is ${wethBalance}`);
}

module.exports = {getWeth , amount, wethAddress}

