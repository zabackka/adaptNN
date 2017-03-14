// game-test.js

////////////////////////
///// INITIAL SETUP ////
////////////////////////

///// PLAYGROUND /////
var PLAYGROUND_HEIGHT = window.innerHeight - 200; 
var PLAYGROUND_WIDTH = window.innerWidth - 20; 
var REFRESH_RATE = 10; 
var CURRENT_TIME = 0;
var GAME_TIMER = setInterval(updateTime, 1000);
var LEARNING_LOOP = setInterval(updateParams, 1000);
var HIGH_SCORE = 0;


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
}

function updateParams() {
	enemySpeed++;
}