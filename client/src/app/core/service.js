import { ethers } from "ethers";
import ContractAbi from "../../contract/abis/TestERC20.json";

const ContractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

export const getContractByProvider = async (provider) => {
  try {
    const { abi } = ContractAbi;
    console.log({ ContractAddress });
    const contract = new ethers.Contract(ContractAddress, abi, provider);
    console.log({ providerContract: contract });
    return contract;
  } catch (err) {
    throw err;
  }
};
export const getContractBySigner = async (signer) => {
  try {
    const { abi } = ContractAbi;
    const contract = new ethers.Contract(ContractAddress, abi, signer);
    console.log({ signerContract: contract });

    return contract;
  } catch (err) {
    throw err;
  }
};
