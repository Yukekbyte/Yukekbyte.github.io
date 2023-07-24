/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
// header function
function bidirectionalSearch(matrix)
{
    // make copy of matrix for one of the directions
    let copy = deepCopyMaze();

    // start square
    const xs = matrix.length - 2;
    const ys = 1;
    matrix[xs][ys] = PATH_GREEN;
    // end square
    const xe = 1;
    const ye = copy[0].length - 2;
    copy[xe][ye] = PATH_PURPLE;
    let visited = [];

    let sourceSet = new Set();
    sourceSet.add(xs, ys);
    let destSet = new Set();
    destSet.add(xe, ye);

    bidir(visited, matrix, copy, [[xs, ys]], [[xe, ye]], sourceSet, destSet, xs, ys, xe, ye);
    return visited;
}

function bidir(visited, matrix, copy, sourceFrontier, destFrontier, sourceSet, destSet, xs, ys, xe, ye)
{
    // will be used as intersection point once frontiers clash
    let x, y;
    // parents of interseciton point for both frontiers (should be different)
    let xps, yps; // parents for source
    let xpd, ypd; // parents for destination

    while(sourceFrontier.length > 0 && destFrontier.length > 0)
    {
        
        let [x1, y1, x1p, y1p] = expand(matrix, visited, sourceFrontier, sourceSet, destSet, PATH_YELLOW);
        let [x2, y2, x2p, y2p] = expand(copy, visited, destFrontier, destSet, sourceSet, PATH_SKYBLUE);

        // source found a destination square
        if(x1 != -1)
        {
            [x, y, xps, yps] = [x1, y1, x1p, y1p];
            [xpd, ypd] = findParentInVisited(visited, x1, y1); // other parent is in visited
            break;
        }            
        // destination found a source square
        if(x2 != -1)
        {
            [x, y, xpd, ypd] = [x2, y2, x2p, y2p];
            [xps, yps] = findParentInVisited(visited, x2, y2);
            break;
        }
    }

    matrix[xe][ye] = PATH_PURPLE;

    // no solution check
    if(sourceFrontier.length == 0 || destFrontier.length == 0)
    {
        visited.push([[-1, -1], [[-1, -1], [-1, -1]]]);
        return;
    }

    // retrace visited parents to recreate path with (x, y) as intersection point
    // and respective parents

    matrix[x][y] = PATH_ORANGE;

    // retrace to start
    retrace(matrix, visited, xps, yps, xs, ys);
    // retrace to end
    retrace(matrix, visited, xpd, ypd, xe ,ye);

    // add intersection with parents at end of visited for animate
    visited.push([[x, y], [[xps, yps], [xpd, ypd]]]);

    // merge values of matrix and copy
    for(let i = 1; i < matrix.length - 1; i++)
        for(let j = 1; j < matrix[0].length - 1; j++)
            if(copy[i][j] == PATH_SKYBLUE && matrix[i][j] != PATH_ORANGE)
                matrix[i][j] = PATH_SKYBLUE;
}

function expand(matrix, visited, frontier, set, otherSet, value)
{
    let [x, y] = frontier.shift();
    let neighbors = getAllDenseNeighbors(matrix, x, y, PATH).concat(getAllDenseNeighbors(matrix, x, y, value == PATH_SKYBLUE? PATH_YELLOW : PATH_SKYBLUE));
    for(const neighbor of neighbors)
    {
        let [x1, y1] = neighbor;
     
        // check for intersection
        if(otherSet.contains(x1, y1))
        {
            return [x1, y1, x, y]; // return intersection point with its parent for this frontier
        }

        matrix[x1][y1] = value;
        frontier.push([x1, y1]);
        set.add(x1, y1);
    }

    visited.push([[x, y], neighbors]);

    return [-1, -1, -1, -1];
}

function retrace(matrix, visited, xe, ye, xs, ys)
{
    let [x, y] = [xe, ye];

    while(x != xs || y != ys)
    {
        matrix[x][y] = PATH_ORANGE;
        [x, y] = findParentInVisited(visited, x, y);
    }
}

function animateBidirectionalSearch(visited, interval)
{
    // interval muliplier
    let k = 0;

    // start and end square are green and purple (so manual out of the loop)
    const [xs, ys] = visited[0][0];
    matrix[xs][ys] = PATH_GREEN;
    drawMazeUpdate(xs, ys);

    const [xe, ye] = visited[1][0];
    matrix[xe][ye] = PATH_PURPLE;
    drawMazeUpdate(xe, ye);

    k++;

    // rest of the squares
    for(let i = 0; i < visited.length-1; i++)
    {
        const [x, y] = visited[i][0];
        const children = visited[i][1];

        for(const child of children)
        {
            TIMEOUTS.setTimeout(() => {
                // check if from source or from destination
                matrix[child[0]][child[1]] = (matrix[x][y] == PATH_YELLOW || matrix[x][y] == PATH_GREEN ? PATH_YELLOW : PATH_SKYBLUE);
                drawMazeUpdate(child[0], child[1]);
            }, interval * k);
            k++
        }
    }

    let [[x, y], [[xps, yps], [xpd, ypd]]] = visited[visited.length - 1];
    visited.pop(); // to not break findParentInVisited()

    // no solution check
    if(findParentInVisited(visited, xps, yps)[0] == -1 || findParentInVisited(visited, xpd, ypd)[0] == -1)
        return;
    

    // retrace
    TIMEOUTS.setTimeout(() => {
        matrix[x][y] = PATH_ORANGE;
        drawMazeUpdate(x, y);
    }, interval * k);
    k++;
    TIMEOUTS.setTimeout(() => {
        matrix[xps][yps] = PATH_ORANGE;
        drawMazeUpdate(xps, yps);
    }, interval * k);
    k++;
    TIMEOUTS.setTimeout(() => {
        matrix[xpd][ypd] = PATH_ORANGE;
        drawMazeUpdate(xpd, ypd);
    }, interval * k);
    k++;

    let [x1, y1] = [xps, yps];
    let [x2, y2] = [xpd, ypd];

    let reachedEnd;
    let reachedStart;

    for(;;)
    {
        let [x1p, y1p] = findParentInVisited(visited, x1, y1); // the declaration IN the loop (retarded timeout scope issue otherwise)
        let [x2p, y2p] = findParentInVisited(visited, x2, y2);

        if(x1p != -1)
        {
            TIMEOUTS.setTimeout(() => {
                matrix[x1p][y1p] = PATH_ORANGE;
                drawMazeUpdate(x1p, y1p);
            }, interval * k);
            k++;
            [x1, y1] = [x1p, y1p];
        }
        else if(!reachedStart)
        {
            TIMEOUTS.setTimeout(() => {
                matrix[xs][ys] = PATH_GREEN;
                drawMazeUpdate(xs, ys);
            }, interval * k);
            k++;
            reachedStart = true;
        }
        
        if(x2p != -1)
        {
            TIMEOUTS.setTimeout(() => {
                matrix[x2p][y2p] = PATH_ORANGE;
                drawMazeUpdate(x2p, y2p);
            }, interval * k);
            k++;
            [x2, y2] = [x2p, y2p];
        }
        else if(!reachedEnd)
        {
            TIMEOUTS.setTimeout(() => {
                matrix[xe][ye] = PATH_PURPLE;
                drawMazeUpdate(xe, ye);
            }, interval * k);
            k++;
            reachedEnd = true;
        }
        

        if(reachedStart && reachedEnd)
            break;
    }

    return interval * k;
}


class Set
{
    constructor()
    {
        this.map = {}
    }

    add(x, y)
    {
        this.map[this.key(x, y)] = true;
    }

    contains(x, y)
    {
        return this.key(x, y) in this.map;
    }

    key(x, y)
    {
        return x + 10000*y; 
    }
}