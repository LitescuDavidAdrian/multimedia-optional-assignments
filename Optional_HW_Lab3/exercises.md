Exercises

Complete the following exercises to improve your HTML, CSS, and JavaScript skills. Each exercise builds upon the existing code.

    1. Randomize the target word: Instead of hardcoding "media", create an array of possible 5-letter words and randomly select one at the start of each game. Consider using words like: "table", "chair", "piano", "mouse", "house", "plant", "brain", "cloud", "beach", "fruit".
    
    2. Add input validation: Prevent the player from submitting guesses that aren't exactly 5 letters long. Display an appropriate error message (using alerts or better yet, a styled message on the page) when invalid input is submitted.
    
    3. Improve the UI layout: Center the entire game board on the viewport using flexbox. Add spacing between the board and input elements. Style the input field and button to match the game's aesthetic with appropriate padding, borders, and colors.
    
    4. Add a "New Game" button: Create a button that resets the game state, clears all cells, and selects a new random word. This button should only appear after a game ends (win or lose).
    
    5. Implement keyboard support: Allow players to press Enter to submit their guess instead of clicking the button. Add an event listener for the Enter key on the input field.
    
    6. Display the correct word on loss: When the player loses, show the correct word in the alert message (e.g., "You lost! The word was: MEDIA").
    
    7. Add animation effects: Implement CSS transitions or animations when cells change color. Consider adding a flip animation (similar to the real Wordle game) or a fade-in effect when feedback colors appear.
    
    8. Enhanced color feedback logic: Fix potential issues with duplicate letters. The current logic doesn't properly handle cases where a letter appears multiple times in either the guess or the target word. For example, if the word is "LLAMA" and you guess "LLAMA", the feedback should be accurate for repeated letters.
    
    9. Add visual polish:
        Add a title/header for the game
        Improve the color scheme
        Add box shadows to cells for depth
        Style the input and button with hover and focus states
        Add a game statistics display (games played, win percentage, current streak)
