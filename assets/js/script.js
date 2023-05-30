// load json file song data
var songsData;
fetch('./assets/data/songs.json')
    .then(res => res.json())
    .then((data) => {
        songsData = data;
}).catch(err => console.error(err));

// CODE TO SELECT AND HIGHLIGHT A GAME CATEGORY
// create an HTMLCollection of the category buttons
let categoryButtons = document.getElementsByClassName("category-button");

/**
 * Sets the "data-chosen" attribute of the clicked category button to "true", and resets the attribute
 * to "false" for all other cateogry buttons; then applies styles to the selected button and resets the
 * styles on the other buttons
 */
function categoryButtonChosen() {
    // set "data-chosen" of all category buttons to "false"
    for (let button of categoryButtons) {
        button.setAttribute("data-chosen", "false")
    }

    // set to "true" for the clicked button
    this.setAttribute("data-chosen", "true");

    // apply highlighting styles to the clicked button and reset styles of all other buttons
    for (button of categoryButtons) {
        if (button.getAttribute("data-chosen") === "true") {
            button.style.color = "white";
            button.style.backgroundColor = "rgb(238, 29, 37)";
        } else {
            button.style.color = "";
            button.style.backgroundColor = "";
        }
    }
}

// add "click" event listeners to the category buttons and pass the above function as event handler
for (let button of categoryButtons) {
    button.addEventListener("click", categoryButtonChosen);
}

/**
 * This function will check which option in the selection box next to "How many questions do you want?" is chosen
 * and return that value.
 * Currently only works when option "10" is chosen.
 * @returns the desired number of questions to be answered
 */
function pullNumberOfQuestions() {
    // create an HTMLCollection of the options for the "how many questions" question
    let numberOptions = document.getElementsByTagName("option");

    // set a variable containing the value of the "data-chosen" attribute 
    let tenQsOptionIsChosen = numberOptions[0].getAttribute("data-chosen");
    // if "data-chosen" is "true", function returns 10
    if (tenQsOptionIsChosen === "true") {
        return 10;
    }
}

/**
 * Generate indices for the correct and incorrect answers for each question.
 * The correct answers (number of answers determined by the option selected by the user) don't repeat, 
 * and each question will have 3 more incorrect answers that don't repeat
 * @returns an array containing the answerIndices array and the correctIndices array
 */
function generateQuestionIndices() {
    // create a variable that stores how many questions should be generated
    let numberOfQuestions = pullNumberOfQuestions();

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