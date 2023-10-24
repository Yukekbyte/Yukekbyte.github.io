// Graham's Scan Convex Hull algorithm
function convexHull(points)
{
    // find lowest point
    const n = points.length;
    let min = 0;
    for(let i = 1; i < n; i++)
        if(points[i].y < points[min].y)
            min = i;

    const p0 = points[min];
    const p01 = new Point(p0.x+1,p0.y);

    // calculate angle with p0
    let values = [];
    for(let i = 0; i < n; i++)
    {
        if(i == min) 
            values.push(0);
        else
        {
            const p = points[i];
            let val = crossNorm(p0, p01, p);
            if(p.x < p0.x)
            val = 2 - val; // angle > 90 deg
            values.push(val);
        }   
    }

    // sort points on angle with p0
    quicksort(points, values, 0, n);

    // graham's scan: add new point to convex hull if angle with previous points not greater than 180 deg
    //                delete second last point otherwise
    let hull = [p0, points[1]];
    let m, p1, p2, p3;
    let i = 1;
    while(i < n)
    { 
        m = hull.length;
        p1 = hull[m-2];
        p2 = hull[m-1];
        p3 = points[i];
        if(cross(p2, p3, p1) < 0)
            hull.pop();
        else
        {
            hull.push(p3);
            i++;
        }   
    }
    return hull;
}

async function animateConvexHull(points, interval)
{
    //#######################
    // draw initial points
    canvas.points = points;
    resetPoints();
    redrawCanvas();
    // keep track of timeout count
    let k = 0;
    //#######################

    // find lowest point
    const n = points.length;
    let min = 0;
    for(let i = 1; i < n; i++)
        if(points[i].y < points[min].y)
            min = i;

    const p0 = points[min];
    const p01 = new Point(p0.x+100,p0.y);

    //########################
    // draw line through p0
    p0.borderColor = RED;
    p0.fillColor = RED;
    redrawCanvas();

    //########################

    // calculate angle with p0
    let values = [];
    for(let i = 0; i < n; i++)
    {
        if(i == min) 
            values.push(0);
        else
        {
            const p = points[i];
            let val = crossNorm(p0, p01, p);
            if(p.x < p0.x)
            val = 2 - val; // angle > 90 deg
            values.push(val);
        }   
    }

    // sort points on angle with p0
    quicksort(points, values, 0, n);

    //###################
    canvas.points = points;
    for(let i = 0; i < n; i++)
    {
        points[i].fillColor = sortingColor(0, n, i);
        points[i].borderColor = sortingColor(0, n, i);
        redrawCanvas();
        await new Promise((resolve, reject) => setTimeout(resolve, interval/3));
    }
    //#####################


    // graham's scan: add new point to convex hull if angle with previous points not greater than 180 deg
    //                delete second last point otherwise
    let hull = [p0, points[1]];
    let m, p1, p2, p3;
    let i = 2;


    //#######################
    p0.fillColor = GREEN;
    points[1].fillColor = GREEN;
    points[1].borderColor = GREEN;
    let line1 = new Line(p0, points[1]);
    canvas.lines.push(line1);
    redrawCanvas();
    await new Promise((resolve, reject) => setTimeout(resolve, interval));
    //#######################

    while(i < n)
    {
        m = hull.length;
        p1 = hull[m-2];
        p2 = hull[m-1];
        p3 = points[i];

        //#######################
        p2.fillColor = BLUE;
        p2.borderColor = BLUE;
        let line = new Line(p2, p3, undefined, BLUE);
        canvas.lines.push(line);
        redrawCanvas();
        await new Promise((resolve, reject) => setTimeout(resolve, interval));
        //#######################
     
        if(cross(p2, p3, p1) < 0)
        {
            //##########################
            p2.fillColor = RED;
            p2.borderColor = RED;
            canvas.lines[canvas.lines.length-1].color = RED;
            canvas.lines[canvas.lines.length-2].color = RED;
            redrawCanvas();

            await new Promise((resolve, reject) => setTimeout(resolve, interval));

            canvas.lines.pop();
            canvas.lines.pop();

            redrawCanvas();
            //##########################

            hull.pop();
        }
        else
        {
            //##########################
            p2.fillColor = GREEN;
            p2.borderColor = GREEN;
            canvas.lines[canvas.lines.length-1].color = BLACK;
            p3.fillColor = GREEN;
            p3.borderColor = GREEN;
            redrawCanvas();
            //##########################

            hull.push(p3);
            i++;
        }

        //#############
        await new Promise((resolve, reject) => setTimeout(resolve, interval));
        //#############
    }

    // close hull
    let closed = new Line(hull[hull.length-1], p0);
    canvas.lines.push(closed);

    //###################
    p0.borderColor = GREEN;
    redrawCanvas();
    await new Promise((resolve, reject) => setTimeout(resolve, 3*interval));

    // redraw and fill hull
    clearCanvas();
    const hullPolygon = new Polygon(hull, false, 0, LIGHT_GREEN, LIGHT_GREEN);
    canvas.points = points;
    canvas.polygons.push(hullPolygon);
    redrawCanvas();
    //####################
}