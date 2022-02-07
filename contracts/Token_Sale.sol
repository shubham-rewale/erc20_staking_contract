// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Token_Sale is Ownable{

    IERC20 private _token;
    uint private _etherRaised;

    event Bought(uint _amount, address _buyer);
    //event Sold(uint _amount, address _seller);

    constructor(IERC20 _instanceAddress) {
        require(address(_instanceAddress) != address(0), "Ttoken is the zero address");
        _token = _instanceAddress;
    }

    function token() public view returns (IERC20) {
        return _token;
    }

    function buy() public payable {
        uint amount = msg.value;
        uint256 exchangeBalance = _token.balanceOf(address(this));
        require(amount > 0, "You need to send some ether");
        require(amount <= exchangeBalance, "Not enough tokens in the reserve");
        _token.transfer(msg.sender, amount);
        _etherRaised += amount;
        emit Bought(amount, msg.sender);
    }

    receive() external payable {
        buy();
    }

    //function sell(uint amount) public {
        //require(amount > 0, "You need to sell at least some tokens");
        //uint256 allowance = token.allowance(msg.sender, address(this));
        //require(allowance >= amount, "Check the token allowance");
        //token.transferFrom(msg.sender, address(this), amount);
        //msg.sender.transfer(amount);
        //emit Sold(amount);
    //}

    function getBalance() public view onlyOwner returns(uint) {
        return address(this).balance;
    }

    function amountOfEtherRaied() public view onlyOwner returns(uint) {
        return _etherRaised;
    }

    function withdrawEther(uint _amount, address payable _receipient) public onlyOwner {
        require(address(this).balance >= _amount, "Not enough balance present");
        require(_receipient != address(0), "Receipient address is zero address");
        _receipient.transfer(_amount);
    }
}