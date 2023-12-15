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
    last point (visualised by making the edges and point red) and re-evaluate the last 2 edges again. If the inside angle was less than 180 degrees, we can connect \
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
    with the edge we already have (in black), we choose the new point. If not, we keep our current point and discard the new point (discards are visualised in red). \
    The algorithm stops if the point chosen after a loop is the first point we started with.</p>\
    <p>We skip the expensive sorting step in Graham's scan but by doing so we lose the ability to calculate the convex hull afterwards in lineair time. We do loop over all the points a lot so it might seem \
    like a quadratic time complexity. Luckily after each loop, we find a point on the convex hull so we can stop looping after we found all of them. Let's say there are k points on the convex hull and n points in total. Jarvis' march then \
    runs in O(nk) time.</p>\
    <p>Given that we don't know the amount of points on the hull, this algorithm is output sensitive. A best case scenario would be that k is small, perhaps k = 3. \
    Then the algorithm only loops through all the points 3 times, making its runtime lineair.</p>",

    "<img src=\"symbols/info_symbol.png\" height=\"50\"> <h2>Polygon Triagulation</h2>\
    <p align=\"justify\">To triangulate a polygon, we work in 2 major steps. First we split our polygon in y-monotone subpolygons. \
    Afterwards, every y-monotone can be easily triangulated. Splitting the polygon in y-monotones uses a sweepline. We sort the vertices in descending y-value. \
    We keep track of the different y-monotones being created by tracing their left edge (visualised in red). Every left edge has a helper vertex (also in red). \
    These helper vertices serve as anchor points to connect new diagonals to when encountering split or merge vertices. A split (orange) or merge (green) vertex is a vertex with an \
    inside angle of more than 180 degrees while both neighbors lay below them (for splits) or above them (for merges). The goal of this first step is to connect every split and merge vertex with a diagonal. \
    There are 3 other type of vertices. A start vertex (blue) marks the beginning of a new y-monotone. The end vertices (purple) mark the end of y-monotones. \
    The other vertices are regular. At every vertex, the left edges and their helpers are updated accordingly. The second step, triangulating a y-monotone, is done by also sweeping the points \
    from the top down. When a diagonal cannot be drawn from a vertex, we put the vertex on a stack (visualised in light blue) to connect it later.</p>\
    <p>This algorithm first sorts the points. To process a point in the first step takes O(logn) time because of updates to the the necessary data structures. Triangulating all y-monotones takes O(n) time. \
    This makes the total algorithm run in O(nlogn) time.</p>\
    <p>Some interesting input for the second step would be a y-monotone polygon where all the points are first put on a stack to then connect them all at once with the last point.</p>",

    "<img src=\"symbols/info_symbol.png\" height=\"50\"> <h2>Line Intersections</h2>\
    <p align=\"justify\">This algorithm uses a sweepline to calculate all the intersection points between different line segments. To be able to use a sweepline, \
    the endpoints of the segments are first sorted from descending y-value. Then we step through all those points while keeping track of an active set (visualised in green). \
    If our current point is the beginning of a line segment, we make it active and check for intersections with every other line segment in the active set (a check is visualised in red). \
    If our current point marks the end of a line segment, we remove it from the active set. The algorithm is done when all points have been processed.</p>\
    <p>Using a sweepline implies \u03A9(nlogn) because we will have to sort the input. But because this algorithm keeps comparing with the whole active set, its runtime is actually O(n<sup>2</sup>). \
    It is possible to optimise the structure of the active line segments with a binary search tree instead of a set, but this will make the algorithm output sensitive.</p>\
    <p>If all the line segments lay horizontal (= parallel with the sweepline) we would get a best case runtime. Every segment would just move in and out of the active set without needing processing. \
    A worse case layout would be every line segement in a position perpendicular to the sweepline, this would make every segment stay in the active set for as long as possible, \
    making new additions to the set expensive due to potentially many comparisons (if the active set is big).</p>",

    "<img src=\"symbols/info_symbol.png\" height=\"50\"> <h2>Art Gallery Problem</h2>\
    <p align=\"justify\">Algorithm explanation coming soon.</p>\
    <p>Second paragraph goes here.</p>",

    "<img src=\"symbols/info_symbol.png\" height=\"50\"> <h2>Fortune's Algorithm: Voronoi diagram</h2>\
    <p align=\"justify\">The Voronoi diagram of a set of points (= sites) can be calculated with Fortune's algorithm. This sweepline algorithm first sorts the set of points on descending y-value. \
    This order is then used as event queue. Besides the event queue with the sweepline, the algorithm also keeps track of a beach line (the parabolas). While the sweepline encounters a site, \
    an expanding parabola is added to the beach line (these parabolas are never fully stored and only used for visualisation). The breakpoints of these parabolas trace the edges of the voronoi diagram. \
    There are also circle events. These events happen when the sweepline hits the bottom point of a circle span by 3 sites. By aptly keeping track of these circle events, we can deduce when a parabola will collapse (collapsing parabolas are colored red). \
    At that point, we remove that parabola from the beachline and the intersecting edges are merged into one outcoming edge that will then be traced by breakpoint of the neighboring parabolas.</p>\
    <p>Fortune's algorithm runs in O(nlogn) time. This is because we sort the sites in the beginning, but also because each event takes O(logn) time to process. Because the amount of extra (circle) events that \
    can appear is also bounded by O(n), and we originally start with n site events, the overall timecomplexity stays linearithmic.</p>\
    <p>The Voronoi diagram of a spiral can look pretty cool.</p>"];

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