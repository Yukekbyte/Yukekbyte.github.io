/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

// maze generation
let matrix;
let algorithm = DFS;
let horizontal = DIM[2];
let vertical = DIM[2];
let speed = SPEED[2];
let lastWallsId;
let removedWalls = [[], [], [], [], []];
let isAnimating = false;  // true if maze OR path is generating
let isGenerating = false; // true if maze is generating
let animateFade = false;
let animateSquare = false;
let dragToggle = false;

// pathfinding
let searchAlgorithm = SDFS;

window.onload = function()
{
    // first config
    pressedAlgorithm("DFS-button");
    pressedSearchAlgorithm("SDFS-button");
    pressedHorizontal("horizontal-N");
    pressedVertical("vertical-N");
    pressedSpeed("speed-3");
    pressedWalls("walls-10");
    document.getElementById("animate-square-checkbox").checked = true;
    animateSquare = true;

    // generate first show-off maze
    generateMaze(false);

    // display correct info text
    const infoDiv = document.getElementById("info");
    infoDiv.innerHTML = INFO[DFS];
}

function changeHorizontal(id)
{
    pressedHorizontal(id);

    switch(id)
    {
        case "horizontal-XS":
            horizontal = DIM[0];
            break;
        case "horizontal-S":
            horizontal = DIM[1];
            break;
        case "horizontal-N":
            horizontal = DIM[2];
            break;
        case "horizontal-L":
            horizontal = DIM[3];
            break;
        case "horizontal-XL":
            horizontal = DIM[4];
            break;
    }

    generateMaze(false);
}

function changeVertical(id)
{
    pressedVertical(id);

    switch(id)
    {
        case "vertical-XS":
            vertical = DIM[0];
            break;
        case "vertical-S":
            vertical = DIM[1];
            break;
        case "vertical-N":
            vertical = DIM[2];
            break;
        case "vertical-L":
            vertical = DIM[3];
            break;
        case "vertical-XL":
            vertical = DIM[4];
            break;
    }

    generateMaze(false);
}

function changeSpeed(id)
{
    pressedSpeed(id);
    
    switch(id)
    {
        case "speed-1":
            speed = SPEED[0];
            break;
        case "speed-2":
            speed = SPEED[1];
            break;
        case "speed-3":
            speed = SPEED[2];
            break;
        case "speed-4":
            speed = SPEED[3];
            break;
        case "speed-5":
            speed = SPEED[4];
            break;
    }
}

function changeWalls(id)
{
    if(!isAnimating)
    {
        pressedWalls(id);

        switch(id)
        {
            case "walls-6":
                updateWalls(0);
                break;
            case "walls-7":
                updateWalls(1);
                break;
            case "walls-8":
                updateWalls(2);
                break;
            case "walls-9":
                updateWalls(3);
                break;
            case "walls-10":
                updateWalls(4);
                break;
        }
    }
}

function changeAlgorithm(id)
{
    // update button style
    pressedAlgorithm(id);

    // update algorithm
    switch(id)
    {
        case "DFS-button":
            algorithm = DFS;
            break;
        case "BFS-button":
            algorithm = BFS;
            break;
        case "REC-button":
            algorithm = REC;
            break;
        case "WIL-button":
            algorithm = WIL;
            break;
        case "KRU-button":
            algorithm = KRU;
            break;
        case "ALD-button":
            algorithm = ALD;
            break;
        case "SAN-button":
            algorithm = SAN;
            break;
    }

    // update info text
    const infoDiv = document.getElementById("info");
    infoDiv.innerHTML = INFO[algorithm];
}

function changeSearchAlgorithm(id)
{
    // update button style
    pressedSearchAlgorithm(id);

    // update algorithm
    switch(id)
    {
        case "SDFS-button":
            searchAlgorithm = SDFS;
            break;
        case "SBFS-button":
            searchAlgorithm = SBFS;
            break;
        case "SAST-button":
            searchAlgorithm = SAST;
            break;
        case "SGRE-button":
            searchAlgorithm = SGRE;
            break;
        case "SBID-button":
            searchAlgorithm = SBID;
            break;
    }

    // update info text
    const infoDiv = document.getElementById("info");
    infoDiv.innerHTML = INFO[searchAlgorithm];
}

function pressedHorizontal(id)
{
    document.getElementById("horizontal-XS").classList.remove("button-selector-active");
    document.getElementById("horizontal-S").classList.remove("button-selector-active");
    document.getElementById("horizontal-N").classList.remove("button-selector-active");
    document.getElementById("horizontal-L").classList.remove("button-selector-active");
    document.getElementById("horizontal-XL").classList.remove("button-selector-active");
    document.getElementById(id).classList.add("button-selector-active");
}

function pressedVertical(id)
{
    document.getElementById("vertical-XS").classList.remove("button-selector-active");
    document.getElementById("vertical-S").classList.remove("button-selector-active");
    document.getElementById("vertical-N").classList.remove("button-selector-active");
    document.getElementById("vertical-L").classList.remove("button-selector-active");
    document.getElementById("vertical-XL").classList.remove("button-selector-active");
    document.getElementById(id).classList.add("button-selector-active");
}

function pressedSpeed(id)
{
    document.getElementById("speed-1").classList.remove("button-selector-active");
    document.getElementById("speed-2").classList.remove("button-selector-active");
    document.getElementById("speed-3").classList.remove("button-selector-active");
    document.getElementById("speed-4").classList.remove("button-selector-active");
    document.getElementById("speed-5").classList.remove("button-selector-active");
    document.getElementById(id).classList.add("button-selector-active");
}

function pressedWalls(id)
{
    document.getElementById("walls-6").classList.remove("button-selector-active");
    document.getElementById("walls-7").classList.remove("button-selector-active");
    document.getElementById("walls-8").classList.remove("button-selector-active");
    document.getElementById("walls-9").classList.remove("button-selector-active");
    document.getElementById("walls-10").classList.remove("button-selector-active");
    document.getElementById(id).classList.add("button-selector-active");
    lastWallsId = id;
}

function inactivateWalls()
{
    document.getElementById("walls-6").classList.remove("button-selector-active");
    document.getElementById("walls-7").classList.remove("button-selector-active");
    document.getElementById("walls-8").classList.remove("button-selector-active");
    document.getElementById("walls-9").classList.remove("button-selector-active");
    document.getElementById("walls-10").classList.remove("button-selector-active");

    document.getElementById("walls-6").classList.add("button-selector-inactive");
    document.getElementById("walls-7").classList.add("button-selector-inactive");
    document.getElementById("walls-8").classList.add("button-selector-inactive");
    document.getElementById("walls-9").classList.add("button-selector-inactive");
    document.getElementById("walls-10").classList.add("button-selector-inactive");
}

function activateWalls(id)
{
    document.getElementById("walls-6").classList.remove("button-selector-inactive");
    document.getElementById("walls-7").classList.remove("button-selector-inactive");
    document.getElementById("walls-8").classList.remove("button-selector-inactive");
    document.getElementById("walls-9").classList.remove("button-selector-inactive");
    document.getElementById("walls-10").classList.remove("button-selector-inactive");
    document.getElementById(id).classList.add("button-selector-active");
}

function inactivateFind()
{
    // little bit cursed with adding a button-selector class and button is not a selector
    // but couldn't be bothered to make a new class for only 1 button lol
    document.getElementById("button-find").classList.add("button-selector-inactive");
}

function activateFind()
{
    document.getElementById("button-find").classList.remove("button-selector-inactive");
}

function pressedAlgorithm(id)
{
    document.getElementById("DFS-button").classList.remove("button-outer-active");
    document.getElementById("BFS-button").classList.remove("button-outer-active");
    document.getElementById("REC-button").classList.remove("button-outer-active");
    document.getElementById("WIL-button").classList.remove("button-outer-active");
    document.getElementById("KRU-button").classList.remove("button-outer-active");
    document.getElementById("ALD-button").classList.remove("button-outer-active");
    document.getElementById("SAN-button").classList.remove("button-outer-active");
    document.getElementById(id).classList.add("button-outer-active");
}

function pressedSearchAlgorithm(id)
{
    document.getElementById("SDFS-button").classList.remove("button-outer-active");
    document.getElementById("SBFS-button").classList.remove("button-outer-active");
    document.getElementById("SAST-button").classList.remove("button-outer-active");
    document.getElementById("SGRE-button").classList.remove("button-outer-active");
    document.getElementById("SBID-button").classList.remove("button-outer-active");
    document.getElementById(id).classList.add("button-outer-active");
}

function clearMaze()
{
    let n = vertical;
    let m = horizontal;

    // make dimensions odd to have a nice border
    // (and not break algorithms that rely on that)
    if(n % 2 == 0){ n++ }
    if(m % 2 == 0){ m++ }

    TIMEOUTS.clearAllTimeouts();

    matrix = Array(n).fill(WALL);
    for(let i = 0; i < n; i++)
        matrix[i] = Array(m).fill(WALL);

    drawMaze();
}

function clearPath()
{
    const n = matrix.length;
    const m = matrix[0].length;

    TIMEOUTS.clearAllTimeouts();

    for(let i = 0; i < n; i++)
        for(let j = 0; j < m; j++)
            if(matrix[i][j] != WALL)
                matrix[i][j] = PATH;

    drawMaze();
}

// returns a 2-level array filled with WALL values with the same dimensions as the matrix variable
function emptyMaze()
{
    const n = matrix.length;
    const m = matrix[0].length;

    let empty = Array(n).fill(0);
    for(let i = 0; i < n; i++)
        empty[i] = Array(m).fill(WALL);

    return empty;
}

function deepCopyMaze()
{
    const n = matrix.length;
    const m = matrix[0].length;

    let copy = Array(n).fill(0);
    for(let i = 0; i < n; i++)
        copy[i] = Array(m).fill(WALL);

    for(let i = 0; i < n; i++)
        for(let j = 0; j < m; j++)
            copy[i][j] = matrix[i][j];

    return copy;
}

// draws the whole maze again, NOT animated
function drawMaze()
{
    let maze_html = "<table id=\"table\" cellspacing=\"0\" cellpadding=\"0\">"
    const n = matrix.length;
    const m = matrix[0].length;

    for(let i = 0; i < n; i++)
    {
        maze_html += "<tr>";
        
        for(let j = 0; j < m; j++)
        {
            let color;
            switch (matrix[i][j]) {
                case PATH:
                    color = "white";
                    break;
                case PATH_BLUE:
                    color = "blue";
                    break;
                case PATH_RED:
                    color = "red";
                    break;
                case PATH_ORANGE:
                    color = "orange";
                    break;
                case PATH_YELLOW:
                    color = "yellow";
                    break;
                case PATH_PURPLE:
                    color = "purple";
                    break;
                case PATH_GREEN:
                    color = "green";
                    break;
                case PATH_SKYBLUE:
                    color = "skyblue";
                    break;
                default:
                    color = "black"
                    break;
            }
            maze_html += `<td bgcolor=${color} onmousedown="switchDragToggle(${i},${j}, true)" onmouseup="switchDragToggle(${i},${j}, false)" onmouseenter="clickSquare(${i},${j})" draggable="false" ondragstart="return false;"> <div id="${i}-${j}" class="dummy"></div> </td>`;
        }

        maze_html += "</tr>";
    }

    maze_html += "</table>";

    document.getElementById("maze").innerHTML = maze_html;
}

// draws the single square of the maze again
// if animated is true: it animates from the original color in the table,
//                      to the color that corresponds with the value in the matrix.
function drawMazeUpdate(x, y, animated=true, duration=350)
{
    const t = document.getElementById("table");
    const row = t.getElementsByTagName("tr")[x];
    const cell = row.getElementsByTagName("td")[y];
    const div = document.getElementById(`${x}-${y}`);

    const oldColor = cell.style.backgroundColor;
    let newColor;

    switch (matrix[x][y]) {
        case PATH:
            newColor = "white";
            break;
        case PATH_BLUE:
            newColor = "blue";
            break;
        case PATH_RED:
            newColor = "red";
            break;
        case PATH_ORANGE:
            newColor = "orange";
            break;
        case PATH_YELLOW:
            newColor = "yellow";
            break;
        case PATH_PURPLE:
            newColor = "purple";
            break;
        case PATH_GREEN:
            newColor = "green";
            break;
        case PATH_SKYBLUE:
            newColor = "skyblue";
            break;
        default:
            newColor = "black";
            break;
    }

    if(animated && (animateFade || animateSquare))
    {
        if(animateFade && !animateSquare)
        {
            cell.animate([{
                backgroundColor: oldColor
            },
            {
                backgroundColor: newColor
            }], { duration: duration});
        }
        if(animateSquare)
        {
            const beginColor = animateFade ? oldColor : newColor;
            div.animate([{
                // start keyframe
                backgroundColor: beginColor,
                top: "10px",
                left: "10px",
                width: "1px",
                height: "1px"
            },
            {
                // middle keyframe (make square a bit too big)
                top: "-3px",
                left: "-3px",
                width: "26px",
                height: "26px"
            },
            {
                // end keyframe (make square the right size)
                backgroundColor: newColor,
                top: "0px",
                left: "0px",
                width: "20px",
                height: "20px"
            }], { duration: duration});
        }

        TIMEOUTS.setTimeout(() => {
            cell.style.backgroundColor = newColor;
        }, duration - 50);
    }
    else
        cell.style.backgroundColor = newColor;
    
}

function switchDragToggle(x, y, value)
{
    console.log("switching");
    dragToggle = value;
    clickSquare(x, y);
}

function clickSquare(x, y)
{
    if(isAnimating || !dragToggle)
        return;

    const n = matrix.length;
    const m = matrix[0].length;

    if(matrix[x][y] != WALL)
        matrix[x][y] = WALL;
    else if(0 < x && x < n-1 && 0 < y && y < m-1)
        matrix[x][y] = PATH;
    
    drawMazeUpdate(x, y);
}

// uses the removedWalls variable to change the amount of walls in the maze by the WALLS[i] percentage
function updateWalls(i)
{
    const allRemovedWalls = removedWalls[0];
    const wallsToRemove = removedWalls[i];

    for(const wall of allRemovedWalls)
    {
        const [x, y] = wall;

        // WALL and should be PATH
        if(matrix[x][y] == WALL && wallsToRemove.indexOf(wall) != -1)
        {
            matrix[x][y] = PATH;
            drawMazeUpdate(x,y);
        }
        // PATH and should be WALL
        else if(matrix[x][y] != WALL && wallsToRemove.indexOf(wall) == -1)
        {
            matrix[x][y] = WALL;
            drawMazeUpdate(x, y);
        }
    }

}

// calculates for every percentage in WALLS the coordinates of the walls that have te be removed
// puts those squares in the removedWalls variable in following structure:
// removedWalls = [p0, p1, p2, p3, p4]
// where p0, ..., p4 is an array of all the removed walls for that percentage
// here is p4 = [], the empty array because the percentage for WALLS[4] should be 1.0
function calculateRemovedWalls()
{
    const n = matrix.length;
    const m = matrix[0].length;
    let copy = deepCopyMaze();

    // FIRST CALCULATE p0: IT CONTAINS ALL THE WALLS THAT CAN POTENTIALLY BE REMOVED

    // estimate of amount of walls to remove to reach minimum percentage
    // formula: k = (#squares - #permanent-path-squares - #permanent-wall-squares) * (1-percentage)
    const amount = ((n-2) * (m-2) - ((n+1)/2 * (m+1)/2) - ((n-1)/2 * (m-1)/2))/2; // we /2 for taking into account the non permanent walls you cant take away because single points will remain otherwise
    const k0 = amount * (1 - WALLS[0]);
    
    let p0 = [];
    let i = 0; // amount of walls removed
    let j = 0; // cap
    while(i < k0 && j < 50000)
    {
        const x = Math.floor(Math.random() * (n - 2) + 1);
        const y = Math.floor(Math.random() * (m - 2) + 1);

        if(copy[x][y] == WALL)
        {
            // top has perm walls
            if(x % 2 == 1 && y % 2 == 0 && hasOtherDenseWallNeighbor(copy, x-1, y, x, y)
                                        && hasOtherDenseWallNeighbor(copy, x+1, y, x, y))
            {
                copy[x][y] = PATH;
                p0.push([x, y]);
                i++;
            }

            // sides have perm walls
            if(x % 2 == 0 && y % 2 == 1 && hasOtherDenseWallNeighbor(copy, x, y-1, x, y)
                                        && hasOtherDenseWallNeighbor(copy, x, y+1, x, y))
            {
                copy[x][y] = PATH;
                p0.push([x, y]);
                i++;
            }
        }
        j++;
    }

    // THEN CALCULATE p1-4: IT CONTAINS ONLY A PORTION OF THE WALLS IN p0

    let p1 = [], p2 = [], p3 = [], p4 = []
    const k1 = amount * (1 - WALLS[1]);
    const k2 = amount * (1 - WALLS[2]);
    const k3 = amount * (1 - WALLS[3]);
    const k4 = amount * (1 - WALLS[4]);

    let l = 0;
    while(p1.length < k1)
    {
        p1.push(p0[l]);
        if(p2.length < k2)
            p2.push(p0[l]);
        if(p3.length < k3)
        p3.push(p0[l]);
        if(p4.length < k4)
            p4.push(p0[l]);
        l++;
    }

    removedWalls = [p0, p1, p2, p3, p4];
}

function startAnimating(mazeGen)
{
    console.log("start generation");

    isGenerating = mazeGen;
    isAnimating = true;
    if(mazeGen)
        inactivateFind();
    inactivateWalls();
}

function stoppedAnimating()
{
    if(isGenerating)
    {
        calculateRemovedWalls();
        activateWalls("walls-10");
        lastWallsId = "walls-10";
    }
    else
        activateWalls(lastWallsId);
    
    activateFind();
    isAnimating = false;
    isGenerating = false;

    console.log("stopped generation");
}

function generateMaze(animate)
{
    switch(algorithm)
    {
        case DFS:
            generateDFSMaze(animate);
            break;
        case BFS:
            generateBFSMaze(animate);
            break;
        case REC:
            generateRECMaze(animate);
            break;
        case WIL:
            generateWILMaze(animate);
            break;
        case KRU:
            generateKRUMaze(animate);
            break;
        case ALD:
            generateALDMaze(animate);
            break;
        case SAN:
            generateSANMaze(animate);
            break;
    }
}

function generateDFSMaze(animate)
{
    clearMaze();
    let visited = depthFirstSearch(matrix);

    startAnimating(true);
    
    if(animate)    
    {
        let duration = animateDepthFirstSearch(visited, 1000/speed);
        TIMEOUTS.setTimeout(stoppedAnimating, duration);
    }
    else
    {
        drawMaze();
        stoppedAnimating();
    }
}

function generateBFSMaze(animate)
{
    clearMaze();
    let visited = breadthFirstSearch(matrix);

    startAnimating(true);
    
    if(animate)    
    {
        let duration = animateBreadthFirstSearch(visited, 1000/speed);
        TIMEOUTS.setTimeout(stoppedAnimating, duration);
    }
    else
    {
        drawMaze();
        stoppedAnimating();
    }
}

function generateKRUMaze(animate)
{
    clearMaze();
    let visited = kruskal(matrix);

    startAnimating(true);
    
    if(animate)    
    {
        let duration = animateKruskal(visited, 1000/speed);
        TIMEOUTS.setTimeout(stoppedAnimating, duration);
    }
    else
    {
        drawMaze();
        stoppedAnimating();
    }
}

function generateWILMaze(animate)
{
    clearMaze();
    let visited = wilson(matrix);

    startAnimating(true);
    
    if(animate)    
    {
        let duration = animateWilson(visited, 1000/speed);
        TIMEOUTS.setTimeout(stoppedAnimating, duration);
    }
    else
    {
        drawMaze();
        stoppedAnimating();
    }
}

function generateALDMaze(animate)
{
    clearMaze();
    let visited = aldousBroder(matrix);

    startAnimating(true);
    
    if(animate)    
    {
        let duration = animateAldousBroder(visited, 1000/speed);
        TIMEOUTS.setTimeout(stoppedAnimating, duration);
    }
    else
    {
        drawMaze();
        stoppedAnimating();
    }
}

function generateRECMaze(animate)
{
    clearMaze();
    let visited = recursiveDivision(matrix);

    startAnimating(true);
    
    if(animate)    
    {
        let duration = animateRecursiveDivision(visited, 1000/speed);
        TIMEOUTS.setTimeout(stoppedAnimating, duration);
    }
    else
    {
        drawMaze();
        stoppedAnimating();
    }

}

function generateSANMaze(animate)
{
    startAnimating(true);

    if(animate)
    {
        const n = matrix.length;
        const m = matrix[0].length;
        for(let i = 1; i < n-1; i++)
            for(let j = 1; j < m-1; j++)
            {
                matrix[i][j] = PATH;
                drawMazeUpdate(i, j);
            }
    }
    else
    {
        clearMaze();
        const n = matrix.length;
        const m = matrix[0].length;
        for(let i = 1; i < n-1; i++)
            for(let j = 1; j < m-1; j++)
                matrix[i][j] = PATH;
        drawMaze();
    }

    stoppedAnimating();
}

function generateSearch()
{
    if(!isGenerating)
    {
        // make start and end squares PATH (in case of modification)
        const n = matrix.length;
        const m = matrix[0].length;
        matrix[1][m-2] = PATH;
        matrix[n-2][1] = PATH;

        switch(searchAlgorithm)
        {
            case SDFS:
                generateSDFSSearch();
                break;
            case SBFS:
                generateSBFSSearch();
                break;
            case SAST:
                generateSASTSearch();
                break;
            case SGRE:
                generateSGRESearch();
                break;
            case SBID:
                generateSBIDSearch();
        }
    }
}

function generateSDFSSearch()
{
    clearPath();

    let visited = searchDepthFirst(matrix);

    startAnimating();

    let duration = animateSearchDepthFirst(visited, 1000/speed);
    TIMEOUTS.setTimeout(stoppedAnimating, duration);
}

function generateSBFSSearch()
{
    clearPath();

    let visited = searchBreadthFirst(matrix);

    startAnimating();

    let duration = animateSearchBreadthFirst(visited, 1000/speed);
    TIMEOUTS.setTimeout(stoppedAnimating, duration);
}

function generateSASTSearch()
{
    clearPath();

    let visited = astarSearch(matrix);

    startAnimating();

    let duration = animateAstarSearch(visited, 1000/speed);
    TIMEOUTS.setTimeout(stoppedAnimating, duration);
}

function generateSGRESearch()
{
    clearPath();

    let visited = greedySearch(matrix);

    startAnimating();

    let duration = animateGreedySearch(visited, 1000/speed);
    TIMEOUTS.setTimeout(stoppedAnimating, duration);
}

function generateSBIDSearch()
{
    clearPath();

    let visited = bidirectionalSearch(matrix);

    startAnimating();

    let duration = animateBidirectionalSearch(visited, 1000/speed);
    TIMEOUTS.setTimeout(stoppedAnimating, duration);
}