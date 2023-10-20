let canvas = new Canvas([], [], []);
let canvasElem;
let ctx;

window.onload = function()
{
    const canvas_html = "<canvas id=\"canvas\" width=\"1000\" height=\"800\" style=\"border: 10px solid #000000\"></canvas>";
    document.getElementById("mainCanvas").innerHTML = canvas_html;
    canvasElem = document.getElementById("canvas");
    ctx = canvasElem.getContext("2d");
    
    // set bottom left corner as (0,0).
    ctx.translate(0, canvasElem.height);
    ctx.scale(1, -1);

    // DRAWING
    const points = GenerateRandomPoints(14);
    const convexHull = ConvexHull(points);
    canvas.points = points;
    const convexHullPolygon = new Polygon(convexHull, false, 0, "#54d16d", "#54d16d");
    canvas.polygons.push(convexHullPolygon);

    DrawCanvas();
}

function drawPoint(p)
{
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, 2 *Math.PI);

    ctx.fillStyle = p.fillColor;
    ctx.fill();
    ctx.strokeStyle = p.color;
    ctx.stroke();
}

function drawLine(line)
{
    ctx.beginPath();
    ctx.moveTo(line.p1.x, line.p1.y);
    ctx.lineTo(line.p2.x, line.p2.y);

    ctx.lineWidth = line.width;
    ctx.strokeStyle = line.color;
    ctx.stroke();
}

function drawPolygon(polygon)
{
    const points = polygon.points;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for(const p of points)
    {
        ctx.lineTo(p.x, p.y);
    }
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

function DrawCanvas()
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

function GenerateRandomPoints(n)
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