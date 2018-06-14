
var balances = {
	a: {
	  eth: 1,
	  btc: 1
	},
	b:{
	  eth: 1,
	  btc: 1
	}
}


function ETHtoBTC(amount,rate){
return amount*rate;
}
function BTCtoETH(amount,rate){
return amount/rate;
}


var amount = BTCtoETH(balances.a.btc,0.07634);



console.log(amount);




