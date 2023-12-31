/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

// header function
function greedySearch(matrix)
{
    // start square
    const xs = matrix.length - 2;
    const ys = 1;
    matrix[xs][ys] = PATH_GREEN;
    // end square
    const xe = 1;
    const ye = matrix[0].length - 2;
    // DONT MAKE END SQUARE PURPLE, IT FUCKS UP THE ALGORITHM
    let visited = [];
    let prioQ = new PriorityQueue(); // use same datastructure as A-star
    prioQ.add(xs, ys, manhattan(xs, ys, xe, ye)); // greedy uses only manhattan as cost function

    greedy(visited, matrix, prioQ, xs, ys, xe, ye);
    return visited;
}

function greedy(visited, matrix, prioQ, xs, ys, xe, ye)
{
    // start square manual because it should stay PATH_GREEN
    let [x, y] = prioQ.min()[0];
    let neighbors = getAllDenseNeighbors(matrix, x, y, PATH);
    visited.push([[x, y], neighbors]);
    for(const neighbor of neighbors)
    {
        const [x1, y1] = neighbor;
        prioQ.add(x1, y1, manhattan(x1, y1, xe, ye));
    }

    // keep expanding squares in order of priority
    while(x != xe || y != ye)
    {
        [x, y] = prioQ.min()[0];
        if(x == -1)
            break;
        matrix[x][y] = PATH_YELLOW;
        let neighbors = getAllDenseNeighbors(matrix, x, y, PATH);
        visited.push([[x, y], neighbors]);

        for(const neighbor of neighbors)
        {
            const [x1, y1] = neighbor;
            prioQ.add(x1, y1, manhattan(x1, y1, xe, ye));
        }
    }
    matrix[xe][ye] = PATH_PURPLE;

    // no solution check
    if(x == -1)
    {
        visited.push([[-1,-1], []]);
        return;
    }

    // retrace visited parents to recreate path
    while(x != xs || y != ys)
    {
        [x, y] = findParentInVisited(visited, x, y);
        matrix[x][y] = PATH_ORANGE;
    }

    matrix[xs][ys] = PATH_GREEN;
}

function animateGreedySearch(visited, interval)
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

    // rest of the squares
    for(let i = 1; i < visited.length-1; i++)
    {
        const square = visited[i][0];
        TIMEOUTS.setTimeout(() => {
            matrix[square[0]][square[1]] = PATH_YELLOW;
            drawMazeUpdate(square[0], square[1]);
        }, interval * k);
        k++
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



