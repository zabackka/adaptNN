// game.js


// SERVER COMMUNICATION SETUP //
// connect to server
var socket = io.connect("/"); 


////////////////////////
///// INITIAL SETUP ////
////////////////////////

///// PLAYGROUND /////
var PLAYGROUND_HEIGHT = window.innerHeight - 90; 
var PLAYGROUND_WIDTH = window.innerWidth - 20; 
var REFRESH_RATE = 10; 
var CURRENT_TIME = 0;

var numCollisions = 0; 
var PLAYER_PERFORMANCE = 0.0;
var performance_timer = 1;
var NNprediction = 0.0;
var paramCost = 0.0;
var outgoingID = 0;
var network_cost= 1.0;  

var modStatus = 1; 

var data_package = []


var GAME_TIMER = setInterval(updateTime, 1000);
var HIGH_SCORE = 0;

function intervalMap(value, fromLow, fromHigh, toLow, toHigh) {
	return (value - fromLow)*((toHigh - toLow) / (fromHigh - fromLow)) + toLow
}

function displayTime() {
	$('#current_time').html("Time: <b>" + CURRENT_TIME + "</b>"); 
}

function printEnvironmentParams() {
	$('#environment_params').html
		("PERFORMANCE: " + PLAYER_PERFORMANCE.toFixed(4) 
			+ "   |   NN PREDICTION: " + NNprediction.toFixed(4) 
			+ "   |   PARAM COST: " + paramCost.toFixed(4) 
			+ "   |   NETWORK COST: " + network_cost.toFixed(7)
			+ "   |   MOD STATUS (0=T/1=F): " + modStatus
			//+ "   |   NUM COLLISIONS: " + numCollisions
			//+ "   |   enemy height: <b>" + enemyHeight.toFixed(4) 
			//+ "</b>   |    enemy width: <b>" + enemyWidth.toFixed(4) 
			//+ "</b>   |    enemy speed: <b>" + enemySpeed.toFixed(4) 
			+ "</b>   |    SPAWN RATE: <b>" + enemySpawnRate.toFixed(4) 
			//+ "</b>   |    player width: <b>" + playerWidth.toFixed(4) 
			+ "</b>   |    PLAYER HEIGHT: <b>" + playerHeight.toFixed(4) 
			//+ "</b>   |    player speed: <b>" + playerSpeed.toFixed(4) 
			+ "</b><p></p>");
}


///// ENEMY /////
var enemyHeight = 30;
var enemyWidth = 60;
var enemySpeed = 5; 
var enemySpawnRate = 600.0; 

	// enemy constructor
	function Enemy(node){
	  this.speed = enemySpeed;
	  this.node = node;
	  this.update = function(){
		this.node.x(-this.speed, true);
	  };
	};


///// PLAYER /////
var playerHeight = 60.0; 
var playerWidth = 60;
var playerSpeed = 10;  

	// player constructor
	function Player(){
		this.value = 0; 
		
		this.update = function(){
			this.value = this.value; 
	  	};
	};

function updateTime() {
	CURRENT_TIME++; 
	// increment player value
    $("#player")[0].player.value += 1;
	// update value in html to reflect current score
	$("#player .value").html($("#player")[0].player.value);

}

// send gathered data to server for processing
function sendData(modify) {
	// map environment params to the same interval
	var p1 = intervalMap(enemySpawnRate, 200.0, 600.0, 0.0, 100.0);
	var p2 = intervalMap(playerHeight, 60.0, 200.0, 0.0, 100.0);

	// all params stored in array to be sent to server
	var params = [p1, p2];

	// store player performance to send to server
	// update player performance measure
	PLAYER_PERFORMANCE = intervalMap(numCollisions, 0.0, 100.0, 0.0, 1.0);
	numCollisions = 0;
	var performance = PLAYER_PERFORMANCE; 

	// package up message to send to server
	data = [modify, outgoingID, params, performance];

	// send message to the server
	socket.send(JSON.stringify(data));

	// add new data to package to send next time
	data_package.push(enemySpawnRate);
	data_package.push(playerHeight);
	data_package.push(performance);

	console.log("sending [" + outgoingID + "]: " + data[2] + " " + data[3]);
	
	// increment ID counter
	outgoingID++; 
}

//////////////////////////////
///// GAME FUNCTIONALITY /////
//////////////////////////////


// set playground width/height to the size of the window
$("#playground").playground({height: PLAYGROUND_HEIGHT, width: PLAYGROUND_WIDTH, keyTracker: true});

// add enemy group to the playground 
$.playground().addGroup("enemies", {width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT})
.end()

// initialize player sprite
.addGroup("player", {posx: 0, posy: PLAYGROUND_HEIGHT/2, width: playerWidth, height: playerHeight}) 
.addSprite("playerBody",{animation: '', posx: 0, posy: 0, width: playerWidth, height: playerHeight})
.end();

$("#player")[0].player = new Player(); 
$("#playerBody").html("<span class='value'>"+$("#player")[0].player.value+"</span>");
 
 
//// ENEMY SPAWNING ////
 
// update enemies at each refresh
$.playground().registerCallback(function() {
	// display/update time & environment params
	displayTime(); 
	printEnvironmentParams();
	
	// call the update() function on each member of the enemy class 
	$(".enemy").each(function(){
		this.enemy.update();
		// if enemy is off screen, remove from DOM
		if(($(this).x()+ enemyWidth) < 0){
		  $(this).remove();
		} else {
      		var collided = $(this).collision("#playerBody,."+$.gQ.groupCssClass);
      		if(collided.length > 0){
      			numCollisions++;

				// decrement player value
        		$("#player")[0].player.value -= 1;
				// update value in html to reflect current score
				$("#player .value").html($("#player")[0].player.value);
				// remove enemy node from playground
        		$(this).remove();
      		} 
			if ($("#player")[0].player.value > HIGH_SCORE) {
				HIGH_SCORE = $("#player")[0].player.value; 
//				$('#high_score').html('High score: ' + HIGH_SCORE);
			}
		}
  	});
}, REFRESH_RATE);

// spawn new enemies
$.playground().registerCallback(function() {
	// create unique ID for new enemy
	var name = "enemy_"+(new Date().getTime());
	// add new enemy node to the DOM 
	$("#enemies").addSprite(name, {animation: '', posx: PLAYGROUND_WIDTH, posy: Math.random()*PLAYGROUND_HEIGHT*0.9,width: enemyWidth, height: enemyHeight});
	// retrieve new enemy node from DOM
	var enemyElement = $("#"+name);
	// assign node to class "enemy"
	enemyElement.addClass("enemy");
	// spawn new enemy off enemy node
	enemyElement[0].enemy = new Enemy(enemyElement);
}, enemySpawnRate); 



//// PLAYER MOVEMENT (KEY TRACKING) ////

$.playground().registerCallback(function() {
	var nextpos; 
	// RIGHT [d] or [->]
		if (jQuery.gameQuery.keyTracker[39] || jQuery.gameQuery.keyTracker[68]){
			nextpos = $("#player").x()+playerSpeed;
			if(nextpos < PLAYGROUND_WIDTH - playerWidth){
				$("#player").x(nextpos);
			}
		}
	// LEFT [a] or [<-]
		if (jQuery.gameQuery.keyTracker[37] || jQuery.gameQuery.keyTracker[65]){
			nextpos = $("#player").x()-playerSpeed;
			if(nextpos > 0){
				$("#player").x(nextpos);
			}
		}	
	// UP [w] or [up]
		if(jQuery.gameQuery.keyTracker[38] || jQuery.gameQuery.keyTracker[87]){
			nextpos = $("#player").y()-playerSpeed;
			if(nextpos > 0){
				$("#player").y(nextpos);
			}
		}	
	// DOWN [s] or [down]
		if(jQuery.gameQuery.keyTracker[40] || jQuery.gameQuery.keyTracker[83]){
			nextpos = $("#player").y()+playerSpeed;
			if(nextpos < PLAYGROUND_HEIGHT - playerHeight){
				$("#player").y(nextpos);
			}
		}	
}, REFRESH_RATE); 


// start the game
$.playground().startGame();

//send initial data to server
setTimeout(function() {  sendData(); }, 5000); 

// LISTEN continually for server messages // 
// triggered when a message is sent from server
socket.on("data", function(data) {
		// console.log("processing job #" + data[0]);
		console.log(data.length);

		// retrive the network's prediciton for performance
		NNprediction = data[1];
		
		data_package.push(NNprediction);

		data[2] = data[2] * 10000000000000 - Math.floor(data[2] * 10000000000000)
		data[3] = data[3] * 10000000000000 - Math.floor(data[3] * 10000000000000)
		// console.log("#" + data[0] + " (raw): " + data[2] + " (raw): " + data[3]);
		
		// calculate the new param values based on network's updates
		enemySpawnRate = intervalMap(data[2], 0.0, 1.0, 200.0, 600.0);
		playerHeight = intervalMap(data[3], 0.0, 1.0, 60.0, 200.0);
		
		data_package.push(enemySpawnRate);
		data_package.push(playerHeight);

		// console.log("#" + data[0] + " (interval): " + enemySpawnRate + " (interval): " + playerHeight);
		
		// retrieve the network's calculated cost for updated params
		network_cost = data[4];
		
		console.log("network output: " + data[5]);
		if (data[6] != 0.0) {
			paramCost = data[6];
		}
		
		data_package.push(paramCost);
		
		socket.emit("log", JSON.stringify(data_package));
		data_package = [];

		var modify = 1;
		if (network_cost < 0.00002) {
			modify = 0;
			modStatus = 0;
		}
		setTimeout(function() {  sendData(modify);  }, 0);		

});

socket.on('close', function() {
	console.log("CLIENT: CONNECTION CLOSED");
});
















