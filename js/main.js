const start = document.querySelector(".start");
const pause = document.querySelector(".pause");
const step = document.querySelector(".step");
const reset = document.querySelector(".reset");
const gen = document.querySelector(".gen");
const rand = document.querySelector(".rand");
const input_cell = document.querySelector(".input-cell");

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 500;
canvas.height = 500;

ctx.lineWidth = 0.2;
ctx.lineCap = "round";

const floor = Math.floor;

// Game configs variables
let num = 50;
let cellSize = canvas.width / num;

let cells, genCells;
let gameTimer, currentGen;

let isMousePressed = false;

// Sets
function setGen(num) {
  currentGen = num;
  gen.innerHTML = currentGen;
}

function setInput(num) {
  input_cell.value = num;
}

function setCell(x, y, state) {
  cells[y][x] = state;
}

function setGenCell(x, y, state) {
  genCells[y][x] = state;
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawRowLines(x) {
  ctx.beginPath();
  ctx.moveTo(x * cellSize, 0);
  ctx.lineTo(x * cellSize, canvas.height);
  ctx.stroke();
}

function drawColumnLines(y) {
  ctx.beginPath();
  ctx.moveTo(0, y * cellSize);
  ctx.lineTo(canvas.width, y * cellSize);
  ctx.stroke();
}

// Draws function
function drawLines() {
  for (let i = 0; i <= num; i++) {
    drawRowLines(i);
    drawColumnLines(i);
  }
}

function drawCell(x, y) {
  ctx.beginPath();
  if (cells[y][x] === 0) ctx.fillStyle = "rgba(0, 0, 0, 0)";
  else ctx.fillStyle = "cyan";
  ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
}

function drawCells() {
  for (let y = 0; y < cells.length; y++) {
    for (let x = 0; x < cells[y].length; x++) {
      drawCell(x, y);
    }
  }
}

function drawCanvas() {
  drawCells();
  drawLines();
}

function initCells() {
  cells = [];
  genCells = [];

  for (let y = 0; y < num; y++) {
    cells.push([]);
    genCells.push([]);

    for (let x = 0; x < num; x++) {
      cells[y].push(0);
      genCells[y].push(0);
    }
  }

  setGen(0);
  setInput(num);
}

function countNeighbors(x, y) {
  let n = 0;

  for (let i = -1; i <= 1; i++) {
    const a = y + i;
    if (a < 0 || a >= cells.length) continue;

    for (let j = -1; j <= 1; j++) {
      const b = x + j;
      if (b < 0 || b >= cells[0].length || (a === y && b === x)) continue;

      if (cells[a][b] === 1) n++;
    }
  }

  return n;
}

function generateCell() {
  for (let y = 0; y < cells.length; y++) {
    for (let x = 0; x < cells[y].length; x++) {
      const n = countNeighbors(x, y);

      if (
        (cells[y][x] === 0 && n === 3) ||
        (cells[y][x] === 1 && (n === 3 || n === 2))
      ) {
        setGenCell(x, y, 1);
      } else if (cells[y][x] === 1 && (n < 2 || n >= 4)) {
        setGenCell(x, y, 0);
      } else {
        setGenCell(x, y, cells[y][x]);
      }
    }
  }

  updateCell();
}

function updateCell() {
  for (let y = 0; y < genCells.length; y++) {
    for (let x = 0; x < genCells[y].length; x++) {
      setCell(x, y, genCells[y][x]);
    }
  }
}

function startGame() {
  gameTimer = setInterval(() => {
    clearCanvas();
    generateCell();
    drawCanvas();
    setGen(++currentGen);
  }, 300);
}

function stopGame() {
  clearInterval(gameTimer);
}

function gameByStep() {
  clearCanvas();
  generateCell();
  drawCanvas();
  setGen(++currentGen);
}

function disableButtons(doms) {
  doms.forEach((e) => e.setAttribute("disabled", true));
}

function enableButtons(doms) {
  doms.forEach((e) => e.removeAttribute("disabled"));
}

function startHandler() {
  startGame();
  disableButtons([start, step, reset, rand, input_cell]);
}

function pauseHandler() {
  stopGame();
  enableButtons([start, step, reset, rand, input_cell]);
}

function randomizeCells() {
  for (const element of cells)
    for (let x = 0; x < element.length; x++)
      element[x] = Math.random() > 0.8 ? 1 : 0;
}

function randHandler() {
  clearCanvas();
  randomizeCells();
  drawCanvas();
}

function inputHandler() {
  stopGame();

  if (this.value > +this.getAttribute("max"))
    this.value = +this.getAttribute("max");
  else if (this.value < +this.getAttribute("min"))
    this.value = +this.getAttribute("min");

  num = +this.value;
  cellSize = canvas.width / num;

  clearCanvas();
  initGame();
}

// Init game when canvas is loaded
function initGame() {
  clearCanvas();
  initCells();
  drawLines();
}

window.addEventListener("load", initGame);

canvas.addEventListener("mousemove", function ({ offsetX: x, offsetY: y }) {
  if (!isMousePressed) return;

  const xIndex = floor(x / (canvas.width / num));
  const yIndex = floor(y / (canvas.height / num));

  setCell(xIndex, yIndex, 1);

  clearCanvas();
  drawCells();
  drawLines();
});

canvas.addEventListener("mousedown", () => {
  isMousePressed = true;
});

canvas.addEventListener("mouseup", () => {
  isMousePressed = false;
});

canvas.addEventListener("click", ({ offsetX: x, offsetY: y }) => {
  const xIndex = floor(x / (canvas.width / num));
  const yIndex = floor(y / (canvas.height / num));

  cells[yIndex][xIndex] === 1
    ? setCell(xIndex, yIndex, 0)
    : setCell(xIndex, yIndex, 1);

  clearCanvas();
  drawCells();
  drawLines();
});

start.addEventListener("click", startHandler);
pause.addEventListener("click", pauseHandler);
step.addEventListener("click", gameByStep);
reset.addEventListener("click", initGame);
rand.addEventListener("click", randHandler);
input_cell.addEventListener("change", inputHandler);
