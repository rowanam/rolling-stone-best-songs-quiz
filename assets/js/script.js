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
            console.log("Other buttons chosen:", button.getAttribute("data-chosen"));
        }
    }
}

// add "click" event listeners to the category buttons and pass the above function as event handler
for (let button of categoryButtons) {
    button.addEventListener("click", categoryButtonChosen);
}