// settings
const SPEED = [0.5, 1, 3, 10, 25];
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 800;

// colors
const RED = "#FF0000";
const BLUE = "#6997E0";
const GREEN = "#27B327";
const BLACK = "#000000";
const WHITE = "#FFFFFF";
const LIGHT_GREEN = "#54d16d";

// algorithm identifiers
const CXH = 0;
const TRI = 1;
const SUB = 2;
const LIS = 3;
const ART = 4;
const FTS = 5;

const INFO = ["<img src=\"symbols/info_symbol.png\" height=\"50\"> <h2>Convex Hull (Graham's Scan)</h2>\
    <p align=\"justify\">Algorithm explanation coming soon.</p>\
    <p>Second paragraph comes here.</p>",

    "<img src=\"symbols/info_symbol.png\" height=\"50\"> <h2>Polygon Triangulation</h2>\
    <p align=\"justify\">Algorithm explanation coming soon.</p>\
    <p>Second paragraph comes here.</p>",

    "<img src=\"symbols/info_symbol.png\" height=\"50\"> <h2>Planar subdivision</h2>\
    <p align=\"justify\">Algorithm explanation coming soon.</p>\
    <p>Second paragraph comes here.</p>",

    "<img src=\"symbols/info_symbol.png\" height=\"50\"> <h2>Line intersections</h2>\
    <p align=\"justify\">Algorithm explanation coming soon.</p>\
    <p>Second paragraph comes here.</p>",

    "<img src=\"symbols/info_symbol.png\" height=\"50\"> <h2>Art Gallery Problem</h2>\
    <p align=\"justify\">Algorithm explanation coming soon.</p>\
    <p>Second paragraph comes here.</p>",

    "<img src=\"symbols/info_symbol.png\" height=\"50\"> <h2>Fortress Problem</h2>\
    <p align=\"justify\">Algorithm explanation coming soon.</p>\
    <p>Second paragraph comes here.</p>"];

function sortingColor(min, max, val)
{
    var minHue = 0, maxHue=240;
    var curPercent = (val - min) / (max-min);
    var colString = "hsl(" + ((curPercent * (maxHue-minHue) ) + minHue) + ",100%,50%)";
    return colString;
}

// Classic quicksort with values of elements (value[i] is value of element[i]).
// elements and values should have same length.
function quicksort(elements, values, start, end)
{
    if(start >= end - 1) 
        return;

    const idx = partition(elements, values, start, end);
    quicksort(elements, values, start, idx);
    quicksort(elements, values, idx+1, end);
}
function partition(elements, values, start, end)
{
    const pivot = values[start];

    let idx = start - 1;
    for(let i = start; i < end; i++)
    {
        if(values[i] <= pivot)
        {
            idx++
            swap(i, idx, elements, values);
        }
    }

    swap(start, idx, elements, values);
    return idx;
}
function swap(i, j, elements, values)
{
    [elements[i], elements[j]] = [elements[j], elements[i]];
    [values[i], values[j]] = [values[j], values[i]];
}

// Returns cross product of the vectors (p0,p1) and (p0,p2).
function cross(p0, p1, p2)
{
    const vx = p1.x-p0.x;
    const vy = p1.y-p0.y;
    const wx = p2.x-p0.x;
    const wy = p2.y-p0.y;
    
    return vx*wy - vy*wx;
}

// Returns normalized cross product of the vectors (p0,p1) and (p0,p2).
function crossNorm(p0, p1, p2)
{
    const vx = p1.x-p0.x;
    const vy = p1.y-p0.y;
    const wx = p2.x-p0.x;
    const wy = p2.y-p0.y;
    const cross = vx*wy - vy*wx;

    if(cross == 0)
        return 0;
    else 
        return cross * 1/(Math.sqrt((vx**2 + vy**2)*(wx**2+wy**2)));
}