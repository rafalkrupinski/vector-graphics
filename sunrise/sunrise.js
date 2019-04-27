function lineIntersection(m1, b1, m2, b2) {
    if (m1 === m2) {
        throw new Error("parallel slopes");
    }
    const x = (b2 - b1) / (m1 - m2);
    return {x: x, y: m1 * x + b1};
}

function pStr(point) {
    return `${point.x},${point.y} `;
}

function PathBuilder() {
    this.path = '';
    this.spiral = function getPath(center, startRadius, spacePerLoop, startTheta, endTheta, thetaStep) {
        // Rename spiral parameters for the formula r = a + bθ
        const a = startRadius;  // start distance from center
        const b = spacePerLoop / Math.PI / 2; // space between each loop

        // convert angles to radians
        let oldTheta = newTheta = startTheta * Math.PI / 180;
        endTheta = endTheta * Math.PI / 180;
        thetaStep = thetaStep * Math.PI / 180;

        // radii
        let oldR,
            newR = a + b * newTheta;

        // start and end points
        const oldPoint = {x: 0, y: 0};
        const newPoint = {
            x: center.x + newR * Math.cos(newTheta),
            y: center.y + newR * Math.sin(newTheta)
        };

        // slopes of tangents
        let oldslope,
            newSlope = (b * Math.sin(oldTheta) + (a + b * newTheta) * Math.cos(oldTheta)) /
                (b * Math.cos(oldTheta) - (a + b * newTheta) * Math.sin(oldTheta));

        let path = "M " + pStr(newPoint);

        while (oldTheta < endTheta - thetaStep) {
            oldTheta = newTheta;
            newTheta += thetaStep;

            oldR = newR;
            newR = a + b * newTheta;

            oldPoint.x = newPoint.x;
            oldPoint.y = newPoint.y;
            newPoint.x = center.x + newR * Math.cos(newTheta);
            newPoint.y = center.y + newR * Math.sin(newTheta);

            // Slope calculation with the formula:
            // (b * sinΘ + (a + bΘ) * cosΘ) / (b * cosΘ - (a + bΘ) * sinΘ)
            const aPlusBTheta = a + b * newTheta;

            oldSlope = newSlope;
            newSlope = (b * Math.sin(newTheta) + aPlusBTheta * Math.cos(newTheta)) /
                (b * Math.cos(newTheta) - aPlusBTheta * Math.sin(newTheta));

            const oldIntercept = -(oldSlope * oldR * Math.cos(oldTheta) - oldR * Math.sin(oldTheta));
            const newIntercept = -(newSlope * newR * Math.cos(newTheta) - newR * Math.sin(newTheta));

            const controlPoint = lineIntersection(oldSlope, oldIntercept, newSlope, newIntercept);

            // Offset the control point by the center offset.
            controlPoint.x += center.x;
            controlPoint.y += center.y;

            path += "Q " + pStr(controlPoint) + pStr(newPoint);
        }

        this.end = newPoint;

        this.path += path;
    };

    this.arc = function arc(rx, ry, xAxisRotation, largeArcFlag, sweepFlag, endPoint) {
        path = `a ${rx},${ry} ${xAxisRotation} ${largeArcFlag} ${sweepFlag} ${endPoint.x},${endPoint.y}`;
        this.end = {x: this.end.x + endPoint.x, y: this.end.y + endPoint.y};
        this.path += path;
    };
    return this;
}

b = new PathBuilder();
b.spiral({x: 400, y: 400}, 90, 100, 180, 2 * 360 - 30, 45);
b.arc(100, 100, 0, 0, 0, {x: 100, y: 100});

const svg = SVG(document.rootElement);
svg.path(b.path)
    .id('path')
    .attr({fill: 'none', stroke: 'black', 'stroke-width': 3});
