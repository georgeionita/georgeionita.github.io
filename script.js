document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const cells = document.querySelectorAll('.cell');
    const statusDisplay = document.getElementById('status');
    const restartButton = document.getElementById('restartButton');
    const computerOpponentToggle = document.getElementById('computerOpponentToggle');
    
    // Initialize confetti
    confetti.init();
    
    // Initialize audio manager
    audioManager.init();
    
    let gameActive = true;
    let currentPlayer = 'heart';
    let gameState = ['', '', '', '', '', '', '', '', ''];
    let playAgainstComputer = true;
    
    const winningConditions = [
        [0, 1, 2], // top row
        [3, 4, 5], // middle row
        [6, 7, 8], // bottom row
        [0, 3, 6], // left column
        [1, 4, 7], // middle column
        [2, 5, 8], // right column
        [0, 4, 8], // diagonal top-left to bottom-right
        [2, 4, 6]  // diagonal top-right to bottom-left
    ];
    
    const symbols = {
        'heart': '♥',
        'star': '★'
    };
    
    const messages = {
        playerTurn: () => `${currentPlayer === 'heart' ? 'Heart' : 'Star'}'s turn`,
        gameWon: () => `${currentPlayer === 'heart' ? 'Heart' : 'Star'} has won!`,
        gameDraw: () => 'Game ended in a draw!'
    };
    
    // Set initial state based on toggle
    playAgainstComputer = computerOpponentToggle.checked;
    
    // Add event listener for toggle changes
    computerOpponentToggle.addEventListener('change', () => {
        playAgainstComputer = computerOpponentToggle.checked;
        handleRestartGame();
    });
    
    function handleCellClick(clickedCellEvent) {
        const clickedCell = clickedCellEvent.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));
        
        if (gameState[clickedCellIndex] !== '' || !gameActive) {
            return;
        }
        
        handleCellPlayed(clickedCell, clickedCellIndex);
        handleResultValidation();
        
        // If game is still active and playing against computer, make computer move
        if (gameActive && playAgainstComputer) {
            // Small delay before computer makes a move
            setTimeout(() => {
                makeComputerMove();
            }, 500);
        }
    }
    
    function handleCellPlayed(clickedCell, clickedCellIndex) {
        gameState[clickedCellIndex] = currentPlayer;
        clickedCell.classList.add(currentPlayer);
        clickedCell.textContent = symbols[currentPlayer];
    }
    
    function handleResultValidation() {
        let roundWon = false;
        
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            const position1 = gameState[a];
            const position2 = gameState[b];
            const position3 = gameState[c];
            
            if (position1 === '' || position2 === '' || position3 === '') {
                continue;
            }
            
            if (position1 === position2 && position2 === position3) {
                roundWon = true;
                break;
            }
        }
        
        if (roundWon) {
            statusDisplay.textContent = messages.gameWon();
            gameActive = false;
            
            // Start confetti explosion when a player wins
            confetti.start();
            
            // Play victory sound
            audioManager.play('victory');
            
            return;
        }
        
        const roundDraw = !gameState.includes('');
        if (roundDraw) {
            statusDisplay.textContent = messages.gameDraw();
            gameActive = false;
            return;
        }
        
        handlePlayerChange();
    }
    
    function handlePlayerChange() {
        currentPlayer = currentPlayer === 'heart' ? 'star' : 'heart';
        statusDisplay.textContent = messages.playerTurn();
    }
    
    function makeComputerMove() {
        if (!gameActive) return;
        
        // Get available moves
        const availableMoves = [];
        gameState.forEach((cell, index) => {
            if (cell === '') {
                availableMoves.push(index);
            }
        });
        
        if (availableMoves.length === 0) return;
        
        // Try to make a smart move
        const smartMove = findSmartMove();
        
        if (smartMove !== -1) {
            const computerCell = document.querySelector(`[data-cell-index="${smartMove}"]`);
            handleCellPlayed(computerCell, smartMove);
        } else {
            // If no smart move, make a random move
            const randomIndex = Math.floor(Math.random() * availableMoves.length);
            const computerMoveIndex = availableMoves[randomIndex];
            const computerCell = document.querySelector(`[data-cell-index="${computerMoveIndex}"]`);
            handleCellPlayed(computerCell, computerMoveIndex);
        }
        
        handleResultValidation();
    }
    
    function findSmartMove() {
        // First, check if computer can win in the next move
        for (let i = 0; i < gameState.length; i++) {
            if (gameState[i] === '') {
                // Try this move
                gameState[i] = currentPlayer;
                
                // Check if this leads to a win
                let roundWon = checkForWin();
                
                // Undo the move
                gameState[i] = '';
                
                if (roundWon) {
                    return i; // Return winning move
                }
            }
        }
        
        // Check if player can win in the next move and block
        const opponent = currentPlayer === 'heart' ? 'star' : 'heart';
        
        for (let i = 0; i < gameState.length; i++) {
            if (gameState[i] === '') {
                // Try this move for the opponent
                gameState[i] = opponent;
                
                // Check if this would lead to opponent winning
                let roundWon = checkForWin(opponent);
                
                // Undo the move
                gameState[i] = '';
                
                if (roundWon) {
                    return i; // Block opponent's winning move
                }
            }
        }
        
        // Try to take the center
        if (gameState[4] === '') {
            return 4;
        }
        
        // Try to take the corners
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(corner => gameState[corner] === '');
        
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
        
        // No smart move found
        return -1;
    }
    
    function checkForWin(player = currentPlayer) {
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            if (gameState[a] === player && gameState[b] === player && gameState[c] === player) {
                return true;
            }
        }
        return false;
    }
    
    function handleRestartGame() {
        gameActive = true;
        currentPlayer = 'heart';
        gameState = ['', '', '', '', '', '', '', '', ''];
        statusDisplay.textContent = messages.playerTurn();
        
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('heart');
            cell.classList.remove('star');
        });
        
        // Stop any ongoing confetti
        confetti.stop();
    }
    
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });
    
    restartButton.addEventListener('click', handleRestartGame);
});
