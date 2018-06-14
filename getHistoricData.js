// const Gdax = require('gdax');
// const publicClient = new Gdax.PublicClient();




// publicClient.getProductHistoricRates('ETH-BTC',{ start: "2018-01-06T10:34:47.123456Z", end: "2018-02-06T10:34:47.123456Z", granularity: 21600 }).then(data => {
// 	console.log(data);
// }).catch(error => {
// 	console.log(error);
// });


var ccxt = require ('ccxt')

//console.log (ccxt.exchanges)

let exchange = new ccxt.gdax ()







console.log( exchange.fetchOHLCV ('ETH/BTC', '1m'))