/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

//header function

// This algorithm makes random walks in the maze (the squares are still WALL values).
// If the walk comes across a PATH value, the whole walk is added to the maze by making it PATH values.
//
// returns visited, the (dense) squares that the algorithm worked with.
// the first element in visited is the start square [x0, y0].
function wilson(matrix)
{
    const x0 = matrix.length - 2;
    const y0 = 1;
    let squares = getAllPathsquares(matrix); // also has [x0, y0] but if [x0, y0] gets chosen the loopwalk will (should?:)) immediately cancel
    let visited = [[x0, y0]];
    matrix[x0][y0] = PATH;
    wil(visited, matrix, squares, x0, y0);

    return visited;
}

function wil(visited, matrix, unusedSquares)
{
    while(unusedSquares.length > 0)
    {
        //choose a square at random
        //let square = unusedSquares[Math.floor(Math.random() * unusedSquares.length)];

        //choose a square in order
        let square = unusedSquares.shift();

        //preform a loop walk
        loopWalk(matrix, square, unusedSquares, visited);
    }
} 

// walk in random directions starting from square until the path collides with the maze (= a loopwalk).
// makes the loopwalkpath PATH values (dense) when collided with the maze.
// removes all the (sparse) squares in the path from unusedSquares.
//
// if the path collides with itself, remove the loop before continuing.
function loopWalk(matrix, square, unusedSquares, visited)
{
    // head of loopwalk
    let [x, y] = square;
    // square previous of head of loopwalk
    let [x_, y_] = square;

    // push first square manually
    visited.push([x,y]);

    loop: for(;;)
    {
        // using PATH_BLUE to represent the loopwalkpath
        switch (matrix[x][y]) {
            case WALL:
                assignValue(matrix, x, y, x_, y_, PATH_BLUE);
                break;
            case PATH_BLUE:
                assignValue(matrix, x, y, x_, y_, PATH_BLUE);
                deleteLoop(matrix, x, y, x_, y_);
                [x_, y_] = findPreviousLoopWalk(matrix, x, y);
                break;
            case PATH:
                assignValue(matrix, x, y, x_, y_, PATH);
                break loop;
        }

        // extend path
        [x, y, x_, y_] = nextRandomNeighbor(matrix, x, y, x_, y_);

        visitedPushWil(visited, x_, y_, x, y);
    }

    // head collided with the maze
    // backtrack the loopwalkpath with PATH_BLUE values and make them PATH values (dense).
    // [x, y] is head of the backtracking, [x_, y_] will be the previous [x, y].
    visited.push([(x + x_)/2, (y + y_)/2]);
    [x, y] = [x_, y_];

    while(x != -1 && y != -1)
    {
        matrix[x][y] = PATH;
        visited.push([x,y]);
        x_ = x;
        y_ = y;
        [x, y] = findDenseNeighbor(matrix, x, y, PATH_BLUE);
    }

    // update unusedSquares (in the poopy lineair way in reverse because we modify the indexes in the array while looping)
    for(let i = unusedSquares.length - 1; i >= 0; i--)
    {
        const square = unusedSquares[i];
        if(matrix[square[0]][square[1]] == PATH)
            unusedSquares.splice(unusedSquares.indexOf(square), 1);
    }
}

// deletes the loop of PATH_BLUE values (dense) that ends and begins with [x, y].
// [x_, y_] should be a neighbor of [x, y] and part of the loop.
// it backtracks the loop in the direction of [x_, y_] and makes all BLUE_PATH values (dense)
// in the loop back to WALL values except for [x, y].
function deleteLoop(matrix, x, y, x_, y_)
{
    // make square between [x, y] and [x_, y_] a wall (= breaking the loop)
    matrix[(x+x_)/2][(y+y_)/2] = WALL;

    // backtrack broken loop until back at [x, y]
    let x1 = x_;
    let y1 = y_;

    while(x1 != x || y1 != y)
    {
        matrix[x1][y1] = WALL;
        [x1, y1] = findDenseNeighbor(matrix, x1, y1, PATH_BLUE);
    }
}

// returns last (sparse) square (square before the head of the loopwalkpath) that is part of the loopwalkpath (PATH_BLUE values) 
function findPreviousLoopWalk(matrix, x, y)
{
    let [x1, y1] = findDenseNeighbor(matrix, x, y, PATH_BLUE);

    return [x + 2*(x1-x), y + 2*(y1-y)];
}

// gives a neighbor that is not the previous square [x_, y_].
// returns 2 new squares [x, y] and [x_, y_] with format [x, y, x_, y_]
// where [x, y] is the neighbor and [x_, y_] is the old [x, y] that was given as parameter.
function nextRandomNeighbor(matrix, x, y, x_, y_)
{
    let [x1, y1] = getRandomNeighbor(matrix, x, y);
        while(x1 == x_ && y1 == y_)
            [x1, y1] = getRandomNeighbor(matrix, x, y);
    return [x1, y1, x, y];
}

// pushes the square between [x1, y1] and [x2, y2] in visited, then [x2, y2].
// does NOT push [x1, y1].
function visitedPushWil(visited, x1, y1, x2, y2)
{
    let x12 = (x1 + x2) / 2;
    let y12 = (y1 + y2) / 2;

    visited.push([x12, y12]);
    visited.push([x2,y2]);
}

function animateWilson(visited, interval)
{
    clearMaze();

    // keep a copy to apply changes instantly (can't check values of the matrix variable because of timeouts).
    let copy = emptyMaze();

    //make start square PATH value
    const [x0, y0] = visited[0];
    matrix[x0][y0] = PATH;
    copy[x0][y0] = PATH

    // keeps track if the loopwalk ended
    let loopwalk = true;
    // intervalmultiplier for the timeout
    let k = 0;

    for(let i = 1; i < visited.length; i++)
    {
        const [x, y] = visited[i];

        // check if the loopwalk ended
        if(loopwalk && copy[x][y] == PATH)
            loopwalk = false;
        // check if new loopwalk will start
        if(!loopwalk && copy[x][y] == WALL)
            loopwalk = true;

        // loopwalking (make PATH_BLUE)
        if(loopwalk)
        {
            // check if loop is made
            if(copy[x][y] == PATH_BLUE)
            {
                k = animateDeleteLoop(copy, i, visited, k, interval);
            }
            else
            {
                TIMEOUTS.setTimeout(() => {
                    matrix[x][y] = PATH_BLUE;
                    drawMazeUpdate(x, y, false);
                }, interval * k);
                copy[x][y] = PATH_BLUE;
                k++;
            }
        }    
        // not loopwalking (make PATH)
        else
        {
            TIMEOUTS.setTimeout(() => {
                matrix[x][y] = PATH;
                drawMazeUpdate(x, y);
            }, interval * k);
            copy[x][y] = PATH;
            k += 1/3; // lets the pathmaking go faster.
        }
    }

    return interval * k;
}

function animateDeleteLoop(copy, i, visited, k, interval)
{
    let [x, y] = visited[i];
    let j = i;

    // weird formatting because of scope issue with [x1, y1] (declaration must be inside the loop)
    for(;;)
    {
        let [x1, y1] = visited[j - 1];
        let l = k + (i - j);

        if(x1 == x && y1 == y)
            //return l;
            return k + 1;

        TIMEOUTS.setTimeout(() => {
            matrix[x1][y1] = WALL;
            drawMazeUpdate(x1, y1, false);
        //}, interval * l);
        }, interval * k);
        copy[x1][y1] = WALL;
        j--;
    }
}