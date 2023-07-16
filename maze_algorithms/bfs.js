/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

//header function

// iteratively searches breadth first through matrix to expand the startpath of (x0, y0).
// keeps a frontier with to-be-expanded squares.
// changes expaned squares' values to PATH.
// stops when frontier is empty.
//
// returns array with following structure:
// [p1, p2, p3, ...]
// where p1 = [[x,y], [[x1,y1], [x2,y2], [x3,y3], ...]]
// with [x,y] the point that got expanded
// and [x_i, y_i] one of the expanded points (dense)
function breadthFirstSearch(matrix)
{
    const x0 = matrix.length - 2;
    const y0 = 1;
    let visited = [[[x0,y0], []]];
    matrix[x0][y0] = PATH;
    bfs(visited, matrix, [[x0, y0]]);
    return visited;
}

function bfs(visited, matrix, frontier)
{
    let x, y;
    let x1, y1;
    let neighbors;

    while(frontier.length > 0)
    {
        let square = frontier[Math.floor(Math.random()*frontier.length)];
        frontier.splice(frontier.indexOf(square), 1);
        [x, y] = square;
        
        neighbors = getAllUnvisitedNeighbors(matrix, x, y);

        visitedPushBFS(visited, x, y, neighbors);

        for(const neighbor of neighbors)
        {
            [x1, y1] = neighbor;
            assignValue(matrix, x, y, x1, y1, PATH);
            frontier.push([x1,y1]);
        }
    }
}

function visitedPushBFS(visited, x, y, neighbors)
{
    let x1, y1;
    let x12, y12;

    let expanded = []

    for(const neighbor of neighbors)
    {
        [x1, y1] = neighbor;
        x12 = (x + x1) / 2;
        y12 = (y + y1) / 2;

        expanded.push([x12, y12], [x1, y1]);
    }

    visited.push([[x, y], expanded]);
}

function animateBreadthFirstSearch(visited, interval)
{
    clearMaze();

    // keeps track of amount of timeouts already called;
    let k = 0;

    for(let i = 0; i < visited.length; i++)
    {
        const squares = visited[i];
        const [x, y] = squares[0];
        const expanded = squares[1];

        // make current square PATH (from BLUE_PATH in frontier)
        TIMEOUTS.setTimeout(() => {
            matrix[x][y] = PATH;
            drawMazeUpdate(x, y, true, 200);
        }, interval * k);
        k++;

        // make all neighbors PATH_RED
        TIMEOUTS.setTimeout(() => {
            for(const e of expanded)
            {
                matrix[e[0]][e[1]] = PATH_RED;
                drawMazeUpdate(e[0], e[1], false);
            }
        }, interval * k);
        k += 2;

        // animate neighbors in frontier
        for(let j = 0; j < expanded.length; j++)
        {
            let [x1, y1] = expanded[j];

            if(j % 2 == 1)
                TIMEOUTS.setTimeout(() => {
                    matrix[x1][y1] = PATH_BLUE;
                    drawMazeUpdate(x1, y1, true, 200);
                }, interval * k);
            else
                TIMEOUTS.setTimeout(() => {
                    matrix[x1][y1] = PATH;
                    drawMazeUpdate(x1, y1, true, 200);
                }, interval * k);
            k++;
        }
        
    }

    return interval * k;
}