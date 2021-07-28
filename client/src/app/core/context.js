import React, {
  createContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";

import { ethers } from "ethers";
import reducer from "./reducer";
import * as ContractService from "./service";
import * as ACTIONS from "./actions";
const initialState = {
  signer: null,
  provider: null,
  signerContract: null,
  providerContract: null,
  metaMaskEnabled: false,
};

export const AppContext = createContext(initialState);

export const AppContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const getContractByProvider = useCallback(
    //callback function that retrieves provider contract and puts it on our context
    async (args = null) => {
      const provider = args;
      if (!provider) return;
      const contract = await ContractService.getContractByProvider(provider);
      console.log({ providerContract: contract });
      dispatch({ type: ACTIONS.GET_CONTRACT_BY_PROVIDER, data: contract });
      return contract;
    },
    [dispatch]
  );

  const getContractChainId = useCallback(async (args = null) => {
    const contract = args;
    if (!contract) return;
    console.log({ contract });
    const chainId = await contract.chainId();
    console.log({ chainId });
  }, []);

  const getContractBySigner = useCallback(
    //callback function that retrieves signer contract and puts it on our context
    async (args = null) => {
      const signer = args;
      if (!signer) return;
      const contract = await ContractService.getContractBySigner(signer);
      console.log({ signerContract: contract });

      dispatch({ type: ACTIONS.GET_CONTRACT_BY_SIGNER, data: contract });
      return contract;
    },
    [dispatch]
  );

  const loadMetamask = useCallback(async () => {
    //initializing function for our context

    try {
      let provider;
      provider = new ethers.providers.Web3Provider(window.ethereum);
      dispatch({ type: ACTIONS.SET_PROVIDER, data: provider });

      const providerContract = await getContractByProvider(provider);
      await getContractChainId(providerContract);
      const signer = provider.getSigner();
      dispatch({ type: ACTIONS.SET_SIGNER, data: signer });
      await getContractBySigner(signer);
      dispatch({ type: ACTIONS.SET_METAMASK_ENABLED, data: true });
    } catch (err) {}
  }, [
    dispatch,
    getContractBySigner,
    getContractByProvider,
    getContractChainId,
  ]);

  useEffect(() => {
    if (!window.ethereum) {
      return;
    } else {
      // Request account access if needed
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then(() => loadMetamask())
        .catch((err) => {
          if (err.code === 4001) {
            console.log("Please connect to MetaMask.");
          } else {
            console.error(err);
          }
        });

      //listener for changing network

      window.ethereum.on("chainChanged", () => loadMetamask());

      //listener for changing account

      window.ethereum.on("accountsChanged", () => loadMetamask());
    }
  }, [loadMetamask]);

  return (
    <AppContext.Provider
      value={{
        signer: state.signer,
        provider: state.provider,
        signerContract: state.signerContract,
        providerContract: state.providerContract,
        metaMaskEnabled: state.metaMaskEnabled,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
