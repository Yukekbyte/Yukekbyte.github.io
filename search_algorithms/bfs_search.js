/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
// header function
function searchBreadthFirst(matrix)
{
    // start square
    const xs = matrix.length - 2;
    const ys = 1;
    matrix[xs][ys] = PATH_GREEN;
    // end square
    const xe = 1;
    const ye = matrix[0].length - 2;
    // DONT MAKE THE END SQUARE PURPLE!
    let visited = [];

    sbf(visited, matrix, [[xs, ys]], xs, ys, xe, ye);
    return visited;

}

function sbf(visited, matrix, frontier, xs, ys, xe, ye)
{
    let x, y;
    let neighbors;

    while(frontier.length > 0) // if there is a solution, we do not break this condition
    {
        [x, y] = frontier.shift();

        if(x == xe && y == ye)
        {
            visited.push([[xe, ye], []]);
            break;
        }

        neighbors = getAllDenseNeighbors(matrix, x, y, PATH);

        for(const neighbor of neighbors)
        {
            let [x1, y1] = neighbor;
            matrix[x1][y1] = PATH_YELLOW;
            frontier.push([x1, y1]);
        }

        visited.push([[x, y], neighbors]);
    }

    matrix[xe][ye] = PATH_PURPLE;

    // check if no solution found
    if(frontier.length == 0)
    {
        visited.push([[-1, -1], []]);
        return;
    }
    
    // retrace visited parents to recreate path
    x = xe;
    y = ye;

    while(x != xs || y != ys)
    {
        [x, y] = findParentInVisited(visited, x, y);
        matrix[x][y] = PATH_ORANGE;
    }

    matrix[xs][ys] = PATH_GREEN;
}

function animateSearchBreadthFirst(visited, interval)
{
    // interval muliplier
    let k = 0;

    // start and end square are green and purple (so manual out of the loop)
    const [xs, ys] = visited[0][0];
    matrix[xs][ys] = PATH_GREEN;
    drawMazeUpdate(xs, ys);

    const [xe, ye] = [1, matrix[0].length-2];
    matrix[xe][ye] = PATH_PURPLE;
    drawMazeUpdate(xe, ye);

    k++;

    // children of start square also manual
    const children = visited[0][1];
    for(const child of children)
    {
        TIMEOUTS.setTimeout(() => {
            matrix[child[0]][child[1]] = PATH_YELLOW;
            drawMazeUpdate(child[0], child[1]);
        }, interval * k);
        k++
    }

    // rest of the squares
    for(let i = 1; i < visited.length-1; i++)
    {
        const [x, y] = visited[i][0];
        const children = visited[i][1];

        for(const child of children)
        {
            TIMEOUTS.setTimeout(() => {
                matrix[child[0]][child[1]] = PATH_YELLOW;
                drawMazeUpdate(child[0], child[1]);
            }, interval * k);
            k++
        }
    }

    // no solution check
    if(findParentInVisited(visited, xe, ye)[0] == -1)
    return interval * k;


    // backtrack to find the path and make it PATH_ORANGE
    TIMEOUTS.setTimeout(() => {
        matrix[xe][ye] = PATH_PURPLE;
        drawMazeUpdate(xe, ye);
    }, interval * k);
    k++;

    let x = xe;
    let y = ye;

    for(;;)
    {
        let [x1, y1] = findParentInVisited(visited, x, y); // the declaration IN the loop (retarded timeout scope issue otherwise)

        TIMEOUTS.setTimeout(() => {
            matrix[x1][y1] = PATH_ORANGE;
            drawMazeUpdate(x1, y1);
        }, interval * k);
        k++;

        x = x1;
        y = y1;

        if(x == xs && y == ys)
            break;
    }

    TIMEOUTS.setTimeout(() => {
        matrix[xs][ys] = PATH_GREEN;
        drawMazeUpdate(xs, ys);
    }, interval * k);
    k++;

    return interval * k;
}