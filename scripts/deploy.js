async function main() {
  const [deployer] = await ethers.getSigners();
  let chainId = 97;
  console.log("Deploying contracts with the accounts: ", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const TestERC20 = await ethers.getContractFactory("TestERC20");
  const testERC20 = await TestERC20.deploy(1000000000000, chainId);
  console.log("testERC20 address", testERC20.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
