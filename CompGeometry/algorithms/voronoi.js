// Returns list of voronoi vertices and edges
function voronoiDiagram(inputPoints)
{
    // copy input
    let points = [...inputPoints];
    // initialize needed data
    const n = points.length;
    let events;
    let beach;
    let diagram = [];
    let values = [];
    let oldCircles = [];
    for(const p of points) {values.push(-p.y);}

    // sort points on y-co (reversed)
    quicksort(points, values, 0, n);

    events = [...points];

    // first event manual
    const first = events.shift();
    beach = new Arc(first);

    while(events.length > 0)
    {
        const event = events.shift();
        
        if(event.x != undefined)
        {
            // add new arc
            const arc = addToBeach(event);

            // look for circle event with p as left arc
            const arcL = arcLeft(arc);
            const arcLL = arcLeft(arcL);
            const eventL = findCircleEvent(arcLL, arcL, arc, event.y);

            if(eventL != null)
                insertEvent(eventL);

            // look for circle event with p as right arc
            const arcR = arcRight(arc);
            const arcRR = arcRight(arcR);
            const eventR = findCircleEvent(arc, arcR, arcRR, event.y);

            if(eventR != null && (arcLL == null || arcRR.point != arcLL.point))
                insertEvent(eventR);
        }
        else // event instanceof CircleEvent
        {
            // stop if event is not on canvas
            if(event.center.y < 0)
                break;

            let breakpLeft = event.arc.parent;
            let breakpRight = event.arc.parent;
            let newEdge = new VoronoiEdge();
            diagram.push(newEdge);
            
            if(event.arc.parent.pRight == event.arc.point)
            {
                // search breakpRight
                while(breakpRight.pLeft != event.arc.point || breakpRight.pRight != event.arcR.point)
                    breakpRight = breakpRight.parent;

                // fix edges
                mergeEdges(event, breakpLeft, breakpRight, newEdge, event.arcL.point.y < event.arcR.point.y);
                if(newEdge.pLComplete)
                    newEdge.pR = breakpRight;
                if(newEdge.pRComplete)
                    newEdge.pL = breakpRight;
                breakpRight.looseEdge = newEdge;

                // remove breakpLeft
                breakpLeft.leftChild.parent = breakpLeft.parent;
                if(breakpLeft.parent.leftChild == breakpLeft)
                    breakpLeft.parent.leftChild = breakpLeft.leftChild;
                else
                    breakpLeft.parent.rightChild = breakpLeft.leftChild;

                // change breakpRight
                breakpRight.pLeft = breakpLeft.pLeft;
            }   
            else
            {
                // search breakpLeft
                while(breakpLeft.pLeft != event.arcL.point || breakpLeft.pRight != event.arc.point)
                   breakpLeft = breakpLeft.parent;

                // fix edges
                mergeEdges(event, breakpLeft, breakpRight, newEdge, event.arcL.point.y < event.arcR.point.y);
                if(newEdge.pLComplete)
                    newEdge.pR = breakpLeft;
                else
                    newEdge.pL = breakpLeft;
                breakpLeft.looseEdge = newEdge;

                // remove breakpRight
                breakpRight.rightChild.parent = breakpRight.parent;
                if(breakpRight.parent.rightChild == breakpRight)
                    breakpRight.parent.rightChild = breakpRight.rightChild;
                else
                    breakpRight.parent.leftChild = breakpRight.rightChild;

                // change breakpLeft
                breakpLeft.pRight = breakpRight.pRight;
            }

            // circle events of neighbors of arc to null
            falseAlarm(event.arcL);
            falseAlarm(event.arcR);

            // check new circle events
            const arcLL = arcLeft(event.arcL);
            const arcRR = arcRight(event.arcR);

            const circleEventL = findCircleEvent(arcLL, event.arcL, event.arcR, event.bottom.y);
            if(circleEventL != null)
                insertEvent(circleEventL);

            const circleEventR = findCircleEvent(event.arcL, event.arcR, arcRR, event.bottom.y);
            if(circleEventR != null)
                insertEvent(circleEventR);
        }
    }

    // bound remaining loose edges
    let VoronoiEdges = [];
    for(const edge of diagram)
    {
        if(edge.pLComplete && edge.pRComplete)
        {
            VoronoiEdges.push(edge);
            continue;
        }
        
        if(!edge.pLComplete)
            edge.pL = edge.pL.getCo(0);

        if(!edge.pRComplete)
            edge.pR = edge.pR.getCo(0);

        // calculate slope and point on edge
        const m = (edge.pR.y - edge.pL.y)/(edge.pR.x - edge.pL.x);
        const p = new Point(edge.pL.x, edge.pL.y);

        // clamp edge sides
        if(m < 0)
        {
            if(m < -1)
            {
                // y = m(x - pL.x) + pL.y
                // x = (y - pL.y)/m + pL.x
                if(!edge.pLComplete)
                {
                    edge.pL.y = CANVAS_HEIGHT +  10;
                    edge.pL.x = (CANVAS_HEIGHT + 10 - p.y)/m + p.x;
                }
                if(!edge.pRComplete)
                {
                    edge.pR.y = -10;
                    edge.pR.x = (-10 - p.y)/m + p.x;
                }
            }
            else
            {
                if(!edge.pLComplete)
                {
                    edge.pL.x = -10;
                    edge.pL.y = m*(-10 - p.x) + p.y;
                }
                if(!edge.pRComplete)
                {
                    edge.pR.x = CANVAS_WIDTH + 10;
                    edge.pR.y = m*(CANVAS_WIDTH + 10 - p.x) + p.y;
                }
            }
        }
        else
        {
            if(m > 1)
            {
                // y = m(x - pL.x) + pL.y
                // x = (y - pL.y)/m + pL.x
                if(!edge.pLComplete)
                {
                    edge.pL.y = -10;
                    edge.pL.x = (-10 - p.y)/m + p.x;
                }
                if(!edge.pRComplete)
                {
                    edge.pR.y = CANVAS_HEIGHT + 10;
                    edge.pR.x = (CANVAS_HEIGHT + 10 - p.y)/m + p.x;
                }
            }
            else
            {
                if(!edge.pLComplete)
                {
                    edge.pL.x = -10;
                    edge.pL.y = m*(-10 - p.x) + p.y;
                }
                if(!edge.pRComplete)
                {
                    edge.pR.x = CANVAS_WIDTH + 10;
                    edge.pR.y = m*(CANVAS_WIDTH + 10 - p.x) + p.y;
                }
            }
        }

        VoronoiEdges.push(edge);
    }

    return VoronoiEdges;

    // ++++++++++++++++++++++++++
    //      HELPER FUNCTIONS
    // ++++++++++++++++++++++++++

    // add new arc to the beachline
    function addToBeach(point)
    {
        // search corresponding arc
        let walk = beach;
        while(walk instanceof Breakpoint)
        {
            if(point.x < walk.getCo(point.y).x)
                walk = walk.leftChild;
            else
                walk = walk.rightChild;
        }

        // split arc (keep circle events null)
        let arcLeft = new Arc(walk.point);
        let arcRight = new Arc(walk.point);

        // create new arc
        let newArc = new Arc(point);
        let looseEdge = new VoronoiEdge();
        let breakpLeft = new Breakpoint(walk.point, point, looseEdge, arcLeft, newArc, null);
        let breakpRight = new Breakpoint(point, walk.point, looseEdge, breakpLeft, arcRight, walk.parent);
        breakpLeft.parent = breakpRight;
        arcLeft.parent = breakpLeft;
        arcRight.parent = breakpRight;
        newArc.parent = breakpLeft;
        looseEdge.pL = breakpLeft;
        looseEdge.pR = breakpRight;
        diagram.push(looseEdge);

        // insert arc in beachline
        if(walk.parent != null)
        {
            if(walk.parent.leftChild == walk)
                walk.parent.leftChild = breakpRight;
            else
                walk.parent.rightChild = breakpRight;
        }
        else // arc is root
        {
            beach = breakpRight;
        }

        return newArc;
    }

    function findCircleEvent(arcL, arc, arcR, y)
    {
        if(arcL == null || arc == null || arcR == null)
            return null;

        if(arc.circleEvent != null)
            return null;

        // create circle
        const circle = new CircleEvent(arcL, arc, arcR);
        
        // check if circle event already tried
        for(const oldCircle of oldCircles)
        {
            if((circle.arcL.point == oldCircle.arcL.point || circle.arcL.point == oldCircle.arc.point || circle.arcL.point == oldCircle.arcR.point) &&
               (circle.arc.point  == oldCircle.arcL.point || circle.arc.point  == oldCircle.arc.point || circle.arc.point  == oldCircle.arcR.point) &&
               (circle.arcR.point == oldCircle.arcL.point || circle.arcR.point == oldCircle.arc.point || circle.arcR.point == oldCircle.arcR.point))
                return null;
        }

        oldCircles.push(circle);

        if(circle.bottom.y > y)
            return null;
        
        arc.circleEvent = circle;

        return circle;
    }

    function insertEvent(circleEvent)
    {
        const y = circleEvent.bottom.y;

        for(let i = 0; i < events.length; i++)
        {
            const event = events[i];
            if((event instanceof Point       && event.y < y) ||
               (event instanceof CircleEvent && event.bottom.y < y))
            {
                events.splice(i, 0, circleEvent);
                return;
            }    
        }

        events.push(circleEvent);
        return;
    }

    function falseAlarm(arc)
    {
        if(arc.circleEvent == null)
            return;

        for(let i = 0; i < events.length; i++)
        {
            if(events[i] == arc.circleEvent)
            {
                arc.circleEvent = null;
                events.splice(i, 1);
                return;
            }
        }
    }

    function arcLeft(arc)
    {
        let walk = arc;
        while(walk.parent != null && walk.parent.leftChild == walk)
            walk = walk.parent;

        // leftmost arc
        if(walk.parent == null)
            return null;
            
        walk = walk.parent.leftChild;

        while(walk instanceof Breakpoint)
            walk = walk.rightChild;

        return walk;
    }

    function arcRight(arc)
    {
        let walk = arc;
        while(walk.parent != null && walk.parent.rightChild == walk)
            walk = walk.parent;
        
        // rightmost arc
        if(walk.parent == null)
            return null;

        walk = walk.parent.rightChild;

        while(walk instanceof Breakpoint)
            walk = walk.leftChild;

        return walk;
    }

    function mergeEdges(event, bpL, bpR, newEdge, newEdgeGoesRight)
    {
        const mergePoint = event.center;
        const bot = event.bottom;

        // check which point of loose edge of bpL closer to mergePoint
        if(bpL.looseEdge.pLComplete || (!bpL.looseEdge.pRComplete &&
           Math.abs(bpL.looseEdge.pR.getCo(bot.y).x - mergePoint.x) < Math.abs(bpL.looseEdge.pL.getCo(bot.y).x - mergePoint.x)))
        {
            bpL.looseEdge.pR = mergePoint;
            bpL.looseEdge.pRComplete = true;
        }
        else
        {
            bpL.looseEdge.pL = mergePoint;
            bpL.looseEdge.pLComplete = true;
        }

        // check which point of loose edge of bpR closer to mergePoint
        if(bpR.looseEdge.pLComplete || (!bpR.looseEdge.pRComplete &&
           Math.abs(bpR.looseEdge.pR.getCo(bot.y).x - mergePoint.x) < Math.abs(bpR.looseEdge.pL.getCo(bot.y).x - mergePoint.x)))
        {
            bpR.looseEdge.pR = mergePoint;
            bpR.looseEdge.pRComplete = true;
        }
        else
        {
            bpR.looseEdge.pL = mergePoint;
            bpR.looseEdge.pLComplete = true;
        }

        // set left or right point of new edge
        if(newEdgeGoesRight)
        {
            newEdge.pL = mergePoint;
            newEdge.pLComplete = true;
        }
        else
        {
            newEdge.pR = mergePoint;
            newEdge.pRComplete = true;
        }
    }
}

class CircleEvent
{
    constructor(arcL, arc, arcR)
    {
        this.arcL = arcL;
        this.arc = arc;
        this.arcR = arcR;
        
        // calculate bottom point of circle
        const p1 = arcL.point;
        const p2 = arc.point;
        const p3 = arcR.point;

        const x1 = p1.x;
        const y1 = p1.y;
        const x2 = p2.x;
        const y2 = p2.y;
        const x3 = p3.x;
        const y3 = p3.y;

        const a = (y2 - y3)/(y1 - y2);
        const b = x2 - x3 + a*(x2 - x1);

        const x = (x2*x2 - x3*x3 + y2*y2 - y3*y3 - a*(x1*x1 - x2*x2 + y1*y1 - y2*y2))/(2*b);
        const y = (x*(x2 - x1) + (x1*x1 - x2*x2)/2 + (y1*y1 - y2*y2)/2)/(y1-y2);
        const r = Math.sqrt((x - x1)*(x - x1) + (y - y1)*(y - y1));

        this.bottom = new Point(x, y-r);
        this.center = new Point(x, y);
    }
}

class Breakpoint
{
    constructor(pLeft, pRight, looseEdge, leftChild, rightChild, parent)
    {
        this.pLeft = pLeft;
        this.pRight = pRight;
        this.looseEdge = looseEdge;
        this.leftChild = leftChild;
        this.rightChild = rightChild;
        this.parent = parent;
    }

    // Returns co of breakpoint given y-co of sweepline.
    getCo(yS)
    {
        const xL = this.pLeft.x;
        const yL = this.pLeft.y - yS;
        const xR = this.pRight.x;
        const yR = this.pRight.y - yS;

        // left parabola  y = (aL)x^2 + (bL)x + cL
        const aL = 1/(2*yL);
        const bL = -xL/yL;
        const cL = (yL*yL + xL*xL)/(2*yL);

        // right parabola y = (aR)x^2 + (bR)x + cR
        const aR = 1/(2*yR);
        const bR = -xR/yR;
        const cR = (yR*yR + xR*xR)/(2*yR);
        
        // intersection parabola
        const a = aL - aR;
        const b = bL - bR;
        const c = cL - cR;

        // the quadratic formula: a classic
        const sqrtD = Math.sqrt(b*b - 4*a*c);
        const x = (-b + sqrtD)/(2*a); // only interested in 1 solution (the breakpoint)
        const y = aL*x*x + bL*x + cL;

        return new Point(x, y + yS) // y is calculated relative to sweepline
    }
}

class Arc
{
    constructor(point)
    {
        this.point = point;
        this.parent = parent = null;
        this.circleEvent = null;
    }
}

class VoronoiEdge
{
    constructor()
    {
        this.pL = null;
        this.pR = null;
        this.pLComplete = false;
        this.pRComplete = false;
    }
}

