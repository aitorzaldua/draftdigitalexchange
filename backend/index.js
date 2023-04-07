const express = require("express");
const Moralis = require("moralis").default;
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = 3001;
const ABI = require("./abi.json");

app.use(cors());
app.use(express.json());

//Get all the info from the "get" functions:


//1.- The "read contract" tab from the network scan
app.get("/getNameAndBalance", async (req, res) => {

  //1.1.-Function getMyName:
  const { userAddress } = req.query;
  const response = await Moralis.EvmApi.utils.runContractFunction({
    chain: "0x13881", //Polygon chainId HEX
    address: "0xdecc660658BAd8FBCe2FBAF7F0d895C034FcfC12", //Contract address
    functionName: "getMyName",
    abi: ABI,
    params: { _user: userAddress },
  });

  const jsonResponseName = response.raw;

  //1.2.-Get balance for the msg.sender address. No function necessary.
  const secResponse = await Moralis.EvmApi.balance.getNativeBalance({
    chain: "0x13881",
    address: "0x43d674354dea5653011B31927e49DA6FceA212cc", //User address
  });

  const jsonResponseBal = (secResponse.raw.balance / 1e18).toFixed(2);

  //1.3.- Get the price of the token
  const thirResponse = await Moralis.EvmApi.token.getTokenPrice({
    //Matic token address is 0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0
    address: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
  });

  const jsonResponseDollars = (
    thirResponse.raw.usdPrice * jsonResponseBal
  ).toFixed(2);

  const jsonResponse = {
    name: jsonResponseName,
    balance: jsonResponseBal,
    dollars: jsonResponseDollars,
  };

  return res.status(200).json({ jsonResponse });
  
});

Moralis.start({
  apiKey: process.env.MORALIS_KEY,
}).then(() => {
  app.listen(port, () => {
    console.log(`Listening for API Calls`);
  });
});
