// game.js


// SERVER COMMUNICATION SETUP //
// connect to server
var socket = io.connect("/"); 


////////////////////////
///// INITIAL SETUP ////
////////////////////////

///// PLAYGROUND /////
var PLAYGROUND_HEIGHT = window.innerHeight - 60; 
var PLAYGROUND_WIDTH = window.innerWidth - 20; 
var REFRESH_RATE = 10; 
var CURRENT_TIME = 0;

var numCollisions = 0; 
var PLAYER_PERFORMANCE = 0.0;
var NNprediction = 0.0;
var paramCost;


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
	$('#environment_params').html("PERFORMANCE: " + PLAYER_PERFORMANCE + "NN PREDICTION: " + NNprediction + "   |   PARAM COST: " + paramCost + "   |   NUM COLLISIONS: " + numCollisions + "   |   enemy height: <b>" + enemyHeight + "</b>   |    enemy width: <b>" + enemyWidth + "</b>   |    enemy speed: <b>" + enemySpeed + "</b>   |    enemy spawn rate: <b>" + enemySpawnRate + "</b>   |    player width: <b>" + playerWidth + "</b>   |    player height: <b>" + playerHeight + "</b>   |    player speed: <b>" + playerSpeed + "</b><p></p>");
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
	// send a message to the server
	p1 = intervalMap(enemyHeight, 10, 50, 0, 1);
	p2 = intervalMap(enemyWidth, 40, 80, 0, 1);
	p3 = intervalMap(enemySpeed, 2, 10, 0, 1);
	p4 = intervalMap(enemySpawnRate, 1000, 5000, 0, 1);
	p5 = intervalMap(playerHeight, 40, 80, 0, 1);
	p6 = intervalMap(playerWidth, 40, 80, 0, 1);
	p7 = intervalMap(playerSpeed, 5, 10, 0, 1);

	var params = [p1, p2, p3, p4, p5, p6, p7];
	var performance = PLAYER_PERFORMANCE; 

	var data = [params, performance];
	socket.send(JSON.stringify(data));

	// triggered when a message is sent from server
	socket.once("data", function(data) {
		/** PRINT check statments **/
		// console.log("CLIENT: message from server received:");
		// console.log(data);

		NNprediction = data[0];
		// console.log("enemy speed: " + intervalMap(data[1], -Number.MAX_VALUE, Number.MAX_VALUE, 2, 10));
		// console.log("player speed: " + intervalMap(data[2], -Number.MAX_VALUE, Number.MAX_VALUE, 2, 10));
		enemyHeight = intervalMap(data[1], -Number.MAX_VALUE, Number.MAX_VALUE, 10.0, 50);
		enemyWidth = intervalMap(data[2], -Number.MAX_VALUE, Number.MAX_VALUE, 40, 80.0);
		enemySpeed = intervalMap(data[3], -Number.MAX_VALUE, Number.MAX_VALUE, 2.0, 10.0);
		enemySpawnRate = intervalMap(data[4], -Number.MAX_VALUE, Number.MAX_VALUE, 1000.0, 5000.0);
		playerHeight = intervalMap(data[5], -Number.MAX_VALUE, Number.MAX_VALUE, 40.0, 80.0);
		playerWidth = intervalMap(data[6], -Number.MAX_VALUE, Number.MAX_VALUE, 40.0, 40.0);
		playerSpeed = intervalMap(data[7], -Number.MAX_VALUE, Number.MAX_VALUE, 5.0, 10.0);

		paramCost = data[8];
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
      			console.log("player performance: " + PLAYER_PERFORMANCE);
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
















