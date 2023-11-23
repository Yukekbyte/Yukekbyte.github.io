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
    constructor(p1, p2, width=5, color=BLACK)
    {
        this.p1 = p1;
        this.p2 = p2;
        this.width = width;
        this.color = color;
    }
}

class Polygon
{
    constructor(points, pointsVisible=true, borderWidth=4, borderColor=LIGHT_GREEN, fillColor=TRANSP_LIGHT_GREEN)
    {
        this.points = points; // CONVENTION: points are ordered counter-clockwise! Things WILL break if this isn't the case...
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