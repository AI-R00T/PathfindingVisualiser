// --- Canvas Setup ---
const canvas = document.getElementById('pathfindingCanvas');
const ctx = canvas.getContext('2d');

const COLS = 25; // Number of columns in the grid
const ROWS = 20; // Number of rows in the grid
const CELL_SIZE = 25; // Size of each cell in pixels

// Adjust canvas dimensions based on cell size and grid size
canvas.width = COLS * CELL_SIZE;
canvas.height = ROWS * CELL_SIZE;

// --- Game State Variables ---
let grid; // 2D array representing the grid
let startNode;
let endNode;
let openSet = [];     // Nodes to be evaluated
let closedSet = [];   // Nodes already evaluated
let path = [];        // The shortest path found
let noSolution = false;
let algorithmRunning = false;

// Interaction modes
const MODE_DRAW_WALL = 0;
const MODE_SET_START = 1;
const MODE_SET_END = 2;
let currentMode = MODE_DRAW_WALL; // Default mode is drawing walls

// --- HTML Element References ---
const startButton = document.getElementById('startButton');
const setStartButton = document.getElementById('setStartButton');
const setEndButton = document.getElementById('setEndButton');
const resetButton = document.getElementById('resetButton');
const statusMessage = document.getElementById('statusMessage');

// --- Node Class Definition ---
// Represents a single cell in the grid
class Node {
    constructor(col, row) {
        this.col = col;
        this.row = row;
        this.x = col * CELL_SIZE;
        this.y = row * CELL_SIZE;
        this.isWall = false; // Is this node an obstacle?

        // A* specific properties
        this.f = 0; // f = g + h (total cost)
        this.g = 0; // g cost (cost from start to this node)
        this.h = 0; // h cost (heuristic cost from this node to end)
        this.neighbors = []; // Adjacent nodes
        this.previous = undefined; // For reconstructing the path
    }

    // Add valid neighbors (not walls, within grid boundaries)
    addNeighbors(grid) {
        const i = this.col;
        const j = this.row;

        // Check horizontal and vertical neighbors
        if (i < COLS - 1) this.neighbors.push(grid[i + 1][j]);
        if (i > 0) this.neighbors.push(grid[i - 1][j]);
        if (j < ROWS - 1) this.neighbors.push(grid[i][j + 1]);
        if (j > 0) this.neighbors.push(grid[i][j - 1]);

        // Optional: Add diagonal neighbors (if allowed in your pathfinding)
        /*
        if (i > 0 && j > 0) this.neighbors.push(grid[i - 1][j - 1]);
        if (i < COLS - 1 && j > 0) this.neighbors.push(grid[i + 1][j - 1]);
        if (i > 0 && j < ROWS - 1) this.neighbors.push(grid[i - 1][j + 1]);
        if (i < COLS - 1 && j < ROWS - 1) this.neighbors.push(grid[i + 1][j + 1]);
        */
    }

    // --- Drawing methods for individual nodes ---
    draw(color) {
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, CELL_SIZE - 1, CELL_SIZE - 1); // -1 for border effect
    }

    drawAsWall() {
        ctx.fillStyle = '#444'; // Dark gray for walls
        ctx.fillRect(this.x, this.y, CELL_SIZE - 1, CELL_SIZE - 1);
    }
}

// --- Heuristic Function (Manhattan Distance) ---
// Estimates the distance from a node to the end node
function heuristic(nodeA, nodeB) {
    // Manhattan distance: |x1 - x2| + |y1 - y2|
    return Math.abs(nodeA.col - nodeB.col) + Math.abs(nodeA.row - nodeB.row);
}

// --- Grid Initialization ---
function initializeGrid() {
    grid = new Array(COLS);
    for (let i = 0; i < COLS; i++) {
        grid[i] = new Array(ROWS);
    }

    for (let i = 0; i < COLS; i++) {
        for (let j = 0; j < ROWS; j++) {
            grid[i][j] = new Node(i, j);
        }
    }

    // Add neighbors for each node
    for (let i = 0; i < COLS; i++) {
        for (let j = 0; j < ROWS; j++) {
            grid[i][j].addNeighbors(grid);
        }
    }

    // Set initial start and end nodes (can be changed by user)
    startNode = grid[0][0];
    endNode = grid[COLS - 1][ROWS - 1];

    // Reset A* specific arrays
    openSet = [startNode];
    closedSet = [];
    path = [];
    noSolution = false;
    algorithmRunning = false;
}

// --- Drawing the Grid ---
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear entire canvas

    for (let i = 0; i < COLS; i++) {
        for (let j = 0; j < ROWS; j++) {
            const node = grid[i][j];
            
            // Draw walls first
            if (node.isWall) {
                node.drawAsWall();
            } else {
                // Draw empty cells
                ctx.fillStyle = '#1e2d40'; // Grid background color
                ctx.fillRect(node.x, node.y, CELL_SIZE - 1, CELL_SIZE - 1);
            }

            // Highlight special nodes
            if (node === startNode) {
                node.draw('#28a745'); // Green for start
            } else if (node === endNode) {
                node.draw('#ff6347'); // Tomato red for end
            }
        }
    }

    // Draw open set, closed set, and path during visualization
    if (algorithmRunning) {
        for (let i = 0; i < closedSet.length; i++) {
            closedSet[i].draw('rgba(255, 255, 0, 0.3)'); // Faded yellow for closed set
        }

        for (let i = 0; i < openSet.length; i++) {
            openSet[i].draw('rgba(0, 255, 255, 0.3)'); // Faded cyan for open set
        }

        for (let i = 0; i < path.length; i++) {
            path[i].draw('#00f0ff'); // Bright cyan for the path
        }
    }
}

// --- A* Algorithm Core Logic ---
function aStarStep() {
    if (openSet.length > 0) {
        // Find the node in openSet with the lowest f cost
        let lowestFIndex = 0;
        for (let i = 0; i < openSet.length; i++) {
            if (openSet[i].f < openSet[lowestFIndex].f) {
                lowestFIndex = i;
            }
        }

        const currentNode = openSet[lowestFIndex];

        // If we reached the end, reconstruct the path and stop
        if (currentNode === endNode) {
            console.log('Path Found!');
            algorithmRunning = false;
            statusMessage.textContent = 'Path found! 🎉';
            reconstructPath(currentNode);
            drawGrid(); // Final draw to show complete path
            return; // Stop the animation loop
        }

        // Move current node from openSet to closedSet
        openSet.splice(lowestFIndex, 1);
        closedSet.push(currentNode);

        // Check neighbors of the current node
        const neighbors = currentNode.neighbors;
        for (let i = 0; i < neighbors.length; i++) {
            const neighbor = neighbors[i];

            // Only consider valid neighbors that are not walls and not in closedSet
            if (!neighbor.isWall && !closedSet.includes(neighbor)) {
                const tempG = currentNode.g + 1; // Distance from current to neighbor is 1

                let newPath = false;
                if (openSet.includes(neighbor)) {
                    if (tempG < neighbor.g) {
                        neighbor.g = tempG;
                        newPath = true;
                    }
                } else {
                    neighbor.g = tempG;
                    openSet.push(neighbor);
                    newPath = true;
                }

                if (newPath) {
                    neighbor.h = heuristic(neighbor, endNode);
                    neighbor.f = neighbor.g + neighbor.h;
                    neighbor.previous = currentNode;
                }
            }
        }
    } else {
        // No solution
        console.log('No solution!');
        noSolution = true;
        algorithmRunning = false;
        statusMessage.textContent = 'No solution found. Try resetting the grid or moving walls. 😔';
        return; // Stop the animation loop
    }

    // Redraw grid for visualization
    drawGrid();
    // Request next frame if algorithm is still running
    if (algorithmRunning) {
        requestAnimationFrame(aStarStep);
    }
}

// --- Path Reconstruction ---
function reconstructPath(current) {
    path = [];
    let temp = current;
    while (temp.previous) {
        path.push(temp);
        temp = temp.previous;
    }
    // Add start node to path if desired, but not strictly necessary for visualization
    // path.push(startNode);
    path.reverse(); // Path from start to end
}


// --- User Interaction ---

// Get mouse position relative to canvas
function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

// Handle mouse clicks on the canvas
canvas.addEventListener('mousedown', (e) => {
    if (algorithmRunning) return; // Don't allow changes while algorithm is running

    const mousePos = getMousePos(canvas, e);
    const col = Math.floor(mousePos.x / CELL_SIZE);
    const row = Math.floor(mousePos.y / CELL_SIZE);

    // Ensure click is within grid boundaries
    if (col >= 0 && col < COLS && row >= 0 && row < ROWS) {
        const clickedNode = grid[col][row];

        if (currentMode === MODE_DRAW_WALL) {
            if (clickedNode !== startNode && clickedNode !== endNode) {
                clickedNode.isWall = !clickedNode.isWall; // Toggle wall
                drawGrid(); // Redraw immediately
            }
        } else if (currentMode === MODE_SET_START) {
            if (clickedNode !== endNode && !clickedNode.isWall) {
                // Clear previous start node's wall status if it became a wall
                if (startNode) startNode.isWall = false;
                startNode = clickedNode;
                // Reinitialize A* related arrays if start/end change to ensure clean state
                resetAStarState();
                drawGrid();
            } else {
                statusMessage.textContent = "Start node cannot be an end node or a wall!";
            }
        } else if (currentMode === MODE_SET_END) {
            if (clickedNode !== startNode && !clickedNode.isWall) {
                // Clear previous end node's wall status if it became a wall
                if (endNode) endNode.isWall = false;
                endNode = clickedNode;
                // Reinitialize A* related arrays if start/end change to ensure clean state
                resetAStarState();
                drawGrid();
            } else {
                statusMessage.textContent = "End node cannot be a start node or a wall!";
            }
        }
    }
});

// --- Button Event Listeners ---

// Start Search Button
startButton.addEventListener('click', () => {
    if (!algorithmRunning && !noSolution) {
        statusMessage.textContent = 'Searching for path...';
        algorithmRunning = true;
        // Ensure initial A* state is set correctly before starting
        resetAStarState();
        aStarStep(); // Start the animation loop
    } else if (noSolution) {
        statusMessage.textContent = 'No solution was found. Reset the grid to try again.';
    }
});

// Set Start Node Button
setStartButton.addEventListener('click', () => {
    if (!algorithmRunning) {
        currentMode = MODE_SET_START;
        statusMessage.textContent = 'Click on an empty cell to set the Start Node.';
        // Add a visual indicator for active mode if desired
    }
});

// Set End Node Button
setEndButton.addEventListener('click', () => {
    if (!algorithmRunning) {
        currentMode = MODE_SET_END;
        statusMessage.textContent = 'Click on an empty cell to set the End Node.';
        // Add a visual indicator for active mode if desired
    }
});

// Reset Button
resetButton.addEventListener('click', () => {
    initializeGrid();
    drawGrid();
    currentMode = MODE_DRAW_WALL; // Reset mode to drawing walls
    statusMessage.textContent = 'Grid reset! Click to draw walls or set new start/end points.';
});

// Helper to reset A* specific arrays when start/end/walls change
function resetAStarState() {
    openSet = [startNode];
    closedSet = [];
    path = [];
    noSolution = false;
    algorithmRunning = false; // Stop any ongoing animation
    
    // Reset f, g, h, previous for all nodes for a clean run
    for (let i = 0; i < COLS; i++) {
        for (let j = 0; j < ROWS; j++) {
            const node = grid[i][j];
            node.f = 0;
            node.g = 0;
            node.h = 0;
            node.previous = undefined;
        }
    }
}


// --- Initial Setup ---
initializeGrid();
drawGrid(); // Initial draw of the empty grid
