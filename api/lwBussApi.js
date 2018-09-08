//require( '../db.js' );


var scClient = require( './subchainclient.js' );
var config = require('./lwconfig');
var http = require("http");
var BigNumber = require('bignumber.js');
var fs = require('fs');
var Chain3 = require('chain3');
var Web3 = require('web3');

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

//-----------bytes32转16进制string----------//
var Bytes2HexString = function(b){
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
var Hexstring2btye = function(str){
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

//contractInfo公共方法  
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
		 
		var request = requestWithTimeout(opt, 12000, function(result) {
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

// 问题列表(1 获取个数  2 循环查找mapping下标  3 根据下标查找topic   4 组装list返回)	  yy
var getTopicList = function (pageNum, pageSize) {
	// 先获取个数
	var postParam1 = {"SubChainAddr": subChainAddr,
			"Request": [
				{
					"Reqtype":0,
					"Storagekey": [],
					"Position": [],
					"Structformat": []
				}
				]
	};
	getContractInfo(ip, port, "ScsRPCMethod.GetContractInfo", postParam1).then(function(allInfoResult){
		var topicNum = allInfoResult["000000000000000000000000000000000000000000000000000000000000000a"];
		console.log("topic个数是：-------" + parseInt(topicNum, 16));
		
		// 获取topic mapping 下标
		var topicArr = [];
		var flag = 0;
		//parseInt(topicNum, 16) % pageSize
		for (var i = 0; i < parseInt(topicNum); i++) {   // parseInt(topicNum)
//		for (var i = (pageNum - 1) * pageSize; i < pageNum * pageSize; i++) {   // parseInt(topicNum)
//			if (i == parseInt(topicNum, 16)) {
//				console.log(topicArr);
//				return topicArr;
//				break;
//			}
			var postParam2 = {"SubChainAddr": subChainAddr,
				"Request": [
					{
						"Reqtype":1,
						"Storagekey": [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10],
						"Position": [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,i]
						
					}
				]
			};
			getContractInfo(ip, port, "ScsRPCMethod.GetContractInfo", postParam2).then(function(keyResult){
				for (var k in keyResult)
			    {
			        var key = keyResult[k].substring(2);   // 开头a0舍去	
			        // 根据下标查找topic
			        var postParam3 = {"SubChainAddr": subChainAddr,
							"Request": [
								{
									"Reqtype": 2,
									"Storagekey": [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],
						    		"Position": Hexstring2btye(key),
									"Structformat": [51,49,51,49,49,49,51,49,51,49]
									
								}
							]
					};
			        getContractInfo(ip, port, "ScsRPCMethod.GetContractInfo", postParam3).then(function(topicResult){
			        	// 属性key个数等于8，desc直接取。  大于8, desc需要连接取值
			        	var keyCount = Object.keys(topicResult).length
			        	var topic = {};
			        	topic.topicHash = key;  // topicHash
			        	
			        	var valueArr = [];
			        	for (var k in topicResult) {
		        			valueArr.push(topicResult[k]);
		        		}
			        	if (valueArr[0].indexOf("a0") == 0) {   // 正常
			        		topic.owner = "0x" + valueArr[1].substring(2);  // topic发布人
			        		topic.award = chain3.toDecimal('0x' + valueArr[3].substring(2)) / Math.pow(10, decimals);  // 悬赏金额
			        		topic.duration = chain3.toDecimal('0x' + valueArr[4]);   // 问题持续时间
			        		var blankIndex = valueArr[2].substring(2).indexOf('0000');
			        		if (blankIndex > 0) {
			        			topic.desc = chain3.toAscii(valueArr[2].substring(2).substring(0, blankIndex)); // 问题内容
			        		} else {
			        			topic.desc = chain3.toAscii(valueArr[2].substring(2));
			        		}
			        	} else {
			        		//desc需要连接
			        		var descTotalStr = "";
			        		var flagIndex = 0;
			        		for (var i = 0; i < valueArr.length; i++) {
			        			if (valueArr[i].indexOf("a0") == 0) {
			        				flagIndex = i;  // topicHash index处
			        				break;
			        			}
			        		}
			        		
			        		for (var i = 0; i < flagIndex; i++) {
			        			descTotalStr = descTotalStr + valueArr[i].substring(2);
			        		}
			        		var blankIndex = descTotalStr.indexOf('0000');
			        		if (blankIndex > 0) {
			        			topic.desc = chain3.toAscii(descTotalStr.substring(0, blankIndex)); // 问题内容
			        		} else {
			        			topic.desc = chain3.toAscii(descTotalStr);
			        		}
			        		topic.owner = "0x" + valueArr[flagIndex + 1].substring(2);  // topic发布人
			        		console.log("aaa-------------" + valueArr[valueArr.length - 5]);
			        		topic.award = chain3.toDecimal('0x' + valueArr[flagIndex + 3].substring(2)) / Math.pow(10, decimals);  // 悬赏金额
			        		topic.duration = chain3.toDecimal('0x' + valueArr[flagIndex + 4]);   // 问题持续时间
			        	}
//			        	if (keyCount == 9) {
//			        		var valueArr = [];
//			        		for (var k in topicResult) {
//			        			valueArr.push(topicResult[k]);
//			        		}
//			        		topic.owner = "0x" + valueArr[1].substring(2);  // topic发布人
//			        		topic.award = chain3.toDecimal('0x' + valueArr[3].substring(2)) / Math.pow(10, decimals);  // 悬赏金额
//			        		topic.duration = chain3.toDecimal('0x' + valueArr[4]);   // 问题持续时间
//			        		var blankIndex = valueArr[2].substring(2).indexOf('0000');
//			        		if (blankIndex > 0) {
//			        			topic.desc = chain3.toAscii(valueArr[2].substring(2).substring(0, blankIndex)); // 问题内容
//			        		} else {
//			        			topic.desc = chain3.toAscii(valueArr[2].substring(2));
//			        		}
//			 
//			        		
//			        	} 
			        	
//			        	if (keyCount > 9) {
//			        		var valueArr = [];
//			        		var descTotalStr = "";
//			        		for (var k in topicResult) {
//			        			valueArr.push(topicResult[k]);
//			        		}
//			        		console.log(valueArr);
//			        		for (var i = 0; i < valueArr.length - 8; i++) {
//			        			descTotalStr = descTotalStr + valueArr[i].substring(2);
//			        		}
//			        		var blankIndex = descTotalStr.indexOf('0000');
//			        		if (blankIndex > 0) {
//			        			topic.desc = chain3.toAscii(descTotalStr.substring(0, blankIndex)); // 问题内容
//			        		} else {
//			        			topic.desc = chain3.toAscii(descTotalStr);
//			        		}
//			        		topic.owner = "0x" + valueArr[valueArr.length - 7].substring(2);  // topic发布人
//			        		console.log("aaa-------------" + valueArr[valueArr.length - 5]);
//			        		topic.award = chain3.toDecimal('0x' + valueArr[valueArr.length - 5].substring(2)) / Math.pow(10, decimals);  // 悬赏金额
//			        		topic.duration = chain3.toDecimal('0x' + valueArr[valueArr.length - 4]);   // 问题持续时间
//			        	}
			        	topicArr.push(topic);
			            flag++;
//			            if (flag == pageSize) {
			            if (flag == parseInt(topicNum)) {
			        		console.log(topicArr);
			        		return topicArr
			        	}
			        });
			    }
			});
		}
	});
}

getTopicList(0,0)

// 创建问题    yes
var createTopic = function (award, desc, duration, userAddr) {
	var postParam1 = {"SubChainAddr": subChainAddr, "Sender": userAddr};
	
	getContractInfo(ip, port, "ScsRPCMethod.GetNonce", postParam1).then(function(nonce){
		console.log(nonce);
		// 创建问题
		scClient.createTopicSol(award, duration, desc, subChainAddr, nonce);
		// 获取hash
		var postParam2 = {
				"SubChainAddr": subChainAddr,
				"Sender": userAddr, 
				"nonce": nonce
		};
		t = Date.now();
		// 十秒打包区块，返回hash
		sleep((packPerBlockTime + 3) * 1000);
		getContractInfo(ip, port, "ScsRPCMethod.GetTxRlt", postParam2).then(function(topicHash){
			console.log(topicHash);
			return topicHash;
		});
	});
	
}
//createTopic(1, "are you happy, if you are not happy, i will ask you if you are ok, if you are not ok?", 30, userAddr);

// 创建回答   yes
var createSubTopic = function (topicHash, desc, userAddr) {
	var postParam1 = {"SubChainAddr": subChainAddr, "Sender": userAddr};
	
	getContractInfo(ip, port, "ScsRPCMethod.GetNonce", postParam1).then(function(nonce){
		// 创建回答
		scClient.createSubTopicSol(desc, subChainAddr, topicHash, nonce);
		// 获取hash
		var postParam2 = {
				"SubChainAddr": subChainAddr,
				"Sender": userAddr, 
				"nonce": nonce
		};
		t = Date.now();
		sleep((packPerBlockTime + 2) * 1000);
		getContractInfo(ip, port, "ScsRPCMethod.GetTxRlt", postParam2).then(function(subTopicHash){
			console.log(subTopicHash);
			return subTopicHash;
		});
	});
}

//createSubTopic("0x" + "45f0022282b85c71c1533fe2dd44d8c9ba5f05fbc311e25847d84f49e5726a0e", 
//		"aaa is bad", userAddr);



// 回答列表    yes
//1 根据topicHash，查找回答hash数组  2 遍历获取到下标，根据下标查找所有回答
var getSubTopicList = function (topicHash, pageNum, pageSize) {
	// 根据topicHash，查找回答hash数组
	var topicHashByte = Hexstring2btye(topicHash);
	var postParam1 = {"SubChainAddr": subChainAddr,
		"Request": [
			{
				"Reqtype":2,
				"Storagekey": [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7],
				"Position": topicHashByte,
				"Structformat": [50]
			}
		]
	}
	var subTopicArr = [];
	var flag = 0;
	//for (var i = 0; i < parseInt(topicNum); i++) {   // parseInt(topicNum)
	//for (var i = (pageNum - 1) * 3; i < pageNum * pageSize; i++) {   // parseInt(topicNum)
	getContractInfo(ip, port, "ScsRPCMethod.GetContractInfo", postParam1).then(function(subTopicHashArr){
		var values = [];
		for (var k in subTopicHashArr) {
			values.push(subTopicHashArr[k]);
		}
//		for (var k = (pageNum - 1) * pageSize + 1; k <= pageNum * pageSize; k++ )
		if (values[0].length <=5) {
			var fromNum = 1;
			var endNum = values.length;
		}
		if (values[values.length - 1].length <=5) {
			var fromNum = 0;
			var endNum = values.length - 1;
		}
		for (var k =  fromNum; k < endNum; k++ )
	    {
			var key = null;
			if (values[k].indexOf("a0") == 0) {
				key = values[k].substring(2);   // 开头a0舍去
			} else {
				key = values[k]; 
			}
	        	
	        // 根据下标查找topic
	        var postParam2 = {"SubChainAddr": subChainAddr,
					"Request": [
						{
							"Reqtype": 2,
							"Storagekey": [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6],
				    		"Position": Hexstring2btye(key),
							"Structformat": [51, 49, 51, 51, 49, 50]
						}
					]
			};
	        getContractInfo(ip, port, "ScsRPCMethod.GetContractInfo", postParam2).then(function(subTopicResult){
	        	// 属性key个数等于6，desc直接取。  大于6, desc需要连接取值
	        	var keyCount = Object.keys(subTopicResult).length
	        	var subTopic = {};
	        	if (keyCount == 6) {
	        		var valueArr = [];
	        		for (var k in subTopicResult) {
	        			valueArr.push(subTopicResult[k]);
	        		}
	        		console.log(valueArr);
	        		subTopic.subTopicHash = valueArr[0].substring(2); 
	        		subTopic.owner = "0x" + valueArr[1].substring(2);  // 发布人
	        		if (valueArr[4] == '') 
	        		{
	        			subTopic.voteCount = 0
	        		} else {
	        			subTopic.voteCount = parseInt(valueArr[4], 16);  // topic发布人
	        		}
	        		
	        		var blankIndex = valueArr[2].substring(2).indexOf('0000');
	        		if (blankIndex > 0) {
	        			subTopic.desc = chain3.toAscii(valueArr[2].substring(2).substring(0, blankIndex)); // 问题内容
	        		} else {
	        			subTopic.desc = chain3.toAscii(valueArr[2].substring(2));
	        		}
	        		
	        	} 
	        	if (keyCount == 7) {
	        		var valueArr = [];
	        		for (var k in subTopicResult) {
	        			valueArr.push(subTopicResult[k]);
	        		}
	        		subTopic.subTopicHash = valueArr[1].substring(2); 
	        		subTopic.owner = "0x" + valueArr[2].substring(2);  // 发布人
	        		if (valueArr[5] == '') 
	        		{
	        			subTopic.voteCount = 0
	        		} else {
	        			subTopic.voteCount = parseInt(valueArr[5], 16);  // topic发布人
	        		}
	        		
	        		var blankIndex = valueArr[3].substring(2).indexOf('0000');
	        		if (blankIndex > 0) {
	        			subTopic.desc = chain3.toAscii(valueArr[3].substring(2).substring(0, blankIndex)); // 问题内容
	        		} else {
	        			subTopic.desc = chain3.toAscii(valueArr[3].substring(2));
	        		}
	        		
	        	} 
	        	
	        	if (keyCount > 7) {
	        		var valueArr = [];
	        		var descTotalStr = "";
	        		for (var k in subTopicResult) {
	        			valueArr.push(subTopicResult[k]);
	        		}
	        		subTopic.subTopicHash = valueArr[0].substring(2); 
	        		for (var i = 6; i < valueArr.length; i++) {
	        			descTotalStr = descTotalStr + valueArr[i].substring(2);
	        		}
	        		var blankIndex = descTotalStr.indexOf('0000');
	        		if (blankIndex > 0) {
	        			subTopic.desc = chain3.toAscii(descTotalStr.substring(0, blankIndex)); // 问题内容
	        		} else {
	        			subTopic.desc = chain3.toAscii(descTotalStr);
	        		}
	        		subTopic.owner = "0x" + valueArr[1].substring(2);  // 发布人
	        		if (valueArr[4] == '') 
	        		{
	        			subTopic.voteCount = 0
	        		} else {
	        			subTopic.voteCount = parseInt(valueArr[4], 16);  // topic发布人
	        		}
	        	}
	        	subTopicArr.push(subTopic);
	            flag++;
	            if (flag == values.length - 1) {
	        		console.log(subTopicArr);
	        		return subTopicArr
	        	}
	        });
	    }
		
	});
}

//getSubTopicList("168fcc9df48d777adf82609fc535265e1d61613da922476e7a3f89214d9ad143",null, null);


// 点赞    yes
var approveSubTopic = function (voter, subTopicHash) {
	var postParam = {"SubChainAddr": subChainAddr, "Sender": voter};
	getContractInfo(ip, port, "ScsRPCMethod.GetNonce", postParam).then(function(nonce){
		scClient.voteOnTopic(voter, null, subChainAddr, subTopicHash, nonce)
	});
}
//approveSubTopic(userAddr, "0x" + "ffc4756d92af05ac657150374a9b48f33e30b29192601470cf62792ada0656a4");

// 查询子链token余额   yes
var getMicroChainBalance = function (userAddr) {
	var postParam = {"SubChainAddr": subChainAddr,"Sender": userAddr};
	getContractInfo(ip, port, "ScsRPCMethod.GetBalance", postParam).then(function(tokenBalance){
		console.log(tokenBalance / Math.pow(10, decimals));
		return tokenBalance / Math.pow(10, decimals);
	})
}
//getMicroChainBalance(userAddr);

// autoCheck   no
var autoCheck = function (userAddr, subTopicHash) {
	var postParam = {"SubChainAddr": subChainAddr, "Sender": userAddr};
	getContractInfo(ip, port, "ScsRPCMethod.GetNonce", postParam).then(function(nonce){
		autoCheck(subchainaddr, nonce)
	});
}




var getNonce = function (userAddr) {
	var postParam = {"SubChainAddr": subChainAddr, "Sender": userAddr};
	getContractInfo(ip, port, "ScsRPCMethod.GetBalance", postParam).then(function(nonce){
		return nonce;
	});
}


// 带超时设置的request
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

