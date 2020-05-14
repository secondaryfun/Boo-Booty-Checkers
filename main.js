//Units:  board = the entire board.  square = each square on the board. charElement = each character placed on the board. coor = col,row as text

const boardSquares = document.querySelectorAll('.square')
let boardCharList = []
let p1Sideboard = []
let p2Sideboard = []
let ACTIVE
const resetBtn = document.querySelector('#resetBtn')
const startBtn = document.querySelector('#startBtn')

resetBtn.addEventListener('click',e => {
    //Start Character fall animation
    let clearBoard = () => {
        boardCharList = []
        boardSquares.forEach(square => {
            console.log('clearing...')
            square.dataset.char = ""
            square.dataset.active = false
            square.innerHTML = ""
        })
    }
    clearBoard()
    populateJumpTest()
})


//add character class
function CharElementData (type, index, loc){
    this.type = type
    this.charindex = index
    this.animation = null
    this.loc = loc
}

// MoveOption - one discrete move option, either right or left one square. Also shows the jump location if available.  Holds the targets (blocking charElement in target square).
function MoveOption (coor) {
    this.loc = coor             // Coordinates of the move
    this.target = false        // False if loc square is empty. Holds the target charElement if not empty. 
    this.jumpCheck = false      // False unless a jump move is possible
    this.jumpLoc = null         // Holds the coordinate of the jump move
    this.jumpTarget = false     // False if jump move loc square is empty, otherwise holds the target charElement
}

//  Color Board
boardSquares.forEach(square => {
    let boardindex = parseInt(square.dataset.boardindex)
    
    // Set columns
    if (boardindex % 8 === 0) square.dataset.x = 8
    else square.dataset.x = boardindex % 8
    let col = parseInt(square.dataset.x)
    
    // Set rows
    square.dataset.y = Math.ceil(boardindex / 8)
    let row = parseInt(square.dataset.y)

    // Add colorBox class to offset boxes
    if(row % 2 === 1) {
        if (col % 2 === 1) square.classList.add('colorBox')
    } else if (row % 2 === 0) {
        if (col % 2 === 0) square.classList.add('colorBox')
    }
})

//  FUNCTION: POPULATE BOARD
function populateBoard() {
    boardSquares.forEach(square => {
        let row = parseInt(square.dataset.y)
        let col = parseInt(square.dataset.x)
        let charName = null;
        // Set character name.
        if (row <= 3) charName = 'biter'
        else if (row >= 6) charName = 'grinder'
        
        // Add characters to rows:  makeChar receives charName and coordinate location (row,column).
        if(row % 2 === 1) {
            if (col % 2 === 1 && charName ) placeChar( square, makeChar(charName) )
        } else if (row % 2 === 0) {
            if (col % 2 === 0 && charName) placeChar( square, makeChar(charName) )
        }
    })
}

//  FUNCTION: POPULATE BOARD
function populateJumpTest() {
    boardSquares.forEach(square => {
        let row = parseInt(square.dataset.y)
        let col = parseInt(square.dataset.x)
        let charName = null;
        // Set character name.
        if (row <= 4) charName = 'biter'
        else if (row >= 5) charName = 'grinder'
        
        // Add characters to rows:  makeChar receives charName and coordinate location (row,column).
        if(row % 2 === 1) {
            if (col % 2 === 1 && charName && ( row === 4 || row === 5 || row === 2 || row === 7)) placeChar( square, makeChar(charName) )
        } else if (row % 2 === 0) {
            if (col % 2 === 0 && charName && ( row === 4 || row === 5 || row === 2 || row === 7)) placeChar( square, makeChar(charName) )
        }
    })
}

    // Make Characters of char = 'name'
function makeChar(name) {
    //  Build character object
    let charindex = boardCharList.length
    let charData = new CharElementData(name, charindex)
    //  Append new charElement to board list
    boardCharList.push(charData)
    
    //  Build new element for the DOM
    let charElement = document.createElement('p')
    charElement.classList.add(charData.type,'animation','char-element')
    charElement.setAttribute('data-active', 'false')
    charElement.setAttribute('data-charindex',`${charData.charindex}`)

    //  FUNCTION: SELECT ELEMENT - Description: Set "On-click" event listeners
    charElement.addEventListener('click', e => {
        const charElement = e.target

        if (charElement.dataset.active === 'false') {    

            activate(charElement)   //  Set charElement to active
            validMoves = getValidMoves(charElement)  //  highlight valid moves
            
            // Add event listener for player to choose move.
            let openSquares = document.querySelectorAll('.highlight')
            openSquares.forEach(square => {
                square.addEventListener('click', moveElement)
            })
        } else deactivate(charElement)  // Inactivate the charElement
    })
    
    //  Returns the DOM element.
    return charElement
}

//  FUNCTION: PLACE CHAR - Description: Place charElement on square - Receives target square and charElement.
function placeChar(square, charElement) {
    // Place the charElement into the square.
    square.appendChild(charElement)
    square.dataset.char = charElement.dataset.charindex
    
    
    // Get the square location
    let row = parseInt(square.dataset.y)
    let col = parseInt(square.dataset.x)
    // Add loc to the char object
    boardCharList[charElement.dataset.charindex].loc = [col,row]
}

// const charElements = document.querySelectorAll('.char-element')
// function add
// charElements.forEach(item => {
//     item.addEventListener('click', e => {
//         const charElement = e.target

//         if (charElement.dataset.active === 'false') {    

//             activate(charElement)   //  Set charElement to active
//             validMoves = getValidMoves(charElement)  //  highlight valid moves
            
//             // Add event listener for player to choose move.
//             let openSquares = document.querySelectorAll('.highlight')
//             openSquares.forEach(square => {
//                 square.addEventListener('click', moveElement)
//             })
//         } else deactivate(charElement)  // Inactivate the charElement
//     })
// })
//  
//  FUNCTION: MOVE ELEMENT - Description: Move charElement to event.target location. Receives event.
function moveElement(e) {
    e.stopPropagation()
    charElement = ACTIVE
    placeChar(e.target, charElement)  //  Place charElement into new div.
    deactivate(charElement)
    
    //  Still to add:  animate the movement.
    //  ANIMATION
    //  Get element data.
}

// FUNCTION: SET ACTIVE ATTRIBUTES - Descriptions: Set the following: dataset.active, animation: on.
function activate(charElement) {
    if (ACTIVE) deactivate(ACTIVE)  //  Deactivate previous ACTIVE

    // Add active settings
    ACTIVE = charElement
    ACTIVE.dataset.active = true
    animate(ACTIVE, true)
}
//  FUNCTION: CLEAR ACTIVE SETTINGS
function deactivate(charElement) {
    charElement.dataset.active = false
    animate(charElement, false)
    endHighlights()
}

//  FUNCTION: RETURN LIST OF VALID MOVES - Description: Returns an array of legal moves for charElement.
function getValidMoves(charElement) {
    // Pull data for charElement.
    charData = boardCharList[ charElement.dataset.charindex ]
        availableMoves = []
    
    // Determine moves for top board pieces

    const getMoves = (charData) => {        
        let addRow
        let addColR = 1
        let addColL = -1
        if (charData.type === 'biter') addRow = 1
        else addRow = -1
            
        // DETERMINE RIGHT MOVES
        let rightMove = new MoveOption()
        rightMove.loc = [ charData.loc[0] + addColR , charData.loc[1] + addRow ]  //  CHECK LOGIC IN THE MORNING!!!!!!
        console.log(`Right Move: ${rightMove.loc}`)
        
        // Check for obstruction
        rightMove.target = checkSquare(rightMove)
        console.log(`target: ${rightMove.target} - type: ${rightMove.target.type} !== ${charData.type}`)
        
        if (rightMove.target && rightMove.target.type !== charData.type) {
            //look for jump space
            console.log("It's jump checkin' time!")
            rightMove.jumpCheck = true
            rightMove.jumpLoc = [rightMove.loc[0] + addColR, rightMove.loc[1] + addRow]        //    CHECK TO SEE IF JUMPLOC IS SETTING 
            rightMove.jumpTarget = checkSquare(rightMove)
            console.log(`move after jump: `)
            console.log(rightMove)
            if (rightMove.jumpTarget !== false) rightMove.jumpCheck = false
        }
        availableMoves.push( rightMove )

        // DETERMINE LEFT MOVES
        let leftMove = new MoveOption()
        leftMove.loc = [ charData.loc[0] + addColL , charData.loc[1] + addRow ]  //  CHECK LOGIC IN THE MORNING!!!!!!
        console.log(`Right Move: ${leftMove.loc}`)
        
        // Check for obstruction
        leftMove.target = checkSquare(leftMove)
        console.log(`target: ${leftMove.target} - type: ${leftMove.target.type} !== ${charData.type}`)
        
        if (leftMove.target && leftMove.target.type !== charData.type) {
            //look for jump space
            console.log("It's jump checkin' time!")
            leftMove.jumpCheck = true
            leftMove.jumpLoc = [leftMove.loc[0] + addColL, leftMove.loc[1] + addRow]        //    CHECK TO SEE IF JUMPLOC IS SETTING 
            leftMove.jumpTarget = checkSquare(leftMove)
            console.log(`move after jump: `)
            console.log(leftMove)
            if (leftMove.jumpTarget !== false) leftMove.jumpCheck = false
        }
        availableMoves.push( leftMove )
    }

    getMoves(charData)

    // else if (charData.type === 'grinder') {
    //     availableMoves.push( [currentLoc[0]-1,currentLoc[1]-1] )
    //     availableMoves.push( [currentLoc[0]+1,currentLoc[1]-1] )
    
    highlightMoves(availableMoves)      //  Highlight the available squares.

    return availableMoves
}    

 

//  FUNCTION: CHECK IF EMPTY SQUARE - Description: Check square and return charElement index if square contains a charElement
function checkSquare(move) {
    let target = null
    let moveLoc = move.loc
    if (move.jumpCheck) moveLoc = move.jumpLoc
    
    boardCharList.forEach(char => {
        // console.log(`char.loc:${char.loc} - move.loc${moveLoc}`)
        if (char.loc[0] === moveLoc[0] && char.loc[1] === moveLoc[1]) {
            console.log('Match!')
            target = char
        }
    })

    if (target) {return target}
    else {return false}
}

//  FUNCTION: ADD HIGHLIGHTS
function highlightMoves(moves) {
    moves.forEach(move => {
        //get square
        boardSquares.forEach(square => {
            if (move.target === false) {
                if (square.dataset.x == move.loc[0] && square.dataset.y == move.loc[1]) {
                    square.classList.add('highlight')
                }
            }
            if (move.jumpCheck) {
                if (square.dataset.x == move.jumpLoc[0] && square.dataset.y == move.jumpLoc[1]) {
                    square.classList.add('highlight')
                }
            }
        })
    })
}
//  FUNCTION: END HIGHLIGHTS
    function endHighlights() {
        boardSquares.forEach(square => {
            let squareClasses = Array.from(square.classList)
            if (squareClasses.includes('highlight')) {
                square.classList.remove('highlight')
                square.removeEventListener('click', moveElement)
            }
        })
    }

// Sprint Animation Tutorial: https://medium.com/dailyjs/how-to-build-a-simple-sprite-animation-in-javascript-b764644244aa
//  FUNCTION: ANIMATE - Descriptions: starts the animation for charElement if 'start' is true.
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
        dragEndTarget = e.target.dataset.charindex;
        console.log(`Ending in square: ${e.target.dataset.charindex}`)
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
