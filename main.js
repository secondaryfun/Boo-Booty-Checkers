const boardTiles = document.querySelectorAll('.box')
let boardCharList = []

//add character class
function Character (name, index, loc){
    this.name = name
    this.index = index
    this.animation = null
    this.loc = loc
}

//  Color Board
boardTiles.forEach(box => {
    let index = parseInt(box.dataset.index)
    
    // Set columns
    if (index % 8 === 0) box.dataset.x = 8
    else box.dataset.x = index % 8
    let col = parseInt(box.dataset.x)
    
    // Set rows
    box.dataset.y = Math.ceil(index / 8)
    let row = parseInt(box.dataset.y)

    // Add colorBox class to offset boxes
    if(row % 2 === 1) {
        if (col % 2 === 1) box.classList.add('colorBox')
    } else if (row % 2 === 0) {
        if (col % 2 === 0) box.classList.add('colorBox')
    }
})
//  Populate board
boardTiles.forEach(box => {
    let row = parseInt(box.dataset.y)
    let col = parseInt(box.dataset.x)
    let char = null;
    
    // Set character name.
    if (row <= 3) char = 'biter'
    else if (row >= 6) char = 'grinder'

    // Add characters to rows:  makeChar receives char and coordinate location (row,column).
    if(row % 2 === 1) {
        if (col % 2 === 1 && char) box.appendChild(makeChar(char, `${col},${row}`))
    } else if (row % 2 === 0) {
        if (col % 2 === 0 && char) box.appendChild(makeChar(char,`${col},${row}`))
    }
})
    // Make Characters of char = 'name'
    function makeChar(name, loc) {
        //  Build character object
        let charIndex = boardCharList.length
        let character = new Character(name, charIndex, loc)
        
        //  Append new obj to board list
        boardCharList.push(character)

        //  Build new element for the DOM
        let charContainer = document.createElement('p')
        charContainer.classList.add(character.name,'animation','movableItem')
        charContainer.setAttribute('data-active', 'false')
        //  Returns the DOM element.
        return charContainer
    }

//  Set "On-click" event listeners
const characters = document.querySelectorAll('.movableItem')
characters.forEach(item => {
    item.addEventListener('click', e => {
        console.log(e.target.dataset.active)
        if (e.target.dataset.active === 'false') {
            e.target.dataset.active = 'true'
            animate(e.target, true)
        } else {
            e.target.dataset.active = 'false'
            animate(e.target, false)
        }

    })
})

//  NEXT UP:  CREATE CLASSES FOR THE CHARACTERS, MAKE A NEW CLASS FOR EACH CHAR. 
//  CLASS WILL HAVE:  INDEX, ANIMATIONVAR, NAME (=CSS CLASS NAME) TO START


//  Add event listener to each box
// boardTiles.forEach(box => {   
//     box.addEventListener('click', e => {
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


// Sprint Animation Tutorial: https://medium.com/dailyjs/how-to-build-a-simple-sprite-animation-in-javascript-b764644244aa
var tID;
function animate(obj, start) {
    if (obj.dataset.active === 'true') {
        let imgSize = 77
        let position = imgSize;
        const interval = 100;
        tID = setInterval(() => {
            obj.style.backgroundPosition = `-${position}px 0px`;
            if (position < 480) position += imgSize;
            else position = imgSize;
        }, interval);
    } else clearInterval(tID)
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

boardTiles.forEach(box => {
    box.addEventListener('touchend', e => {
        dragEndTarget = e.target.dataset.index;
        console.log(`Ending in box: ${e.target.dataset.index}`)
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
