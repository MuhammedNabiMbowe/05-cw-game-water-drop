// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly
let timerInterval;
let score = 0;
let timeLeft = 30;

const WIN_THRESHOLD = 20;
const GAME_LENGTH_SECONDS = 30;

const winningMessages = [
  "Amazing work! You brought a wave of clean water impact!",
  "You did it! Every drop counts, and you crushed it!",
  "Incredible score! Your efforts made a big splash!",
  "Victory! You caught enough drops to change lives!",
];

const losingMessages = [
  "Nice effort! Try again and catch even more drops.",
  "So close! Give it another shot to reach the goal.",
  "Keep going! Practice makes every drop easier to catch.",
  "Good try! Restart and see if you can hit 20+ next round.",
];

const startButton = document.getElementById("start-btn");
const resetButton = document.getElementById("reset-btn");
const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const gameMessage = document.getElementById("game-message");
const gameContainer = document.getElementById("game-container");
const confettiCanvas = document.getElementById("confetti-canvas");
const confettiCtx = confettiCanvas.getContext("2d");

// Wait for button click to start or reset the game
startButton.addEventListener("click", startGame);
resetButton.addEventListener("click", resetGame);

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  gameRunning = true;
  score = 0;
  timeLeft = GAME_LENGTH_SECONDS;

  scoreDisplay.textContent = score;
  timeDisplay.textContent = timeLeft;
  gameMessage.textContent = "";
  gameMessage.className = "game-message";

  startButton.disabled = true;
  startButton.textContent = "Game Running";

  gameContainer.innerHTML = "";
  stopConfetti();

  // Spawn drops more frequently for a faster overall fall rate.
  dropMaker = setInterval(createDrop, 420);

  // Countdown runs once per second and ends game at 0.
  timerInterval = setInterval(() => {
    timeLeft -= 1;
    timeDisplay.textContent = Math.max(timeLeft, 0);

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function resetGame() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timerInterval);

  score = 0;
  timeLeft = GAME_LENGTH_SECONDS;

  scoreDisplay.textContent = score;
  timeDisplay.textContent = timeLeft;
  gameMessage.textContent = "";
  gameMessage.className = "game-message";

  startButton.disabled = false;
  startButton.textContent = "Start Game";

  gameContainer.innerHTML = "";
  stopConfetti();
}

function createDrop() {
  if (!gameRunning) return;

  // Create a new div element that will be our water drop
  const drop = document.createElement("div");
  drop.className = "water-drop";

  // Make drops different sizes for visual variety
  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;

  // Position the drop randomly across the game width.
  const gameWidth = gameContainer.offsetWidth;
  const xPosition = Math.random() * (gameWidth - size);
  drop.style.left = xPosition + "px";

  // Slightly reduced fall speed for better playability.
  drop.style.animationDuration = "2.8s";
  drop.style.setProperty("--fall-distance", `${gameContainer.clientHeight + size}px`);

  // Add the new drop to the game screen
  gameContainer.appendChild(drop);

  // Clicking a drop scores a point and flashes the drop to confirm the catch.
  drop.addEventListener("click", () => {
    if (!gameRunning || drop.dataset.caught === "true") return;
    drop.dataset.caught = "true";
    drop.style.pointerEvents = "none";
    drop.classList.add("caught");
    score += 1;
    scoreDisplay.textContent = score;
  });

  // Remove drops that reach the bottom (weren't clicked)
  drop.addEventListener("animationend", () => {
    drop.remove(); // Clean up drops that weren't caught
  });
}

function endGame() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timerInterval);

  gameContainer.innerHTML = "";
  startButton.disabled = false;
  startButton.textContent = "Play Again";

  const didWin = score >= WIN_THRESHOLD;
  const messages = didWin ? winningMessages : losingMessages;
  const randomIndex = Math.floor(Math.random() * messages.length);
  const randomMessage = messages[randomIndex];

  gameMessage.textContent = randomMessage;
  gameMessage.classList.toggle("win", didWin);
  gameMessage.classList.toggle("lose", !didWin);

  if (didWin) launchConfetti();
}

// --------------- Confetti ---------------
let confettiParticles = [];
let confettiAnimId = null;
const CONFETTI_COLORS = ["#FFC907", "#2E9DF7", "#8BD1CB", "#4FCB53", "#FF902A", "#F5402C"];

function launchConfetti() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
  confettiCanvas.style.display = "block";

  confettiParticles = Array.from({ length: 160 }, () => ({
    x: Math.random() * confettiCanvas.width,
    y: Math.random() * -confettiCanvas.height,
    w: Math.random() * 10 + 6,
    h: Math.random() * 6 + 4,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    speed: Math.random() * 3 + 2,
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.15,
    drift: (Math.random() - 0.5) * 1.5,
  }));

  if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
  animateConfetti();
  setTimeout(stopConfetti, 4000);
}

function animateConfetti() {
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  confettiParticles.forEach((p) => {
    p.y += p.speed;
    p.x += p.drift;
    p.angle += p.spin;

    confettiCtx.save();
    confettiCtx.translate(p.x, p.y);
    confettiCtx.rotate(p.angle);
    confettiCtx.fillStyle = p.color;
    confettiCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    confettiCtx.restore();
  });

  confettiParticles = confettiParticles.filter((p) => p.y < confettiCanvas.height + 20);

  if (confettiParticles.length > 0) {
    confettiAnimId = requestAnimationFrame(animateConfetti);
  } else {
    stopConfetti();
  }
}

function stopConfetti() {
  if (confettiAnimId) {
    cancelAnimationFrame(confettiAnimId);
    confettiAnimId = null;
  }
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  confettiCanvas.style.display = "none";
  confettiParticles = [];
}
