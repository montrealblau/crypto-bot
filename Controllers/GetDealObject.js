var settings = require('../settings/settings');
var trades = require('./DealConstructor');

var paris = settings.paris;
var minrequired = settings.minrequired;
var maxrequired = settings.maxrequired;
var sellFee = settings.sellFee;
var buyFee = settings.buyFee;
var realprofit = settings.realprofit;
var delta = settings.delta;
var exchange = settings.exchange;



function smallestDeal(deal) {
    var action1 = deal[1][0];
    var action2 = deal[2][0];
    var action3 = deal[3][0];

    var pair1 = deal[1][1];
    var pair2 = deal[2][1];
    var pair3 = deal[3][1];

    var price1 = deal[1][2][0];
    var price2 = deal[2][2][0];
    var price3 = deal[3][2][0];

    var baseQ1 = deal[1][2][2];
    var baseQ2 = deal[2][2][2];
    var baseQ3 = deal[3][2][2];

    var qquantiy1 = deal[1][2][1];
    var qquantiy2 = deal[2][2][1];
    var qquantiy3 = deal[3][2][1];

    var smallest = Math.min(Math.min(baseQ1, baseQ2), baseQ3);

    var multiplier1 = smallest / baseQ1;
    var multiplier2 = smallest / baseQ2;
    var multiplier3 = smallest / baseQ3;

    var Q1adjusted = qquantiy1 * multiplier1;
    var Q2adjusted = qquantiy2 * multiplier2;
    var Q3adjusted = qquantiy3 * multiplier3;

    if (action1 === 'BUY' && action2 === 'SELL' && action3 === 'BUY') {

        if (multiplier1 === 1) {
            var quantiy1 = qquantiy1;
            var quantiy2 = qquantiy1 / (1 + sellFee);
            var receive2 = quantiy2 * price2;
            var quantiy3 = (receive2 / (1 + sellFee)) / price3;

            var spent = quantiy1 * price1 * (1 + buyFee);
            var received = quantiy3;
            var profit = received / spent;

            var delta = received - spent;
        }
        if (multiplier2 === 1) {
            var quantiy1 = Q2adjusted; //jo buy->sell vienmer 1 - A_x  2 - A_y
            var quantiy2 = qquantiy2 / (1 + sellFee); // jo miltiplier 1 tatad dotais daudzums ari ir jaizmanto minus fee
            var receive2 = quantiy2 * price2; // tas ko otraja dīlā saņems bez komisijas 
            var quantiy3 = (receive2 / (1 + sellFee)) / price3; // atņem komisiju uz izrekina cik daudz sanak izdalot ar cenu

            var spent = quantiy1 * price1 * (1 + buyFee);
            var received = quantiy3;
            var profit = received / spent;

            var delta = received - spent;

        }
        if (multiplier3 === 1) {
            // ejam atpakaļgaitaa no pedeja deala daudzuma
            var quantiy3 = Q3adjusted;
            var receive2 = quantiy3 * price3 * (1 + sellFee);
            var quantiy2 = (receive2 / price2);
            var quantiy1 = (receive2 / price2) * (1 + sellFee);

            var spent = quantiy1 * price1 * (1 + buyFee);
            var received = quantiy3;
            var profit = received / spent;

            var delta = received - spent;

        }


    }
    if (action1 === 'BUY' && action2 === 'SELL' && action3 === 'SELL') {

        if (multiplier1 === 1) {
            var quantiy1 = qquantiy1;
            var quantiy2 = quantiy1 / (1 + sellFee);

            var receive2 = quantiy2 * price2;

            var quantiy3 = (receive2 / (1 + sellFee)) * price3;
            var spent = quantiy1 * price1 * (1 + buyFee);
            var received = quantiy3;
            var profit = received / spent;
        }
        if (multiplier2 === 1) {

            var quantiy1 = qquantiy2;
            var quantiy2 = quantiy1 / (1 + sellFee);

            var receive2 = quantiy2 * price2;
            var quantiy3 = receive2 / (1 + sellFee);

            var spent = quantiy1 * price1 * (1 + buyFee);
            var received = quantiy3 * price3;
            var profit = received / spent;

            var delta = received - spent;

        }
        if (multiplier3 === 1) {

            var quantiy3 = Q3adjusted;
            var quantiy2 = quantiy3 * (1 + sellFee) / price2;
            var quantiy1 = quantiy2 * (1 + sellFee);

            var spent = quantiy1 * price1 * (1 + buyFee);
            var received = quantiy3 * price3;
            var profit = received / spent;

            var delta = received - spent;


        }




    }

    if (action1 === 'SELL' && action2 === 'SELL' && action3 === 'BUY') {

        if (multiplier1 === 1) {

            var quantiy1 = qquantiy1;
            var quantiy2 = quantiy1 * price1 / (1 + sellFee);

            var receive2 = quantiy2 * price2;
            var quantiy3 = (receive2 / (1 + sellFee)) / price3;

            var spent = quantiy1 * (1 + buyFee);
            var received = quantiy3;
            var profit = received / spent;

            var delta = received - spent;
        }
        if (multiplier2 === 1) {

            var quantiy2 = qquantiy2; //+

            var quantiy1 = (quantiy2 * (1 + sellFee)) / price1; //+

            var received = quantiy2 * price2;

            var quantiy3 = (received / (1 + buyFee)) / price3; //

            var spent = quantiy1 * (1 + buyFee);
            var received = quantiy3;
            var profit = received / spent;

            var delta = received - spent;

        }
        if (multiplier3 === 1) {

            var quantiy3 = Q3adjusted;
            var receive2 = quantiy3 * price3;
            var quantiy2 = (receive2 / price3) * (1 + sellFee);
            var quantiy1 = quantiy2 * (1 + sellFee);
            var spent = quantiy1 * (1 + buyFee);
            var received = quantiy3;
            var profit = received / spent;
            var delta = received - spent;
        }

    }

    var timestamp = new Date().getTime();
    var tmpid = pair1+pair2+pair3;
    return {
        info: {
            tmpid: tmpid,
            profit: profit,
            delta: delta,
            timestamp: timestamp,
            required: spent,
            status: 0
        },
        step1: {
            task: action1,
            pair: pair1,
            price: price1,
            quantiy: quantiy1,
            StartQuantiy: quantiy1,
            // quotequantiy: qquantiy1,
            // quantiyAdj: Q1adjusted,
            quantiyBase: baseQ1,
            // multiplier: multiplier1,
            atempt: 0,
            time: null,
            id: null,
            status: null,
            cancel: false

        },
        step2: {
            task: action2,
            pair: pair2,
            price: price2,
            quantiy: quantiy2,
            StartQuantiy: quantiy2,
            // quotequantiy: qquantiy2,
            // quantiyAdj: Q2adjusted,
            quantiyBase: baseQ2,
            // multiplier: multiplier2,
            atempt: 0,
            time: null,
            id: null,
            status: null,
            cancel: false
        },
        step3: {
            task: action3,
            pair: pair3,
            price: price3,
            quantiy: quantiy3,
            StartQuantiy: quantiy3,
            // quotequantiy: qquantiy3,
            // quantiyAdj: Q3adjusted,
            quantiyBase: baseQ3,
            // multiplier: multiplier3,
            atempt: 0,
            time: null,
            id: null,
            status: null,
            cancel: false
        }
    };

}


// check for balance
// execute if available
// execute smaller amount

// settings:
// execute % no deala
// execute % buy sell cenas izmaiņas

// whait till done
// each minute decrease price 0.1%
// after 4 min if not ok, forget keef on going


// var date = new Date();
// console.log(date);



// trades.get(exchange, paris, minProfit, maxProfit, function(res){
//  console.log(res);
// });

function getDealObjects(res) {
    return new Promise(function(resolve, reject) {
        var deals = [];
        if (res.length > 0) {
            for (i = 0; i < res.length; i++) {
                var deal = smallestDeal(res[i]);
                if (deal.info.profit > realprofit && deal.info.delta > delta && deal.info.required > minrequired && deal.info.required < maxrequired) {
                    deals.push(deal);
                }
            }
            resolve(deals);
        } else {
            reject('nav jaunu deals');
        }
    });
}

function getAllData(exchange, paris) {
    return new Promise(function(resolve, reject) {
        trades.get(exchange, paris, function(res) {
            if (res.length > 0) {
                return resolve(res);
            }
            return reject('nav dealu');
        });

    });
}



exports.data = function(callback) {
    getAllData(exchange, paris).then(function(res) {
        getDealObjects(res).then(function(deals) {
            callback(deals);
        }, function(err) {  
            console.log('rejected->',err);
            callback(false);
        });

    }, function(err) {
        console.log('rejected->',err);
        callback(false);
        
    });
}



