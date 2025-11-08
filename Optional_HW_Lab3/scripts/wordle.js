window.onload = function () {
    let wordList = ["table", "chair", "piano", "mouse", "house", "plant", "brain", "cloud", "beach", "fruit"];
    let word = wordList[Math.floor(Math.random() * wordList.length)];
    let board = document.getElementById('board');
    let guessButton = this.document.getElementById('guessButton');
    let guessInput = this.document.getElementById('guessInput');

    let errorMessage = document.getElementById('errorMessage');

    let newGameButton = document.getElementById('newGameButton');


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

        for (let i = 0; i < 5; i++) {
            let currentCell = document.querySelector(
                `[data-row="${tries}"][data-column="${i}"]`
            );
            let currentLetter = document.createTextNode(guess[i]);
            currentCell.append(currentLetter);

            if (guess[i] == word[i]) {
                //green cell, letter on right position
                currentCell.classList.add('green');
            }
            else {
                if (word.indexOf(guess[i]) < 0) {
                    //red cell, letter not found
                    currentCell.classList.add('red');
                }
                else {
                    //yellow cell
                    currentCell.classList.add('yellow');
                }
            }
        }
        if (word == guess) {
            alert("You won");
            gameOver = true;
            // guessButton.setAttribute('disabled', 'disabled');
            newGameButton.style.display = 'block';
            return;
        };
        if (tries == 5) {
            alert("You lost");
            gameOver = true;
            newGameButton.style.display = 'block';
            return;
        }

        tries++;
    })

    newGameButton.addEventListener('click', startNewGame);
    
    guessInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            guessButton.click();
        }
    });
};