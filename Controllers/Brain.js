exports.run = function(what, res) {

    var kanepe = matrix(res); // ARRAY  ko pa cik var nopirkt [ 'lun', 'usdt', 44.6749, 0.02238 ],[ 'lun', 'eth', 0.035829, 27.91035 ]];

    //console.log(kanepe);
    // [ 'rdn', 'usdt' ],
    // [ 'stx', 'usdt' ],
    // [ 'knc', 'usdt' ],
    // [ 'link', 'usdt' ],
    // [ 'cdt', 'usdt' ],
    // [ 'ae', 'usdt' ],
    // [ 'ae', 'eth' ],
    // [ 'cdt', 'eth' ],
    // [ 'rdn', 'eth' ],
    // [ 'stx', 'eth' ],

    function matrix(object) {
        var result = [];
        for (var prop in object) {
            if (object.hasOwnProperty(prop)) {
                var arr = [];
                arr = prop.split('_');
                //var p = object[prop].last;
                //arr.push(p);
                //var p2 = 1 / p;
                //arr.push(Math.round(p2 * 100000) / 100000);
                //console.log(arr);
                result.push(arr);
            }
        }
        return result;
    }

    function search(what) {
        var result = [];
        for (var i = 0; i < kanepe.length; i++) {
            if (kanepe[i][0] == what) {
                //console.log(kanepe[i]);
                //console.log("Par vienu "+kanepe[i][0]+" var npirkt "+kanepe[i][2]+" "+kanepe[i][1]+" ,bet par vienu "+kanepe[i][1]+" var npirkt "+ kanepe[i][3] + " " +kanepe[i][0]+" !");

                //console.log("Par vienu "+kanepe[i][0]+" var npirkt "+kanepe[i][2]+" "+kanepe[i][1]+" !");
                var tmp = [];
                tmp.push(0, kanepe[i][1]);
                result.push(tmp);
            }
            if (kanepe[i][1] == what) {
                //console.log("Par vienu "+kanepe[i][1]+" var npirkt "+kanepe[i][3]+" "+kanepe[i][0]+" !");
                var tmp = [];
                tmp.push(0, kanepe[i][0]);
                tmp.push(kanepe[i][0]);

                result.push(tmp);
            }

        }
        return result;
    }

    function brain(what) {
        var firstLevel = search(what);
        var secondLevel = [];
        var result = [];
        //console.log("Par 1 " + what + " var nopirkt visu te " + firstLevel + " !");

        for (var i = 0; i < firstLevel.length; i++) {
            var tmp = [];
            tmp.push(firstLevel[i]);
            tmp.push(search(firstLevel[i][1]));
            secondLevel.push(tmp);

            for (var j = 0; j < tmp[1].length; j++) { //nauda[8][1][0].push(search())  nauda[i][1][j][1]
                var tmp2 = [];
                tmp2.push(search(tmp[1][j][1]));
                tmp[1][j].push(tmp2);
            }
            result.push(tmp);
        }

        return result;
    }

    function arbitrage(what) {
        var nauda = brain(what);
        var result = [];
        for (var i = 0; i < nauda.length; i++) {
            var pirmais = nauda[i][0][1];
            for (var j = 0; j < nauda[i][1].length; j++) {
                if (nauda[i][1][j][1] == what) {} else {
                    var otrais = nauda[i][1][j][1];
                    for (var z = 0; z < nauda[i][1][j][2][0].length; z++) {
                        if (nauda[i][1][j][2][0][z][1] == what) {
                            var final = nauda[i][1][j][2][0][z][1];
                            //var string = what + " -> " + pirmais + "(" + pa + ") -> " + otrais + " (" + pa2 + ") " + final + "(" + finalPrice + ") " + pa * pa2 * finalPrice + " !";
                            var tmpresult = [];
                            tmpresult.push(what);
                            tmpresult.push(pirmais);
                            tmpresult.push(otrais);
                            tmpresult.push(final);
                            result.push(tmpresult);
                            // [0.98,[1,'btc'],[0.13,'btc'],[2895,'ddd'],[0.0042, 'eth']]
                            //console.log(what + " -> " + pirmais + "(" + pa + ") -> " + otrais + " (" + pa2 + ") "+ final+"("+finalPrice+") "+pa*pa2*finalPrice+" !");

                        }
                    }
                }
            }
        }

        //console.log(result);

        // [ 'eth', 'theta', 'usdt', 'eth' ],
        // [ 'eth', 'ddd', 'usdt', 'eth' ],
        // [ 'eth', 'ddd', 'btc', 'eth' ],
        // [ 'eth', 'mkr', 'usdt', 'eth' ],
        // [ 'eth', 'smt', 'usdt', 'eth' ],

        return result;
    }
    return arbitrage(what);
}