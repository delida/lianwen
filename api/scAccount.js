
var config = require('./lwconfig');
var BigNumber = require('bignumber.js');
var fs = require('fs');
var Chain3 = require('chain3');
var inspect = require('util').inspect;

//var log4js = require('log4js');
//log4js.configure('./log4js.json');
//var log = log4js.getLogger('normal');

const ABI = [{
	"constant": true,
	"inputs": [],
	"name": "name",
	"outputs": [{
		"name": "",
		"type": "string"
	}],
	"payable": false,
	"type": "function"
}, {
	"constant": true,
	"inputs": [],
	"name": "totalSupply",
	"outputs": [{
		"name": "",
		"type": "uint256"
	}],
	"payable": false,
	"type": "function"
}, {
	"constant": true,
	"inputs": [],
	"name": "decimals",
	"outputs": [{
		"name": "",
		"type": "uint8"
	}],
	"payable": false,
	"type": "function"
}, {
	"constant": true,
	"inputs": [{
		"name": "",
		"type": "address"
	}],
	"name": "balanceOf",
	"outputs": [{
		"name": "",
		"type": "uint256"
	}],
	"payable": false,
	"type": "function"
}, {
	"constant": true,
	"inputs": [{
		"name": "",
		"type": "uint256"
	}],
	"name": "ownerOf",
	"outputs": [{
		"name": "",
		"type": "address"
	}],
	"payable": false,
	"type": "function"
}, {
	"constant": true,
	"inputs": [],
	"name": "symbol",
	"outputs": [{
		"name": "",
		"type": "string"
	}],
	"payable": false,
	"type": "function"
}];


// var chain3 = new Chain3(new Chain3.providers.HttpProvider("http://192.168.58.130:8545"));
var chain3 = new Chain3(new Chain3.providers.HttpProvider(config.vnodeIp)); 
var mc = chain3.mc;
const ContractStruct = mc.contract(ABI);
var userAddr = config.userAddr;
var subChainAddr = config.subChainAddr;
var marketableTokenAddr = config.marketableTokenAddr;
var cache = [
  '',
  ' ',
  '  ',
  '   ',
  '    ',
  '     ',
  '      ',
  '       ',
  '        ',
  '         '
];

var obj = {
	// moac兑换token
	testbuyMintToken: function (sender, passwd, pay)
	{
		//chain3.personal.unlockAccount(sender, passwd, 0);
		var data=subchainbase.buyMintToken.getData();
		sendtx(sender, subchainbase.address, pay, data);
	},

	// token兑换moac
	testsellMintToken: function (sender, passwd, amount)
	{
		//chain3.personal.unlockAccount(sender, passwd, 0);
		var data=subchainbase.sellMintToken.getData(amount);
		sendtx(sender, subchainbase.address, '0', data);
	},
	
	// 充值进子链
	testrequestEnterMicrochain: function (sender, passwd, amount)
	{
		//chain3.personal.unlockAccount(sender, passwd, 0);
		var data=subchainbase.requestEnterMicrochain.getData(amount);
		sendtx(sender, subchainbase.address, '0', data);
	},
	
	// 提币
	testsellMintToken: function (sender, passwd, amount)
	{
		//chain3.personal.unlockAccount(sender, passwd, 0);
		var data=subchainbase.sellMintToken.getData(amount);
		sendtx(sender, subchainbase.address, '0', data);
	}
}

function leftPad (str, len, ch) {
	// convert `str` to `string`
	str = str + '';
	// `len` is the `pad`'s length now
	len = len - str.length;
	// doesn't need to pad
	if (len <= 0) return str;
	// `ch` defaults to `' '`
	if (!ch && ch !== 0) ch = ' ';
	// convert `ch` to `string`
	ch = ch + '';
	// cache common use cases
	if (ch === ' ' && len < 10) return cache[len] + str;
	// `pad` starts with an empty string
	var pad = '';
	// loop
	while (true) {
		// add `ch` to `pad` if `len` is odd
		if (len & 1) pad += ch;
		// divide `len` by 2, ditch the remainder
		len >>= 1;
		// "double" the `ch` so this operation count grows logarithmically on `len`
		// each time `ch` is "doubled", the `len` would need to be "doubled" too
		// similar to finding a value in binary search tree, hence O(log(n))
		if (len) ch += ch;
		// `len` is 0, exit the loop
		else break;
	}
	// pad `str`!
	return pad + str;
}

function sendtx(src, tgtaddr, amount, strData) {

	//var amt = leftPad(chain3.toHex(chain3.toWei(amount)).slice(2).toString(16),64,0);
	//var strData = '';
	var vias =["0xd344716b819fc0e8bb5935756e6ed8da6b3077b9"]
	chain3.mc.sendTransaction(
		{
			from: src,
			value:chain3.toSha(amount,'mc'),
			to: tgtaddr,
			gas: "9000000",
			gasPrice: "20000000000",
			//shardingflag: 1,
			//nonce:23,
			data: strData,
			//via: vias
		});
		
	//console.log('sending from:' + 	src + ' to:' + tgtaddr  + ' with data:' + strData);

}

function testsetData(sender, passwd, id, reportfile, s1, s2, s21, s22, s23)
{
	chain3.personal.unlockAccount(sender, passwd, 0);
	var data=healthcasereport.setData.getData(id, reportfile, s1, s2, s21, s22, s23);
	sendtx(sender, healthcasereport.address, 0, data);
}

var subchainprotocolbaseaddr = "0x27645f4db7efa229fae369d7cf394f74feb0b43f"
var subchainprotocolbaseAbi= "[{\"constant\":true,\"inputs\":[{\"name\":\"addr\",\"type\":\"address\"}],\"name\":\"approvalAddresses\",\"outputs\":[{\"name\":\"\",\"type\":\"address[]\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"scs\",\"type\":\"address\"},{\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"releaseFromSubchain\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[],\"name\":\"setSubchainActiveBlock\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[],\"name\":\"withdrawRequest\",\"outputs\":[{\"name\":\"success\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[],\"name\":\"withdraw\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"addr\",\"type\":\"address\"}],\"name\":\"approvalAmounts\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256[]\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"scs\",\"type\":\"address\"}],\"name\":\"register\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":true,\"stateMutability\":\"payable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"scs\",\"type\":\"address\"},{\"name\":\"amount\",\"type\":\"uint256\"},{\"name\":\"v\",\"type\":\"uint8\"},{\"name\":\"r\",\"type\":\"bytes32\"},{\"name\":\"s\",\"type\":\"bytes32\"}],\"name\":\"approveBond\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"scs\",\"type\":\"address\"},{\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"forfeitBond\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":true,\"stateMutability\":\"payable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"\",\"type\":\"address\"}],\"name\":\"subChainLastActiveBlock\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"scsCount\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"\",\"type\":\"address\"}],\"name\":\"scsApprovalList\",\"outputs\":[{\"name\":\"bondApproved\",\"type\":\"uint256\"},{\"name\":\"bondedCount\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"PEDNING_BLOCK_DELAY\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"scs\",\"type\":\"address\"},{\"name\":\"subchain\",\"type\":\"address\"}],\"name\":\"releaseRequest\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"blk\",\"type\":\"uint256\"}],\"name\":\"setSubchainExpireBlock\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"\",\"type\":\"address\"}],\"name\":\"subChainExpireBlock\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"\",\"type\":\"address\"}],\"name\":\"scsList\",\"outputs\":[{\"name\":\"from\",\"type\":\"address\"},{\"name\":\"bond\",\"type\":\"uint256\"},{\"name\":\"state\",\"type\":\"uint256\"},{\"name\":\"registerBlock\",\"type\":\"uint256\"},{\"name\":\"withdrawBlock\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"bondMin\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"_addr\",\"type\":\"address\"}],\"name\":\"isPerforming\",\"outputs\":[{\"name\":\"res\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"thousandth\",\"type\":\"uint256\"},{\"name\":\"minnum\",\"type\":\"uint256\"}],\"name\":\"getSelectionTarget\",\"outputs\":[{\"name\":\"target\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"targetnum\",\"type\":\"uint256\"}],\"name\":\"getSelectionTargetByCount\",\"outputs\":[{\"name\":\"target\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"subChainProtocol\",\"outputs\":[{\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"WITHDRAW_BLOCK_DELAY\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"name\":\"protocol\",\"type\":\"string\"},{\"name\":\"bmin\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"payable\":true,\"stateMutability\":\"payable\",\"type\":\"fallback\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"name\":\"scs\",\"type\":\"address\"}],\"name\":\"Registered\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"name\":\"sender\",\"type\":\"address\"}],\"name\":\"UnRegistered\",\"type\":\"event\"}]"
var subchainprotocolbaseContract=chain3.mc.contract(JSON.parse(subchainprotocolbaseAbi));
var subchainprotocolbase=subchainprotocolbaseContract.at(subchainprotocolbaseaddr);
var scsaddr1 = "0x66e38630d293a4ad0a3b59aa479afd0950faf184"
var scsaddr2 = "0xf7af0e54deefb352c15a70aba85c01b531956cf2"

function testregister(sender, passwd, addr, pay)
{
	chain3.personal.unlockAccount(sender, passwd, 0);
	var data=subchainprotocolbase.register.getData(addr);
	sendtx(sender, subchainprotocolbaseaddr, pay, data);
}

function testregisterall()
{
	testregister(mc.accounts[0], '', scsaddr1, 30);
	testregister(mc.accounts[0], '', scsaddr2, 30);
}


var marketabletokenaddr = marketableTokenAddr;
var marketabletokenAbi= "[{\"constant\":true,\"inputs\":[{\"name\":\"useraddr\",\"type\":\"address\"},{\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"sellMintTokenPre\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_spender\",\"type\":\"address\"},{\"name\":\"_value\",\"type\":\"uint256\"}],\"name\":\"approve\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"useraddr\",\"type\":\"address\"},{\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"sellMintToken\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"totalSupply\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_from\",\"type\":\"address\"},{\"name\":\"_to\",\"type\":\"address\"},{\"name\":\"_value\",\"type\":\"uint256\"}],\"name\":\"transferFrom\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_spender\",\"type\":\"address\"},{\"name\":\"_subtractedValue\",\"type\":\"uint256\"}],\"name\":\"decreaseApproval\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"_owner\",\"type\":\"address\"}],\"name\":\"balanceOf\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"newowner\",\"type\":\"address\"}],\"name\":\"updateOwner\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"owner\",\"outputs\":[{\"name\":\"\",\"type\":\"address\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"addr\",\"type\":\"address[]\"},{\"name\":\"bals\",\"type\":\"uint256[]\"}],\"name\":\"redeemFromMicroChain\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"useraddr\",\"type\":\"address\"},{\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"buyMintToken\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_to\",\"type\":\"address\"},{\"name\":\"_value\",\"type\":\"uint256\"}],\"name\":\"transfer\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"useraddr\",\"type\":\"address\"},{\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"requestEnterMicrochain\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"priceOneGInMOAC\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_spender\",\"type\":\"address\"},{\"name\":\"_addedValue\",\"type\":\"uint256\"}],\"name\":\"increaseApproval\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"_owner\",\"type\":\"address\"},{\"name\":\"_spender\",\"type\":\"address\"}],\"name\":\"allowance\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"name\":\"tokensupply\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"from\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"to\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"Transfer\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"owner\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"spender\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"Approval\",\"type\":\"event\"}]"
var marketabletokenContract=chain3.mc.contract(JSON.parse(marketabletokenAbi));
var marketabletoken=marketabletokenContract.at(marketabletokenaddr);

function testupdateOwner(sender, passwd)
{
	chain3.personal.unlockAccount(sender, passwd, 0);
	var data=marketabletoken.updateOwner.getData(subchainbase.address);
	sendtx(sender, marketabletoken.address, '0', data);
}


var subchainbaseaddr = subChainAddr;
var subchainbaseAbi= "[{\"constant\":true,\"inputs\":[],\"name\":\"maxMember\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"index\",\"type\":\"uint256\"}],\"name\":\"requestRelease\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"blockReward\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"index\",\"type\":\"uint256\"}],\"name\":\"removeSyncNode\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"sellMintToken\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"addr\",\"type\":\"address\"}],\"name\":\"setToken\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"BALANCE\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"name\":\"nodeList\",\"outputs\":[{\"name\":\"\",\"type\":\"address\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"nodeToReleaseCount\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"\",\"type\":\"address\"}],\"name\":\"scsBeneficiary\",\"outputs\":[{\"name\":\"\",\"type\":\"address\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"minMember\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"funcCode\",\"outputs\":[{\"name\":\"\",\"type\":\"bytes\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"consensusFlag\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"index\",\"type\":\"uint256\"}],\"name\":\"BackupUpToDate\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"\",\"type\":\"bytes32\"}],\"name\":\"proposals\",\"outputs\":[{\"name\":\"proposedBy\",\"type\":\"address\"},{\"name\":\"lastApproved\",\"type\":\"bytes32\"},{\"name\":\"hash\",\"type\":\"bytes32\"},{\"name\":\"start\",\"type\":\"uint256\"},{\"name\":\"end\",\"type\":\"uint256\"},{\"name\":\"flag\",\"type\":\"uint256\"},{\"name\":\"startingBlock\",\"type\":\"uint256\"},{\"name\":\"votecount\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"name\":\"nodesToDispel\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[],\"name\":\"setOwner\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[],\"name\":\"close\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"txReward\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"monitor\",\"type\":\"address\"}],\"name\":\"registerAsMonitor\",\"outputs\":[],\"payable\":true,\"stateMutability\":\"payable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"scs\",\"type\":\"address\"}],\"name\":\"getSCSRole\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"\",\"type\":\"address\"}],\"name\":\"nodesWatching\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[],\"name\":\"registerOpen\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[],\"name\":\"rebuildFromLastFlushPoint\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[],\"name\":\"registerClose\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"\",\"type\":\"address\"}],\"name\":\"currentRefundGas\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[],\"name\":\"buyMintToken\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":true,\"stateMutability\":\"payable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"nodeCount\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"id\",\"type\":\"address\"},{\"name\":\"link\",\"type\":\"string\"}],\"name\":\"addSyncNode\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"AUTO_RETIRE\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"penaltyBond\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"indexInlist\",\"type\":\"uint256\"},{\"name\":\"hashlist\",\"type\":\"bytes32[]\"},{\"name\":\"blocknum\",\"type\":\"uint256[]\"},{\"name\":\"distAmount\",\"type\":\"uint256[]\"},{\"name\":\"badactors\",\"type\":\"uint256[]\"},{\"name\":\"viaNodeAddress\",\"type\":\"address[]\"},{\"name\":\"viaNodeAmount\",\"type\":\"uint256[]\"},{\"name\":\"ercAddress\",\"type\":\"address[]\"},{\"name\":\"ercAmount\",\"type\":\"uint256[]\"}],\"name\":\"createProposal\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"protocol\",\"outputs\":[{\"name\":\"\",\"type\":\"address\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"MONITOR_JOIN_FEE\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"beneficiary\",\"type\":\"address\"},{\"name\":\"v\",\"type\":\"uint8\"},{\"name\":\"r\",\"type\":\"bytes32\"},{\"name\":\"s\",\"type\":\"bytes32\"}],\"name\":\"registerAsSCS\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"beneficiary\",\"type\":\"address\"},{\"name\":\"v\",\"type\":\"uint8\"},{\"name\":\"r\",\"type\":\"bytes32\"},{\"name\":\"s\",\"type\":\"bytes32\"}],\"name\":\"registerAsBackup\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"tokenAddress\",\"outputs\":[{\"name\":\"\",\"type\":\"address\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[],\"name\":\"addFund\",\"outputs\":[],\"payable\":true,\"stateMutability\":\"payable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"name\":\"nodesToJoin\",\"outputs\":[{\"name\":\"\",\"type\":\"address\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"\",\"type\":\"address\"}],\"name\":\"nodePerformance\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"viaReward\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"addr\",\"type\":\"address\"},{\"name\":\"index1\",\"type\":\"uint8\"},{\"name\":\"index2\",\"type\":\"uint8\"}],\"name\":\"matchSelTarget\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"nodeToAdd\",\"type\":\"uint256\"}],\"name\":\"registerAdd\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"indexInlist\",\"type\":\"uint256\"},{\"name\":\"hash\",\"type\":\"bytes32\"}],\"name\":\"voteOnProposal\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"name\":\"syncNodes\",\"outputs\":[{\"name\":\"nodeId\",\"type\":\"address\"},{\"name\":\"link\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"index\",\"type\":\"uint256\"}],\"name\":\"getEstFlushBlock\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"syncReward\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"hash\",\"type\":\"bytes32\"}],\"name\":\"checkProposalStatus\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"proposalHashInProgress\",\"outputs\":[{\"name\":\"\",\"type\":\"bytes32\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"name\":\"nodesToRelease\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"name\":\"randIndex\",\"outputs\":[{\"name\":\"\",\"type\":\"uint8\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"indexInlist\",\"type\":\"uint256\"},{\"name\":\"hash\",\"type\":\"bytes32\"}],\"name\":\"requestProposalAction\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":true,\"stateMutability\":\"payable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"addr\",\"type\":\"address\"}],\"name\":\"isMemberValid\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"joinCntNow\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"AUTO_RETIRE_COUNT\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"holdingminblk\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"selTarget\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"proposalHashApprovedLast\",\"outputs\":[{\"name\":\"\",\"type\":\"bytes32\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"NODE_INIT_PERFORMANCE\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"VnodeProtocolBaseAddr\",\"outputs\":[{\"name\":\"\",\"type\":\"address\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"MAX_GAS_PRICE\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"joinCntMax\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"proposalExpiration\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"DEFLATOR_VALUE\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"MONITOR_MIN_FEE\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"recv\",\"type\":\"address\"},{\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"withdraw\",\"outputs\":[],\"payable\":true,\"stateMutability\":\"payable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"requestEnterMicrochain\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"flushInRound\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"MAX_USERADDR_TO_SUBCHAIN\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"name\":\"proto\",\"type\":\"address\"},{\"name\":\"vnodeProtocolBaseAddr\",\"type\":\"address\"},{\"name\":\"min\",\"type\":\"uint256\"},{\"name\":\"max\",\"type\":\"uint256\"},{\"name\":\"thousandth\",\"type\":\"uint256\"},{\"name\":\"flushRound\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"payable\":true,\"stateMutability\":\"payable\",\"type\":\"fallback\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"name\":\"message\",\"type\":\"string\"}],\"name\":\"ReportStatus\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"name\":\"addr\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"TransferAmount\",\"type\":\"event\"}]"
var subchainbaseContract=chain3.mc.contract(JSON.parse(subchainbaseAbi));
var subchainbase=subchainbaseContract.at(subchainbaseaddr);

function testrequestRelease(sender, passwd, index)
{
	chain3.personal.unlockAccount(sender,'moacscsofflineaccountpwd',0);
	var data=subchainbase.requestRelease.getData(index);
	sendtx(sender, subchainbase.address, '0', data );
}

function testaddFund(sender, passwd, pay)
{
	chain3.personal.unlockAccount(sender, passwd, 0);
	var data=subchainbase.addFund.getData();
	sendtx(sender, subchainbase.address, pay, data);
}

function testsetToken(sender, passwd)
{
	chain3.personal.unlockAccount(sender, passwd, 0);
	var data=subchainbase.setToken.getData(marketabletoken.address);
	sendtx(sender, subchainbase.address, '0', data);
}

function testinitToken(sender, passwd, addrs, bals, locks)
{
	chain3.personal.unlockAccount(sender, passwd, 0);
	var data=subchainbase.initToken.getData(addrs, bals, locks);
	sendtx(sender, subchainbase.address, '0', data);
}

// moac兑换token
function testbuyMintToken(sender, passwd, pay)
{
	//chain3.personal.unlockAccount(sender, passwd, 0);
	var data=subchainbase.buyMintToken.getData();
	sendtx(sender, subchainbase.address, pay, data);
}

//testbuyMintToken(userAddr, "moac", 90);
console.log(chain3.fromSha(marketabletoken.balanceOf(userAddr).toString(), 'mc'));

// token兑换moac
function testsellMintToken(sender, passwd, amount)
{
	//chain3.personal.unlockAccount(sender, passwd, 0);
	var data=subchainbase.sellMintToken.getData(amount);
	sendtx(sender, subchainbase.address, '0', data);
}
//testsellMintToken(userAddr, "moac", 30);

function testrefresh(sender, passwd)
{
	chain3.personal.unlockAccount(sender, passwd, 0);
	var data=subchainbase.refresh.getData();
	sendtx(sender, subchainbase.address, '0', data);
}

// 充值进子链
function testrequestEnterMicrochain(sender, passwd, amount)
{
	//chain3.personal.unlockAccount(sender, passwd, 0);
	var data=subchainbase.requestEnterMicrochain.getData(amount);
	sendtx(sender, subchainbase.address, '0', data);
}
//testrequestEnterMicrochain(userAddr, "moac", 500000000000000000000)

function testregisterOpen(sender, passwd)
{
	chain3.personal.unlockAccount(sender, passwd, 0);
	var data=subchainbase.registerOpen.getData();
	sendtx(sender, subchainbase.address, '0', data);
}

function testregisterClose(sender, passwd)
{
	chain3.personal.unlockAccount(sender, passwd, 0);
	var data=subchainbase.registerClose.getData();
	sendtx(sender, subchainbase.address, '0', data);
}

function testregisterAsMonitor(sender, passwd, addr, pay)
{
	chain3.personal.unlockAccount(sender, passwd, 0);
	var data=subchainbase.registerAsMonitor.getData(addr);
	sendtx(sender, subchainbase.address, pay, data);
}

function testregisterAdd(sender, passwd, nodeToAdd)
{
	chain3.personal.unlockAccount(sender, passwd, 0);
	var data=subchainbase.registerAdd.getData(nodeToAdd);
	sendtx(sender, subchainbase.address, '0', data);
}

function testwithdraw(sender, passwd, addr, amount, pay)
{
	chain3.personal.unlockAccount(sender, passwd, 0);
	var data=subchainbase.withdraw.getData(addr, amount);
	sendtx(sender, subchainbase.address, pay, data);
}

function testclose(sender, passwd)
{
	chain3.personal.unlockAccount(sender, passwd, 0);
	var data=subchainbase.close.getData();
	sendtx(sender, subchainbase.address, '0', data);
}


function deploycode()
{
	//var vias = new Array 
	var vias ="0x71bef1a57901d4c73de7683edb830f0b9914311a"
	//vias[0] = '0x71bef1a57901d4c73de7683edb830f0b9914311a';
	chain3.personal.unlockAccount(sender, passwd, 0);
	chain3.mc.sendTransaction(
		{
			from: sender,
			value:chain3.toSha(21000000000,'mc'),
			to: subchainbase.address,
			gas: "0",
			gasPrice: "0",
			shardingFlag: "0x1",
			nonce: 0,
			data: '0x606060405260048054600160a060020a03191633600160a060020a03161790556108a48061002e6000396000f30060606040526004361061006c5763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166310ba0499811461007157806331a06771146100df5780635b1222b4146101305780636f0fe78b1461016257806389739c5b146101f6575b600080fd5b341561007c57600080fd5b6100cb600460248135818101908301358060208181020160405190810160405280939291908181526020018383602002808284375094965050509235600160a060020a031692506101fe915050565b604051901515815260200160405180910390f35b34156100ea57600080fd5b61012e600460248135818101908301358060208181020160405190810160405280939291908181526020018383602002808284375094965061025795505050505050565b005b341561013b57600080fd5b61014660043561043e565b604051600160a060020a03909116815260200160405180910390f35b341561016d57600080fd5b61012e600480359060446024803590810190830135806020818102016040519081016040528093929190818152602001838360200280828437820191505050505050919080359060200190820180359060200190808060200260200160405190810160405280939291908181526020018383602002808284375094965061046695505050505050565b61012e610709565b6000805b835181101561024b5782600160a060020a031684828151811061022157fe5b90602001906020020151600160a060020a031614156102435760019150610250565b600101610202565b600091505b5092915050565b6004546000908190819033600160a060020a039081169116141561028a57600184805161028892916020019061078d565b505b8360405180828051906020019060200280838360005b838110156102b85780820151838201526020016102a0565b5050505090500191505060405180910390209250600160405180828054801561030a57602002820191906000526020600020905b8154600160a060020a031681526001909101906020018083116102ec575b505091505060405190819003902091508282141561032757610438565b6103a460036000856000191660001916815260200190815260200160002080548060200260200160405190810160405280929190818152602001828054801561039957602002820191906000526020600020905b8154600160a060020a0316815260019091019060200180831161037b575b5050505050336101fe565b90508015156104385760008381526003602052604090208054600181016103cb8382610801565b506000918252602090912001805473ffffffffffffffffffffffffffffffffffffffff191633600160a060020a03161790556002845181151561040a57fe5b60008581526003602052604090205491900490111561043857600184805161043692916020019061078d565b505b50505050565b600180548290811061044c57fe5b600091825260209091200154600160a060020a0316905081565b6000806104cb600180548060200260200160405190810160405280929190818152602001828054801561039957602002820191906000526020600020908154600160a060020a0316815260019091019060200180831161037b575050505050336101fe565b15156104d657600080fd5b82518451146104e457600080fd5b84848460405183815260208101838051906020019060200280838360005b8381101561051a578082015183820152602001610502565b50505050905001828051906020019060200280838360005b8381101561054a578082015183820152602001610532565b5050505090500193505050506040519081900390206000818152600260208190526040909120015490925060ff161561058257610436565b61060060026000846000191660001916815260200190815260200160002060010180548060200260200160405190810160405280929190818152602001828054801561039957602002820191906000526020600020908154600160a060020a0316815260019091019060200180831161037b575050505050336101fe565b151561043657600082815260026020526040902060019081018054909181016106298382610801565b506000918252602090912001805473ffffffffffffffffffffffffffffffffffffffff191633600160a060020a031617905560015460029060008481526002602052604090206001015491900490111561043657506000818152600260208190526040822001805460ff191660011790555b8351811015610436578381815181106106b057fe5b90602001906020020151600160a060020a03166108fc8483815181106106d257fe5b906020019060200201519081150290604051600060405180830381858888f19350505050151561070157600080fd5b60010161069b565b4360009081526020819052604090208054600181016107288382610801565b506000918252602080832091909101805473ffffffffffffffffffffffffffffffffffffffff191633600160a060020a031617905543825281905260409020600190810180549091810161077c8382610801565b506000918252602090912034910155565b8280548282559060005260206000209081019282156107f1579160200282015b828111156107f1578251825473ffffffffffffffffffffffffffffffffffffffff1916600160a060020a0391909116178255602092909201916001909101906107ad565b506107fd92915061082a565b5090565b8154818355818115116108255760008381526020902061082591810190830161085e565b505050565b61085b91905b808211156107fd57805473ffffffffffffffffffffffffffffffffffffffff19168155600101610830565b90565b61085b91905b808211156107fd57600081556001016108645600a165627a7a72305820db80e474c2980d6931d98d0451fe39a553e76c994263a1d7c2ff6474117caffe0029',
			via: vias
		});
		
	//console.log('sending from:' + 	src + ' to:' + tgtaddr  + ' with data:' + strData);
}

function deploydappcode()
{
	var vias =["0xd344716b819fc0e8bb5935756e6ed8da6b3077b9", "0xd344716b819fc0e8bb5935756e6ed8da6b3077b9"]
	chain3.personal.unlockAccount(sender, passwd, 0);
	chain3.mc.sendTransaction(
		{
			from: sender,
			value:"0",
			to: subchainbase.address,
			gas: "0",
			gasPrice: "0",
			shardingflag: 1,
			nonce: 2,
			data: "0x6060604052341561000f57600080fd5b60018054600160a060020a03191633600160a060020a03161790556101c7806100396000396000f30060606040526004361061004b5763ffffffff7c0100000000000000000000000000000000000000000000000000000000600035041663c7b4aacd8114610050578063f3fef3a31461005a575b600080fd5b61005861007e565b005b61005873ffffffffffffffffffffffffffffffffffffffff6004351660243561010f565b43600090815260208190526040902080546001810161009d8382610151565b506000918252602080832091909101805473ffffffffffffffffffffffffffffffffffffffff19163373ffffffffffffffffffffffffffffffffffffffff161790554382528190526040902060019081018054909181016100fe8382610151565b506000918252602090912034910155565b73ffffffffffffffffffffffffffffffffffffffff821681156108fc0282604051600060405180830381858888f19350505050151561014d57600080fd5b5050565b8154818355818115116101755760008381526020902061017591810190830161017a565b505050565b61019891905b808211156101945760008155600101610180565b5090565b905600a165627a7a72305820812b3381e0ad46a12b7302ad8d8a06782998e8bffd8c6eeb11b170739a5b89760029",
			via: vias
		});
}

function subtransfer()
{
	chain3.personal.unlockAccount(sender, passwd, 0);
	chain3.mc.sendTransaction(
		{
			from: sender,
			value:"1000",
			to: subchainbase.address,
			gas: "0",
			gasPrice: "0",
			shardingflag: 2,
			nonce: 1,
			data: mc.accounts[1],
			via: '0x71bef1a57901d4c73de7683edb830f0b9914311a'
		});
		
	//console.log('sending from:' + 	src + ' to:' + tgtaddr  + ' with data:' + strData);
}

// 提币
function dappredeemFromMicroChain(sender, passwd)
{
	chain3.personal.unlockAccount(sender,passwd,0);
	chain3.mc.sendTransaction(
		{
			from: sender,
			value:"10000000000000000000",
			to: subchainbase.address,
			gas: "0",
			gasPrice: "0",
			shardingflag: 1,
			nonce: 0,
			data: '0x89739c5b',
			via: '0xd868337c1a4167b5c6d1e273a0044016ea044d82'
		});
		
	//console.log('sending from:' + 	src + ' to:' + tgtaddr  + ' with data:' + strData);
}


function testSet(num)
{
	chain3.personal.unlockAccount(sender, passwd, 0);
	chain3.mc.sendTransaction(
		{
			from: sender,
			value:chain3.toSha('0','mc'),
			to: subchainbase.address,
			gas: "0",
			gasPrice: "0",
			shardingflag: 1,
			nonce: num,
			data: '0x4f2be91f',
			via: '0x71bef1a57901d4c73de7683edb830f0b9914311a'
		});
		
	//console.log('sending from:' + 	src + ' to:' + tgtaddr  + ' with data:' + strData);
}

function testGet(num)
{
	chain3.personal.unlockAccount(sender, passwd, 0);
	chain3.mc.sendTransaction(
		{
			from: sender,
			value:chain3.toSha('0','mc'),
			//to: subchainbase.address,
			gas: "200000",
			gasPrice: chain3.mc.gasPrice,
			shardingflag: 1,
			nonce: num,
			data: '0x4e70b1dc'
		});
		
	//console.log('sending from:' + 	src + ' to:' + tgtaddr  + ' with data:' + strData);
}

function testIncrease(addr, passwd, cntaddr)
{
	chain3.personal.unlockAccount(addr,'',0);
	sendtx(addr, cntaddr, '0','0xe8927fbc' );
}

function testAddlist(addr, passwd, cntaddr)
{
	chain3.personal.unlockAccount(addr,'',0);
	sendtx(addr, cntaddr, '0','0x12f887e800fe9cdd8fef321b0ce25c275d9e75ac00fe9cdd8fef321b0ce25c275d9e75ac' );
}

function votegiveRightToVote(addr)
{
	chain3.personal.unlockAccount(sender, passwd, 0);
	sendtx(sender, '0x7dd3b95e75db31021d3835e60c85bf332a17caf7', '0','0x9e7b8d61000000000000000000000000'+addr  );
}

function voteVote(num)
{
	chain3.personal.unlockAccount(sender, passwd, 0);
	sendtx(sender, '0x7dd3b95e75db31021d3835e60c85bf332a17caf7', '0','0x0121b93f000000000000000000000000000000000000000000000000000000000000000'+num  );
}

function erctransfer()
{
	chain3.personal.unlockAccount(sender, passwd, 0);
	sendtx(sender, '0x39a5d2a7acb40dcb54f63e142a0a8153ca572cd9', '0','0xa9059cbb0000000000000000000000000b4ed9faeda112dcda539a492fd225c74a1d457600000000000000000000000000000000000000000000000000000000000186a0' );
}

function testprint() {
	contractAddress = '0xe3a844935a7bb8f4f6863b10afbf32d5f676a915'
	index = "0000000000000000000000000000000000000000000000000000000000000000"
	key = "00000000000000000000000x2135aa03033021e35f6fb8a0d55ebee971579a3f"
	newKey = chain3.sha3(key + index, {"encoding":"hex"})
	console.log(newKey)
	//console.log(chain3.mc.getStorageAt(contractAddress, newKey))
	//console.log('DEC: ' + chain3.toDecimal(chain3.mc.getStorageAt(contractAddress,newKey)))
	//console.log('ASCII: ' + chain3.toAscii(chain3.mc.getStorageAt(contractAddress,newKey)))
}

function sendmoacwithaddr(srcaddr, srcname, tgtaddr, amount)
{
    chain3.personal.unlockAccount(srcaddr, srcname, 0);
    sendtx(srcaddr, tgtaddr, amount ,'');
}

function testset()
{
	chain3.personal.unlockAccount(sender, passwd, 0);
	sendtx(sender, '0x', '0','0x606060409081526003805460a060020a60ff02191690558051908101604052600981527f5465737420436f696e00000000000000000000000000000000000000000000006020820152600490805161005b9291602001906100f6565b5060408051908101604052600481527f5445535400000000000000000000000000000000000000000000000000000000602082015260059080516100a39291602001906100f6565b5060068055655af3107a400060075534156100bd57600080fd5b60038054600160a060020a03191633600160a060020a031690811790915560075460008181559182526001602052604090912055610191565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061013757805160ff1916838001178555610164565b82800160010185558215610164579182015b82811115610164578251825591602001919060010190610149565b50610170929150610174565b5090565b61018e91905b80821115610170576000815560010161017a565b90565b610d38806101a06000396000f3006060604052600436106100fb5763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166306fdde038114610100578063095ea7b31461018a57806318160ddd146101c057806323b872dd146101e55780632e1a7d4d1461020d5780632ff2e9dc14610225578063313ce567146102385780633f4ba83a1461024b5780635c975abb1461025e578063661884631461027157806370a08231146102935780638456cb59146102b25780638da5cb5b146102c557806395d89b41146102f4578063a9059cbb14610307578063d73dd62314610329578063dd62ed3e1461034b578063f2fde38b14610370575b600080fd5b341561010b57600080fd5b61011361038f565b60405160208082528190810183818151815260200191508051906020019080838360005b8381101561014f578082015183820152602001610137565b50505050905090810190601f16801561017c5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b341561019557600080fd5b6101ac600160a060020a036004351660243561042d565b604051901515815260200160405180910390f35b34156101cb57600080fd5b6101d3610458565b60405190815260200160405180910390f35b34156101f057600080fd5b6101ac600160a060020a036004358116906024351660443561045e565b341561021857600080fd5b61022360043561048b565b005b341561023057600080fd5b6101d3610534565b341561024357600080fd5b6101d361053a565b341561025657600080fd5b610223610540565b341561026957600080fd5b6101ac6105bf565b341561027c57600080fd5b6101ac600160a060020a03600435166024356105cf565b341561029e57600080fd5b6101d3600160a060020a03600435166105f3565b34156102bd57600080fd5b61022361060e565b34156102d057600080fd5b6102d8610692565b604051600160a060020a03909116815260200160405180910390f35b34156102ff57600080fd5b6101136106a1565b341561031257600080fd5b6101ac600160a060020a036004351660243561070c565b341561033457600080fd5b6101ac600160a060020a0360043516602435610730565b341561035657600080fd5b6101d3600160a060020a0360043581169060243516610754565b341561037b57600080fd5b610223600160a060020a036004351661077f565b60048054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156104255780601f106103fa57610100808354040283529160200191610425565b820191906000526020600020905b81548152906001019060200180831161040857829003601f168201915b505050505081565b60035460009060a060020a900460ff161561044757600080fd5b610451838361081a565b9392505050565b60005481565b60035460009060a060020a900460ff161561047857600080fd5b610483848484610886565b949350505050565b600160a060020a033316600090815260016020526040902054819010156104b157600080fd5b4360009081526008602052604090208054600181016104d08382610cc2565b506000918252602080832091909101805473ffffffffffffffffffffffffffffffffffffffff191633600160a060020a0316179055438252600890526040902060019081018054909181016105258382610cc2565b50600091825260209091200155565b60075481565b60065481565b60035433600160a060020a0390811691161461055b57600080fd5b60035460a060020a900460ff16151561057357600080fd5b6003805474ff0000000000000000000000000000000000000000191690557f7805862f689e2f13df9f062ff482ad3ad112aca9e0847911ed832e158c525b3360405160405180910390a1565b60035460a060020a900460ff1681565b60035460009060a060020a900460ff16156105e957600080fd5b6104518383610a08565b600160a060020a031660009081526001602052604090205490565b60035433600160a060020a0390811691161461062957600080fd5b60035460a060020a900460ff161561064057600080fd5b6003805474ff0000000000000000000000000000000000000000191660a060020a1790557f6985a02210a168e66602d3235cb6db0e70f92b3ba4d376a33c0f3d9434bff62560405160405180910390a1565b600354600160a060020a031681565b60058054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156104255780601f106103fa57610100808354040283529160200191610425565b60035460009060a060020a900460ff161561072657600080fd5b6104518383610b02565b60035460009060a060020a900460ff161561074a57600080fd5b6104518383610bfd565b600160a060020a03918216600090815260026020908152604080832093909416825291909152205490565b60035433600160a060020a0390811691161461079a57600080fd5b600160a060020a03811615156107af57600080fd5b600354600160a060020a0380831691167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a36003805473ffffffffffffffffffffffffffffffffffffffff1916600160a060020a0392909216919091179055565b600160a060020a03338116600081815260026020908152604080832094871680845294909152808220859055909291907f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9259085905190815260200160405180910390a350600192915050565b6000600160a060020a038316151561089d57600080fd5b600160a060020a0384166000908152600160205260409020548211156108c257600080fd5b600160a060020a03808516600090815260026020908152604080832033909416835292905220548211156108f557600080fd5b600160a060020a03841660009081526001602052604090205461091e908363ffffffff610ca116565b600160a060020a038086166000908152600160205260408082209390935590851681522054610953908363ffffffff610cb316565b600160a060020a0380851660009081526001602090815260408083209490945587831682526002815283822033909316825291909152205461099b908363ffffffff610ca116565b600160a060020a03808616600081815260026020908152604080832033861684529091529081902093909355908516917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9085905190815260200160405180910390a35060019392505050565b600160a060020a03338116600090815260026020908152604080832093861683529290529081205480831115610a6557600160a060020a033381166000908152600260209081526040808320938816835292905290812055610a9c565b610a75818463ffffffff610ca116565b600160a060020a033381166000908152600260209081526040808320938916835292905220555b600160a060020a0333811660008181526002602090815260408083209489168084529490915290819020547f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925915190815260200160405180910390a35060019392505050565b6000600160a060020a0383161515610b1957600080fd5b600160a060020a033316600090815260016020526040902054821115610b3e57600080fd5b600160a060020a033316600090815260016020526040902054610b67908363ffffffff610ca116565b600160a060020a033381166000908152600160205260408082209390935590851681522054610b9c908363ffffffff610cb316565b600160a060020a0380851660008181526001602052604090819020939093559133909116907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9085905190815260200160405180910390a350600192915050565b600160a060020a033381166000908152600260209081526040808320938616835292905290812054610c35908363ffffffff610cb316565b600160a060020a0333811660008181526002602090815260408083209489168084529490915290819020849055919290917f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92591905190815260200160405180910390a350600192915050565b600082821115610cad57fe5b50900390565b60008282018381101561045157fe5b815481835581811511610ce657600083815260209020610ce6918101908301610ceb565b505050565b610d0991905b80821115610d055760008155600101610cf1565b5090565b905600a165627a7a72305820f09ac3615c92e9a25d1ef5467e30a6988e4cef6ed868a484806419c4eaee7d900029' );
}

function testvote()
{
	chain3.personal.unlockAccount(sender, passwd, 0);
	sendtx(sender, '0x01d1b4f0974a63d56c5bcca06afb402e908ac769', '0','0x632a9a52' );
}

function dechathave()
{
	chain3.personal.unlockAccount(sender, passwd, 0);
	sendtx(sender, '0xf30119ffd948ad7b495e8e1c4627867d4879bfa4', '0','0x10ba04990000000000000000000000000000000000000000000000000000000000000040000000000000000000000000b265235b9372f2d3e90cb94a9e8043a3a8b010010000000000000000000000000000000000000000000000000000000000000002000000000000000000000000b265235b9372f2d3e90cb94a9e8043a3a8b0100100000000000000000000000070a294f767ea86a2565453399bd7f8bb74205533' );
}

function dechatupdateNodeList()
{
	chain3.personal.unlockAccount(mc.accounts[1],'',0);
	sendtx(mc.accounts[1], '0xf30119ffd948ad7b495e8e1c4627867d4879bfa4', '0','0x31a0677100000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000b265235b9372f2d3e90cb94a9e8043a3a8b0100100000000000000000000000070a294f767ea86a2565453399bd7f8bb74205533' );
}

function testAdd()
{
	chain3.personal.unlockAccount(sender, passwd, 0);
	sendtx(sender, '0x5b81b38e63086b88354f633a76f99c353420598a', '0','0x4f2be91f' );
}




//blk	
//00000000000000000000000000000000000000000000000000000000000002ee
//_to
//000000000000000000000000c88918182ce7cca8942da3b1dbffb03516538c93	
//value
//0000000000000000000000000000000000000000000010000000000000000033	
//bonded
//0000000000000000000000000000000000000000000000000000000000000000	
//together
//0000000000000000000000000000000000000000000000000000000000000065000000000000000000000000c88918182ce7cca8942da3b1dbffb03516538c9300000000000000000000000000000000000000000000100000000000000000330000000000000000000000000000000000000000000000000000000000000000	
//0xc8d0d29a00000000000000000000000000000000000000000000000000000000000003ee000000000000000000000000c88918182ce7cca8942da3b1dbffb03516538c9300000000000000000000000000000000000000000000100000000000000000330000000000000000000000000000000000000000000000000000000000000000
//0xdef0412f00000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000000100001000000000000000000000000000000000000000000000000000000000000000a	
	
module.exports = obj;
	
	
	
	