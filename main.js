// === STATE ===
let n = 4;
let matrix = [];
let history = []; // [{ from: r1, to: r2 }, ...]
let selectedRows = []; // [fromRow, toRow]
let gameOver = false;

// === DOM ELEMENTS ===
const nSelector = document.getElementById('n-selector');
const undoButton = document.getElementById('undo-button');
const resetButton = document.getElementById('reset-button');
const randomButton = document.getElementById('random-button');
const matrixGrid = document.getElementById('matrix');
const rowHeadersContainer = document.getElementById('row-headers');
const historyList = document.getElementById('history-list');
const goalElement = document.getElementById('goal');

// === LOGIC ===

/** Initializes the application state and renders the UI */
function initialize() {
    n = parseInt(nSelector.value, 10);
    matrix = Array(n).fill(0).map(() => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
        matrix[i][(i + 1) % n] = 1;
    }
    history = [];
    selectedRows = [];
    render();
    gameOver = false;
}

/** Renders the entire UI based on the current state */
function render() {
    // Render Matrix Grid
    matrixGrid.innerHTML = '';
    matrixGrid.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
    matrix.forEach((row, i) => {
        row.forEach((val, j) => {
            const cell = document.createElement('div');
            cell.className = 'matrix-cell';
            cell.textContent = val;
            cell.dataset.i = i.toString();
            cell.dataset.j = j.toString();
            if (val === 1) {
                cell.style.backgroundColor = '#64b5f6'; // Blue for 1
            } else {
                cell.style.backgroundColor = 'white'; // White for 0
            }
            matrixGrid.appendChild(cell);
        });
    });

    // Render Row Headers
    rowHeadersContainer.innerHTML = '';
    for (let i = 0; i < n; i++) {
        const header = document.createElement('div');
        header.className = 'row-header';
        header.textContent = `R${i + 1}`;
        header.dataset.i = i.toString();
        if (selectedRows.length === 1 && selectedRows[0] === i) {
            header.classList.add('selected-from');
        }
        rowHeadersContainer.appendChild(header);
    }

    // Render History List
    historyList.innerHTML = '';
    history.forEach(op => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `R${op.to + 1} ← R${op.to + 1} + R${op.from + 1}`;
        historyList.appendChild(listItem);
    });

    // Update the goal element
    goalElement.textContent = (3 * n - 3).toString();

    // Render row names
    const rowNames = Array.from({length: n}, (_, i) => `R${i + 1}`).join(', ');
    document.getElementById('row-names').textContent = `(${rowNames})`;
}

// Check if matrix is the identity.
function checkIfIdentity(mat) {
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i === j && mat[i][j] !== 1) return false;
            if (i !== j && mat[i][j] !== 0) return false;
        }
    }
    return true;
}

function checkIfInvertible(mat) {
    // Make a copy of the matrix to perform Gaussian elimination
    const copy = mat.map(row => row.slice());
    for (let i = 0; i < n; i++) {
        // Find a row with a leading 1 in column i
        let pivotRow = -1;
        for (let j = i; j < n; j++) {
            if (copy[j][i] === 1) {
                pivotRow = j;
                break;
            }
        }
        if (pivotRow === -1) return false; // No leading 1 found, not invertible

        // Swap the current row with the pivot row
        if (pivotRow !== i) {
            [copy[i], copy[pivotRow]] = [copy[pivotRow], copy[i]];
        }

        // Eliminate all other rows in column i
        for (let j = 0; j < n; j++) {
            if (j !== i && copy[j][i] === 1) {
                for (let k = 0; k < n; k++) {
                    copy[j][k] = (copy[j][k] + copy[i][k]) % 2;
                }
            }
        }
    }
    // If we reach here, the matrix is in row echelon form and is invertible
    return true;
}

function randomInvertibleMatrix(maxAttempts = 1000) {
    // Generate a random invertible matrix over F_2
    let mat = Array.from({length: n}, () => Array(n).fill(0));
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                mat[i][j] = Math.random() < 0.5 ? 0 : 1;
            }
        }

        // Ensure the matrix is invertible by performing Gaussian elimination.
        // The probability of generating an invertible matrix is
        // (1 - 1/2) * (1 - 1/4) * ... * (1 - 1/(2^n)) for n x n matrices.
        if (checkIfInvertible(mat) && !checkIfIdentity(mat)) {
            return mat;
        }
    }
    throw new Error(`Failed to generate an invertible matrix after ${maxAttempts} attempts`);
}

// === EVENT HANDLERS ===

/** Handles changing the matrix dimension n */
function handleNChange() {
    const newN = parseInt(nSelector.value, 10);
    if (newN >= 2 && newN <= 8) {
        initialize();
    } else {
        nSelector.value = n; // Revert if invalid
    }
}

/** Handles selecting a row for an operation */
function handleRowSelect(event) {
    if (gameOver) return; // Ignore clicks if the game is over
    if (!event.target.classList.contains('row-header')) return;
    const rowIndex = parseInt(event.target.dataset.i, 10);

    if (selectedRows.length === 0) {
        // First row selected (source)
        selectedRows.push(rowIndex);
    } else if (selectedRows.length === 1) {
        // Second row selected (destination)
        if (rowIndex === selectedRows[0]) {
            // Deselect if the same row is clicked again
            selectedRows = [];
        } else {
            selectedRows.push(rowIndex);
            performRowOperation();
        }
    }
    render();
}

function handleRandom() {
    try {
        matrix = randomInvertibleMatrix();
    }
    catch (error) {
        initialize();
        return;
    }
    history = [];
    selectedRows = [];
    render();
    gameOver = false;
}

/** Performs the row operation and updates history */
function performRowOperation() {
    const [fromRow, toRow] = selectedRows;

    // Add fromRow to toRow (mod 2)
    for (let j = 0; j < n; j++) {
        matrix[toRow][j] = (matrix[toRow][j] + matrix[fromRow][j]) % 2;
    }

    history.push({from: fromRow, to: toRow});
    selectedRows = []; // Reset selection after operation

    // Check if the matrix is now the identity matrix.
    // Congratulate the user if they achieved it in 3*n moves or less.
    if (checkIfIdentity(matrix)) {
        alert(`Congratulations! You transformed the matrix to the identity in ${history.length} moves.`);
        gameOver = true;
    }
}

/** Undoes the last row operation */
function handleUndo() {
    if (history.length === 0) return;

    const lastOp = history.pop();
    const {from, to} = lastOp;

    // In F_2, adding a row to another is its own inverse.
    // So, to undo, we just do the same operation again.
    for (let j = 0; j < n; j++) {
        matrix[to][j] = (matrix[to][j] + matrix[from][j]) % 2;
    }
    render();
    gameOver = false;
}


function handleUndoAll() {
    while (history.length > 0) {
        handleUndo();
    }
    selectedRows = [];
    gameOver = false;
    render();
}

// === INITIALIZATION ===
nSelector.addEventListener('change', handleNChange);
undoButton.addEventListener('click', handleUndo);
resetButton.addEventListener('click', handleUndoAll);
rowHeadersContainer.addEventListener('click', handleRowSelect);
randomButton.addEventListener('click', handleRandom);

// Initial call
initialize();
