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
    canvas = new Canvas([], [], []);
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

function drawLine(line)
{
    ctx.beginPath();
    ctx.moveTo(line.p1.x, line.p1.y);
    ctx.lineTo(line.p2.x, line.p2.y);
    ctx.closePath();

    ctx.lineWidth = line.width;
    ctx.strokeStyle = line.color;
    ctx.stroke();
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
    ctx.stroke();

    // vertices
    if(polygon.pointsVisible)
        for(const p of points)
            drawPoint(p);
}

function drawCanvas()
{
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
}

function redrawCanvas()
{
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawCanvas();
}

// Makes all points on canvas, back to default color, size, ...
// Only keeps x, y coordinates.
function resetPoints()
{
    let points = canvas.points;
    for(let i = 0; i < points.length; i++)
        points[i] = new Point(points[i].x, points[i].y);
}

function clearCanvas()
{
    canvas = new Canvas([], [], []);
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

// Generate the algorithm that is currently selected.
function generateAlgorithm(animate, useCanvas)
{
    switch(algorithm)
    {
        case CXH:
            generateConvexHull(animate, useCanvas);
            break;
        case TRI:
            generateConvexHull(animate, useCanvas);
            break;
        case SUB:
            generateConvexHull(animate, useCanvas);
            break;
        case LIS:
            generateIntersections(false, useCanvas);
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
        points = generateRandomPoints(35);

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

        drawCanvas();
    }
}

function generateIntersections(animate, useCanvas)
{
    let lines = canvas.lines;
    clearCanvas();
 
    // if we don't use canvas, generate new lines.
    if(!useCanvas)
        lines = generateRandomLines(20);

    if(animate)
        animateIntersections(lines, 1000/speed);
    else
    {
        const inters = intersections(lines);

        //color points
        for(const p of inters) {p.fillColor = RED; p.borderColor = RED;}

        canvas.lines = lines;
        canvas.points = inters;

        drawCanvas();
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
    const points = generateRandomPoints(2*n);

    let lines = [];
    for(let i = 0; i < 2*n; i+=2)
        lines.push(new Line(points[i], points[i+1]));

    return lines;
}