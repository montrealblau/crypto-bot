var files = require('./Controllers/FilesPromise.js');
var UpdateAccountBalance = require('./Controllers/UpdateAccountBalance.js');

UpdateAccountBalance.do().then(function(res) {
  console.log('balances updated', res);

  files.getFile('./JSON/balance.json',).then(function(res){
    profit(JSON.parse(res));
  },function(err){console.log(err);});
  
}, function(err) {
  console.log('~~~!', err);
});


var assets =
[["REP",10],
["ETH",10],
["USDT",10],
["DATA",10],
["ZPT",10],
["DGD",10],
["MKR",10],
["BTC",10],
["TNC",10],
["DPY",10],
["FUN",10],
["XRP",10],
["JNT",10],
["BCDN",10],
["MOBI",10],
["GTC",10],
["DRGN",10],
["LEND",10],
["MED",10],
["OCN",10],
["ETC",10],
["BNTY",10],
["EOS",10],
["QASH",10],
["NAS",10],
["BTO",10],
["VEN",10],
["BTM",10],
["LRC",10],
["PST",10],
["TIO",10],
["INK",10],
["ZRX",10],
["MTN",10],
["DDD",10],
["WAVES",10],
["TSL",10],
["QTUM",10],
["QLC",10]];




function profit(balances){
  //for (var i = 0; i < balances.length; i++) {
      for (var i = balances.length; i >= 0; i--) {
    if (balances[0] != undefined && balances[i] != undefined) {
        //var assets = [['ETH',822],['BTC',8500],['USDT',1]];
       // var assets = [['ETH',822],['USDT',1]];
        var deltaTime = Math.round(10*(balances[i].time-balances[0].time)/1000/60/60)/10;

      for (var j = 0; j < assets.length; j++) {
          var a = 0;
          if (balances[i].available[assets[j][0]] != undefined ){
            a = balances[i].available[assets[j][0]];
          }
          var b = 0;
          if (balances[0].available[assets[j][0]] != undefined ){
            b = balances[0].available[assets[j][0]];
          }

          var deltaBalance = a - b;
          var log = deltaTime + " h " + Math.round(10000*deltaBalance)/10000 + " " +  assets[j][0];
          if(deltaBalance != 0){
            console.log(log);
          }
            
      }
      console.log('----------');        
    }
  }
}