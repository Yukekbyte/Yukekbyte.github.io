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
    //let oldCircles = [];
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
        
        if(event.x != undefined) // point event
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

            if(eventR != null)
                insertEvent(eventR);
        }
        else // event instanceof CircleEvent
        {
            // stop if event is not on canvas
            if(event.center.y < 0)
                break;

            let breakpLeft = event.arc.parent;
            let breakpRight = event.arc.parent;
            
            if(event.arc.parent.pRight == event.arc.point)
            {
                // search breakpRight
                while(breakpRight.pLeft != event.arc.point || breakpRight.pRight != event.arcR.point)
                    breakpRight = breakpRight.parent;

                // remove breakpLeft
                breakpLeft.leftChild.parent = breakpLeft.parent;
                if(breakpLeft.parent.leftChild == breakpLeft)
                    breakpLeft.parent.leftChild = breakpLeft.leftChild;
                else
                    breakpLeft.parent.rightChild = breakpLeft.leftChild;
                
                // change breakpRight
                breakpRight.pLeft = breakpLeft.pLeft;
                
                // fix edges
                mergeEdges(breakpLeft.looseEdge, breakpRight.looseEdge, breakpRight, event);
            }   
            else
            {
                // search breakpLeft
                while(breakpLeft.pLeft != event.arcL.point || breakpLeft.pRight != event.arc.point)
                   breakpLeft = breakpLeft.parent;

                // remove breakpRight
                breakpRight.rightChild.parent = breakpRight.parent;
                if(breakpRight.parent.rightChild == breakpRight)
                    breakpRight.parent.rightChild = breakpRight.rightChild;
                else
                    breakpRight.parent.leftChild = breakpRight.rightChild;
                
                // change breakpLeft
                breakpLeft.pRight = breakpRight.pRight;

                // fix edges
                mergeEdges(breakpRight.looseEdge, breakpLeft.looseEdge, breakpLeft, event);
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
        if(edge.pL instanceof Point && edge.pR instanceof Point)
        {
            VoronoiEdges.push(edge);
            continue;
        }
        
        let pL = edge.pL;
        if(edge.pL instanceof Breakpoint)
            pL = edge.pL.getCo(0);

        let pR = edge.pR;
        if(edge.pR instanceof Breakpoint)
            pR = edge.pR.getCo(0);

        // calculate slope and point on edge
        const m = (pR.y - pL.y)/(pR.x - pL.x);
        const p = new Point(pL.x, pL.y);

        // clamp edge sides
        if(m < 0)
        {
            if(m < -1)
            {
                // y = m(x - pL.x) + pL.y
                // x = (y - pL.y)/m + pL.x
                if(edge.pL instanceof Breakpoint)
                    edge.pL = new Point((CANVAS_HEIGHT + 10 - p.y)/m + p.x, CANVAS_HEIGHT +  10);
                if(edge.pR instanceof Breakpoint)
                    edge.pR = new Point((-10 - p.y)/m + p.x, -10);
            }
            else
            {
                if(edge.pL instanceof Breakpoint)
                    edge.pL = new Point(-10, m*(-10 - p.x) + p.y);
                if(edge.pR instanceof Breakpoint)
                    edge.pR = new Point(CANVAS_WIDTH + 10, m*(CANVAS_WIDTH + 10 - p.x) + p.y);
            }
        }
        else
        {
            if(m > 1)
            {
                // y = m(x - pL.x) + pL.y
                // x = (y - pL.y)/m + pL.x
                if(edge.pL instanceof Breakpoint)
                    edge.pL = new Point((-10 - p.y)/m + p.x, -10);
                if(edge.pR instanceof Breakpoint)
                    edge.pR = new Point((CANVAS_HEIGHT + 10 - p.y)/m + p.x, CANVAS_HEIGHT + 10);
            }
            else
            {
                if(edge.pL instanceof Breakpoint)
                    edge.pL = new Point(-10, m*(-10 - p.x) + p.y);
                if(edge.pR instanceof Breakpoint)
                    edge.pR = new Point(CANVAS_WIDTH + 10, m*(CANVAS_WIDTH + 10 - p.x) + p.y);
            }
        }

        VoronoiEdges.push(edge);
    }

    return VoronoiEdges;

    // ++++++++++++++++++++++++++
    //      HELPER FUNCTIONS
    // ++++++++++++++++++++++++++

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

        // circle event to null
        falseAlarm(walk);

        // split arc (keep circle events null but update all other circle events that this arc was linked to)
        let arcLeft = new Arc(walk.point);
        arcLeft.circleEventsR = walk.circleEventsR;
        for(const event of arcLeft.circleEventsR)
            event.arcR = arcLeft;

        let arcRight = new Arc(walk.point);
        arcRight.circleEventsL = walk.circleEventsL;
        for(const event of arcRight.circleEventsL)
            event.arcL = arcRight;

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

    function insertEvent(circleEvent)
    {
        const y = circleEvent.bottom.y;

        for(let i = 0; i < events.length; i++)
        {
            const event = events[i];
            if((event.x != undefined     && event.y < y) ||
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
        const e = arc.circleEvent;
        if(e == null)
            return;

        for(let i = 0; i < events.length; i++)
        {
            if(events[i] == e)
            {
                e.arcL.circleEventsL.splice(e.arcL.circleEventsL.indexOf(e), 1);
                e.arcR.circleEventsR.splice(e.arcR.circleEventsR.indexOf(e), 1);
                arc.circleEvent = null;
                events.splice(i, 1);
                return;
            }
        }
    }

    function mergeEdges(bpEdge, otherEdge, bp, event)
    {
        const mergePoint = event.center;
        let newEdge = new VoronoiEdge();
        
        completeSide(bpEdge, event);
        completeSide(otherEdge, event);
        
        if(bp.pLeft.y < bp.pRight.y)
        {
            newEdge.pL = mergePoint;
            newEdge.pR = bp;
        }
        else
        {
            newEdge.pR = mergePoint;
            newEdge.pL = bp;
        }
        bp.looseEdge = newEdge;

        diagram.push(newEdge);
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
        this.circleEvent = null; // event where this arc is the middle arc (can only be one)
        this.circleEventsL = []; // events where this arc is the left arc
        this.circleEventsR = []; // events where this arc is the right arc
    }
}

class VoronoiEdge
{
    constructor()
    {
        this.pL = null;
        this.pR = null;
    }
}

function findCircleEvent(arcL, arc, arcR, y)
{
    if(arcL == null || arc == null || arcR == null)
        return null;

    if(arc.circleEvent != null)
        return null;

    // create circle
    const circle = new CircleEvent(arcL, arc, arcR);

    // check diverging breakpoints
        // search breakpLeft
    let breakpLeft = arc.parent;
    while(breakpLeft.pLeft != arcL.point || breakpLeft.pRight != arc.point)
    breakpLeft = breakpLeft.parent;
        // search breakpRight
    let breakpRight = arc.parent;
    while(breakpRight.pLeft != arc.point || breakpRight.pRight != arcR.point)
        breakpRight = breakpRight.parent;

        // breakpoints diverging?
    const eps = 0.01 // TODO: other divering check needed: this METHOD is WRONG
    if(areDiverging(breakpLeft, breakpRight, y))
        return null;
    
    /*
    // check if circle event already tried
    for(const oldCircle of oldCircles)
    {
        if((circle.arcL.point == oldCircle.arcL.point || circle.arcL.point == oldCircle.arc.point || circle.arcL.point == oldCircle.arcR.point) &&
           (circle.arc.point  == oldCircle.arcL.point || circle.arc.point  == oldCircle.arc.point || circle.arc.point  == oldCircle.arcR.point) &&
           (circle.arcR.point == oldCircle.arcL.point || circle.arcR.point == oldCircle.arc.point || circle.arcR.point == oldCircle.arcR.point))
            return null;
    }

    oldCircles.push(circle);
    */

    if(circle.bottom.y > y)
        return null;
    
    arc.circleEvent = circle;
    arcL.circleEventsL.push(circle);
    arcR.circleEventsR.push(circle);

    return circle;
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

function completeSide(edge, event)
{
    const mergePoint = event.center;
    const y = event.bottom.y;

    if(edge.pL instanceof Point)   
        edge.pR = mergePoint;
    else if(edge.pR instanceof Point)
        edge.pL = mergePoint;
    else
    {
        if(dist(edge.pL.getCo(y), mergePoint) < dist(edge.pR.getCo(y), mergePoint))
            edge.pL = mergePoint;
        else
            edge.pR = mergePoint;
    }
}

function areDiverging(breakpoint1, breakpoint2, y)
{
    const eps = 0.000001;
    const p1 = breakpoint1.getCo(y-eps); // can be funky with epsilson (0.1e-5 not enough and 0.1e-7 too much)
    const p2 = breakpoint1.getCo(y-20);

    const q1 = breakpoint2.getCo(y-eps);
    const q2 = breakpoint2.getCo(y-20);

    // calculate intersection point (probability parallell almost 0)
    const m1 = (p2.y - p1.y)/(p2.x - p1.x);
    const m2 = (q2.y - q1.y)/(q2.x - q1.x);

    // m1(x - x1) + y1 = m2(x - x2) + y2 (solve for x)
    const xInter = (q1.y - p1.y + m1*p1.x - m2*q1.x)/(m1 - m2);
    const yInter = m1*(xInter - p1.x) + p1.y;

    const inter = new Point(xInter, yInter);

    // if intersection is above the the line that connects both breakpoints (at current sweepline y-co)
    // then the breakpoints are diverging.
    if(p1.x < q1.x)
        return cross(p1, q1, inter) > 0;
    else
        return cross(q1, p1, inter) > 0;
}

async function animateVoronoi(points, interval)
{
    //#######
    clearCanvas();
    canvas.points = points;
    redrawCanvas();
    //#######

    // initialize needed data
    const n = points.length;
    let events;
    let beach;
    let diagram = [];
    let values = [];
    //let oldCircles = [];
    for(const p of points) {values.push(-p.y);}

    // sort points on y-co (reversed)
    quicksort(points, values, 0, n);

    events = [...points];

    // first event manual
    const first = events.shift();
    beach = new Arc(first);

    //#######
    var nextY = CANVAS_HEIGHT;
    var bpOnScreen = false;   // we want to stop animating when no more breakpoints on screen
    var bpYetToAppear = true; // EXCEPT when there haven't been any breakpoints on screen yet (first arcs)
    //#######

    while(events.length > 0 && (bpOnScreen || bpYetToAppear))
    {
        const event = events.shift();

        // keep lowering sweepline until it passes the first event
        while((event.x != undefined && event.y < nextY) || (event instanceof CircleEvent && event.bottom.y < nextY) && bpOnScreen)
        {
            nextY -= 1;
            drawVoronoi();
            await delay(interval);
        }

        let status = handleEvent(event);
        if(status == -1)
            break;
        
        drawVoronoi();
        await delay(interval);
    }

    // keep going until all breakpoints are off screen
    while(bpOnScreen || bpYetToAppear)
    {
        nextY -= 1;
        drawVoronoi();
        await delay(interval);
    }

    // keep going until all events are handled
    while(events.length > 0)
    {
        const event = events.shift();

        let status = handleEvent(event);
        if(status == -1)
            break;
    }

    canvas.parabolas = [];
    redrawCanvas();
    console.log("stopped");

    TIMEOUTS.clearAllTimeouts();

    // ++++++++++++++++++++++++++
    //      HELPER FUNCTIONS
    // ++++++++++++++++++++++++++

    function drawVoronoi()
    {
        // sweepline
        canvas.sweeplines = [nextY];

        // edges
        bpOnScreen = false;
        let lines = [];
        for(const edge of diagram)
        {
            let line = new Line(null, null, 4);

            if(edge.pL instanceof Point)
                line.p1 = new Point(edge.pL.x, edge.pL.y);
            else
            {
                line.p1 = edge.pL.getCo(nextY);
                if(-10 <= line.p1.x && line.p1.x <= CANVAS_WIDTH + 10 &&
                   -10 <= line.p1.y && line.p1.y <= CANVAS_HEIGHT + 10)
                   bpOnScreen = true;
            }
            
            if(edge.pR instanceof Point)
                line.p2 = new Point(edge.pR.x, edge.pR.y);
            else
            {
                line.p2 = edge.pR.getCo(nextY);
                if(-10 <= line.p2.x && line.p2.x <= CANVAS_WIDTH + 10 &&
                   -10 <= line.p2.y && line.p2.y <= CANVAS_HEIGHT + 10)
                    bpOnScreen = true;
            }
            
            line.p1.radius = 0;
            line.p2.radius = 0;
            line.color = BLUE;
            lines.push(line);
        }
        canvas.lines = lines;

        // beachline
        parabolas = [];
        const arcs = depthFirstLeaves(beach);
        if(arcs.length > 0)
        {
            let p = arcs[0].point;
            let left = new Point(-10, ((-10-p.x)*(-10-p.x) + p.y*p.y - nextY*nextY) / (2*(p.y - nextY)));
            let bpLeft = null;

            for(let i = 0; i < arcs.length; i++)
            {
                const arc = arcs[i];
                const p = arc.point;
                
                let right;
                let bpRight = null;
                if(i < arcs.length - 1)
                {
                    // find next breakpoint
                    const arcR = arcs[i+1];
                    bpRight = arc.parent;
                    while(bpRight.pLeft != arc.point || bpRight.pRight != arcR.point)
                        bpRight = bpRight.parent;
                    right = bpRight.getCo(nextY);
                }
                else
                    right = new Point(CANVAS_WIDTH + 10, ((CANVAS_WIDTH+10-p.x)*(CANVAS_WIDTH+10-p.x) + p.y*p.y - nextY*nextY) / (2*(p.y - nextY)));

                // calculate control point
                let x = 0.5 * (right.x + left.x);
                let y = ((x-p.x)*(x-p.x) + p.y*p.y - nextY*nextY) / (2*(p.y - nextY));
                const control = new Point(2*x - left.x/2 - right.x/2, 2*y - left.y/2 - right.y/2);

                let color = RED;
                if(bpLeft == null || bpRight == null || bpLeft.pLeft == bpRight.pRight || areDiverging(bpLeft, bpRight, nextY))
                    color = LIGHT_GREEN;
                
                parabolas.push(new Parabola(left, control, right, 4, color));

                // new left breakpoint becomes old right breakpoint
                bpLeft = bpRight;
                left = right;
            }
        }
        
        // don't draw the first parabola if the point is still below the sweepline
        if(arcs.length == 1 && arcs[0].point.y < nextY)
            canvas.parabolas = [];
        else
            canvas.parabolas = parabolas;

        if(bpOnScreen)
            bpYetToAppear = false;

        redrawCanvas();
    }

    function handleEvent(event)
    {
        if(event.x != undefined) // point event
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

            if(eventR != null)
                insertEvent(eventR);
        }
        else // event instanceof CircleEvent
        {
            // stop if event is not on canvas
            if(event.center.y < 0)
                return -1;

            let breakpLeft = event.arc.parent;
            let breakpRight = event.arc.parent;
            
            if(event.arc.parent.pRight == event.arc.point)
            {
                // search breakpRight
                while(breakpRight.pLeft != event.arc.point || breakpRight.pRight != event.arcR.point)
                    breakpRight = breakpRight.parent;

                // remove breakpLeft
                breakpLeft.leftChild.parent = breakpLeft.parent;
                if(breakpLeft.parent.leftChild == breakpLeft)
                    breakpLeft.parent.leftChild = breakpLeft.leftChild;
                else
                    breakpLeft.parent.rightChild = breakpLeft.leftChild;
                
                // change breakpRight
                breakpRight.pLeft = breakpLeft.pLeft;
                
                // fix edges
                mergeEdges(breakpLeft.looseEdge, breakpRight.looseEdge, breakpRight, event);
            }   
            else
            {
                // search breakpLeft
                while(breakpLeft.pLeft != event.arcL.point || breakpLeft.pRight != event.arc.point)
                breakpLeft = breakpLeft.parent;

                // remove breakpRight
                breakpRight.rightChild.parent = breakpRight.parent;
                if(breakpRight.parent.rightChild == breakpRight)
                    breakpRight.parent.rightChild = breakpRight.rightChild;
                else
                    breakpRight.parent.leftChild = breakpRight.rightChild;
                
                // change breakpLeft
                breakpLeft.pRight = breakpRight.pRight;

                // fix edges
                mergeEdges(breakpRight.looseEdge, breakpLeft.looseEdge, breakpLeft, event);
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
        return 0;
    }

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

        // circle event to null
        falseAlarm(walk);

        // split arc (keep circle events null but update all other circle events that this arc was linked to)
        let arcLeft = new Arc(walk.point);
        arcLeft.circleEventsR = walk.circleEventsR;
        for(const event of arcLeft.circleEventsR)
            event.arcR = arcLeft;

        let arcRight = new Arc(walk.point);
        arcRight.circleEventsL = walk.circleEventsL;
        for(const event of arcRight.circleEventsL)
            event.arcL = arcRight;

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

    function insertEvent(circleEvent)
    {
        const y = circleEvent.bottom.y;

        for(let i = 0; i < events.length; i++)
        {
            const event = events[i];
            if((event.x != undefined     && event.y < y) ||
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
        const e = arc.circleEvent;
        if(e == null)
            return;

        for(let i = 0; i < events.length; i++)
        {
            if(events[i] == e)
            {
                e.arcL.circleEventsL.splice(e.arcL.circleEventsL.indexOf(e), 1);
                e.arcR.circleEventsR.splice(e.arcR.circleEventsR.indexOf(e), 1);
                arc.circleEvent = null;
                events.splice(i, 1);
                return;
            }
        }
    }

    function mergeEdges(bpEdge, otherEdge, bp, event)
    {
        const mergePoint = event.center;
        let newEdge = new VoronoiEdge();
        
        completeSide(bpEdge, event);
        completeSide(otherEdge, event);
        
        if(bp.pLeft.y < bp.pRight.y)
        {
            newEdge.pL = mergePoint;
            newEdge.pR = bp;
        }
        else
        {
            newEdge.pR = mergePoint;
            newEdge.pL = bp;
        }
        bp.looseEdge = newEdge;

        diagram.push(newEdge);
    }

    function depthFirstLeaves(node)
    {
        if(node instanceof Arc)
            return [node];
        else
            return depthFirstLeaves(node.leftChild).concat(depthFirstLeaves(node.rightChild));
    }
}