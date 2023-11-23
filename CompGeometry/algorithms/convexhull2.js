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
        console.log(hull);

        for(let i = 1; i < n; i++)
        {
            if(next == onHull || cross(points[next], points[onHull], points[i]) < 0)
                next = i;   
        }
        onHull = next;

    } while (onHull != min && hull.length < n)
    
    return hull;
}