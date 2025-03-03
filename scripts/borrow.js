const {getWeth , wethAddress, amount} = require("./getWeth");
const { ethers } = require("hardhat");

const wethAbi = require("../abi/Iweth.json")
const poolAddressProviderAbi = require("../abi/IPoolAddressProvider.json")
const poolAbi = require("../abi/Ipool.json");


// steps to follow 
// 1. connect to a weth contract and wrap your eth to erc20 standard

// 2. connect to the lendingPool address provider contract to get the  address of proxy pool contract 

// 3. connect to the pool contract to deposit weth tokens



async function main (){
    const [signer] = await ethers.getSigners()
    await getWeth();
    const lendingPool = await getLandingPool(signer)
    const poolAddress =  lendingPool.target;
    console.log( "the lending pool address is "+poolAddress )
    console.log(`approving for address ${signer.address} `)
    const approved = await approveWeth("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" , lendingPool.target ,amount ,  signer ) ;
    if (!approved) {
        console.log("weth approval failed ");
        return 
    } 
    const depositToPool = await lendingPool.supply(wethAddress , amount , signer.address,0 ) 
    await depositToPool.wait(1); 
    const data = await lendingPool.getUserAccountData(signer.address);

    console.log(data)
    const valueInEth = await lendingPool.getUserReserveData(wethAddress,signer.address)
    console.log("value in eth : "+ valueInEth)
    return ;
    



}

async function getLandingPool(signer){
   try{
    const lendingPoolAddressProvider = await ethers.getContractAt(poolAddressProviderAbi,  "0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e", signer)
    console.log("connected to lending pool address provider")
    const address = await lendingPoolAddressProvider.getPool();
    console.log("connecting to lending pool")
    const lendingPool = await ethers.getContractAt(poolAbi, address, signer )  ;
    console.log("connected to lending pool")
    return lendingPool; 
   }
   catch(error){
    console.log(error.message);
   }
    
}

async function approveWeth(contractAddress , receiverAddress , amount , deployer){

    try{
        const wethContract = await ethers.getContractAt(wethAbi , contractAddress, deployer )
        console.log(await wethContract.balanceOf(deployer.address))
    const approved  =  await wethContract.approve(receiverAddress , amount)
    await approved.wait(1);
    
    return approved 
    }
    catch(error){
        console.log("error occured while approving tokens ERROR : "+ error.message)

    }


}


main()
    .then(()=>process.exit(0))
    .catch((error)=> {console.log(error.message);
            process.exit(1)
    })