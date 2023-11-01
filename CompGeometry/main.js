let canvas;
let canvasElem;
let ctx;
let algorithm = CXH; // algorithm selected
let canvasAlgorithm = CXH; // algorithm currently on canvas.
let speed = SPEED[2];

window.onload = function()
{
    // initialise canvas elements
        // internal data struct
    canvas = new Canvas([], [], [], []);
        // html
    document.getElementById("mainCanvas").innerHTML = `<canvas id=\"canvas\" width=\"${CANVAS_WIDTH}\" height=\"${CANVAS_HEIGHT}\" style=\"border: 10px solid ${BLACK}\"></canvas>`;
        // html elements
    canvasElem = document.getElementById("canvas");
    ctx = canvasElem.getContext("2d");
    ctx.translate(0, canvasElem.height);
    ctx.scale(1, -1);

    // first config
    pressedAlgorithm("CXH-button");
    pressedSpeed("speed-3");

    generateAlgorithm(false, false);

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
    switch(id)
    {
        case "CXH-button":
            algorithm = CXH;
            break;
        case "LIS-button":
            algorithm = LIS;
            break;
        case "TRI-button":
            algorithm = TRI;
            break;
        case "SUB-button":
            algorithm = SUB;
            break;
        case "ART-button":
            algorithm = ART;
            break;
        case "FTS-button":
            algorithm = FTS;
            break;
    }

    // update regenerate button
    if(algorithm != canvasAlgorithm)
        disableRegenerate();
    else
        enableRegenerate();

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

function pressedAlgorithm(id)
{
    document.getElementById("CXH-button").classList.remove("button-outer-active");
    document.getElementById("LIS-button").classList.remove("button-outer-active");
    document.getElementById("TRI-button").classList.remove("button-outer-active");
    document.getElementById("SUB-button").classList.remove("button-outer-active");
    document.getElementById("ART-button").classList.remove("button-outer-active");
    document.getElementById("FTS-button").classList.remove("button-outer-active");
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

function disableRegenerate()
{
    const button = document.getElementById("button-regenerate")
    button.classList.add("button-selector-inactive");
    button.disabled = true;
}

function enableRegenerate()
{
    const button = document.getElementById("button-regenerate")
    button.classList.remove("button-selector-inactive");
    button.disabled = false;
}

//++++++++++++++++++++++++++
//++++++++++++++++++++++++++
//     CANVAS DRAWING
//++++++++++++++++++++++++++
//++++++++++++++++++++++++++

function drawPoint(p)
{
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, 2 *Math.PI);
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

// Draws shapes in 'canvas' data structure on screen
function redrawCanvas()
{
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    for(const polygon of canvas.polygons)
    {
        drawPolygon(polygon);
    }

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

// Removes all shapes from canvas,
// Removes all future planned drawings.
function clearCanvas()
{
    TIMEOUTS.clearAllTimeouts();
    canvas = new Canvas([], [], [], []);
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

//##########################
//##########################
//   ALGORITHM GENERATION
//##########################
//##########################

// Generate the algorithm that is currently selected.
function generateAlgorithm(animate, useCanvas)
{
    switch(algorithm)
    {
        case CXH:
            generateConvexHull(animate, useCanvas);
            break;
        case TRI:
            generateTriangulate(false, useCanvas);
            break;
        case SUB:
            generateConvexHull(animate, useCanvas);
            break;
        case LIS:
            generateIntersections(animate, useCanvas);
            break;
        case ART:
            generateConvexHull(animate, useCanvas);
            break;
        case FTS:
            generateConvexHull(animate, useCanvas);
            break;
    }

    canvasAlgorithm = algorithm;
    enableRegenerate();
}

function generateConvexHull(animate, useCanvas)
{
    let points = canvas.points;
    clearCanvas();
 
    // if we don't use canvas, generate new points.
    if(!useCanvas)
        points = generateRandomPoints(30);

    if(animate)
        animateConvexHull(points, 1000/speed);
    else
    {
        const hull = convexHull(points);
        const hullPolygon = new Polygon(hull, false, 0, LIGHT_GREEN, LIGHT_GREEN);

        //color points
        for(const p of points) {p.fillColor = RED; p.borderColor = RED;}
        for(const p of hull) {p.fillColor = GREEN; p.borderColor = GREEN;}

        canvas.points = points;
        canvas.polygons.push(hullPolygon);

        redrawCanvas();
    }
}

function generateIntersections(animate, useCanvas)
{
    let lines = canvas.lines;
    clearCanvas();
 
    // if we don't use canvas, generate new lines.
    if(!useCanvas)
        lines = generateRandomLines(15);

    if(animate)
        animateIntersections(lines, 1000/speed);
    else
    {
        const inters = intersections(lines);

        //color points
        for(const p of inters) {p.fillColor = RED; p.borderColor = RED;}

        canvas.lines = lines;
        canvas.points = inters;

        redrawCanvas();
    }
}

function generateTriangulate(animate, useCanvas)
{
    let polygon;
    clearCanvas();

    if(canvas.polygons.length > 0 && useCanvas)
        polygon = canvas.polygons[0];
    else
        polygon = generateRandomStarPolygon(10);

    if(animate)
        animateTriangulate(polygon, 1000/speed);
    else
    {
        const diagonals = split(polygon);

        // color diagonals
        for(const diag of diagonals) {diag.color = RED;}

        canvas.polygons = [polygon];
        canvas.lines = diagonals;
        
        polygon.borderWidth = 1;
        polygon.borderColor = BLUE;
        canvas.polygons = [polygon];
        redrawCanvas();
    }
}

function generateRandomPoints(n)
{
    const width = canvasElem.width;
    const height = canvasElem.height;

    points = [];

    for(let i = 0; i < n; i++)
    {
        let x = Math.random() * width;
        let y = Math.random() * height;
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

function generateRandomPolygon(n)
{
    let points = generateRandomPoints(n);
    let polygon = convexHull(points);
    let interior = points.filter(p => !polygon.includes(p));

    while(interior.length > 0)
    {
        let minDist = 9999;
        let insertIndex;
        let nearestPoint;

        for(let i = 0; i < polygon.length; i++)
        {
            const l = polygon.length;
            const p1 = polygon[i];
            const p2 = polygon[(((i+1) % l) + l) % l];

            for(const p of interior)
            {
                const currDist = distToSegment(p, p1, p2);
                if(currDist < minDist && !intersectsPolygon(p, p1, p2, polygon))
                {
                    minDist = currDist;
                    insertIndex = (i+1) % l;
                    nearestPoint = p;
                }
            }
        }

        interior.splice(interior.indexOf(nearestPoint), 1);
        polygon.splice(insertIndex, 0, nearestPoint);
    }

    const poly = new Polygon(polygon, true, 3, LIGHT_GREEN, LIGHT_GREEN);
    return poly;

    // intersects function
    function intersectsPolygon(p, p1, p2, polygon)
    {
        const n = polygon.length;
        const newEdge1 = new Line(p, p1);
        const newEdge2 = new Line(p, p2);

        for(let i = 0; i < n; i++)
        {
            const pp1 = polygon[i];
            const pp2 = polygon[i % n];

            if(pp1 == p1 || pp1 == p2 || pp2 == p1 || pp2 == p2)
            continue;
            
            const edge = new Line(pp1, pp2);
            if(intersect(edge, newEdge1) || intersect(edge, newEdge2))
                return true;
        }
        return false;
    }

    // min dist to edge functions from stackoverflow
    function sqr(x) { return x * x }
    function dist2(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y) }
    function distToSegmentSquared(p, v, w) {
    var l2 = dist2(v, w);
    if (l2 == 0) return dist2(p, v);
    var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return dist2(p, { x: v.x + t * (w.x - v.x),
                        y: v.y + t * (w.y - v.y) });
    }
    function distToSegment(p, v, w) { return Math.sqrt(distToSegmentSquared(p, v, w)); }
}

function generateRandomStarPolygon(n)
{
    let points = generateRandomPoints(n);

    // find lowest point
    let min = 0;
    for(let i = 1; i < n; i++)
        if(points[i].y < points[min].y)
            min = i;

    const p0 = points[min];
    const p01 = new Point(p0.x+1,p0.y);

    // calculate angle with p0
    let values = [];
    for(let i = 0; i < n; i++)
    {
        if(i == min) 
            values.push(0);
        else
        {
            const p = points[i];
            let val = crossNorm(p0, p01, p);
            if(p.x < p0.x)
            val = 2 - val; // angle > 90 deg
            values.push(val); // sort counter-clockwise
        }   
    }

    // sort points on angle with p0
    quicksort(points, values, 0, n);

    const poly = new Polygon(points, true, 3, LIGHT_GREEN, LIGHT_GREEN);
    return poly;
}

