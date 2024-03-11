// Variables globales
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameOver = false;
let winner = null;
let moves = 0;
let startTime = null;
let endTime = null;
let elapsedTime = null;
let playerRecord = null;
let leaderboardData = [];

// Obtener elementos del DOM
const cells = document.querySelectorAll('.cell');
const statusDisplay = document.querySelector('.status');
const resetButton = document.querySelector('.reset-button');
const timerDisplay = document.querySelector('.timer');
const registerButton = document.querySelector('.register-button');
const playerNameInput = document.querySelector('.player-name-input');
const playerRecordDisplay = document.querySelector('.player-record');
const leaderboardList = document.querySelector('.leaderboard-list');

// Función para iniciar el juego
function startGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameOver = false;
    winner = null;
    moves = 0;
    startTime = null;
    endTime = null;
    elapsedTime = null;
    playerRecord = null;
    timerDisplay.textContent = '00:00';
    statusDisplay.textContent = `Turno del jugador ${currentPlayer}`;
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('winner');
    });
    resetButton.style.display = 'none';
    registerButton.style.display = 'none';
    playerNameInput.style.display = 'none';
}

// Función para manejar el click en una celda
function handleCellClick(index) {
    if (gameOver || board[index] !== '') return;
    
    board[index] = currentPlayer;
    moves++;

    if (moves === 1) {
        startTime = performance.now();
        startTimer();
    }

    // Actualizar el contenido de la celda
    cells[index].textContent = currentPlayer;

    // Comprobar si hay un ganador
    checkWinner();

    // Comprobar si hay empate
    if (!gameOver && moves === 9) {
        statusDisplay.textContent = '¡Empate!';
        gameOver = true;
        resetButton.style.display = 'block';
        return;
    }

    // Cambiar el jugador
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';

    // Actualizar el mensaje de estado
    statusDisplay.textContent = `Turno del jugador ${currentPlayer}`;

    // Si el juego no ha terminado y es el turno de la computadora, realiza su movimiento
    if (!gameOver && currentPlayer === 'O') {
        computerMove();
    }
}

// Función para que la computadora realice su movimiento
function computerMove() {
    // Obtener índice de una celda vacía al azar
    let index;
    do {
        index = Math.floor(Math.random() * 9);
    } while (board[index] !== '');

    // Simular un retraso para que parezca que la computadora está "pensando"
    setTimeout(() => {
        handleCellClick(index);
    }, 500);
}

// Función para iniciar el cronómetro
function startTimer() {
    let interval = setInterval(() => {
        if (!gameOver) {
            endTime = performance.now();
            elapsedTime = Math.floor((endTime - startTime) / 1000);
            const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
            const seconds = (elapsedTime % 60).toString().padStart(2, '0');
            timerDisplay.textContent = `${minutes}:${seconds}`;
        } else {
            clearInterval(interval);
        }
    }, 1000);
}

// Función para comprobar si hay un ganador
function checkWinner() {
    const winningCombos = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (const combo of winningCombos) {
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            winner = board[a];
            cells[a].classList.add('winner');
            cells[b].classList.add('winner');
            cells[c].classList.add('winner');
            if (winner === 'X') {
                statusDisplay.textContent = `¡El jugador ${winner} ha ganado!`;
                recordTimeIfNeeded();
                showRegisterForm();
                updateLeaderboard();
            } else {
                statusDisplay.textContent = `¡Has perdido!`;
                resetButton.style.display = 'block';
            }
            gameOver = true;
            return;
        }
    }
}


// Función para registrar el tiempo si el jugador gana
function recordTimeIfNeeded() {
    if (winner === 'X') {
        playerRecord = elapsedTime;
        playerRecordDisplay.textContent = `Tu tiempo récord: ${formatTime(playerRecord)}`;
    }
}

// Función para mostrar el formulario de registro
function showRegisterForm() {
    if (winner !== null) {
        registerButton.style.display = 'block';
        playerNameInput.style.display = 'block';
    }
}

// Función para manejar el registro del jugador
function registerPlayer() {
    const playerName = playerNameInput.value.trim();
    if (playerName !== '') {
        leaderboardData.push({ name: playerName, time: playerRecord });
        leaderboardData.sort((a, b) => a.time - b.time);
        leaderboardData = leaderboardData.slice(0, 10); // Mantener solo los primeros 10 registros
        localStorage.setItem('leaderboard', JSON.stringify(leaderboardData));
        updateLeaderboard();
        resetGame();
    }
}

// Función para formatear el tiempo en formato mm:ss
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const remainingSeconds = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remainingSeconds}`;
}

// Función para reiniciar el juego
function resetGame() {
    startGame();
}

// Función para actualizar el listado de los mejores tiempos en el DOM
function updateLeaderboard() {
    leaderboardList.innerHTML = '';
    leaderboardData.forEach((entry, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${index + 1}. ${entry.name}: ${formatTime(entry.time)}`;
        leaderboardList.appendChild(listItem);
    });
}

// Añadir event listeners a las celdas
cells.forEach((cell, index) => {
    cell.addEventListener('click', () => handleCellClick(index));
});

// Event listener para el botón de reiniciar
resetButton.addEventListener('click', resetGame);

// Event listener para el botón de registro
registerButton.addEventListener('click', registerPlayer);

// Cargar datos del leaderboard desde LocalStorage al cargar la página
window.addEventListener('DOMContentLoaded', () => {
    const storedData = localStorage.getItem('leaderboard');
    if (storedData) {
        leaderboardData = JSON.parse(storedData);
        updateLeaderboard();
    }
});

// Iniciar el juego
startGame();
