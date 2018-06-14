var files = require('./FilesPromise.js');

// TO DO />
// vajag atstat karajoties gaisaa orderus, kas bija neveiksmiigi ielikti, varbūut noapaļošana or smth.... ?
// peec callbacka updateot dealus

exports.do = function(){
    return new Promise(function(resolve, reject) {
        // return new Promise(function(resolve, reject) {
        files.getFile('./JSON/deals.json', ).then(function(res) {
            // toPlaceOrder atgriez visus pirmos solus no dealiem, kuriem status ir 0,2,4
            var toDos = toDeleteCompeletedOrder(JSON.parse(res));

            if (toDos.length > 0) {
                var updatedDeals = JSON.stringify(updateStatus(JSON.parse(res), toDos));
                files.postFile('./JSON/deals.json', updatedDeals).then(function(res) {
                    files.getFile('./JSON/history.json' ).then(function(res) {
                        var history = JSON.parse(res);
                        var save = history.concat(toDos);

                        files.postFile('./JSON/history.json', JSON.stringify(save)).then(function(res) {
                            print('apvienoti un saglabati vecie deali');
                        },function(err){
                            print('nevareju saglabaat history failu',err);
                        });
                    },function(err){
                        print('nesanemu history failu',err);
                    });
                    resolve(true);
                }, function(err) {
                    print('nesanaca updateot dealu failu, callbacks asinhronajam dealu veiceejam!', err);
                });
            } else {
                print('nav dealu ar stausu 6, tapec izlaista darbiba');
                resolve(false);
            }

        }, function(err) {
            reject(err);
        });
    });
}

function toDeleteCompeletedOrder(deals) {
    var result = [];
    deals.forEach(function(item, index) {

        var toDo = {
            id: null,
            time: null,


            task1: null,
            step1: null,
            time1: null,
            atempts1: null,

            task2: null,
            step2: null,
            time2: null,
            atempts2: null,

            task3: null,
            step3: null,
            time3: null,
            atempts3: null
        };

        if (item.info.status === 6) {

            toDo.id = item.info.tmpid;
            toDo.time = item.info.timestamp;
            toDo.profit = item.info.profit;
            toDo.delta = item.info.delta;

            toDo.task1 = item.step1.task;
            toDo.step1 = item.step1.pair;
            toDo.time1 = item.step1.time - item.info.timestamp;
            toDo.atempts1 = item.step1.atempt;

            toDo.task2 = item.step2.task;
            toDo.step2 = item.step2.pair;
            toDo.time2 = item.step2.time - item.info.timestamp;
            toDo.atempts2 = item.step2.atempt;

            toDo.task3 = item.step3.task;
            toDo.step3 = item.step3.pair;
            toDo.time3 = item.step3.time - item.info.timestamp;
            toDo.atempts3 = item.step3.atempt;

            result.push(toDo);
        }
    })
    return result;
}

function updateStatus(res, done) {
    res.forEach(function(responseitem,index, array) {
        done.forEach(function(doneitem) {
            if (doneitem.id === responseitem.info.tmpid) {
                print('izsauca');
                array.splice(index);
            }
        });
    });
    return res;
}

function asyncLoop(arr, functionToLoop, callback) {
    var i = -1;
    var done = [];
    

    function loop(z) {

        if (z != undefined ) {
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