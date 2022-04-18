var MyPath = function () {

    function derive(v0, v1, v2, v3, t) {
        return Math.pow(1 - t, 3) * v0 +
        3 * Math.pow(1 - t, 2) * t * v1 +
        3 * (1 - t) * Math.pow(t, 2) * v2 +
        Math.pow(t, 3) * v3;
    }
    /**
     * A bounding box is an enclosing box that describes the smallest measure within which all the points lie.
     * It is used to calculate the bounding box of a glyph or text path.
     *
     * On initialization, x1/y1/x2/y2 will be NaN. Check if the bounding box is empty using `isEmpty()`.
     *
     * @exports opentype.BoundingBox
     * @class
     * @constructor
     */
    function BoundingBox() {
        this.x1 = Number.NaN;
        this.y1 = Number.NaN;
        this.x2 = Number.NaN;
        this.y2 = Number.NaN;
    }

    /**
     * Returns true if the bounding box is empty, that is, no points have been added to the box yet.
     */
    BoundingBox.prototype.isEmpty = function () {
        return isNaN(this.x1) || isNaN(this.y1) || isNaN(this.x2) || isNaN(this.y2);
    };

    /**
     * Add the point to the bounding box.
     * The x1/y1/x2/y2 coordinates of the bounding box will now encompass the given point.
     * @param {number} x - The X coordinate of the point.
     * @param {number} y - The Y coordinate of the point.
     */
    BoundingBox.prototype.addPoint = function (x, y) {
        if (typeof x === 'number') {
            if (isNaN(this.x1) || isNaN(this.x2)) {
                this.x1 = x;
                this.x2 = x;
            }
            if (x < this.x1) {
                this.x1 = x;
            }
            if (x > this.x2) {
                this.x2 = x;
            }
        }
        if (typeof y === 'number') {
            if (isNaN(this.y1) || isNaN(this.y2)) {
                this.y1 = y;
                this.y2 = y;
            }
            if (y < this.y1) {
                this.y1 = y;
            }
            if (y > this.y2) {
                this.y2 = y;
            }
        }
    };

    /**
     * Add a X coordinate to the bounding box.
     * This extends the bounding box to include the X coordinate.
     * This function is used internally inside of addBezier.
     * @param {number} x - The X coordinate of the point.
     */
    BoundingBox.prototype.addX = function (x) {
        this.addPoint(x, null);
    };

    /**
     * Add a Y coordinate to the bounding box.
     * This extends the bounding box to include the Y coordinate.
     * This function is used internally inside of addBezier.
     * @param {number} y - The Y coordinate of the point.
     */
    BoundingBox.prototype.addY = function (y) {
        this.addPoint(null, y);
    };

    /**
     * Add a Bézier curve to the bounding box.
     * This extends the bounding box to include the entire Bézier.
     * @param {number} x0 - The starting X coordinate.
     * @param {number} y0 - The starting Y coordinate.
     * @param {number} x1 - The X coordinate of the first control point.
     * @param {number} y1 - The Y coordinate of the first control point.
     * @param {number} x2 - The X coordinate of the second control point.
     * @param {number} y2 - The Y coordinate of the second control point.
     * @param {number} x - The ending X coordinate.
     * @param {number} y - The ending Y coordinate.
     */
    BoundingBox.prototype.addBezier = function (x0, y0, x1, y1, x2, y2, x, y) {
        // This code is based on http://nishiohirokazu.blogspot.com/2009/06/how-to-calculate-bezier-curves-bounding.html
        // and https://github.com/icons8/svg-path-bounding-box

        const p0 = [x0, y0];
        const p1 = [x1, y1];
        const p2 = [x2, y2];
        const p3 = [x, y];

        this.addPoint(x0, y0);
        this.addPoint(x, y);

        for (let i = 0; i <= 1; i++) {
            const b = 6 * p0[i] - 12 * p1[i] + 6 * p2[i];
            const a = -3 * p0[i] + 9 * p1[i] - 9 * p2[i] + 3 * p3[i];
            const c = 3 * p1[i] - 3 * p0[i];

            if (a === 0) {
                if (b === 0)
                    continue;
                const t = -c / b;
                if (0 < t && t < 1) {
                    if (i === 0)
                        this.addX(derive(p0[i], p1[i], p2[i], p3[i], t));
                    if (i === 1)
                        this.addY(derive(p0[i], p1[i], p2[i], p3[i], t));
                }
                continue;
            }

            const b2ac = Math.pow(b, 2) - 4 * c * a;
            if (b2ac < 0)
                continue;
            const t1 = (-b + Math.sqrt(b2ac)) / (2 * a);
            if (0 < t1 && t1 < 1) {
                if (i === 0)
                    this.addX(derive(p0[i], p1[i], p2[i], p3[i], t1));
                if (i === 1)
                    this.addY(derive(p0[i], p1[i], p2[i], p3[i], t1));
            }
            const t2 = (-b - Math.sqrt(b2ac)) / (2 * a);
            if (0 < t2 && t2 < 1) {
                if (i === 0)
                    this.addX(derive(p0[i], p1[i], p2[i], p3[i], t2));
                if (i === 1)
                    this.addY(derive(p0[i], p1[i], p2[i], p3[i], t2));
            }
        }
    };

    /**
     * Add a quadratic curve to the bounding box.
     * This extends the bounding box to include the entire quadratic curve.
     * @param {number} x0 - The starting X coordinate.
     * @param {number} y0 - The starting Y coordinate.
     * @param {number} x1 - The X coordinate of the control point.
     * @param {number} y1 - The Y coordinate of the control point.
     * @param {number} x - The ending X coordinate.
     * @param {number} y - The ending Y coordinate.
     */
    BoundingBox.prototype.addQuad = function (x0, y0, x1, y1, x, y) {
        const cp1x = x0 + 2 / 3 * (x1 - x0);
        const cp1y = y0 + 2 / 3 * (y1 - y0);
        const cp2x = cp1x + 1 / 3 * (x - x0);
        const cp2y = cp1y + 1 / 3 * (y - y0);
        this.addBezier(x0, y0, cp1x, cp1y, cp2x, cp2y, x, y);
    };

    function Path() {
        this.commands = [];
        this.fill = 'black';
        this.stroke = null;
        this.strokeWidth = 1;
    }

    /**
     * @param  {number} x
     * @param  {number} y
     */
    Path.prototype.moveTo = function (x, y) {
        this.commands.push({
            type: 'M',
            x: x,
            y: y
        });
    };

    /**
     * @param  {number} x
     * @param  {number} y
     */
    Path.prototype.lineTo = function (x, y) {
        this.commands.push({
            type: 'L',
            x: x,
            y: y
        });
    };

    /**
     * Draws cubic curve
     * @function
     * curveTo
     * @memberof opentype.Path.prototype
     * @param  {number} x1 - x of control 1
     * @param  {number} y1 - y of control 1
     * @param  {number} x2 - x of control 2
     * @param  {number} y2 - y of control 2
     * @param  {number} x - x of path point
     * @param  {number} y - y of path point
     */

    /**
     * Draws cubic curve
     * @function
     * bezierCurveTo
     * @memberof opentype.Path.prototype
     * @param  {number} x1 - x of control 1
     * @param  {number} y1 - y of control 1
     * @param  {number} x2 - x of control 2
     * @param  {number} y2 - y of control 2
     * @param  {number} x - x of path point
     * @param  {number} y - y of path point
     * @see curveTo
     */
    Path.prototype.curveTo = Path.prototype.bezierCurveTo = function (x1, y1, x2, y2, x, y) {
        this.commands.push({
            type: 'C',
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2,
            x: x,
            y: y
        });
    };

    /**
     * Draws quadratic curve
     * @function
     * quadraticCurveTo
     * @memberof opentype.Path.prototype
     * @param  {number} x1 - x of control
     * @param  {number} y1 - y of control
     * @param  {number} x - x of path point
     * @param  {number} y - y of path point
     */

    /**
     * Draws quadratic curve
     * @function
     * quadTo
     * @memberof opentype.Path.prototype
     * @param  {number} x1 - x of control
     * @param  {number} y1 - y of control
     * @param  {number} x - x of path point
     * @param  {number} y - y of path point
     */
    Path.prototype.quadTo = Path.prototype.quadraticCurveTo = function (x1, y1, x, y) {
        this.commands.push({
            type: 'Q',
            x1: x1,
            y1: y1,
            x: x,
            y: y
        });
    };

    /**
     * Closes the path
     * @function closePath
     * @memberof opentype.Path.prototype
     */

    /**
     * Close the path
     * @function close
     * @memberof opentype.Path.prototype
     */
    Path.prototype.close = Path.prototype.closePath = function () {
        this.commands.push({
            type: 'Z'
        });
    };

    /**
     * Add the given path or list of commands to the commands of this path.
     * @param  {Array} pathOrCommands - another opentype.Path, an opentype.BoundingBox, or an array of commands.
     */
    Path.prototype.extend = function (pathOrCommands) {
        if (pathOrCommands.commands) {
            pathOrCommands = pathOrCommands.commands;
        } else if (pathOrCommands instanceof BoundingBox) {
            const box = pathOrCommands;
            this.moveTo(box.x1, box.y1);
            this.lineTo(box.x2, box.y1);
            this.lineTo(box.x2, box.y2);
            this.lineTo(box.x1, box.y2);
            this.close();
            return;
        }

        Array.prototype.push.apply(this.commands, pathOrCommands);
    };

    /**
     * Calculate the bounding box of the path.
     * @returns {opentype.BoundingBox}
     */
    Path.prototype.getBoundingBox = function () {
        const box = new BoundingBox();

        let startX = 0;
        let startY = 0;
        let prevX = 0;
        let prevY = 0;
        for (let i = 0; i < this.commands.length; i++) {
            const cmd = this.commands[i];
            switch (cmd.type) {
            case 'M':
                box.addPoint(cmd.x, cmd.y);
                startX = prevX = cmd.x;
                startY = prevY = cmd.y;
                break;
            case 'L':
                box.addPoint(cmd.x, cmd.y);
                prevX = cmd.x;
                prevY = cmd.y;
                break;
            case 'Q':
                box.addQuad(prevX, prevY, cmd.x1, cmd.y1, cmd.x, cmd.y);
                prevX = cmd.x;
                prevY = cmd.y;
                break;
            case 'C':
                box.addBezier(prevX, prevY, cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y);
                prevX = cmd.x;
                prevY = cmd.y;
                break;
            case 'Z':
                prevX = startX;
                prevY = startY;
                break;
            default:
                throw new Error('Unexpected path command ' + cmd.type);
            }
        }
        if (box.isEmpty()) {
            box.addPoint(0, 0);
        }
        return box;
    };

    /**
     * Draw the path to a 2D context.
     * @param {CanvasRenderingContext2D} ctx - A 2D drawing context.
     */
    Path.prototype.draw = function (ctx) {
        ctx.beginPath();
        for (let i = 0; i < this.commands.length; i += 1) {
            const cmd = this.commands[i];
            if (cmd.type === 'M') {
                ctx.moveTo(cmd.x, cmd.y);
            } else if (cmd.type === 'L') {
                ctx.lineTo(cmd.x, cmd.y);
            } else if (cmd.type === 'C') {
                ctx.bezierCurveTo(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y);
            } else if (cmd.type === 'Q') {
                ctx.quadraticCurveTo(cmd.x1, cmd.y1, cmd.x, cmd.y);
            } else if (cmd.type === 'Z') {
                ctx.closePath();
            }
        }

        if (this.fill) {
            ctx.fillStyle = this.fill;
            ctx.fill();
        }

        if (this.stroke) {
            ctx.strokeStyle = this.stroke;
            ctx.lineWidth = this.strokeWidth;
            ctx.stroke();
        }
    };

    /**
     * Convert the Path to a string of path data instructions
     * See http://www.w3.org/TR/SVG/paths.html#PathData
     * @param  {number} [decimalPlaces=2] - The amount of decimal places for floating-point values
     * @return {string}
     */
    Path.prototype.toPathData = function (decimalPlaces) {
        decimalPlaces = decimalPlaces !== undefined ? decimalPlaces : 2;

        function floatToString(v) {
            if (Math.round(v) === v) {
                return '' + Math.round(v);
            } else {
                return v.toFixed(decimalPlaces);
            }
        }

        function packValues() {
            let s = '';
            for (let i = 0; i < arguments.length; i += 1) {
                const v = arguments[i];
                if (v >= 0 && i > 0) {
                    s += ' ';
                }

                s += floatToString(v);
            }

            return s;
        }

        let d = '';
        for (let i = 0; i < this.commands.length; i += 1) {
            const cmd = this.commands[i];
            if (cmd.type === 'M') {
                d += 'M' + packValues(cmd.x, cmd.y);
            } else if (cmd.type === 'L') {
                d += 'L' + packValues(cmd.x, cmd.y);
            } else if (cmd.type === 'C') {
                d += 'C' + packValues(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y);
            } else if (cmd.type === 'Q') {
                d += 'Q' + packValues(cmd.x1, cmd.y1, cmd.x, cmd.y);
            } else if (cmd.type === 'Z') {
                d += 'Z';
            }
        }

        return d;
    };

    /**
     * Convert the path to an SVG <path> element, as a string.
     * @param  {number} [decimalPlaces=2] - The amount of decimal places for floating-point values
     * @return {string}
     */
    Path.prototype.toSVG = function (decimalPlaces) {
        let svg = '<path d="';
        svg += this.toPathData(decimalPlaces);
        svg += '"';
        if (this.fill && this.fill !== 'black') {
            if (this.fill === null) {
                svg += ' fill="none"';
            } else {
                svg += ' fill="' + this.fill + '"';
            }
        }

        if (this.stroke) {
            svg += ' stroke="' + this.stroke + '" stroke-width="' + this.strokeWidth + '"';
        }

        svg += '/>';
        return svg;
    };

    /**
     * Convert the path to a DOM element.
     * @param  {number} [decimalPlaces=2] - The amount of decimal places for floating-point values
     * @return {SVGPathElement}
     */
    Path.prototype.toDOMElement = function (decimalPlaces) {
        const temporaryPath = this.toPathData(decimalPlaces);
        const newPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');

        newPath.setAttribute('d', temporaryPath);

        return newPath;
    };

    return new Path;
}