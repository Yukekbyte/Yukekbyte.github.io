// settings
const SPEED = [0.5, 1, 3, 10, 25];
const CANVAS_WIDTH = 950;
const CANVAS_HEIGHT = 630;

// input types
const POINTS = 0;
const LINES = 1;
const POLYGON = 2;

// colors
const RED = "#FF0000";
const BLUE = "#007bff";
const GREEN = "#27B327";
const LIME = "#6fff00";
const ORANGE = "#ff9d00";
const PURPLE = "#9b34eb";
const YELLOW = "#ffff00";
const BLACK = "#000000";
const WHITE = "#FFFFFF";
const LIGHT_GREEN = "rgba(84, 209, 109, 1)";
const TRANSP_LIGHT_GREEN = "rgba(84, 209, 109, 0.5)";
const LIGHT_BLUE = "#6970fa";
const LIGHT_RED = "#f56a5b";
const LIGHT_ORANGE = "#fac269";
const LIGHT_PURPLE = "#c269fa";
const LIGHT_ROSE = "#f55be5";
const LIGHT_TEAL = "#56fcf1";
const TRANSP_BLUE = "rgba(0, 117, 255, 0.15)";
const TRANSPARENT = "rgba(0, 0, 0, 0)";

// algorithm identifiers
const CXH = 0;
const CH2 = 1;
const TRI = 2;
const LIS = 3;
const ART = 4;
const VOR = 5;

const INFO = ["<img src=\"symbols/info_symbol.png\" height=\"50\"> <h2>Graham's Scan: Convex hull</h2>\
    <p align=\"justify\">Algorithm explanation coming soon.</p>\
    <p>Second paragraph comes here.</p>",

    "<img src=\"symbols/info_symbol.png\" height=\"50\"> <h2>Jarvis' March: Convex hull</h2>\
    <p align=\"justify\">Algorithm explanation coming soon.</p>\
    <p>Second paragraph comes here.</p>",

    "<img src=\"symbols/info_symbol.png\" height=\"50\"> <h2>Polygon Triagulation</h2>\
    <p align=\"justify\">Algorithm explanation coming soon.</p>\
    <p>Second paragraph comes here.</p>",

    "<img src=\"symbols/info_symbol.png\" height=\"50\"> <h2>Line Intersections</h2>\
    <p align=\"justify\">Algorithm explanation coming soon.</p>\
    <p>Second paragraph comes here.</p>",

    "<img src=\"symbols/info_symbol.png\" height=\"50\"> <h2>Art Gallery Problem</h2>\
    <p align=\"justify\">Algorithm explanation coming soon.</p>\
    <p>Second paragraph comes here.</p>",

    "<img src=\"symbols/info_symbol.png\" height=\"50\"> <h2>Fortune's Algorithm: Voronoi diagram</h2>\
    <p align=\"justify\">Algorithm explanation coming soon.</p>\
    <p>Second paragraph comes here.</p>"];

//timeout keeper
const TIMEOUTS = {
    timeouts: [],
    setTimeout: function(fn, delay) {
        const id = setTimeout(fn, delay);
        this.timeouts.push(id);
    },
    clearAllTimeouts: function() {
        while (this.timeouts.length) {
            clearTimeout(this.timeouts.pop())
        }
    }
}

function delay(ms)
{
    return new Promise((resolve, reject) => TIMEOUTS.setTimeout(resolve, ms));
}

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

// returns true if line1 and line2 intersect.
function intersect(line1, line2)
{
    const p1 = line1.p1;
    const p2 = line1.p2;
    const q1 = line2.p1;
    const q2 = line2.p2;

    return cross(p1, q1, p2) * cross(p1, q2, p2) <= 0 &&
           cross(q1, p1, q2) * cross(q1, p2, q2) <= 0;
}

// Returns euclidian distance between 2 points.
function dist(p1, p2)
{
    return Math.sqrt((p1.x-p2.x)*(p1.x-p2.x) + (p1.y-p2.y)*(p1.y-p2.y));
}