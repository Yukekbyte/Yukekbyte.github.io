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
const LIGHT_BLUE = "rgba(105, 112, 250, 1)";
const LIGHT_RED = "rgba(245, 106, 91, 1)";
const LIGHT_ORANGE = "rgba(250, 194, 105, 1)";
const LIGHT_PURPLE = "rgba(194, 105, 250, 1)";
const LIGHT_ROSE = "rgba(245, 91, 229, 1)";
const LIGHT_TEAL = "rgba(0, 247, 255, 1)";
const TRANSP_LIGHT_GREEN = "rgba(84, 209, 109, 0.5)";
const TRANSP_LIGHT_BLUE = "rgba(105, 112, 250, 0.5)";
const TRANSP_LIGHT_RED = "rgba(245, 106, 91, 0.5)";
const TRANSP_LIGHT_ORANGE = "rgba(250, 194, 105, 0.5)";
const TRANSP_LIGHT_PURPLE = "rgba(194, 105, 250, 0.5)";
const TRANSP_LIGHT_ROSE = "rgba(245, 91, 229, 0.5)";
const TRANSP_LIGHT_TEAL = "rgba(0, 247, 255, 0.5)";

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
    <p align=\"justify\">Graham's scan is an algorithm for calculating the convex hull of a given set of points. The algorithm works as follows: \
    First, the lowest point p0 of the whole set is calculated. This point is garanteed to be in the convex hull. Then we sort all the points according \
    to their angle with p0. The sorting order is visualised by the color of the points (red is first and blue is last). Now the hull can be calculated. \
    We start from p0 and work our way through the points in order. We connect each point to the hull and check if the angle created by adding this new point \
    creates a concavity, this happens when the last 2 edges have an inside angle of more than 180 degrees. If this is the case. We discard the second to \
    last point (visualised by making the edges and point red) and reevaluate the last 2 edges again. If the inside angle was less than 180 degrees, we can connect \
    another point. Once we have arrived back at p0, the algorithm is done.</p>\
    <p>Don't let the fast visualisation fool you, sorting the points is the expensive step. Actually calculating the hull afterwards is done in lineair time. \
    Becasue we have to use a sorting algorithm (like quicksort in this case), the time complexity of Graham's scan is O(nlogn).</p>\
    <p>The Best case layout would be a set of points where all points lay on the convex hull, e.g. a circle. The hull caculating step is then performed without discarding \
    any points. The sorting algorithm will probably not be impacted by the layout of the points (depending on the sorting algorithm used).</p>",

    "<img src=\"symbols/info_symbol.png\" height=\"50\"> <h2>Jarvis' March: Convex hull</h2>\
    <p align=\"justify\">Jarvis' march, also known as the giftwrapping algorithm, is an algorithm that calculates the convex hull of a given set of points. \
    Jarvis' march is a more naive approach to calculating the convex hull compared to Graham's scan. You can think of it as Graham's scan without sorting the points first. This algorithm also starts by finding the lowest point in the set. \
    This point is guaranteed to be part of the convex hull. Then at each step, we iterate through all the points to find the next point on the hull. This is done by \
    first choosing a point at random. For every other point, we then check if this new point lies more to the 'outside' of the set then our current point. If so, \
    we choose that point instead (in blue). To test if a new point lies more to the outside, we calculate the inside angle of the edge of the new point (in blue). If adding the new point creates a concavity \
    with the edge we already have (in black), we choose the new point. Else the angle is less than 180 degrees, so we keep our current point and discard the new point (discards are visualised by making the point red). \
    The algorithm stops if the point chosen after a loop, is the first point we started with.</p>\
    <p>We skip the expensive sorting step in Graham's scan but by doing so we lose the ability to calculate the convex hull afterwards in lineair time. We do loop over all the points a lot so it might seem \
    like a quadratic time complexity. Luckily after each loop, we find a point on the convex hull so we can stop looping after we found all of them. Let's say there are k points on the convex hull and n points in total. Jarvis' march then \
    runs in O(nk) time.</p>\
    <p>Given that we don't know the amount of points on the hull, this algorithm is output sensitive. A best case scenario would be that k is small, perhaps k = 3. \
    Then the algorithm only loops through all the points 3 times, making its runtime lineair.</p>",

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