var check = require('./checkStrategy.js');
var files = require('./Controllers/FilesPromise.js');
var asTable = require('as-table').configure({
    delimiter: ' | '
});
var random = require("random-js")();

exports.do = function(variables){
    files.getFile(variables.url).then(function(data){
          var json = JSON.parse(data);
            for (var a = 0; a < variables.tradeingExchanges.length; a++) {
                var tradeingExchange = variables.tradeingExchanges[a];
                for (var b = 0; b < variables.compareTos.length; b++) {
                    var compareTo = variables.compareTos[b];
                    console.log(tradeingExchange,compareTo);
                    var answer = [];
                    if (!variables.learned.bool) {
                    for (var i = 0; i < variables.learnN; i++) {
                        var option = learn(json, variables.minProfit, variables.maxStDev, variables.timeInterval, variables.arbInterval, variables.sellAtProfitInterval, variables.coinQuantity, tradeingExchange, compareTo, variables.actionTime, variables.coinPrice, variables.abRatio, variables.maxVolume, variables.precision, variables.minProfitH, variables.lastNinterval,variables);
                        if (option != false) {
                            answer.push(option[0]);
                        }
                    }
                    }else{
                        var option = learn(json, variables.minProfit, variables.maxStDev, variables.timeInterval, variables.arbInterval, variables.sellAtProfitInterval, variables.coinQuantity, tradeingExchange, compareTo, variables.actionTime, variables.coinPrice, variables.abRatio, variables.maxVolume, variables.precision, variables.minProfitH, variables.lastNinterval,variables);                  
                        answer.push(option[0]);
                        var actions = JSON.stringify(option[1]);
                        var actionsurlArr = variables.url.split('.');
                        console.log(actionsurlArr);

                        var actionsurl = '.'+actionsurlArr[1]+'_actions.'+actionsurlArr[2];

                        files.postFile(actionsurl, actions).then(function(res){
                            console.log('ok! ',res);
                        },function(err){console.log(err);})
                    }
                    answer.sort(function(a, b) {
                        return b.profit - a.profit
                    });
                    if (answer[variables.resultCount] === undefined) {
                        console.log(asTable(answer));
                    }else{
                        var tmpAnswers = [];
                    for (var i = 0; i < variables.resultCount; i++) {
                        tmpAnswers.push(answer[i]);
                    }
                      answer = tmpAnswers;
                      console.log(asTable(answer));
                    }
                }
            }
    },function(err){console.log(err);});
}


function learn(json, minProfit, maxStDev, timeInterval, arbInterval, sellAtProfitInterval, coinQuantity, tradeingExchange, compareTo, actionTime, coinPrice, abRatio, maxVolume, precision, minProfitH, lastNinterval,variables) {
                
    var tmp = {
        profit: null,
        avgProfit: null,
        stDev: null,
        arb: null,
        sellAt: null,
        next: null,
        a: null,
        b: null,
        totalActions: null,
        hourlyVolume: null,
        hourlyProfit: null
    };


    if (!variables.learned.bool) {
    var next = random.integer(variables.timeInterval[0], variables.timeInterval[1]); // var time 	= 10;      // apmeram pec 3 minutem pardot ja nesekmigi sasniegts slieksnis 
    var arb = random.real(variables.arbInterval[0], variables.arbInterval[1]); // var arb  	= 1.002;   // arbitražas skaitlis, jeb cik dziļi iekritis minusaa/ uzceelies pret otru                         
    var sellAt = random.real(variables.sellAtProfitInterval[0], variables.sellAtProfitInterval[1]); // var sellAt	= 1.005;   // pie kada profita ielikts sell orderis, kam jaizpildaas liidz taam 3 minuteem
    var lastN = random.integer(variables.lastNinterval[0], variables.lastNinterval[1]);       
    }else{
    var next = variables.learned.next;
    var arb = variables.learned.arb;
    var sellAt = variables.learned.sellAt;
    var lastN = variables.learned.lastN;
    }

    var data = check.strategy(json,variables.fees, next, arb, sellAt, variables.coinQuantity, tradeingExchange, compareTo,lastN, variables.learned.bool ,variables.buySignal, variables.sellSignal);

    if (data !== false) {

        var length = data[0].length;
        var profitSum = data[0].reduce((x, y) => x + y);
        var profitMean = profitSum / length;
        var variancesArr = data[0].map(x => Math.pow((x - profitMean), 2));
        var variance = variancesArr.reduce((x, y) => x + y) / length;
        var stDev = Math.sqrt(variance);

        var totalTime = (json.length * actionTime) / 60; //h
        var hourlyVolume = (coinPrice * coinQuantity * data[4]) / totalTime;
        var hourlyProfit = (profitSum * coinPrice) / totalTime;
        //var ab = data[3] / data[2];
        var actionsJson = data[6];

        tmp.tradeingExchange = tradeingExchange;
        tmp.compareTo = compareTo;
        tmp.coinQuantity = coinQuantity;
        tmp.profit = roundNumber(profitSum, precision);
        tmp.avgProfit = roundNumber(profitMean, precision);
        tmp.stDev = roundNumber(stDev, precision);
        tmp.arb = roundNumber(arb, precision);
        tmp.sellAt = roundNumber(sellAt, precision);
        tmp.next = roundNumber(next, precision);
        tmp.a = roundNumber(data[2], precision);
        tmp.b = roundNumber(data[3], precision);
        tmp.totalActions = roundNumber(data[4], precision);
        tmp.hourlyVolume = roundNumber(hourlyVolume, precision);
        tmp.hourlyProfit = roundNumber(hourlyProfit, precision);
        tmp.lastN = data[5];
    }

    if (tmp.profit > minProfit && tmp.stDev < maxStDev && hourlyVolume < maxVolume && hourlyProfit > minProfitH) {
        return [tmp,'a'];
    } else {
        if (variables.filterOff) {
            return [tmp,actionsJson];
        }
        return false;
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