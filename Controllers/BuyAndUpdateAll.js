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
            var toDos = toPlaceOrder(JSON.parse(res));
            if (toDos.length > 0) {
                print('toDos---->', toDos);
                // izpilda atkartoti katru asinhrono darbiibu ar katru no elementiem no pirmaa parametra Array'a ;)
                // beigas atgriez callbacku, kas iedot visus solus(=== ievaddatus), kurus tikko veiksmigi izpildija,
                // ja neveiksmigi izveidots orders, tad throw error, bet kad sapratisu kados gadijumos ir error, tad varesi te atstat kkadus orderus gaisaa karaajamies
                asyncLoop(toDos, function functionToLoop(loop, i) {
                        var toDo = toDos[i];

                        var type = toDo.task;
                        var pair = toDo.pair;
                        var amount = toDo.amount;
                        var rate = toDo.rate;
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

                        trade.placeOrder(exchange, type, amount, pair, rate, null, data, function(res) {
                            

                            if (res.success) {
                                data.placed = true;
                                print('orders veikts');

                                //tmp.push(data);
                                //Paziņot kka atpakaļ failam, ka ir pending....
                                //print(res);

                                // ***  vai japarbauda order nr ?
                                 data.ordernumber = res.id;
                        
                                loop(data); //atgriezam rekursiivajai funkcijai datus, par to, kurs solis tika izdariits veiksmiigi, lai pectam callbackaa vini visi paraadiitos

                            } else if (res.success === false && res.code == 21) {
                                data.placed = false;
                                data.code = 21;
                                loop(data);
                                
                                // reject('nesanaca ielikt orderi');
                                // throw new Error('neizdevas veikt orderi');
                            }
                        });

                    },
                    // CALLBACKS PEEC ATTIECIIGAA STEPA ORDERU IZDARISHANAS, JA DELAM IR STATUS 0 2 4 UN 1 2 3 STEPAM STATUS == 0 
                    function callback(a) {

                        var updatedDeals = JSON.stringify(updateStatus(JSON.parse(res), a));
                        files.postFile('./JSON/deals.json', updatedDeals).then(function(res) {
                            resolve(true);
                        }, function(err) {
                            print('nesanaca updateot dealu failu, callbacks asinhronajam dealu veiceejam!', err);
                        });
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

function toPlaceOrder(deals) {
    var result = [];
    deals.forEach(function(item, index) {

        var toDo = {
            id: null,
            step: null,
            task: null,
            pair: null,
            rate: null,
            amount: null,
            placed: null
        };

        if (item.info.status === 0) {
            toDo.id = item.info.tmpid;
            toDo.step = "step1";
            toDo.task = item.step1.task,
            toDo.pair = item.step1.pair;
            toDo.rate = item.step1.price;
            toDo.amount = item.step1.quantiy;
            toDo.ordernumber = null;
            result.push(toDo);
        } else if (item.info.status === 2) {
            toDo.id = item.info.tmpid;
            toDo.step = "step2";
            toDo.task = item.step2.task,
            toDo.pair = item.step2.pair;
            toDo.rate = item.step2.price;
            toDo.amount = item.step2.quantiy;
            toDo.ordernumber = null;
            result.push(toDo);
        } else if (item.info.status === 4) {
            toDo.id = item.info.tmpid;
            toDo.step = "step3";
            toDo.task = item.step3.task,
            toDo.pair = item.step3.pair;
            toDo.rate = item.step3.price;
            toDo.amount = item.step3.quantiy;
            toDo.ordernumber = null;
            result.push(toDo);
        }
    })
    return result;
}

function updateStatus(res, done) {
    res.forEach(function(responseitem) {
        done.forEach(function(doneitem) {
            if (doneitem.id === responseitem.info.tmpid) {
                //console.log(doneitem);
                if(doneitem.placed === true || doneitem.placed === "true"){
                    //console.log('teee????');
                    var time0 = new Date().getTime();
                    var step = doneitem.step;
                    responseitem[step].status = 1;
                    responseitem[step].id = doneitem.ordernumber;
                    responseitem.info.status = responseitem.step1.status + responseitem.step2.status + responseitem.step3.status;
                    responseitem[step].time = time0;
                }else if(doneitem.placed === false && doneitem.code == 21){
                    var step = doneitem.step;
                    responseitem[step].quantiy = responseitem[step].quantiy/settings.quantityAdjuster;
                }else if (doneitem.placed === false && doneitem.code == 20){
                        console.log('Your order size is too small, didn not Place Order');
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
