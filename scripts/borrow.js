const {depositFund, getLandingPool} = require("./depositCollateral")
const {ethers} = require("hardhat")

async function main() {
    const [signer] = await ethers.getSigners();
    const lendingPool = await getLandingPool();
    
    try {
        // Deposit more collateral first
        await depositFund();
    } catch(err) {
        console.log("Deposit error:", err.message);
        return; // Stop execution if deposit fails
    }
    
    try {
        // Get AAVE price from price feed
        const priceFeed = await ethers.getContractAt(
            "AggregatorV3Interface", 
            "0x547a514d5e3769680Ce22B2361c10Ea13619e8a9", 
            signer
        );
        const [, price] = await priceFeed.latestRoundData(); 
        console.log("AAVE price in USD: " + ethers.formatUnits(price, 8));
        
        // Get user account data
        const userData = await lendingPool.getUserAccountData(signer.address);
        
        // Log all relevant datax
        console.log("Total Collateral (ETH): ", ethers.formatUnits(userData[0], 18));
        console.log("Total Debt (ETH): ", ethers.formatUnits(userData[1], 18));
        console.log("Available Borrows (ETH): ", ethers.formatUnits(userData[2], 18));
        
        // Only proceed if we have meaningful collateral
        if (userData[0] < ethers.parseEther("0.01")) {
            console.log("Not enough collateral. Please deposit at least 0.01 ETH");
            return;
        }
        
        // Calculate borrowable AAVE amount (with more precise math)
        const totalBorrowableETH = userData[2]; // Available borrows in ETH
        console.log("Borrowable ETH: " + totalBorrowableETH);
        
        const aavePrice = price;
        console.log("AAVE price: " + aavePrice);
        
        // Convert ETH amount to AAVE
        // ETH value * 10^18 / AAVE price (in 8 decimals) * 10^10 to match decimals
        const totalBorrowableAave = (totalBorrowableETH * BigInt(10**10)) / aavePrice;
        console.log("Total borrowable AAVE: " + ethers.formatUnits(totalBorrowableAave, 18));
        
        // Borrow only 50% of the maximum amount
        const amountToBorrow = (totalBorrowableAave * BigInt(50)) / BigInt(100);
        
        // Only proceed if borrowable amount is meaningful
        if (amountToBorrow < BigInt(1)) {
            console.log("Borrowable AAVE amount too small. Please add more collateral.");
            return;
        }
        
        console.log("Attempting to borrow: " + ethers.formatUnits(amountToBorrow, 18) + " AAVE");
        
        // Attempt to borrow AAVE
        await borrowAave(
            lendingPool,
            "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9", // AAVE token address
            amountToBorrow,
            signer
        );
    } catch(error) {
        console.log("Error in main function:", error);
    }
    await depositAave("0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9" , amountToBorrow , signer  );
    return ;
}

async function borrowAave(lendingPool, tokenAddress, amount, signer) {
    try {
        console.log("Initiating borrow transaction...");
        
        // Attempt variable rate first
        const borrowTx = await lendingPool.borrow(
            tokenAddress, 
            amount, 
            2, // Variable interest rate mode
            0,  // Referral code (usually 0)
            signer.address
        );
        
        console.log("Transaction sent, waiting for confirmation...");
        await borrowTx.wait(1);
        console.log("Successfully borrowed " + ethers.formatUnits(amount, 18) + " AAVE");
    } catch(error) {
        console.log("Borrow error:", error.message);
        
        // If the error is code 30, suggest adding more collateral
        if (error.message.includes("30")) {
            console.log("Not enough collateral to cover the borrow. Try depositing more ETH.");
        }
    }
}

async function depositAave( lendingPool , aaveAddress, amount , signer ){
try{
    const depositAmount = lendingPool.deposit(aaveAddress , amount, signer.address , 0 );

}    
catch(error){
    console.log("error occured : " + error )
}

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log("Fatal error:", error.message);
        process.exit(1);
    });