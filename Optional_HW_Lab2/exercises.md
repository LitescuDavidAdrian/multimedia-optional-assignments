Exercises

Complete the following exercises to improve your HTML and CSS skills. Each exercise builds upon the existing code.

    1. Center the entire keyboard on the viewport. You can use vw and vh units of measure for setting the viewport size and flex to position the entire keyboard.

    2. Add a border radius for keyboard, keypad and keys as appropriate, to create a more realistic look of the corners.

    3. The current keyboard has a fixed-width keypad that doesn't fill the container on larger screens. Modify the CSS so that the keypad always fills 100% of the available width in the keyboard container, regardless of screen resolution.

    4. Add visual feedback when hovering over keys. White keys should turn light gray (#f0f0f0) and black keys should turn dark gray (#333) when hovered.

    5. Add smooth CSS transitions to all hover and active states created in exercise 2. The transitions should take 0.1 seconds.

    6. Add note labels (C, D, E, F, G, A, B) to the white keys, then repeat. Position them at the bottom of each white key. Style them with a small font size (10px) and centered alignment. Do the same exercise for black keys, by adding the appropriate labels (C#, Eb, F#, G#, Bb). In the end, for one octave (first 12 keys), the order of the labels should be: C C# D Eb E F F# G G# A Bb B. Then, repeat for the rest of the keys.

    7. Add realistic shadows to create depth:
        White keys should have an inset shadow
        Black keys should have a subtle drop shadow
        When hovered, the shadows should change to create a pressed-in effect
