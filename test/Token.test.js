const Alt_token = artifacts.require("Alt_token");
const BN = web3.utils.BN;
const chai = require("./setupchai.js");
const expect = chai.expect;
const dotenv = require("dotenv")
dotenv.config({path: "../config.env"});

contract("Testing Token Contract", async (accounts) => {

    const [ initialHolder, receipient, anotherAccount ] = accounts;
    
    beforeEach( async () => {
        this.tokenInstance = await Alt_token.new(process.env.INITIAL_SUPPLY, {from: initialHolder});
        
	});

    it("Initially all tokens will be in deployers account", async () => {
        const instance = this.tokenInstance;
		const balanceOfInitialHolder = await instance.balanceOf(initialHolder);
        expect(instance.totalSupply()).to.eventually.be.a.bignumber.equal(balanceOfInitialHolder);
    });

    it("Tokens can be sent from one account to the other", async () => {
        const noOfTokens = 1000;
        const instance = this.tokenInstance;
        const totalSupply = await instance.totalSupply();
        await expect(instance.transfer(receipient, noOfTokens, {from: initialHolder})).to.eventually.be.fulfilled;
        expect(instance.balanceOf(receipient)).to.eventually.be.a.bignumber.equal(new BN(noOfTokens));
        expect(instance.balanceOf(initialHolder)).to.eventually.be.a.bignumber.equal(totalSupply.sub(new BN(noOfTokens)))
    });

    it("Can't send more tokens than an account has", async () => {
        const instance = this.tokenInstance;
        await instance.transfer(receipient, 1000);
        expect(instance.transfer(anotherAccount, 1001, {from: receipient})).to.eventually.be.rejected;
        expect(instance.balanceOf(receipient)).to.eventually.be.a.bignumber.equal(new BN(1000));
    });

    it("Tokens can be stake", async () => {
        const instance = this.tokenInstance;
        const balanceOfInitialHolder = await instance.balanceOf(initialHolder);
        await expect(instance.stakeTokens(1000, "3_months", {from: initialHolder})).to.eventually.be.fulfilled;
        expect(instance.balanceOf(initialHolder)).to.eventually.be.a.bignumber.equal(balanceOfInitialHolder.sub(new BN(1000)));
    });

    it("Can't stake more tokens than an account has", async () => {
        const instance = this.tokenInstance;
        const balanceOfInitialHolder = await instance.balanceOf(initialHolder);
        expect(instance.stakeTokens(balanceOfInitialHolder.add(new BN(1)), "3_months")).to.eventually.be.rejected;
    });

    it("Can't remove stakes before predefined period", async () => {
        const instance = this.tokenInstance;
        await instance.stakeTokens(1000, "3_months");
        expect(instance.removeStake(1)).to.eventually.be.rejected;
    });

    //it("Stake can be removed", async () => {
        //const instance = this.tokenInstance;
        //await instance.stakeTokens(1000, "3_months");
        //expect(instance.removeStake(1)).to.eventually.be.fulfilled;
        //await instance.removeStake(1);
        //expect(await instance.stakeList[1].status).to.eql(false);
    //});

    //it("Rewards can be claimed", async () => {
        //const instance = this.tokenInstance;
        //await instance.stakeTokens(1000, "3_months");
        //await instance.removeStake(1);
        //expect(instance.claimReward()).to.eventually.be.fulfilled;
    //});
});