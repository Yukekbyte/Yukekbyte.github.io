// Sweepline algorithm on Line Segments (quadratic version)
function intersections(lines)
{
    // initialize needed data
    const n = lines.length;
    let points = [];
    for(const line of lines) {points.push(line.p1); points.push(line.p2);}
    let values = [];
    for(const p of points) {values.push(-p.y);}
    const getLine = initGetLine(lines);

    // sort points on y-co (reversed)
    quicksort(points, values, 0, 2*n);

    // sweep line while keeping an active set of lines
    let intersections = [];
    let active = new Set();
    for(const p of points)
    {
        const line = getLine[10000*p.x + p.y];

        if(active.has(line))
            active.delete(line);
        else
        {
            // calc intersection
            for(const line2 of active)
                if(intersect(line, line2))
                    intersections.push(intersection(line, line2));
            // activate line
            active.add(line);
        }
    }

    return intersections;
}

async function animateIntersections(lines, interval)
{
    //#############
    // draw initial lines
    canvas.lines = lines;
    resetLines();
    redrawCanvas();
    //#############
    
    // initialize needed data
    const n = lines.length;
    let points = [];
    for(const line of lines) {points.push(line.p1); points.push(line.p2);}
    let values = [];
    for(const p of points) {values.push(-p.y);}
    const getLine = initGetLine(lines);

    // sort points on y-co (reversed)
    quicksort(points, values, 0, 2*n);

    //###################
    //for(let i = 0; i < n; i++)
    //{
    //    lines[i].color = sortingColor(0, n, i);
    //    redrawCanvas();
    //    await new Promise((resolve, reject) => setTimeout(resolve, interval/3));
    //}
    //###################

    // sweep line while keeping an active set of lines
    let intersections = [];
    let active = new Set();
    for(const p of points)
    {
        //##############
        // horizontal sweep line
        canvas.sweeplines = [p.y];
        //##############

        const line = getLine[10000*p.x + p.y];

        if(active.has(line))
        {
            //################
            line.color = BLACK;
            redrawCanvas();
            await new Promise((resolve, reject) => setTimeout(resolve, interval));
            //################

            active.delete(line);
        }
        else
        {
            //################
            line.color = GREEN;
            redrawCanvas();
            await new Promise((resolve, reject) => setTimeout(resolve, interval));
            //################

            // calc intersection
            for(const line2 of active)
            {
                //################
                line2.color = LIGHT_GREEN;
                redrawCanvas();
                await new Promise((resolve, reject) => setTimeout(resolve, interval));
                //################

                if(intersect(line, line2))
                {
                    intersections.push(intersection(line, line2));

                    //################
                    const inter = intersections[intersections.length-1];
                    inter.fillColor = BLUE;
                    inter.borderColor = BLUE;
                    inter.radius *= 0.75;
                    canvas.points.push(inter);
                    redrawCanvas();
                    await new Promise((resolve, reject) => setTimeout(resolve, interval));
                    //################
                }
                
                //################
                line2.color = RED;
                //################
            }
            // activate line
            active.add(line);

            //################
            line.color = RED;
            await new Promise((resolve, reject) => setTimeout(resolve, interval));
            //################
        }
    }

    canvas.sweeplines = [];
    redrawCanvas();

    return intersections;
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

// returns the intersectionpoint of 2 crossing lines.
// intersect(line1, line2) must return true.
function intersection(line1, line2)
{
    const p1 = line1.p1;
    const p2 = line1.p2;
    const q1 = line2.p1;
    const q2 = line2.p2;

    // some basic algebra
    const m1 = (p2.y-p1.y)/(p2.x-p1.x);
    const m2 = (q2.y-q1.y)/(q2.x-q1.x);

    const a1 = m1;
    const b1 = -1;
    const c1 = -m1*p1.x + p1.y;

    const a2 = m2;
    const b2 = -1;
    const c2 = -m2*q1.x + q1.y;

    //intersection
    const x0 = (b1*c2-b2*c1)/(a1*b2-a2*b1);
    const y0 = (c1*a2-c2*a1)/(a1*b2-a2*b1);

    return new Point(x0, y0, undefined, undefined, RED, RED);
}

function initGetLine(lines)
{
    let getLine = {};
    for(const line of lines)
    {
        getLine[10000*line.p1.x + line.p1.y] = line;
        getLine[10000*line.p2.x + line.p2.y] = line;
    }
    return getLine;
}

