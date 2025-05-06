import { Scene } from 'phaser';

const WIDTH = 1024;

const HEIGHT = 768;

export class Game extends Scene {

constructor() {

super('Game');

// Initialise necessary variables

this.ball = null;

this.leftPaddle = null;

this.rightPaddle = null;

this.wasd = null;

this.cursors = null;

// Flag to determine if the ball is in motion

this.ballInMotion = false;

// Points logic

this.leftScore = 0;

this.rightScore = 0;

this.leftScoreText = null;

this.rightScoreText = null;

// Track the last paddle to hit the ball

this.lastHit = null;

}

preload() {

// Load necessary assets from the assets directory

this.load.image('background', 'assets/background.png');

this.load.image('ball', 'assets/ball.png');

this.load.image('paddle', 'assets/paddle.png');

this.load.image('powerUp', 'assets/powerUp.png'); // Load power-up image

}

create() {

// Add background and ball to the scene

this.add.image(WIDTH / 2, HEIGHT / 2, 'background').setScale(0.8, 0.8);

this.ball = this.physics.add.image(WIDTH / 2, HEIGHT / 2, 'ball').setScale(0.05, 0.05).refreshBody();

this.ball.setCollideWorldBounds(true);

this.ball.setBounce(1, 1);

// Set up paddles with collision with ball

this.leftPaddle = this.physics.add.image(50, 384, "paddle");

this.leftPaddle.setImmovable(true);

this.rightPaddle = this.physics.add.image(974, 384, "paddle");

this.rightPaddle.setImmovable(true);

this.physics.add.collider(this.ball, this.leftPaddle, this.hitPaddle, null, this);

this.physics.add.collider(this.ball, this.rightPaddle, this.hitPaddle, null, this);

// Listen for "keyspace down" event, calling startBall function upon press

this.input.keyboard.on('keydown-SPACE', this.startBall, this);

// Assigns U/D/L/R keys to the cursors variable

this.cursors = this.input.keyboard.createCursorKeys();

// Assigns W/S keys to the wasd variable

this.wasd = this.input.keyboard.addKeys({

up: Phaser.Input.Keyboard.KeyCodes.W,

down: Phaser.Input.Keyboard.KeyCodes.S

});

this.leftScoreText = this.add.text(100, 50, '0', { fontSize: '50px' });

this.rightScoreText = this.add.text(924, 50, '0', { fontSize: '50px' });

// Create a group for power-ups

this.powerUps = this.physics.add.group();

// Spawn power-ups at random intervals

this.time.addEvent({

delay: 10000, // Spawn every 10 seconds

callback: this.spawnPowerUp,

callbackScope: this,

loop: true

});

// Add collision detection between ball and power-ups

this.physics.add.overlap(this.ball, this.powerUps, this.collectPowerUp, null, this);

}

update() {

// leftPaddle movement logic

if (this.wasd.up.isDown && this.leftPaddle.y > 0) {

this.leftPaddle.y -= 5;

} else if (this.wasd.down.isDown && this.leftPaddle.y < HEIGHT) {

this.leftPaddle.y += 5;

}

// rightPaddle movement logic

if (this.cursors.up.isDown && this.rightPaddle.y > 0) {

this.rightPaddle.y -= 5;

} else if (this.cursors.down.isDown && this.rightPaddle.y < HEIGHT) {

this.rightPaddle.y += 5;

}

// Fail condition check

const margin = 30;

if (this.ball.x < margin) { // Ball hits left wall

this.rightScore += 1; // Right player scores

this.rightScoreText.setText(this.rightScore);

this.resetBall();

} else if (this.ball.x > WIDTH - margin) { // Ball hits right wall

this.leftScore += 1; // Left player scores

this.leftScoreText.setText(this.leftScore);

this.resetBall();

}

}

startBall() {

if (!this.ballInMotion) { // checks flag to determine if ball is NOT in motion

let initialVelocityX = 300 * (Phaser.Math.Between(0, 1) ? 1 : -1); // sets to either 300 or -300

let initialVelocityY = 300 * (Phaser.Math.Between(0, 1) ? 1 : -1); // sets to either 300 or -300

this.ball.setVelocity(initialVelocityX, initialVelocityY); // sets ball to RANDOM velocity

this.ballInMotion = true; // sets flag to ball is in motion

}

}

resetBall() {

this.ball.setPosition(WIDTH/2, 384);

this.ball.setVelocity(0, 0);

this.ballInMotion = false;

this.startBall()

}

hitPaddle(ball, paddle) {

// Track the last paddle to hit the ball

if (paddle === this.leftPaddle) {

this.lastHit = 'left';

} else if (paddle === this.rightPaddle) {

this.lastHit = 'right';

}

}

spawnPowerUp() {

// Generate random position within the game bounds

const x = Phaser.Math.Between(100, WIDTH - 100);

const y = Phaser.Math.Between(100, HEIGHT - 100);

// Create a static power-up sprite

const powerUp = this.powerUps.create(x, y, 'powerUp').setScale(0.1, 0.1);

powerUp.setCollideWorldBounds(true);

// Assign a random type to the power-up

powerUp.type = Phaser.Math.Between(1, 6); // 1 to 6 for the six power-ups

}

collectPowerUp(ball, powerUp) {

// Remove the power-up from the scene

powerUp.destroy();

// Apply the effect based on the power-up type

switch (powerUp.type) {

case 1: // Speed Boost

this.ball.setVelocity(this.ball.body.velocity.x * 1.5, this.ball.body.velocity.y * 1.5);

break;

case 2: // Paddle Size Increase (last player to hit the ball)

if (this.lastHit === 'left') {

this.leftPaddle.setScale(1, 2);

this.time.delayedCall(5000, () => {

this.leftPaddle.setScale(1, 1);

});

} else if (this.lastHit === 'right') {

this.rightPaddle.setScale(1, 2);

this.time.delayedCall(5000, () => {

this.rightPaddle.setScale(1, 1);

});

}

break;

case 3: // Paddle Size Decrease (affects opponent)

if (this.lastHit === 'left') {

this.rightPaddle.setScale(1, 0.5);

this.time.delayedCall(5000, () => {

this.rightPaddle.setScale(1, 1);

});

} else if (this.lastHit === 'right') {

this.leftPaddle.setScale(1, 0.5);

this.time.delayedCall(5000, () => {

this.leftPaddle.setScale(1, 1);

});

}

break;

case 4: // Random Ball Size Increment

const randomScale = Phaser.Math.FloatBetween(0.03, 0.1);

this.ball.setScale(randomScale, randomScale);

break;

case 5: // Speed Deboost

this.ball.setVelocity(this.ball.body.velocity.x * 0.5, this.ball.body.velocity.y * 0.5);

break;

case 6: // Multiple Balls

this.spawnAdditionalBall();

break;

}

}

spawnAdditionalBall() {

// Create a new ball at the center of the screen

const newBall = this.physics.add.image(WIDTH / 2, HEIGHT / 2, 'ball').setScale(0.05, 0.05).refreshBody();

newBall.setCollideWorldBounds(true);

newBall.setBounce(1, 1);

// Set random velocity for the new ball

const velocityX = 300 * (Phaser.Math.Between(0, 1) ? 1 : -1);

const velocityY = 300 * (Phaser.Math.Between(0, 1) ? 1 : -1);

newBall.setVelocity(velocityX, velocityY);

// Add collision with paddles

this.physics.add.collider(newBall, this.leftPaddle, this.hitPaddle, null, this);

this.physics.add.collider(newBall, this.rightPaddle, this.hitPaddle, null, this);

// Add collision with power-ups

this.physics.add.overlap(newBall, this.powerUps, this.collectPowerUp, null, this);

}

}