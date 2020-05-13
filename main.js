//Units:  board = the entire board.  square = each square on the board. charElement = each character placed on the board. 

const boardSquares = document.querySelectorAll('.square')
let boardCharList = []
let ACTIVE


//add character class
function CharElementData (type, index, loc){
    this.type = type
    this.index = index
    this.animation = null
    this.loc = loc
}

//  Color Board
boardSquares.forEach(square => {
    let index = parseInt(square.dataset.index)
    
    // Set columns
    if (index % 8 === 0) square.dataset.x = 8
    else square.dataset.x = index % 8
    let col = parseInt(square.dataset.x)
    
    // Set rows
    square.dataset.y = Math.ceil(index / 8)
    let row = parseInt(square.dataset.y)

    // Add colorBox class to offset boxes
    if(row % 2 === 1) {
        if (col % 2 === 1) square.classList.add('colorBox')
    } else if (row % 2 === 0) {
        if (col % 2 === 0) square.classList.add('colorBox')
    }
})
//  Populate board
boardSquares.forEach(square => {
    let row = parseInt(square.dataset.y)
    let col = parseInt(square.dataset.x)
    let charName = null;
    
    // Set character name.
    if (row <= 3) charName = 'biter'
    else if (row >= 6) charName = 'grinder'

    // Add characters to rows:  makeChar receives charName and coordinate location (row,column).
    if(row % 2 === 1) {
        if (col % 2 === 1 && charName) placeChar( square, makeChar(charName) )
        // square.appendChild(makeChar(charName, `${col},${row}`))
    } else if (row % 2 === 0) {
        if (col % 2 === 0 && charName) placeChar( square, makeChar(charName) )
    }
})
    // Make Characters of char = 'name'
    function makeChar(name) {
        //  Build character object
        let charIndex = boardCharList.length
        let charData = new CharElementData(name, charIndex)
        
        //  Append new charElement to board list
        boardCharList.push(charData)

        //  Build new element for the DOM
        let charElement = document.createElement('p')
        charElement.classList.add(charData.type,'animation','char-element')
        charElement.setAttribute('data-active', 'false')
        charElement.setAttribute('data-index',`${charData.index}`)
        //  Returns the DOM element.
        return charElement
    }

    //  Place character on tile
    function placeChar(square, charElement) {
        // Place the charElement into the square.
        square.appendChild(charElement)

        // Get the square location
        let row = parseInt(square.dataset.y)
        let col = parseInt(square.dataset.x)
        // Add loc to the char object
        boardCharList[charElement.dataset.index].loc = `${col},${row}`
    }

//  Set "On-click" event listeners
const charElements = document.querySelectorAll('.char-element')
charElements.forEach(item => {
    item.addEventListener('click', e => {
        const charElement = e.target
        // console.log(charElement)
        let validMoves

        if (charElement.dataset.active === 'false') {    
            activate(charElement)
            getValidMoves(charElement)

        } else deactivate(charElement)  // Inactivate the charElement
    })
})

// Set 'Active' attributes: dataset.active, animation: on.
function activate(charElement) {
    if (ACTIVE) deactivate(ACTIVE)  //  Deactivate previous ACTIVE

    // Add active settings
    ACTIVE = charElement
    ACTIVE.dataset.active = true
    animate(ACTIVE, true)
}
    //  Clear active settings
    function deactivate(charElement) {
        charElement.dataset.active = false
        animate(charElement, false)
    }

function getValidMoves(charElement) {
    // Pull data for charElement.
    charData = boardCharList[ charElement.dataset.index ]
        availableMoves = []
    
        // Get current location as array of coordinates [x,]
    currentLoc = charData.loc.split(',')
    currentLoc.forEach( (coord, i) => currentLoc[i] = parseInt(coord) )

    // Determine moves for top board pieces
    if (charData.type === 'biter') {
        // set available moves as coordinate array inside move list
        availableMoves.push( [currentLoc[1]+1,currentLoc[0]-1] )
        availableMoves.push( [currentLoc[1]+1,currentLoc[0]+1] )
        console.log(availableMoves)

    }
}    

function highlightMoves(moves) {
    moves.forEach(move => {
        //get square
        boardSquares.filter(square => {
            if (square.dataset.y == move[0] && square.dataset.x == move[1]) null
        })
    })
}



// Sprint Animation Tutorial: https://medium.com/dailyjs/how-to-build-a-simple-sprite-animation-in-javascript-b764644244aa
function animate(charElement, start) {
    //  Start animation
    if (start === true) {
        let imgSize = 77  //  Manual entry tied to size of charElement sizes set in animations.css
        let position = imgSize;  //  Sets the 2nd position to move the image to (first position is zero)
        const interval = 100; //  Sets the speed of the animation
        
        //  Turn on the animation.  Stores animation in charElementData object.
        charElement.animation = setInterval(() => {
            charElement.style.backgroundPosition = `-${position}px 0px`  // Start at 0
            if (position < 480) position += imgSize;  //  Increment by image width for each iteration
            else position = imgSize;  //  Reset loop.
        }, interval);
    } else clearInterval(charElement.animation)
}



//  Add event listener to each square
// boardSquares.forEach(square => {   
//     square.addEventListener('click', e => {
//         let div = document.createElement('div')
//         div.classList.add(`${dupType}`,'animation','item')
//         div.classList.add('biter','animation','item')
//         div.addEventListener('mousedown', setDrag)
//         div.addEventListener('touchstart', setDrag)
//         div.addEventListener('click', e => {
//             e.stopPropagation()
//         })
//         e.target.appendChild(div)
//     })
// })

function setDrag(e) {
    e.stopPropagation()
    // console.log('mousedown')
    animateScript(e.target)
    console.log(dragItem)
    dragItem = e.target
}




//  Mouse Drag Tutorial: https://www.kirupa.com/html5/drag.htm

let dragItem = document.querySelector(".item");
let board = document.querySelector(".board");

let active = false;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;
let dragEndTarget;

board.addEventListener("touchstart", dragStart, false);
board.addEventListener("touchend", dragEnd, false);
board.addEventListener("touchmove", drag, false);

board.addEventListener("mousedown", dragStart, false);
board.addEventListener("mouseup", dragEnd, false);
board.addEventListener("mousemove", drag, false);

boardSquares.forEach(square => {
    square.addEventListener('touchend', e => {
        dragEndTarget = e.target.dataset.index;
        console.log(`Ending in square: ${e.target.dataset.index}`)
    })
})

function dragStart(e) {
    if (e.type === "touchstart") {
    initialX = e.touches[0].clientX - xOffset;
    initialY = e.touches[0].clientY - yOffset;
    } else {
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;
    }

    if (e.target === dragItem) {
    active = true;
    }
}

function dragEnd(e) {
    initialX = currentX;
    initialY = currentY;

    active = false;
}

function drag(e) {
    if (active) {
    
    e.preventDefault();
    
    if (e.type === "touchmove") {
        currentX = e.touches[0].clientX - initialX;
        currentY = e.touches[0].clientY - initialY;
    } else {
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
    }

    xOffset = currentX;
    yOffset = currentY;

    setTranslate(currentX, currentY, dragItem);
    }
}

function setTranslate(xPos, yPos, el) {
    el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
}

console.log(boardCharList)
