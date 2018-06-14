var gate = require('../API/gate.js');

const api = require('binance');
const binanceRest = new api.BinanceRest({
    key: 'NzoQjLx5fxXSYLOREMSiWaCP7sJsCSJYYbnoKItQkp9gInDsFTRlTevJyDyv3q4h', // Get this from your account on binance.com
    secret: 'NLCYIp8D8yQd04ULCaGTSMdt6f0NfTnnLzzItFY7Jez4T4FeDxza3fnJPjb7tkgZ', // Same for this
    timeout: 15000, // Optional, defaults to 15000, is the request time out in milliseconds
    recvWindow: 10000, // Optional, defaults to 5000, increase if you're getting timestamp errors
    disableBeautification: false,
    handleDrift: false
});
const Gdax = require('gdax');
const publicClient = new Gdax.PublicClient();


const Kraken = require('kraken-wrapper');
 
const kraken = new Kraken();

 

var bot = {

	placeOrder: function(exchange, type, amount, pair, rate, opt, data, callback) {
	    // ----- gate-io ----- //
	    // exchange 'string' gate.io --> gate
	    // pair *string* eth_btc
	    // rate *number* 0.123
	    // amount *number* 13.3
	    // type *string* BUY/SELL
	    // opt *string* or null


	    var result = {
	        success: false,
	        id: null,
	        response: null,
	        code: null,
	        data: data
	    }
	    

	    if (exchange === 'gate') {  	

	        if (type === "BUY") {

	       

	        	console.log('BUY ->',type);
	            gate.buy(pair, rate, amount, function(res) {
	            	if(isJSON(res)){
		            	console.log(res);
		            	if(JSON.parse(res).result === 'true' || JSON.parse(res).result === true){
		            	result.success = true;
		                result.id = JSON.parse(res).orderNumber;
		                result.response = res;
		                callback(result);
		            	}else{
		            	result.success = false;
		            	result.code = JSON.parse(res).code;
		                result.id = JSON.parse(res).orderNumber;
		                result.response = res;
		                callback(result);
	            		}	
	            		}else{
	        			console.log('nepareiza atbilde no servera',res);
	        			callback(result); //false
	        			}
	            });
	        }
	        if (type === "SELL") {
	        	console.log('SELL ->',type);

	        	gate.sell(pair, rate, amount, function(res) {
	        		//console.log(pair,rate,amount);
	        		if(isJSON(res)){
		        		if(JSON.parse(res).result === 'true' || JSON.parse(res).result === true){
		        		result.success = true;
		        	    result.id = JSON.parse(res).orderNumber;
		        	    result.response = res;
		        	    callback(result);
		        		}else{
		        		result.success = false;
		        		result.code = JSON.parse(res).code;
		        	    result.id = JSON.parse(res).orderNumber;
		        	    result.response = res;
		        	    callback(result);
		        		}
	        			}else{
	        			console.log('nepareiza atbilde no servera',res);
	        			callback(result); //false
	        		}
	        	});
	       }
	       
	        
	    } else {
	    	
	        throw new Error('something went terribly wrong!, maybe incorrect inputs in wrap function');
	    }
	},

	orderStatus: function(exchange, id, pair, data, callback) {
	    var result = {
	    	success: false,
	        status: null,
	        type: null,
	        amount: null,
	        filledAmount: null,
	        initialAmount: null,
	        rate: null,
	        response: null,
	        data:data
	    };

	    if (exchange === 'gate') {
	        gate.getOrder(id, pair, function(res) {
	        	console.log(res);
	        	if(isJSON(res)){
	        		var res = JSON.parse(res);
		            if (res.result === 'true' || res.result === true) {

		            	result.success = true;
		                result.status = res.order.status;
		                result.type = res.order.type;
		       			result.type = res.order.rate;

		       			result.amount = res.order.amount;
		       			result.filledAmount = res.order.filledAmount;
		       			result.initialAmount = res.order.initialAmount;

		                result.response = JSON.stringify(res);
		                callback(result);
		            } else {
		            	result.success = false;
		                result.response = JSON.stringify(res);
		                callback(result);
		            }
	           	}
	        });
	    }

			//     {
			// 	"result":true,
			// 	"order":{
			// 		"id":"15088",
			// 		"status":"cancelled",
			// 		"pair":"eth_btc",
			// 		"type":"sell",
			// 		"rate":0.06930520,
			// 		"amount":"0.39901357",
			// 		"initial_rate":0.06930520,
			// 		"initial_amount":"1"
			// 	},
			// 	"msg":"Success"
			// }
	},

	cancelThisOrder: function(exchange, id, pair, data, callback) {
	    var result = {
	    	success: null,
	        response: null,
	        data: data
	    };


	    if (exchange === 'gate') {
	        gate.cancelOrder(id, pair, function(res) {
	        	if(isJSON(res)){
		            if (JSON.parse(res).result === 'true' || JSON.parse(res).result === true) {
		            	result.success = true;
		                result.response = JSON.parse(res);
		                callback(result);
		            } else {
		                result.success = false;
		                result.response = JSON.parse(res);
		                callback(result);
		            }
	        	}
	        });
	    }

	    // MANS CALLBACK ATGRIEŽ TIKAI  1 PARAMETRU, status

	    // S O  T E ATGRIEZ gateio ja true
	    // {
	    // 	"result":"true",
	    // 	"msg":"Success"
	    // }
	},
		orderBook: function(exchange, callback) {

	    if (exchange === 'gate') {
	        gate.orderBooks(function(res) {
	        	    try {
	        	        var o = JSON.parse(res);

	        	        // Handle non-exception-throwing cases:
	        	        // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
	        	        // but... JSON.parse(null) returns null, and typeof null === "object", 
	        	        // so we must check for that, too. Thankfully, null is falsey, so this suffices:
	        	        if (o && typeof o === "object") {
	        	            return callback(o);
	        	        }
	        	    }
	        	    catch (e) { callback(false); } //console.log(res);}	        	
	        	
	        });

	        // {
	        //   "bts_btc": {
	        //     "result": "true",
	        //     "asks": [
	        //       [0.1, 2],
	        //       [0.11, 4]
	        //     ]
	        //   },
	        //   "fun_eth": {
	        //     "result": "true",
	        //     "asks": [
	        //       [0.09, 2],
	        //       [0.1, 4]
	        //     ]
	        //   }
	        // }



	    }else if(exchange === 'binance'){
	    	console.log('running binance bot');

	    //     [Array] ] },
	    // bts_btc: 
	    //  { result: 'true',
	    //    asks: 
	    //     [ [Array],
	    //       [Array],
	    //       [Array],
	    //       [Array],

		 	binanceRest.allBookTickers(function(err, data){
		 	    if (err) {
		 	        console.error(err);
		 	    } else {
		 	    console.log(data); 	    	
		 	    	 	binanceRest.exchangeInfo(function(err, binanceTmp){
		 	    		    if (err) {
		 	    		        console.error(err);
		 	    		    } else {
		 	    		    	if (data.length != undefined && data.length > 2 && isJSON(binanceTmp)) {
		 	    		    		callback(editBinanceBook(data,binanceTmp));
		 	    		    	}else{
		 	    		    		callback(false);
		 	    		    	}
		 	    		    	

		 	    		    }
		 	    		});

		 	    }
		 	});

		 }else{
		 	callback([false,'exchange not suported']);	
		 }

// 		 allBookTickers

// [ { symbol: 'ETHBTC',
//     bidPrice: '0.09322700',
//     bidQty: '0.36600000',
//     askPrice: '0.09326700',
//     askQty: '0.02000000' },
//   { symbol: 'LTCBTC',
//     bidPrice: '0.02257000',
//     bidQty: '15.57000000',
//     askPrice: '0.02258300',
//     askQty: '1.18000000' },
//   { symbol: 'BNBBTC',
//     bidPrice: '0.00107650',
//     bidQty: '90.10000000',
//     askPrice: '0.00107680',
//     askQty: '0.03000000' },
//   { symbol: 'NEOBTC',


		
	},


	getAccountBalance: function(exchange, callback) {
	    var result = {
	    	success: null,
	        available: null,
	        locked: null,
	        response: null
	    };

	    if (exchange === 'gate') {

	        gate.getBalances(function(res) {
	            if (JSON.parse(res).result === 'true' || JSON.parse(res).result === true) {
	            	result.success = true;
	                available = JSON.parse(res).available;
	                locked = JSON.parse(res).locked;
	                result.response = res;
	                callback(result);
	            } else {
	            	result.success = false;
	                result.response = res;
	                callback(result);
	            }
	        });
	    }

	    // {
	    // 		"result":"true",
	    // 		"available":{
	    // 			"BTC":"0.83337671",
	    // 			"LTC":"94.364",
	    // 			"ETH":"0.07161",
	    // 			"ETC":"82.35029899"
	    // 		},
	    // 		"locked":{
	    // 			"BTC":"0.0002",
	    // 			"YAC":"10.01"
	    // 		}
	    // 	}

	},
		getTickers: function(exchange, callback) {

	    if (exchange === 'gate') {

	        gate.getTickers(function(res) {
	        	//console.log(res);
	        	callback(JSON.parse(res));
	        });
	    }

	    // ---> result must always be like this <----

	    // 	{
		//     "btc_usdt": {
		//         "result": "true",
		//         "last": 11953,
		//         "lowestAsk": 11952.78,
		//         "highestBid": 11873.8,
		//         "percentChange": 4.9590736847452,
		//         "baseVolume": 7768219.88,
		//         "quoteVolume": 656.624,
		//         "high24hr": 12197.51,
		//         "low24hr": 11251.87
		//     }
		//  }

	},
		getTicker: function(exchange, pair, callback) {

	    if (exchange === 'gate') {

	        gate.getTicker(pair,function(res) {
	        	callback(JSON.parse(res));
	        });
	    }

	    // ---> result must always be like this <----

	    // 	{
		//     "btc_usdt": {
		//         "result": "true",
		//         "last": 11953,
		//         "lowestAsk": 11952.78,
		//         "highestBid": 11873.8,
		//         "percentChange": 4.9590736847452,
		//         "baseVolume": 7768219.88,
		//         "quoteVolume": 656.624,
		//         "high24hr": 12197.51,
		//         "low24hr": 11251.87
		//     }
		//  }


		// orderBook[pair] 

		// availablepairs -> [eth_btc,2,3,4,].includes(pair)



	},
		getAllPairsTradingNow: function(exchange, callback) {

	    if (exchange === 'gate') {

	        gate.getPairs(function(res) {
	        	callback(res);
	        });


	        // ["btc_usdt","bch_usdt","eth_usdt","etc_usdt","...
	    }




	    // ---> result must always be like this <----

	    // Array --> [storj_btc","eos_eth","eos_btc",.....,"bts_usdt","bts_btc"]

	},
	bookBinance: function(pair, callback){
		binanceRest.depth(pair,function(err, book){

			if (err == null) {

				if (isJSON(book)) {
					callback(book);
				}else{
					console.log('Binance isJson error');
					callback(false);
				}
			}else{
				callback(false);
			}
		});
		
	},
	bookGdax: function(pair,callback){

		publicClient.getProductOrderBook(pair,{ level: 2 })
		.then(data => {
			
			if (isJSON(data)) {
				callback(data);
			}else{
				console.log('Gdax isJson error');
				callback(false);
			}

			
		})
		.catch(error => {
			callback(false);
		  // handle the error
		});
	},
	bookKraken: function(pair,callback){

		var params = {
			pair: pair,
			count: 50
		}

		kraken.getOrderBook(params).then((response) => {
			if (isJSON(response) && isJSON(response.result) && isJSON(response.result[params.pair])) {
				callback(response.result[params.pair])
			}else{
				console.log('kraken isJson error');
				    callback(false);
			}			
		}).catch((error) => {
		  	callback(false);
		});
	}

}



module.exports = bot;


function editBinanceBook(arr,info){
	var result = {};	
	for (var i = 0; i < arr.length; i++) {
		for (var j = 0; j < info['symbols'].length; j++) {
			if(arr[i].symbol === info.symbols[j].symbol && arr[i].symbol != '123456'){
				var pair = info.symbols[j].baseAsset + "_" + info.symbols[j].quoteAsset;


				var lowerCasePair = pair.toLowerCase();

				var tmpObj = {};
				tmpObj.result = true;
				tmpObj.asks = [];
				tmpObj.bids = [];
				//for, vajag market depth katram,,, psc
				var ask = [arr[i].askPrice * 1 ,arr[i].askQty * 1 ];
				var bid = [arr[i].bidPrice * 1 ,arr[i].bidQty * 1 ];

				tmpObj.asks.push(ask);
				tmpObj.asks.push(ask);
				tmpObj.asks.push(ask);
				tmpObj.asks.push(ask);

				tmpObj.bids.push(bid);
				tmpObj.bids.push(bid);
				tmpObj.bids.push(bid);
				tmpObj.bids.push(bid);

				result[lowerCasePair] = tmpObj;
			}
		}
	}

	return result;
}

function isJSON (something) {
    if (typeof something != 'string')
        something = JSON.stringify(something);

    try {
        JSON.parse(something);
        return true;
    } catch (e) {
        return false;
    }
}

// placeOrder('gate','SELL', 1, 'eth_btc', 0.30, null, function(res){
// 	console.log(res);
// 	// var result = {
// 	//   success: null,
// 	//   id: null
// 	// }
// });

// orderStatus('gate', '123', 'eth_btc', function(res){
// 	console.log(res);
// 	// var result = {
// 	// 	status: null,
// 	// 	amount: null
// 	// };
// });

// cancelThisOrder('gate', '123', 'eth_btc', function(res){
// 	console.log(res);
// 	// var result = {
// 	// 	status: null,
// 	// 	amount: null
// 	// };
// });


// getAccountBalance('gate', function(res) {
//     console.log(res);
//     // var result = {
//     // 	status: null,
//     // 	amount: null
//     // };
// });