/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

// header function

// iteratively searches depth first through matrix to expand the startpath of (x0, y0).
// backtracks at dead-ends.
// stops when every square has been explored.
// 
// returns all visited squares (dense) in order,
// this means backtracking makes duplicates in visited.
// changes matrix visited squares (dense) to PATH values.
function depthFirstSearch(matrix)
{
    const x0 = matrix.length - 2;
    const y0 = 1;
    let visited = [[x0, y0]];
    matrix[x0][y0] = PATH;
    dfs(visited, matrix, [[x0, y0]], x0, y0);

    return visited;
}

function dfs(visited, matrix, stack, x0, y0)
{
    // current square
    let x = x0;
    let y = y0;
    // neighbor square
    let x1, y1;

    for(;;)
    {    
        [x1, y1] = getRandomUnvisitedNeighbor(matrix, x, y);

        // dead end
        if(x1 == -1)
        {
            [x, y] = backtrack(matrix, stack, visited);

            // back at the beginning
            if(x == x0 && y == y0)
                return;
        }
        // extend path
        else
        {
            assignValue(matrix, x, y, x1, y1, PATH);
            stack.push([x1, y1]);
            visitedPushDFS(visited, x1, y1);
            x = x1;
            y = y1;
        }
    }
}

// Returns last visisted square with unvisited neighbors
// if no such squares exist, it empties the stack
// and thus returns x0, y0 (the first element on the stack)
function backtrack(matrix, stack, visited)
{
    let x, y;

    while(stack.length > 0)
    {
        [x, y] = stack.pop();
        visitedPushDFS(visited, x, y);

        if(hasUnvisitedNeighbor(matrix, x, y))
        {
            stack.push([x, y]);
            return [x, y];
        }
    }

    return [x, y];
}

// (x, y) and square between (x, y) and the last entry of visited are added.
// (x, y) must be only 1 square away from last entry!
function visitedPushDFS(visited, x, y)
{
    let square = visited[visited.length-1];
    let x1, y1;
    [x1, y1] = square;

    let x12 = (x + x1) / 2;
    let y12 = (y + y1) / 2;

    visited.push([x12, y12]);
    visited.push([x,y]);
}

function animateDepthFirstSearch(visited, interval)
{
    clearMaze();

    for(let i = 0; i < visited.length; i++)
    {
        if(i == visited.length - 1)
            TIMEOUTS.setTimeout(() => { 
                const curr = visited[i];
                matrix[curr[0]][curr[1]] = PATH; 
                drawMazeUpdate(curr[0], curr[1]);
            }, interval * i);
        else
            TIMEOUTS.setTimeout(() => {
                const curr = visited[i];
                const next = visited[i+1];
                let animate = false;
                value = matrix[curr[0]][curr[1]];
                valueNext = matrix[next[0]][next[1]];

                if(value == WALL || valueNext == WALL)
                    matrix[curr[0]][curr[1]] = PATH_BLUE;
                else
                {
                    matrix[curr[0]][curr[1]] = PATH;
                    animate = true; 
                }
                drawMazeUpdate(curr[0], curr[1], animate);
            }, interval * i);
    }

    return interval * visited.length;
}