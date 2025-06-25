# A* Pathfinding Visualiser 🚀

Explore the magic of pathfinding algorithms with this interactive A* (A-star) Pathfinding Visualizer! This project allows you to draw obstacles on a grid, set start and end points, and then watch as the A* algorithm intelligently finds the shortest path.

## What is A* (A-star)?

A* is one of the most popular and efficient pathfinding algorithms. It's widely used in areas like:
* **Game Development:** For AI character movement, navigating mazes.
* **Robotics:** For robot navigation and motion planning.
* **GPS Systems:** Finding optimal routes.

A* works by evaluating each potential step using a combination of:
* `g` score: The actual cost from the starting node to the current node.
* `h` score: The estimated cost (heuristic) from the current node to the end node.
* `f` score: The sum of `g` and `h` (i.e., `f = g + h`), representing the total estimated cost of the path through that node.

It always prioritises exploring the node with the lowest `f` score, making it "intelligent" in its search.

## How to Use

1.  **Draw Walls:** Click on any empty cell on the grid to toggle it as a wall (obstacle).
2.  **Set Start/End:**
    * Click the "Set Start" button, then click on an empty cell to place the starting point.
    * Click the "Set End" button, then click on an empty cell to place the ending point.
3.  **Start Search:** Click the "Start Search" button to initiate the A* algorithm. Watch as it explores the grid and highlights the shortest path found.
4.  **Reset:** Click "Reset Grid" to clear everything and start over.

## Technologies Used

* **HTML5:** Provides the basic structure of the web page and the canvas element for drawing the grid.
* **CSS3 (Custom):** Styles the interface with a cool, dark, and futuristic theme, including responsive design for various screen sizes.
* **JavaScript:** Implements the A* pathfinding algorithm, handles all user interactions (drawing, setting points), and manages the real-time visualisation on the canvas.

## My Learning Journey

This project is an exciting step in my software engineering learning journey. It allowed me to dive deeper into algorithms, visual programming with JavaScript canvas, and creating interactive user experiences. I'm thrilled to share this glimpse into AI concepts and continue building more fascinating applications!

Feel free to interact with the visualiser, fork the repository, and explore the code!