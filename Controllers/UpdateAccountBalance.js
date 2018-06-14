var files = require('./FilesPromise.js');
var trade = require('./ApiWrapper.js');
var settings = require('../settings/settings');
var exchange = settings.exchange;


exports.do = function(){
    return new Promise(function(resolve, reject) {
        try {
            trade.getAccountBalance(exchange, function(res) {
                var balance = JSON.parse(res.response);
                var time = new Date().getTime();
                balance.time = time;
                files.getFile('./JSON/balance.json').then(function(res){

                 var allBalances = JSON.parse(res);
                 allBalances.push(balance);

                 files.postFile('./JSON/balance.json', JSON.stringify(allBalances)).then(function(res) {
                    resolve(true);
                    
                 }, function(err) {
                    console.log(err);
                 });

                },function(err){
                  console.log(err);
                });
            });
        } catch (e) {
            resolve(false);
        }
    });
}
