const Alt_token = artifacts.require("Alt_token");
const Token_Sale = artifacts.require("Token_Sale");
const BN = web3.utils.BN;
const expect = chai.expect;

contract("Testing Token Sale Contract", async (accounts) => {

    const [deployerAccount, recipient, anotherAccount] = accounts;

    it("Tokens can be purchased from token sale contract", async() => {
        const tokenInstance = await Alt_token.deployed();
        const tokenSaleInstance = await Token_Sale.deployed();
        let balanceBefore = await tokenInstance.balanceOf(deployerAccount);
        expect(tokenSaleInstance.send(web3.utils.toWei(1000, "wei"))).to.eventually.be.fulfilled
        balanceBefore = balanceBefore.add(new BN(1000));
        expect(tokenSaleInstance.balanceOf(deployerAccount)).to.equal(balanceBefore);
    });
});
