// define PANEL_SIZE as a constant
const PANEL_SIZE = 5; 
// define activeIndex as a global variable, 0 by default
var activeIndex = 0;
// default arrow is ArrowDown
var curArrow = "ArrowDown";
var rotationDegree = 0;

// Game system variables
var score = 0;
var currentLevel = 1;
var maxLevel = 5;
var levelTimeLimit = 60; // 60 seconds per level
var timeLeft = levelTimeLimit;
var gameTimer = null;
var gameActive = true;

// Food system variables
var foods = [];
var foodTimeout = 30; // 30 seconds per food item
var currentFoodTimer = null;
var foodTypes = [
    { name: 'apple', emoji: '🍎', points: 1, speed: 2000, color: '#ff4444' },
    { name: 'banana', emoji: '🍌', points: 2, speed: 1500, color: '#ffdd44' },
    { name: 'orange', emoji: '🍊', points: 3, speed: 1200, color: '#ff8844' },
    { name: 'grape', emoji: '🍇', points: 4, speed: 900, color: '#8844ff' },
    { name: 'cherry', emoji: '🍒', points: 5, speed: 600, color: '#ff0044' }
];

// Move initialize panel to a function and execute here
initPanel();
// Start the game system
startGame();

var cards = document.getElementById("pane").getElementsByClassName("card");
window.addEventListener('keydown', function(e) {
	var increment;

	switch(e.key) {
		case "ArrowUp": 
			increment = -PANEL_SIZE;
			break;
		case "ArrowDown":
			increment = PANEL_SIZE;
			break;
		case "ArrowLeft":
			increment = -1;
			break;
		case "ArrowRight":
			increment = 1;
			break;
		default:
			increment = 0;
			break;
	}
	if (increment !== 0) {
		// calculate new active index
		var newActiveIndex = activeIndex + increment;
		if (ifValid(activeIndex, increment)) {
			// remove old robot
			removeRobot(cards[activeIndex]);
			// get rotation degree
			var rotationDegree = getRotationDegree(curArrow, e.key);
			// draw new robot
			drawRobot(cards[newActiveIndex], rotationDegree);
			// update arrow and active index
			curArrow = e.key;
			activeIndex = newActiveIndex;
			// Check for food collision after moving
			checkCollisions();
		}
		// prevent default handling of up, down, left, right keys
		e.preventDefault();
	}
});

/////////////////////////////////////////Helper Functions/////////////////////////////////////////
// Check if the new index is valid
function ifValid(index, increment) {
	// Not valid if the new index is out of the panel
	if (index + increment < 0 || index + increment >= PANEL_SIZE * PANEL_SIZE) {
		return false;
	}
	// Not valid if robot is at the leftmost and tries to move left
	if (index % PANEL_SIZE === 0 && increment === -1) {
		return false;
	}
	// Not valid if robot is at the rightmost and tries to move right
	if (index % PANEL_SIZE === PANEL_SIZE - 1 && increment === 1) {
		return false;
	}
	return true;
}

// Get rotation degree of the robot based on current arrow and new arrow
function getRotationDegree(curArrow, newArrow) {
	var arrows = ["ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft"];
	var curIndex = arrows.indexOf(curArrow);
	var newIndex = arrows.indexOf(newArrow);
	rotationDegree += (newIndex - curIndex) * 90;
	return rotationDegree;
}

// Add robot image to active card
function drawRobot(card, rotationDegree) {
	const img = document.createElement('img');
	img.src = 'assets/robot.png';
	img.alt = 'robot';
	img.className = 'img-robot';
	// set rotation degree
	img.style.transform = 'rotate(' + rotationDegree + 'deg)';
	card.appendChild(img);
}

// Remove robot image from card
function removeRobot(card) {
	const img = card.querySelector('.img-robot');
	card.removeChild(img);
}

// Initialize panel
function initPanel() {
	const pane = document.getElementById('pane');

	// Create cards and add robot container for all cards
	for (let i = 0; i < PANEL_SIZE * PANEL_SIZE; i++) {
		const card = document.createElement('div');
		card.className = 'card';
		card.id = i;
	
		pane.appendChild(card);
	}

	// Add 'active' class and robot to the first card (id = 0)
	const firstCard = document.getElementById('0');
	drawRobot(firstCard);
}

/////////////////////////////////////////Food System Functions/////////////////////////////////////////
// Start the food system
function startFoodSystem() {
	// Create initial food
	createFood();
	// Start checking for collisions
	setInterval(checkCollisions, 100);
}

// Create a new food item
function createFood() {
	// Only create food if game is active
	if (!gameActive) return;
	
	// Remove existing food if any
	removeAllFood();
	
	// Select random food type
	const foodType = foodTypes[Math.floor(Math.random() * foodTypes.length)];
	
	// Select random position (avoid robot position)
	let position;
	do {
		position = Math.floor(Math.random() * PANEL_SIZE * PANEL_SIZE);
	} while (position === activeIndex);
	
	// Create food object
	const food = {
		type: foodType,
		position: position,
		element: null,
		moveInterval: null
	};
	
	// Create DOM element
	const foodElement = document.createElement('div');
	foodElement.className = `food ${foodType.name}`;
	foodElement.textContent = foodType.emoji;
	foodElement.style.position = 'absolute';
	
	// Position the food in the grid
	positionFood(foodElement, position);
	
	// Add to DOM
	document.getElementById('pane').appendChild(foodElement);
	
	// Store references
	food.element = foodElement;
	foods.push(food);
	
	// Start moving the food
	startFoodMovement(food);
	
	// Start the 30-second food timer
	startFoodTimer();
}

// Position food element in the grid
function positionFood(element, position) {
	const row = Math.floor(position / PANEL_SIZE);
	const col = position % PANEL_SIZE;
	const cellSize = 100; // matches CSS --cell-size
	const gap = 5; // matches CSS gap
	
	element.style.left = (col * (cellSize + gap) + cellSize/2 - 30) + 'px';
	element.style.top = (row * (cellSize + gap) + cellSize/2 - 30) + 'px';
}

// Start food movement
function startFoodMovement(food) {
	food.moveInterval = setInterval(() => {
		moveFood(food);
	}, food.type.speed);
}

// Move food to a new random position
function moveFood(food) {
	let newPosition;
	do {
		newPosition = Math.floor(Math.random() * PANEL_SIZE * PANEL_SIZE);
	} while (newPosition === activeIndex || newPosition === food.position);
	
	food.position = newPosition;
	positionFood(food.element, newPosition);
}

// Check for collisions between robot and food
function checkCollisions() {
	foods.forEach((food, index) => {
		if (food.position === activeIndex) {
			// Collision detected!
			eatFood(food, index);
		}
	});
}

// Handle eating food
function eatFood(food, index) {
	// Add points to score
	score += food.type.points;
	updateScoreDisplay();
	
	// Clear the food timer since food was eaten
	clearFoodTimer();
	
	// Remove food
	clearInterval(food.moveInterval);
	food.element.remove();
	foods.splice(index, 1);
	
	// Create new food after a short delay
	setTimeout(createFood, 500);
}

// Remove all food from the game
function removeAllFood() {
	foods.forEach(food => {
		clearInterval(food.moveInterval);
		if (food.element && food.element.parentNode) {
			food.element.remove();
		}
	});
	foods = [];
}

// Update score display
function updateScoreDisplay() {
	document.getElementById('score').textContent = score;
}

/////////////////////////////////////////Game System Functions/////////////////////////////////////////
// Start the game system
function startGame() {
	// Initialize displays
	updateLevelDisplay();
	updateTimerDisplay();
	
	// Start the food system
	startFoodSystem();
	
	// Start the level timer
	startLevelTimer();
}

// Start level timer
function startLevelTimer() {
	if (gameTimer) {
		clearInterval(gameTimer);
	}
	
	gameTimer = setInterval(() => {
		if (gameActive) {
			timeLeft--;
			updateTimerDisplay();
			
			// Add warning animation when time is low
			const timerElement = document.getElementById('timer');
			if (timeLeft <= 10) {
				timerElement.classList.add('warning');
			} else {
				timerElement.classList.remove('warning');
			}
			
			// Check if time is up
			if (timeLeft <= 0) {
				endLevel();
			}
		}
	}, 1000);
}

// End current level
function endLevel() {
	// Check if player has enough score to advance
	if (score >= 20) {
		// Player can advance to next level
		if (currentLevel < maxLevel) {
			advanceToNextLevel();
		} else {
			// Player completed all levels
			gameWon();
		}
	} else {
		// Player didn't reach required score
		gameOver();
	}
}

// Advance to next level
function advanceToNextLevel() {
	currentLevel++;
	score = 0; // Reset score for new level
	timeLeft = levelTimeLimit; // Reset timer
	
	// Update displays
	updateLevelDisplay();
	updateScoreDisplay();
	updateTimerDisplay();
	
	// Remove warning class
	document.getElementById('timer').classList.remove('warning');
	
	// Show level advancement message
	showMessage(`Level ${currentLevel}! You need 20 points to advance.`, 3000);
	
	// Create new food
	createFood();
}

// Game won (completed all levels)
function gameWon() {
	gameActive = false;
	clearInterval(gameTimer);
	removeAllFood();
	clearFoodTimer();
	
	showMessage('Congratulations! You completed all 5 levels!', 0);
}

// Game over (didn't reach required score)
function gameOver() {
	gameActive = false;
	clearInterval(gameTimer);
	removeAllFood();
	clearFoodTimer();
	
	showMessage(`Game Over! You needed 20 points but only got ${score}. Refresh to try again.`, 0);
}

// Show message to player
function showMessage(message, duration) {
	// Create message element if it doesn't exist
	let messageElement = document.getElementById('game-message');
	if (!messageElement) {
		messageElement = document.createElement('div');
		messageElement.id = 'game-message';
		messageElement.style.cssText = `
			position: fixed;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			background: rgba(0, 0, 0, 0.9);
			color: white;
			padding: 20px;
			border-radius: 10px;
			font-size: 18px;
			font-weight: bold;
			text-align: center;
			z-index: 1000;
			max-width: 400px;
		`;
		document.body.appendChild(messageElement);
	}
	
	messageElement.textContent = message;
	messageElement.style.display = 'block';
	
	// Hide message after duration (if duration > 0)
	if (duration > 0) {
		setTimeout(() => {
			messageElement.style.display = 'none';
		}, duration);
	}
}

// Update level display
function updateLevelDisplay() {
	document.getElementById('level').textContent = currentLevel;
}

// Update timer display
function updateTimerDisplay() {
	document.getElementById('timer').textContent = timeLeft;
}

// Start food timer (30 second timeout)
function startFoodTimer() {
	clearFoodTimer();
	
	currentFoodTimer = setTimeout(() => {
		if (gameActive && foods.length > 0) {
			// Time's up for current food, create new one
			createFood();
		}
	}, foodTimeout * 1000);
}

// Clear food timer
function clearFoodTimer() {
	if (currentFoodTimer) {
		clearTimeout(currentFoodTimer);
		currentFoodTimer = null;
	}
}
