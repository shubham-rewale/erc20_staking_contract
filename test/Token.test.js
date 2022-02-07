const Alt_token = artifacts.require("Alt_token");
const BN = web3.utils.BN;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;

contract("TEsting Token Contract", async (accounts) => {

    const [ initialHolder, receipient ] = accounts;
    
    beforeEach( async () => {
        this.tokenInstance = await Alt_token.new(process.env.INITIAL_SUPPLY);
	});

    it("Initially all tokens will be in deployers account", async () => {
        const instance = this.myToken;
		const totalSupply = await instance.totalSupply();
        const balanceOfDeployer = await instance.balanceOf(initialHolder);
        expect(totalSupply).to.equal(balanceOfDeployer);
    });

    it("Tokens can be sent from one account to the other", async () => {
        const noOfTokens = 1000;
        const instance = this.myToken;
        const balanceOfInitialHolder = await instance.balanceOf(initialHolder);
        await instance.transfer(receipient, noOfTokens);
        const updatedBalanceOfInitialHolder = await instance.balanceOf(initialHolder);
        expect(updatedBalanceOfInitialHolder).to.equal(balanceOfInitialHolder.sub( new BN(noOfTokens)));
        const updatedBalanceOfReceipient = await instance.balanceOf(receipient);
        expect(updatedBalanceOfReceipient).to.equal(new BN(noOfTokens));
    });

    it("Can't send more tokens than an account has", async () => {
        const instance = this.myToken;
        const balanceOfAccount = await instance.balanceOf(initialHolder);
		expect(instance.transfer(receipient, balanceOfAccount.add(new BN(1)))).to.eventually.be.rejected;
    });

    it("Tokens can be stake", async () => {
        const instance = this.myToken;
        const balanceOfInitialHolder = await instance.balanceOf(initialHolder);
        await instance.stakeTokens(1000, "3_months");
        expect(balanceOfInitialHolder).to.equal(balanceOfInitialHolder.sub(new BN(1000)));
        expect(await instance.stakeList[1].status).to.equal(true);
    });

    it("Can't stake more tokens than an account has", async () => {
        const instance = this.myToken;
        const balanceOfInitialHolder = await instance.balanceOf(initialHolder);
        expect(instance.stakeTokens(balanceOfInitialHolder.add(new BN(1)), "3_months")).to.eventually.be.rejected;
    });

    it("Can't remove stakes before predefined period", async () => {
        const instance = this.myToken;
        await instance.stakeTokens(1000, "3_months");
        expect(instance.removeStake(1)).to.eventually.be.rejected;
    });

    //it("Stake can be removed", async () => {
        //const instance = this.myToken;
        //await instance.stakeTokens(1000, "3_months");
        //expect(instance.removeStake(1)).to.eventually.be.fulfilled;
        //await instance.removeStake(1);
        //expect(await instance.stakeList[1].status).to.equal(false);
    //});

    //it("Rewards can be claimed", async () => {
        //const instance = this.myToken;
        //await instance.stakeTokens(1000, "3_months");
        //await instance.removeStake(1);
        //expect(instance.claimReward()).to.eventually.be.fulfilled;
    //});
});