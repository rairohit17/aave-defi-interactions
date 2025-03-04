require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers:[
      {
        version:"0.8.20",
      }, 
      {
        version:"0.6.12",
      },
      {
        version:"0.8.0"
      }
    ]
  },
  networks:{
    hardhat:{
      chainId:31337, 
      forking:{
        url:process.env.MAINNET_INFURA_URL
      }
    }, 
    localhost: {
      url: "http://127.0.0.1:8545", // Localhost network (automatically forks mainnet)
    },
  }
};
