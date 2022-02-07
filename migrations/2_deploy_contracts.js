const _Alt_token = artifacts.require("Alt_token");
const _Token_Sale = artifacts.require("Token_Sale");

module.exports = async function(deployer) {
    await deployer.deploy(_Alt_token, process.env.INITIAL_SUPPLY);
    await deployer.deploy(_Token_Sale, _Alt_token.address);
    const tokenInstance = await _Alt_token.deployed();
    await tokenInstance.transfer(_Token_Sale.address, process.env.INITIAL_SUPPLY);
}