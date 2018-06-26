"use strict";
/*
	CPSC 1045 Final Project
	Amanda Chan

*/

const canvas = document.getElementById("idCanvas");
const ctx = canvas.getContext("2d");
let documentHasFocus = false;

// other conststans
const healthBarHeight = 10;
const healthBarWidth = 200;

//Images
let overlay = new Image(); //bluish overlay
overlay.src = "images/overlay_005.png";

//Sound
let sGameOver = null; //sound played when game ends

//colors
const backgroundColor = "rgba(19, 18, 25, 0.75)";
const textColor = "#ffeeff";

//Game
const TIME_LIMIT = 4500;
let countdownTimer = 0; //game timer: game ends when timer reaches 0
let timerRate = 1; //rate countdownTimer ticks
// let timerRate = 0; //demo mode

let gameState = "GAME_START"; //Possible states: GAME_RUNNING, AT_STARTSCREEN, GAME_OVER
let pageIndex = 0; //page index for start screen & instructions
let isShowingInfo = false; //show or hide game info with [i] when at the start screen

//Ship and Player class object declarations
let ship1 = null;
let ship2 = null;
let player1 = null;
let player2 = null;
