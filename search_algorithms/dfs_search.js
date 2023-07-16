/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

// header function

// the given matrix should only contain WALL and PATH values.
// the function returns a list with the visisted squares the search algorithm worked with.
function searchDepthFirst(matrix)
{
    // start square
    const xs = matrix.length - 2;
    const ys = 1;
    matrix[xs][ys] = PATH_GREEN;
    // end square
    const xe = 1;
    const ye = matrix[0].length - 2;
    // DONT MAKE END SQUARE PURPLE, IT FUCKS UP THE ALGORITHM
    let visited = [[xs, ys]];

    sdf(visited, matrix, [[xs, ys]], xs, ys, xe, ye);
    return visited;

}

function sdf(visited, matrix, stack, xs, ys, xe, ye)
{
    let x = xs;
    let y = ys;
    let x1, y1;

    while((x != xe || y != ye) && x != -1)
    {
        [x1, y1] = findDenseNeighbor(matrix, x, y, PATH);

        if(x1 == -1)
            [x, y, x1, y1] = searchBacktrack(matrix, stack, visited);
        
        stack.push([x1, y1]);
        visited.push([x1, y1]);
        matrix[x1][y1] = PATH_ORANGE;

        x = x1;
        y = y1;
    }

    matrix[x][y] = PATH_PURPLE;
}

function searchBacktrack(matrix, stack, visited)
{
    let x, y;
    let x1, y1;

    while(stack.length > 0)
    {
        [x, y] = stack.pop();
        visited.push([x, y]);

        [x1, y1] = findDenseNeighbor(matrix, x, y, PATH);

        if(x1 != -1)
        {
            stack.push([x,y]);
            return [x, y, x1, y1];
        }
        else
            matrix[x][y] = PATH_YELLOW;
    }
}

function animateSearchDepthFirst(visited, interval)
{
    clearPath();

    // start and end
    const [xs, ys] = visited[0];
    const [xe, ye] = visited[visited.length - 1];
    matrix[xs][ys] = PATH_GREEN;
    matrix[xe][ye] = PATH_PURPLE;

    drawMazeUpdate(xs, ys);
    drawMazeUpdate(xe, ye);

    for(let i = 1; i < visited.length - 1; i++)
    {
        TIMEOUTS.setTimeout(() => {
            const curr = visited[i];
            const next = visited[i+1];
            value = matrix[curr[0]][curr[1]];
            valueNext = matrix[next[0]][next[1]];

            if(valueNext == PATH_ORANGE)
                matrix[curr[0]][curr[1]] = PATH_YELLOW;
            else
                matrix[curr[0]][curr[1]] = PATH_ORANGE;
            
            drawMazeUpdate(curr[0], curr[1]);
        }, interval * i);
    }

    // end again
    TIMEOUTS.setTimeout(() => {
        matrix[xe][ye] = PATH_PURPLE;
        drawMazeUpdate(xe, ye);
    }, interval * visited.length-1);


    return interval * visited.length;
}