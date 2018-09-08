var scAccount = require( './scAccount.js' );
var http = require("http");
var config = require('./lwconfig');
var BigNumber = require('bignumber.js');
var fs = require('fs');
var Chain3 = require('chain3');
var accounts = require( './accounts.js' );
var crypto = require('crypto')
var secp256k1 = require('secp256k1');
var keccak = require('keccak');

var inspect = require('util').inspect;

//var log4js = require('log4js');
//log4js.configure('./log4js.json');
//var log = log4js.getLogger('normal');
//const ABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"}];
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
//0x93fec350603678c00f56e4c3637b99a39828b9e6
//0x3931453b00606a63222882a1836784adc2dfd1d3
var pwd = config.pwd;
var userAddr = config.userAddr;
var subChainAddr = config.subChainAddr;
var chain3 = new Chain3(new Chain3.providers.HttpProvider(config.vnodeIp));
var ip = config.rpcIp;
var port = config.port;
var packPerBlockTime = config.packPerBlockTime;   // 子链出块时间单位s
var decimals = config.decimals;   // 子链token精度
// var chain3 = new Chain3(new Chain3.providers.HttpProvider("http://" + [config.gethHost.toString(), config.gethPort.toString()].join(':'))); 
var mc = chain3.mc;

const ContractStruct = mc.contract(ABI);

var marketabletokenaddr = config.marketableTokenAddr;
var marketabletokenAbi= "[{\"constant\":true,\"inputs\":[{\"name\":\"useraddr\",\"type\":\"address\"},{\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"sellMintTokenPre\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_spender\",\"type\":\"address\"},{\"name\":\"_value\",\"type\":\"uint256\"}],\"name\":\"approve\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"useraddr\",\"type\":\"address\"},{\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"sellMintToken\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"totalSupply\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_from\",\"type\":\"address\"},{\"name\":\"_to\",\"type\":\"address\"},{\"name\":\"_value\",\"type\":\"uint256\"}],\"name\":\"transferFrom\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_spender\",\"type\":\"address\"},{\"name\":\"_subtractedValue\",\"type\":\"uint256\"}],\"name\":\"decreaseApproval\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"_owner\",\"type\":\"address\"}],\"name\":\"balanceOf\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"newowner\",\"type\":\"address\"}],\"name\":\"updateOwner\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"owner\",\"outputs\":[{\"name\":\"\",\"type\":\"address\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"addr\",\"type\":\"address[]\"},{\"name\":\"bals\",\"type\":\"uint256[]\"}],\"name\":\"redeemFromMicroChain\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"useraddr\",\"type\":\"address\"},{\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"buyMintToken\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_to\",\"type\":\"address\"},{\"name\":\"_value\",\"type\":\"uint256\"}],\"name\":\"transfer\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"useraddr\",\"type\":\"address\"},{\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"requestEnterMicrochain\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"priceOneGInMOAC\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_spender\",\"type\":\"address\"},{\"name\":\"_addedValue\",\"type\":\"uint256\"}],\"name\":\"increaseApproval\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"_owner\",\"type\":\"address\"},{\"name\":\"_spender\",\"type\":\"address\"}],\"name\":\"allowance\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"name\":\"tokensupply\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"from\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"to\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"Transfer\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"owner\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"spender\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"Approval\",\"type\":\"event\"}]"
var marketabletokenContract=chain3.mc.contract(JSON.parse(marketabletokenAbi));
var marketabletoken=marketabletokenContract.at(marketabletokenaddr);

var getContractInfo = function(ip, port, methodName, postParam) {
	return new Promise(function(resolve, reject){
		var data = {"jsonrpc": "2.0", "id": 0, "method": methodName, "params": postParam};
		data = JSON.stringify(data);
		var opt = {
		    host: ip,
		    port: port,
		    method: 'POST',
		    path:'/rpc',
		    headers:{
		        "Content-Type": 'application/json',
		        "Accept": 'application/json',
		        "Content-Length": data.length
		    }
		}
		 
		var request = requestWithTimeout(opt, 5000, function(result) {
			var rpcResult = '';
			var datas = '';
			result.on('data',function(data) {
				try {
					datas += data;  // 注意：返回json数据量大时，会截取分批返回
				} catch(e) {
					console.log(e);
				}
		    }).on('end', function(){
		    	//console.log("--------" + datas);
		    	var rpcResult;
		    	if (JSON.parse(datas).result == undefined) {
		    		rpcResult == "have exception";
		    	}
		    	if (JSON.parse(datas).result.Storage == undefined) {
		    		rpcResult = JSON.parse(datas).result;
		    	} else {
		    		rpcResult = JSON.parse(datas).result.Storage;
		    	}
		    	resolve(rpcResult);
		    });
		}).on('error', function(e) {
			if (e.message == "socket hang up") {
				resolve("fail");
			} else {
				reject(e);
			}
		    console.log("error: " + e.message);
		});

		request.write(data);
		request.end();
		
	});	
};

// 创建账户   yes
var registerUser = function (pwd) {
	var registerInfo = {};
	var privateKey = crypto.randomBytes(32);
	var publicKey = secp256k1.publicKeyCreate(privateKey, false).slice(1);
	var address = keccak('keccak256').update(publicKey).digest().slice(-20);
	
	var privateKeyStr = "0x" + privateKey.toString('hex');
	var addressStr = "0x" + address.toString('hex');
	
	var keystore = accounts.encrypt(privateKeyStr, pwd);
	console.log(keystore);
	registerInfo.userAddr = addressStr;
	registerInfo.keystore = keystore;
	return registerInfo;
}
//registerUser("123456");


// 登录账户   yes
// 1 输入的userAddr是否在移动端存储的所有keystore中，若不存在直接返回钱包地址或者密码错误
// 2 若存在，传入userAddr, pwd, keystore调用此方法
// 3 pwd和keystore解析出来私钥，地址，对比地址和输入地址是否一致
var loginUser = function (addr, pwd, keystore) {
	try {
		var keystoreObj = JSON.parse(keystore);
		var address = accounts.decrypt(keystoreObj, pwd).address + '';
//		console.log(accounts.decrypt(keystoreObj, pwd));
		if (address.toLowerCase() == addr.toLowerCase()) {
			return 1
		} else {
			return 0;  // 登录失败
		}	
	} catch (e) {
		if (e.message == "Key derivation failed - possibly wrong password") {
			return 2; // 密码错误
		} else {
			return 0;  // 登录失败
		}
		
	}
	
}

//var keystore = { version: 3,
//		  id: '9c21e715-ead9-4fb7-9fad-2f3666ae773c',
//		  address: '2147de4b8898316bce58f05f7f03d891da81a7b7',
//		  crypto:
//		   { ciphertext:
//		      '6a228ed7a0192a2a8332f69b519cfdfe8b11ae329bd01a3c8b00330dee3fb960',
//		     cipherparams: { iv: '4228aaa8ad7f0c7281b28b467c073d0d' },
//		     cipher: 'aes-128-ctr',
//		     kdf: 'scrypt',
//		     kdfparams:
//		      { dklen: 32,
//		        salt:
//		         'eff6be57814ab7d726c01ef2427ba7045a90d6ef1227071678b30bf82ac58e82',
//		        n: 8192,
//		        r: 8,
//		        p: 1 },
//		     mac:
//		      'ba7a8d3583c54107ed8320502d7695e56d7aafff43759018f75b0a155bae3e1e' } };
//var keystoreStr = JSON.stringify(keystore);
//console.log(loginUser("0x2147de4b8898316bce58f05f7f03d891da81a7b7", "123456", keystoreStr));

// moac兑换token   yes
var buyMintToken = function (userAddr, value) {
	var flag = 1;
	try {
		scAccount.testbuyMintToken(userAddr, pwd, value);
	} catch (e) {
		flag = 0;
		console.log("buyMintToken error ----------" + e);
	}
	return flag;
}
//buyMintToken(userAddr, 4);

// token兑换moac    no
var sellMintToken = function (userAddr, value) {
	scAccount.testsellMintToken(userAddr, pwd, value);
}
//sellMintToken(userAddr, 30);

// 充值token到子链    no
var chargeMintToken = function (userAddr, value) {
	scAccount.testrequestEnterMicrochain(userAddr, pwd, value);
}

// 提币     no
var redeemToken = function (userAddr, value) {
	scAccount.testrequestEnterMicrochain(userAddr, pwd, value);
}

// 查询主链的MOAC和主链ERC20余额    yes
var getBalance = function (userAddr) {
	var balance = {};
	var moacBalance = chain3.fromSha(mc.getBalance(userAddr).toString(), 'mc');
	var erc20Balance = chain3.fromSha(marketabletoken.balanceOf(userAddr).toString(), 'mc');
	balance.moacBalance = moacBalance;
	balance.erc20Balance = erc20Balance;
	return balance;
}
//console.log(getBalance(userAddr));



var getNonce = function (userAddr) {
	var postParam = {"SubChainAddr": subChainAddr, "Sender": userAddr};
	getContractInfo(ip, port, "ScsRPCMethod.GetBalance", postParam).then(function(nonce){
		return nonce;
	});
}
//console.log(getNonce(userAddr));



function requestWithTimeout(options,timeout,callback){
	var timeoutEventId,
    req=http.request(options,function(res){
        
        res.on('end',function(){
            clearTimeout(timeoutEventId);
            //console.log('response end...');
        });
        
        res.on('close',function(){
            clearTimeout(timeoutEventId);
            //console.log('response close...');
        });
        
        res.on('abort',function(){
            console.log('abort...');
        });
        
        callback(res);
    });
        
    req.on('timeout',function(e){
        if(req.res){
            req.res('abort');
        }
        req.abort();
    });
    
    
    timeoutEventId=setTimeout(function(){
        req.emit('timeout',{message:'have been timeout...'});
    },timeout);
    
    return req;
}

//-----------bytes32转16进制string----------//
const Bytes2HexString = (b)=> {
    let hexs = "";
    for (let i = 0; i < b.length; i++) {
        let hex = (b[i]).toString(16);
        if (hex.length === 1) {
            hexs = '0' + hex;
        }
        hexs += hex.toUpperCase();
    }
    return hexs;
}
//-----------16进制string转换成bytes32----------//
const Hexstring2btye = (str)=> {
    let pos = 0;
    let len = str.length;
    if (len % 2 != 0) {
        return null;
    }
    len /= 2;
    let hexA = new Array();
    for (let i = 0; i < len; i++) {
        let s = str.substr(pos, 2);
        let v = parseInt(s, 16);
        hexA.push(v);
        pos += 2;
    }
    return hexA;
}

//function test() {
//	var jsona = { "Type": "Coding", "Height":100 };
//	 for (var key in jsona)
//    {
//        console.log(key); 	//Type, Height
//        console.log(jsona[key]);	//Coding, 100
//    }
//}
var t = Date.now();  
function sleep(d){  
    while(Date.now() - t <= d);  
} 



