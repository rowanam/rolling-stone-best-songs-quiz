// load json file song data
var songsData;
fetch('./assets/data/songs.json')
    .then((res) => res.json())
    .then((data) => {
        songsData = data;
}).catch((err) => console.error(err));

// CODE TO SELECT AND HIGHLIGHT A GAME MODE
// create an HTMLCollection of the mode buttons
let modeButtons = document.getElementsByClassName("mode-button");

/**
 * Resets the "data-chosen" attribute and highlighting styles of all mode buttons
 */
function resetModeButtons() {
    for (let button of modeButtons) {
        // set "data-chosen" of all mode buttons to "false"
        button.setAttribute("data-chosen", "false");

        // reset styles
        button.style.color = "";
        button.style.backgroundColor = "";
        button.style.border = "";
    }
}

/**
 * Resets all mode buttons, then sets "data-chosen" to "true" and applies styles to the clicked button.
 * Hides an alert text box that tells the user to choose a game mode.
 */
function modeButtonChosen() {
    // reset "data-chosen" value and styles for all mode buttons
    resetModeButtons();

    // set to "true" for the clicked button
    this.setAttribute("data-chosen", "true");

    // apply highlighting styles to the clicked button
    for (let button of modeButtons) {
        if (button.getAttribute("data-chosen") === "true") {
            button.style.color = "white";
            button.style.backgroundColor = "#ee1d25";
            button.style.border = "#ee1d25 1px solid";
        }
    }

    // hide text to alert user that no mode button was chosen
    let selectModeAlert = document.getElementById("select-mode-alert");
    selectModeAlert.style.display = "none";
}

// add "click" event listeners to the mode buttons and pass the above function as event handler
for (let button of modeButtons) {
    button.addEventListener("click", modeButtonChosen);
}

/**
 * Generate a non-repeating array of the indices for the song that each question will be about.
 * @returns an array containing the song indices for each question
 */
function generateQuizSongIndices() {
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

    // GENERATE CORRECT ANSWER INDICES

    // create an empty array that will hold the randomly generated list of indices of the correct answers
    let quizSongIndices = [];
    
    // add random numbers to the array until the array has enough correct answers for the user-defined number of questions
    while (quizSongIndices.length < numberOfQuestions) {
        addNewRandomIndex(quizSongIndices);
    }

    return quizSongIndices;
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

        // add page elements to the hide array
        elementsToHide.push(document.getElementById("game-mode-question"));
        elementsToHide.push(document.getElementById("start-quiz-button"));
        elementsToHide.push(document.getElementById("instructions-wrapper"));
        elementsToHide.push(document.getElementById("start-game-wrapper"));

        let gameModeDescriptions = document.getElementsByClassName("game-mode-description");
        for (let p of gameModeDescriptions) {
            elementsToHide.push(p);
        }

        // set display to none for elements to be hidden
        for (let element of elementsToHide) {
            element.setAttribute("style", "display: none;");
        }

        // reduce game mode button sizes and reposition
        let gameModesDivs = document.getElementsByClassName("game-mode");
        for (let div of gameModesDivs) {
            div.style.width = "fit-content";
            div.style.margin = "0 10px";
        }
        let modeButtons = document.getElementsByClassName("mode-button");
        for (let button of modeButtons) {
            button.style.fontSize = ".9rem";
            button.style.padding = "8px";
        }
        let modeWrapper = document.getElementById("mode-wrapper");
        modeWrapper.style.width = "100%";
        let gameModesWrapper = document.getElementById("game-modes-wrapper");
        gameModesWrapper.style.justifyContent = "center";

        // display the quiz
        let activeGameWrapper = document.getElementById("active-game-wrapper");
        activeGameWrapper.setAttribute("style", "display: initial;");
    }

    // check which game mode was selected. if none, alert the user; if one chosen, run that game
    if (easyModeChosen === "false" && mediumModeChosen === "false" && challengingModeChosen === "false") {
        let selectModeAlert = document.getElementById("select-mode-alert");
        selectModeAlert.style.display = "initial";
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
 * Returns the rank bracket of a song rank (intervals of 50)
 * @param {number} rank
 * @returns rankBracket
 */
function getRankBracket(rank) {
    let rankBracket;

    if (rank <= 50) {
        rankBracket = "1 to 50";
    } else if (rank <= 100) {
        rankBracket = "51 to 100";
    } else if (rank <= 150) {
        rankBracket = "101 to 150";
    } else if (rank <= 200) {
        rankBracket = "151 to 200";
    } else if (rank <= 250) {
        rankBracket = "201 to 250";
    } else if (rank <= 300) {
        rankBracket = "251 to 300";
    } else if (rank <= 350) {
        rankBracket = "301 to 350";
    } else if (rank <= 400) {
        rankBracket = "351 to 400";
    } else if (rank <= 450) {
        rankBracket = "401 to 450";
    } else if (rank <= 500) {
        rankBracket = "451 to 500";
    }

    return rankBracket;
}

/**
 * Converts song duration ms to a readable format ("x mins and y s")
 * @param {number} ms - the duration of a song in ms
 * @returns converted answer as template literal string
 */
function convertDurationToReadable(ms) {
    let convertedToSeconds = ms / 1000;
    let minutesOfAnswer = Math.floor(convertedToSeconds / 60);
    let secondsOfAnswer = Math.floor(convertedToSeconds - minutesOfAnswer * 60);
    let convertedAnswer = `${minutesOfAnswer} mins ${secondsOfAnswer} s`;

    return convertedAnswer;
}

/**
 * Runs the quiz. Takes the game mode as an argument (passed from startGame function)
 */
function runGame(gameMode) {
    // set intial question index to 0
    let currentQuestionIndex = 0;

    // set number of questions answered display to 0 initially
    let answeredCount = document.getElementById("answered-count");
    answeredCount.innerHTML = currentQuestionIndex;

    // get an array with the HTML elements to be changed. first is the quiz question element, then the four quiz option elements
    let quizElements = getQuizHTMLElements();

    // get the indices for the correct quiz answers
    let quizSongIndices = generateQuizSongIndices();

    // create a variable to store the type of question that was asked (e.g. artist, rank bracket, highest tempo)
    let questionType;
    // create a variable to store the type of answer that will be created (e.g. artist, album name)
    let answerType;
    
    // create a variable to store the question content each time it is generated (for use later in the function)
    let questionContent;

    /**
     * Gets the question and answers for a quiz question by calling the function for the
     * selected game mode, then displays the quiz content in the document
     */
    function generateQuestion(questionIndex) {
        // generate question content for the current question
        questionContent = generateQuestionContent(quizSongIndices[questionIndex], gameMode);

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

        // UPDATE THE QUESTION AND ANSWER TYPES
        questionType = questionContent.questionType;
        answerType = questionContent.answerType;
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
            button.setAttribute("data-chosen", "false");
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

    // store the game control button elements
    let submitAnswerButton = document.getElementById("submit-answer-button");
    let nextQuestionButton = document.getElementById("next-question-button");

    // store the correct answer div elements
    let correctAnswerWrapper = document.getElementById("correct-answer-wrapper");
    let correctnessResult = document.getElementById("correctness-result");
    let correctAnswerDisplay = document.getElementById("correct-answer-display");

    // set initial number of correct guesses to 0
    let correctCount = 0;

    /**
     * This function will check if the answer selected was correct
     */
    function checkAnswer(correctAnswerArrayPosition, correctAnswerIndexValue) {
        // store the button with the correct answer
        let correctOptionButton = optionButtons[correctAnswerArrayPosition];

        // create an empty array to hold the value of the option buttons "data-chosen" attributes
        let optionsChosen = [];

        // add the value of "data-chosen" on each button to optionsChosen
        for (let button of optionButtons) {
            optionsChosen.push(button.getAttribute("data-chosen"));
        }

        // create the correct answer display HTML based on the type of question that was asked
        correctAnswerDisplay.innerHTML = generateCorrectAnswerDisplay(correctAnswerIndexValue, questionType, answerType);

        // if no options were selected, alert user to select an option
        // if the selected option is the correct one (i.e. if the correct option is the button with a "data-chosen" value of "true"),
        // the user will be alerted that they were correct
        // if not, they will be alerted that they were wrong
        if (optionsChosen[0] === "false" && optionsChosen[1] === "false" && optionsChosen[2] === "false"  && optionsChosen[3] === "false") {
            alert("Whoops! Choose an option.");
        } else if (correctOptionButton.getAttribute("data-chosen") === "true") {
            // add 1 to correct guesses count if answer correct
            correctCount++;

            // display "Correct!" to user
            correctnessResult.innerHTML = "Correct!";
            correctnessResult.style.color = "green";

            // make correct answer div visible
            correctAnswerWrapper.style.display = "flex";

            // hide submit answer button and display next question button
            submitAnswerButton.style.display = "none";
            nextQuestionButton.style.display = "initial";
        } else {
            // display "Wrong" to user
            correctnessResult.innerHTML = "Wrong";
            correctnessResult.style.color = "red";

            // make correct answer div visible
            correctAnswerWrapper.style.display = "flex";

            // make correct answer visible
            correctAnswerDisplay.style.display = "initial";

            // hide submit answer button and display next question button
            submitAnswerButton.style.display = "none";
            nextQuestionButton.style.display = "initial";
        }
    }

    /**
     * Defines the correct answer song index based on the question type, then calls function to check whether user selected correct answer
     */
    function determineCorrectAnswer() {
        // store the array of answer options for the current question
        let answerOptionsArray = questionContent.answerOptions;

        // create variables to store the index (in the options array) and the index (in the songs list) of the correct answer
        let correctAnswerArrayPosition;
        let correctAnswerIndexValue;
        
        /* Some question types will have correct answers determined by the random generation in the generateQuestionIndices function;
        for others, the question will compare a feature of each of the songs to each other, so the correct answer will be determined by which songs are compared.
        Broadly, there are two types of questions: 
        a) This THING (either a song or an artist) has a PROPERTY (e.g. album name, rank) of which of the following?
        b) Which of the following songs has the MOST OF THIS PROPERTY (e.g. tempo) */
        if (questionType === 0 || questionType === 1 || questionType === 2) {
            // set correct answer value equal to value generated by generateQuizSongIndices function
            let correctAnswerValue = songsData[quizSongIndices[currentQuestionIndex]][answerType];
            // find the correct answer in the answers array
            correctAnswerArrayPosition = answerOptionsArray.indexOf(correctAnswerValue);

            // find the songs list index of the correct answer, which  was generated by the generateQuizSongIndices function
            correctAnswerIndexValue = quizSongIndices[currentQuestionIndex];
        } else if (questionType === 3) {
            // get the rank bracket of the correct answer
            let correctAnswerValue = songsData[quizSongIndices[currentQuestionIndex]][answerType];
            let correctAnswerRankBracket = getRankBracket(correctAnswerValue);

            // determine the index of the correct answer in the options array and in the songs list
            correctAnswerArrayPosition = answerOptionsArray.indexOf(correctAnswerRankBracket);
            correctAnswerIndexValue = quizSongIndices[currentQuestionIndex];
        } else if (questionType === 4) {
            // get the converted (to readable format) length of the correct answer
            let correctAnswerValue = songsData[quizSongIndices[currentQuestionIndex]][answerType];
            let correctAnswerConvertedValue = convertDurationToReadable(correctAnswerValue);

            // determine the index of the correct answer in the options array and in the songs list
            correctAnswerArrayPosition = answerOptionsArray.indexOf(correctAnswerConvertedValue);
            correctAnswerIndexValue = quizSongIndices[currentQuestionIndex];
        } else if (questionType === 5) {
            // get the tempos of the answer options
            let tempos = [];
            for (let option of answerOptionsArray) {
                // find the index of the song in the songs list with the track name of each answer option
                let indexValue = songsData.findIndex(item => item.trackName === option);

                // get the tempo property value and add it to the array of tempos
                let tempo = songsData[indexValue].trackTempo;
                tempos.push(tempo);
            }

            // find the highest tempo
            let maxTempo = Math.max(...tempos);

            // find the array index position of the highest tempo
            let maxArrayPosition = tempos.indexOf(maxTempo);
            correctAnswerArrayPosition = maxArrayPosition;

            // get the songs list index of the correct answer
            correctAnswerIndexValue = songsData.findIndex(item => item.trackName === answerOptionsArray[maxArrayPosition]);
        }

        // check and display whether the user-selected answer was correct
        checkAnswer(correctAnswerArrayPosition, correctAnswerIndexValue);
    }

    // add event listener to submit button to trigger answer checking when clicked
    submitAnswerButton.addEventListener("click", determineCorrectAnswer);

    /**
     * Resets the quiz display
     */
    function resetDisplayNewQuestion() {
        // reset size and "data-chosen" attributes of option buttons
        resetOptionButtons();

        // reset correct answer div and correct answer display
        correctAnswerWrapper.style.display = "";
        correctAnswerDisplay.style.display = "";

        // display submit answer button and hide next question button
        submitAnswerButton.style.display = "initial";
        nextQuestionButton.style.display = "none";
    }

    /**
     * Runs the next question in the game. Increments the current question number and displays it.
     * If question limit isn't reached, runs the next question; if it is, finished the game.
     */
    function runNextQuestion() {
        // reset the display
        resetDisplayNewQuestion();

        // increment question number
        currentQuestionIndex++;

        // get HTML element for number of questions answered and update it
        let answeredCount = document.getElementById("answered-count");
        answeredCount.innerHTML = currentQuestionIndex;

        // check if last question reached in order to display next question or finish game
        if (currentQuestionIndex < 15) {
            generateQuestion(currentQuestionIndex);
        } else {
            finishGame(correctCount);
        }
    }

    // run the next question (or finish game) when "next" is clicked
    nextQuestionButton.addEventListener("click", runNextQuestion);
}

/**
 * Gets question and answer options.
 * Creates a string with the question (as HTMl) and an array of the answer options, based on what game mode is being played.
 * @param {number} correctAnswerIndex - the index of the correct song answer in songs.json
 * @param {Array} allOptionsArray - an array of the indices for all four answer options
 * @param {string} gameMode
 * @returns an object containing the quiz question as a string and an array of the four answer options
 */
function generateQuestionContent(correctAnswerIndex, gameMode) {
    // create a variable to store the quiz question
    let question;
    // create an empty array to hold the answer options
    let answerOptions = [];
    // create a variable to store the type of question that is being asked
    let answerType;
    
    // create a variable to store the song that the question will ask about
    let questionSongName = songsData[correctAnswerIndex].trackName;
    // create a variable to store the correct song's artist
    let questionArtistName = songsData[correctAnswerIndex].artistName;

    /**
     * Creates four answer options by generating three random answers that are not the same as the correct answer
     * @param {string} answerType - which piece of data should be retrieved about the song (e.g. artist, album name)
     * @returns an array with four answer options
     */
    function generateFourAnswerValues(answerType) {
        /**
         * Takes an array and a number as an argument and generates a random number between 0 and 500.
         * If that number is not already in the passed array, and also not the same as the num, adds it to the array; 
         * if the number is the same as num or already in the array, generates a new one
        */
        function addNewRandomIndexNotX(array, answerType, value) {
            /* generate a random number between 0 (inclusive) and 500 (exclusive) - 500 being the number of songs
            on the list to be randomly pulled from */
            let randomIndex = Math.floor(Math.random() * 500);
            let randomAnswer = songsData[randomIndex][answerType];

            // check if generated answer already in array or equal to value
            // if so, generate a new answer until one has been found that isn't in the array; if not, add it to array
            if (array.includes(randomAnswer) || randomAnswer === value) {
                addNewRandomIndexNotX(array, answerType, value);
            } else {
                array.push(randomAnswer);
            }
        }

        // get the value of the correct answer
        let correctAnswer = songsData[correctAnswerIndex][answerType];


        // GENERATE INCORRECT ANSWERS

        // create an empty array to hold the incorrect answers
        let incorrectAnswers = [];

        // for each question, create 3 random incorrect answers and add them to incorrectAnswers array
        for (let i = 0; i < 3; i++) {
            addNewRandomIndexNotX(incorrectAnswers, answerType, correctAnswer);
        }


        // GENERATE FULL ANSWER OPTIONS ARRAY

        // create an array that contains all of the incorrect answers options
        let allOptionsArray = incorrectAnswers;

        // generate a random position in the array
        let position = Math.floor(Math.random() * 4);

        // add the correct answer to the array at the random position
        allOptionsArray.splice(position, 0, correctAnswer);

        // set answerOptions equal to allOptionsArray
        answerOptions = allOptionsArray;
    }

    /**
     * Gets four answer options for the rank bracket question
     */
    function getFourAnswerValuesRankBrackets() {
        // get correct answer rank bracket
        let correctAnswerRank = songsData[correctAnswerIndex].rank;
        let correctAnswerRankBracket = getRankBracket(correctAnswerRank);

        /**
         * Generates a random rank bracket
         * @returns a random rank bracket
         */
        function generateRandomRankBracket() {
            // picks a random number between 0 and 9 (inclusive), then multiplies it by 50 and adds 1
            // this way, it will always be the first value in one of the above rank brackets
            let randomNum = Math.floor(Math.random() * 10);
            let randomRank = randomNum * 50 + 1;
            let randomRankBracket = getRankBracket(randomRank);

            // return the randomly generated rank bracket
            return randomRankBracket;
        }

        /**
         * Adds three random rank brackets to answerOptions array.
         * Checks that the new rank bracket isn't already in the array or the same as the correct answer, and loops until
         * it finds a new option, then adds it to the array.
         */
        function addRankBracketOption() {
            // generates a random rank bracket
            let newRankBracketOption = generateRandomRankBracket();

            // if the generated bracket is the same as the correct answer or already in the array, generates again
            // until a new option is found
            while (newRankBracketOption === correctAnswerRankBracket || answerOptions.includes(newRankBracketOption)) {
                newRankBracketOption = generateRandomRankBracket();
            }
            
            // add the new (unique) option to the array
            answerOptions.push(newRankBracketOption);
        }

        // add three new rank brackets to the answer options
        while (answerOptions.length < 3) {
            addRankBracketOption();
        }

        // insert the correct answer in a random position in the list of answers
        let randomPosition = Math.floor(Math.random() * 4);
        answerOptions.splice(randomPosition, 0, correctAnswerRankBracket);
    }

    let questionSongNameHTML = `<span class="song-title">${questionSongName}</span>`;

    /**
     * Creates question and gets answer options for question about artist
     */
    function artistQuestion() {
        // create the string with the question HTML
        question = `What <span class="question-type">artist</span> on the list performed ${questionSongNameHTML}?`;

        // get four answer options
        generateFourAnswerValues("artistName");

        // set answerType
        answerType = "artistName";
    }

    /**
     * Creates question and gets answer options for question about song release year
     */
    function yearQuestion() {
        // create the string with the question HTML
        question = `What <span class="question-type">year</span> was the song ${questionSongNameHTML} (as performed by ${questionArtistName}) released?`;

        // get four answer options
        generateFourAnswerValues("albumReleaseYear");

        // set answerType
        answerType = "albumReleaseYear";
    }

    /**
     * Creates question and gets answer options for question about album name
     */
    function albumNameQuestion() {
        // create the string with the question HTML
        question = `Which <span class="question-type">album</span> included the song ${questionSongNameHTML}?`;

        // get four answer options
        generateFourAnswerValues("albumName");

        // set answerType
        answerType = "albumName";
    }

    /**
     * Creates question and gets answer options for question about song rank bracket
     */
    function rankBracketQuestion() {
        // create the string with the question HTML
        question = `What is the <span class="question-type">rank</span> of ${questionSongNameHTML} on the list?`;
        
        // get four answer options
        getFourAnswerValuesRankBrackets();

        // set answerType
        answerType = "rank";
    }

    function songLengthQuestion() {
        // create the string with the question HTML
        question = `How <span class="question-type">long</span> is ${questionSongNameHTML}?`;

        // get four answer options
        generateFourAnswerValues("trackDurationMS");
        // convert ms values to readable song lengths
        let convertedAnswerOptions = [];
        for (let answerOption of answerOptions) {
            let convertedAnswerOption = convertDurationToReadable(answerOption);
            convertedAnswerOptions.push(convertedAnswerOption);
        }
        answerOptions = convertedAnswerOptions;

        // set answerType
        answerType = "trackDurationMS";
    }

    function highestTempoQuestion() {
        // create the string with the question HTML
        question = `Which song is the <span class="question-type">fastest</span>?`;

        // get four answer options
        generateFourAnswerValues("trackName");

        // set answerType
        answerType = "trackName";
    }

    /**
     * Calls a question-creating function based on the question type number that gets passed
     * @param {number} passedQuestionType - the number corresponding to a question type
     */
    function createQuestionContent(passedQuestionType) {
        // 0 --> question about artist
        // 1 --> question about song release year
        // 2 --> question about album name
        // 3 --> question about rank bracket
        // 4 --> question about song length
        // 5 --> question about highest tempo
        if (passedQuestionType === 0) {
            artistQuestion();
        } else if (passedQuestionType === 1) {
            yearQuestion();
        } else if (passedQuestionType === 2) {
            albumNameQuestion();
        } else if (passedQuestionType === 3) {
            rankBracketQuestion();
        } else if (passedQuestionType === 4) {
            songLengthQuestion();
        } else if (passedQuestionType === 5) {
            highestTempoQuestion();
        }
    }

    // create a variable to store the number corresponding to the question type
    let questionType;

    // check which game mode is being played and randomly generate numbers to determine which question type will be asked
    if (gameMode === "easyMode") {
        // for easy quiz, only artists will be asked about
        questionType = 0;
    } else if (gameMode === "mediumMode") {
        // randomly decide which category should be asked about (first three categories for medium)
        questionType = Math.floor(Math.random() * 3);
    } else if (gameMode === "challengingMode") {
        // randomly decide which category should be asked about (all categories for challenging)
        questionType = Math.floor(Math.random() * 6);
    }

    // create question content based on which question type was randomly selected
    createQuestionContent(questionType);

    // returns an object containing the question (HTMl string), an array of answer options, and the question and answer types
    return {
        question: question,
        answerOptions: answerOptions,
        questionType: questionType,
        answerType: answerType
    };
}

/**
 * Creates a string of HTML to display the correct answer
 * @param {number} correctAnswerIndex 
 * @returns correct answer string for HTML display
 */
function generateCorrectAnswerDisplay(correctAnswerIndex, questionType, answerType) {
    // create a variable to store the correct answer string
    let correctAnswerDisplayString;

    // get the song name of the correct answer
    let correctSongName = songsData[correctAnswerIndex].trackName;
    // get the artist name of the correct answer
    let correctSongArtist = songsData[correctAnswerIndex].artistName;
    // get the release year of the correct answer
    let correctReleaseYear = songsData[correctAnswerIndex].albumReleaseYear;
    // get the album name of the correct asnwer
    let correctAlbumName = songsData[correctAnswerIndex].albumName;
    // get the rank of the correct answer
    let correctRank = songsData[correctAnswerIndex].rank;
    // get the song length of the correct answer
    let correctDuration = convertDurationToReadable(songsData[correctAnswerIndex].trackDurationMS);
    // get the tempo of the correct answer
    let correctTempo = songsData[correctAnswerIndex].trackTempo;


    let correctSongNameHTML = `<span class="correct-answer">${correctSongName}</span>`;

    // create the HTML content to display to the correct answer
    if (answerType === "artistName") {
        correctAnswerDisplayString = `${correctSongNameHTML} was performed by <span class="correct-answer">${correctSongArtist}</span>`;
    } else if (answerType === "albumReleaseYear") {
        correctAnswerDisplayString = `${correctSongNameHTML} was released in <span class="correct-answer">${correctReleaseYear}</span>`;
    } else if (answerType === "albumName") {
        correctAnswerDisplayString = `${correctSongNameHTML} was on the album <span class="correct-answer">${correctAlbumName}</span>`;
    } else if (answerType === "rank") {
        correctAnswerDisplayString = `${correctSongNameHTML} was placed at rank <span class="correct-answer">${correctRank}</span>`;
    } else if (answerType === "trackDurationMS") {
        correctAnswerDisplayString = `${correctSongNameHTML} is <span class="correct-answer">${correctDuration}</span> long`;
    } else if (questionType === 5) {
        correctAnswerDisplayString = `The fastest song is ${correctSongNameHTML} at <span class="correct-answer">${correctTempo} bpm</span>`;
    }

    return correctAnswerDisplayString;
}

/**
 * When game finished, changes display to end page
 * @param {number} correctCount 
 */
function finishGame(correctCount) {
    // hide quiz
    let activeGameWrapper = document.getElementById("active-game-wrapper");
    activeGameWrapper.style.display = "";

    // add correct count to display
    let totalCorrect = document.getElementById("total-correct");
    totalCorrect.innerHTML = correctCount;

    // display result div
    let resultWrapper = document.getElementById("result-wrapper");
    resultWrapper.style.display = "flex";

    // center the result div while keeping game mode buttons at the top
    let gameWrapper = document.getElementById("game-wrapper");
    gameWrapper.style.display = "grid";
    gameWrapper.style.gridTemplateColumns = "1fr";
    gameWrapper.style.gridTemplateRows = "38px 1fr 38px"; // 38px is the height of the game mode buttons; an empty 38px row also added at end for style, to push result div up a little
}

/**
 * Reloads the page
 */
function resetPage() {
    location.reload();
}

// add an event listener to the play again button to reset the game
let playAgainButton = document.getElementById("play-again");
playAgainButton.addEventListener("click", resetPage);