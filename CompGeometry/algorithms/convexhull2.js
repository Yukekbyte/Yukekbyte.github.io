// Jarvis March Convex Hull algorithm
function convexHull2(inputPoints)
{
    // copy input
    let points = [...inputPoints];
    // find lowest point
    const n = points.length;
    let min = 0;
    for(let i = 1; i < n; i++)
        if(points[i].y < points[min].y)
            min = i;

    const p0 = points[min];

    let hull = [];
    let onHull = min;
    let next;

    do
    {
        hull.push(points[onHull]);
        next = 0;

        for(let i = 1; i < n; i++)
        {
            if(next == onHull || cross(points[next], points[onHull], points[i]) < 0)
                next = i;   
        }
        onHull = next;

    } while (onHull != min && hull.length < n)
    
    return hull;
}

async function animateConvexHull2(points, interval)
{
    //#######################
    // draw initial points
    canvas.points = points;
    redrawCanvas();
    //#######################

    // find lowest point
    const n = points.length;
    let min = 0;
    for(let i = 1; i < n; i++)
        if(points[i].y < points[min].y)
            min = i;

    const p0 = points[min];

    let hull = [];
    let onHull = min;
    let next;

    do
    {
        hull.push(points[onHull]);
        next = 0;
        while(hull.includes(points[next]) && next != min)
            next++;

        //########################
        points[onHull].borderColor = LIGHT_GREEN;
        points[onHull].fillColor = LIGHT_GREEN;
        selectPoint(points[onHull], true);
        redrawCanvas();
        await delay(interval);
    
        points[next].borderColor = BLUE;
        points[next].fillColor = BLUE;

        const line = new Line(points[onHull], points[next], undefined, BLACK);
        canvas.lines.push(line);

        redrawCanvas();
        await delay(interval);
        //########################
        

        for(let i = next + 1; i < n; i++)
        {
            if(hull.includes(points[i]) && i != min)
                continue;

            //########################
            const line2 = new Line(points[next], points[i], undefined, BLUE);
            canvas.lines.push(line2);
            
            redrawCanvas();
            await delay(interval);
            //########################

            
            if(next == onHull || cross(points[next], points[onHull], points[i]) > 0)    
            {
                //########################
                points[i].borderColor = BLUE;
                points[i].fillColor = BLUE;
                if(next != onHull)
                {
                    points[next].borderColor = RED;
                    points[next].fillColor = RED;
                }
                else
                {
                    points[next].borderColor = LIGHT_GREEN;
                    points[next].fillColor = LIGHT_GREEN;
                }
                
                canvas.lines.pop();
                line.p2 = points[i];

                selectPoint(points[i], true);
                
                redrawCanvas();
                await delay(interval);
                //########################

                next = i;
            }
            else
            {
                //########################
                if(hull.includes(points[i]))
                {
                    points[i].borderColor = LIGHT_GREEN;
                    points[i].fillColor = LIGHT_GREEN;
                }
                else
                {
                    points[i].borderColor = RED;
                    points[i].fillColor = RED;
                }

                line2.color = RED;

                redrawCanvas();
                await delay(interval);

                canvas.lines.pop();
    
                redrawCanvas();
                await delay(interval);
                //########################
            }

        }

        //########################
        if(next != min)
        {
            for(const p of points)
            {
                if(!hull.includes(p))
                {
                    p.borderColor = BLACK;
                    p.fillColor = BLACK;
                }
            }

            await delay(interval);
        }

        line.color = LIGHT_GREEN;
        redrawCanvas();
        await delay(interval);
        //########################

        onHull = next;

    } while (onHull != min && hull.length < n)

    //########################
    points[min].borderColor = LIGHT_GREEN;
    points[min].fillColor = LIGHT_GREEN;

    redrawCanvas();
    await delay(3*interval);

    // redraw and fill hull
    clearCanvas();
    const hullPolygon = new Polygon(hull, false);
    canvas.points = points;
    canvas.polygons.push(hullPolygon);
    redrawCanvas();
    TIMEOUTS.clearAllTimeouts();
    //#########################
}