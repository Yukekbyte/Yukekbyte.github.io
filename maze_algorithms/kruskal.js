/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

//header function

// This algorithm keeps randomly choosing a wall and makes paths where possible.
// We choose a random NON-permanent wall and check if removing it creates a loop (with DisjointSets datas truct) 
// if not we make the wall and the adjacent pathsquares PATH values.
// repeat until we have gone through all the walls.
//
// this algorithm has no start square.
function kruskal(matrix)
{
    let unusedWalls = getAllNonPermanentWalls(matrix);
    let pathsquares = getAllPathsquares(matrix);
    let disjointSets = new DisjointSets(pathsquares);
    let visited = [];
    krus(visited, matrix, unusedWalls, disjointSets);

    return visited;
}

function krus(visited, matrix, unusedWalls, disjointSets)
{
    while(unusedWalls.length > 0)
    {
        // get random unused wall
        let wall = unusedWalls[Math.floor(Math.random()*unusedWalls.length)];
        let [square1, square2] = squaresFromWall(matrix, wall);

        // check if in different sets
        if(disjointSets.find(square1) !== disjointSets.find(square2))
        {
            // make wall a path
            assignValue(matrix, square1[0], square1[1], square2[0], square2[1], PATH);
            visitedPushKrus(visited, square1[0], square1[1], square2[0], square2[1]);

            // join sets
            disjointSets.union(square1, square2);
        }

        // remove wall of unusedWalls
        unusedWalls.splice(unusedWalls.indexOf(wall), 1);
    }
}

// returns the 2 uniquely defined squares that the (non-permanent) wall seperates
// returns [s1, s2] with s1 = [x1, y1] a pathsquare and s2 = [x2, y2] a pathsquare
function squaresFromWall(matrix, wall)
{
    // not really a 'start square', it is only used as a reference point.
    const x0 = matrix.length - 2;
    const y0 = 1;

    let [x, y] = wall;

    // vertical
    if(y % 2 == y0 % 2)
    {
        return [[x-1, y], [x+1, y]]; // clamping needed for x+1/x-1 out of matrix
    }
    // horizontal
    else
    {
        return [[x, y-1], [x, y+1]]; // clamping needed
    }

}

function visitedPushKrus(visited, x1, y1, x2, y2)
{
    // the wall in between
    let x12 = (x1 + x2) / 2;
    let y12 = (y1 + y2) / 2;

    visited.push([x1, y1]);
    visited.push([x12, y12]);
    visited.push([x2, y2]);
}

function animateKruskal(visited, interval)
{
    clearMaze();

    for(let i = 0; i < visited.length; i++)
    {
        TIMEOUTS.setTimeout(() => {
            const [x, y] = visited[i];
            matrix[x][y] = PATH;

            drawMazeUpdate(x, y);
        }, interval * i);
    }

    return interval * visited.length;
}

class DisjointSets
{
    constructor(squares)
    {
        this.map = {};

        for(const square of squares)
            this.createSet(square);
    }

    createSet(p)
    {
        if(this.key(p) in this.map)
            return;
        
        this.map[this.key(p)] = [[p[0],p[1]]];
    }

    // returns representative of the distinct set that contains p = [x, y]
    find(p)
    {
        return this.map[this.key(p)][0];
    }

    // unifies the sets that contain p1 = [x1, y1] and p2 = [x2, y2]
    union(p1, p2)
    {
        const key1 = this.key(p1);
        const key2 = this.key(p2);
        const set1 = this.map[key1];
        const set2 = this.map[key2];

        const merge = set1.concat(set2);

        // updating sets with new merge set in poopy time complexity.
        for(const [key, value] of Object.entries(this.map))
            if(value == set1 || value == set2)
                this.map[key] = merge;
    }

    // returns unique key of a point p = [x, y]
    key(p)
    {
        return p[0] + 10000*p[1];
    }
}