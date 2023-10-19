/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

//header function
// This algorithm starts with an all PATH maze (excluding the outer walls)
// it recursively divides the matrix in 4 segments by placing a vertical and horizontal row of WALL values.
// for every recursive step, it makes 3 PATH square passages in the placed walls.
function recursiveDivision(matrix)
{
    const n = matrix.length;
    const m = matrix[0].length;
    let visited = [];

    // make all innersquares PATH values
    for(let i = 1; i < n-1; i++)
        for(let j = 1; j < m-1; j++)
            matrix[i][j] = PATH;
    
    recDiv(visited, matrix, 1, 1, n-2, m-2); // 1 x 1 upper left corner (taking into account the outer walls).
    return visited;
}

// takes as arguments the corners (inclusive) of the part of the matrix (maze) that has to be divided.
// divides given rectangle in 4 sections and makes a passage in 3 of the 4 walls
// recursively calls itself on the 4 new sections.
// if a section has either an x- or y-dimension of 1, it stops.
function recDiv(visited, matrix, xLU, yLU, xRD, yRD)
{
    // base case
    if(xLU == xRD || yLU == yRD)
        return;

    // recursive case
    let vis = [];

    // wall intersection
    let x = Math.floor(Math.random() * (xRD - xLU) + xLU);
    let y = Math.floor(Math.random() * (yRD - yLU) + yLU);

    // intersection has to be sparse
    if(x % 2 == 1) { x++; }
    if(y % 2 == 1) { y++; }

    // vertical wall
    for(let i = xLU; i <= xRD; i++)
    {
        matrix[i][y] = WALL;
        vis.push([i, y]);
    }

    // horizontal wall
    for(let j = yLU; j <= yRD; j++)
    {
        matrix[x][j] = WALL;
        vis.push([x, j]);
    }

    // 3 gaps
    let [x1, y1, x2, y2, x3, y3] = calculateGaps(xLU, yLU, xRD, yRD, x, y);

    matrix[x1][y1] = PATH;
    matrix[x2][y2] = PATH;
    matrix[x3][y3] = PATH;

    visited.push([vis, [x1, y1], [x2, y2], [x3, y3]]);

    // Upper left quadrant
    recDiv(visited, matrix, xLU, yLU, x-1, y-1);
    // Upper right quadrant
    recDiv(visited, matrix, xLU, y+1, x-1, yRD);
    // Lower left quadrant
    recDiv(visited, matrix, x+1, yLU, xRD, y-1);
    // Lower right quadrant
    recDiv(visited, matrix, x+1, y+1, xRD, yRD);
}

function calculateGaps(xLU, yLU, xRD, yRD, x, y)
{
    if(Math.random() < 1/2)
    {
        // 2 horizontal gaps

        let x1 = Math.floor(Math.random() * (xRD - xLU) + xLU);
        if(x1 % 2 == 0) { x1++; }

        let y1 = Math.floor(Math.random() * (y - yLU) + yLU);
        if(y1 % 2 == 0) { y1++; }

        let y2 = Math.floor(Math.random() * (yRD - y) + y);
        if(y2 % 2 == 0) { y2++; }

        return [x, y1, x, y2, x1, y];
    }
    else
    {
        // 2 vertical gaps

        let y1 = Math.floor(Math.random() * (yRD - yLU) + yLU);
        if(y1 % 2 == 0) { y1++; }

        let x1 = Math.floor(Math.random() * (x - xLU) + xLU);
        if(x1 % 2 == 0) { x1++; }

        let x2 = Math.floor(Math.random() * (xRD - x) + x);
        if(x2 % 2 == 0) { x2++; }

        return [x1, y, x2, y, x, y1];
    }
}

function animateRecursiveDivision(visited, interval)
{
    clearMaze();

    // make all innersquares PATH values
    for(let i = 1; i < matrix.length-1; i++)
        for(let j = 1; j < matrix[0].length-1; j++)
            matrix[i][j] = PATH;

    drawMaze();

    // interval multiplier for the timeout
    let k = 0;

    for(let i = 0; i < visited.length; i++)
    {
        const walls = visited[i][0];
        const [x1, y1] = visited[i][1];
        const [x2, y2] = visited[i][2];
        const [x3, y3] = visited[i][3];

        // draw walls
        for(const wall of walls)
        {
            const [x, y] = wall;
            TIMEOUTS.setTimeout(() => {
                matrix[x][y] = WALL;
                drawMazeUpdate(x, y, true, 350);
            }, interval * k);
            k += 1/2;
        }

        k += 1/2;
        k += 350/interval; // extra buffer so that the wall animation of drawMazeUpdate
                           // will have finished before the red animation (that is shorter)

        // draw gaps
        TIMEOUTS.setTimeout(() => {
            matrix[x1][y1] = PATH_RED;
            drawMazeUpdate(x1, y1, true, 100);
        }, interval * k);
        TIMEOUTS.setTimeout(() => {
            matrix[x2][y2] = PATH_RED;
            drawMazeUpdate(x2, y2, true, 100);
        }, interval * k);
        TIMEOUTS.setTimeout(() => {
            matrix[x3][y3] = PATH_RED;
            drawMazeUpdate(x3, y3, true, 100);
        }, interval * k);
        k += 3;

        TIMEOUTS.setTimeout(() => {
            matrix[x1][y1] = PATH;
            drawMazeUpdate(x1, y1, true, 350);
        }, interval * k);
        TIMEOUTS.setTimeout(() => {
            matrix[x2][y2] = PATH;
            drawMazeUpdate(x2, y2, true, 350);
        }, interval * k);
        TIMEOUTS.setTimeout(() => {
            matrix[x3][y3] = PATH;
            drawMazeUpdate(x3, y3, true, 350);
        }, interval * k);
        k += 3;
    }

    return interval * k;
}