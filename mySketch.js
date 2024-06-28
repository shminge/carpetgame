class Board{
	constructor (centre,side){
		this.type = 4 // 4x4 grid
		this.centre = centre
		this.tl = {x: centre.x - side/2, y: centre.y - side/2}
		this.side = side
		this.strokeThickness = 3
		this.strokeColour = color('rgb(59,57,57)')
		this.cellSize = this.side/this.type
		this.entries = []
		for (let i = 0; i < this.type; i++){
			this.entries.push([])
			for (let j = 0; j < this.type; j++){
				this.entries[i].push(random([0]))
			}
		}
		
	}
	
	drawBoard() {
		// first we have to draw the lines
		push()
		stroke(this.strokeColour)
		strokeWeight(this.strokeThickness)
		for (let i = 1; i < this.type; i++){
			line(this.tl.x, this.tl.y + i*this.cellSize, this.tl.x + this.side , this.tl.y + i*this.cellSize) // horizontal
			line(this.tl.x + i*this.cellSize, this.tl.y, this.tl.x + i*this.cellSize, this.tl.y + this.side) // vert
		}
		pop()
		// next we draw the elements in
		push()
		textSize(30)
		for (let row = 0; row < this.type; row++){
			for (let col = 0; col < this.type; col++){
				if (this.entries[row][col] != 0){ // if cell is non-empty
					let entry = this.entries[row][col] == 1 ? '❌' : '⭕' // 1 is X, -1 (or anything else) is O
					
					text(entry, this.tl.x + (col+0.5)*this.cellSize, this.tl.y + (row+0.5)*this.cellSize)
					
				} 
			}
		}
		
		// now a small hover effect
		//let mPos = this.c2c(mouseX,mouseY)
		//if (mPos && this.entries[mPos.row][mPos.col] == 0){
		//	text('⁕', this.tl.x + (mPos.col+0.5)*this.cellSize, this.tl.y + (mPos.row+0.5)*this.cellSize) // this is a placeholder, replace with proper player
		//}
		

		
	}
	
	c2c(x,y) { // converst coordinates into row, col form
		if (x < this.tl.x || x > this.tl.x + this.side || y < this.tl.y || y > this.tl.y + this.side) { // not inside the board
			return 
		}
		// otherwise
		let col = Math.floor((x-this.tl.x)/this.cellSize)
		let row = Math.floor((y-this.tl.y)/this.cellSize)
		return {row: row, col: col}
	}
	
	
}


class Player {
	
	constructor() {
		this.player = 0
		this.playerChar = [1,-1]
		this.playerBoard = [0,0]
	}
	
	next() {
		this.player = (this.player + 1) % 2
	}
	
	char() {
		return this.playerChar[this.player]
	}
	
	board() {
		return this.playerBoard[this.player]
	}
	
	nextBoard() {
		this.playerBoard[this.player] = (this.playerBoard[this.player] + 1) % 2
	}
	
	
}




var boardList = []
var player = new Player()
var lastClick

function setup() {
	let canvas = createCanvas(500,500)
	canvas.parent('sketch-holder')
	background('rgb(255,246,213)')
	textAlign(CENTER,CENTER)
	boardList.push(new Board({x:150,y:150},200))
	boardList.push(new Board({x:350,y:350},200))
}

function draw() {
	background('rgb(255,246,213)')
	for (let b of boardList) {
		b.drawBoard()
	}
	drawPlayerLocations()
	testMove()
}


function mousePressed(){ // this sets lastClick
		let b = boardList[player.board()]
		let bPos = b.c2c(mouseX,mouseY)
		if (bPos){ // clicked somewhere on a board
			lastClick = {row: bPos.row, col: bPos.col, index: player.board()}
		}
}

// testMove waits for click input and then calls makeMove
function testMove(){
	if (lastClick){
		makeMove(lastClick)
		lastClick = undefined
	}
}




// makeMove needs to take in the boardList, the index of the board to move to, and coords

function makeMove(pos){ // relies implicitly on boardList
	let index = pos.index
	let row = pos.row
	let col = pos.col
	let b = boardList[index]
	b.entries[row][col] = player.char() // we've placed the piece
	
	// get longest n-in-a-row
	let boardResult  = checkBoard(pos)
	//console.log(boardResult)
	
	if (boardResult == 'four') {
		// the game has been won
		background('rgb(255,246,213)') // redraw winning board
		for (let q of boardList) {
			q.drawBoard()
		}
		drawPlayerLocations()
		console.log('GAME WON')
		noLoop()
		push()
		stroke(1)
		fill(255)
		rect(130,190,260,120)
		pop()
		textSize(30)
		let winner = player.player == 0 ? '❌' : '⭕' // 1 is X, -1 (or anything else) is O
		text('won by '+ winner, 250, 250)
	} else if (boardResult == 'three') {
		// switch to new board
		player.nextBoard()
	} else {	
	// switch players
	player.next()
	}
	
			
}

function checkBoard(pos){ // we only need to check rows modified last move
	// check for four in a rows
	if (checkFour(pos)) {
		// there is a four in a row (hopefully should be the current player)
		// so win
		return 'four'
	}
	
	// next check for threes
	if (checkThree(pos)){
		// there is a three in a row so we need to switch
		return 'three'
	}
	return 'none'
}

function checkFour(pos){ // sadly hardcoded to 4x4 for diags
	let b = boardList[pos.index]
	
	//console.log(b.entries[pos.row])
	if (hasNRow(b.entries[pos.row],4)){
		return true
	}
	
	//console.log([b.entries[0][pos.col],b.entries[1][pos.col],b.entries[2][pos.col],b.entries[3][pos.col]])
	if (hasNRow([b.entries[0][pos.col],b.entries[1][pos.col],b.entries[2][pos.col],b.entries[3][pos.col]],4)){
		// this ugly mess does the columns
		return true
	}
	
	//console.log([b.entries[0][0],b.entries[1][1],b.entries[2][2],b.entries[3][3]])
	if (hasNRow([b.entries[0][0],b.entries[1][1],b.entries[2][2],b.entries[3][3]],4)){
		// this ugly mess does the down diagonal
		return true
	}
	
	//console.log([b.entries[3][0],b.entries[2][1],b.entries[1][2],b.entries[0][3]])
	if (hasNRow([b.entries[3][0],b.entries[2][1],b.entries[1][2],b.entries[0][3]],4)){
		// this ugly mess does the up diagonal
		return true
	}
	
	return false
}

function hasNRow(list, n) { // stolen from chatgpt bc I couldn't be bothered
    if (n <= 0) {
        return false;
    }
    
    let count = 1;
    
    for (let i = 1; i < list.length; i++) {
        if (list[i] !== 0 && list[i] === list[i - 1]) {
            count++;
            if (count === n) {
                return true;
            }
        } else {
            count = 1;
        }
    }
    
    return false;
}

function checkThree(pos) { // also my good friend chatgpt
	
		 let row = pos.row
		 let col = pos.col
		 let grid = boardList[pos.index].entries
	
	
    const directions = [
        { dr: 0, dc: 1 }, // horizontal
        { dr: 1, dc: 0 }, // vertical
        { dr: 1, dc: 1 }, // diagonal down-right
        { dr: 1, dc: -1 } // diagonal down-left
    ];
    
    const value = grid[row][col];
    
    if (value === 0) {
        return false;
    }
    
    for (const { dr, dc } of directions) {
        let count = 1;
        
        // Check in the positive direction
        for (let i = 1; i < 3; i++) {
            const newRow = row + i * dr;
            const newCol = col + i * dc;
            if (newRow >= 0 && newRow < 4 && newCol >= 0 && newCol < 4 && grid[newRow][newCol] === value) {
                count++;
            } else {
                break;
            }
        }
        
        // Check in the negative direction
        for (let i = 1; i < 3; i++) {
            const newRow = row - i * dr;
            const newCol = col - i * dc;
            if (newRow >= 0 && newRow < 4 && newCol >= 0 && newCol < 4 && grid[newRow][newCol] === value) {
                count++;
            } else {
                break;
            }
        }
        
        if (count >= 3) {
            return true;
        }
    }
    
    return false;
}


function drawPlayerLocations(){
	for (let i = 0; i < 2; i++){
		textSize(player.player == i ? 15+5*sin(frameCount/10) : 10)
		let b = boardList[player.playerBoard[i]]
		text(i == 0 ? '❌' : '⭕', b.tl.x + (i+1.5)*b.cellSize, b.tl.y + 4.5*b.cellSize)
	}
	
	
}
