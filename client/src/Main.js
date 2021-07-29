import React, { useContext, useCallback, useEffect, useState } from "react";

import { AppContext } from "./app/core/context";

import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import FormHelperText from "@material-ui/core/FormHelperText";
import InputLabel from "@material-ui/core/InputLabel";
import Grid from "@material-ui/core/Grid";

import Button from "@material-ui/core/Button";
import { Typography } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    margin: 0,
    padding: "1.2rem",
    background: theme.background.body,
    minHeight: "100vh",
  },
  breakText: {
    background: theme.background.default,
    marginTop: "3rem",
    padding: "2rem",
    textAlign: "center",
  },
  formWrapper: {
    width: "100%",

    padding: "2rem",
    // height: "100vh",
  },
}));

function App() {
  const { metaMaskEnabled, getTokenBalance, signer, signerContract } =
    useContext(AppContext);

  const [tokens, setTokens] = useState(null);

  const classes = useStyles();

  const getMyTokenBalance = useCallback(async () => {
    if (!signer) return;
    if (!signerContract) return;

    let balance = await getTokenBalance(signerContract, signer);

    setTokens(balance);
  }, [signer, getTokenBalance, signerContract]);
  useEffect(getMyTokenBalance, [getMyTokenBalance, signer, signerContract]);

  return (
    <Box className={classes.root}>
      {metaMaskEnabled ? (
        <Box>
          <Grid
            container
            direction="column"
            className={classes.formWrapper}
            spacing={3}
          >
            <Typography variant="h4">Permit To:</Typography>

            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel htmlFor="my-input"> Wallet Address</InputLabel>
                <Input id="my-input" aria-describedby="my-helper-text" />
                <FormHelperText id="my-helper-text">
                  Enter the reciepient wallet address
                </FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel htmlFor="my-input"> Expires In (HRS)</InputLabel>
                <Input
                  id="my-input"
                  type="number"
                  aria-describedby="my-helper-text"
                />
                <FormHelperText id="my-helper-text">
                  Enter the signature expiry duration
                </FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <Button variant="contained" color="primary">
                {" "}
                Permit
              </Button>
            </Grid>
          </Grid>
          <Typography variant="body2"> My Token:</Typography>
          <Typography variant="subtitle1"> {tokens && tokens} TST</Typography>
        </Box>
      ) : (
        <div className="d-flex align-items-center justify-content-center">
          <h4>Connect to metamask first (Binance test network) ...</h4>
        </div>
      )}
    </Box>
  );
}

export default App;
