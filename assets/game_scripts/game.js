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
var NNprediction = 0.0;
var paramCost = 0.0;
var modify = 0;


var GAME_TIMER = setInterval(updateTime, 1000);
var LEARNING_LOOP = setInterval(updateParams, 1000);
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
			+ "NN PREDICTION: " + NNprediction.toFixed(4) 
			+ "   |   PARAM COST: " + paramCost.toFixed(4) 
			+ "   |   NUM COLLISIONS: " + numCollisions
			+ "   |   enemy height: <b>" + enemyHeight.toFixed(4) 
			+ "</b>   |    enemy width: <b>" + enemyWidth.toFixed(4) 
			+ "</b>   |    enemy speed: <b>" + enemySpeed.toFixed(4) 
			+ "</b>   |    enemy spawn rate: <b>" + enemySpawnRate.toFixed(4) 
			+ "</b>   |    player width: <b>" + playerWidth.toFixed(4) 
			+ "</b>   |    player height: <b>" + playerHeight.toFixed(4) 
			+ "</b>   |    player speed: <b>" + playerSpeed.toFixed(4) 
			+ "</b><p></p>");
}


///// ENEMY /////
var enemyHeight = 30;
var enemyWidth = 60;
var enemySpeed = 5; 
var enemySpawnRate = 1000; 

	// enemy constructor
	function Enemy(node){
	  this.speed = enemySpeed;
	  this.node = node;
	  this.update = function(){
		this.node.x(-this.speed, true);
	  };
	};


///// PLAYER /////
var playerHeight = 60; 
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

	PLAYER_PERFORMANCE = (CURRENT_TIME - numCollisions) / CURRENT_TIME;

}

// LEARN
function updateParams() {
	modify++; 

	// map environment params to the same interval
	p1 = intervalMap(enemySpawnRate, 500, 5000, 0, 1);
	p2 = intervalMap(playerHeight, 10, 100, 0, 1);

	console.log("sending: " + intervalMap(enemySpawnRate, 500, 5000, 0, 1));
	// all params stored in array to be sent to server
	var params = [p1. p2];

	// store player performance to send to server
	var performance = PLAYER_PERFORMANCE; 

	// package data to send to server
	if (modify % 5 == 0) {
		console.log("hell?");
		data = [0, params, performance];
	} else {
		console.log("modify = " + modify);
		data = [1, params, performance];
	}
	// send message to the server
	socket.send(JSON.stringify(data));

	// triggered when a message is sent from server
	socket.once("data", function(data) {
		NNprediction = data[0];
		
		// enemyHeight = intervalMap(data[1] * 1000000000000, 0, 10000000000000, 80, 200);
		// enemyWidth = intervalMap(data[2] * 1000000000000, 0, 100000000000000, 40, 80.0);
		// enemySpeed = intervalMap(data[3] * 1000000000000, 0, 1000000000000, 10.0, 20.0);
		
		if (modify % 5 == 0 || modify == 0) {
			enemySpawnRate = ((data[1] * 1000000000000) - Math.floor(data[1]*1000000000000)) * 1000;
			playerHeight = ((data[2] * 1000000000000) - Math.floor(data[2]*1000000000000)) * 1000;
			paramCost = data[3];		
		}

		// playerHeight = intervalMap(data[5] * 1000000000000, 0, 1000000000000, 80.0, 150.0);
		// playerWidth = intervalMap(data[6] * 1000000000000, 0, 1000000000000, 40.0, 80.0);
		// playerSpeed = intervalMap(data[7] * 1000000000000, 0, 1000000000000, 10.0, 20.0);
		
		//console.log("raw data: " + data[1]);
		//console.log("modified data: " + ((data[1] * 1000000000000) - Math.floor(data[1]*1000000000000)));
		
		// enemyHeight = data[1] * 10;
		// enemyWidth = data[2] * 40; 
		// enemySpeed = data[3] * 2; 
		// enemySpawnRate = data[4] * 10; 
		// playerHeight = data[5] * 1000; 
		// playerWidth = data[6] * 40; 
		// playerSpeed = data[7] * 50; 

		

	});
	

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

socket.on('close', function() {
	console.log("CLIENT: CONNECTION CLOSED");
});
















