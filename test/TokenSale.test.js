const Token_Sale = artifacts.require("Token_Sale");
const Alt_token = artifacts.require("Alt_token");
const BN = web3.utils.BN;
const chai = require("./setupchai.js");
const expect = chai.expect;
const dotenv = require("dotenv")
dotenv.config({path: "../config.env"});

contract("Testing Token Sale Contract", async (accounts) => {

    const [deployerAccount, recipient, anotherAccount] = accounts;

    it("Tokens can be purchased from token sale contract", async() => {
        const tokenInstance = await Alt_token.deployed();
        const tokenSaleInstance = await Token_Sale.deployed();
        let balanceBefore = await tokenInstance.balanceOf(recipient);
        await expect(tokenSaleInstance.send(1000), {from: recipient}).to.eventually.be.fulfilled
        let balanceAfter = balanceBefore.add(new BN(1000));
        expect(tokenInstance.balanceOf(recipient)).to.eventually.be.a.bignumber.equal(balanceAfter);
    });
});