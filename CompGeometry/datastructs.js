/* eslint-disable no-unused-vars */

class Point
{
    constructor(x, y, radius=8, color="#000000", fillColor="#000000")
    {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.fillColor = fillColor;
    }
}

class Line
{
    constructor(p1, p2, width=7, color="#000000")
    {
        this.p1 = p1;
        this.p2 = p2;
        this.width = width;
        this.color = color;
    }
}

class Polygon
{
    constructor(points, borderWidth=7, borderColor="#000000", fillColor="#FFFFFF", pointsVisible=true)
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
    constructor(points, lines)
    {
        this.points = points;
        this.lines = lines;
    }
}