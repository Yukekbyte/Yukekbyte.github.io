/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

function astarSearch(matrix)
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
    let prioQ = new PriorityQueue();
    prioQ.add(xs, ys, manhattan(xs, ys, xe, ye) + 0); // cost is 

    astar(visited, matrix, prioQ, xs, ys, xe, ye);
    return visited;
}

function astar(visited, matrix, prioQ, xs, ys, xe, ye)
{
    // start square manual because it should stay PATH_GREEN
    let [[x, y], oldPrio] = prioQ.min();
    let neighbors = getAllDenseNeighbors(matrix, x, y, PATH);
    visited.push([[x, y], neighbors]);
    for(const neighbor of neighbors)
    {
        const [x1, y1] = neighbor;
        prioQ.add(x1, y1, 1 + manhattan(x1, y1, xe, ye));
    }

    // keep expanding squares in order of priority
    while(x != xe || y != ye)
    {
        [[x, y], oldPrio] = prioQ.min();
        matrix[x][y] = PATH_YELLOW;
        let neighbors = getAllDenseNeighbors(matrix, x, y, PATH);
        visited.push([[x, y], neighbors]);

        for(const neighbor of neighbors)
        {
            const [x1, y1] = neighbor;
            prioQ.add(x1, y1, cost(x, y, xe, ye, oldPrio) + manhattan(x1, y1, xe, ye));
        }
    }

    // retrace visited parents to recreate path
    matrix[xe][ye] = PATH_PURPLE;

    while(x != xs || y != ys)
    {
        [x, y] = findParentInVisited(visited, x, y);
        matrix[x][y] = PATH_ORANGE;
    }

    matrix[xs][ys] = PATH_GREEN;
}

// returns the cost FOR A NEIGHBOR of (x, y)
function cost(x, y, xe, ye, oldPrio)
{
    return 1 + oldPrio - manhattan(x, y, xe, ye);
}

function animateAstarSearch(visited, interval)
{
    // interval muliplier
    let k = 0;

    // start and end square are green and purple (so manual out of the loop)
    const [xs, ys] = visited[0][0];
    matrix[xs][ys] = PATH_GREEN;
    drawMazeUpdate(xs, ys);

    const [xe, ye] = visited[visited.length-1][0];
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

// the priorityqueue's implementation uses lineair insertion and is thus garbage.
// a heap would be the obvious choice. However... this was way faster to implement
// so in a way I do save time with this implementation, just not runtime.
class PriorityQueue
{
    constructor()
    {
        this.queue = [];
    }

    // adds (x, y) with given priority to the queue, if it is already in the queue,
    // it updates its priority to min(oldPrio, prio)
    add(x, y, prio)
    {
        for(let i = 0; i < this.queue.length; i++)
        {
            const [x1, y1] = this.queue[i][0];
            const prio1 = this.queue[i][1];
            
            // check if already in the queue
            if(x1 == x && y1 == y)
            {
                this.queue[i][1] = Math.min(prio1, prio);
                return;
            }
            else if(prio1 > prio)
            {
                this.queue.splice(i, 0, [[x, y], prio]);
                return;
            }
        }

        this.queue.push([[x, y], prio]);
    }

    // returns element with lowest cost and removes it from the queue
    min(x, y)
    {
        if(this.isEmpty())
            return -1;
        
        const min =  this.queue.shift();
        return min;
    }

    isEmpty()
    {
        return this.queue.length == 0;
    }

}