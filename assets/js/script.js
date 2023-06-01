// load json file song data
var songsData;
fetch('./assets/data/songs.json')
    .then(res => res.json())
    .then((data) => {
        songsData = data;
}).catch(err => console.error(err));

// CODE TO SELECT AND HIGHLIGHT A GAME MODE
// create an HTMLCollection of the mode buttons
let modeButtons = document.getElementsByClassName("mode-button");

/**
 * Sets the "data-chosen" attribute of the clicked mode button to "true", and resets the attribute
 * to "false" for all other cateogry buttons; then applies styles to the selected button and resets the
 * styles on the other buttons
 */
function modeButtonChosen() {
    // set "data-chosen" of all mode buttons to "false"
    for (let button of modeButtons) {
        button.setAttribute("data-chosen", "false")
    }

    // set to "true" for the clicked button
    this.setAttribute("data-chosen", "true");

    // apply highlighting styles to the clicked button and reset styles of all other buttons
    for (button of modeButtons) {
        if (button.getAttribute("data-chosen") === "true") {
            button.style.color = "white";
            button.style.backgroundColor = "rgb(238, 29, 37)";
        } else {
            button.style.color = "";
            button.style.backgroundColor = "";
        }
    }
}

// add "click" event listeners to the mode buttons and pass the above function as event handler
for (let button of modeButtons) {
    button.addEventListener("click", modeButtonChosen);
}

/**
 * Generate indices for the correct and incorrect answers for each question.
 * The correct answers don't repeat, 
 * and each question will have 3 more incorrect answers that don't repeat
 * @returns an array containing the answerIndices array and the correctIndices array
 */
function generateQuestionIndices() {
    // each quiz round has 15 questions
    let numberOfQuestions = 15;

    /**
     * Takes an array as an argument and generates a random number between 0 and 500.
     * If that number is not already in the passed array, adds it to the array; if 
     * the number is already there, generates a new one
    */
    function addNewRandomIndex(array) {
        // generate a random number between 0 (inclusive) and 500 (exclusive) - 500 being the number of songs
        // on the list to be randomly pulled from
        let randomIndex = Math.floor(Math.random() * 500);

        // check if number already in array; if so, generate a new number until one has been found that isn't in the array, if not, add number to array
        if (array.includes(randomIndex)) {
            addNewRandomIndex(array);
        } else {
            array.push(randomIndex);
        }
    }

    /**
     * Takes an array and a number as an argument and generates a random number between 0 and 500.
     * If that number is not already in the passed array, and also not the same as the num, adds it to the array; 
     * if the number is the same as num or already in the array, generates a new one
    */
    function addNewRandomIndexNotX(array, num) {
        // generate a random number between 0 (inclusive) and 500 (exclusive) - 500 being the number of songs
        // on the list to be randomly pulled from
        let randomIndex = Math.floor(Math.random() * 500);

        // check if generated index already in array or equal to num
        // if so, generate a new index until one has been found that isn't in the array, if not, add index to array
        if (array.includes(randomIndex) || randomIndex === num) {
            addNewRandomIndex(array, num);
        } else {
            array.push(randomIndex);
        }
    }


    // GENERATE CORRECT ANSWER INDICES

    // create an empty array that will hold the randomly generated list of indices of the correct answers
    let correctIndices = [];
    
    // add random numbers to the array until the array has enough correct answers for the user-defined number of questions
    while (correctIndices.length < numberOfQuestions) {
        addNewRandomIndex(correctIndices);
    }


    // GENERATE INCORRECT ANSWER INDICES

    // create an empty array to hold the indices for the incorrect answers
    let incorrectIndices = [];

    // for each question, create an array of 3 random incides
    for (let i = 0; i < numberOfQuestions; i++) {
        // create an empty array for each question
        let newIndicesArray = [];

        for (let j = 0; j < 3; j++) {
            addNewRandomIndexNotX(newIndicesArray, correctIndices[i]);
        }

        incorrectIndices.push(newIndicesArray);
    }


    // GENERATE FULL ANSWER INDEX ARRAYS

    // create an empty array to hold all answer indices
    let answerIndices = [];

    // randomly splice the correct anwer indices into an incorrect answer array, then add the new array to answerIndices
    for (let i = 0; i < numberOfQuestions; i++) {
        // create an array that contains the incorrect answers for a question
        let newAnswerIndices = incorrectIndices[i];

        // generate a random position in the newAnswerIndices array
        let position = Math.floor(Math.random() * 4);

        // add the correct answer index to the newAnswerIndices array at the random position
        newAnswerIndices.splice(position, 0, correctIndices[i]);

        // add the complete newAnswerIndices array to answerIndices
        answerIndices.push(newAnswerIndices);
    }


    let output = [answerIndices, correctIndices];

    return output;
}

/**
 * This function will start the game. The function for the relevant game will be called based on which game mode
 * button was chosen, i.e. which game mode button has a "data-chosen" attribute of "true".
 */
function startGame() {
    // declare variables to store the values of the "data-chosen" attributes on the game mode buttons 
    let easyModeChosen = document.getElementById("easy-mode-button").getAttribute("data-chosen");
    let mediumModeChosen = document.getElementById("medium-mode-button").getAttribute("data-chosen");
    let challengingModeChosen = document.getElementById("challenging-mode-button").getAttribute("data-chosen");

    /**
     * Changes the elements that are displayed on game start.
     * Hides game mode question and start quiz button, reveals quiz.
     */
    function gameStartChangeDisplay() {
        // create an empty array to hold the elements that should be hidden
        let elementsToHide = [];

        // add the game mode question and the start quiz button to the hide array
        elementsToHide.push(document.getElementById("game-mode-question"));
        elementsToHide.push(document.getElementById("start-quiz-button"));

        // set display to none for elements to be hidden
        for (let element of elementsToHide) {
            element.setAttribute("style", "display: none;");
        }

        // display the quiz
        let activeGameWrapper = document.getElementById("active-game-wrapper");
        activeGameWrapper.setAttribute("style", "display: initial;");
    }

    // check which game mode was selected. if none, alert the user; if one chosen, run that game
    if (easyModeChosen === "false" && mediumModeChosen === "false" && challengingModeChosen === "false") {
        alert("Whoops! Choose a game mode to begin.");
    } else {
        gameStartChangeDisplay();
        if (easyModeChosen === "true") {
            runGame("easyMode");
        } else if (mediumModeChosen === "true") {
            runGame("mediumMode");
        } else if (challengingModeChosen === "true") {
            runGame("challengingMode");
        }
    }
}

// add an event listener for the "click" event to the start quiz button, and carry out startGame when fired
let startQuizButton = document.getElementById("start-quiz-button");
startQuizButton.addEventListener("click", startGame);

/**
 * Function returns an array with the HTML elements to be changed when the quiz game is run.
 * A function was used to avoid creating global variables.
 * @returns array with the variables holding the quiz question and quiz option HTML elements
 */
function getQuizHTMLElements() {
    // declare variables to hold the HTML elements that will be changed during the quiz
    let quizQuestion = document.getElementById("quiz-question");
    let quizOptionOne = document.getElementById("quiz-option-one");
    let quizOptionTwo = document.getElementById("quiz-option-two");
    let quizOptionThree = document.getElementById("quiz-option-three");
    let quizOptionFour = document.getElementById("quiz-option-four");
    let questionAndOptionElements = [quizQuestion, quizOptionOne, quizOptionTwo, quizOptionThree, quizOptionFour];

    return questionAndOptionElements;
}

/**
 * Runs the quiz. Takes the game mode as an argument (passed from startGame function)
 */
function runGame(gameMode) {
    // set intial question index to 0
    let currentQuestionIndex = 0;

    // get an array with the HTML elements to be changed. first is the quiz question element, then the four quiz option elements
    let quizElements = getQuizHTMLElements();

    // get the indices for all of the quiz answers
    // an array containing two arrays: the answer indices and the correct answer indices
    let questionIndices = generateQuestionIndices();

    /**
     * Gets the question and answer for a quiz question by calling the function for the
     * selected game mode, then displays the quiz content in the document
     */
    function generateQuestion(questionIndex) {
        /**
         * Gets question content based on which game mode was selected
         * @returns an object containing the question as a string and an array of four answer options
         */
        function getQuestionContent() {
            if (gameMode === "easyMode") {
                // get question and answer content for easy quiz
                let questionContent = generateEasyQuestion(questionIndices[1][questionIndex], questionIndices[0][questionIndex]);
                return questionContent;
            } else {
                alert("Whoops! This game hasn't been created yet");
            }
        }

        // store the output of the getQuestionContent function in a variable
        let questionContent = getQuestionContent();

        // DISPLAY QUESTION
        // create a variable to store the HTML element where the quiz question will go
        let questionElement = quizElements[0];
        // add question to quiz
        questionElement.innerHTML = questionContent.question;

        // DISPLAY ANSWER OPTIONS
        // create a variable to store the array of answer options
        let answerOptions = questionContent.answerOptions;
        // add each answer to an HTML option element
        for (let i = 0; i < 4; i++) {
            // i + 1 because the option elements start at index 1 in the quizElements array - index 0 is the question element
            quizElements[i + 1].innerHTML = answerOptions[i];
        }
    }

    // get and display the first question options
    generateQuestion(currentQuestionIndex);

    // ---
    // this code section sets one of the quiz option buttons' "data-chosen" attribute to "true"
    // when clicked and all others to false

    // create an HTMLCollection of the option buttons
    let optionButtons = document.getElementsByClassName("quiz-button");

    /**
     * Resets the size and "data-chosen" attributes of all quiz option buttons
     */
    function resetOptionButtons() {
        for (let button of optionButtons) {
            // reset all vinyl icons to height of 50px
            let vinylIcon = button.firstElementChild;
            vinylIcon.style.height = "50px";

            // set "data-chosen" of all option buttons to "false"
            button.setAttribute("data-chosen", "false")
        }
    }

    /**
     * Sets the "data-chosen" attribute of the clicked option button to "true", and resets 
     * the attribute to "false" for all other option buttons.
     * Also changes sizing of icons to visually show user which option was last selected.
     */
    function optionButtonChosen() {
        // reset button sizes and "data-chosen" values
        resetOptionButtons();

        // make height of selected vinyl icon 60px
        this.firstElementChild.style.height = "60px";

        // set "data-chosen" to "true" for the selected button
        this.setAttribute("data-chosen", "true");
    }

    // add "click" event listeners to the option buttons and pass the above function as event handler
    for (let button of optionButtons) {
        button.addEventListener("click", optionButtonChosen);
    }
    // ---

    // store the game control button elements to add event listeners and so their displays can be changed during game play
    let submitAnswerButton = document.getElementById("submit-answer-button");
    let nextQuestionButton = document.getElementById("next-question-button");

    /**
     * This function will check if the answer selected was correct (called when the user clicks submit)
     */
    function checkAnswer() {
        // get the index of the correct answer to the question
        // pulled from questionIndices, second array (the array of correct answers), then the array of the current question number
        let correctAnswerIndexValue = questionIndices[1][currentQuestionIndex];
        // then, find the position of that index value in the first array (the array of answer options), and the array of the current question number within that
        let correctAnswerArrayPosition = questionIndices[0][currentQuestionIndex].indexOf(correctAnswerIndexValue);

        // store the button with the correct answer
        let correctOptionButton = optionButtons[correctAnswerArrayPosition];

        // create an empty array to hold the value of the option buttons "data-chosen" attributes
        let optionsChosen = [];

        // add the value of "data-chosen" on each button to optionsChosen
        for (let button of optionButtons) {
            optionsChosen.push(button.getAttribute("data-chosen"));
        }

        // store correct answer wrapper HTML element in order to display whether guess was correct or not and display correct answer
        let correctAnswerWrapper = document.getElementById("correct-answer-wrapper");

        // store the HTML elements that will display whether the user was correct and what the correct answer was
        let correctnessResult = document.getElementById("correctness-result");
        let correctAnswerDisplay = document.getElementById("correct-answer-display");

        // create the correct answer display HTML based on the game mode
        if (gameMode === "easyMode") {
            correctAnswerDisplay.innerHTML = generateEasyCorrectAnswerDisplay(correctAnswerIndexValue);
        }

        // if no options were selected, alert user to select an option
        // if the selected option is the correct one (i.e. if the correct option is the button with a "data-chosen" value of "true"),
        // the user will be alerted that they were correct
        // if not, they will be alerted that they were wrong
        if (optionsChosen[0] === "false" && optionsChosen[1] === "false" && optionsChosen[2] === "false"  && optionsChosen[3] === "false") {
            alert("Whoops! Choose an option.");
        } else if (correctOptionButton.getAttribute("data-chosen") === "true") {
            correctnessResult.innerHTML = "Correct!";
            correctnessResult.style.color = "green";

            // make correct answer div visible
            correctAnswerWrapper.style.display = "flex";

            // hide submit answer button and display next question button
            submitAnswerButton.style.display = "none";
            nextQuestionButton.style.display = "initial";
        } else {
            correctnessResult.innerHTML = "Wrong";
            correctnessResult.style.color = "red";

            // make correct answer div visible
            correctAnswerWrapper.style.display = "flex";

            // hide submit answer button and display next question button
            submitAnswerButton.style.display = "none";
            nextQuestionButton.style.display = "initial";
        }
    }

    // add event listener to submit button to trigger answer checking when clicked
    submitAnswerButton.addEventListener("click", checkAnswer);

    /**
     * Runs the next question in the game. Increments the current question number and displays it.
     * If question limit isn't reached, runs the next question; if it is, finished the game.
     */
    function runNextQuestion() {
        // reset size and "data-chosen" attributes of option buttons
        resetOptionButtons();

        // display submit answer button and hide next question button
        submitAnswerButton.style.display = "initial";
        nextQuestionButton.style.display = "none";

        // increment question number
        currentQuestionIndex++;

        // get HTML element for number of questions answered and update it
        let answeredCount = document.getElementById("answered-count");
        answeredCount.innerHTML = currentQuestionIndex;

        // check if last question reached in order to display next question or finish game
        if (currentQuestionIndex < 15) {
            generateQuestion(currentQuestionIndex);
        } else {
            finishGame();
        }
    }

    // run the next question (or finish game) when "next" is clicked
    nextQuestionButton.addEventListener("click", runNextQuestion);
}

/**
 * Generates a question and answer options for the easy version of the quiz.
 * Finds the song title of the correct answer index and creates a question with it,
 * then gets the artist names of the four answer option indices.
 * @param {number} correctAnswerIndex - the index of the correct song answer in songs.json
 * @param {Array} allOptionsArray - an array of the indices for all four answer options
 * @returns an object containing the quiz question as a string and an array of the four answer options
 */
function generateEasyQuestion(correctAnswerIndex, allOptionsArray) {
    // QUESTION
    // create a variable to store the song that the question will ask about
    let questionSongName = songsData[correctAnswerIndex].trackName;

    // create the string with the question HTML
    let question = `What artist on the list performed <span class="song-title">${questionSongName}</span>?`;

    // ANSWER OPTIONS
    // create an empty array to hold the answer options
    let answerOptions = [];

    // get four answer options
    for (let i = 0; i < 4; i++) {
        // create a variable to store the artist name at each of the four answer indices
        let newOption = songsData[allOptionsArray[i]].artistName;

        // add the new artist name to answerOptions array
        answerOptions.push(newOption);
    }

    return {
        question: question,
        answerOptions: answerOptions
    };
}

/**
 * Creates a string of HTML to display the correct answer
 * @param {number} correctAnswerIndex 
 * @returns correct answer string for HTML display
 */
function generateEasyCorrectAnswerDisplay(correctAnswerIndex) {
    // get the song name and artist name of the correct answer
    let correctSongName = songsData[correctAnswerIndex].trackName;
    let correctSongArtist = songsData[correctAnswerIndex].artistName;

    // create the HTML content to display to the correct answer
    let correctAnswer = `<span class="correct-answer">${correctSongName}</span> was performed by <span class="correct-answer">${correctSongArtist}</span>`;

    return correctAnswer;
}

function runMediumGame() {
    console.log("Running medium game");
}

function runChallengingGame() {
    console.log("Running challenging game");
}

function finishGame() {
    console.log("Game finished");
}