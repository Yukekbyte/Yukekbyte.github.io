/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

//header function

// starts from a random square and marks it as PATH
// repeats:
//      pick a random neighbor
//      if neighbor not yet visited, make squares (dense) between squares PATH
// stops when all pathsquares are visited
// 
// this algorithm has no start square
function aldousBroder(matrix)
{
    let squares = getAllPathsquares(matrix);
    let visited = []
    aldous(visited, matrix, squares);
    return visited;
}

function aldous(visited, matrix, unusedSquares)
{
    // current
    let square, x, y;
    // neighbor
    let neighbor, x1, y1;

    // first square
    square = unusedSquares[Math.floor(Math.random() * unusedSquares.length)];
    [x, y] = square;
    matrix[x][y] = PATH;
    unusedSquares.splice(unusedSquares.indexOf(square), 1);
    visited.push(square);

    while(unusedSquares.length > 0)
    {
        neighbor = getRandomNeighbor(matrix, x, y);
        [x1, y1] = neighbor;

        // check if neighbor has not yet been visited
        if(matrix[x1][y1] == WALL)
        {
            assignValue(matrix, x, y, x1, y1, PATH);
            unusedSquares.splice(unusedSquares.indexOf(neighbor), 1);

            visitedPushAldous(visited, x, y, x1, y1);
        }
        else if(matrix[(x+x1)/2][(y+y1)/2] == PATH)
            visitedPushAldous(visited, x, y, x1, y1);
        else
            visited.push([x1, y1]);

        square = neighbor;
        [x, y] = neighbor;
    }
}

function visitedPushAldous(visited, x1, y1, x2, y2)
{
    let x12 = (x1 + x2) / 2;
    let y12 = (y1 + y2) / 2;

    visited.push([x12, y12]);
    visited.push([x2, y2]);
}

function animateAldousBroder(visited, interval)
{
    clearMaze();

    for(let i = 0; i < visited.length; i++)
    {
        const [x, y] = visited[i];

        TIMEOUTS.setTimeout(() => {
            matrix[x][y] = PATH_BLUE;
            drawMazeUpdate(x, y);
        }, interval * i);

        TIMEOUTS.setTimeout(() => {
            matrix[x][y] = PATH;
            drawMazeUpdate(x, y);
        }, interval * (i + 1));
    }

    return interval * visited.length;
}