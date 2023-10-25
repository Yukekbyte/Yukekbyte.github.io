class Point
{
    constructor(x, y, radius=8, borderWidth=3, borderColor=BLACK, fillColor=BLACK)
    {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.borderWidth = borderWidth;
        this.borderColor = borderColor;
        this.fillColor = fillColor;
    }
}

class Line
{
    constructor(p1, p2, width=7, color=BLACK)
    {
        this.p1 = p1;
        this.p2 = p2;
        this.width = width;
        this.color = color;
    }
}

class Polygon
{
    constructor(points, pointsVisible=true, borderWidth=7, borderColor=BLACK, fillColor=WHITE)
    {
        this.points = points;
        this.borderWidth = borderWidth;
        this.borderColor = borderColor;
        this.fillColor = fillColor;
        this.pointsVisible = pointsVisible;
    }
}

class Canvas
{
    constructor(points, lines, polygons, sweeplines)
    {
        this.points = points;
        this.lines = lines;
        this.polygons = polygons;
        // sweeplines are single float values 
        // representing the y value of the horzontal sweepline.
        this.sweeplines = sweeplines;
    }
}