var files = require('./Controllers/FilesPromise.js');
var wrap = require('./Controllers/ApiWrapper.js');
var settings = require('./settings/settings');
var GetDealsAndSave = require('./Controllers/GetDealsAndSave.js');
var exchange = settings.exchange;

var UpdateAccountBalance = require('./Controllers/UpdateAccountBalance.js');

var asTable = require('as-table');
var files = require('./Controllers/FilesPromise.js');



var counter = 0;

var settings = {
    quantites: [2, 1.5, 1, 0.5, 0.1, 0.05],
    my: 'ETH/USD',
    gate: 'eth_usdt',
    binance: 'ETHUSDT',
    kraken: 'XETHZUSD',
    gdax: 'ETH-USD'
};


function repeat(settings) {
    Promise.all([gate(settings.gate, settings.quantites), binance(settings.binance, settings.quantites), kraken(settings.kraken, settings.quantites), gdax(settings.gdax, settings.quantites)]).then(function(values) {
        if (values[0] != false && values[1] != false && values[2] != false && values[3] != false) {
            return values;
        } else {
            console.log('Did not receive data... connection problems! false Exchanges - > gate, binance, kraken, gdax', values);
            return false;
        }

    }).then(function(res) {
        if (res != false) {

            var response = {};
            for (let batch of res) {
                for (let quantity in batch) {
                    if (response[quantity] === undefined) {
                        response[quantity] = [];
                    }
                    response[quantity].push(batch[quantity]);
                }
            }

            for (let quantity of settings.quantites) {

                let filename = './www/historical/' + settings.gate + '' + quantity + '.json';


                files.getFile(filename).then(function(data) {
                    if (data === false) {
                        files.postFile(filename, '[]').then(function(res) {
                            console.log(res);
                        }, function(err) {
                            console.log(err);
                        })
                    } else {
                        var file = JSON.parse(data);
                        var newData = arbitrage(response[quantity], settings.my, quantity);
                        file.push(newData);
                        files.postFile(filename, JSON.stringify(file)).then(function(res) {
                            console.log(res);
                        }, function(err) {
                            console.log(err);
                        });
                    }

                }, function(err) {
                    console.log(err);
                });

            }
        }
    }).then(function() {
        setTimeout(function() {
            repeat(settings)
        }, 20000);
    })
}
repeat(settings);



function priceForAmount(bids, amount) {
    var tmp = [];
    var price = 0;

    var spent = 0;
    var bought = 0;
    for (var i = 0; i < bids.length; i++) {
        p0 = bids[i][0] * 1;
        q0 = bids[i][1] * 1;
        var test = bought + q0;
        if (test < amount) {
            for (var n = 0; n < 1; n++) {
                var tmp = [];
                tmp.push(p0);
                tmp.push(q0);
                bought = bought + q0;
                spent = spent + p0 * q0;
                tmp.push(bought);
                tmp.push(spent);
            }
        } else {
            var precision = 100000;
            for (var n = 0; n < precision; n++) {
                var tmp = [];
                bought = bought + q0 / precision;
                spent = spent + p0 * q0 / precision;
                if (bought >= amount) {
                    return roundNumber(spent / bought, 5);
                }

            }
        }
    }
}

function roundNumber(num, scale) {
    if (!("" + num).includes("e")) {
        return +(Math.round(num + "e+" + scale) + "e-" + scale);
    } else {
        var arr = ("" + num).split("e");
        var sig = ""
        if (+arr[1] + scale > 0) {
            sig = "+";
        }
        return +(Math.round(+arr[0] + "e" + sig + (+arr[1] + scale)) + "e-" + scale);
    }
}

function gate(pair, amounts) {
    return new Promise(function(resolve, reject) {
        wrap.orderBook('gate', function(res) {
            if (res != false) {
                var response = {};
                for (let amount of amounts) {
                    var result = {};
                    //'btc_usdt'
                    var asks = res[pair].asks.reverse();
                    var bids = res[pair].bids;

                    result.exchange = "gate";
                    result.pair = pair;
                    result.amount = amount;
                    result.buy = priceForAmount(asks, amount);
                    result.sell = priceForAmount(bids, amount);
                    response[amount] = result;
                }
                if (result.exchange != undefined && result.pair != undefined && result.amount != undefined && result.buy != undefined && result.sell != undefined) {
                    resolve(response);
                } else {
                    console.log('gate market depth laikam nav pietiekošs');
                    resolve(false);
                }
            } else {
                resolve(false);
            }
        })
    })
}



function binance(pair, amounts) {
    return new Promise(function(resolve, reject) {
        //BTCUSDT
        wrap.bookBinance(pair, function(res) {
            if (res != false) {
                var response = {};
                for (let amount of amounts) {
                    var result = {};
                    var bids = res.bids;
                    var asks = res.asks;

                    result.exchange = "binance";
                    result.pair = pair;
                    result.amount = amount;
                    result.buy = priceForAmount(asks, amount);
                    result.sell = priceForAmount(bids, amount);

                    response[amount] = result;
                }

                if (result.exchange != undefined && result.pair != undefined && result.amount != undefined && result.buy != undefined && result.sell != undefined) {
                    resolve(response);
                } else {
                    console.log('binance market depth laikam nav pietiekošs');
                    resolve(false);
                }
            } else {
                resolve(false);
            }
        })
    })
}


function gdax(pair, amounts) {
    return new Promise(function(resolve, reject) {
        //'BTC-USD'
        wrap.bookGdax(pair, function(res) {
            if (res != false) {
                var response = {};
                for (let amount of amounts) {
                    var result = {};
                    var bids = res.bids;
                    var asks = res.asks;

                    result.exchange = "gdax";
                    result.pair = pair;
                    result.amount = amount;
                    result.buy = priceForAmount(asks, amount);
                    result.sell = priceForAmount(bids, amount);

                    response[amount] = result;
                }

                if (result.exchange != undefined && result.pair != undefined && result.amount != undefined && result.buy != undefined && result.sell != undefined) {
                    resolve(response);
                } else {
                    console.log('gdax market depth laikam nav pietiekošs');
                    resolve(false);
                }
            } else {
                resolve(false);
            }
        })
    })
}

function kraken(pair, amounts) {
    return new Promise(function(resolve, reject) {
        //'BTC-USD'
        wrap.bookKraken(pair, function(res) {
            if (res != false) {
                var response = {};
                for (let amount of amounts) {
                    var result = {};
                    var bids = res.bids;
                    var asks = res.asks;

                    result.exchange = "kraken";
                    result.pair = pair;
                    result.amount = amount;
                    result.buy = priceForAmount(asks, amount);
                    result.sell = priceForAmount(bids, amount);
                    response[amount] = result;
                }

                if (result.exchange != undefined && result.pair != undefined && result.amount != undefined && result.buy != undefined && result.sell != undefined) {
                    resolve(response);
                } else {
                    console.log('kraken market depth laikam nav pietiekošs');
                    resolve(false);
                }
            } else {
                resolve(false);
            }
        })
    })
}




function arbitrage(data, pair, quantity) {
    var constract = [];
    var obj = {
        time: new Date().getTime(),
        quantity: quantity,
        pair: pair,
        data: {

        }
    }
    var result = [];

    for (var i = 0; i < data.length; i++) {
        var tmp = {
            exchange: data[i].exchange,
            buy: data[i].buy,
            sell: data[i].sell
        };
        for (var j = 0; j < data.length; j++) {
            if (tmp.exchange != data[j].exchange) {
                var object = data.find(o => o.exchange === data[j].exchange);
                tmp[data[j].exchange] = object.sell;
                var string = "arbitrage2" + data[j].exchange + ""
                tmp[string] = object.sell / tmp.buy;
            }
        }

        obj.data[data[i].exchange] = tmp;
    }

    return obj;
}
