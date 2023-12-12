var canvas;
var canvasElem;
var ctx;
var algorithm = CXH; // algorithm selected
var canvasAlgorithm = CXH; // (input for) algorithm currently on canvas.
var inputType = POINTS; // to regulate which algorithms can be animated with given input on canvas.
var inputSize = 10; // amount of (points) / (lines) / (points in polygons) on canvas
var speed = SPEED[2];

window.onload = function()
{
    // initialise canvas elements
        // internal canvas data struct
    canvas = new Canvas([], [], [], [], []);
        // html
    document.getElementById("mainCanvas").innerHTML = `<canvas id=\"canvas\" width=\"${CANVAS_WIDTH}\" height=\"${CANVAS_HEIGHT}\"></canvas>`;
        // html elements
    canvasElem = document.getElementById("canvas");
    ctx = canvasElem.getContext("2d");
    ctx.translate(0, canvasElem.height);
    ctx.scale(1, -1);
        // listen for mouse events
    canvasElem.onmousedown = function(e){handleMouseDown(e);};
    canvasElem.onmousemove = function(e){handleMouseMove(e);};
    canvasElem.onmouseup = function(e){handleMouseUp(e);};
    canvasElem.onmouseout = function(e){handleMouseOut(e);};

    // first config
    pressedAlgorithm("CXH-button");
    pressedSpeed("speed-3");
    document.getElementById("size-amount").innerHTML = inputSize.toString();
    document.getElementById("size-amount").classList.add("button-selector-active");

    generateRandomInput();
    generateAlgorithm(false);

    // display correct info text
    const infoDiv = document.getElementById("info");
    infoDiv.innerHTML = INFO[algorithm];
}

//==========================
//==========================
//     USER INTERFACE
//==========================
//==========================

function changeAlgorithm(id)
{
    // update button style
    pressedAlgorithm(id);

    // update algorithm
    let inputNeeded;
    switch(id)
    {
        case "CXH-button":
            algorithm = CXH;
            inputNeeded = POINTS;
            break;
        case "CH2-button":
            algorithm = CH2;
            inputNeeded = POINTS;
            break;
        case "LIS-button":
            algorithm = LIS;
            inputNeeded = LINES;
            break;
        case "TRI-button":
            algorithm = TRI;
            inputNeeded = POLYGON;
            break;
        case "ART-button":
            algorithm = ART;
            inputNeeded = POINTS;
            break;
        case "VOR-button":
            algorithm = VOR;
            inputNeeded = POINTS;
            break;
    }

    // update regenerate button
    if(inputNeeded != inputType)
    {
        disableInputSize();
        disableGenerate();
    }
    else
    {
        enableInputSize();
        enableGenerate();
    }

    // update info text
    const infoDiv = document.getElementById("info");
    infoDiv.innerHTML = INFO[algorithm];
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

function changeSize(id)
{
    switch(id)
    {
        case "size-minmin":
            diff = inputSize - Math.max(3, inputSize - 5);
            removeInput(diff);
            inputSize = inputSize - diff;
            break;
        case "size-min":
            diff = inputSize - Math.max(3, inputSize - 1);
            removeInput(diff);
            inputSize = inputSize - diff;
            break;
        case "size-plus":
            diff = Math.min(inputSize + 1, 50) - inputSize;
            addInput(diff);
            inputSize = inputSize + diff;
            break;
        case "size-plusplus":
            diff = Math.min(inputSize + 5, 50) - inputSize;
            addInput(diff);
            inputSize = inputSize + diff;
            break;
    }

    document.getElementById("size-amount").innerHTML = inputSize.toString();
    generateAlgorithm(false);
}

function pressedAlgorithm(id)
{
    document.getElementById("CXH-button").classList.remove("button-outer-active");
    document.getElementById("CH2-button").classList.remove("button-outer-active");
    document.getElementById("LIS-button").classList.remove("button-outer-active");
    document.getElementById("TRI-button").classList.remove("button-outer-active");
    //document.getElementById("ART-button").classList.remove("button-outer-active");
    document.getElementById("VOR-button").classList.remove("button-outer-active");
    document.getElementById(id).classList.add("button-outer-active");
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

function disableInputSize()
{
    const minmin = document.getElementById("size-minmin");
    const min = document.getElementById("size-min");
    const amount = document.getElementById("size-amount");
    const plus = document.getElementById("size-plus");
    const plusplus = document.getElementById("size-plusplus");

    const buttons = [minmin, min, amount, plus, plusplus];

    for(const button of buttons)
    {
        button.classList.add("button-selector-inactive");
        button.disabled = true;
    }
}

function enableInputSize()
{
    const minmin = document.getElementById("size-minmin");
    const min = document.getElementById("size-min");
    const amount = document.getElementById("size-amount");
    const plus = document.getElementById("size-plus");
    const plusplus = document.getElementById("size-plusplus");

    const buttons = [minmin, min, amount, plus, plusplus];

    for(const button of buttons)
    {
        button.classList.remove("button-selector-inactive");
        button.disabled = false;
    }
}

function disableGenerate()
{
    const button = document.getElementById("button-generate")
    button.classList.add("button-selector-inactive");
    button.disabled = true;
}

function enableGenerate()
{
    const button = document.getElementById("button-generate")
    button.classList.remove("button-selector-inactive");
    button.disabled = false;
}

//-------------------------------------
// drag points on canvas functionality
//-------------------------------------

    // variables to save last mouse position
    // used to see how far the user dragged the mouse
    // and then move the point by that distance
var startX;
var startY;
    // variables to save canvas and scroll offsets
var offsetX;
var offsetY;
var scrollX;
var scrollY;

    // holds intex of selected point
var selectedPoint = -1;
var selectedPolygon = -1;
var selectedLine = -1;

function pointHittest(x, y, p)
{
    return (p.x-x+p.radius)*(p.x-x+p.radius)+(p.y-y-p.radius)*(p.y-y-p.radius) <= 4*p.radius*p.radius; // buffer coefficient for easy selection
}

function handleMouseDown(e)
{
    // don't do anything if animating
    if(TIMEOUTS.timeouts.length > 0)
        return;

    offsetX = canvasElem.offsetLeft;
    offsetY = canvasElem.offsetTop;
    scrollX = document.documentElement.scrollLeft;
    scrollY = document.documentElement.scrollTop;

    e.preventDefault();
    startX = parseInt(e.clientX - offsetX + scrollX);
    startY = parseInt(-e.clientY + offsetY + CANVAS_HEIGHT - scrollY); // because canvas origin is bottomleft instead of bottomright

    // points
    for(let i = 0; i < canvas.points.length; i++)
    if(pointHittest(startX, startY, canvas.points[i]))
        selectedPoint = i;

    // lines
    for(let i = 0; i < canvas.lines.length; i++)
    {
        const line = canvas.lines[i];
        if(pointHittest(startX, startY, line.p1))
        {
            selectedLine = i;
            selectedPoint = 0;
        }
        else if(pointHittest(startX, startY, line.p2))
        {
            selectedLine = i;
            selectedPoint = 1;
        }
    }
    // polygons
    for(let i = 0; i < canvas.polygons.length; i++)
    {
        const polygon = canvas.polygons[i];
        if(!polygon.pointsVisible)
            continue;

        for(let j = 0; j < polygon.points.length; j++)
            if(pointHittest(startX, startY, polygon.points[j]))
            {
                selectedPolygon = i;
                selectedPoint = j;
            }
    }
}

function handleMouseMove(e)
{
    if(selectedPoint == -1)
        return;

    e.preventDefault();
    mouseX = parseInt(e.clientX - offsetX + scrollX);
    mouseY = parseInt(-e.clientY + offsetY + CANVAS_HEIGHT - scrollY); // because canvas origin is bottomleft instead of bottomright

    let dx = mouseX - startX;
    let dy = mouseY - startY;
    startX = mouseX;
    startY = mouseY;

    let point;
    if(selectedPolygon != -1) // prioritise polygon grabs over lines and points
    {
        var polygon = canvas.polygons[selectedPolygon];
        point = polygon.points[selectedPoint];
    }
    else if(selectedLine != -1) // prioritise line grabs over points
    {
        let line = canvas.lines[selectedLine];
        point = selectedPoint == 0 ? line.p1 : line.p2;
    }
    else
        point = canvas.points[selectedPoint];
    
    // make sure the polygon is still valid after moving
    if(selectedPolygon != -1)
    {
        const updatedPolygon = new Polygon([...polygon.points]);
        const updatedPoint = new Point(point.x + dx, point.y + dy);
        updatedPolygon.points[selectedPoint] = updatedPoint;

        if(!isValidPolygon(updatedPolygon))
            return;
    }

    point.x += dx;
    point.y += dy;
    
    // refrsh the algorithm
    generateAlgorithm(false);
}

function handleMouseUp(e)
{
    e.preventDefault();
    selectedPoint = -1;
    selectedLine = -1;
    selectedPolygon = -1;
}

function handleMouseOut(e)
{
    e.preventDefault();
    selectedPoint = -1;
    selectedLine = -1;
    selectedPolygon = -1;
}

//++++++++++++++++++++++++++
//++++++++++++++++++++++++++
//     CANVAS DRAWING
//++++++++++++++++++++++++++
//++++++++++++++++++++++++++

function drawPoint(p)
{
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, 2*Math.PI);
    ctx.closePath();

    ctx.lineWidth = p.borderWidth;
    ctx.fillStyle = p.fillColor;
    ctx.fill();
    ctx.strokeStyle = p.borderColor;
    ctx.stroke();
}

async function selectPoint(p, select)
{
    // point must be in canvas to be animated
    if(!canvas.points.includes(p))
        canvas.points.push(p);

    // configurable parameters
    const enlarge_ms = 100;
    const shrink_ms = 200;
    const redraws_per_second = 30;
    const size_factor = 2;

    // derivable parameters
    let factor = select ? size_factor : 1/size_factor;
    const ms_between_redraws = 1000/redraws_per_second;
    let enlarge_increment = ((factor-1) * p.radius) * (ms_between_redraws/enlarge_ms);
    let shrink_increment = -((factor-1) * p.radius) * (ms_between_redraws/shrink_ms);
    
    let id;
    // size UP
    id = setInterval(sizePoint, ms_between_redraws, p, enlarge_increment);
    await new Promise((resolve, reject) => setTimeout(resolve, enlarge_ms));
    clearInterval(id);
    
    // size DOWN
    id = setInterval(sizePoint, ms_between_redraws, p, shrink_increment);
    await new Promise((resolve, reject) => setTimeout(resolve, shrink_ms));
    clearInterval(id);
}

function sizePoint(p, increment)
{
    p.radius += increment;
    redrawCanvas();
}

function drawLine(line)
{
    ctx.beginPath();
    ctx.moveTo(line.p1.x, line.p1.y);
    ctx.lineTo(line.p2.x, line.p2.y);
    ctx.closePath();

    ctx.lineWidth = line.width;
    ctx.strokeStyle = line.color;
    ctx.stroke();

    drawPoint(line.p1);
    drawPoint(line.p2);
}

function drawPolygon(polygon)
{
    const points = polygon.points;

    // edges
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for(const p of points)
        ctx.lineTo(p.x, p.y);
    ctx.closePath();
    
    // fill
    ctx.fillStyle = polygon.fillColor;
    ctx.fill();

    // border
    ctx.lineWidth = polygon.borderWidth;
    ctx.strokeStyle = polygon.borderColor;
    ctx.lineJoin = "round";
    ctx.stroke();

    // vertices
    if(polygon.pointsVisible)
        for(const p of points)
            drawPoint(p);
}

function drawSweepLine(sweepline)
{
    ctx.beginPath();
    ctx.moveTo(0, sweepline);
    ctx.lineTo(CANVAS_WIDTH, sweepline);
    ctx.closePath();

    ctx.lineWidth = 7;
    ctx.strokeStyle = TRANSP_BLUE;
    ctx.stroke();
}

function drawParabola(parabola)
{
    ctx.beginPath();
    ctx.moveTo(parabola.start.x, parabola.start.y);
    ctx.quadraticCurveTo(parabola.control.x, parabola.control.y, parabola.end.x, parabola.end.y);
    
    ctx.lineWidth = parabola.width;
    ctx.strokeStyle = parabola.color;
    ctx.stroke();
}

// Draws shapes in 'canvas' data structure on screen
function redrawCanvas()
{
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = "#303030";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    for(const polygon of canvas.polygons.reverse()) // draw polygons in reversed order
    {
        drawPolygon(polygon);
    }
    canvas.polygons.reverse();

    for(const line of canvas.lines)
    {
        drawLine(line);
    }

    for(const point of canvas.points)
    {
        drawPoint(point);
    }
    for(const sweepline of canvas.sweeplines)
    {
        drawSweepLine(sweepline);
    }

    for(const parabola of canvas.parabolas)
    {
        drawParabola(parabola);
    }
}

// Makes all points on canvas, back to default color, size, ...
// Only keeps x, y coordinates.
function resetPoints()
{
    let points = canvas.points;
    for(let i = 0; i < points.length; i++)
        points[i] = new Point(points[i].x, points[i].y);
}

// Makes all lines on canvas, back to default color, size, ...
// Only keeps x, y coordinates of points.
function resetLines()
{
    let lines = canvas.lines;
    for(let i = 0; i < lines.length; i++)
    {
        const p1 = new Point(lines[i].p1.x, lines[i].p1.y);
        const p2 = new Point(lines[i].p2.x, lines[i].p2.y);
        lines[i] = new Line(p1, p2);
    }
}

// Makes all polygons on canvas, back to default color, size, ...
// Only keeps x, y coordinates of points in polygon.
function resetPolygons()
{
    let polygons = canvas.polygons;
    for(let i = 0; i < polygons.length; i++)
    {
        const polygon = polygons[i];

        for(let j = 0; j < polygon.points.length; j++)
        {
            const p = new Point(polygon.points[j].x, polygon.points[j].y);
            polygon.points[j] = p;
        }
        polygons[i] = new Polygon(polygon.points);
    }
}

// Removes all shapes from canvas,
// Removes all future planned drawings.
function clearCanvas()
{
    TIMEOUTS.clearAllTimeouts();
    canvas = new Canvas([], [], [], [], []);
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

//##########################
//##########################
//   ALGORITHM GENERATION
//##########################
//##########################

// Generate the algorithm that is currently selected.
function generateAlgorithm(animate)
{
    switch(algorithm)
    {
        case CXH:
            generateConvexHull(animate);
            break;
        case CH2:
            generateConvexHull2(animate);
            break;
        case TRI:
            generateTriangulate(animate);
            break;
        case LIS:
            generateIntersections(animate);
            break;
        case ART:
            generateConvexHull(animate);
            break;
        case VOR:
            generateVoronoi(animate);
            break;
    }
}

function generateConvexHull(animate)
{
    resetPoints();
    let points = canvas.points;
    clearCanvas();

    if(animate)
        animateConvexHull(points, 1000/speed);
    else
    {
        const hull = convexHull(points);
        const hullPolygon = new Polygon(hull, false);
        for(const p of points) {p.fillColor = RED; p.borderColor = RED;}
        for(const p of hull) {p.fillColor = LIGHT_GREEN; p.borderColor = LIGHT_GREEN;}

        canvas.points = points;
        canvas.polygons.push(hullPolygon);
        redrawCanvas();
    }
}

function generateConvexHull2(animate)
{
    resetPoints();
    let points = canvas.points;
    clearCanvas();

    if(animate)
        animateConvexHull2(points, 500/speed);
    else
    {
        const hull = convexHull2(points);
        const hullPolygon = new Polygon(hull, false);
        for(const p of points) {p.fillColor = RED; p.borderColor = RED;}
        for(const p of hull) {p.fillColor = LIGHT_GREEN; p.borderColor = LIGHT_GREEN;}

        canvas.points = points;
        canvas.polygons.push(hullPolygon);
        redrawCanvas();
    }
}

function generateIntersections(animate)
{
    resetLines();
    let lines = canvas.lines;
    for(const l of lines)
    {
        l.p1.radius *= 0.9;
        l.p2.radius *= 0.9;
    }
    clearCanvas();

    if(animate)
        animateIntersections(lines, 1000/speed);
    else
    {
        const inters = intersections(lines);
        for(const p of inters) {p.fillColor = RED; p.borderColor = RED; p.radius *= 0.9}

        canvas.lines = lines;
        canvas.points = inters;
        redrawCanvas();
    }
}

function generateTriangulate(animate)
{
    resetPolygons();
    let polygon = canvas.polygons[0]; // base polygon should always be at index 0
    clearCanvas();

    if(animate)
        animateTriangulate(polygon, 1000/speed);
    else
    {
        const [monotones, hardDiagonals, diagonals] = triangulate(polygon);

        // color monotones
        let colors = [LIGHT_GREEN, LIGHT_RED, LIGHT_BLUE, LIGHT_PURPLE, LIGHT_ORANGE, LIGHT_ROSE];

        for(let i = 0; i < monotones.length; i++)
        {
            const monotone = monotones[i];
            monotone.fillColor = colors[i % colors.length];
            monotone.borderColor = colors[i % colors.length];
            monotone.borderWidth = 1;
            monotone.pointsVisible = false;
        }

        for(let i = 0; i < hardDiagonals.length; i++)
        {
            const diagonal = hardDiagonals[i];
            diagonal.width = 5;
            diagonal.color = BLACK;
        }

        for(let i = 0; i < diagonals.length; i++)
        {
            const diagonal = diagonals[i];
            diagonal.width = 2;
            diagonal.color = BLACK;
        }

        // make base polygon transparent
        polygon.pointsVisible = true;
        polygon.borderColor = TRANSPARENT;
        polygon.fillColor = TRANSPARENT;

        // polygons on canvas
        canvas.polygons = [polygon]; // base polygon goes first (for dragging points functionality)
        canvas.polygons.push(...monotones);
        // diagonals on canvas
        canvas.lines = hardDiagonals;
        canvas.lines.push(...diagonals);

        redrawCanvas();
    }
}

function generateVoronoi(animate)
{
    resetPoints();
    let points = canvas.points;
    clearCanvas();

    if(animate)
    {
        animateVoronoi(points, 50/speed);
    }
    else
    {
        const edges = voronoiDiagram(points);
        let lines = [];
        for(const edge of edges)
        {
            edge.pL.radius = 0;
            edge.pR.radius = 0;
            lines.push(new Line(edge.pL, edge.pR, 4, BLUE));
        }

        canvas.points = points;
        canvas.lines = lines;
        redrawCanvas();
    }
}

//--------------------------
//--------------------------
//    INPUT GENERATION
//--------------------------
//--------------------------

function generateRandomInput()
{
    clearCanvas();

    switch(algorithm)
    {
        case CXH:
            canvas.points = generateRandomPoints(inputSize);
            inputType = POINTS;
            break;
        case CH2:
            canvas.points = generateRandomPoints(inputSize);
            inputType = POINTS;
            break;
        case TRI:
            canvas.polygons = [generateRandomStarPolygon(inputSize)];
            inputType = POLYGON;
            break;
        case LIS:
            canvas.lines = generateRandomLines(inputSize);
            inputType = LINES;
            break;
        case ART:
            canvas.points = generateRandomPoints(inputSize);
            inputType = POINTS;
            break;
        case VOR:
            canvas.points = generateRandomPoints(inputSize);
            inputType = POINTS;
            break;
    }

    generateAlgorithm(false);
    canvasAlgorithm = algorithm;
    enableInputSize();
    enableGenerate();
}

function addInput(amount)
{
    switch(inputType)
    {
        case POINTS:
            canvas.points.push(...generateRandomPoints(amount));
            break;
        case LINES:
            canvas.lines.push(...generateRandomLines(amount));
            break;
        case POLYGON:
            for(let i = 0; i < amount; i++)
                addPointToPolygon(canvas.polygons[0]);
            break;
    }
}

function removeInput(amount)
{
    switch(inputType)
    {
        case POINTS:
            canvas.points.splice(0, amount);
            break;
        case LINES:
            canvas.lines.splice(0, amount);
            break;
        case POLYGON:
            for(let i = 0; i < amount; i++)
                removePointFromPolygon(canvas.polygons[0]);
            break;
    }
}

function addPointToPolygon(polygon)
{
    const n = polygon.points.length;
    let points = [...polygon.points];
    const p = generateRandomPoints(1)[0];
    const start = Math.floor(Math.random() * n);

    // sort points on closest to p
    let values = [];
    for(const p2 of points)
        values.push(dist(p, p2));

    quicksort(points, values, 0, n);

    for(const p2 of points)
    {
        let newPoints = [...polygon.points];
        newPoints.splice(polygon.points.indexOf(p2), 0, p);
        if(isValidPolygon(new Polygon(newPoints)))
        {
            polygon.points = newPoints;
            return;
        }
    }
    
    console.log("could not add random point to polygon");
    return polygon;
}

function removePointFromPolygon(polygon)
{
    const n = polygon.points.length;
    const oldPoints = [...polygon.points];
    const start = Math.floor(Math.random() * n);

    for(let i = 0; i < n; i++)
    {
        polygon.points = [...oldPoints];
        polygon.points.splice((i + start) % n, 1);
        if(isValidPolygon(polygon))
        {
            console.log(isValidPolygon(polygon));
            return;
        }
    }

    console.log("could not remove random point of polygon");
    polygon.points = oldPoints;
    return;
}

// ~n^2 check algorithm for intersecting edges
function isValidPolygon(polygon)
{
    const n = polygon.points.length;

    for(let i = 0; i < n; i++)
    {
        const p1 = polygon.points[i];
        const p2 = polygon.points[(i+1) % n];

        const edge1 = new Line(p1, p2);

        for(let j = 0; j < n; j++)
        {
            if(j == i || (j + 1) % n == i || (i + 1) % n == j)
                continue;

            const q1 = polygon.points[j];
            const q2 = polygon.points[(j+1) % n];

            const edge2 = new Line(q1, q2);

            if(intersect(edge1, edge2))
                return false;
        }
    }

    return true;
}

function generateRandomPoints(n)
{
    points = [];

    for(let i = 0; i < n; i++)
    {
        let x = Math.random() * CANVAS_WIDTH;
        let y = Math.random() * CANVAS_HEIGHT;
        let p = new Point(x, y);
        points.push(p);
    }

    return points;
}

function generateRandomLines(n)
{
    let points = generateRandomPoints(2*n);

    let lines = [];
    for(let i = 0; i < 2*n; i+=2)
        lines.push(new Line(points[i], points[i+1]));

    return lines;
}

function generateRandomStarPolygon(n)
{
    let points = generateRandomPoints(n);

    // find average point
    let avgX = 0;
    let avgY = 0;
    for(const p of points)
    {
        avgX += p.x
        avgY += p.y;
    }

    const p0 = new Point(avgX/n, avgY/n);
    const p01 = new Point(p0.x+1,p0.y);

    // calculate angle with p0
    let values = [];
    for(let i = 0; i < n; i++)
    {
        const p = points[i];
        let val = crossNorm(p0, p01, p);
        if(p.x < p0.x && p.y > p0.y)
            val = 2 - val; // quadrant 2: vals [ 1,0] -> [1,2]
        if(p.x < p0.x && p.y < p0.y)
            val = 2 - val; // quadrant 3: vals [-1,0] -> [3,4]
        if(p.x > p0.x && p.y < p0.y)
            val = 4 + val; // quadrant 4: vals [-1,0] -> [3,4]

        values.push(val); // sort counter-clockwise
    }

    // sort points on angle with p0
    quicksort(points, values, 0, n);

    const poly = new Polygon(points);
    return poly;
}


// TEMPORARY STUFF
var storedPolygons = [];
var storedLines = [];
var storedPoints = [];

function save()
{
    if(inputType == POINTS)
        storedPoints.push(canvas.points);
    if(inputType == LINES)
        storedLines.push(canvas.lines);
    if(inputType == POLYGON)
        storedPolygons.push(canvas.polygons[0]);
}

function printSaves()
{
    console.log("POINTS");
    console.log(JSON.stringify(storedPoints));
    console.log("LINES");
    console.log(JSON.stringify(storedLines));
    console.log("POLGYONS");
    console.log(JSON.stringify(storedPolygons));
}

