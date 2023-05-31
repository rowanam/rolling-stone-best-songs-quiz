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
function runGame() {
    // declare variables to store the values of the "data-chosen" attributes on the game mode buttons 
    let easyModeChosen = document.getElementById("easy-mode-button").getAttribute("data-chosen");
    let mediumModeChosen = document.getElementById("medium-mode-button").getAttribute("data-chosen");
    let challengingModeChosen = document.getElementById("challenging-mode-button").getAttribute("data-chosen");

    // declare a variable to store the starting index value for the question counter
    let startingQuestionIndex = 0;

    // check which game mode was selected. if none, alert the user; if one chosen, run that game
    if (easyModeChosen === "false" && mediumModeChosen === "false" && challengingModeChosen === "false") {
        alert("Whoops! Choose a game mode to begin.");
    } else if (easyModeChosen === "true") {
        runEasyGame(startingQuestionIndex);
    } else if (mediumModeChosen === "true") {
        runMediumGame(startingQuestionIndex);
    } else if (challengingModeChosen === "true") {
        runChallengingGame(startingQuestionIndex);
    }
}

// add an event listener for the "click" event to the start quiz button, and carry out runGame when fired
let startQuizButton = document.getElementById("start-quiz-button");
startQuizButton.addEventListener("click", runGame);

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
 * Runs the easy version of the quiz
 */
function runEasyGame(startingQuestionIndex) {
    let currentQuestionIndex = startingQuestionIndex;

    // get an array with the HTML elements to be changed. first is the quiz question element, then the four quiz option elements
    let quizElements = getQuizHTMLElements();

    // get the indices for all of the quiz answers
    // an array containing two arrays: the answer indices and the correct answer indices
    let questionIndices = generateQuestionIndices();

    /**
     * This function currently gets four answer options for a quiz question, by pulling 
     * data from the objects in songsData at the randomly generated indices,
     * then adding these options to the quiz
     */
    function generateQuestion(questionIndex) {
        // QUESTION
        
        // create a variable to store the HTML element where the quiz question will go
        let questionElement = quizElements[0];

        // create a variable to store the song that the question will ask about
        let questionSongName = songsData[questionIndices[1][questionIndex]].trackName;

        // create HTML with question and add to document
        let question = `What artist on the list performed <span class="song-title">${questionSongName}</span>?`;
        questionElement.innerHTML = question;


        // ANSWER OPTIONS

        // get four answer options and add each to an HTML option element
        for (let i = 0; i < 4; i++) {
            // create a variable to store the artist name at the randomly generated song index
            // array indices guide: first index - the answerIndices array in questionIndices
            // second index - the question number, i.e. the index of a an array in answerIndices (which contains four answer options)
            // third index - the option number, i.e. indices 0-3 in each options array
            let newOption = songsData[questionIndices[0][questionIndex][i]].artistName;

            // add the artist name to the HTML
            // i + 1 because the option elements start at index 1 in the quizElements array - index 0 is the question element
            quizElements[i + 1].innerHTML = newOption;
        }
    }

    // get and display the first question options
    generateQuestion(currentQuestionIndex);

    /**
     * Runs the next question in the game. Increments the current question number and displays it.
     * If question limit isn't reached, runs the next question; if it is, finished the game.
     */
    function runNextQuestion() {
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

    // store the next question button element in a variable
    let nextQuestionButton = document.getElementById("next-question-button");
    // run the next question (or finish game) when "next" is clicked
    nextQuestionButton.addEventListener("click", runNextQuestion);
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