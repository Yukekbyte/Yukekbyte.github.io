// Graham's Scan Convex Hull algorithm
function ConvexHull(points)
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
    let sorted = [];
    for(let i = 0; i < n; i++)
    {
        if(i == min)
            sorted.push([p0, 0]);
        else
        {
            const p = points[i];
            let val = cross(p0, p01, p);
            if(p.x < p0.x)
            val = 2 - val; // angle > 90 deg
            sorted.push([p, val]);
        }   
    }

    // sort points on angle with p0
    quicksort(sorted, 0, n);

    // remove angles
    for(let i = 0; i < n; i++)
        sorted[i] = sorted[i][0];

    // graham's scan: add new point to convex hull if angle with previous points not greater than 180 deg
    //                delete second last point otherwise
    let hull = [p0, sorted[1]];
    let m, p1, p2, p3;
    let i = 1;
    while(i < n)
    {
        m = hull.length;
        p1 = hull[m-2];
        p2 = hull[m-1];
        p3 = sorted[i];
        if(cross(p2, p3, p1) <= 0)
            hull.pop();
        else
        {
            hull.push(p3);
            i++;
        }   
    }
    return hull;
}


// Returns normalized cross product of the vectors (p0,p1) and (p0,p2).
function cross(p0, p1, p2)
{
    const vx = p1.x-p0.x;
    const vy = p1.y-p0.y;
    const wx = p2.x-p0.x;
    const wy = p2.y-p0.y;
    
    return (vx*wy - vy*wx) * 1/(Math.sqrt((vx**2 + vy**2)*(wx**2+wy**2)));
}

// Classic quicksort on angle of points
function quicksort(points, start, end)
{
    if(start >= end - 1) 
        return;

    const idx = partition(points, start, end)
    quicksort(points, start, idx);
    quicksort(points, idx+1, end);
}

function partition(points, start, end)
{
    const pivot = points[start][1];

    let idx = start - 1;
    for(let i = start; i < end; i++)
    {
        if(points[i][1] <= pivot)
        {
            idx++
            [points[i], points[idx]] = [points[idx], points[i]];
        }
    }

    [points[idx], points[start]] = [points[start], points[idx]];
    return idx;
}