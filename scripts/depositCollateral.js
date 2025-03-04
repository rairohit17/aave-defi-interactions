const { ethers } = require("hardhat");
const wethAbi = require("../abi/Iweth.json");
const poolAddressProviderAbi = require("../abi/IPoolAddressProvider.json");
const poolAbi = require("../abi/Ipool.json");

// Mainnet addresses
const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const POOL_ADDRESS_PROVIDER = "0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e";

async function getLandingPool(signer) {
    try {
        // Connect to Pool Address Provider
        const lendingPoolAddressProvider = await ethers.getContractAt(
            poolAddressProviderAbi, 
            POOL_ADDRESS_PROVIDER, 
            signer
        );
        console.log("Connected to lending pool address provider");

        // Get the actual pool address
        const poolAddress = await lendingPoolAddressProvider.getPool();
        console.log("Connecting to lending pool");

        // Connect to the Pool contract
        const lendingPool = await ethers.getContractAt(
            poolAbi, 
            poolAddress, 
            signer
        );
        console.log("Connected to lending pool");

        return lendingPool;
    } catch (error) {
        console.error("Error in getting lending pool:", error.message);
        throw error;
    }
}

async function depositFund() {
    // Get signer
    const [deployer] = await ethers.getSigners();
    console.log(`Deployer Address: ${deployer.address}`);

    // WETH Contract Interaction
    const wethContract = await ethers.getContractAt(wethAbi, WETH_ADDRESS, deployer);
    
    // Wrap ETH to WETH
    const depositAmount = ethers.parseEther("20");
    console.log(`Depositing ${ethers.formatEther(depositAmount)} ETH to WETH`);

    try {
        // Check ETH Balance
        const ethBalance = await ethers.provider.getBalance(deployer.address);
        console.log(`ETH Balance: ${ethers.formatEther(ethBalance)} ETH`);

        // Wrap ETH to WETH
        const wethDepositTx = await wethContract.deposit({ value: depositAmount });
        await wethDepositTx.wait(1);

        // Check WETH Balance after deposit
        const wethBalance = await wethContract.balanceOf(deployer.address);
        console.log(`WETH Balance: ${ethers.formatEther(wethBalance)} WETH`);

        // Get Lending Pool
        const lendingPool = await getLandingPool(deployer);

        // Approve WETH for deposit
        const approveTx = await wethContract.approve(lendingPool.target, depositAmount);
        await approveTx.wait(1);
        console.log('WETH Approval Completed');

        // Deposit to Aave V3 Pool
        const supplyTx = await lendingPool.supply(
            WETH_ADDRESS, 
            depositAmount, 
            deployer.address, 
            0  // referral code
        );
        const receipt = await supplyTx.wait(1);
        console.log('Supply Transaction Successful');

        // Fetch User Account Data
        const accountData = await lendingPool.getUserAccountData(deployer.address);
        
        console.log('\n--- Detailed Account Data ---');
        console.log(`Total Collateral Base: ${accountData[0]}`);
        console.log(`Total Debt Base: ${accountData[1]}`);
        console.log(`Available Borrowing Power: ${accountData[2]}`);
        console.log(`Liquidation Threshold: ${accountData[3]}`);
        console.log(`Loan to Value: ${accountData[4]}`);
        console.log(`Health Factor: ${accountData[5]}`);

        // Additional Diagnostics
        const collateralInEth = Number(accountData[0]) / (10 ** 18);
        console.log(`\nCollateral in ETH: ${collateralInEth} ETH`);

    } catch (error) {
        console.error('Error in Aave V3 Deposit Process:', error);
    }
}

module.exports = { 
    depositFund, 
    getLandingPool,
    WETH_ADDRESS,
    POOL_ADDRESS_PROVIDER 
};