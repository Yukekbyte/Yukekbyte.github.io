var canvas;
var canvasElem;
var ctx;
var algorithm = CXH; // algorithm selected
var canvasAlgorithm = CXH; // (input for) algorithm currently on canvas.
var inputType = POINTS; // to regulate which algorithms can be animated with given input on canvas.
var hasGenerated = false; // the output of algorithm is drawn on canvas.
var speed = SPEED[2];

window.onload = function()
{
    // initialise canvas elements
        // internal canvas data struct
    canvas = new Canvas([], [], [], []);
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
        disableGenerate();
    else
        enableGenerate();

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
    document.getElementById("CH2-button").classList.remove("button-outer-active");
    document.getElementById("LIS-button").classList.remove("button-outer-active");
    document.getElementById("TRI-button").classList.remove("button-outer-active");
    document.getElementById("ART-button").classList.remove("button-outer-active");
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

    console.log(`offset (${offsetX}, ${offsetY}) | scroll (${scrollX}, ${scrollY})`);

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
        let polygon = canvas.polygons[selectedPolygon];
        point = polygon.points[selectedPoint];
    }
    else if(selectedLine != -1) // prioritise line grabs over points
    {
        let line = canvas.lines[selectedLine];
        point = selectedPoint == 0 ? line.p1 : line.p2;
    }
    else
        point = canvas.points[selectedPoint];
        
    point.x += dx;
    point.y += dy;
    
    // if there is output on the canvas, refresh output.
    if(hasGenerated)
        generateAlgorithm(false);
    // else just redraw the canvas with moved point.
    else
        redrawCanvas();
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
    canvas = new Canvas([], [], [], []);
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
            generateVoronoi(false);
            break;
    }

    hasGenerated = true;
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
    clearCanvas();

    if(animate)
        animateIntersections(lines, 1000/speed);
    else
    {
        const inters = intersections(lines);
        for(const p of inters) {p.fillColor = RED; p.borderColor = RED;}

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
        //fuck off
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
            canvas.points = generateRandomPoints(25);
            inputType = POINTS;
            break;
        case CH2:
            canvas.points = generateRandomPoints(30);
            inputType = POINTS;
            break;
        case TRI:
            canvas.polygons = [generateRandomPolygon()];
            inputType = POLYGON;
            break;
        case LIS:
            canvas.lines = generateRandomLines(12);
            inputType = LINES;
            break;
        case ART:
            canvas.points = generateRandomPoints(15);
            inputType = POINTS;
            break;
        case VOR:
            //canvas.points = JSON.parse(`[{"x":820.0989085751231,"y":502.22983306188564,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":467.27545911156017,"y":222.17800975883864,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":304.66781698305226,"y":94.91140664266472,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":895.6657644051727,"y":605.8744410993587,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":564.9614264146626,"y":174.23082712694764,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":186.21605384025807,"y":185.74672657267487,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":82.83341074043919,"y":611.6476342225809,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":648.6132313957385,"y":295.6469683431802,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":321.40497883740437,"y":27.18905958801876,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":654.6442250126726,"y":55.39209818384611,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":194.8079757627054,"y":483.98959956893617,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":653.9057661000994,"y":363.57925043337764,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":383.5299736712828,"y":83.24573453794738,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":274.7262533214319,"y":436.570662058559,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":208.54190885676974,"y":2.3470483648818075,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":913.138731429159,"y":318.56617144466446,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":759.350102853849,"y":250.33371201123435,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":574.8860528727085,"y":579.5639301828538,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":926.1555204742914,"y":330.2162796022484,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":153.27348978812435,"y":372.4463997268556,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":328.957927976375,"y":269.31761863051855,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":598.7750293387696,"y":269.9907562078041,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":360.75454892475403,"y":521.5527653510087,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":182.442556575993,"y":561.7665894060434,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":941.3239122982434,"y":171.6705449645356,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":54.57197173020663,"y":347.45472287460746,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":932.8211126892913,"y":221.7160772590107,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":436.8206310517522,"y":260.9501184717619,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":84.7114843096427,"y":341.9674200833726,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":815.939809928762,"y":451.06930338613734,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":284.0356551647205,"y":568.2250549465933,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":381.841380481868,"y":324.2797361949896,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":308.72068114791443,"y":528.1016583116312,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":841.1401787296045,"y":390.6849933608807,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":409.7185154977799,"y":46.441474832762495,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":495.24311147481063,"y":489.22956232190575,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":828.8401344036944,"y":20.604198430309193,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":355.05336012528556,"y":576.965080065409,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":389.9068856266466,"y":56.41542633221911,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":233.45521205798474,"y":511.41857483659356,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"}]`);
            canvas.points = generateRandomPoints(30);
            inputType = POINTS;
            break;
    }

    hasGenerated = false;
    redrawCanvas();
    canvasAlgorithm = algorithm;
    enableGenerate();
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

function generateRandomPolygon()
{
    const storedPolygonsInString = [`{"points":[{"x":325.3505336178226,"y":31.81879110928179,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":315.5832674586085,"y":140.46967328064332,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":376.4232258878111,"y":228.26054731111353,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":428.2838236186178,"y":134.62730842841145,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":546.860575355883,"y":126.60242767560976,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":525.6575558585931,"y":18.784471026227834,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":722.6886605596402,"y":79.52224931284297,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":760.4012467818943,"y":184.46339683452257,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":859.7672692074541,"y":179.10952337633853,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":966.173760835564,"y":286.0592650316676,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":891.7036698710622,"y":476.12502224464856,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":815.1405600526981,"y":374.8818697098144,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":787.9734016114011,"y":279.45729782743115,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":683.4862602699417,"y":386.81712414386334,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":579.9035862385871,"y":311.0555113511965,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":455.8055157888707,"y":337.3458484505048,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":548.8069533735718,"y":438.89939062072784,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":521.228097994121,"y":563.981116696272,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":423.5236176476529,"y":501.48936137338745,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":288.6721445180201,"y":445.66998452280865,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":320.3538810923635,"y":373.17812132310746,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":245.95964975159933,"y":349.9192419791234,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":173.09087398778536,"y":338.1379161219965,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":177.18296343757922,"y":430.94826055875444,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":109.77822575722547,"y":458.5946807021289,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":58.05907872351206,"y":389.5077775736707,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":89.81204710258676,"y":299.8023052669615,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":72.35364497503313,"y":193.86269615189076,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":151.97707869019183,"y":120.62111864496703,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":236.26873172973472,"y":24.835679828952927,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"}],"borderWidth":3,"borderColor":"#54d16d","fillColor":"#54d16d","pointsVisible":true}`,

    `{"points":[{"x":250.35053361782258,"y":50.81879110928179,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":310.5832674586085,"y":117.46967328064332,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":378.4232258878111,"y":154.26054731111353,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":382.2838236186178,"y":247.62730842841142,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":453.86057535588304,"y":200.60242767560976,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":432.6575558585931,"y":48.784471026227834,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":564.6886605596402,"y":64.52224931284297,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":645.4012467818943,"y":116.46339683452257,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":748.7672692074541,"y":47.10952337633853,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":897.173760835564,"y":43.05926503166762,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":963.7036698710622,"y":236.12502224464856,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":961.1405600526981,"y":499.8818697098144,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":841.9734016114011,"y":571.4572978274311,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":659.4862602699417,"y":530.8171241438633,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":798.9035862385871,"y":408.0555113511965,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":830.8055157888707,"y":264.3458484505048,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":706.8069533735718,"y":205.89939062072784,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":560.228097994121,"y":452.981116696272,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":365.5236176476529,"y":574.4893613733875,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":211.6721445180201,"y":566.6699845228086,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":303.3538810923635,"y":483.17812132310746,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":379.95964975159933,"y":377.9192419791234,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":326.09087398778536,"y":295.1379161219965,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":174.18296343757925,"y":431.94826055875444,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":66.77822575722547,"y":376.5946807021289,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":172.05907872351207,"y":298.5077775736707,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":183.81204710258675,"y":216.80230526696153,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":87.35364497503313,"y":110.86269615189076,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":137.97707869019183,"y":41.62111864496703,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":234.26873172973472,"y":127.83567982895292,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"}],"borderWidth":3,"borderColor":"#54d16d","fillColor":"#54d16d","pointsVisible":true}`,

    `{"points":[{"x":196.35053361782258,"y":38.81879110928179,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":261.5832674586085,"y":101.46967328064332,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":268.4232258878111,"y":208.26054731111353,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":396.2838236186178,"y":37.627308428411425,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":510.86057535588304,"y":68.60242767560976,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":629.6575558585931,"y":139.78447102622783,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":778.6886605596402,"y":42.52224931284297,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":937.4012467818943,"y":109.46339683452257,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":989.7672692074541,"y":286.10952337633853,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":985.173760835564,"y":483.0592650316676,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":891.7036698710622,"y":561.1250222446486,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":797.1405600526981,"y":588.8818697098144,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":700.9734016114011,"y":582.4572978274311,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":722.4862602699417,"y":466.81712414386334,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":776.9035862385871,"y":415.0555113511965,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":871.8055157888707,"y":447.3458484505048,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":859.8069533735718,"y":303.89939062072784,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":762.228097994121,"y":210.981116696272,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":556.5236176476528,"y":240.4893613733875,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":399.6721445180201,"y":319.6699845228086,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":410.3538810923635,"y":448.17812132310746,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":344.95964975159933,"y":528.9192419791234,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":234.09087398778536,"y":514.1379161219966,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":128.18296343757925,"y":597.9482605587544,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":91.77822575722547,"y":465.5946807021289,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":229.05907872351207,"y":318.5077775736707,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":142.81204710258675,"y":277.8023052669615,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":59.353644975033134,"y":290.86269615189076,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":27.97707869019183,"y":151.62111864496703,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":114.26873172973472,"y":15.83567982895292,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"}],"borderWidth":3,"borderColor":"#54d16d","fillColor":"#54d16d","pointsVisible":true}`,

    `{"points":[{"x":200,"y":100,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":713,"y":188,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":634,"y":420,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":428,"y":513,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"},{"x":268,"y":293,"radius":8,"borderWidth":3,"borderColor":"#000000","fillColor":"#000000"}],"borderWidth":0,"borderColor":"#54d16d","fillColor":"#54d16d","pointsVisible":true}`];

    const i = Math.floor(Math.random()*storedPolygonsInString.length);

    return JSON.parse(storedPolygonsInString[i]);
    //return new Polygon([new Point(200, 100), new Point(600, 320), new Point(550, 500), new Point(400, 350), new Point(300, 250)], true, 0, LIGHT_GREEN, LIGHT_GREEN);
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


// TEMPORARY STUFF
var storedPolygons = [];

function storePolygon()
{
    storedPolygons.push(canvas.points);
    console.log(JSON.stringify(canvas.points));
}

