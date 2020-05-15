//  ********************************** SET VARIABLES **********************************

//Units:  board = the entire board.  square = each square on the board. charElement = each character placed on the board. coor = col,row as text

const BOARDSQUARES = Array.from(document.querySelectorAll('.square'))
let CHARLIST = []
let PLAYERTURN 
let P1DEADPILE = []
let P2DEADPILE = []
let ACTIVE //   The active charElement  -  Needed for moveElement() due to embedded event listener in showMoves()
let ACTIVECHAR  //  The active char.  Used only for Console Logging.
let MOVES = []
const resetBtn = document.querySelector('#resetBtn')
const startBtn = document.querySelector('#startBtn')
const P1ICON = document.querySelector('#player1')
const P2ICON = document.querySelector('#player2')
const BOARD = document.querySelector('.board')


//  CLASS DECLARATION - CHARACTER DATA
function CharElementData (type, index, loc){
    this.type = type
    this.charindex = index
    this.animation = null
    this.loc = loc
    this.king = false
    this.jumpMoved = false
}

// CLASS DECLARATION - MOVE - Description: MoveOption - one discrete move option, either right or left one square. Also shows the jump location if available.  Holds the targets (blocking charElement in target square).
function MoveOption (coor) {
    this.loc = coor             // Coordinates of the move
    this.target = false        // False if loc square is empty. Holds the target charElement if not empty. 
    this.jumpCheck = false      // False unless a jump move is possible
    this.jumpLoc = null         // Holds the coordinate of the jump move
    this.jumpTarget = false     // False if jump move loc square is empty, otherwise holds the target charElement
}

//  ********************************** SETUP BOARD **********************************
BOARDSQUARES.forEach(square => {
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

// ********************************** CONTROL BUTTONS **********************************

// BUTTON: RESET BOARD
resetBtn.addEventListener('click',e => {
    //Start Character fall animation
    let clearBoard = () => {
        CHARLIST = []
        BOARDSQUARES.forEach(square => {
            square.dataset.char = ""
            square.dataset.active = false
            square.innerHTML = ""
        })
    }
    clearBoard()
    populateBoard()
    passPlayer()
})


// BUTTON: RESET BOARD - Set to jump side game
const jumpBtn = document.querySelector('#jumpBtn')
jumpBtn.addEventListener('click', e => {
    let clearBoard = () => {
        CHARLIST = []
        BOARDSQUARES.forEach(square => {
            square.dataset.char = ""
            square.dataset.active = false
            square.innerHTML = ""
        })
    }
    clearBoard()
    populateJumpTest()
})

// ********************************** CHAR ELEMENTS CREATING **********************************

//  FUNCTION: POPULATE BOARD
function populateBoard() {
    BOARDSQUARES.forEach(square => {
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

//  FUNCTION: POPULATE BOARD FOR TRAINING
function populateJumpTest() {
    BOARDSQUARES.forEach(square => {
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

// FUNCTION: MAKE CHAR - Description: Return character of 'type'
function makeChar(type) {
    //  Build character object
    let charindex = CHARLIST.length
    let charData = new CharElementData(type, charindex)
    //  Append new charElement to board list
    CHARLIST.push(charData)
    
    //  Build new element for the DOM
    let charElement = document.createElement('p')
    charElement.classList.add(charData.type,'animation','char-element')
    charElement.setAttribute('data-active', 'false')
    charElement.setAttribute('data-charindex',`${charData.charindex}`)

    //  SELECT ELEMENT EVENT LISTENER- Description: Set "On-click" event listeners
    charElement.addEventListener('click', e => {
        const charElement = e.target
        showMoves(charElement)
    })
    
    //  Returns the DOM element.
    return charElement
}




// ********************************** CHAR ELEMENT MOVEMENT **********************************

//  FUNCTION: PLACE CHAR - Description: Place charElement on square - Receives target square and charElement. - Called by populate() Funcs && moveElement()
function placeChar(square, charElement) {
    // Remove dataset.char charindex from original square.
    if (CHARLIST[charElement.dataset.charindex].loc) {
        BOARDSQUARES.forEach(square => {
            let row = parseInt(square.dataset.y)
            let col = parseInt(square.dataset.x)
            if ( col === CHARLIST[charElement.dataset.charindex].loc[0] && row === CHARLIST[charElement.dataset.charindex].loc[1]) square.dataset.char = ""
            })
        }
    
    // Place the charElement into the target square.
    square.appendChild(charElement)
    square.dataset.char = charElement.dataset.charindex

    // Set the char.loc to the new square location
    let loc = getLocFromSquare(square)
    CHARLIST[charElement.dataset.charindex].loc = loc

    //Determine if king
    kingMe(charElement)
}

//  FUNCTION: MOVE ELEMENT - Description: Move charElement to event.target location. Receives event with event.target = target square.
function moveElement(e) {
    e.stopPropagation()
    let element = ACTIVE
    let char = CHARLIST[ACTIVE.dataset.charindex]
    console.log(`5 - MOVES.Length = ${MOVES.length} ACTIVECHAR @ moveElement.1 ${ACTIVECHAR.jumpMoved}`)
    
    // get the MOVE that matches e.target
    let loc = getLocFromSquare(e.target)
    
    // check for Jump Move
    let move = MOVES.filter(move => {
        if (move.loc[0] === loc[0] && move.loc[1] === loc[1]) {
            char.jumpMoved = false
            return move
        }
        else if (move.jumpLoc) {
            if (move.jumpLoc[0] === loc[0] && move.jumpLoc[1] === loc[1]) {
                // jumpMoveCheck = true
                char.jumpMoved = true
                return move
            }
        }  
    })
    console.log(`5 - MOVES.Length = ${MOVES.length} ACTIVECHAR @ moveElement.2 ${ACTIVECHAR.jumpMoved}`)
    if (char.jumpMoved === true) removeChar(move[0].target, PLAYERTURN)  //  Remove the jumped character.
    
    placeChar(e.target, element)  //  Place element into new div.
    console.log(`5 - MOVES.Length = ${MOVES.length} ACTIVECHAR @ moveElement.3 ${ACTIVECHAR.jumpMoved}`)

    if (char.jumpMoved === true) restartCheckMoves(element)
    else {
        console.log(`5 - MOVES.Length = ${MOVES.length} ACTIVECHAR @ moveElement.4 ${ACTIVECHAR.jumpMoved}`)
        deactivate(element)
    } 


    //  Still to add:  animate the movement.
    //  ANIMATION
    //  Get element data.
    
}

function removeChar(char, player) {
    // Add taken char to dead pile
    if (player === 'biter') P1DEADPILE.push( CHARLIST[char.charindex] )
    else P2DEADPILE.push( CHARLIST[char.charindex] )
    console.log(char)
    
    // Remove char from board
    let square = getSquareFromloc(char.loc)
    square.dataset.char = ""
    square.innerHTML = ""
    char.loc = []
}
// ********************************** CHAR ELEMENT GAME STATES **********************************

// FUNCTION: SET ACTIVE ATTRIBUTES - Descriptions: Set the following: dataset.active, animation: on.
function activate(charElement) {
    if (ACTIVECHAR) console.log(`1 - MOVES.Length = ${MOVES.length} ACTIVECHAR @ activate.1 ${ACTIVECHAR.jumpMoved}`)
    if (ACTIVE) {
        console.log(`Is charElement already active? - ${CHARLIST[charElement.dataset.charindex].charindex} === ${ACTIVECHAR.charindex}`)
        if (CHARLIST[charElement.dataset.charindex].charindex === ACTIVECHAR.charindex) return
        deactivate(ACTIVE)  //  Deactivate previous ACTIVE
        } 
    
    console.log(CHARLIST[charElement.dataset.charindex])
    // Add active settings
    ACTIVE = charElement
    ACTIVE.dataset.active = true
    ACTIVECHAR = CHARLIST[charElement.dataset.charindex]
    console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
    console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
    console.log(`1 - MOVES.Length = ${MOVES.length} ACTIVECHAR @ activate.2 ${ACTIVECHAR.jumpMoved}`)
    animate(ACTIVE, true)
}

//  FUNCTION: CLEAR ACTIVE SETTINGS
function deactivate(charElement) {
    console.log(`6 - MOVES.Length = ${MOVES.length} ACTIVECHAR @ de-activate.1 ${ACTIVECHAR.jumpMoved}`)
    charElement.dataset.active = false
    animate(charElement, false)
    endHighlights()
    CHARLIST[charElement.dataset.charindex].jumpMoved = false
    console.log(`6 - MOVES.Length = ${MOVES.length} ACTIVECHAR @ de-activate.2 ${ACTIVECHAR.jumpMoved}`)
}

//  FUNCTION: RESET FOR CHECKMOVES
function restartCheckMoves(charElement) {
    endHighlights()
    showMoves(charElement, true)
}

//  FUNCTION: ANIMATE - Descriptions: starts the animation for charElement if 'start' is true.
function animate(charElement, start) {
    // Sprint Animation Tutorial: https://medium.com/dailyjs/how-to-build-a-simple-sprite-animation-in-javascript-b764644244aa
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

//  FUNCTION: KING ME - Description: Adds .king = true to char entry.
function kingMe(charElement) {
    char = CHARLIST[charElement.dataset.charindex]
    if ( char.loc[1] === 8 && char.type === 'biter' ) char.king = true
    if ( char.loc[1] === 1 && char.type === 'grinder' ) char.king = true
    if (char.king === true) {
        console.log(charElement)
        charElement.classList.add('king')
        console.log('KING ME!')
    } 
}

// ********************************** GAME LOGIC **********************************

function showMoves(charElement, force=false) {

    if (charElement.dataset.active === 'false' || force) {

        activate(charElement)   //  Set charElement to active
        console.log(`2 - MOVES.Length = ${MOVES.length} ACTIVECHAR @ showMoves.1 ${ACTIVECHAR.jumpMoved}`)

        getValidMoves(charElement)  //  highlight valid moves
        console.log(`4 - MOVES.Length = ${MOVES.length} ACTIVECHAR @ showMoves.2 ${ACTIVECHAR.jumpMoved}`)

        if (MOVES.length === 0) {
            deactivate(charElement)
            return false
        } 
        console.log(`4 - MOVES.Length = ${MOVES.length} ACTIVECHAR @ showMoves.3 ${ACTIVECHAR.jumpMoved}`)

        // EVENT LISTENER: GET PLAYER MOVE CHOICE - Description: Add event listener to highlighted squares.
        let openSquares = document.querySelectorAll('.highlight')
        openSquares.forEach(square => {
            square.addEventListener('click', moveElement)
        })

    } else {
        deactivate(charElement)  // Inactivate the charElement
    } 
}

// function passPlayer() {
//     if (PLAYERTURN === 'grinder') {
//         PLAYERTURN = 'biter'
//         BOARD.classList.toggle('player2')
//         animate(P2ICON)
//     }
//     else {
//         PLAYERTURN = 'grinder'
//         BOARD.classList.toggle('player1')
//         animate(P1ICON)
//     }

// }

//  FUNCTION: RETURN LIST OF VALID MOVES - Description: Returns an array of legal moves for charElement.
function getValidMoves(charElement) {
    // Pull data for charElement.
    charData = CHARLIST[ charElement.dataset.charindex ]
    MOVES = []
    console.log(`3 - MOVES.Length = ${MOVES.length} ACTIVECHAR @ getValidMoves.1 ${ACTIVECHAR.jumpMoved}`)

    // SubFunc = pushes valid moves to 'MOVES'
    const getRightMoves = (charData, king = false) => {        
        let addRow
        let addColR = 1
        if (charData.type === 'biter' ) addRow = 1
        else addRow = -1

        // Set King Modifier
        if (king) addRow = addRow * -1
    
        // DETERMINE RIGHT MOVES
        let rightMove = new MoveOption()
        let rX = charData.loc[0] + addColR
        let rY = charData.loc[1] + addRow
        if (rX > 8 || rX < 1 || rY > 8 || rY < 1) return
        rightMove.loc = [ rX , rY ]
        
        // Check for obstruction
        rightMove.target = checkSquare(rightMove)
        // console.log(`target: ${rightMove.target} - type: ${rightMove.target.type} !== ${charData.type}`)
        
        if (rightMove.target && rightMove.target.type !== charData.type) {
            //look for jump space
            rightMove.jumpCheck = true
            rightMove.jumpLoc = [rightMove.loc[0] + addColR, rightMove.loc[1] + addRow]        
            rightMove.jumpTarget = checkSquare(rightMove)
            if (rightMove.jumpTarget !== false) rightMove.jumpCheck = false
        }
        console.log(MOVES)

        MOVES.push( rightMove )
    }
    const getLeftMoves = (charData, king = false) => {
        let addRow
        let addColL = -1
        if (charData.type === 'biter') addRow = 1
        else addRow = -1

        // Set King Modifier
        if (king) addRow = addRow * -1

        // DETERMINE LEFT MOVES
        let leftMove = new MoveOption()
        let rX = charData.loc[0] + addColL
        let rY = charData.loc[1] + addRow
        if (rX > 8 || rX < 1 || rY > 8 || rY < 1) return
        leftMove.loc = [ rX , rY ]

        // Check for obstruction
        leftMove.target = checkSquare(leftMove)
        // console.log(`target: ${leftMove.target} - type: ${leftMove.target.type} !== ${charData.type}`)
        
        if (leftMove.target && leftMove.target.type !== charData.type) {
            //look for jump space
            leftMove.jumpCheck = true
            leftMove.jumpLoc = [leftMove.loc[0] + addColL, leftMove.loc[1] + addRow]       
            leftMove.jumpTarget = checkSquare(leftMove)
            if (leftMove.jumpTarget !== false) leftMove.jumpCheck = false
        }
        console.log(MOVES)
        MOVES.push( leftMove )
    }
    console.log(`3 - MOVES.Length = ${MOVES.length} ACTIVECHAR @ getValidMoves.2 ${ACTIVECHAR.jumpMoved}`)
    console.log(`3.a charData @ getValidMoves - ie, the point ${ACTIVECHAR.jumpMoved}`)

    //  If last move was a jump, do not get single moves.
    getLeftMoves(charData)
    getRightMoves(charData)
    console.log(`3 - MOVES.Length = ${MOVES.length} ACTIVECHAR @ getValidMoves.3 ${ACTIVECHAR.jumpMoved}`)
    if (charData.king) getLeftMoves(charData, true)
    if (charData.king) getRightMoves(charData, true)
    console.log(`3 - MOVES.Length = ${MOVES.length} ACTIVECHAR @ getValidMoves.4 ${ACTIVECHAR.jumpMoved}`)
    
    //Validate moves based on char condition
    console.log(MOVES)
    if (charData.jumpMoved) {
        let filteredMoves = MOVES.filter( (move) => {
            if (move.jumpCheck === true) return move
        })
        MOVES = filteredMoves
    }
    console.log(MOVES)

    highlightMoves(MOVES)      //  Highlight the available squares.
}    
    
//  FUNCTION: CHECK IF EMPTY SQUARE - Description: Check square and return charElement index if square contains a charElement
function checkSquare(move) {
    let target = null
    let moveLoc = move.loc
    if (move.jumpCheck) moveLoc = move.jumpLoc
    
    CHARLIST.forEach(char => {
        if (char.loc[0] === moveLoc[0] && char.loc[1] === moveLoc[1]) {
            // console.log('Match!')
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
        BOARDSQUARES.forEach(square => {
            if (move.target === false) {
                if (square.dataset.x == move.loc[0] && square.dataset.y == move.loc[1]) {
                    if (!ACTIVECHAR.jumpMoved) {
                        square.classList.add('highlight')
                    }
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
    BOARDSQUARES.forEach(square => {
        let squareClasses = Array.from(square.classList)
        if (squareClasses.includes('highlight')) {
            square.classList.remove('highlight')
            square.removeEventListener('click', moveElement)
        }
    })
}



//  FUNCTION: GET SQUARE FROM LOC - Description: Returns the square object at location [x,y]
function getSquareFromloc(loc) {
    let mySquare
    BOARDSQUARES.forEach(square => {
        let squareLoc = getLocFromSquare(square)
        if (loc[0] === squareLoc[0] && loc[1] === squareLoc[1]) {
            mySquare = square
        } 
    })
    return mySquare
}

//  FUNCTION: GET LOC FROM SQUARE - Description: Returns [x,y] from a square object.
function getLocFromSquare(square) {
    let row = parseInt(square.dataset.y)
    let col = parseInt(square.dataset.x) 
    return [col,row]
}


// ********************************** NOT IMPLEMENTED FUNCTIONS **********************************


//  Add event listener to each square
// BOARDSQUARES.forEach(square => {   
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



function drag() {

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
    
    BOARDSQUARES.forEach(square => {
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
}


populateJumpTest()
