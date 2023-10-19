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
    prioQ.add(xs, ys, manhattan(xs, ys, xe, ye) + 0); // priority is manhattan + the cost to get to that square

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
        if(x == -1)
            break;
        matrix[x][y] = PATH_YELLOW;
        let neighbors = getAllDenseNeighbors(matrix, x, y, PATH);
        

        let changeParent = [];
        for(const neighbor of neighbors)
        {
            const [x1, y1] = neighbor;
            const parentChanged = prioQ.add(x1, y1, cost(x, y, xe, ye, oldPrio) + manhattan(x1, y1, xe, ye));
            changeParent.push(parentChanged);
        }
        let updatedNeighbors = []
        for(let i = 0; i < neighbors.length; i++)
        {
            if(changeParent[i])
                updatedNeighbors.push(neighbors[i]);
        }
        visited.push([[x, y], updatedNeighbors]);
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

// the priorityqueue's implementation uses lineair insertion and is thus garbage.
// a heap would be the obvious choice. However... this was way faster to implement
// so in a way I do save time with this implementation, just not runtime... 
// (arguably even better given that the runtime of this algorithm is in milliseconds for the given sizes).
class PriorityQueue
{
    constructor()
    {
        this.queue = [];
    }

    // adds (x, y) with given priority to the queue, if it is already in the queue,
    // it updates its priority to min(oldPrio, prio) and puts it at the front of all the squares with the same priority
    // returns true if the element was not yet in the queue or in the queue but priority changed.
    // returns false if the element the given priority was higher than the priority it already had.
    add(x, y, prio)
    {
        // check if already in the queue
        for(let i = 0; i < this.queue.length; i++)
        {
            const [x1, y1] = this.queue[i][0];
            const prio1 = this.queue[i][1];
            
            if(x1 == x && y1 == y)
            {
                if(prio < prio1)
                {
                    this.queue.splice(i, 1);
                    this.add(x, y, Math.min(prio1, prio));
                    return true;
                }
                return false;
            }
        }

        // not yet in queue so add as early as possible
        for(let i = 0; i < this.queue.length; i++)
        {
            const prio1 = this.queue[i][1];

            if(prio <= prio1)
            {
                this.queue.splice(i, 0, [[x, y], prio]);
                return true;
            }
        }

        this.queue.push([[x, y], prio]);
        return true;
    }

    // returns element with lowest cost and removes it from the queue
    min(x, y)
    {
        if(this.isEmpty())
            return [[-1, -1], -1];
        
        const min =  this.queue.shift();
        return min;
    }

    isEmpty()
    {
        return this.queue.length == 0;
    }

}