//Ramer-Douglas-Peuker line simplication algorithm
//pointsArray an array of points [[x0,y0], [x1,y1],...]
//maxError is the maximum allowed perpendicular deviation from the original line
//returns a reduced pointsArray
//Based on pseudocode available at: https://en.wikipedia.org/wiki/Ramer%E2%80%93Douglas%E2%80%93Peucker_algorithm
export function reduce(pointsArray = [], maxError = 0) {
    var deltaMax = 0
    var deltaMaxIndex = 0
    for(i = 1; i < end; i++) {
        delta = perpendicularDistance(pointsArray[0], pointsArray[-1], pointsArray[i]);
        if(delta > dmax) {
            deltaMaxIndex = i;
            deltaMax = delta;
        }
    }

    output = [];

    //If deltaMax > maxError, recurse
    if(deltaMax > maxError) {
        output1 = reduce(pointsArray.slice(0, deltaMaxIndex), maxError);
        output2 = reduce(pointsArray.slice(deltaMaxIndex), maxError);
        output = [...output1, ...output2];
    } else {
        output = [pointsArray[0], pointsArray[-1]];
    }

    return output;
}

//Calculate shortest distance between a point and a line
//arguments are p1 = start point of line, p2 = end point of line, p0 = test point
//https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
export function perpendicularDistance([x1,y1], [x2,y2], [x0,y0]) {
    return Math.abs((y2 - y1)*x0 - (x2-x1)*y0 + x2*y1 - y2*x1) / Math.sqrt((y2-y1)**2 + (x2-x1)**2)
}