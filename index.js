// define PANEL_SIZE as a constant
const PANEL_SIZE = 5; 
// define activeIndex as a global variable, 0 by default
var activeIndex = 0;
// default arrow is ArrowDown
var curArrow = "ArrowDown";
var rotationDegree = 0;

// Move initialize panel to a function and execute here
initPanel();

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

