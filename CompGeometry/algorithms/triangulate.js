function triangulate(polygon)
{
    // split in y-monotone polygons
    let monotones = makeMonotone(polygon);

    let diagonals = [];
    // triangulate y-monotones
    for(const monotone of monotones)
    {
        // triangulate
        let localDiagonals = triangulateMonotone(monotone);

        // add its diagonals
        diagonals.push(...localDiagonals);
    }

    return [monotones, diagonals];
}

function makeMonotone(polygon)
{
    // initialize needed data
    const n = polygon.points.length;
    const START = 0;
    const END = 1;
    const REGULAR = 2;
    const SPLIT = 3;
    const MERGE = 4;
    let points = [...polygon.points]; // copy of points
    let values = [];
    for(const p of points) {values.push(-p.y);}

    // sorting points on y-co (reversed)
    quicksort(points, values, 0, n);

    // sweepline
    let diagonals = [];
    let intervals = []; // active intervals represented by edges (array of 2 consecutive points)
    let helpers = []; // helpers of intervals
    for(const p of points)
    {
        switch(type(p))
        {
            case START:
                handleStart(p);
                break;
            case END:
                handleEnd(p);
                break;
            case REGULAR:
                handleRegular(p);
                break;
            case SPLIT:
                handleSplit(p);
                break;
            case MERGE:
                handleMerge(p);
                break;
        }
    }

    // return seperate y-monotone polygons, NOT DIAGONALS
    return splitPolygon(polygon, diagonals);

    // ====
    // Handle functions
    function handleStart(p)
    {
        intervals.push([p, next(p)]);
        helpers.push(p);
    }

    function handleEnd(p)
    {
        if(type(helper(p)) == MERGE)
            newDiagonal(p, helper(p));
        removeIntervalWith(p);
    }

    function handleRegular(p)
    {
        if(p.y < prev(p).y) // interior right side of p (assuming counter-clockwise ordening of polygon points)
        {
            if(type(helper(p)) == MERGE)
                newDiagonal(p, helper(p));
            removeIntervalWith(p);
            intervals.push([p, next(p)]);
            helpers.push(p);
        }
        else                // interior left side of p
        {
            const i = leftInterval(p);
            if(type(helpers[i]) == MERGE)
                newDiagonal(p, helpers[i]);
            helpers[i] = p;
        }
    }

    function handleSplit(p)
    {
        const i = leftInterval(p);
        newDiagonal(p, helpers[i]);
        helpers[i] = p;
        intervals.push([p, next(p)]);
        helpers.push(p);
    }

    function handleMerge(p)
    {
        if(type(helper(p)) == MERGE)
            newDiagonal(p, helper(p));
        removeIntervalWith(p);

        const i = leftInterval(p);
        if(type(helpers[i]) == MERGE)
            newDiagonal(p, helpers[i]);
        helpers[i] = p;
    }

    // ====
    // Helper functions
    function next(p)
    {
        const i = polygon.points.indexOf(p);
        return polygon.points[(((i+1) % n) + n) % n];
    }

    function prev(p)
    {
        const i = polygon.points.indexOf(p);
        return polygon.points[(((i-1) % n) + n) % n]; // -1 % n := -1 -_- javascript please...
    }

    // lineair instead of binary search tree
    function helper(p)
    {
        for(let i = 0; i < intervals.length; i++)
        {
            if(intervals[i][0] == p || intervals[i][1] == p)
                return helpers[i];
        }
    }

    // lineair instead of binary search tree
    function removeIntervalWith(p)
    {
        let i = -1;
        for(let j = 0; j < intervals.length; j++)
            if(intervals[j][0] == p || intervals[j][1] == p)
                i = j;
        
        helpers.splice(i, 1);
        intervals.splice(i, 1);
    }

    // lineair instead of binary search tree
    function leftInterval(p)
    {
        let min = 0;
        let dist = 9999;

        for(let i = 0; i < intervals.length; i++)
        {
            const p1 = intervals[i][0];
            const p2 = intervals[i][1];
            const x = (p.y - p1.y)*(p2.x-p1.x)/(p2.y-p1.y) + p1.x;

            if(0 < p.x - x && p.x - x < dist)
            {
                min = i;
                dist = p.x - x;
            }
        }

        return min;
    }

    function newDiagonal(p1, p2)
    {
        const line = new Line(p1, p2);
        diagonals.push(line);
    }

    function type(p)
    {
        const angle = cross(p, next(p), prev(p)); // assuming counter-clockwise ordering of points
        const prevBelow = prev(p).y < p.y || (prev(p).y == p.y && prev(p).x > p.x);
        const nextBelow = next(p).y < p.y || (next(p).y == p.y && next(p).x > p.x);
        const prevAbove = prev(p).y > p.y || (prev(p).y == p.y && prev(p).x < p.x);
        const nextAbove = next(p).y > p.y || (next(p).y == p.y && next(p).x < p.x);

        if(angle > 0) // angle less than 180
        {
            if(prevBelow && nextBelow)
                return START;
            if(prevAbove && nextAbove)
                return END;
        }
        if(angle < 0) // angle more than 180
        {
            if(prevBelow && nextBelow)
                return SPLIT;
            if(prevAbove && nextAbove)
                return MERGE;
        }
        return REGULAR;
    }
}

function triangulateMonotone(polygon)
{
    const n = polygon.points.length;

    // find highest point
    let max = 0;
    for(let i = 1; i < n; i++)
        if(polygon.points[i].y > polygon.points[max].y)
            max = i;

    // merge left and right chains of points into one sorted list
    let points = [polygon.points[max]];
    let i = mod(max+1, n); // left chain
    let j = mod(max-1, n); // right chain

    while(points.length < n)
    {
        const left = polygon.points[i];
        const right = polygon.points[j];

        if(left.y > right.y)
        {
            points.push(left);
            i = mod(i+1, n);
        }
        else
        {
            points.push(right);
            j = mod(j-1, n);
        }
    }

    // initialize a stack
    let diagonals = [];
    let stack = [points[0], points[1]];

    for(let i = 2; i < n-1; i++)
    {
        let top = stack[stack.length-1];
        const p = points[i];

        if(chain(p) != chain(top))
        {
            // pop all points from the stack (except the last one)
            while(stack.length > 1)
            {
                let popped = stack.pop();
                newDiagonal(p, popped);
            }
            // now pop the last one aswell and push top and p.
            stack.pop();
            stack.push(top, p);
        }
        else
        {
            let popped = stack.pop(); // remove top from stack
            while(stack.length > 0 && diagonalInside(p, stack[stack.length-1], popped))
            {
                popped = stack.pop();
                newDiagonal(p, popped);
            }
            stack.push(popped, p);
        }
    }

    const pn = points[n-1];
    stack.pop();
    while(stack.length > 1)
        newDiagonal(pn, stack.pop());

    return diagonals;

    // ----------------
    // helper functions
    function mod(i, n)
    {
        return (((i) % n) + n) % n;
    }

    // returns 0 if p is on the left chain
    // returns 1 if p is on the right chain
    function chain(p)
    {
        const i = polygon.points.indexOf(p);
        if(polygon.points[(i+1)%n].y < p.y)
            return 0;
        else
            return 1;
    }

    function newDiagonal(p1, p2)
    {
        const line = new Line(p1, p2);
        diagonals.push(line);
    }

    function diagonalInside(p, onStack, popped)
    {
        if(chain(p) == 0) // left side
            return cross(p, onStack, popped) > 0;
        else // right side
            return cross(p, popped, onStack) > 0;
    }
}

// given a polygon with diagonals between vertices,
// it gives the seperate polygon objects that the diagonals split the original polygon into.
function splitPolygon(polygon, diagonals)
{
    const n = polygon.points.length;
    let polygons = [];
    let usedDiagonals = [];

    findPolygons(1, 0);

    return polygons;

    // ----------------
    // helper functions
    function findPolygons(startIdx, endIdx)
    {
        let localPolygon = [polygon.points[startIdx]];
        let i = startIdx;
        while(i != endIdx)
        {
            let other = newDiagonal(i);
            if(other != -1) // split ways if point has an unexplored diagonal
            {
                findPolygons(i, other); // way 1: don't take diagonal
                i = other; // way 2: short cut with diagonal
            }
            else
            {
                i = (i+1) % n;
            }
            localPolygon.push(polygon.points[i]);
        }
        polygons.push(new Polygon(localPolygon));
    }

    // if polygon.points[idx] is part of at least one diagonal,
    //      it returns the largest index of the opposite points of the diagonals of polygon.points[idx]
    // else
    //      it returns -1
    function newDiagonal(idx)
    {
        const point = polygon.points[idx];
        let maxIdx = -1;
        let diagonal = -1;

        for(let i = 0; i < diagonals.length; i++)
        {
            if(usedDiagonals.includes(i))
                continue;

            if(point == diagonals[i].p1)
            {
                let newIdx = polygon.points.indexOf(diagonals[i].p2);
                if(newIdx > maxIdx)
                {
                    maxIdx = newIdx;
                    diagonal = i;
                }
            }
            if(point == diagonals[i].p2)
            {
                let newIdx = polygon.points.indexOf(diagonals[i].p1);
                if(newIdx > maxIdx)
                {
                    maxIdx = newIdx;
                    diagonal = i;
                }
            }
        }

        if(maxIdx != -1)
        {
            usedDiagonals.push(diagonal);
            return maxIdx;
        }
        else
            return -1;
    }
}