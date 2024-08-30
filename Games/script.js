document.addEventListener("DOMContentLoaded", function () {
    const playButton = document.getElementById("playGame");
    const playerNameInput = document.getElementById("playerName");
    const instructionsButton = document.getElementById("showInstructions");
    const closeInstructionsButton = document.getElementById("closeInstructions");
    const instructionsPopup = document.getElementById("instructionsPopup");
    const gameOverPopup = document.getElementById("gameOverPopup");
    const levelSelect = document.getElementById("levelSelect");
    const ballSelect = document.getElementById("ballSelect");
    const countrySelect = document.getElementById("countrySelect");
    const randomOpponentButton = document.getElementById("randomOpponent");
    const opponentFlag = document.getElementById("opponentFlag");
    const scoreElement = document.getElementById('score');
    const timerElement = document.getElementById('timer');
    const pausePopup = document.getElementById('pausePopup');
    let selectedCountry;
    let opponentCountry;
    let gameInterval;
    let timerInterval;
    let score = 0;
    let isPaused = false;
    let gameStarted = false;
    let ball;
    let player;
    let opponent;

    // Enable play button when username is entered
    playerNameInput.addEventListener("input", function () {
        playButton.disabled = playerNameInput.value.trim() === "";
    });

    // Show instructions popup
    instructionsButton.addEventListener("click", function () {
        instructionsPopup.classList.remove("hidden");
    });

    // Close instructions popup
    closeInstructionsButton.addEventListener("click", function () {
        instructionsPopup.classList.add("hidden");
    });

    // Randomize opponent country
    randomOpponentButton.addEventListener("click", function () {
        const countries = [...countrySelect.options].map(option => option.value);
        const availableCountries = countries.filter(country => country !== selectedCountry);
        opponentCountry = availableCountries[Math.floor(Math.random() * availableCountries.length)];
        opponentFlag.src = `flags/${opponentCountry}.png`; // assuming flags are in a folder named 'flags'
    });

    // Handle play button click
    playButton.addEventListener("click", function () {
        selectedCountry = countrySelect.value;
        if (!opponentCountry) {
            alert("Please randomize an opponent country!");
            return;
        }

        // Hide the welcome screen and show the game screen
        document.querySelector('.welcome-screen').classList.add('hidden');
        document.querySelector('.game-screen').classList.remove('hidden');

        startCountdown();
    });

    // Countdown before game start
    function startCountdown() {
        let countdown = 3;
        const countdownElement = document.createElement('div');
        countdownElement.id = "countdown";
        countdownElement.innerText = countdown;
        document.body.appendChild(countdownElement);

        const countdownInterval = setInterval(function () {
            countdown--;
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                document.body.removeChild(countdownElement);
                startGame();
            } else {
                countdownElement.innerText = countdown;
            }
        }, 1000);
    }

    // Start the game
    function startGame() {
        if (gameStarted) return; // Prevent starting multiple times
        gameStarted = true;

        const level = levelSelect.value;
        let timeLeft;

        switch (level) {
            case 'easy':
                timeLeft = 30;
                break;
            case 'medium':
                timeLeft = 20;
                break;
            case 'hard':
                timeLeft = 15;
                break;
        }

        score = 0;
        scoreElement.innerText = `Score: ${score}`;
        timerElement.innerText = `Time: ${timeLeft}`;

        timerInterval = setInterval(function () {
            if (isPaused) return;
            timeLeft--;
            timerElement.innerText = `Time: ${timeLeft}`;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                checkGameOver();
            }
        }, 1000);

        gameInterval = setInterval(() => {
            if (isPaused) return;
            dropItems();
        }, 5000);

        // Initialize game board elements
        initGameBoard();
    }

    function initGameBoard() {
        // Remove previous game elements if any
        const gameBoard = document.querySelector('.game-board');
        gameBoard.innerHTML = '';

        // Setup characters and ball
        ball = document.createElement('div');
        ball.className = 'ball';
        gameBoard.appendChild(ball);

        player = document.createElement('div');
        player.className = 'player';
        gameBoard.appendChild(player);

        opponent = document.createElement('div');
        opponent.className = 'opponent';
        gameBoard.appendChild(opponent);

        // Set initial positions for player and opponent
        positionCharacter(player, 'left');
        positionCharacter(opponent, 'right');

        // Set ball initial position
        positionBall();

        document.addEventListener('keydown', handlePlayerControls);
        moveOpponent();
    }

    function positionCharacter(character, side) {
        const gameBoard = document.querySelector('.game-board');
        if (side === 'left') {
            character.style.left = '20px';
        } else {
            character.style.right = '20px';
        }
        character.style.bottom = '50px'; // Adjust as needed
    }

    function positionBall() {
        const gameBoard = document.querySelector('.game-board');
        ball.style.left = `${(gameBoard.offsetWidth / 2) - (ball.offsetWidth / 2)}px`;
        ball.style.top = '0px'; // Start from top
    }

    function movePlayerLeft() {
        const left = parseInt(player.style.left || '20px');
        if (left > 0) {
            player.style.left = `${left - 10}px`; // Move left
        }
    }

    function movePlayerRight() {
        const gameBoard = document.querySelector('.game-board');
        const right = parseInt(player.style.left || '20px') + player.offsetWidth;
        if (right < gameBoard.offsetWidth) {
            player.style.left = `${parseInt(player.style.left || '20px') + 10}px`; // Move right
        }
    }

    function jumpPlayer() {
        // Implement jump animation
        player.classList.add('jump');
        setTimeout(() => player.classList.remove('jump'), 500); // Adjust timing as needed
    }

    function kickBall() {
        // Implement ball kicking
        // Example logic to move ball and check collisions
        const ballRect = ball.getBoundingClientRect();
        const playerRect = player.getBoundingClientRect();
        if (ballRect.left < playerRect.right && ballRect.right > playerRect.left &&
            ballRect.top < playerRect.bottom && ballRect.bottom > playerRect.top) {
            // Ball hits player
            // Change ball direction or increase score
            score++;
            scoreElement.innerText = `Score: ${score}`;
        }
    }

    function moveOpponent() {
        // Simple opponent AI
        const gameBoard = document.querySelector('.game-board');
        const opponentRect = opponent.getBoundingClientRect();
        const ballRect = ball.getBoundingClientRect();
        
        // Basic AI to move opponent towards ball
        const moveInterval = setInterval(() => {
            if (isPaused) return;
            if (ballRect.left < opponentRect.left) {
                opponent.style.left = `${parseInt(opponent.style.left || '1000px') - 10}px`;
            } else if (ballRect.left > opponentRect.left + opponentRect.width) {
                opponent.style.left = `${parseInt(opponent.style.left || '1000px') + 10}px`;
            }
        }, 1000);
    }

    function dropItems() {
        const itemTypes = ['increase', 'decrease', 'freeze'];
        const randomItem = itemTypes[Math.floor(Math.random() * itemTypes.length)];
        const item = document.createElement('div');
        item.className = `item ${randomItem}`;
        item.style.left = `${Math.random() * 100}%`;
        item.style.top = '0px'; // Start from top
        document.querySelector('.game-board').appendChild(item);

        setTimeout(() => item.remove(), 5000); // Remove item after 5 seconds

        item.addEventListener('click', function () {
            handleItemCollision(randomItem);
            item.remove();
        });
    }

    function handleItemCollision(itemType) {
        switch (itemType) {
            case 'increase':
                increaseBallSize();
                break;
            case 'decrease':
                decreaseBallSize();
                break;
            case 'freeze':
                freezeBall();
                break;
        }
    }

    function increaseBallSize() {
        // Increase ball size
        ball.style.transform = 'scale(1.5)';
        setTimeout(() => ball.style.transform = 'scale(1)', 3000); // Reset size after 3 seconds
    }

    function decreaseBallSize() {
        // Decrease ball size
        ball.style.transform = 'scale(0.5)';
        setTimeout(() => ball.style.transform = 'scale(1)', 3000); // Reset size after 3 seconds
    }

    function freezeBall() {
        // Freeze ball movement
        ball.style.animationPlayState = 'paused';
        setTimeout(() => ball.style.animationPlayState = 'running', 3000); // Resume ball movement after 3 seconds
    }

    function togglePause() {
        isPaused = !isPaused;
        pausePopup.classList.toggle('hidden', !isPaused);
        if (isPaused) {
            clearInterval(gameInterval);
            clearInterval(timerInterval);
        } else {
            gameInterval = setInterval(dropItems, 5000);
            timerInterval = setInterval(function () {
                if (isPaused) return;
                const currentTime = parseInt(timerElement.innerText.replace('Time: ', ''));
                if (currentTime > 0) {
                    timerElement.innerText = `Time: ${currentTime - 1}`;
                } else {
                    clearInterval(timerInterval);
                    checkGameOver();
                }
            }, 1000);
        }
    }

    function checkGameOver() {
        clearInterval(gameInterval);
        clearInterval(timerInterval);
        gameOverPopup.classList.remove("hidden");
        document.getElementById('gameOverUsername').innerText = playerNameInput.value;
        document.getElementById('gameOverCountry').innerText = selectedCountry;
        document.getElementById('gameOverScore').innerText = score;
    }

    function saveMatchHistory() {
        // Save match history to local storage or a database
        // Example: localStorage.setItem('matchHistory', JSON.stringify({ username: playerNameInput.value, country: selectedCountry, score }));
    }

    function displayMatchHistory() {
        // Display match history from local storage or database
        // Example: Fetch from local storage and display
    }

    // Handle pause menu actions
    document.getElementById('continueButton').addEventListener('click', function () {
        togglePause();
    });

    document.getElementById('restartButton').addEventListener('click', function () {
        restartGame();
    });

    document.getElementById('saveHistoryButton').addEventListener('click', function () {
        saveMatchHistory();
    });

    document.getElementById('viewHistoryButton').addEventListener('click', function () {
        displayMatchHistory();
    });

    function restartGame() {
        // Hide game over popup
        gameOverPopup.classList.add("hidden");

        // Reset game variables
        score = 0;
        scoreElement.innerText = `Score: ${score}`;
        timerElement.innerText = `Time: 0`;

        // Stop any ongoing intervals
        clearInterval(gameInterval);
        clearInterval(timerInterval);

        // Reset game state
        gameStarted = false;
        isPaused = false;

        // Show the welcome screen and hide the game screen
        document.querySelector('.welcome-screen').classList.remove('hidden');
        document.querySelector('.game-screen').classList.add('hidden');
    }

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && gameStarted) {
            togglePause();
        }
    });
});
