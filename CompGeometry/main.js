/* eslint-disable no-undef */

let canvas = new Canvas([], []);
let canvasElem;
let ctx;

window.onload = function()
{
    const p1 = new Point(100, 100);
    const p2 = new Point(200, 70);
    const p3 = new Point(250, 140);
    const p4 = new Point(190, 200);
    const p5 = new Point(120, 190, 15, "#FF0000", "#FF00FF");
    const p6 = new Point(60, 150);
    
    const p7 = new Point(240, 350);
    const p8 = new Point(670, 730);
    const p9 = new Point(560, 550);
    const p10 = new Point(460, 310);

    const line = new Line(p7, p8);
    const polygon = new Polygon([p1, p2, p3, p4, p5, p6], 4, "#00FF00", "#00FFFF", true);

    canvas.points = [p9, p10];
    canvas.lines = [line];
    canvas.polygons = [polygon];
    
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
    ctx.strokeStyle = polygon.borderColor;
    ctx.stroke();

    // vertices
    if(polygon.pointsVisible)
        for(const p of points)
            drawPoint(p);
}

function DrawCanvas()
{
    const canvas_html = "<canvas id=\"canvas\" width=\"1000\" height=\"800\" style=\"border: 2px solid #000000\"></canvas>";
    document.getElementById("mainCanvas").innerHTML = canvas_html;
    canvasElem = document.getElementById("canvas");
    ctx = canvasElem.getContext("2d");

    for(const point of canvas.points)
    {
        drawPoint(point);
    }

    for(const line of canvas.lines)
    {
        drawLine(line);
    }

    for(const polygon of canvas.polygons)
    {
        drawPolygon(polygon);
    }
}