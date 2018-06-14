var show = require('./showStrategy.js');
var sample = require('./sample.js');

var settings = {
    minProfitH: 0,               // minimalais profits visaa Datu laikaa
    maxStDev: 80,                // katra deala novirze pelnaa pamata paara cenaa
    abRatio: 0,                  // cik procentiem minimums jabut izdariitiem pirms intervala beigaam
    coinQuantity: 1,             // moneetas daudzums dealaa
    coinPrice: 10000,             // pamata paara cena
    maxVolume: 100000,             // /h
    minProfit: 0.1,
    filterOff: true,
    learned: {
        bool: true,
        next: 10,
        arb: 1.0005,
        sellAt: 1.0005,
        lastN: 2
    },
    tradeingExchanges: ['gdax'],
    compareTos: ['binance'],      // all or specific market;
    fees: {
        gdax: {
            buy: 1,
            sell: 1
        },
        gate: {
            buy: 1,
            sell: 1
        },
        kraken: {
            buy: 1,
            sell: 1
        },
        binance: {
            buy: 1,
            sell: 1
        }
    },
    timeInterval: [4, 15],      // 2.5 - 10 min
    arbInterval: [1, 1.02],
    sellAtProfitInterval: [1.01, 1.05],
    actionTime: 0.5, //min
    precision: 4,
    learnN: 5000,
    resultCount: 5,
    lastNinterval: [2, 8],
    url: './www/historical/eth_btc1.json',
    buySignal: function(buySignalObject) {
        var lastAverage = buySignalObject.lastAverage;
        // arraof lastN buy prices;

        var citaTirgusCena = buySignalObject.otherMarketsSellPrice;
        var cena = buySignalObject.buyPrice;
        var arb2otherMarket = buySignalObject.arb;

        var arbitrage = citaTirgusCena / cena;

        if (arbitrage >= arb2otherMarket) {
            return true;
        } else {
            return false;
        }
    },
    sellSignal: function(buyPriceTimessellAt, futureSellPrice) {

        // buyPriceTimessellAt = buyPrice * sellAt
        // futureSellPrice = json[j].data[tradeingExchange].sell;
        //   from i to periodsToCompleateDeal
        //   periodsToCompleateDeal = i + next;
        //   next = timeInterval

        //future sell price iet cauri nakotnes cenaam// next, mainiigais
        //buyPriceTimessellAt scalping, take profit


        if (buyPriceTimessellAt < futureSellPrice) {
            console.log('true');
            return true;
        } else {
            return false;
        }
    }
}
show.do(settings);

// function buySignal(lastAverage){
// //1 augošs
// //-1 dilstošs
// //false nesakartots
// var descending = lastAverage.isSorted();
// return (descending === 1) ? true : false;
// }


//1 augošs
//-1 dilstošs
//false nesakartots


// buySignal(buySignalObject)
// { otherMarketsSellPrice: 828.63905,
//   buyPrice: 829.72841,
//   arb: 1.0005,
//   lastAverage: //lastN
//    [ 829.65,
//      829.64981,
//      829.64836,
//      829.62966,
//      829.65,
//      829.65,
//      829.72841 ] }

//console.log(buySignalObject);
Array.prototype.isSorted = function() {
    return (function(direction) {
        return this.reduce(function(prev, next, i, arr) {
            if (direction === undefined)
                return (direction = prev <= next ? 1 : -1) || true;
            else
                return (direction + 1 ?
                    (arr[i - 1] <= next) :
                    (arr[i - 1] > next));
        }) ? Number(direction) : false;
    }).call(this);
}



//var url = './www/data.json';



// var tradeingExchanges = ['gdax','gate','kraken','binance'];
// var compareTos = ['all','gdax','gate','kraken','binance']; // all or specific market;