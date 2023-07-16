/* eslint-disable no-unused-vars */

const DIM = [11, 19, 25, 37, 67];
const SPEED = [3, 15, 50, 90, 160];
const WALLS = [0.6, 0.7, 0.8, 0.9, 1.0];
const WALL = 0;
const PATH = 1;
const PATH_BLUE = 2;
const PATH_RED = 3;
const PATH_ORANGE = 4;
const PATH_YELLOW = 5;
const PATH_PURPLE = 6;
const PATH_GREEN = 7;
const PATH_SKYBLUE = 8;
const ALL_POSSIBLE_VALUES = [WALL, PATH, PATH_BLUE, PATH_RED];

//algorithm identifiers
const DFS = 0;
const BFS = 1;
const REC = 2;
const WIL = 3;
const KRU = 4;
const ALD = 5;
const SDFS = 6;
const SBFS = 7;
const SAST = 8;
const SGRE = 9;
const SBID = 10;

//algorithm info texts
const INFO = [
    "<h2>Depth-first Search (Maze generation)</h2>\
    <p align=\"justify\">Depth-first search (DFS) is an algorithm for visiting every node in a graph. \
    The concept can be modified to generate a maze instead. This algorithm starts by \
    assigning a square as part of the maze. We then randomly choose adjacent squares \
    to visit and mark them as part of the maze (blue paths). If we are \
    unable to proceed without making a loop (a dead-end) we backtrack our path \
    (white paths) until we find a square that has at least one unvisited adjacent \
    square. The previously visited squares are kept on a stack (the blue path) to \
    enable backtracking. If we backtrack all the way to the beginning, we know that\
    there are no unvisited squares left.</p>\
    <p>This algorithm tends to create mazes with long corridors and few junctions.</p>",

    "<h2>Prim's Algorithm</h2>\
    <p align=\"justify\">Prim's algorithm is used to find a (minimum) spanning tree of a graph. \
    Because a maze is just the spanning tree of a planar graph with all the walkable squares as nodes, we can use this algorithm to generate a maze. \
    The algorithm starts with assigning a single square as part of the maze and adds it to the frontier. \
    This is a set with squares that have yet to 'expand' shown in blue. \
    We then iteratively remove a random square from the frontier and expand it. Expanding a square makes a path in the \
    maze from the square to its unvisited adjacent squares. Afterwards, it adds these adjacent squares to the frontier. \
    If the square has no unvisited neighboring squares, nothing happens. \
    The algorithm stops when the frontier is empty, and thus when all the squares in the maze have been expanded.</p>\
    <p>This algorithm tends to create mazes with many junctions and short dead-ends.</p>",

    "<h2>Recursive Division</h2>\
    <p align=\"justify\">Redursive Division is a maze generation algorithm that starts with an empty maze.\
    At each step, 2 perpendicular walls divide a part of the maze in 4 regions. Next, 3 passages \
    are made in the walls to connect those 4 regions (more than 3 passages would create a loop). The placing of the walls and \
    passages are randomized. We can then recursively call the algorithm on the 4 created regions seperately. The recursion \
    stops when the region has a horizontal or vertical dimension of 1.</p>\
    <p>The created mazes are easily recognized by long straight walls and rectangular rooms with a few entries.</p>",

    "<h2>Wilson's Algorithm</h2>\
    <p align=\"justify\">This algorithm uses loop-erased random walks to build the corridors of the maze. \
    A <b>loop-erased random walk</b> is a process where we start 'walking' from a startsquare in the maze by choosing adjacent squares to visit at random. \
    This path is visualised in blue. If the walk comes across a square it has already visited, we have made a loop in the path. \
    When this happens the loop gets erased and the 'walking' process continues. The path is converted into a permanent path when we \
    come across a square that is already part of the maze. <br> <br>\
    The algorithm starts with a assigning the bottom left square as part of the maze and iterates over all possible squares to perform a loop-erased random walk. \
    The disadvantage of this algorithm becomes clear when visualising the loop-erased random walks. Because at the beginning there exists only a single maze square, \
    we can get stuck is a long process of walking without hitting that square. This makes the algorithm slow and unreliable for mazes of substantial size. \
    The algorithm stops when no more loop-erased random walks can be performed.</p>\
    <p>This algorithm generates an unbiased sample from the uniform distribution over all the possible mazes. \
    This means the algorithm has no unique characteristic that makes its created mazes recongnizable.</p>",

    "<h2>Kruskal's Algorithm</h2>\
    <p align=\"justify\">Kruskal's algorithm is used to find a (minimum) spanning tree of a graph. \
    Just like Prim's algorithm, we use the spanning tree given by Kruskal's algorithm to generate our maze. \
    We start by putting each square in a set containing only itself. The algorithm uses a disjoint set data structure that keeps track of these sets of square(s). \
    It then keeps randomly choosing walls (these would be the edges in the graph) and removes those walls that do not create a loop in the maze. We can test if the wall creates a \
    loop by checking if the squares adjacent to that wall are in the same set or not. If they are, that means they are already connected in the maze \
    and thus we cannot remove the wall without creating a loop. If they are in different sets however, we remove the wall and join those 2 disjoint sets. We also make those squares part of the maze if they weren't already. \
    If no more walls can be removed without creating loops, the algorithm is done.</p>\
    <p>Mazes generated by Kruskal's algorithm tend to have more short dead-ends than usual.</p>",

    "<h2>Aldous-Broder algorithm</h2>\
    <p align=\"justify\">This is one of the slowest and most straighforward maze generation algorithms. \
    We start by assigning a random square part of the maze. Then we jump to neighboring squares at random (visualised in blue). \
    At each square, if it is already part of the maze, we do nothing. If it is not yet part of the maze, \
    remove the wall between the squares and make the square part of the maze. The algorithm stops when all squares have been visited. \
    This algorithm is slow because when almost all squares have been visited, the selected square keeps making redundant moves by \
    jumping between squares that have already been visited. The chance for the selected square to land upon one the infrequent remaining squares is low for any relatively small number of steps.</p>\
    <p>Like Wilson's algorithm, it generates an unbiased sample from the uniform distribution over all the possible mazes. \
    This means the algorithm has no unique characteristic that makes its created mazes recongnizable.</p>",
    
    "<h2>Depth-first Search (Pathfinding)</h2>",

    "<h2>Breadth-first Search (Pathfinding)</h2>",

    "<h2>A* algorithm (A-star)</h2>",

    "<h2>Greedy search</h2>",

    "<h2>Bidirectional search</h2>"
]

//timeout keeper
const TIMEOUTS = {
    timeouts: [],
    setTimeout: function(fn, delay) {
        const id = setTimeout(fn, delay);
        this.timeouts.push(id);
    },
    clearAllTimeouts: function() {
        while (this.timeouts.length) {
            clearTimeout(this.timeouts.pop())
        }
    }
}

// gets all neighbors (sparse) of [x, y] with its value in the matrix being elements of values.
function getAllNeighbors(matrix, x, y, values=ALL_POSSIBLE_VALUES)
{
    let n = matrix.length;
    let m = matrix[0].length;
    let neighbors = [];

    let xs = [];
    let ys = [];

    if(x-2 >= 0)
        xs.push(x-2);
    if(x+2 <= n-1)
        xs.push(x+2);
    if(y-2 >= 0)
        ys.push(y-2);
    if(y+2 <= m-1)
        ys.push(y+2);

    for(const i of xs)
        for(const value of values)
            if(matrix[i][y] == value)
                    neighbors.push([i, y]);
    for(const j of ys)
        for(const value of values)
            if(matrix[x][j] == value)
                neighbors.push([x, j]);
    
    return neighbors;
}

// gets a random neighbor (sparse) of [x, y] with its value in the matrix being element of values.  
function getRandomNeighbor(matrix, x, y, values=ALL_POSSIBLE_VALUES)
{
    let neighbors = getAllNeighbors(matrix, x, y, values);
    if(neighbors.length == 0)
        return [-1, -1];
    else
        return neighbors[Math.floor(Math.random()*neighbors.length)];
}

function getAllUnvisitedNeighbors(matrix, x, y)
{
    return getAllNeighbors(matrix, x, y, [WALL]);
}

function getRandomUnvisitedNeighbor(matrix, x, y)
{
    let neighbors = getAllUnvisitedNeighbors(matrix, x, y);
    if(neighbors.length == 0)
        return [-1, -1];
    else
        return neighbors[Math.floor(Math.random()*neighbors.length)];
}

function hasUnvisitedNeighbor(matrix, x, y)
{
    return getAllUnvisitedNeighbors(matrix, x, y).length > 0;
}

function getAllDenseNeighbors(matrix, x, y, value)
{
    const n = matrix.length;
    const m = matrix[0].length;

    let neighbors = [];

    if(x-1 >= 0 && matrix[x-1][y] == value)
        neighbors.push([x-1, y]);
    if(y+1 <= m-1 && matrix[x][y+1] == value)
        neighbors.push([x, y+1]);
    if(x+1 <= n-1 && matrix[x+1][y] == value)
        neighbors.push([x+1, y]);
    if(y-1 >= 0 && matrix[x][y-1] == value)
        neighbors.push([x, y-1]);
    
    return neighbors;
}

function findDenseNeighbor(matrix, x, y, value)
{
    const n = matrix.length;
    const m = matrix[0].length;

    if(x-1 >= 0 && matrix[x-1][y] == value)
        return [x-1, y];
    if(y+1 <= m-1 && matrix[x][y+1] == value)
        return [x, y+1];
    if(x+1 <= n-1 && matrix[x+1][y] == value)
        return [x+1, y];
    if(y-1 >= 0 && matrix[x][y-1] == value)
        return [x, y-1];
    
    return [-1, -1];
}

// Almost identical to getRandomNeighbor() but this function can be used instead
// if you know there exists only 1 such square. This function is more efficient.
function findSparseNeighbor(matrix, x, y, value)
{
    const n = matrix.length;
    const m = matrix[0].length;

    if(x-2 >= 0 && matrix[x-2][y] == value)
        return [x-2, y];
    if(y-2 >= 0 && matrix[x][y-2] == value)
        return [x, y-2];
    if(x+2 <= n-1 && matrix[x+2][y] == value)
        return [x+2, y];
    if(y+2 <= m-1 && matrix[x][y+2] == value)
        return [x, y+2];
    
    return [-1, -1];
}

// assigns squares between (x,y) and (x1,y1) 'value' in the matrix.
// only square x, y if (x1,y1) = (-1, -1)
function assignValue(matrix, x, y, x1, y1, value)
{
    if(x1 == -1)
        matrix[x][y] = value;
    else
    {
        let x12 = (x + x1) / 2;
        let y12 = (y + y1) / 2;
    
        matrix[x][y] = value;
        matrix[x12][y12] = value;
        matrix[x1][y1] = value;
    }
}

// returns 0-squares in following pattern:
// ++++++++++++ ^
// +0+0+0+0+0++ |
// ++0+0+0+0+0+ |
// +0+0+0+0+0++ |
// ++0+0+0+0+0+ n
// +0+0+0+0+0++ |
// ++0+0+0+0+0+ |
// ++++++++++++ v
// <----m----->
function getAllNonPermanentWalls(matrix)
{
    // not really a 'start square', it is only used as a reference point.
    const x0 = matrix.length - 2;
    const y0 = 1;

    let walls = [];

    // even colums
    for(let j = y0; j < matrix[0].length - 1; j += 2)
        for(let i = x0-1; i > 0; i -= 2)
            walls.push([i, j]);

    // odd colums
    for(let j = y0+1; j < matrix[0].length - 1; j += 2)
        for(let i = x0; i > 0; i -= 2)
            walls.push([i, j]);

    return walls;
}

function getAllPathsquares(matrix)
{
    // not really a 'start square', it is only used as a reference point.
    const x0 = matrix.length - 2;
    const y0 = 1;

    let squares = [];

    for(let i = x0; i > 0; i -= 2)
        for(let j = y0; j < matrix[0].length - 1; j += 2)
            squares.push([i, j]);

    return squares;
}

function getRandomPathsquare(matrix)
{
    // not really a 'start square', it is only used as a reference point.
    const x0 = matrix.length - 2;
    const y0 = 1;

    const i = Math.floor(Math.random() * Math.floor((matrix.length)/2));
    const j = Math.floor(Math.random() * Math.floor((matrix[0].length)/2));

    return [x0 - 2*i, y0 + 2*j];
}

function hasOtherDenseWallNeighbor(matrix, x, y, x1, y1)
{
    if(x == 0 || y == 0 || x == matrix.length-1 || y == matrix[0].length-1)
        return true;    
    if(matrix[x-1][y] == WALL && x-1 != x1)
        return true;
    if(matrix[x+1][y] == WALL && x+1 != x1)
        return true;
    if(matrix[x][y-1] == WALL && y-1 != y1)
        return true;
    if(matrix[x][y+1] == WALL && y+1 != y1)
        return true;
    return false;
}

// WARNING: only useable for a specific visited layout such as in the SBFS, SAST and SGRE algorithms
function findParentInVisited(visited, x, y)
{
    // disgusting lineair search because time complexity is no issue
    // and can't be bothered to make a hashmap or a smart structure of arrays to find parent
    for(let i = 0; i < visited.length; i++)
        {
            let [x1, y1] = visited[i][0]; // parent
            let children = visited[i][1];
            
            // check if parent is the parent we need
            for(const child of children)
                if(x == child[0] && y == child[1])
                    return [x1, y1];
        }

    return [-1, -1];
}

function manhattan(x1, y1, x2, y2)
{
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}