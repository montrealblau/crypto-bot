    var bot = require('./ApiWrapper');
    var arbitrage = require('./Brain');

exports.get = (exchange, paris, callback) => {
    //var dummyDeals = [[13.54385964208,['eth',1],['snet',8771.92982],['llt',1],['eth',0.001544]],[13.25580275712,['eth',1],['usdt',1232],['llt',6.96864],['eth',0.001544]],[1.2972272725975498,['eth',1],['fun',15151.51515],['usdt',0.1057],['eth',0.00081]],[1.1344084184344898,['eth',1],['tnc',23255.81395],['btc',0.0000051],['eth',9.56462]],[1.0529999998315198,['eth',1],['tnt',4694.83568],['usdt',0.2769],['eth',0.00081]],[1.13440841843449,['btc',1],['eth',9.56462],['tnc',23255.81395],['btc',0.0000051]],[1.1316739701033,['btc',1],['usdt',11827.1],['tnc',18.76173],['btc',0.0000051]]];
    var allTickers = {};
    var orderBook = {};
    var deals = [];
    var finalDeals = [];

    // var balance = "230.3 ETH";
    // var data = {
    //  tickers: 'ETH_BTC',
    //  balance: balance

    // }
    //setInterval(exports.run, 5*1000);



    // BUY un SELL ir par pirmo pari, otra para valuta
    // JA BUY, TAD SANEM PIRMO NO PAARA, un TAD momentānā cena ir no ASKS

    // JA SELL, TAD SANEM OTRO NO PAARA, un TAD momentānā cena ir no BIDS


    //DONE DONE DONE >>>> 

   // bot.getAllPairsTradingNow(exchange, function(res) {
        //availablepairs = res;

        // bot.getTickers(exchange, function(res) {
        //     allTickers = res;
        //     mylog('gettingTickers...');

            bot.orderBook(exchange, function(res) {
                if (res != false) {
                    allTickers = res;
                    orderBook = res;
                    mylog('gettingorderBook...');

                    // REMOVE ELEMENTS WITH NO quoteVolume !!!!
                    // maybe REMOVE ELEMENTS WITH zero percentChange  ? 
                    paris.forEach(function(e) {
                        mylog('calculating all posible combinations...');
                        deals = deals.concat(arbitrage.run(e, allTickers));

                        mylog('collecting all profitable deals... from:' + deals.length + ' deals!');
                        
                        mylog(deals);
                        // [ 'ETH', 'ADX', 'BNB', 'ETH' ],
                        // [ 'ETH', 'ADA', 'BTC', 'ETH' ],
                        // [ 'ETH', 'PPT', 'BTC', 'ETH' ],
                        // [ 'ETH', 'CMT', 'BTC', 'ETH' ],

                        deals.forEach(function(e) {
                            var deal = updateProfit(getPairsForDeal(e));
                            // if (deal != undefined && deal[0][0] > minProfit && deal[0][0] < maxProfit) {
                            if (deal != undefined) {
                                finalDeals.push(deal);
                            }
                        });
                    });




                    finalDeals.sort(function(a, b) {
                        return b[0][0] - a[0][0]
                    });
                    mylog('sort by profitability...');
                    //mylog(finalDeals);
                    //mylog(Date());
                    callback(finalDeals);
                }else{
                    console.log('nekorekti dati no servera (orderbook)',res);
                    callback(false);
                }

            });
        // });
   // });

    function updateProfit(arr) {

        if (arr[1][0] === "BUY" && arr[2][0] === "SELL" && arr[3][0] === "BUY") {

            var BUY1 = arr[1][2][0];
            var BUY2 = arr[1][3][0];
            var BUY3 = arr[1][4][0];
            var SELL1 = arr[2][2][0];
            var SELL2 = arr[2][3][0];
            var SELL3 = arr[2][4][0];
            var BUY12 = arr[3][2][0];
            var BUY22 = arr[3][3][0];
            var BUY32 = arr[3][4][0];
            // PROCENTI
            arr[0][0] = roundNumber(SELL1 / BUY1 / BUY12, 4);
            arr[0][1] = roundNumber(SELL2 / BUY2 / BUY22, 4);
            arr[0][2] = roundNumber(SELL3 / BUY3 / BUY32, 4);

            // BUY
            var A = arr[1][2][0]*arr[1][2][1];
            var B = arr[1][3][0]*arr[1][3][1];
            var C = arr[1][4][0]*arr[1][4][1];

            arr[1][2].push(A);
            arr[1][3].push(B);
            arr[1][4].push(C);

            // SELL
            var D = (arr[2][2][0]*arr[2][2][1])/arr[3][2][0];
            var E = (arr[2][3][0]*arr[2][3][1])/arr[3][3][0];
            var F = (arr[2][4][0]*arr[2][4][1])/arr[3][4][0];

            arr[2][2].push(D); 
            arr[2][3].push(E)
            arr[2][4].push(F)

            // BUY
            var G = arr[3][2][1];
            var H = arr[3][3][1];
            var I = arr[3][4][1];

            arr[3][2].push(G);
            arr[3][3].push(H);
            arr[3][4].push(I);


        }

        if (arr[1][0] == "BUY" && arr[2][0] === "SELL" && arr[3][0] === "SELL") {

            var BUY1 = arr[1][2][0];
            var BUY2 = arr[1][3][0];
            var BUY3 = arr[1][4][0];

            var SELL1 = arr[2][2][0];
            var SELL2 = arr[2][3][0];
            var SELL3 = arr[2][4][0];

            var SELL12 = arr[3][2][0];
            var SELL22 = arr[3][3][0];
            var SELL32 = arr[3][4][0];
            // PROCENTI
            arr[0][0] = roundNumber(SELL1 / BUY1 * SELL12, 4);
            arr[0][1] = roundNumber(SELL2 / BUY2 * SELL22, 4);
            arr[0][2] = roundNumber(SELL3 / BUY3 * SELL32, 4);
            
            // BUY
            var A = arr[1][2][0]*arr[1][2][1];
            var B = arr[1][3][0]*arr[1][3][1];
            var C = arr[1][4][0]*arr[1][4][1];

            arr[1][2].push(A);
            arr[1][3].push(B);
            arr[1][4].push(C);

            // SELL
            var D = arr[2][2][0]*arr[2][2][1]*arr[3][2][0];
            var E = arr[2][3][0]*arr[2][3][1]*arr[3][3][0];
            var F = arr[2][4][0]*arr[2][4][1]*arr[3][4][0];

            arr[2][2].push(D); 
            arr[2][3].push(E)
            arr[2][4].push(F)

            // SELL
            var G = arr[3][2][0]*arr[3][2][1];
            var H = arr[3][3][0]*arr[3][3][1];
            var I = arr[3][4][0]*arr[3][4][1];

            arr[3][2].push(G);
            arr[3][3].push(H);
            arr[3][4].push(I);


        }
        if (arr[1][0] === "SELL" && arr[2][0] === "SELL" && arr[3][0] === "BUY") {

            var SELL1 = arr[1][2][0];
            var SELL2 = arr[1][3][0];
            var SELL3 = arr[1][4][0];

            var SELL12 = arr[2][2][0];
            var SELL22 = arr[2][3][0];
            var SELL32 = arr[2][4][0];

            var BUY1 = arr[3][2][0];
            var BUY2 = arr[3][3][0];
            var BUY3 = arr[3][4][0];



            var P1 = arr[3][2][0]; //Cena no nakošaa soļa A_
            var P2 = arr[3][3][0]; //Cena no nakošaa soļa A_  lietoju tikai vidēejo/ ir neprecīzs
            var P3 = arr[3][4][0]; //Cena no nakošaa soļa A_

            var Q1 = arr[2][2][2]; ///DAUDZUMS izteikts _B
            var Q2 = arr[2][3][2]; //DAUDZUMS izteikts _B 
            var Q3 = arr[2][4][2]; //DAUDZUMS izteikts _B ! jau ir sasumēeti!


            // PROCENTI
            arr[0][0] = roundNumber(SELL1 * SELL12 / BUY1, 4);
            arr[0][1] = roundNumber(SELL2 * SELL22 / BUY2, 4);
            arr[0][2] = roundNumber(SELL3 * SELL32 / BUY3, 4);

            // SELL
            var A = arr[1][2][1];
            var B = arr[1][3][1];
            var C = arr[1][4][1];

            arr[1][2].push(A);
            arr[1][3].push(B);
            arr[1][4].push(C);

            // SELL
            var D = (arr[2][2][0]*arr[2][2][1])/arr[3][2][0];
            var E = (arr[2][3][0]*arr[2][3][1])/arr[3][3][0];
            var F = (arr[2][4][0]*arr[2][4][1])/arr[3][4][0];

            arr[2][2].push(D); 
            arr[2][3].push(E)
            arr[2][4].push(F)

            // BUY
            var G = arr[3][2][1];
            var H = arr[3][3][1];
            var I = arr[3][4][1];

            arr[3][2].push(G);
            arr[3][3].push(H);
            arr[3][4].push(I);


        }
        // BUY BUY SELL ??? WTF ?
        return arr;
    }


    // function roundNumber(number, digits) {
    //     var multiple = Math.pow(10, digits);
    //     var rndedNum = Math.round(number * multiple) / multiple;
    //     return rndedNum;
    // }
        function roundNumber(number, digits) {
       // var multiple = Math.pow(10, digits);
        // var rndedNum = Math.round(number * multiple) / multiple;
        return number;
    }

    function lastBid(pair) {
        if (orderBook[pair].bids.length > 3) {
            var first = orderBook[pair].bids[0];
            var firstPrice = first[0] * 1;
            var firstVolume = first[1] * 1;
            var result = [];
            result.push(roundNumber(firstPrice, 7));
            result.push(roundNumber(firstVolume, 5));
            return result;
        } else {
            return [];
        }
    }


    function lastAsk(pair) {
        if (orderBook[pair].asks.length > 3) {
            var n = orderBook[pair].asks.length
            var first = orderBook[pair].asks[n - 1];
            var firstPrice = first[0] * 1;
            var firstVolume = first[1] * 1;
            var result = [];
            result.push(roundNumber(firstPrice, 7));
            result.push(roundNumber(firstVolume, 5));
            return result;

        } else {
            return [];

        }
    }


    function lastBid2(pair) {
        if (orderBook[pair].bids.length > 3) {
            var first = orderBook[pair].bids[0];
            var second = orderBook[pair].bids[1];
            var firstPrice = first[0] * 1;
            var secondPrice = second[0] * 1;
            var firstVolume = first[1] * 1;
            var secondVolume = second[1] * 1;
            var sum = firstVolume + secondVolume;
            var result = [];
            result.push(roundNumber(secondPrice, 7));
            result.push(roundNumber(sum, 5));
            return result;
        } else {
            return [];
        }
    }

    function lastAsk2(pair) {
        if (orderBook[pair].asks.length > 3) {
            var n = orderBook[pair].asks.length
            var first = orderBook[pair].asks[n - 1];
            var second = orderBook[pair].asks[n - 2];
            var firstPrice = first[0] * 1;
            var secondPrice = second[0] * 1;
            var firstVolume = first[1] * 1;
            var secondVolume = second[1] * 1;
            var sum = firstVolume + secondVolume;
            var result = [];
            result.push(roundNumber(secondPrice, 7));
            result.push(roundNumber(sum, 5));
            return result;

        } else {
            return [];

        }
    }

    function lastAsk3(pair) {
        if (orderBook[pair].asks.length > 3) {
            var n = orderBook[pair].asks.length
            var first = orderBook[pair].asks[n - 1];
            var second = orderBook[pair].asks[n - 2];
            var third = orderBook[pair].asks[n - 3];

            var firstPrice = first[0] * 1;
            var secondPrice = second[0] * 1;
            var thirdPrice = third[0] * 1;

            var firstVolume = first[1] * 1;
            var secondVolume = second[1] * 1;
            var thirdVolume = third[1] * 1;


            var sum = firstVolume + secondVolume + thirdVolume;
            var result = [];
            result.push(roundNumber(thirdPrice, 7));
            result.push(roundNumber(sum, 5));
            return result;

        } else {
            return [];

        }
    }


    function lastBid3(pair) {
        if (orderBook[pair].bids.length > 3) {

            var first = orderBook[pair].bids[0];
            var second = orderBook[pair].bids[1];
            var third = orderBook[pair].bids[2];

            var firstPrice = first[0] * 1;
            var secondPrice = second[0] * 1;
            var thirdPrice = third[0] * 1;

            var firstVolume = first[1] * 1;
            var secondVolume = second[1] * 1;
            var thirdVolume = third[1] * 1;

            var sum = firstVolume + secondVolume + thirdVolume;

            var result = [];
            result.push(roundNumber(thirdPrice, 7));
            result.push(roundNumber(sum, 5));
            return result;
        } else {
            return [];
        }
    }


    function getPairsForDeal(deal) {
        var result = [];
        result.push([1, 2, 3]);

        if (deal.length === 4 && deal[0] != undefined) {

            pair1 = deal[1] + "_" + deal[0];
            pairReverse1 = deal[0] + "_" + deal[1];
            if (doesinclude(allTickers, pair1)) {

                tmp = [];
                tmp.push('BUY');
                tmp.push(pair1)

                tmp.push(lastAsk(pair1));
                tmp.push(lastAsk2(pair1));
                tmp.push(lastAsk3(pair1));
                result.push(tmp);
            } else if (doesinclude(allTickers, pairReverse1)) {
                tmp = [];
                tmp.push('SELL');
                tmp.push(pairReverse1);

                tmp.push(lastBid(pairReverse1));
                tmp.push(lastBid2(pairReverse1));
                tmp.push(lastBid3(pairReverse1));


                result.push(tmp);
            }

            pair2 = deal[2] + "_" + deal[1];
            pairReverse2 = deal[1] + "_" + deal[2];
            if (doesinclude(allTickers, pair2)) {
                tmp = [];
                tmp.push('BUY');
                tmp.push(pair2);

                tmp.push(lastAsk(pair2));
                tmp.push(lastAsk2(pair2));
                tmp.push(lastAsk3(pair2));

                result.push(tmp);
            } else if (doesinclude(allTickers, pairReverse2)) {
                tmp = [];
                tmp.push('SELL');
                tmp.push(pairReverse2);

                tmp.push(lastBid(pairReverse2));
                tmp.push(lastBid2(pairReverse2));
                tmp.push(lastBid3(pairReverse2));


                result.push(tmp);
            }

            pair3 = deal[3] + "_" + deal[2];
            pairReverse3 = deal[2] + "_" + deal[3];
            if (doesinclude(allTickers,pair3)) {
                tmp = [];
                tmp.push('BUY');
                tmp.push(pair3);

                tmp.push(lastAsk(pair3));
                tmp.push(lastAsk2(pair3));
                tmp.push(lastAsk3(pair3));



                result.push(tmp);
            } else if (doesinclude(allTickers, pairReverse3)) {
                tmp = [];
                tmp.push('SELL');
                tmp.push(pairReverse3);

                tmp.push(lastBid(pairReverse3));
                tmp.push(lastBid2(pairReverse3));
                tmp.push(lastBid2(pairReverse3));
                result.push(tmp);
            }
            mylog(result);
            return result;

        } else {
            var falseresult = [2, 2, 2];
            return falseresult;
        }

    }
}

function doesinclude(res,pair){
    var result = false;
    Object.keys(res).forEach(function(key) {
        if (key === pair) {
            result =  true;
        }
    });
    return result;
}

function mylog(input){
    //console.log(input);
}