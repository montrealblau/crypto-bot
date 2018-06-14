var files = require('./FilesPromise.js');
var trade = require('./ApiWrapper.js');
var settings = require('../settings/settings');
var exchange = settings.exchange;

// TO DO />
// vajag atstat karajoties gaisaa orderus, kas bija neveiksmiigi ielikti, varbūut noapaļošana or smth.... ?
// peec callbacka updateot dealus

exports.do = function(){
    return new Promise(function(resolve, reject) {
        // return new Promise(function(resolve, reject) {
        files.getFile('./JSON/deals.json', ).then(function(res) {
            // toPlaceOrder atgriez visus pirmos solus no dealiem, kuriem status ir 0,2,4
            var toDos = toCancelOrder(JSON.parse(res));
            if (toDos.length > 0) {
                print('toDos---->', toDos);
                // izpilda atkartoti katru asinhrono darbiibu ar katru no elementiem no pirmaa parametra Array'a ;)
                // beigas atgriez callbacku, kas iedot visus solus(=== ievaddatus), kurus tikko veiksmigi izpildija,
                // ja neveiksmigi izveidots orders, tad throw error, bet kad sapratisu kados gadijumos ir error, tad varesi te atstat kkadus orderus gaisaa karaajamies
                asyncLoop(toDos, function functionToLoop(loop, i) {

                        var toDo = toDos[i];

                        var ordernumber = toDo.ordernumber;
                        var pair = toDo.pair;
                        var data = toDo;
                        var tmp = [];
                        
                        // * placeOrder *
                        // exchange, type, amount, pair, rate, opt, data, callback
                        // exchane no settings
                        // type BUY/SELL
                        // pair eth_usdt
                        // rate 0.11
                        // opt market/limit..... gate.io nepiedava, citi ganjau piedavas ;)
                        // data, vnk tas, pec ka tika veikts orders, un ja veiksmigi, tad tie pasi dati tiek atgriesti atpakaļ, ka izdariti

                        trade.cancelThisOrder(exchange, ordernumber, pair, data, function(res) {
                            
                            if (res.success || res.success === true || res.success === 'true') {
                                data.canceled = true;
                                print('orders cancelots');
                        
                                loop(data); //atgriezam rekursiivajai funkcijai datus, par to, kurs solis tika izdariits veiksmiigi, lai pectam callbackaa vini visi paraadiitos

                            } else if (res.success === false || res.success === 'false') {
                                data.canceled = false;
                                print('so te neizdevaas cancelot - > ', res);
                                loop();
                                print('orders not cancelots');
                                
                                // reject('nesanaca ielikt orderi');
                                // throw new Error('neizdevas veikt orderi');
                            }
                        });

                    },
                    // CALLBACKS PEEC ATTIECIIGAA STEPA ORDERU IZDARISHANAS, JA DELAM IR STATUS 0 2 4 UN 1 2 3 STEPAM STATUS == 0 
                    function callback(a) {
                            // Ja izdevaas kko cancelot
                        if (a.length > 0) {
                            var updatedDeals = JSON.stringify(updateStatus(JSON.parse(res), a));
                            files.postFile('./JSON/deals.json', updatedDeals).then(function(res) {
                                resolve([true,a.length]);
                            }, function(err) {
                                print('nesanaca updateot dealu failu, callbacks asinhronajam dealu veiceejam!', err);
                            });
                        }
                    });
            } else {
                print('nav dealu ar stausu 0 2 4, tapec izlaista darbiba');
                resolve(false);
            }

        }, function(err) {
            reject(err);
        });
    });
}

function toCancelOrder(deals) {
    var result = [];
    deals.forEach(function(item, index) {
        var toDo = {
            id: null,
            step: null,
            pair: null,
            canceled: false,
            ordernumber: null
        };

        if (item.info.status === 1) {
            toDo.id = item.info.tmpid;
            toDo.step = "step1";
            toDo.pair = item.step1.pair;
            toDo.canceled = false;
            toDo.ordernumber = item.step1.id;
            if (item.step1.cancel || item.step1.cancel == true || item.step1.cancel == "true" ) {
                result.push(toDo);
            }          
        } else if (item.info.status === 3) {
            toDo.id = item.info.tmpid;
            toDo.step = "step2";
            toDo.pair = item.step2.pair;
            toDo.canceled = false;
            toDo.ordernumber = item.step2.id;
            if (item.step2.cancel || item.step1.cancel == true || item.step1.cancel == "true" ) {
                result.push(toDo);
            }   
        } else if (item.info.status === 5) {
            toDo.id = item.info.tmpid;
            toDo.step = "step3";
            toDo.pair = item.step3.pair;
            toDo.canceled = false;
            toDo.ordernumber = item.step3.id;
            if (item.step3.cancel || item.step1.cancel == true || item.step1.cancel == "true" ) {
                result.push(toDo);
            }   
        }
    })
    return result;
}

function updateStatus(res, done) {
    res.forEach(function(responseitem) {
        done.forEach(function(doneitem) {
            if (doneitem.id === responseitem.info.tmpid) {
                if(doneitem.canceled === true){
                    var step = doneitem.step;
                    responseitem[step].cancel = false;
                    responseitem[step].id = null;
                    responseitem[step].status = 0;
                    responseitem.info.status = responseitem.info.status * 1 - 1;
                }
            }
        });
    });
    return res;
}

function asyncLoop(arr, functionToLoop, callback) {
    var i = -1;
    var done = [];

    function loop(z) {
        if (z != undefined) {
            done.push(z);
        }

        i++;
        if (i == arr.length) {
            print('done --->', done);
            callback(done);
            return;
        }
        functionToLoop(loop, i);
    }
    loop();
}
function print(msg){
    //console.log(msg);
}
