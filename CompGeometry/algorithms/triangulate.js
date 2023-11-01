function triangulate(polygon)
{
    // split in y-monotone polygons
    monotones = split(polygon);

    // triangulate y-monotones
    let diagonals = [];
    for(const monotone of monotones)
    {
        // triangulate
        let localDiagonals = triangulateMonotone(monotone);

        // add diagonals of polygon
        // TODO
    }

    return diagonals;
}

function split(polygon)
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
    return diagonals;

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
        remove(helper(p));
    }

    function handleRegular(p)
    {
        if(p.y < prev(p).y) // interior right side of p (assuming counter-clockwise ordening of polygon points)
        {
            if(type(helper(p)) == MERGE)
                newDiagonal(p, helper(p));
            remove(helper(p));
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
        remove(helper(p));

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
    function remove(h)
    {
        const i = helpers.indexOf(h);
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
    let diagonals = [];
    let stack = [];

    for(const p in polygon)
    {
        // do stuff
    }

    return diagonals;
}