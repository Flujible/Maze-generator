const cellWidth = cellHeight = 30;
const stack = [];
let cells = [];
let canvasWidth = cellWidth * 20
let canvasHeight = cellHeight * 20;
let numRows = canvasHeight / cellHeight;
let numCols = canvasWidth / cellWidth;
let currentCell;
let framerateInputEl;
let framerateValEl;
let startMazeGenEl;
let gridSizeXEl;
let gridSizeYEl;

window.onload = () => {
    framerateInputEl = document.getElementById('framerateInput');
    startMazeGenEl = document.getElementById('startMazeGen');
    framerateValEl = document.getElementById('framerateVal');
    gridSizeXEl = document.getElementById('gridSizeX');
    gridSizeXValEl = document.getElementById('gridSizeXVal');
    gridSizeYEl = document.getElementById('gridSizeY');
    gridSizeYValEl = document.getElementById('gridSizeYVal');
    framerateInputEl.oninput = (e) => {
        e.preventDefault();
        const framerateVal = e.target.value;
        updateFramerate(framerateVal);
        framerateValEl.innerHTML = `${framerateVal}`;
    }
    startMazeGenEl.onclick = (e) => {
        e.preventDefault();
        startMazeGen();
        gridSizeXEl.disabled = true;
        gridSizeYEl.disabled = true;
    };
    gridSizeXEl.oninput = (e) => {
        e.preventDefault();
        xVal = e.target.value;
        updateGridSize(xVal, true);
        gridSizeXValEl.innerHTML = `${xVal}`;
    }
    gridSizeYEl.oninput = (e) => {
        e.preventDefault();
        yVal = e.target.value;
        updateGridSize(e.target.value, false);
        gridSizeYValEl.innerHTML = `${yVal}`;
    }

}

const updateGridSize = (value, xAxis) => {
    if (xAxis) {
        canvasHeight = cellHeight * value;
    } else {
        canvasWidth = cellWidth * value;
    }
    resizeCanvas(canvasWidth, canvasHeight);
    numRows = canvasHeight / cellHeight;
    numCols = canvasWidth / cellWidth;
    cells = [];
    createGrid();
    drawAllCells();
}

const drawAllCells = () => {
    cells.forEach(rows =>
        rows.forEach(cell => {
            cell.drawWalls();
        })
    );
}

const updateFramerate = (val) => {
    frameRate(Number(val));
}

const startMazeGen = () => {
    createGrid();
    drawAllCells();
    const initialCell = cells[0][0];
    initialCell.visited = true;
    stack.push(initialCell);
    initialCell.stackIndex = stack.length;
    frameRate(framerateInputEl.value);
    loop();
}

const markFirstLast = (cells) => {
    let initialCell = cells[0][0];
    let furthestCell = cells[0][0];
    cells.forEach(outerArray => {
        outerArray.forEach(cell => {
            if (cell.stackIndex > furthestCell.stackIndex) {
                furthestCell = cell;
            }
        });
    });
    fill('red');
    noStroke();
    square(initialCell.xPos, initialCell.yPos, cellWidth);
    square(furthestCell.xPos, furthestCell.yPos, cellWidth);
    initialCell.drawWalls();
    furthestCell.drawWalls();
}

setup = () => {
    createCanvas(canvasWidth, canvasHeight);
    noLoop();
    createGrid();
    drawAllCells();
}

draw = () => {
    if (stack.length === 0) {
        console.log("Finished");
        noLoop();
        if (gridSizeXEl) {
            gridSizeXEl.disabled = false;
        }
        if (gridSizeYEl) {
            gridSizeYEl.disabled = false;
        }
        markFirstLast(cells);
        return;
    }
    currentCell = stack.pop();
    noStroke();
    fill(200, 0, 0);
    square(currentCell.x, currentCell.y, cellWidth);
    currentCell.evaluateNeighbours();
    if (currentCell.hasViableNeighbours()) {
        stack.push(currentCell);
        currentCell.stackIndex = stack.length;

        let direction = generateRandomDirection();
        while (!validateDirection(direction, currentCell.xIndex, currentCell.yIndex)) {
            direction = generateRandomDirection();
        }
        const chosenNeighbourCell = currentCell.chooseNeighbour(direction);

        currentCell.removeWall(direction);
        chosenNeighbourCell.removeWall(((((direction - 2) % 4) + 4) % 4));

        chosenNeighbourCell.visited = true;
        stack.push(chosenNeighbourCell);
        chosenNeighbourCell.stackIndex = stack.length;
    }
    clear();
    drawAllCells();
}

const createGrid = () => {
    for(let x = 0; x < numCols; x++) {
        cells.push([]);
        for(let y = 0; y < numRows; y++) {
            const newCell = new Cell(x, y);
            cells[x][y] = newCell;
        };
    };
}

const validateDirection = (direction, cellXIndex, cellYIndex) => {
    if (direction === 0 && cellYIndex === 0) {
        return false;
    }
    if (direction === 1 && cellXIndex === numCols - 1) {
        return false;
    }
    if (direction === 2 && cellYIndex === numRows - 1) {
        return false;
    }
    if (direction === 3 && cellXIndex === 0) {
        return false;
    }

    if (direction === 0 && cells[cellXIndex][cellYIndex - 1].visited) {
        return false;
    }
    if (direction === 1 && cells[cellXIndex + 1][cellYIndex].visited) {

        return false;
    }
    if (direction === 2 && cells[cellXIndex][cellYIndex + 1].visited) {
        return false;
    }
    if (direction === 3 && cells[cellXIndex - 1][cellYIndex].visited) {
        return false;
    }
    return true;
}

const generateRandomDirection = () => {
    return Math.floor(Math.random() * 4);
}

class Cell {
    visited = false;
    walls = {
        top: true,
        right: true,
        bottom: true,
        left: true
    }
    viableNeighbours = {
        top: true,
        right: true,
        bottom: true,
        left: true
    }
    xIndex;
    yIndex;
    xPos;
    yPos;
    stackIndex;

    constructor(xIndex, yIndex) {
        this.xIndex = xIndex;
        this.yIndex = yIndex;
        this.xPos = xIndex * cellWidth;
        this.yPos = yIndex * cellHeight;
    }

    removeWall(direction) {
        this.walls[Object.keys(this.walls)[direction]] = false;
    }

    drawWalls() {
        if (this.visited) {
            strokeWeight(2);
            stroke(0);
        } else {
            strokeWeight(1)
            stroke(200);
        }
        if (this.walls.top) {
            line(this.xPos, this.yPos, this.xPos + cellWidth, this.yPos);
        }
        if (this.walls.right) {
            line(this.xPos + cellWidth, this.yPos, this.xPos + cellWidth, this.yPos + cellHeight);
        }
        if (this.walls.bottom) {
            line(this.xPos, this.yPos + cellHeight, this.xPos + cellWidth, this.yPos + cellHeight);
        }
        if (this.walls.left) {
            line(this.xPos, this.yPos, this.xPos, this.yPos + cellHeight);
        }
    }

    evaluateNeighbours() {
        if (this.yIndex === 0) {
            this.viableNeighbours.top = false;
        } else if (cells[this.xIndex][this.yIndex - 1].visited) {
            this.viableNeighbours.top = false;
        }
        if (this.yIndex === numRows - 1) {
            this.viableNeighbours.bottom = false;
        } else if (cells[this.xIndex][this.yIndex + 1].visited) {
            this.viableNeighbours.bottom = false;
        }
        if (this.xIndex === 0) {
            this.viableNeighbours.left = false;
        } else if (cells[this.xIndex - 1][this.yIndex].visited) {
            this.viableNeighbours.left = false;
        }
        if (this.xIndex === numCols - 1) {
            this.viableNeighbours.right = false;
        } else if (cells[this.xIndex + 1][this.yIndex].visited) {
            this.viableNeighbours.right = false;
        }
    }

    hasViableNeighbours = () => {
        let viableNeighbours = false;
        Object.keys(this.viableNeighbours).forEach(key => {
            if (this.viableNeighbours[key] === true) {
                viableNeighbours = true;
            }
        });

        return viableNeighbours;
    }

    chooseNeighbour(direction) {
        if (direction === 0) {
            return cells[this.xIndex][this.yIndex - 1];
        }
        if (direction === 1) {
            return cells[this.xIndex + 1][this.yIndex];
        }
        if (direction === 2) {
            return cells[this.xIndex][this.yIndex + 1];
        }
        if (direction === 3) {
            return cells[this.xIndex - 1][this.yIndex];
        }
    }
}
