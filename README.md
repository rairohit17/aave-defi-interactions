## Depositing to aave
 1. connect to a weth contract and wrap your eth to erc20 standard

 2. connect to the lendingPool address provider contract to get the  address of proxy pool contract 

 3. connect to the pool contract and deposit weth tokens using supply (in v3 )

 4. can check your account status using getUserReserveData() 


 ## borrowing tokens 

 1. connect to aggregator contract of chainlink price feed

 2. get the total borrowable amount  and then find the total amount of respective token using chainlink price feed' s value  you want to borrow 

 3. then call borrow function from the lendingPool contract to borrow the desired token 

## deposit tokens 

deposit the token you borrowed along with it' s interest amount 

## Additional points 

1. keep in  mind if the  value of total collateral amount deposited decreases then the health factor decreases therefore to prevent getting liquidated supply more tokens 

2.  in Aave, if you deposit tokens but don’t borrow anything, your deposited tokens automatically increase in value over time
