window.onload = function () {
    let wordList = ["table", "chair", "piano", "mouse", "house", "plant", "brain", "cloud", "beach", "fruit"];
    let word = wordList[Math.floor(Math.random() * wordList.length)];
    let board = document.getElementById('board');
    let guessButton = this.document.getElementById('guessButton');
    let guessInput = this.document.getElementById('guessInput');

    let errorMessage = document.getElementById('errorMessage');

    let newGameButton = document.getElementById('newGameButton');


    let gamesPlayed = 0;
    let wins = 0;
    let currentStreak = 0;

    function updateStats(win) {
        gamesPlayed++;
        if (win) {
            wins++;
            currentStreak++;
        } else {
            currentStreak = 0;
        }
        document.getElementById('gamesPlayed').textContent = gamesPlayed;
        document.getElementById('wins').textContent = wins;
        document.getElementById('winPercent').textContent = Math.round((wins / gamesPlayed) * 100);
        document.getElementById('currentStreak').textContent = currentStreak;
    }

    for (let i = 0; i < 6; i++) {
        let row = this.document.createElement('div');
        row.classList.add('row');
        board.append(row);

        for (let j = 0; j < 5; j++) {
            let cell = this.document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('data-row', i);
            cell.setAttribute('data-column', j);
            row.append(cell);
        }
    }

    let tries = 0;
    let gameOver = false;

    function startNewGame() {
        document.querySelectorAll('.cell').forEach(cell => cell.textContent = '');
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('green', 'yellow', 'red');
        });

        word = wordList[Math.floor(Math.random() * wordList.length)];

        tries = 0;
        gameOver = false;

        newGameButton.style.display = 'none';

        guessInput.value = '';
        errorMessage.textContent = '';
    }

    guessButton.addEventListener('click', function () {
        if (gameOver == true) {
            alert("Game is already over");
            return;
        }

        let guess = guessInput.value.trim().toLowerCase();

        if (guess.length !== 5) {
            errorMessage.textContent = "Guess must be exactly 5 letters!";
            return;
        } else {
            errorMessage.textContent = "";
        }

        let targetLetters = word.split('');
        let guessLetters = guess.split('');
        let letterUsed = Array(targetLetters.length).fill(false);

        let targetCount = {};
        for (let l of targetLetters) {
            targetCount[l] = (targetCount[l] || 0) + 1;
        }

        let usedCount = {};

        for (let i = 0; i < 5; i++) {
            let currentCell = document.querySelector(
                `[data-row="${tries}"][data-column="${i}"]`
            );
            currentCell.textContent = guessLetters[i];
        }

        for (let i = 0; i < 5; i++) {
            ((colIndex, rowIndex) => {
                setTimeout(() => {
                    let currentCell = document.querySelector(
                        `[data-row="${rowIndex}"][data-column="${colIndex}"]`
                    );

                    currentCell.classList.add('flip');

                    setTimeout(() => {
                        let colorClass;

                        if (guessLetters[colIndex] === targetLetters[colIndex]) {
                            colorClass = 'green';
                            usedCount[guessLetters[colIndex]] = (usedCount[guessLetters[colIndex]] || 0) + 1;
                        } else if (targetLetters.includes(guessLetters[colIndex])) {
                            usedCount[guessLetters[colIndex]] = usedCount[guessLetters[colIndex]] || 0;
                            let totalInTarget = targetCount[guessLetters[colIndex]];
                            if (usedCount[guessLetters[colIndex]] < totalInTarget) {
                                colorClass = 'yellow';
                                usedCount[guessLetters[colIndex]]++;
                            } else {
                                colorClass = 'red';
                            }
                        } else {
                            colorClass = 'red';
                        }

                        currentCell.classList.add(colorClass);
                        currentCell.classList.remove('flip');
                    }, 250);

                }, colIndex * 300);
            })(i, tries);
        }

        if (word == guess) {
            alert("You won");
            gameOver = true;
            // guessButton.setAttribute('disabled', 'disabled');
            newGameButton.style.display = 'block';
            updateStats(true);
            return;
        };
        if (tries == 5) {
            alert(`You lost! The word was: ${word.toUpperCase()}`);
            gameOver = true;
            newGameButton.style.display = 'block';
            updateStats(false);
            return;
        }

        guessInput.value = '';

        tries++;
    })

    newGameButton.addEventListener('click', startNewGame);

    guessInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            guessButton.click();
        }
    });
};