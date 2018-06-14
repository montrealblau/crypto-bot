var BuyAndUpdateAll = require('./Controllers/BuyAndUpdateAll.js');
var GetDealsAndSave = require('./Controllers/GetDealsAndSave.js');
var CheckAndUpdateAll = require('./Controllers/CheckAndUpdateAll.js');
var DeletaCompleatedDeals = require('./Controllers/DeletaCompleatedDeals.js');
var UpdateAccountBalance = require('./Controllers/UpdateAccountBalance.js');
var CancelAndUpdateAll = require('./Controllers/CancelAndUpdateAll.js');


//var Repeat = require('repeat');
/*

1) Cancel 1 orderi, ja 1 ordera izpildes laiks paarsniedz 1 min!! vai 5 meginajumus


2)
kā?
nav saacies, nav nekas no taa veel paardots,
ir saacies un dala jau ir paardota, tad cancelot un turpinaat ar nepabeigto dalu

ordera cenas un daudzuma izmainja peec base amaounta!


3) profitu saglabaat kkada citaa folderiii! no visiem botiem


6) binance sell un buy, limit orders ganjau, ja ir taa funkcionalitaate, ka maina cenas :)

*/

// MUST re-do this shitcode !!
var counter = 0;

function repeat() {

    counter++;
    console.log(counter);

    GetDealsAndSave.do().then(function(res) {
        console.log('Got some Deals ', res);
        return BuyAndUpdateAll.do().then(function(res) {
            console.log('Bought all what needed ', res);
            return CheckAndUpdateAll.do().then(function(res) {

                if (res) {
                      console.log('\u0007');
                    console.log('Updated all Deal statuses ', res);
                    return CancelAndUpdateAll.do().then(function(res) {
                    	console.log('Canceled and Updated statuses ', res);
	                    return DeletaCompleatedDeals.do().then(function(res) {
	                        console.log('Deletet all done Deals ', res);

	                        if (res) {

	                            return UpdateAccountBalance.do().then(function(res) {
	                                console.log('balances updated', res)
	                                return setTimeout(function() {repeat();}, 7000);
	                            }, function(err) {
	                                console.log('~~~!', err);
	                            });

	                        } else {

	                            return setTimeout(function() {repeat();}, 8000);
	                        }
	                    }, function(err) {
	                        console.log('~~~!', err);
	                    });
                    }, function(err) {
                        console.log('~~~!', err);
                    });

                } else {

                    return setTimeout(function() {repeat();}, 10000);
                }
            }, function(err) {
                console.log('~~~!', err);
            });
        }, function(err) {
            console.log('~~~!', err);
        });
    }, function(err) {
        console.log('~~~!', err);
    });

}
repeat();



// GetDealsAndSave.do().then(function(res) {
//    console.log('Got some Deals ', res);
// },function(err){
// 	console.log('~~~!',err);
// });	


// BuyAndUpdateAll.do().then(function(res){
// 	console.log('Bought all what needed ',res);
// },function(err){
// 	console.log('~~~!',err);
// });	


// CheckAndUpdateAll.do().then(function(res){
// 	console.log('test',res);
// },function(err){
// 	console.log('~~~!',err);
// });

// CancelAndUpdateAll.do().then(function(res){
// 	console.log('test',res);
// },function(err){
// 	console.log('~~~!',err);
// });


// DeletaCompleatedDeals.do().then(function(res){
// 	console.log('Deletet all done Deals ',res);

// },function(err){
// 	console.log('~~~!',err);
// });