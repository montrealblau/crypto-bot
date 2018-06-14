exports.strategy = function(json, fees, next, arb, sellAt, coinQuantity, tradeingExchange, compareTo,lastN,learned,func,func2) {


    var time = 0;
    var counter = 0;
    var profit = [];
    var counterA = 0
    var counterB = 0;
    var sellfee = fees[tradeingExchange].sell;
    var buyfee = fees[tradeingExchange].buy;
    var tmpresult = {};

    for (var i = 0 + lastN; i < json.length - next; i++) {
        if (json[i].hasOwnProperty('time') && json[i + next].hasOwnProperty('time')) {
            if (json[i].time > time) {
                var timeNow = json[i].time;
                var timeNext = json[i + next].time;

                var buyPrice = json[i].data[tradeingExchange].buy;
                var sellPrice = json[i].data[tradeingExchange].sell;
                var sellPriceNext = json[i + next].data[tradeingExchange].sell;

                if (compareTo === 'all') {
                    var otherMarketsSellPrice = 0;
                    var markets = 0;
                    for (var key in json[i].data) {
                        if (key !== tradeingExchange) {
                            markets = markets + 1;
                            otherMarketsSellPrice = otherMarketsSellPrice + json[i].data[key].sell;
                        }
                    }
                    var otherMarketsSellPrice = otherMarketsSellPrice / markets;
                } else {
                    var otherMarketsSellPrice = json[i].data[compareTo].sell;
                }
                
                var lastAverage = [];

                for (let n = 0; n <= lastN; n++) {
                    lastAverage[n] = json[i-lastN+n].data[tradeingExchange].buy;
                }
                    var buySignalObject = {
                        otherMarketsSellPrice:otherMarketsSellPrice,
                        buyPrice:buyPrice,
                        arb:arb,
                        lastAverage:lastAverage
                    };

                    var buySignal = func(buySignalObject);
                    //var buySignal = buySignal(lastAverage);
                if (buySignal) {
                    counter++;
                    var tmpProfit = 0;
                    var periodsToCompleateDeal = i + next;
                    var test = buyPrice * sellAt;
                    tmpProfit = sellPriceNext * sellfee - buyPrice*buyfee;
                    counterA++;
                    if (learned) {
                    tmpresult[timeNow] = {
                        buy: true,
                        sell: false,
                        price: buyPrice,
                        quantity: null,
                        profit: null,
                        id: timeNow,
                        before: null
                    };
                    tmpresult[timeNext] = {
                        buy: false,
                        sell: true,
                        price: sellPriceNext,
                        quantity: null,
                        profit: tmpProfit,
                        id: timeNow,
                        before: false
                    };
                    }


                    endedBefore = false;



                    for (var j = i + 1; j <= periodsToCompleateDeal; j++) {
                        var futureSellPrice = json[j].data[tradeingExchange].sell;
                        var sellBoolean = func2(test, futureSellPrice);

                        if (sellBoolean) {
                            counterB++
                            counterA--;
                            tmpProfit = buyPrice * sellAt * sellfee - buyPrice * buyfee;
                            if (learned) {
                            delete tmpresult[timeNext];
                            var timeNext2 = json[j].time;
                            tmpresult[timeNext2] = {
                                buy: false,
                                sell: true,
                                price: futureSellPrice,
                                quantity: null,
                                profit: tmpProfit,
                                id: timeNow,
                                before: true
                            };
                            }

                            endedBefore = true;
                            i = j;
                            break;
                        }
                    }
                    profit.push(tmpProfit * coinQuantity);
                    if (!endedBefore) {
                        i = i + next;
                    }
                }
            }
        }
    }
    if (profit.length > 0) {
        if (learned) {
        return [profit, next, counterA, counterB, counter, lastN, tmpresult];
        }
        
        return [profit, next, counterA, counterB, counter, lastN, false];

    } else {
        return false;
    }
}












