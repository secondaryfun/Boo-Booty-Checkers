//  ********************************** SET VARIABLES **********************************
//Units:  board = the entire board.  square = each square on the board. charElement = each character placed on the board. coor = col,row as text
let NUMROWS = 8
let NUMCOLUMNS = 8
let CHARLIST = []
let PLAYERTURN = 0
const PLAYER1 = "grinder"
const PLAYER2 = "biter"
let P1DEADPILE = []
let P2DEADPILE = []
let ACTIVE //   The active charElement  -  Needed for moveElement() due to embedded event listener in showMoves()
let ACTIVECHAR //  The active char.  Used only for Console Logging.
let MOVES = []
let ALTERNATEPLAY = false
let ALLOWACTIVATE = false

const BOARD = document.querySelector(".board")
const BOARDSQUARES = Array.from(document.querySelectorAll(".square"))
const RESETBTN = document.querySelector("#resetBtn")
const STARTBTN = document.querySelector("#startBtn")
const P1ICON = document.querySelector("#player1")
const P2ICON = document.querySelector("#player2")
const MODAL = document.querySelector(".modal")
const INSTRUCTIONS = document.querySelector(".instructions")
const JUMPBTN = document.querySelector("#jumpBtn")

//  Build Board
buildBoard()

//  CLASS DECLARATION - CHARACTER DATA
function CharElementData(type, index, loc) {
    this.type = type
    this.charindex = index // index in the CHARLIST array
    this.animation = null //  animation var to turn off/on
    this.loc = loc // coordinates of current location square
    this.king = false // is king or not
    this.jumpMoved = false //  last move was a jump
    this.charElement = null //  the DOM node representing the char
}

// CLASS DECLARATION - MOVE - Description: MoveOption - one discrete move option, either right or left one square. Also shows the jump location if available.  Holds the targets (blocking charElement in target square).
function MoveOption(coor) {
    this.loc = coor // Coordinates of the move
    this.target = false // False if loc square is empty. Holds the target charElement if not empty.
    this.jumpCheck = false // False unless a jump move is possible
    this.jumpLoc = null // Holds the coordinate of the jump move
    this.jumpTarget = false // False if jump move loc square is empty, otherwise holds the target charElement
}

//  ********************************** SETUP BOARD **********************************
//  FUNCTION: BUILD BOARD - Description: Add board divs and
function buildBoard() {
    // Add divs to BOARD
    // /<div class="square" data-char="" data-x="" data-y="" data-active="false" data-boardindex="64"></div>
    for (let i = 1; i <= NUMROWS; i++) {
        let newElement = document.createElement("div")
        newElement.classList.add("square")
        newElement.setAttribute("data-char", "")
        newElement.setAttribute("data-x", "")
        newElement.setAttribute("data-y", "")
        newElement.setAttribute("data-active", false)
        newElement.setAttribute("data-boardindex", i)
        BOARD.appendChild(newElement)
    }

    BOARDSQUARES.forEach(square => {
        let boardindex = parseInt(square.dataset.boardindex)

        // Set columns
        if (boardindex % NUMCOLUMNS === 0) square.dataset.x = 8
        else square.dataset.x = boardindex % 8
        let col = parseInt(square.dataset.x)

        // Set rows
        square.dataset.y = Math.ceil(boardindex / NUMROWS)
        let row = parseInt(square.dataset.y)

        // Add colorBox class to offset boxes
        if (row % 2 === 1) {
            if (col % 2 === 1) square.classList.add("colorBox")
        } else if (row % 2 === 0) {
            if (col % 2 === 0) square.classList.add("colorBox")
        }
    })
}

// FUNCTION: MAKE CHAR - Description: Return character of 'type'
function makeChar(type) {
    //  Build character object
    let charindex = CHARLIST.length
    let char = new CharElementData(type, charindex)
    //  Append new charElement to board list
    CHARLIST.push(char)

    //  Build new element for the DOM
    let charElement = document.createElement("p")
    charElement.classList.add(char.type, "animation", "char-element")
    charElement.setAttribute("data-active", "false")
    charElement.setAttribute("data-charindex", `${char.charindex}`)
    char.charElement = charElement

    //  SELECT ELEMENT EVENT LISTENER- Description: Set "On-click" event listeners
    charElement.addEventListener("click", e => {
        const charElement = e.target
        ALLOWACTIVATE ? showMoves(charElement) : false
    })

    //  Returns the DOM element.
    return charElement
}

//  FUNCTION: CLEAR BOARD - Description: Removes all chars from the board and memory.
function clearBoard() {
    CHARLIST = []
    P1DEADPILE = []
    P2DEADPILE = []
    ACTIVE = null
    ACTIVECHAR = null
    ALLOWACTIVATE = false
    MOVES = []
    PLAYERTURN = 0
    BOARDSQUARES.forEach(square => {
        square.dataset.char = ""
        square.dataset.active = false
        square.innerHTML = ""
    })
}
// ********************************** CONTROL BUTTONS **********************************

// BUTTON: START CHECKERS
RESETBTN.addEventListener("click", e => {
    clearBoard()
    populateBoard()
    loadInstructions()
})

// BUTTON: RESET BOARD - Set to jump side game
JUMPBTN.addEventListener("click", e => {
    clearBoard()
    populateJumpTest()
    loadInstructions()
})

// ********************************** GAME MODE: CHECKERS **********************************

//  FUNCTION: POPULATE BOARD
function populateBoard() {
    BOARDSQUARES.forEach(square => {
        let row = parseInt(square.dataset.y)
        let col = parseInt(square.dataset.x)
        let charName = null
        // Set character name.
        if (row <= 3) charName = PLAYER2
        else if (row >= 6) charName = PLAYER1

        // Add characters to rows:  makeChar receives charName and coordinate location (row,column).
        if (row % 2 === 1) {
            if (col % 2 === 1 && charName) placeChar(square, makeChar(charName))
        } else if (row % 2 === 0) {
            if (col % 2 === 0 && charName) placeChar(square, makeChar(charName))
        }
    })
}

// FUNCTION: LOAD INSTRUCTIONS - CHECKERS

function loadInstructions() {
    MODAL.classList.toggle("hidden")

    INSTRUCTIONS.textContent = `
    The Grinders go first. Click a piece to show possible moves. Click a highlighted square to move the active piece to that square. Game ends when only one player's pieces are left on the board.
    `
    CHARLIST.forEach(char => {
        if (char.type === PLAYER1) animate(char.charElement, true)
    })

    BOARD.addEventListener("click", closeInstructions)
    MODAL.addEventListener("click", closeInstructions)
}

//  FUNCTION: CLOSE INSTRUCTIONS
function closeInstructions(e) {
    MODAL.classList.toggle("hidden")
    CHARLIST.forEach(char => {
        if (char.type === PLAYER1) animate(char.charElement, false)
    })

    MODAL.removeEventListener("click", closeInstructions)
    BOARD.removeEventListener("click", closeInstructions)

    startAltPlay()
}

function getCharfromSquare(square) {
    let charindex = parseInt(square.dataset.char)
    return CHARLIST[charindex]
}

//  FUNCTION: START GAME - Description: Starts alternating play.
function startAltPlay() {
    ALLOWACTIVATE = true
    PLAYERTURN = 1
    ALTERNATEPLAY = true
    P1ICON.classList.toggle("king")
}

// ********************************** GAME MODE: PRACTICE **********************************

//  FUNCTION: POPULATE BOARD FOR PRACTICE
function populateJumpTest() {
    BOARDSQUARES.forEach(square => {
        let row = parseInt(square.dataset.y)
        let col = parseInt(square.dataset.x)
        let charName = null
        // Set character name.
        if (row <= 4) charName = PLAYER2
        else if (row >= 5) charName = PLAYER1

        // Add characters to rows:  makeChar receives charName and coordinate location (row,column).
        if (row % 2 === 1) {
            if (
                col % 2 === 1 &&
                charName &&
                (row === 4 || row === 5 || row === 2 || row === 7)
            )
                placeChar(square, makeChar(charName)) //  King Testing
        } else if (row % 2 === 0) {
            if (
                col % 2 === 0 &&
                charName &&
                (row === 4 || row === 5 || row === 2 || row === 7)
            )
                placeChar(square, makeChar(charName)) //  King Testing
        }
    })
}

// ********************************** GAME LOGIC **********************************
//  FUNCTION: SHOW MOVES - Description: When char is clicked, showMoves runs and highlights characters available moves.
function showMoves(charElement, force = false) {
    //load char data
    char = CHARLIST[charElement.dataset.charindex]

    if (charElement.dataset.active === "false" || force) {
        if (ALTERNATEPLAY === true) {
            if (PLAYERTURN % 2 === 1 || PLAYERTURN === 0) {
                if (CHARLIST[charElement.dataset.charindex].type === PLAYER2)
                    return
            } else if (CHARLIST[charElement.dataset.charindex].type === PLAYER1)
                return
        }
        activate(charElement) //  Set charElement to active

        getValidMoves(charElement) //  highlight valid moves

        if (MOVES.length === 0) {
            deactivate(charElement)
            return false
        }

        // EVENT LISTENER: GET PLAYER MOVE CHOICE - Description: Add event listener to highlighted squares.
        let openSquares = document.querySelectorAll(".highlight")
        openSquares.forEach(square => {
            square.addEventListener("click", moveElement)
        })
    } else {
        deactivate(charElement) // Inactivate the charElement
    }
}

//  FUNCTION: PASS PLAYER
function passPlayer() {
    if (PLAYERTURN === PLAYER1) {
        PLAYERTURN = PLAYER2
        BOARD.classList.toggle("player2")
        animate(P2ICON, true)
        animate(P1ICON, false)
    } else {
        PLAYERTURN = PLAYER1
        BOARD.classList.toggle("player1")
        animate(P1ICON, true)
        animate(P2ICON, false)
    }
}

//  FUNCTION: RETURN LIST OF VALID MOVES - Description: Returns an array of legal moves for charElement.
function getValidMoves(charElement) {
    // Pull data for charElement.
    char = CHARLIST[charElement.dataset.charindex]
    MOVES = []

    // SubFunc = pushes valid moves to 'MOVES'
    const getMoves = (char, xDir = 1, king = false) => {
        let addRow
        let addColL = xDir
        if (char.type === "biter") addRow = 1
        else addRow = -1

        // Set King Modifier
        if (king) addRow = addRow * -1

        // DETERMINE LEFT MOVES
        let leftMove = new MoveOption()
        let rX = char.loc[0] + addColL
        let rY = char.loc[1] + addRow
        if (rX > 8 || rX < 1 || rY > 8 || rY < 1) return
        leftMove.loc = [rX, rY]

        // Check for obstruction
        leftMove.target = checkSquare(leftMove)

        if (leftMove.target && leftMove.target.type !== char.type) {
            //look for jump space
            leftMove.jumpCheck = true
            ;(rX = leftMove.loc[0] + addColL), (rY = leftMove.loc[1] + addRow)
            if (rX > 8 || rX < 1 || rY > 8 || rY < 1) return

            leftMove.jumpLoc = [rX, rY]
            leftMove.jumpTarget = checkSquare(leftMove)
            if (leftMove.jumpTarget !== false) leftMove.jumpCheck = false
        }
        MOVES.push(leftMove)
    }

    getMoves(char, 1) //  Get right move
    getMoves(char, -1) //  Get left move
    if (char.king) getMoves(char, 1, true) //  Get right jump move
    if (char.king) getMoves(char, -1, true) //  Get left jump move

    //Validate moves based on char condition
    if (char.jumpMoved) {
        let filteredMoves = MOVES.filter(move => {
            if (move.jumpCheck === true) return move
        })
        MOVES = filteredMoves
    }

    highlightMoves(MOVES) //  Highlight the available squares.
}

//  FUNCTION: CHECK IF EMPTY SQUARE - Description: Check square and return charElement index if square contains a charElement
function checkSquare(move) {
    let target = null
    let moveLoc = move.loc
    if (move.jumpCheck) moveLoc = move.jumpLoc

    CHARLIST.forEach(char => {
        if (char.loc[0] === moveLoc[0] && char.loc[1] === moveLoc[1]) {
            target = char
        }
    })

    if (target) {
        return target
    } else {
        return false
    }
}

//  FUNCTION: ADD HIGHLIGHTS
function highlightMoves(moves) {
    moves.forEach(move => {
        //get square
        BOARDSQUARES.forEach(square => {
            if (move.target === false) {
                if (
                    square.dataset.x == move.loc[0] &&
                    square.dataset.y == move.loc[1]
                ) {
                    if (!ACTIVECHAR.jumpMoved) {
                        square.classList.add("highlight")
                    }
                }
            }
            if (move.jumpCheck) {
                if (
                    square.dataset.x == move.jumpLoc[0] &&
                    square.dataset.y == move.jumpLoc[1]
                ) {
                    square.classList.add("highlight")
                }
            }
        })
    })
}
//  FUNCTION: END HIGHLIGHTS
function endHighlights() {
    BOARDSQUARES.forEach(square => {
        let squareClasses = Array.from(square.classList)
        if (squareClasses.includes("highlight")) {
            square.classList.remove("highlight")
            square.removeEventListener("click", moveElement)
        }
    })
}

// ********************************** CHAR ELEMENT MOVEMENT **********************************

//  FUNCTION: MOVE ELEMENT - Description: Move charElement to event.target location. Receives event with event.target = target square.
function moveElement(e) {
    e.stopPropagation()
    let element = ACTIVE
    let char = CHARLIST[ACTIVE.dataset.charindex]

    // get the MOVE that matches e.target
    let loc = getLocFromSquare(e.target)

    // check for Jump Move
    let move = MOVES.filter(move => {
        if (move.loc[0] === loc[0] && move.loc[1] === loc[1]) {
            char.jumpMoved = false
            return move
        } else if (move.jumpLoc) {
            if (move.jumpLoc[0] === loc[0] && move.jumpLoc[1] === loc[1]) {
                // jumpMoveCheck = true
                char.jumpMoved = true
                return move
            }
        }
    })
    if (char.jumpMoved === true) removeChar(move[0].target, PLAYERTURN) //  Remove the jumped character.

    placeChar(e.target, element) //  Place element into new div.

    if (char.jumpMoved === true) restartCheckMoves(element)
    else {
        deactivate(element)

        //  Set end of turn conditions.
        if (ALTERNATEPLAY) {
            PLAYERTURN++

            P1ICON.classList.toggle("king")
            P2ICON.classList.toggle("king")

            //  Turn off player guide after 2 turns
            if (PLAYERTURN > 2) {
                if (PLAYERTURN % 2 === 1)
                    CHARLIST.forEach(char => {
                        animate(char.charElement, false)
                    })
            }

            checkWin() //  Check for win
        }
    }
}
// FUNCTION: CHECK WIN - Description: If a win condition exists, ends the game.
function checkWin() {
    let winner

    if (P1DEADPILE.length >= CHARLIST.length / 2) winner = "Player Two"
    if (P2DEADPILE.length >= CHARLIST.length / 2) winner = "Player One"

    if (winner) {
        MODAL.querySelector("h1").textContent = `${winner} Wins!`
        MODAL.querySelector("p").textContent = ""
        MODAL.classList.toggle("hidden")
    }
}

//  FUNCTION: PLACE CHAR - Description: Place charElement on square - Receives target square and charElement. - Called by populate() Funcs && moveElement()
function placeChar(square, charElement) {
    // Remove dataset.char charindex from original square.
    if (CHARLIST[charElement.dataset.charindex].loc) {
        BOARDSQUARES.forEach(square => {
            let row = parseInt(square.dataset.y)
            let col = parseInt(square.dataset.x)
            if (
                col === CHARLIST[charElement.dataset.charindex].loc[0] &&
                row === CHARLIST[charElement.dataset.charindex].loc[1]
            )
                square.dataset.char = ""
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

//  FUNCTION: REMOVE CHAR - Description: Removes char from the board and places char into player's dead pile.
function removeChar(char, player) {
    // Add taken char to dead pile
    if (player === "biter") P1DEADPILE.push(CHARLIST[char.charindex])
    else P2DEADPILE.push(CHARLIST[char.charindex])

    // Remove char from board
    let square = getSquareFromloc(char.loc)
    square.dataset.char = ""
    square.innerHTML = ""
    char.loc = []
}
// ********************************** CHAR ELEMENT GAME STATES **********************************

// FUNCTION: SET ACTIVE ATTRIBUTES - Descriptions: Set the following: dataset.active, animation: on.
function activate(charElement) {
    if (ACTIVE) {
        if (
            CHARLIST[charElement.dataset.charindex].charindex ===
            ACTIVECHAR.charindex
        )
            return
        deactivate(ACTIVE) //  Deactivate previous ACTIVE
    }

    // Add active settings
    ACTIVE = charElement
    ACTIVE.dataset.active = true
    ACTIVECHAR = CHARLIST[charElement.dataset.charindex]
    animate(ACTIVE, true)
}

//  FUNCTION: CLEAR ACTIVE SETTINGS
function deactivate(charElement) {
    charElement.dataset.active = false

    animate(charElement, false)
    endHighlights()
    CHARLIST[charElement.dataset.charindex].jumpMoved = false
}

//  FUNCTION: RESET FOR CHECKMOVES
function restartCheckMoves(charElement) {
    endHighlights()
    if (ALTERNATEPLAY) checkWin() //  Check for win

    showMoves(charElement, true)
}

//  FUNCTION: ANIMATE - Descriptions: starts the animation for charElement if 'start' is true.
function animate(charElement, start) {
    char = CHARLIST[charElement.dataset.charindex]
    //  Start animation
    if (start === true && !char.animation) {
        let imgSize = 77 //  Manual entry tied to size of charElement sizes set in animations.css
        let position = imgSize //  Sets the 2nd position to move the image to (first position is zero)
        const interval = 100 //  Sets the speed of the animation

        //  Turn on the animation.  Stores animation in charElementData object.
        char.animation = setInterval(() => {
            charElement.style.backgroundPosition = `-${position}px 0px` // Start at 0
            if (position < 480) position += imgSize
            //  Increment by image width for each iteration
            else position = imgSize //  Reset loop.
        }, interval)
    } else {
        clearInterval(char.animation)
        char.animation = null
    }
}

//  FUNCTION: KING ME - Description: Adds .king = true to char entry.
function kingMe(charElement) {
    char = CHARLIST[charElement.dataset.charindex]
    if (char.loc[1] === 8 && char.type === "biter") char.king = true
    if (char.loc[1] === 1 && char.type === "grinder") char.king = true
    if (char.king === true) {
        charElement.classList.add("king")
    }
}

// ********************************** UTILITY FUNCTIONS **********************************

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
    return [col, row]
}
