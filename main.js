/**
         * Sets a browser cookie with a given name, value, and expiration in days.
         * @param {string} name - The name of the cookie.
         * @param {string} value - The value to store in the cookie.
         * @param {number} days - The number of days until the cookie expires.
         */
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

/**
 * Retrieves the value of a cookie by its name.
 * @param {string} name - The name of the cookie to retrieve.
 * @returns {string|null} The cookie's value, or null if not found.
 */
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

/**
 * Linearly interpolates between two hexadecimal colors.
 * @param {string} a - The starting color in hex format (e.g., "#RRGGBB").
 * @param {string} b - The ending color in hex format (e.g., "#RRGGBB").
 * @param {number} amount - The interpolation amount (0.0 to 1.0).
 * @returns {string} The interpolated color in hex format.
 */
function lerpColor(a, b, amount) {
    const amt = Math.max(0, Math.min(1, amount));
    const ah = parseInt(a.slice(1), 16),
        ar = ah >> 16,
        ag = (ah >> 8) & 0xff,
        ab = ah & 0xff,
        bh = parseInt(b.slice(1), 16),
        br = bh >> 16,
        bg = (bh >> 8) & 0xff,
        bb = bh & 0xff,
        rr = Math.round(ar + amt * (br - ar)),
        rg = Math.round(ag + amt * (bg - ag)),
        rb = Math.round(ab + amt * (bb - ab));
    return '#' + (rr << 16 | rg << 8 | rb).toString(16).padStart(6, '0');
}

/**
 * Generates a color from a two-color pattern based on a time value.
 * Supports both HSL and hex color formats.
 * @param {number} t - The time value (typically 0.0 to 1.0) for the pattern.
 * @param {string} c1 - The first color (hex or HSL).
 * @param {string} c2 - The second color (hex or HSL).
 * @returns {string} The calculated color string.
 */
function getPatternColor(t, c1, c2) {
    t = (t % 1.0 + 1.0) % 1.0;
    const isHsl = c1.startsWith('hsl');
    if (isHsl) {
        const hue1 = parseFloat(c1.match(/hsl\((\d+\.?\d*)/)[1]);
        const hue2 = parseFloat(c2.match(/hsl\((\d+\.?\d*)/)[1]);
        let finalHue;
        if (t < 0.5) {
            finalHue = hue1 + (t / 0.5) * (hue2 - hue1);
        } else {
            finalHue = hue2 + ((t - 0.5) / 0.5) * (hue1 - hue2);
        }
        return `hsl(${finalHue % 360}, 100%, 50%)`;
    } else {
        if (t < 0.5) return lerpColor(c1, c2, t / 0.5);
        else return lerpColor(c2, c1, (t - 0.5) / 0.5);
    }
}

/**
 * Represents a drawable, interactive shape on the canvas.
 * Manages its own state, including position, size, appearance, and animation properties.
 */
class Shape {
    /**
     * @param {object} config - The configuration object for the shape.
     */
    constructor({
        id, name, shape, x, y, width, height, gradient, gradType,
        gradientDirection, scrollDirection, cycleColors, cycleSpeed, animationSpeed, ctx,
        innerDiameter, angularWidth, numberOfSegments, rotationSpeed, useSharpGradient, gradientStop, locked,
        numberOfRows, numberOfColumns, phaseOffset, animationMode
    }) {
        this.id = id;
        this.name = name || `Object ${id}`;
        this.shape = shape;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.gradient = gradient || { color1: '#000000', color2: '#000000' };
        this.gradType = gradType || 'solid';
        this.gradientDirection = gradientDirection || 'horizontal';
        this.scrollDirection = scrollDirection || 'right';
        this.cycleColors = cycleColors || false;
        this.cycleSpeed = cycleSpeed || 0;
        this.animationSpeed = animationSpeed || 0;
        this.animationMode = animationMode || 'loop';
        this.isReversing = false;
        this.animationState = 'scrolling';
        this.waitTimer = 0;
        this.ctx = ctx;
        this.hue1 = 0;
        this.hue2 = 90;
        this.scrollOffset = 0;
        this.innerDiameter = innerDiameter;
        this.angularWidth = angularWidth;
        this.numberOfSegments = numberOfSegments;
        this.rotationSpeed = rotationSpeed || 0;
        this.rotationAngle = 0; // The object's actual geometric rotation
        this.animationAngle = 0; // The visual-only animation angle for rings
        this.useSharpGradient = useSharpGradient !== undefined ? useSharpGradient : false;
        this.gradientStop = gradientStop !== undefined ? parseFloat(gradientStop) : 50;
        this.locked = locked || false;
        this.numberOfRows = numberOfRows || 1;
        this.numberOfColumns = numberOfColumns || 1;
        this.phaseOffset = phaseOffset || 10;
        this.cellOrder = [];
        this._shuffleCellOrder();
        this.handleSize = 8;
        this.handles = [
            { name: 'top-left', cursor: 'nwse-resize' }, { name: 'top', cursor: 'ns-resize' }, { name: 'top-right', cursor: 'nesw-resize' },
            { name: 'left', cursor: 'ew-resize' }, { name: 'right', cursor: 'ew-resize' },
            { name: 'bottom-left', cursor: 'nesw-resize' }, { name: 'bottom', cursor: 'ns-resize' }, { name: 'bottom-right', cursor: 'nwse-resize' }
        ];
        this.randomColorTimer = 0;
        this.cellColors = [];
    }

    /**
     * Shuffles the order of cells for 'bounce-random' animation mode.
     * @private
     */
    _shuffleCellOrder() {
        const totalCells = this.numberOfRows * this.numberOfColumns;
        this.cellOrder = Array.from({ length: totalCells }, (_, i) => i);
        for (let i = this.cellOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cellOrder[i], this.cellOrder[j]] = [this.cellOrder[j], this.cellOrder[i]];
        }
    }

    /**
     * Calculates the center point of the shape.
     * @returns {{x: number, y: number}} The center coordinates.
     */
    getCenter() { return { x: this.x + this.width / 2, y: this.y + this.height / 2 }; }

    /**
     * Calculates the screen positions of all resize handles.
     * @returns {Object.<string, {x: number, y: number}>} An object mapping handle names to their positions.
     */
    getHandlePositions() {
        const h2 = this.handleSize / 2;
        return {
            'top-left': { x: this.x - h2, y: this.y - h2 },
            'top': { x: this.x + this.width / 2 - h2, y: this.y - h2 },
            'top-right': { x: this.x + this.width - h2, y: this.y - h2 },
            'left': { x: this.x - h2, y: this.y + this.height / 2 - h2 },
            'right': { x: this.x + this.width - h2, y: this.y + this.height / 2 - h2 },
            'bottom-left': { x: this.x - h2, y: this.y + this.height - h2 },
            'bottom': { x: this.x + this.width / 2 - h2, y: this.y + this.height - h2 },
            'bottom-right': { x: this.x + this.width - h2, y: this.y + this.height - h2 }
        };
    }

    /**
     * Determines which resize handle, if any, is at a given point on the canvas.
     * @param {number} px - The x-coordinate to check.
     * @param {number} py - The y-coordinate to check.
     * @returns {{name: string, cursor: string}|null} The handle object or null if no handle is found.
     */
    getHandleAtPoint(px, py) {
        const handlePositions = this.getHandlePositions();
        if (this.shape === 'ring') {
            for (const handle of this.handles) {
                const pos = handlePositions[handle.name];
                if (px >= pos.x && px <= pos.x + this.handleSize && py >= pos.y && py <= pos.y + this.handleSize) {
                    return handle;
                }
            }
            return null;
        }
        const localPoint = this.getLocalPoint(px, py);
        for (const handle of this.handles) {
            const pos = handlePositions[handle.name];
            if (localPoint.x >= pos.x && localPoint.x <= pos.x + this.handleSize && localPoint.y >= pos.y && localPoint.y <= pos.y + this.handleSize) {
                return handle;
            }
        }
        return null;
    }

    /**
     * Converts world coordinates to the shape's local (rotated) coordinate system.
     * @param {number} px - The world x-coordinate.
     * @param {number} py - The world y-coordinate.
     * @returns {{x: number, y: number}} The coordinates in the shape's local space.
     */
    getLocalPoint(px, py) {
        const center = this.getCenter();
        const angle = -this.rotationAngle;
        const s = Math.sin(angle);
        const c = Math.cos(angle);
        let tempX = px - center.x;
        let tempY = py - center.y;
        const rotatedX = tempX * c - tempY * s;
        const rotatedY = tempX * s + tempY * c;
        return { x: rotatedX + center.x, y: rotatedY + center.y };
    }

    /**
     * Converts a local corner handle position to world coordinates, accounting for rotation.
     * @param {string} handleName - The name of the handle (e.g., 'top-left').
     * @returns {{x: number, y: number}} The world coordinates of the handle's center.
     */
    getWorldCoordsOfCorner(handleName) {
        const handlePositions = this.getHandlePositions();
        const h2 = this.handleSize / 2;
        const localCorner = { x: handlePositions[handleName].x + h2, y: handlePositions[handleName].y + h2 };
        if (this.shape === 'ring') {
            return localCorner;
        }
        const center = this.getCenter();
        const angle = this.rotationAngle;
        const s = Math.sin(angle);
        const c = Math.cos(angle);
        let tempX = localCorner.x - center.x;
        let tempY = localCorner.y - center.y;
        const rotatedX = tempX * c - tempY * s;
        const rotatedY = tempX * s + tempY * c;
        return { x: rotatedX + center.x, y: rotatedY + center.y };
    }

    /**
                 * Updates the animation state for the current frame (e.g., scroll offset, rotation).
                 */
    updateAnimationState() {
        if (this.cycleColors) {
            this.hue1 += this.cycleSpeed;
            this.hue2 += this.cycleSpeed;
        }

        if (this.gradType !== 'solid' && this.gradType !== 'alternating' && this.gradType !== 'random') {
            const increment = this.animationSpeed * 0.01;
            const isBounceMode = this.animationMode.includes('bounce');

            if (isBounceMode) {
                if (this.animationState === 'waiting') {
                    this.waitTimer--;
                    if (this.waitTimer <= 0) {
                        this.isReversing = !this.isReversing;
                        this.animationState = 'scrolling';

                        if (this.animationMode === 'bounce-random') {
                            this._shuffleCellOrder();
                        }
                    }
                } else if (this.animationState === 'scrolling') {
                    const bandWidth = this.gradientStop / 100.0;

                    if (this.isReversing) {
                        this.scrollOffset -= increment;
                        const lastCellIndex = Math.max(0, (this.numberOfRows * this.numberOfColumns) - 1);
                        const phaseIncrement = this.phaseOffset / 100.0;
                        const slowestCellTailPosition = this.scrollOffset + (lastCellIndex * phaseIncrement) + bandWidth;

                        if (slowestCellTailPosition <= 0.0) {
                            this.scrollOffset = 0.0 - bandWidth - (lastCellIndex * phaseIncrement);
                            this.animationState = 'waiting';
                            this.waitTimer = 30;
                        }
                    } else { // Moving forward
                        this.scrollOffset += increment;
                        const forwardBoundary = 1.0;
                        if (this.scrollOffset >= forwardBoundary) {
                            this.scrollOffset = forwardBoundary;
                            this.animationState = 'waiting';
                            this.waitTimer = 30;
                        }
                    }
                }
            } else { // Default 'loop' mode
                const directionMultiplier = (this.scrollDirection === 'right' || this.scrollDirection === 'down') ? 1 : -1;
                this.scrollOffset += increment * directionMultiplier;
                this.scrollOffset = (this.scrollOffset % 1.0 + 1.0) % 1.0;
            }
        }

        // Update the visual animation angle, not the object's actual rotationAngle
        this.animationAngle += (this.rotationSpeed / 1000);
    }

    /**
     * Creates a CanvasGradient or color string based on the current shape properties.
     * @param {number} [phase=0] - The animation phase, used for grid-based effects.
     * @returns {CanvasGradient|string} The fill style for the canvas context.
     */
    createFillStyle(phase = 0) {
        let phaseIndex = phase;
        if (this.animationMode === 'bounce-random') {
            if (this.cellOrder && this.cellOrder.length > phase) {
                phaseIndex = this.cellOrder[phase];
            }
        } else if (this.animationMode === 'bounce-reversed' && this.isReversing) {
            const lastCellIndex = Math.max(0, (this.numberOfRows * this.numberOfColumns) - 1);
            phaseIndex = lastCellIndex - phase;
        }

        const phaseIncrement = this.phaseOffset / 100.0;
        const effectiveScrollOffset = this.scrollOffset + phaseIndex * phaseIncrement;

        const p = this.animationMode === 'loop' ?
            (effectiveScrollOffset % 1.0 + 1.0) % 1.0 :
            effectiveScrollOffset;
        const c1 = this.cycleColors ? `hsl(${(this.hue1 + phase * this.phaseOffset) % 360}, 100%, 50%)` : this.gradient.color1;
        const c2 = this.cycleColors ? `hsl(${(this.hue2 + phase * this.phaseOffset) % 360}, 100%, 50%)` : this.gradient.color2;
        const isLinear = this.gradType && this.gradType.includes('linear');
        const isRadial = this.gradType && this.gradType.includes('radial');
        if (this.gradType === 'alternating') {
            return (phase % 2 === 0) ? c1 : c2;
        }
        if (isLinear) {
            let grad;
            if (this.gradientDirection === 'horizontal') {
                grad = this.ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y);
            } else {
                grad = this.ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
            }
            if (this.useSharpGradient) {
                const stopRatio = this.gradientStop / 100.0;
                if (this.animationMode === 'loop') {
                    const p1 = p;
                    const p2 = p1 + stopRatio;
                    if (p2 > 1.0) {
                        const wrapped_p2 = p2 - 1.0;
                        grad.addColorStop(0, c1);
                        grad.addColorStop(wrapped_p2, c1);
                        grad.addColorStop(wrapped_p2, c2);
                        grad.addColorStop(p1, c2);
                        grad.addColorStop(p1, c1);
                        grad.addColorStop(1, c1);
                    } else {
                        grad.addColorStop(0, c2);
                        grad.addColorStop(p1, c2);
                        grad.addColorStop(p1, c1);
                        grad.addColorStop(p2, c1);
                        grad.addColorStop(p2, c2);
                        grad.addColorStop(1, c2);
                    }
                } else {
                    const p1 = p;
                    const p2 = p1 + stopRatio;
                    const clamped_p1 = Math.max(0, Math.min(1, p1));
                    const clamped_p2 = Math.max(0, Math.min(1, p2));
                    grad.addColorStop(0, c2);
                    if (clamped_p1 > 0) grad.addColorStop(clamped_p1, c2);
                    if (clamped_p1 < clamped_p2) {
                        grad.addColorStop(clamped_p1, c1);
                        grad.addColorStop(clamped_p2, c1);
                    }
                    if (clamped_p2 < 1) grad.addColorStop(clamped_p2, c2);
                    grad.addColorStop(1, c2);
                }
            } else {
                const stops = [];
                stops.push({ pos: 0, color: getPatternColor(0 - p, c1, c2) });
                for (let i = -2; i <= 2; i++) {
                    const c1_pos = i + p;
                    const c2_pos = i + 0.5 + p;
                    if (c1_pos > 0 && c1_pos < 1) stops.push({ pos: c1_pos, color: c1 });
                    if (c2_pos > 0 && c2_pos < 1) stops.push({ pos: c2_pos, color: c2 });
                }
                stops.push({ pos: 1, color: getPatternColor(1 - p, c1, c2) });
                const uniqueStops = stops.sort((a, b) => a.pos - b.pos).filter((stop, index, self) => index === 0 || stop.pos > self[index - 1].pos);
                uniqueStops.forEach(stop => grad.addColorStop(stop.pos, stop.color));
            }
            return grad;
        } else if (isRadial) {
            const centerX = this.x + this.width / 2;
            const centerY = this.y + this.height / 2;
            const maxRadius = Math.max(this.width, this.height) / 2;
            const grad = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
            const radialP = (p % 1.0 + 1.0) % 1.0;
            const wave = 1 - Math.abs(2 * radialP - 1);
            if (this.useSharpGradient) {
                const stopPoint = (this.gradientStop / 100) * wave;
                grad.addColorStop(0, c1);
                grad.addColorStop(stopPoint, c1);
                grad.addColorStop(Math.min(1, stopPoint + 0.001), c2);
                grad.addColorStop(1, c2);
            } else {
                const gradientStopPosition = this.gradientStop / 100.0;
                const midPoint = gradientStopPosition * wave;
                grad.addColorStop(0, c1);
                grad.addColorStop(midPoint, c2);
                grad.addColorStop(1, c1);
            }
            return grad;
        }
        return c1 || 'black';
    }

    /**
     * Draws the shape on the canvas, applying animations, selections, and locked states.
     * @param {boolean} enableAnimation - Whether the global animation is enabled.
     * @param {boolean} isSelected - Whether the shape is currently selected.
     */
    draw(enableAnimation, isSelected) {
        this.ctx.save();
        if (enableAnimation) {
            this.updateAnimationState();
        }
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        // --- Draw the actual rotated shape ---
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(this.rotationAngle); // Use the geometric rotation for the object itself
        this.ctx.translate(-centerX, -centerY);

        if (this.shape === 'ring') {
            const outerRadius = this.width / 2;
            const innerRadius = this.innerDiameter / 2;
            const angleStep = (2 * Math.PI) / this.numberOfSegments;
            const segmentAngleRad = (this.angularWidth * Math.PI) / 180;
            if (innerRadius >= 0 && innerRadius < outerRadius && this.numberOfSegments > 0) {
                const isAlternating = this.gradType === 'alternating';
                const c1 = this.cycleColors ? `hsl(${this.hue1 % 360}, 100%, 50%)` : this.gradient.color1;
                const c2 = this.cycleColors ? `hsl(${this.hue2 % 360}, 100%, 50%)` : this.gradient.color2;
                const genericFill = isAlternating ? null : this.createFillStyle();
                for (let i = 0; i < this.numberOfSegments; i++) {
                    this.ctx.beginPath();
                    // Use the animationAngle for visual rotation of segments
                    const startAngle = i * angleStep + this.animationAngle;
                    const endAngle = startAngle + segmentAngleRad;
                    this.ctx.moveTo(centerX + Math.cos(startAngle) * outerRadius, centerY + Math.sin(startAngle) * outerRadius);
                    this.ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle, false);
                    this.ctx.lineTo(centerX + Math.cos(endAngle) * innerRadius, centerY + Math.sin(endAngle) * innerRadius);
                    this.ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
                    this.ctx.closePath();
                    if (isAlternating) {
                        this.ctx.fillStyle = (i % 2 === 0) ? c1 : c2;
                    } else {
                        this.ctx.fillStyle = genericFill;
                    }
                    this.ctx.fill();
                }
            }
        } else if (this.shape === 'rectangle' && (this.numberOfRows > 1 || this.numberOfColumns > 1)) {
            const cellWidth = this.width / this.numberOfColumns;
            const cellHeight = this.height / this.numberOfRows;
            const isRandom = this.gradType === 'random';
            const c1 = this.cycleColors ? `hsl(${this.hue1 % 360}, 100%, 50%)` : this.gradient.color1;
            const c2 = this.cycleColors ? `hsl(${this.hue2 % 360}, 100%, 50%)` : this.gradient.color2;
            if (isRandom && enableAnimation) {
                this.randomColorTimer -= 1;
                if (this.randomColorTimer <= 0) {
                    this.cellColors = [];
                    const rawSpeed = this.animationSpeed * 25;
                    this.randomColorTimer = Math.max(1, 200 / rawSpeed);
                }
            }
            for (let row = 0; row < this.numberOfRows; row++) {
                for (let col = 0; col < this.numberOfColumns; col++) {
                    const cellX = this.x + col * cellWidth;
                    const cellY = this.y + row * cellHeight;
                    const cellIndex = row * this.numberOfColumns + col;
                    if (isRandom) {
                        if (!this.cellColors[cellIndex]) {
                            this.cellColors[cellIndex] = Math.random() < 0.5 ? c1 : c2;
                        }
                        this.ctx.fillStyle = this.cellColors[cellIndex];
                        this.ctx.fillRect(cellX, cellY, cellWidth, cellHeight);
                    } else {
                        this.ctx.save();
                        this.ctx.beginPath();
                        this.ctx.rect(cellX, cellY, cellWidth, cellHeight);
                        this.ctx.clip();
                        this.ctx.fillStyle = this.createFillStyle(cellIndex);
                        this.ctx.fillRect(this.x, this.y, this.width, this.height);
                        this.ctx.restore();
                    }
                }
            }
        } else {
            this.ctx.beginPath();
            switch (this.shape) {
                case 'rectangle':
                    this.ctx.rect(this.x, this.y, this.width, this.height);
                    break;
                case 'circle':
                    this.ctx.arc(centerX, centerY, this.width / 2, 0, 2 * Math.PI);
                    break;
            }
            this.ctx.fillStyle = this.createFillStyle();
            this.ctx.fill();
        }

        this.ctx.restore(); // Restore from shape rotation

        if (isSelected && !this.locked) {
            const corners = [
                this.getWorldCoordsOfCorner('top-left'),
                this.getWorldCoordsOfCorner('top-right'),
                this.getWorldCoordsOfCorner('bottom-right'),
                this.getWorldCoordsOfCorner('bottom-left')
            ];
            const minX = Math.min(...corners.map(c => c.x));
            const minY = Math.min(...corners.map(c => c.y));
            const maxX = Math.max(...corners.map(c => c.x));
            const maxY = Math.max(...corners.map(c => c.y));
            const bbX = minX;
            const bbY = minY;
            const bbWidth = maxX - minX;
            const bbHeight = maxY - minY;

            this.ctx.strokeStyle = '#00f6ff';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);
            this.ctx.strokeRect(bbX, bbY, bbWidth, bbHeight);
            this.ctx.setLineDash([]);
            this.ctx.fillStyle = '#00f6ff';
            const h2 = this.handleSize / 2;
            const handlePositions = [
                { x: bbX - h2, y: bbY - h2 },
                { x: bbX + bbWidth / 2 - h2, y: bbY - h2 },
                { x: bbX + bbWidth - h2, y: bbY - h2 },
                { x: bbX - h2, y: bbY + bbHeight / 2 - h2 },
                { x: bbX + bbWidth - h2, y: bbY + bbHeight / 2 - h2 },
                { x: bbX - h2, y: bbY + bbHeight - h2 },
                { x: bbX + bbWidth / 2 - h2, y: bbY + bbHeight - h2 },
                { x: bbX + bbWidth - h2, y: bbY + bbHeight - h2 }
            ];
            handlePositions.forEach(pos => {
                this.ctx.fillRect(pos.x, pos.y, this.handleSize, this.handleSize);
            });
        }

        if (this.locked) {
            this.ctx.save();
            this.ctx.globalAlpha = 0.5;
            this.ctx.fillStyle = 'gray';
            this.ctx.fillRect(this.x, this.y, this.width, this.height);
            this.ctx.globalAlpha = 1;
            this.ctx.fillStyle = 'white';
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('🔒', centerX, centerY);
            this.ctx.restore();
        }
        this.ctx.restore();
    }

    /**
     * Determines which resize handle, if any, is at a given point on the canvas.
     * This now checks against the visual, axis-aligned handles.
     * @param {number} px - The x-coordinate to check.
     * @param {number} py - The y-coordinate to check.
     * @returns {{name: string, cursor: string}|null} The handle object or null if no handle is found.
     */
    getHandleAtPoint(px, py) {
        // Calculate the axis-aligned bounding box just like in the draw function
        const corners = [
            this.getWorldCoordsOfCorner('top-left'),
            this.getWorldCoordsOfCorner('top-right'),
            this.getWorldCoordsOfCorner('bottom-right'),
            this.getWorldCoordsOfCorner('bottom-left')
        ];
        const minX = Math.min(...corners.map(c => c.x));
        const minY = Math.min(...corners.map(c => c.y));
        const maxX = Math.max(...corners.map(c => c.x));
        const maxY = Math.max(...corners.map(c => c.y));

        const bbX = minX;
        const bbY = minY;
        const bbWidth = maxX - minX;
        const bbHeight = maxY - minY;

        const h2 = this.handleSize / 2;

        // Map visual handle positions to the original handle names/cursors
        const visualHandles = [
            { name: 'top-left', x: bbX - h2, y: bbY - h2 },
            { name: 'top', x: bbX + bbWidth / 2 - h2, y: bbY - h2 },
            { name: 'top-right', x: bbX + bbWidth - h2, y: bbY - h2 },
            { name: 'left', x: bbX - h2, y: bbY + bbHeight / 2 - h2 },
            { name: 'right', x: bbX + bbWidth - h2, y: bbY + bbHeight / 2 - h2 },
            { name: 'bottom-left', x: bbX - h2, y: bbY + bbHeight - h2 },
            { name: 'bottom', x: bbX + bbWidth / 2 - h2, y: bbY + bbHeight - h2 },
            { name: 'bottom-right', x: bbX + bbWidth - h2, y: bbY + bbHeight - h2 }
        ];

        // Check for hit on these new visual handles
        for (const handle of visualHandles) {
            if (px >= handle.x && px <= handle.x + this.handleSize && py >= handle.y && py <= handle.y + this.handleSize) {
                // Return the original handle object so the resize logic knows which one was grabbed
                return this.handles.find(h => h.name === handle.name);
            }
        }

        return null;
    }


    /**
     * Checks if a given point is inside the shape's bounding box, considering rotation.
     * @param {number} px - The x-coordinate to check.
     * @param {number} py - The y-coordinate to check.
     * @returns {boolean} True if the point is inside, false otherwise.
     */
    isPointInside(px, py) {
        const localPoint = this.getLocalPoint(px, py);
        return (localPoint.x >= this.x && localPoint.x <= this.x + this.width && localPoint.y >= this.y && localPoint.y <= this.y + this.height);
    }

    /**
     * Updates the shape's properties from a given configuration object.
     * @param {object} props - An object containing properties to update.
     */
    update(props) {
        const oldRows = this.numberOfRows;
        const oldCols = this.numberOfColumns;

        for (const key in props) {
            if (props[key] !== undefined) {
                if (key === 'gradient' && typeof props[key] === 'object' && props[key] !== null) {
                    if (props.gradient.color1 !== undefined) this.gradient.color1 = props.gradient.color1;
                    if (props.gradient.color2 !== undefined) this.gradient.color2 = props.gradient.color2;
                } else if (this.hasOwnProperty(key)) {
                    this[key] = props[key];
                }
            }
        }

        if (this.numberOfRows !== oldRows || this.numberOfColumns !== oldCols) {
            this._shuffleCellOrder();
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // --- DOM Element References ---
    const canvas = document.getElementById('signalCanvas');
    canvas.width = 1280;
    canvas.height = 800;
    const canvasContainer = document.getElementById('canvas-container');
    const ctx = canvas.getContext('2d');
    const form = document.getElementById('controls-form');
    const outputScriptArea = document.getElementById('output-script');
    const copyBtn = document.getElementById('copy-btn');
    const copyToastEl = document.getElementById('copy-toast');
    const copyToast = new bootstrap.Toast(copyToastEl);
    const toolbar = document.getElementById('toolbar');
    const addObjectBtn = document.getElementById('add-object-btn');
    const constrainBtn = document.getElementById('constrain-btn');
    const loadProjectModalEl = document.getElementById('load-project-modal');
    const loadProjectModal = new bootstrap.Modal(loadProjectModalEl);
    const loadProjectList = document.getElementById('load-project-list');
    const exportBtn = document.getElementById('export-btn');
    const saveProjectModalEl = document.getElementById('save-project-modal');
    const saveProjectModal = new bootstrap.Modal(saveProjectModalEl);
    const saveProjectNameInput = document.getElementById('save-project-name-input');
    const confirmSaveBtn = document.getElementById('confirm-save-btn');
    const existingProjectList = document.getElementById('save-project-existing-list');
    const notificationModalEl = document.getElementById('notification-modal');
    const notificationModal = new bootstrap.Modal(notificationModalEl);
    const notificationModalBody = document.getElementById('notification-modal-body');
    const confirmOverwriteModalEl = document.getElementById('confirm-overwrite-modal');
    const confirmOverwriteModal = new bootstrap.Modal(confirmOverwriteModalEl);
    const confirmOverwriteBtn = document.getElementById('confirm-overwrite-btn');

    // --- State Management ---
    let configStore = [];
    let objects = [];
    let selectedObjectIds = [];
    let isDragging = false;
    let isResizing = false;
    let activeResizeHandle = null;
    let dragStartX, dragStartY;
    let initialDragState = [];
    let constrainToCanvas = true;
    const projectPrefix = 'effectBuilderProject_';
    let verticalSplit, horizontalSplit;
    let lastHSizes, lastVSizes;
    let fps = 50;
    let fpsInterval;
    let then;
    let galleryListener = null;
    let confirmActionCallback = null;
    let lastVisibleDoc = null; // For lazy loading pagination
    let isLoadingMore = false; // To prevent multiple simultaneous loads
    let currentGalleryQuery = null; // To store the query for lazy loading

    const galleryOffcanvasEl = document.getElementById('gallery-offcanvas');
    const galleryList = document.getElementById('gallery-project-list');
    const galleryBody = galleryOffcanvasEl.querySelector('.offcanvas-body');

    /**
     * Populates the gallery panel with projects. Can append or replace content.
     * @param {Array} projects - The array of project objects to display.
     * @param {boolean} [append=false] - If true, adds projects to the end of the list.
     */
    function populateGallery(projects) {
        const galleryList = document.getElementById('gallery-project-list');
        const currentUser = window.auth.currentUser;
        galleryList.innerHTML = '';

        if (projects.length === 0) {
            galleryList.innerHTML = '<li class="list-group-item disabled">No effects found.</li>';
            return;
        }

        projects.forEach(project => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';

            const contentDiv = document.createElement('div');
            contentDiv.className = 'd-flex align-items-center flex-grow-1 me-2';

            if (project.thumbnail) {
                const img = document.createElement('img');
                img.src = project.thumbnail;
                img.style.width = '120px';
                img.style.height = '75px';
                img.style.objectFit = 'cover';
                img.className = 'rounded border me-3';
                contentDiv.appendChild(img);
            }

            const infoDiv = document.createElement('div');
            infoDiv.className = project.thumbnail ? 'ms-3' : '';

            const nameEl = document.createElement('strong');
            nameEl.textContent = project.name;
            const metaEl = document.createElement('small');
            metaEl.className = 'd-block text-body-secondary';
            const formattedDate = project.createdAt ? project.createdAt.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown Date';
            metaEl.textContent = `By ${project.creatorName || 'Anonymous'} on ${formattedDate}`;

            infoDiv.appendChild(nameEl);
            infoDiv.appendChild(metaEl);
            contentDiv.appendChild(infoDiv);
            li.appendChild(contentDiv);

            const controlsDiv = document.createElement('div');
            const loadBtn = document.createElement('button');
            loadBtn.className = 'btn btn-sm btn-outline-primary me-2';
            loadBtn.innerHTML = '<i class="bi bi-box-arrow-down"></i>';
            loadBtn.title = "Load Effect";
            loadBtn.onclick = () => {
                loadWorkspace(project);
                const galleryOffcanvas = bootstrap.Offcanvas.getInstance(galleryOffcanvasEl);
                galleryOffcanvas.hide();
                showToast(`Effect "${project.name}" loaded!`, 'success');
            };
            controlsDiv.appendChild(loadBtn);

            if (currentUser && currentUser.uid === project.userId) {
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'btn btn-sm btn-outline-danger';
                deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
                deleteBtn.title = "Delete Effect";
                deleteBtn.onclick = (e) => {
                    e.stopPropagation();
                    showConfirmModal(
                        'Delete Project',
                        `Are you sure you want to delete your project "${project.name}"? This cannot be undone.`,
                        'Delete',
                        async () => {
                            try {
                                await window.deleteDoc(window.doc(window.db, "projects", project.docId));
                                showToast(`Project "${project.name}" deleted.`, 'info');
                                li.remove();
                                if (galleryList.children.length === 0) {
                                    galleryList.innerHTML = '<li class="list-group-item disabled">No effects found.</li>';
                                }
                            } catch (error) {
                                showToast("Error deleting project.", 'danger');
                            }
                            confirmModal.hide();
                        }
                    );
                };
                controlsDiv.appendChild(deleteBtn);
            }

            li.appendChild(controlsDiv);
            galleryList.appendChild(li);
        });
    }

    // --- START: Theme Switcher Logic ---

    /**
     * Gets the saved theme from localStorage.
     * @returns {string|null} The saved theme ('light', 'dark', 'auto') or null.
     */
    const getStoredTheme = () => localStorage.getItem('theme');
    /**
     * Saves the selected theme to localStorage.
     * @param {string} theme - The theme to save.
     */
    const setStoredTheme = theme => localStorage.setItem('theme', theme);

    /**
     * Determines the preferred theme based on storage or system preference.
     * @returns {string} The preferred theme.
     */
    const getPreferredTheme = () => {
        const storedTheme = getStoredTheme();
        if (storedTheme) {
            return storedTheme;
        }
        return 'dark'; // Default to dark theme
    };

    /**
     * Applies the specified theme to the document.
     * @param {string} theme - The theme to apply ('light', 'dark', 'auto').
     */
    const setTheme = theme => {
        if (theme === 'auto') {
            document.documentElement.setAttribute('data-bs-theme', (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
        } else {
            document.documentElement.setAttribute('data-bs-theme', theme);
        }
    };

    /**
     * Updates the theme switcher UI to reflect the active theme.
     * @param {string} theme - The currently active theme.
     */
    const updateThemeSwitcherUI = (theme) => {
        const themeIcon = document.getElementById('theme-icon');
        const themeButtons = document.querySelectorAll('[data-bs-theme-value]');

        if (theme === 'auto') {
            themeIcon.className = 'bi bi-circle-half';
        } else if (theme === 'dark') {
            themeIcon.className = 'bi bi-moon-stars-fill';
        } else {
            themeIcon.className = 'bi bi-sun-fill';
        }

        themeButtons.forEach(button => {
            const checkmark = button.querySelector('.bi-check2');
            if (button.getAttribute('data-bs-theme-value') === theme) {
                button.classList.add('active');
                checkmark.classList.remove('d-none');
            } else {
                button.classList.remove('active');
                checkmark.classList.add('d-none');
            }
        });
    };

    /**
     * Fetches the next batch of projects for lazy loading.
     */
    async function loadMoreProjects() {
        if (isLoadingMore || !lastVisibleDoc) return;
        isLoadingMore = true;

        const loadingIndicator = document.createElement('li');
        loadingIndicator.className = 'list-group-item text-center loading-indicator';
        loadingIndicator.innerHTML = '<div class="spinner-border spinner-border-sm"></div>';
        galleryList.appendChild(loadingIndicator);

        const nextQuery = window.query(currentGalleryQuery, window.startAfter(lastVisibleDoc), window.limit(10));

        try {
            const querySnapshot = await window.getDocs(nextQuery);
            const newProjects = [];
            querySnapshot.forEach(doc => {
                const data = doc.data();
                if (data.createdAt && data.createdAt.toDate) data.createdAt = data.createdAt.toDate();
                newProjects.push({ docId: doc.id, ...data });
            });

            lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
            populateGallery(newProjects, true);
        } catch (error) {
            console.error("Error loading more projects:", error);
            showToast("Could not load more effects.", 'danger');
        } finally {
            isLoadingMore = false;
        }
    }

    /**
     * Initializes and shows the gallery with a specific query.
     * @param {string} title - The title for the offcanvas panel.
     * @param {Query} baseQuery - The initial Firestore query.
     */
    async function startGallery(title, baseQuery) {
        document.getElementById('galleryOffcanvasLabel').textContent = title;
        galleryList.innerHTML = '<li class="list-group-item text-center"><div class="spinner-border spinner-border-sm"></div></li>';
        isLoadingMore = true;
        currentGalleryQuery = baseQuery;

        const firstQuery = window.query(baseQuery, window.limit(10));

        try {
            const querySnapshot = await window.getDocs(firstQuery);
            const projects = [];
            querySnapshot.forEach(doc => {
                const data = doc.data();
                if (data.createdAt && data.createdAt.toDate) data.createdAt = data.createdAt.toDate();
                projects.push({ docId: doc.id, ...data });
            });

            lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
            populateGallery(projects);
        } catch (error) {
            console.error("Error loading initial projects:", error);
            galleryList.innerHTML = '<li class="list-group-item text-danger">Could not load effects.</li>';
        } finally {
            isLoadingMore = false;
        }
    }

    // Initialize theme on page load
    const initialTheme = getPreferredTheme();
    setTheme(initialTheme);
    updateThemeSwitcherUI(initialTheme);

    // Listen for changes in system theme preference
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (getPreferredTheme() === 'auto') {
            setTheme('auto');
        }
    });

    // Add click listeners to theme switcher buttons
    document.querySelectorAll('[data-bs-theme-value]').forEach(button => {
        button.addEventListener('click', () => {
            const theme = button.getAttribute('data-bs-theme-value');
            setStoredTheme(theme);
            setTheme(theme);
            updateThemeSwitcherUI(theme);
        });
    });

    // --- END: Theme Switcher Logic ---

    /**
     * Displays a notification message.
     * @param {string} message - The message to display.
     */
    function showNotification(message) {
        // This now uses the new toast system
        showToast(message, 'success');
    }

    /**
     * Parses a <meta> element into a configuration object.
     * Handles both standard property-based and custom named formats.
     * @param {HTMLMetaElement} metaElement - The meta element to parse.
     * @returns {object} A configuration object.
     */
    function parseMetaToConfig(metaElement) {
        const config = {};
        if (metaElement.hasAttribute('description')) {
            config.name = 'description';
            config.default = metaElement.getAttribute('description');
            config.type = 'text';
            config.label = 'Description';
        } else if (metaElement.hasAttribute('publisher')) {
            config.name = 'publisher';
            config.default = metaElement.getAttribute('publisher');
            config.type = 'text';
            config.label = 'Developer Name';
        } else if (metaElement.hasAttribute('title')) {
            config.name = 'title';
            config.default = metaElement.getAttribute('title');
            config.type = 'text';
            config.label = 'Effect Title';
        } else {
            for (const attr of metaElement.attributes) {
                config[attr.name] = attr.value;
            }
        }
        return config;
    }

    /**
     * Groups a flat array of configuration objects into general settings and object-specific settings.
     * @param {object[]} flatConfig - The flat array of config objects.
     * @returns {{general: object[], objects: Object.<string, object[]>}} The grouped configuration.
     */
    function groupConfigs(flatConfig) {
        const grouped = { general: [], objects: {} };
        flatConfig.forEach(config => {
            const key = config.property || config.name;
            if (key && key.startsWith('obj')) {
                const match = key.match(/^obj(\d+)_/);
                if (match) {
                    const id = match[1];
                    if (!grouped.objects[id]) grouped.objects[id] = [];
                    grouped.objects[id].push(config);
                }
            } else {
                grouped.general.push(config);
            }
        });
        return grouped;
    }

    /**
     * Creates an HTML form control element based on a configuration object.
     * @param {object} config - The configuration for the control.
     * @returns {HTMLDivElement} The generated form group element.
     */
    function createFormControl(config) {
        const { property, name, label, type, default: defaultValue, values, min, max } = config;
        const controlId = property || name;
        const formGroup = document.createElement('div');
        formGroup.className = 'mb-3';
        const labelEl = document.createElement('label');
        labelEl.htmlFor = controlId;
        labelEl.className = 'form-label';

        if (label) {
            labelEl.textContent = label.includes(':') ? label.substring(label.indexOf(':') + 1).trim() : label;
            labelEl.title = `Controls the ${label.toLowerCase()}`;
        }
        labelEl.dataset.bsToggle = 'tooltip';
        formGroup.appendChild(labelEl);

        if (type === 'number') {
            const inputGroup = document.createElement('div');
            inputGroup.className = 'd-flex align-items-center';
            const input = document.createElement('input');
            input.id = controlId;
            input.className = 'form-control';
            input.style.width = '100px';
            input.name = controlId;
            input.type = 'number';
            input.value = defaultValue;
            if (min) input.min = min;
            if (max) input.max = max;
            input.step = '1';
            const slider = document.createElement('input');
            slider.type = 'range';
            slider.className = 'form-range flex-grow-1 ms-2';
            slider.id = `${controlId}_slider`;
            slider.name = `${controlId}_slider`;
            if (min) slider.min = min;
            if (max) slider.max = max;
            slider.value = defaultValue;
            inputGroup.appendChild(input);
            inputGroup.appendChild(slider);
            formGroup.appendChild(inputGroup);
        } else if (type === 'text') {
            const input = document.createElement('input');
            input.id = controlId;
            input.className = 'form-control';
            input.name = controlId;
            input.type = 'text';
            input.value = defaultValue;
            formGroup.appendChild(input);
        } else if (type === 'combobox') {
            const vals = values.split(',');
            const select = document.createElement('select');
            select.id = controlId;
            select.className = 'form-select';
            select.name = controlId;
            vals.forEach(val => {
                const option = document.createElement('option');
                option.value = val;
                option.textContent = val.charAt(0).toUpperCase() + val.slice(1);
                if (val === defaultValue) option.selected = true;
                select.appendChild(option);
            });
            formGroup.appendChild(select);
        } else if (type === 'boolean') {
            const checkGroup = document.createElement('div');
            checkGroup.className = 'form-check form-switch';
            const check = document.createElement('input');
            check.id = controlId;
            check.type = 'checkbox';
            check.className = 'form-check-input';
            check.name = controlId;
            check.checked = (defaultValue === 'true');
            const checkLabel = document.createElement('label');
            checkLabel.className = 'form-check-label';
            checkLabel.htmlFor = controlId;
            if (label) {
                checkLabel.textContent = label.includes(':') ? label.substring(label.indexOf(':') + 1).trim() : label;
            }
            checkGroup.appendChild(check);
            checkGroup.appendChild(checkLabel);
            formGroup.appendChild(checkGroup);
        } else if (type === 'color') {
            const colorGroup = document.createElement('div');
            colorGroup.className = 'd-flex align-items-center';
            const input = document.createElement('input');
            input.id = controlId;
            input.className = 'form-control form-control-color';
            input.name = controlId;
            input.type = 'color';
            input.value = defaultValue;
            const hexInput = document.createElement('input');
            hexInput.type = 'text';
            hexInput.className = 'form-control ms-2';
            hexInput.style.width = '100px';
            hexInput.value = defaultValue;
            hexInput.id = `${controlId}_hex`;
            hexInput.name = `${controlId}_hex`;
            colorGroup.appendChild(input);
            colorGroup.appendChild(hexInput);
            formGroup.appendChild(colorGroup);
        }
        return formGroup;
    }

    /**
     * Renders the entire controls form based on the current `configStore` and `objects` state.
     * Preserves the collapsed state of panels during re-rendering.
     */
    function renderForm() {
        const existingTooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        existingTooltips.forEach(el => {
            const tooltip = bootstrap.Tooltip.getInstance(el);
            if (tooltip) tooltip.dispose();
        });

        const collapseStates = {};
        const generalCollapseEl = form.querySelector('#collapse-general');
        // On first render, generalCollapseEl is null, so this defaults to true (expanded).
        collapseStates.general = generalCollapseEl ? generalCollapseEl.classList.contains('show') : true;

        const allObjectCollapses = form.querySelectorAll('.collapse[id^="collapse-obj-"]');
        allObjectCollapses.forEach(el => {
            const fieldset = el.closest('fieldset');
            if (fieldset) {
                const id = parseInt(fieldset.dataset.objectId, 10);
                collapseStates[id] = el.classList.contains('show');
            }
        });

        form.innerHTML = '';

        const grouped = groupConfigs(configStore);

        // --- General Settings Panel ---
        const generalFieldset = document.createElement('fieldset');
        generalFieldset.className = 'border p-2 mb-3 rounded bg-body-secondary';
        const generalHeaderBar = document.createElement('div');
        generalHeaderBar.className = 'd-flex justify-content-between align-items-center w-100 px-2';
        const generalHeaderText = document.createElement('span');
        generalHeaderText.className = 'fs-5 fw-semibold';
        generalHeaderText.textContent = 'General Settings';
        generalHeaderBar.appendChild(generalHeaderText);
        const generalCollapseId = 'collapse-general';
        const generalCollapseButton = document.createElement('button');
        const showGeneral = collapseStates.general;
        generalCollapseButton.className = `btn btn-sm btn-outline-secondary ms-2 legend-button ${showGeneral ? '' : 'collapsed'} d-flex align-items-center justify-content-center p-0`;
        generalCollapseButton.style.width = '28px';
        generalCollapseButton.style.height = '28px';
        generalCollapseButton.type = 'button';
        generalCollapseButton.dataset.bsToggle = 'collapse';
        generalCollapseButton.dataset.bsTarget = `#${generalCollapseId}`;
        generalCollapseButton.setAttribute('aria-expanded', showGeneral);
        generalHeaderBar.appendChild(generalCollapseButton);
        const generalCollapseWrapper = document.createElement('div');
        generalCollapseWrapper.id = generalCollapseId;
        generalCollapseWrapper.className = `collapse p-3 ${showGeneral ? 'show' : ''}`;
        const generalSeparator = document.createElement('hr');
        generalSeparator.className = 'mt-2 mb-3';
        generalCollapseWrapper.appendChild(generalSeparator);
        grouped.general.forEach(conf => generalCollapseWrapper.appendChild(createFormControl(conf)));
        generalFieldset.appendChild(generalHeaderBar);
        generalFieldset.appendChild(generalCollapseWrapper);
        form.appendChild(generalFieldset);


        // --- Object Panels ---
        objects.forEach(obj => {
            const id = obj.id;
            const objectConfigs = grouped.objects[id];
            if (!objectConfigs) return;

            const objectName = obj.name || `Object ${id}`;
            const fieldset = document.createElement('fieldset');
            fieldset.className = 'border p-2 mb-3 rounded bg-body-secondary';
            fieldset.dataset.objectId = id;

            const headerBar = document.createElement('div');
            headerBar.className = 'd-flex align-items-center w-100 px-2';
            const dragHandle = document.createElement('div');
            dragHandle.className = 'drag-handle me-2 text-body-secondary';
            dragHandle.style.cursor = 'grab';
            dragHandle.innerHTML = '<i class="bi bi-grip-vertical"></i>';
            headerBar.appendChild(dragHandle);
            const editableArea = document.createElement('div');
            editableArea.className = 'editable-name-area d-flex align-items-center';
            const nameSpan = document.createElement('span');
            nameSpan.className = 'object-name fs-5 fw-semibold';
            nameSpan.style.minWidth = '0';
            nameSpan.contentEditable = true;
            nameSpan.dataset.id = id;
            nameSpan.textContent = objectName;
            editableArea.appendChild(nameSpan);
            const pencilIcon = document.createElement('i');
            pencilIcon.className = 'bi bi-pencil-fill ms-2';
            pencilIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                nameSpan.focus();
                const range = document.createRange();
                const selection = window.getSelection();
                range.selectNodeContents(nameSpan);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            });
            editableArea.appendChild(pencilIcon);
            headerBar.appendChild(editableArea);
            const controlsGroup = document.createElement('div');
            controlsGroup.className = 'd-flex align-items-center flex-shrink-0 ms-auto';
            const lockButton = document.createElement('button');
            const isLocked = obj.locked || false;
            lockButton.className = `btn btn-sm btn-lock ${isLocked ? 'btn-warning' : 'btn-outline-secondary'} d-flex align-items-center justify-content-center p-0 ms-2`;
            lockButton.style.width = '28px';
            lockButton.style.height = '28px';
            lockButton.type = 'button';
            lockButton.dataset.id = id;
            lockButton.dataset.bsToggle = 'tooltip';
            lockButton.title = isLocked ? 'Unlock Object' : 'Lock Object';
            lockButton.innerHTML = `<i class="bi ${isLocked ? 'bi-lock-fill' : 'bi-unlock-fill'}"></i>`;
            controlsGroup.appendChild(lockButton);
            const dropdown = document.createElement('div');
            dropdown.className = 'dropdown';
            dropdown.innerHTML = `<button class="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center p-0" style="width: 28px; height: 28px;" type="button" data-bs-toggle="dropdown" aria-expanded="false"><i class="bi bi-list fs-5"></i></button><ul class="dropdown-menu dropdown-menu-dark"><li><a class="dropdown-item btn-duplicate" href="#" data-id="${id}"><i class="bi bi-copy me-2"></i>Duplicate</a></li><li><a class="dropdown-item btn-delete text-danger" href="#" data-id="${id}"><i class="bi bi-trash me-2"></i>Delete</a></li></ul>`;
            controlsGroup.appendChild(dropdown);
            const collapseId = `collapse-obj-${id}`;
            const collapseButton = document.createElement('button');
            // On first render, collapseStates[id] is undefined, so this defaults to false (collapsed).
            // On subsequent renders, it preserves the saved state.
            const showObject = collapseStates[id] === true;
            collapseButton.className = `btn btn-sm btn-outline-secondary ms-2 legend-button ${showObject ? '' : 'collapsed'} d-flex align-items-center justify-content-center p-0`;
            collapseButton.style.width = '28px';
            collapseButton.style.height = '28px';
            collapseButton.type = 'button';
            collapseButton.dataset.bsToggle = 'collapse';
            collapseButton.dataset.bsTarget = `#${collapseId}`;
            collapseButton.setAttribute('aria-expanded', showObject);
            controlsGroup.appendChild(collapseButton);
            headerBar.appendChild(controlsGroup);

            const collapseWrapper = document.createElement('div');
            collapseWrapper.id = collapseId;
            collapseWrapper.className = `collapse p-3 ${showObject ? 'show' : ''}`;
            const separator = document.createElement('hr');
            separator.className = 'mt-2 mb-3';
            collapseWrapper.appendChild(separator);

            const groups = {
                'Transform & Shape': ['shape', 'x', 'y', 'width', 'height', 'rotationSpeed'],
                'Fill Style': ['gradType', 'useSharpGradient', 'gradientStop', 'gradColor1', 'gradColor2'],
                'Animation': ['animationMode', 'animationSpeed', 'scrollDir', 'cycleColors', 'cycleSpeed']
            };

            const shapeConf = objectConfigs.find(c => c.property.endsWith('_shape'));
            const currentShape = shapeConf ? shapeConf.default : 'rectangle';

            for (const groupName in groups) {
                const groupContainer = document.createElement('div');
                groupContainer.className = 'control-group mb-4';
                const groupHeader = document.createElement('h6');
                groupHeader.className = 'text-body-secondary border-bottom pb-1 mb-3';
                groupHeader.textContent = groupName;
                groupContainer.appendChild(groupHeader);
                const propsInGroup = groups[groupName];
                objectConfigs
                    .filter(conf => {
                        if (!conf.property) return false;
                        const propName = conf.property.substring(conf.property.indexOf('_') + 1);
                        return propsInGroup.includes(propName);
                    })
                    .forEach(conf => groupContainer.appendChild(createFormControl(conf)));
                if (groupContainer.children.length > 1) {
                    collapseWrapper.appendChild(groupContainer);
                }
            }

            const ringSettings = ['innerDiameter', 'numberOfSegments', 'angularWidth'];
            const gridSettings = ['numberOfRows', 'numberOfColumns', 'phaseOffset'];

            const ringGroup = document.createElement('div');
            ringGroup.className = 'control-group mb-4 ring-settings-group';
            ringGroup.style.display = currentShape === 'ring' ? 'block' : 'none';
            const ringHeader = document.createElement('h6');
            ringHeader.className = 'text-body-secondary border-bottom pb-1 mb-3';
            ringHeader.textContent = 'Ring Settings';
            ringGroup.appendChild(ringHeader);
            objectConfigs.filter(c => ringSettings.includes(c.property.substring(c.property.indexOf('_') + 1))).forEach(c => ringGroup.appendChild(createFormControl(c)));
            collapseWrapper.appendChild(ringGroup);

            const gridGroup = document.createElement('div');
            gridGroup.className = 'control-group mb-4 grid-settings-group';
            gridGroup.style.display = currentShape === 'rectangle' ? 'block' : 'none';
            const gridHeader = document.createElement('h6');
            gridHeader.className = 'text-body-secondary border-bottom pb-1 mb-3';
            gridHeader.textContent = 'Grid Settings';
            gridGroup.appendChild(gridHeader);
            objectConfigs.filter(c => gridSettings.includes(c.property.substring(c.property.indexOf('_') + 1))).forEach(c => gridGroup.appendChild(createFormControl(c)));
            collapseWrapper.appendChild(gridGroup);


            fieldset.appendChild(headerBar);
            fieldset.appendChild(collapseWrapper);
            form.appendChild(fieldset);
        });

        setFormValues(getControlValues());
        new bootstrap.Tooltip(document.body, { selector: "[data-bs-toggle='tooltip']", trigger: 'hover' });

        const sortable = Sortable.get(form);
        if (sortable) {
            sortable.option('store', {
                get: function () {
                    return objects.map(obj => obj.id.toString());
                },
                set: function (sortable) { }
            });
        }
    }


    /**
     * Re-numbers all object IDs and their corresponding properties in the configStore
     * based on the current order of the `objects` array. This ensures data consistency
     * after deleting or reordering objects.
     */
    function syncAndRenumberState() {
        const oldObjects = [...objects];
        const oldConfigs = [...configStore];

        const generalConfigs = oldConfigs.filter(c => !(c.property || c.name).startsWith('obj'));

        let newConfigStore = [...generalConfigs];
        let newObjects = [];

        // Iterate through the objects in their CURRENT visual order
        oldObjects.forEach((obj, index) => {
            const newId = index + 1;
            const oldId = obj.id;

            // Find the configs associated with the old ID from the original config store
            const configsToUpdate = oldConfigs.filter(c => c.property && c.property.startsWith(`obj${oldId}_`));

            // Update the object's ID itself
            obj.id = newId;

            // Update its name if it follows the default "Object X" pattern
            if (obj.name.startsWith('Object ')) {
                obj.name = `Object ${newId}`;
            }
            newObjects.push(obj);

            // Renumber the properties and labels in its configs
            const renumberedConfigs = configsToUpdate.map(conf => {
                const newConf = { ...conf };
                newConf.property = conf.property.replace(`obj${oldId}_`, `obj${newId}_`);

                const labelParts = conf.label.split(':');
                if (labelParts.length > 1) {
                    // Use the object's current name, which might have been user-edited
                    newConf.label = `${obj.name}:${labelParts.slice(1).join(':')}`;
                }
                return newConf;
            });

            newConfigStore.push(...renumberedConfigs);
        });

        // Commit the changes to the global state
        objects = newObjects;
        configStore = newConfigStore;

        // Re-render everything with the new, consistent state
        renderForm();
        updateAll();
        drawFrame();
    }

    /**
     * Initializes the Sortable.js library on the controls form to allow
     * drag-and-drop reordering of object panels.
     */
    function initializeSortable() {
        const formEl = document.getElementById('controls-form');
        new Sortable(formEl, {
            animation: 150,
            handle: '.drag-handle',
            draggable: 'fieldset[data-object-id]',
            onEnd: function (evt) {
                if (evt.oldIndex === evt.newIndex) return;

                // Get the new order of object IDs from the DOM
                const fieldsets = Array.from(formEl.querySelectorAll('fieldset[data-object-id]'));
                const newOrderedIds = fieldsets.map(fieldset => parseInt(fieldset.dataset.objectId, 10));

                // Reorder the main `objects` array to match the new visual order
                const reorderedObjects = newOrderedIds.map(id => objects.find(o => o.id === id)).filter(Boolean);
                objects = reorderedObjects;

                // Now, call the function to re-number all IDs and properties based on this new order
                syncAndRenumberState();
            }
        });
    }


    /**
      * Retrieves all current values from the form controls.
      * @returns {object} An object mapping control IDs to their current values.
      */
    function getControlValues() {
        const data = {};
        configStore.forEach(conf => {
            const key = conf.property || conf.name;
            const el = form.elements[key];
            if (el) {
                if (el.type === 'checkbox') {
                    data[key] = el.checked;
                } else if (el.type === 'number') {
                    const value = el.value;
                    data[key] = value === '' ? 0 : parseFloat(value);
                } else {
                    data[key] = el.value;
                }
            }
        });
        return data;
    }


    /**
     * Sets the values of form controls based on a data object.
     * @param {object} data - An object mapping control IDs to values.
     */
    function setFormValues(data) {
        for (const key in data) {
            const el = form.elements[key];
            if (el) {
                if (el.type === 'checkbox') {
                    el.checked = data[key];
                } else {
                    el.value = data[key];
                }
            }
        }
        updateAll();
    }

    /**
     * Builds an array of shape state objects from the current form values.
     * @returns {object[]} An array of state objects for all shapes.
     */
    function buildStatesFromConfig() {
        const values = getControlValues();
        const grouped = groupConfigs(configStore);
        const finalStates = [];

        objects.forEach(obj => {
            const id = obj.id;
            if (!grouped.objects[id]) return;

            const existingObject = obj;
            const config = {
                id: parseInt(id),
                gradient: {},
                name: existingObject.name,
                locked: existingObject.locked
            };

            grouped.objects[id].forEach(conf => {
                let key = conf.property.replace(`obj${id}_`, '');
                let value = values[conf.property];
                const type = conf.type;
                if (type === 'number') value = parseFloat(value);
                else if (type === 'boolean') value = (value === true || value === 'true');

                if (key.startsWith('gradColor')) {
                    config.gradient[key.replace('grad', '').toLowerCase()] = value;
                } else if (key === 'scrollDir') {
                    config.scrollDirection = value;
                } else {
                    config[key] = value;
                }
            });

            config.gradientDirection = (config.scrollDirection === 'up' || config.scrollDirection === 'down') ? 'vertical' : 'horizontal';
            config.cycleSpeed = (config.cycleSpeed || 0) / 50.0;
            const speed = config.animationSpeed || 0;
            config.animationSpeed = speed / 10.0;
            if (config.shape === 'ring') {
                config.height = config.width;
            }
            finalStates.push(config);
        });

        return finalStates;
    }

    /**
     * Generates the HTML <meta> tag block based on current form values and updates the output textarea.
     */
    function generateOutputScript() {
        const values = getControlValues();
        let scriptHTML = '';
        configStore.forEach(config => {
            const propOrName = config.property || config.name;
            if (!propOrName) return;

            const value = values[propOrName];
            let line = '';

            // Check if it's a general setting like 'title', 'description', or 'publisher'
            if (config.name && !config.property) {
                // Use the new format: <meta name="value"/>
                line = `<meta ${config.name}="${value}" />\n`;
            } else {
                // It's an object property, use the old format with all attributes
                const attrs = Object.keys(config)
                    .filter(attr => attr !== 'default')
                    .map(attrName => `${attrName}="${config[attrName]}"`)
                    .join(' ');
                line = `<meta ${attrs} default="${value}" />\n`;
            }
            scriptHTML += line;
        });
        outputScriptArea.value = scriptHTML.trim();
    }

    form.addEventListener('blur', (e) => {
        if (e.target.classList.contains('object-name')) {
            const id = parseInt(e.target.dataset.id, 10);
            const newName = e.target.textContent || 'Unnamed';
            const obj = objects.find(o => o.id === id);
            if (obj) {
                obj.name = newName;
                configStore.forEach(conf => {
                    if (conf.property && conf.property.startsWith(`obj${id}_`)) {
                        const labelParts = conf.label.split(':');
                        conf.label = `${newName}:${labelParts[1]}`;
                    }
                });
                generateOutputScript();
            }
        }
    }, true);

    /**
     * Converts mouse event coordinates to canvas-local coordinates.
     * @param {MouseEvent} event - The mouse event.
     * @returns {{x: number, y: number}} The coordinates relative to the canvas.
     */
    function getCanvasCoordinates(event) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;
        return { x, y };
    }

    /**
     * Enables or disables toolbar buttons based on the current selection.
     */
    function updateToolbarState() {
        const multiSelectButtons = toolbar.querySelectorAll('[data-action^="match-"]');
        const singleSelectButtons = toolbar.querySelectorAll('[data-action^="align-screen-"], [data-action="fit-canvas"]');
        singleSelectButtons.forEach(btn => btn.disabled = selectedObjectIds.length === 0);
        multiSelectButtons.forEach(btn => btn.disabled = selectedObjectIds.length < 2);
    }

    /**
     * Updates the form control values to match the state of the shape objects on the canvas.
     * This function is called after any direct manipulation on the canvas (drag, resize).
     */
    function updateFormFromShapes() {
        objects.forEach(obj => {
            const prefix = `obj${obj.id}_`;
            // Add 'innerDiameter' to the list of fields to sync with the form.
            const fields = ['x', 'y', 'width', 'height', 'innerDiameter'];
            fields.forEach(field => {
                const input = form.elements[`${prefix}${field}`];
                if (input) {
                    // Update the number input with the rounded value.
                    input.value = Math.round(obj[field]);
                    // Also update the corresponding range slider if it exists.
                    const slider = form.elements[`${prefix}${field}_slider`];
                    if (slider) { slider.value = Math.round(obj[field]); }
                }
            });
        });
        // Regenerate the output script to reflect the changes.
        generateOutputScript();
    }

    /**
     * Clears the canvas and redraws all shapes.
     */
    function drawFrame() {
        const values = getControlValues();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const enableAnimation = values['enableAnimation'] === true;

        // Iterate backwards through the objects array. This draws the object
        // at the bottom of the list (last index) first. The object at the top of the list
        // is drawn last, making it appear visually on top.
        for (let i = objects.length - 1; i >= 0; i--) {
            const obj = objects[i];
            const isSelected = selectedObjectIds.includes(obj.id);
            obj.draw(enableAnimation, isSelected);
        }
    }

    /**
     * The main animation loop, called via requestAnimationFrame, and throttled to a specific FPS.
     */
    function animate(timestamp) {
        requestAnimationFrame(animate);

        const now = timestamp;
        const elapsed = now - then;

        // if enough time has elapsed, draw the next frame
        if (elapsed > fpsInterval) {
            // Get ready for next frame by setting then=now, but also adjust for your
            // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
            then = now - (elapsed % fpsInterval);

            const values = getControlValues();
            if (values.enableAnimation || isDragging || isResizing) {
                drawFrame();
            }
        }
    }

    /**
     * Updates shape objects based on the current form values.
     */
    function updateShapesFromForm() {
        const newStates = buildStatesFromConfig();
        const newObjects = [];
        newStates.forEach(state => {
            const existingObj = objects.find(o => o.id === state.id);
            if (existingObj) {
                existingObj.update(state);
                newObjects.push(existingObj);
            } else {
                newObjects.push(new Shape({ ...state, ctx }));
            }
        });
        objects = newObjects;
    }

    /**
     * A master update function that syncs the shapes from the form and regenerates the output script.
     */
    function updateAll() {
        updateShapesFromForm();
        generateOutputScript();
    }

    /**
     * Expands the control panel for the currently selected object and collapses others.
     */
    function syncPanelsWithSelection() {
        const allCollapses = form.querySelectorAll('.collapse');
        allCollapses.forEach(el => {
            const instance = bootstrap.Collapse.getInstance(el) || new bootstrap.Collapse(el, { toggle: false });
            const fieldset = el.closest('fieldset');
            if (!fieldset) return;
            const id = parseInt(fieldset.dataset.objectId, 10);
            if (selectedObjectIds.length === 1 && selectedObjectIds[0] === id) {
                instance.show();
            } else {
                instance.hide();
            }
        });
    }

    /**
     * Creates the initial set of Shape objects based on the `configStore`.
     */
    function createInitialObjects() {
        const grouped = groupConfigs(configStore);
        const initialStates = [];
        Object.keys(grouped.objects).forEach(id => {
            const config = { id: parseInt(id), gradient: {} };
            const representativeConfig = grouped.objects[id][0];
            if (representativeConfig && representativeConfig.label.includes(':')) {
                config.name = representativeConfig.label.split(':')[0];
            }

            grouped.objects[id].forEach(conf => {
                const key = conf.property.replace(`obj${id}_`, '');
                let value = conf.default;
                const type = conf.type;
                if (type === 'number') value = parseFloat(value);
                else if (type === 'boolean') value = (value === 'true');
                if (key.startsWith('gradColor')) {
                    config.gradient[key.replace('grad', '').toLowerCase()] = value;
                } else if (key === 'scrollDir') {
                    config.scrollDirection = value;
                } else {
                    config[key] = value;
                }
            });
            config.gradType = config.gradType || 'solid';
            config.gradient = config.gradient.color1 ? config.gradient : { color1: '#000000', color2: '#000000' };
            config.useSharpGradient = config.useSharpGradient !== undefined ? config.useSharpGradient : false;
            config.gradientStop = config.gradientStop !== undefined ? parseFloat(config.gradientStop) : 50;
            config.gradientDirection = (config.scrollDirection === 'up' || config.scrollDirection === 'down') ? 'vertical' : 'horizontal';
            config.cycleSpeed = (config.cycleSpeed || 0) / 50.0;
            const speed = config.animationSpeed || 0;
            config.animationSpeed = speed / 10.0;
            if (config.shape === 'ring') {
                config.height = config.width;
            }
            initialStates.push(config);
        });
        objects = initialStates.map(state => new Shape({ ...state, ctx }));
    }

    /**
     * Loads a workspace state from a provided object.
     * @param {object} workspace - The workspace object to load.
     * @param {object[]} workspace.configs - The array of configuration objects.
     * @param {object[]} workspace.objects - The array of saved object states (name, id, locked).
     */
    function loadWorkspace(workspace) {
        configStore = workspace.configs;
        createInitialObjects();

        if (workspace.objects) {
            workspace.objects.forEach(savedObj => {
                const obj = objects.find(o => o.id === savedObj.id);
                if (obj) {
                    obj.name = savedObj.name;
                    obj.locked = savedObj.locked || false;
                }
            });
        }
        renderForm();

        for (const config of configStore) {
            const key = config.property || config.name;
            const el = form.elements[key];
            if (el) {
                if (el.type === 'checkbox') {
                    el.checked = (config.default === true || config.default === 'true');
                } else {
                    el.value = config.default;
                }
                if (el.type === 'number') {
                    const slider = document.getElementById(`${el.id}_slider`);
                    if (slider) slider.value = el.value;
                }
                if (el.type === 'color') {
                    const hexInput = document.getElementById(`${el.id}_hex`);
                    if (hexInput) hexInput.value = el.value;
                }
            }
        }
        updateAll();
        drawFrame();
    }

    /**
     * Gets the name of the handle opposite to the given one.
     * @param {string} handleName - The name of the handle (e.g., 'top-left').
     * @returns {string} The name of the opposite handle (e.g., 'bottom-right').
     */
    function getOppositeHandle(handleName) {
        let opposite = handleName;
        if (handleName.includes('top')) {
            opposite = opposite.replace('top', 'bottom');
        } else if (handleName.includes('bottom')) {
            opposite = opposite.replace('bottom', 'top');
        }
        if (handleName.includes('left')) {
            opposite = opposite.replace('left', 'right');
        } else if (handleName.includes('right')) {
            opposite = opposite.replace('right', 'left');
        }
        return opposite;
    }

    /**
     * Generates a default set of configuration properties for a new object.
     * @param {number} newId - The ID for the new object.
     * @returns {object[]} An array of default configuration objects.
     */
    function getDefaultObjectConfig(newId) {
        return [
            { property: `obj${newId}_shape`, label: `Object ${newId}: Shape`, type: 'combobox', default: 'rectangle', values: 'rectangle,circle,ring' },
            { property: `obj${newId}_x`, label: `Object ${newId}: X Position`, type: 'number', default: '10', min: '0', max: '1280' },
            { property: `obj${newId}_y`, label: `Object ${newId}: Y Position`, type: 'number', default: '10', min: '0', max: '800' },
            { property: `obj${newId}_width`, label: `Object ${newId}: Width/Outer Diameter`, type: 'number', default: '200', min: '10', max: '1280' },
            { property: `obj${newId}_height`, label: `Object ${newId}: Height`, type: 'number', default: '150', min: '10', max: '800' },
            { property: `obj${newId}_innerDiameter`, label: `Object ${newId}: Inner Diameter`, type: 'number', default: '100', min: '5', max: '1270' },
            { property: `obj${newId}_numberOfSegments`, label: `Object ${newId}: Segments`, type: 'number', default: '12', min: '1', max: '50' },
            { property: `obj${newId}_angularWidth`, label: `Object ${newId}: Segment Angle`, type: 'number', default: '20', min: '1', max: '360' },
            { property: `obj${newId}_rotationSpeed`, label: `Object ${newId}: Rotation Speed`, type: 'number', default: '0', min: '-100', max: '100' },
            { property: `obj${newId}_animationSpeed`, label: `Object ${newId}: Animation Speed`, type: 'number', default: '2', min: '1', max: '50' },
            { property: `obj${newId}_animationMode`, label: `Object ${newId}: Animation Mode`, type: 'combobox', values: 'loop,bounce,bounce-reversed,bounce-random', default: 'loop' },
            { property: `obj${newId}_scrollDir`, label: `Object ${newId}: Scroll Direction`, type: 'combobox', default: 'right', values: 'right,left,up,down' },
            { property: `obj${newId}_gradType`, label: `Object ${newId}: Fill Type`, type: 'combobox', default: 'linear', values: 'solid,linear,radial,alternating,random' },
            { property: `obj${newId}_useSharpGradient`, label: `Object ${newId}: Use Sharp Gradient`, type: 'boolean', default: 'false' },
            { property: `obj${newId}_gradientStop`, label: `Object ${newId}: Gradient Stop %`, type: 'number', default: '50', min: '0', max: '100' },
            { property: `obj${newId}_gradColor1`, label: `Object ${newId}: Color 1`, type: 'color', default: '#cccccc' },
            { property: `obj${newId}_gradColor2`, label: `Object ${newId}: Color 2`, type: 'color', default: '#888888' },
            { property: `obj${newId}_cycleColors`, label: `Object ${newId}: Cycle Colors`, type: 'boolean', default: 'false' },
            { property: `obj${newId}_cycleSpeed`, label: `Object ${newId}: Color Cycle Speed`, type: 'number', default: '1', min: '1', max: '10' },
            { property: `obj${newId}_numberOfRows`, label: `Object ${newId}: Number of Rows`, type: 'number', default: '1', min: '1', max: '100' },
            { property: `obj${newId}_numberOfColumns`, label: `Object ${newId}: Number of Columns`, type: 'number', default: '1', min: '1', max: '100' },
            { property: `obj${newId}_phaseOffset`, label: `Object ${newId}: Phase Offset`, type: 'number', default: '10', min: '0', max: '100' }
        ];
    }

    function getLocalDateFromUTC(dateUTC) {
        const offsetInMs = dateUTC.getTimezoneOffset() * 60 * 1000;
        return new Date(dateUTC.getTime() - offsetInMs);
    }

    /**
     * Asynchronously generates the effect files, fetches a preview image,
     * bundles them into a .zip archive using JSZip, and triggers a download.
     * Handles UI updates for the export button to indicate loading state.
     * @async
     */
    async function exportFile() {
        const exportButton = document.getElementById('export-btn');
        exportButton.disabled = true;
        exportButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Exporting...';

        try {
            // 1. Get the dynamic parts from the builder's current state.
            const effectTitle = getControlValues()['title'] || 'MyEffect';
            const safeFilename = effectTitle.replace(/[\s\/\\?%*:|"<>]/g, '_'); // Sanitize filename
            const metaTags = document.getElementById('output-script').value;
            const imageUrl = 'https://joseamirandavelez.github.io/EffectBuilder/srgbieb_crop.png';
            const imageExtension = imageUrl.split('.').pop() || 'png';

            // Create a new Date object to use for the file timestamps inside the ZIP.
            const utcNow = new Date(); // If this gives UTC (wrong), adjust it:
            const exportDate = getLocalDateFromUTC(utcNow);


            // 2. Fetch the image data as a blob
            const imageResponse = await fetch(imageUrl);
            if (!imageResponse.ok) {
                throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
            }
            const imageBlob = await imageResponse.blob();

            // 3. Define the static HTML and CSS parts.
            const styleContent =
                '        canvas {\n' +
                '            width: 100%;\n' +
                '            height: 100%;\n' +
                '            position: absolute;\n' +
                '            top: 50%;\n' +
                '            left: 50%;\n' +
                '            transform: translate(-50%, -50%);\n' +
                '            background-color: #222222;\n' +
                '        }\n' +
                '        body {\n' +
                '            background-color: #111111;\n' +
                '            overflow: hidden;\n' +
                '            margin: 0;\n' +
                '        }\n';

            const bodyContent =
                '<body>\n' +
                '    <canvas id="signalCanvas"></canvas>\n' +
                '</body>';

            // 4. Get the source code of the required functions and class using .toString().
            const lerpColorString = lerpColor.toString();
            const getPatternColorString = getPatternColor.toString();
            const shapeClassString = Shape.toString();

            // 5. Construct the self-contained initialization script.
            const exportedScript =
                'document.addEventListener(\'DOMContentLoaded\', function () {\n' +
                '    const canvas = document.getElementById(\'signalCanvas\');\n' +
                '    const ctx = canvas.getContext(\'2d\');\n' +
                '    canvas.width = 1280;\n' +
                '    canvas.height = 800;\n\n' +
                '    let objects = [];\n\n' +
                '    // --- Injected Functions & Class Definitions from Builder ---\n' +
                '    ' + lerpColorString + '\n\n' +
                '    ' + getPatternColorString + '\n\n' +
                '    ' + shapeClassString + '\n\n' +
                '    // --- Standalone Initialization & Animation Loop ---\n' +
                '    function createInitialObjects() {\n' +
                '        const objectIds = [];\n' +
                '        for (const key in window) {\n' +
                '            if (Object.prototype.hasOwnProperty.call(window, key) && key.startsWith(\'obj\') && key.endsWith(\'_shape\')) {\n' +
                '                const match = key.match(/^obj(\\\d+)_/);\n' +
                '                if (match && match[1]) {\n' +
                '                    const id = match[1];\n' +
                '                    if (!objectIds.includes(id)) {\n' +
                '                        objectIds.push(id);\n' +
                '                    }\n' +
                '                }\n' +
                '            }\n' +
                '        }\n' +
                '        objectIds.sort((a, b) => a - b);\n' +
                '        objects = objectIds.map(id => new Shape({ id: parseInt(id), ctx: ctx }));\n' +
                '    }\n\n' +
                '    function drawFrame() {\n' +
                '        ctx.clearRect(0, 0, canvas.width, canvas.height);\n' +
                '        const shouldAnimate = window.enableAnimation;\n\n' +
                '        objects.forEach(obj => {\n' +
                '            const id = obj.id;\n' +
                '            obj.update({\n' +
                '                shape: window[\'obj\' + id + \'_shape\'],\n' +
                '                x: window[\'obj\' + id + \'_x\'],\n' +
                '                y: window[\'obj\' + id + \'_y\'],\n' +
                '                width: window[\'obj\' + id + \'_width\'],\n' +
                '                height: window[\'obj\' + id + \'_height\'],\n' +
                '                innerDiameter: window[\'obj\' + id + \'_innerDiameter\'],\n' +
                '                numberOfSegments: window[\'obj\' + id + \'_numberOfSegments\'],\n' +
                '                angularWidth: window[\'obj\' + id + \'_angularWidth\'],\n' +
                '                rotationSpeed: window[\'obj\' + id + \'_rotationSpeed\'],\n' +
                '                animationSpeed: (window[\'obj\' + id + \'_animationSpeed\'] || 0) / 10.0,\n' +
                '                animationMode: window[\'obj\' + id + \'_animationMode\'],\n' +
                '                scrollDirection: window[\'obj\' + id + \'_scrollDir\'],\n' +
                '                gradType: window[\'obj\' + id + \'_gradType\'],\n' +
                '                useSharpGradient: window[\'obj\' + id + \'_useSharpGradient\'],\n' +
                '                gradientStop: parseFloat(window[\'obj\' + id + \'_gradientStop\']),\n' +
                '                gradient: {\n' +
                '                    color1: window[\'obj\' + id + \'_gradColor1\'],\n' +
                '                    color2: window[\'obj\' + id + \'_gradColor2\']\n' +
                '                },\n' +
                '                cycleColors: window[\'obj\' + id + \'_cycleColors\'],\n' +
                '                cycleSpeed: (window[\'obj\' + id + \'_cycleSpeed\'] || 0) / 50.0,\n' +
                '                numberOfRows: window[\'obj\' + id + \'_numberOfRows\'],\n' +
                '                numberOfColumns: window[\'obj\' + id + \'_numberOfColumns\'],\n' +
                '                phaseOffset: window[\'obj\' + id + \'_phaseOffset\'],\n' +
                '            });\n\n' +
                '            obj.draw(shouldAnimate);\n' +
                '        });\n' +
                '    }\n\n' +
                '    function animate() {\n' +
                '        drawFrame();\n' +
                '        requestAnimationFrame(animate);\n' +
                '    }\n\n' +
                '    function init() {\n' +
                '        if (typeof window.areGlobalsSetup === \'undefined\') {\n' +
                '            const metaElements = Array.from(document.querySelectorAll(\'head > meta\'));\n' +
                '            metaElements.forEach(meta => {\n' +
                '                const key = meta.getAttribute(\'property\') || meta.getAttribute(\'name\') || Object.keys(meta.attributes).find(attr => ![\'label\', \'type\', \'default\', \'values\', \'min\', \'max\'].includes(attr.name));\n' +
                '                if (key) {\n' +
                '                    let value = meta.getAttribute(\'default\') || meta.getAttribute(key);\n' +
                '                    const type = meta.getAttribute(\'type\');\n' +
                '                    if (type === \'number\') { window[key] = parseFloat(value); }\n' +
                '                    else if (type === \'boolean\') { window[key] = (value === \'true\'); }\n' +
                '                    else { window[key] = value; }\n' +
                '                }\n' +
                '            });\n' +
                '            window.areGlobalsSetup = true;\n' +
                '        }\n' +
                '        createInitialObjects();\n' +
                '        animate();\n' +
                '    }\n\n' +
                '    init();\n' +
                '});';

            // 6. Assemble the final HTML file content.
            const finalHtml = '<!DOCTYPE html>\n' +
                '<html lang="en">\n' +
                '<head>\n' +
                '    <meta charset="UTF-8">\n' +
                '    <title>' + effectTitle + '</title>\n' +
                metaTags + '\n' +
                '    <style>\n' +
                '    ' + styleContent.trim() + '\n' +
                '    </style>\n' +
                '</head>\n' +
                bodyContent.trim() + '\n' +
                '<script>\n' +
                '    ' + exportedScript.trim() + '\n' +
                '<' + '/script>\n' + // Break up closing tag to prevent parsing error
                '</html>';

            // 7. Create a ZIP file with JSZip
            const zip = new JSZip();
            zip.file(`${safeFilename}.html`, finalHtml, { date: exportDate });
            zip.file(`${safeFilename}.${imageExtension}`, imageBlob, { date: exportDate });

            // 8. Generate and download the ZIP file.
            const zipBlob = await zip.generateAsync({ type: "blob" });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(zipBlob);
            link.download = `${safeFilename}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

        } catch (error) {
            console.error('Export failed:', error);
            if (typeof showNotification === 'function') {
                showNotification('Export failed: ' + error.message);
            } else {
                alert('Export failed: ' + error.message);
            }
        } finally {
            exportButton.disabled = false;
            exportButton.innerHTML = '<i class="bi bi-download"></i> Export';
        }
    }



    form.addEventListener('input', (e) => {
        const target = e.target;
        if (target.type === 'number' && document.getElementById(`${target.id}_slider`)) {
            document.getElementById(`${target.id}_slider`).value = target.value;
        } else if (target.type === 'range' && target.id.endsWith('_slider')) {
            const numberInputId = target.id.replace('_slider', '');
            document.getElementById(numberInputId).value = target.value;
        }

        if (target.type === 'color' && document.getElementById(`${target.id}_hex`)) {
            document.getElementById(`${target.id}_hex`).value = target.value;
        }
        if (target.type === 'text' && target.id.endsWith('_hex')) {
            const colorPickerId = target.id.replace('_hex', '');
            const colorPicker = document.getElementById(colorPickerId);
            if (colorPicker && /^#[0-9A-F]{6}$/i.test(target.value)) {
                colorPicker.value = target.value;
            }
        }

        if (target.name && target.name.includes('_shape')) {
            const objectId = target.name.match(/obj(\d+)_/)[1];
            const shapeValue = target.value;
            const fieldset = form.querySelector(`fieldset[data-object-id="${objectId}"]`);
            if (fieldset) {
                const ringControls = fieldset.querySelector('.ring-settings-group');
                const gridControls = fieldset.querySelector('.grid-settings-group');
                const heightControl = fieldset.querySelector(`[id*="obj${objectId}_height"]`).closest('.mb-3');

                if (ringControls) ringControls.style.display = shapeValue === 'ring' ? 'block' : 'none';
                if (gridControls) gridControls.style.display = shapeValue === 'rectangle' ? 'block' : 'none';
                if (heightControl) heightControl.style.display = shapeValue === 'rectangle' ? 'block' : 'none';
            }
        }

        updateAll();
    });

    /**
     * Synchronizes the central configStore with the current values from the form controls.
     * This ensures that the 'default' attribute of each config object is always up-to-date
     * before performing operations that rebuild the state, like duplicating or deleting.
     */
    function syncConfigStoreWithForm() {
        const currentValues = getControlValues();
        configStore = configStore.map(conf => {
            const key = conf.property || conf.name;
            if (currentValues.hasOwnProperty(key)) {
                const newValue = currentValues[key];
                // Ensure boolean values are stored as strings, matching how they are read from attributes.
                conf.default = typeof newValue === 'boolean' ? String(newValue) : newValue;
            }
            return conf;
        });
    }

    form.addEventListener('click', (e) => {
        const fieldset = e.target.closest('fieldset[data-object-id]');
        const isInteractive = e.target.closest('button, a, input, [contenteditable="true"]');

        if (fieldset && !isInteractive) {
            const idToSelect = parseInt(fieldset.dataset.objectId, 10);
            if (!(selectedObjectIds.length === 1 && selectedObjectIds[0] === idToSelect)) {
                selectedObjectIds = [idToSelect];
                updateToolbarState();
                syncPanelsWithSelection();
                drawFrame();
            }
        }

        if (e.target.classList.contains('object-name')) {
            e.stopPropagation();
            e.preventDefault();
            return;
        }
        const deleteBtn = e.target.closest('.btn-delete');
        const duplicateBtn = e.target.closest('.btn-duplicate');
        const lockBtn = e.target.closest('.btn-lock');

        if (lockBtn) {
            e.preventDefault();
            const id = parseInt(lockBtn.dataset.id, 10);
            const obj = objects.find(o => o.id === id);
            if (obj) {
                obj.locked = !obj.locked;
                const icon = lockBtn.querySelector('i');
                lockBtn.classList.toggle('btn-warning', obj.locked);
                lockBtn.classList.toggle('btn-outline-secondary', !obj.locked);
                icon.className = `bi ${obj.locked ? 'bi-lock-fill' : 'bi-unlock-fill'}`;
                const tooltip = bootstrap.Tooltip.getInstance(lockBtn);
                if (tooltip) {
                    tooltip.setContent({ '.tooltip-inner': obj.locked ? 'Unlock Object' : 'Lock Object' });
                }
                drawFrame();
            }
        }

        if (deleteBtn) {
            e.preventDefault();
            // Sync config with form before deleting to preserve any un-saved changes.
            syncConfigStoreWithForm();
            const idToDelete = parseInt(deleteBtn.dataset.id, 10);

            selectedObjectIds = selectedObjectIds.filter(id => id !== idToDelete);
            configStore = configStore.filter(conf => !(conf.property || conf.name).startsWith(`obj${idToDelete}_`));
            objects = objects.filter(o => o.id !== idToDelete);

            syncAndRenumberState();
        }

        if (duplicateBtn) {
            e.preventDefault();
            // Sync config with form before duplicating to ensure the copy is from the current state.
            syncConfigStoreWithForm();

            const idToCopy = parseInt(duplicateBtn.dataset.id, 10);
            const objectToCopy = objects.find(o => o.id === idToCopy);
            if (!objectToCopy) return;

            const newId = (objects.reduce((maxId, o) => Math.max(maxId, o.id), 0)) + 1;
            const newName = `${objectToCopy.name} Copy`;

            const newConfigs = getDefaultObjectConfig(newId);

            newConfigs.forEach(newConf => {
                const propName = newConf.property.substring(`obj${newId}_`.length);
                const oldPropKey = `obj${idToCopy}_${propName}`;

                const oldConf = configStore.find(c => c.property === oldPropKey);
                if (oldConf) {
                    newConf.default = oldConf.default;
                }

                if (propName === 'x') {
                    newConf.default = parseFloat(newConf.default) + 20;
                }
                if (propName === 'y') {
                    newConf.default = parseFloat(newConf.default) + 20;
                }

                const labelParts = newConf.label.split(':');
                newConf.label = `${newName}: ${labelParts.slice(1).join(':').trim()}`;
            });

            configStore.push(...newConfigs);
            createInitialObjects();
            selectedObjectIds = [newId];
            renderForm();
            updateAll();
            syncPanelsWithSelection();
            drawFrame();
        }
    });


    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(outputScriptArea.value).then(() => {
            showNotification("Script header copied to clipboard!");
        });
    });

    // --- SAVE FUNCTION ---
    document.getElementById('save-ws-btn').addEventListener('click', () => {
        const user = window.auth.currentUser;
        if (!user) {
            showToast("You must be logged in to save.", 'danger');
            return;
        }

        // --- FIX: Get the name from the 'title' control instead of a prompt ---
        syncConfigStoreWithForm();
        const name = getControlValues()['title'] || 'Untitled Effect';
        const thumbnail = generateThumbnail(document.getElementById('signalCanvas'));

        const projectData = {
            userId: user.uid,
            creatorName: user.displayName || 'Anonymous',
            isPublic: true,
            createdAt: new Date(),
            name: name.trim(), // Use the effect title here
            thumbnail: thumbnail,
            configs: configStore,
            objects: objects.map(o => ({ id: o.id, name: o.name, locked: o.locked }))
        };

        window.addDoc(window.collection(window.db, "projects"), projectData)
            .then(() => {
                // Use the retrieved name in the confirmation message
                showToast(`Effect "${name.trim()}" was saved publicly!`, 'success');
            })
            .catch(error => {
                console.error("Error saving document: ", error);
                showToast("Error saving project: " + error.message, 'danger');
            });
    });

    // MY PROJECTS BUTTON
    document.getElementById('load-ws-btn').addEventListener('click', () => {
        const user = window.auth.currentUser;
        if (!user) {
            showToast("You must be logged in to see your projects.", 'danger');
            const galleryOffcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('gallery-offcanvas'));
            galleryOffcanvas.hide();
            return;
        }

        document.getElementById('galleryOffcanvasLabel').textContent = 'My Saved Projects';
        const galleryList = document.getElementById('gallery-project-list');
        galleryList.innerHTML = '<li class="list-group-item text-center"><div class="spinner-border spinner-border-sm"></div></li>';

        if (galleryListener) galleryListener();

        const q = window.query(window.collection(window.db, "projects"), window.where("userId", "==", user.uid));
        galleryListener = window.onSnapshot(q, (querySnapshot) => {
            const projects = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.createdAt && data.createdAt.toDate) data.createdAt = data.createdAt.toDate();
                projects.push({ docId: doc.id, ...data });
            });
            projects.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            populateGallery(projects);
        }, (error) => {
            console.error("My Projects listener error:", error);
            galleryList.innerHTML = '<li class="list-group-item text-danger">Could not load your projects.</li>';
        });
    });

    toolbar.addEventListener('click', e => {
        const button = e.target.closest('button');
        if (!button || button.disabled || button.id === 'constrain-btn') return;
        const action = button.dataset.action;
        if (!action || selectedObjectIds.length === 0) return;
        const selected = selectedObjectIds.map(id => objects.find(o => o.id === id)).filter(o => o);
        if (selected.length === 0) return;
        const anchor = selected[0];
        switch (action) {
            case 'align-screen-left': selected.forEach(o => o.x = 0); break;
            case 'align-screen-right': selected.forEach(o => o.x = canvas.width - o.width); break;
            case 'align-screen-h-center': selected.forEach(o => o.x = (canvas.width - o.width) / 2); break;
            case 'align-screen-top': selected.forEach(o => o.y = 0); break;
            case 'align-screen-bottom': selected.forEach(o => o.y = canvas.height - o.height); break;
            case 'align-screen-v-center': selected.forEach(o => o.y = (canvas.height - o.height) / 2); break;
            case 'match-width': selected.slice(1).forEach(o => o.width = anchor.width); break;
            case 'match-height': selected.slice(1).forEach(o => o.height = anchor.height); break;
            case 'match-both': selected.slice(1).forEach(o => { o.width = anchor.width; o.height = anchor.height; }); break;
            case 'fit-canvas':
                selected.forEach(o => {
                    o.x = 0;
                    o.y = 0;
                    o.width = canvas.width;
                    o.height = canvas.height;
                });
                break;
        }
        updateFormFromShapes();
    });

    addObjectBtn.addEventListener('click', () => {
        const newId = (objects.reduce((maxId, o) => Math.max(maxId, o.id), 0)) + 1;
        const newConfigs = getDefaultObjectConfig(newId);
        configStore.push(...newConfigs);
        createInitialObjects();
        renderForm();
        updateAll();
    });

    /**
     * Handles the click event for the "Constrain to Canvas" button.
     * Toggles the constrainToCanvas state and updates the button's appearance.
     */
    constrainBtn.addEventListener('click', () => {
        constrainToCanvas = !constrainToCanvas;

        // Remove all possible style classes first to avoid conflicts
        constrainBtn.classList.remove('btn-primary', 'btn-outline-secondary', 'btn-secondary');

        // Add the correct class based on the new state
        if (constrainToCanvas) {
            constrainBtn.classList.add('btn-primary');
        } else {
            constrainBtn.classList.add('btn-outline-secondary');
        }
    });

    /**
     * Handles the mousedown event on the canvas to initiate dragging or resizing.
     * @param {MouseEvent} e - The mousedown event object.
     */
    canvasContainer.addEventListener('mousedown', e => {
        const { x, y } = getCanvasCoordinates(e);

        // First, check if a resize handle on a single selected object is clicked.
        if (selectedObjectIds.length === 1) {
            const selectedObject = objects.find(o => o.id === selectedObjectIds[0]);
            if (selectedObject && !selectedObject.locked) {
                const handle = selectedObject.getHandleAtPoint(x, y);
                if (handle) {
                    isResizing = true;
                    isDragging = false;
                    activeResizeHandle = handle.name;
                    const oppositeHandleName = getOppositeHandle(handle.name);

                    initialDragState = [{
                        id: selectedObject.id,
                        x: selectedObject.x,
                        y: selectedObject.y,
                        width: selectedObject.width,
                        height: selectedObject.height,
                        rotationAngle: selectedObject.rotationAngle,
                        anchorPoint: selectedObject.getWorldCoordsOfCorner(oppositeHandleName),
                        oppositeHandleName: oppositeHandleName,
                        diameterRatio: selectedObject.shape === 'ring' ? selectedObject.innerDiameter / selectedObject.width : 1
                    }];

                    selectedObject.rotationAngle = 0;

                    dragStartX = x;
                    dragStartY = y;
                    return; // Exit early to prevent re-selection
                }
            }
        }

        // --- NEW SELECTION LOGIC ---
        // Find all objects under the cursor, from top to bottom.
        const hitObjects = [];
        for (let i = objects.length - 1; i >= 0; i--) {
            if (objects[i].isPointInside(x, y) && !objects[i].locked) {
                hitObjects.push(objects[i]);
            }
        }

        let targetObject = null;
        if (hitObjects.length > 0) {
            // Create a reversed copy to search from the bottom-most object up.
            const reversedHitObjects = [...hitObjects].reverse();
            // Try to find the bottom-most unselected object first.
            const bottommostUnselected = reversedHitObjects.find(obj => !selectedObjectIds.includes(obj.id));

            if (bottommostUnselected) {
                // If a bottom-most unselected object is found, it becomes the target.
                targetObject = bottommostUnselected;
            } else {
                // If all hit objects are already selected (or there's only one),
                // default to the absolute topmost one to allow dragging the group.
                targetObject = hitObjects[0];
            }
        }

        if (targetObject) {
            const hitObjectId = targetObject.id;

            // Handle multi-selection with Shift/Ctrl/Meta keys
            if (e.shiftKey || e.ctrlKey || e.metaKey) {
                if (selectedObjectIds.includes(hitObjectId)) {
                    // If already selected, deselect it
                    selectedObjectIds = selectedObjectIds.filter(id => id !== hitObjectId);
                } else {
                    // If not selected, add it to the selection
                    selectedObjectIds.push(hitObjectId);
                }
            } else {
                // If no modifier key, and the object is not already part of the selection,
                // start a new selection with just this object.
                if (!selectedObjectIds.includes(hitObjectId)) {
                    selectedObjectIds = [hitObjectId];
                }
            }
        } else {
            // If clicking on an empty area, clear the selection
            selectedObjectIds = [];
        }

        if (selectedObjectIds.length > 0) {
            isDragging = true;
            dragStartX = x;
            dragStartY = y;
            initialDragState = selectedObjectIds.map(id => {
                const obj = objects.find(o => o.id === id);
                return {
                    id,
                    x: obj.x,
                    y: obj.y,
                    width: obj.width,
                    height: obj.height,
                    rotationAngle: obj.rotationAngle,
                    shape: obj.shape
                };
            });
        } else {
            isDragging = false;
        }

        updateToolbarState();
        syncPanelsWithSelection();
        drawFrame();
    });


    /**
     * Handles mouse movement over the canvas for dragging, resizing, and cursor updates.
     * @param {MouseEvent} e - The mousemove event object.
     */
    canvasContainer.addEventListener('mousemove', e => {
        e.preventDefault();
        const { x, y } = getCanvasCoordinates(e);

        if (isResizing) {
            const obj = objects.find(o => o.id === selectedObjectIds[0]);
            const initial = initialDragState[0];
            const dx = x - dragStartX;
            const dy = y - dragStartY;

            // Since rotation is 0, calculations are simple and axis-aligned.
            let newX = initial.x;
            let newY = initial.y;
            let newWidth = initial.width;
            let newHeight = initial.height;

            if (activeResizeHandle.includes('right')) {
                newWidth = Math.max(10, initial.width + dx);
            }
            if (activeResizeHandle.includes('left')) {
                newWidth = Math.max(10, initial.width - dx);
                newX = initial.x + dx;
            }
            if (activeResizeHandle.includes('bottom')) {
                newHeight = Math.max(10, initial.height + dy);
            }
            if (activeResizeHandle.includes('top')) {
                newHeight = Math.max(10, initial.height - dy);
                newY = initial.y + dy;
            }

            obj.x = newX;
            obj.y = newY;
            obj.width = newWidth;
            obj.height = newHeight;

            if (obj.shape === 'circle' || obj.shape === 'ring') {
                obj.height = obj.width;
                if (obj.shape === 'ring') {
                    obj.innerDiameter = obj.width * initial.diameterRatio;
                }
            }

            updateFormFromShapes();

        } else if (isDragging) {
            let dx = x - dragStartX;
            let dy = y - dragStartY;

            if (constrainToCanvas && initialDragState.length > 0) {
                let groupMinX = Infinity, groupMinY = Infinity, groupMaxX = -Infinity, groupMaxY = -Infinity;

                initialDragState.forEach(initial => {
                    const tempObj = {
                        x: initial.x + dx, y: initial.y + dy, width: initial.width, height: initial.height, rotationAngle: initial.rotationAngle, shape: initial.shape,
                        getCenter: Shape.prototype.getCenter, getHandlePositions: Shape.prototype.getHandlePositions, getWorldCoordsOfCorner: Shape.prototype.getWorldCoordsOfCorner, handleSize: 8
                    };
                    const corners = [
                        tempObj.getWorldCoordsOfCorner('top-left'), tempObj.getWorldCoordsOfCorner('top-right'),
                        tempObj.getWorldCoordsOfCorner('bottom-right'), tempObj.getWorldCoordsOfCorner('bottom-left')
                    ];
                    corners.forEach(corner => {
                        groupMinX = Math.min(groupMinX, corner.x);
                        groupMinY = Math.min(groupMinY, corner.y);
                        groupMaxX = Math.max(groupMaxX, corner.x);
                        groupMaxY = Math.max(groupMaxY, corner.y);
                    });
                });

                if (groupMinX < 0) dx -= groupMinX;
                if (groupMaxX > canvas.width) dx -= (groupMaxX - canvas.width);
                if (groupMinY < 0) dy -= groupMinY;
                if (groupMaxY > canvas.height) dy -= (groupMaxY - canvas.height);
            }

            initialDragState.forEach(initial => {
                const obj = objects.find(o => o.id === initial.id);
                if (obj) {
                    obj.x = initial.x + dx;
                    obj.y = initial.y + dy;
                }
            });
            updateFormFromShapes();
        } else {
            canvasContainer.style.cursor = 'default';
            if (selectedObjectIds.length === 1) {
                const selectedObject = objects.find(o => o.id === selectedObjectIds[0]);
                if (selectedObject && !selectedObject.locked) {
                    const handle = selectedObject.getHandleAtPoint(x, y);
                    if (handle) {
                        canvasContainer.style.cursor = handle.cursor;
                    } else if (selectedObject.isPointInside(x, y)) {
                        canvasContainer.style.cursor = 'move';
                    }
                }
            }
        }
    });

    /**
     * Handles the mouseup event to finalize dragging or resizing operations.
     * @param {MouseEvent} e - The mouseup event object.
     */
    canvasContainer.addEventListener('mouseup', () => {
        if (isResizing) {
            const obj = objects.find(o => o.id === selectedObjectIds[0]);
            const initial = initialDragState[0];
            if (obj) {
                // Restore the original rotation angle
                obj.rotationAngle = initial.rotationAngle;

                // Calculate where the anchor point IS NOW, after the resize and rotation restoration.
                const currentAnchorPos = obj.getWorldCoordsOfCorner(initial.oppositeHandleName);

                // The anchor point SHOULD BE where it was when we started the drag.
                const targetAnchorPos = initial.anchorPoint;

                // Calculate the drift vector
                const driftX = currentAnchorPos.x - targetAnchorPos.x;
                const driftY = currentAnchorPos.y - targetAnchorPos.y;

                // Correct the object's final position by the inverse of the drift.
                obj.x -= driftX;
                obj.y -= driftY;

                obj.isPausedForResize = false;
            }
            updateAll();
        }
        isDragging = false;
        isResizing = false;
        activeResizeHandle = null;
    });




    canvasContainer.addEventListener('mouseleave', e => {
        isDragging = false;
        isResizing = false;
    });


    exportBtn.addEventListener('click', exportFile);

    /**
     * The main initialization function for the application.
     * It sets up the initial configuration, creates objects, renders the form,
     * initializes tooltips, starts the animation loop, and sets up the resizable panels.
     */
    function init() {
        const template = document.getElementById('initial-config');
        const metaElements = Array.from(template.content.querySelectorAll('meta'));
        configStore = metaElements.map(parseMetaToConfig);

        // Set initial state of the constrain button
        constrainBtn.classList.remove('btn-secondary'); // Remove the default class from the HTML
        if (constrainToCanvas) {
            constrainBtn.classList.add('btn-primary');
        } else {
            constrainBtn.classList.add('btn-outline-secondary');
        }

        const objectIds = [...new Set(
            configStore
                .filter(c => c.property && c.property.startsWith('obj'))
                .map(c => c.property.match(/obj(\d+)_/)[1])
        )];

        objectIds.forEach(id => {
            const animModeConf = configStore.find(c => c.property === `obj${id}_animationMode`);
            const newValues = 'loop,bounce,bounce-reversed,bounce-random';
            if (animModeConf) {
                animModeConf.values = newValues;
            } else {
                const getLabelPrefix = () => {
                    const shapeConf = configStore.find(c => c.property === `obj${id}_shape`);
                    return shapeConf ? shapeConf.label.split(':')[0] : `Object ${id}`;
                };
                configStore.push({ property: `obj${id}_animationMode`, label: `${getLabelPrefix()}: Animation Mode`, type: 'combobox', values: newValues, default: 'loop' });
            }
        });

        createInitialObjects();
        renderForm();
        updateAll();
        new bootstrap.Tooltip(document.body, { selector: "[data-bs-toggle='tooltip']", trigger: 'hover' });
        updateToolbarState();
        // Initialize FPS throttling and start the animation loop
        fpsInterval = 1000 / fps;
        then = window.performance.now();
        requestAnimationFrame(animate);

        const savedVSizes = getCookie('split-v-sizes');
        const savedHSizes = getCookie('split-h-sizes');
        const initialVSizes = savedVSizes ? JSON.parse(savedVSizes) : [30, 70];
        const initialHSizes = savedHSizes ? JSON.parse(savedHSizes) : [75, 25];

        lastHSizes = initialHSizes;
        lastVSizes = initialVSizes;

        horizontalSplit = Split(['#left-panel', '#right-panel'], {
            sizes: initialVSizes,
            minSize: [400, 500],
            gutterSize: 12,
            gutter: (index, direction) => {
                const gutter = document.createElement('div');
                gutter.className = `gutter gutter-${direction}`;
                const icon = document.createElement('i');
                icon.className = 'bi bi-three-dots-vertical';
                gutter.appendChild(icon);
                return gutter;
            },
            onDragEnd: function (sizes) {
                setCookie('split-v-sizes', JSON.stringify(sizes), 365);
                lastVSizes = sizes;
            }
        });

        verticalSplit = Split(['#right-panel-top', '#right-panel-bottom'], {
            direction: 'vertical',
            sizes: initialHSizes,
            minSize: [200, 150],
            gutterSize: 12,
            gutter: (index, direction) => {
                const gutter = document.createElement('div');
                gutter.className = `gutter gutter-${direction}`;
                const icon = document.createElement('i');
                icon.className = 'bi bi-three-dots';
                gutter.appendChild(icon);
                return gutter;
            },
            onDragEnd: function (sizes) {
                setCookie('split-h-sizes', JSON.stringify(sizes), 365);
                lastHSizes = sizes;
            }
        });

        initializeSortable();
        loadSharedEffect(); // Check for shared effect link on page load
    }

    // --- SHARE BUTTON LOGIC ---
    document.getElementById('share-btn').addEventListener('click', async () => {
        const user = window.auth.currentUser;
        syncConfigStoreWithForm();
        const thumbnail = generateThumbnail(document.getElementById('signalCanvas'));
        const name = getControlValues()['title'] || 'My Shared Effect';

        const shareableData = {
            userId: user ? user.uid : 'anonymous',
            creatorName: user ? (user.displayName || 'Anonymous') : 'Anonymous',
            isPublic: true,
            createdAt: new Date(),
            name: name,
            thumbnail: thumbnail, // Add the thumbnail data
            configs: configStore,
            objects: objects.map(o => ({ id: o.id, name: o.name, locked: o.locked }))
        };

        try {
            const docRef = await window.addDoc(window.collection(window.db, "projects"), shareableData);
            const shareUrl = `${window.location.origin}${window.location.pathname}?effectId=${docRef.id}`;
            navigator.clipboard.writeText(shareUrl)
                .then(() => showToast("Share link copied to clipboard!", 'success'))
                .catch(() => prompt("Copy this link:", shareUrl));
        } catch (error) {
            console.error("Error creating share link: ", error);
            showToast("Could not create share link.", 'danger');
        }
    });

    if (galleryOffcanvasEl) {
        galleryOffcanvasEl.addEventListener('hidden.bs.offcanvas', () => {
            if (galleryListener) {
                console.log("Detaching gallery listener.");
                galleryListener(); // This is the unsubscribe function
                galleryListener = null;
            }
        });
    }

    // BROWSE GALLERY BUTTON
    document.getElementById('browse-btn').addEventListener('click', async () => {
        document.getElementById('galleryOffcanvasLabel').textContent = 'Public Effects Gallery';
        const galleryList = document.getElementById('gallery-project-list');
        galleryList.innerHTML = '<li class="list-group-item text-center"><div class="spinner-border spinner-border-sm"></div></li>';

        const q = window.query(window.collection(window.db, "projects"), window.where("isPublic", "==", true), window.orderBy("createdAt", "desc"));

        try {
            const querySnapshot = await window.getDocs(q);
            const projects = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.createdAt && data.createdAt.toDate) data.createdAt = data.createdAt.toDate();
                projects.push({ docId: doc.id, ...data });
            });
            populateGallery(projects);
        } catch (error) {
            console.error("Error loading public gallery:", error);
            galleryList.innerHTML = '<li class="list-group-item text-danger">Could not load effects.</li>';
        }
    });

    // --- LOAD FROM SHARE LINK LOGIC ---
    // This function runs automatically when the page loads.
    async function loadSharedEffect() {
        const params = new URLSearchParams(window.location.search);
        const effectId = params.get('effectId');

        if (!effectId) {
            return; // No share ID in the URL, so do nothing.
        }

        try {
            // --- FIX: Use window.doc and window.getDoc ---
            const effectDocRef = window.doc(window.db, "projects", effectId);
            const effectDoc = await window.getDoc(effectDocRef);

            if (effectDoc.exists()) {
                const projectData = effectDoc.data();

                // The security rules already prevent non-public docs from being read,
                // but this check is good practice.
                if (projectData.isPublic) {
                    loadWorkspace(projectData);
                    showNotification("Shared effect loaded!");
                } else {
                    showNotification("This effect is not public.");
                }
            } else {
                showNotification("Shared effect not found.");
            }
        } catch (error) {
            console.error("Error loading shared effect:", error);
            showNotification("Could not load the shared effect.");
        }
    }

    // MY PROJECTS BUTTON
    document.getElementById('load-ws-btn').addEventListener('click', async () => {
        const user = window.auth.currentUser;
        if (!user) {
            showToast("You must be logged in to see your projects.", 'danger');
            const galleryOffcanvas = bootstrap.Offcanvas.getInstance(galleryOffcanvasEl);
            if (galleryOffcanvas) galleryOffcanvas.hide();
            return;
        }

        document.getElementById('galleryOffcanvasLabel').textContent = 'My Saved Projects';
        const galleryList = document.getElementById('gallery-project-list');
        galleryList.innerHTML = '<li class="list-group-item text-center"><div class="spinner-border spinner-border-sm"></div></li>';

        const q = window.query(window.collection(window.db, "projects"), window.where("userId", "==", user.uid), window.orderBy("createdAt", "desc"));

        try {
            const querySnapshot = await window.getDocs(q);
            const projects = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.createdAt && data.createdAt.toDate) data.createdAt = data.createdAt.toDate();
                projects.push({ docId: doc.id, ...data });
            });
            populateGallery(projects);
        } catch (error) {
            console.error("Error loading user projects:", error);
            galleryList.innerHTML = '<li class="list-group-item text-danger">Could not load your projects.</li>';
        }
    });

    // Add scroll listener for lazy loading
    galleryBody.addEventListener('scroll', () => {
        if (isLoadingMore) return;
        const { scrollTop, scrollHeight, clientHeight } = galleryBody;
        if (scrollHeight - scrollTop - clientHeight < 100) { // Load when 100px from bottom
            loadMoreProjects();
        }
    });

    // Clean up listener when offcanvas is closed
    galleryOffcanvasEl.addEventListener('hidden.bs.offcanvas', () => {
        if (galleryListener) {
            galleryListener();
            galleryListener = null;
        }
        lastVisibleDoc = null; // Reset for next time
    });

    /**
     * Displays a prominent toast notification in the bottom-right corner.
     * @param {string} message - The message to display.
     * @param {string} [type='info'] - The type of toast ('success', 'danger', 'info').
     */
    function showToast(message, type = 'info') {
        const toastEl = document.getElementById('app-toast');
        const toastHeader = document.getElementById('app-toast-header');
        const toastTitle = document.getElementById('app-toast-title');
        const toastBody = document.getElementById('app-toast-body');
        const toastIcon = document.getElementById('app-toast-icon');

        toastBody.textContent = message;

        // Remove old color and icon classes
        toastHeader.classList.remove('bg-success', 'bg-danger', 'bg-primary');
        toastIcon.className = 'bi me-2'; // Reset icon classes

        // Add new color class, title, and icon based on type
        switch (type) {
            case 'success':
                toastHeader.classList.add('bg-success');
                toastTitle.textContent = 'Success';
                toastIcon.classList.add('bi-check-circle-fill');
                break;
            case 'danger':
                toastHeader.classList.add('bg-danger');
                toastTitle.textContent = 'Error';
                toastIcon.classList.add('bi-exclamation-triangle-fill');
                break;
            default: // 'info'
                toastHeader.classList.add('bg-primary');
                toastTitle.textContent = 'Notification';
                toastIcon.classList.add('bi-info-circle-fill');
                break;
        }

        const toast = new bootstrap.Toast(toastEl);
        toast.show();
    }

    /**
     * Generates a small data URL thumbnail from the main canvas.
     * @param {HTMLCanvasElement} sourceCanvas - The main canvas to capture.
     * @returns {string} A dataURL string of the thumbnail.
     */
    function generateThumbnail(sourceCanvas) {
        const thumbnailCanvas = document.createElement('canvas');
        const thumbWidth = 200; // Define a fixed width for thumbnails
        const thumbHeight = (sourceCanvas.height / sourceCanvas.width) * thumbWidth;
        thumbnailCanvas.width = thumbWidth;
        thumbnailCanvas.height = thumbHeight;
        const thumbCtx = thumbnailCanvas.getContext('2d');

        // Draw the main canvas onto the smaller thumbnail canvas
        thumbCtx.drawImage(sourceCanvas, 0, 0, thumbWidth, thumbHeight);

        // Return the thumbnail as a JPEG data URL for smaller size in the database
        return thumbnailCanvas.toDataURL('image/jpeg', 0.7);
    }

    /**
     * Shows a generic confirmation modal and sets up a callback for the confirm button.
     * @param {string} title - The title for the modal header.
     * @param {string} body - The message for the modal body.
     * @param {string} buttonText - The text for the confirmation button (e.g., "Delete").
     * @param {function} onConfirm - The function to execute when the confirm button is clicked.
     */
    function showConfirmModal(title, body, buttonText, onConfirm) {
        const confirmModalEl = document.getElementById('confirm-overwrite-modal');
        const confirmModal = bootstrap.Modal.getInstance(confirmModalEl) || new bootstrap.Modal(confirmModalEl);
        const confirmModalTitle = document.getElementById('confirmOverwriteModalLabel');
        const confirmModalBody = document.getElementById('confirm-overwrite-modal-body');
        const confirmBtn = document.getElementById('confirm-overwrite-btn');

        confirmModalTitle.textContent = title;
        confirmModalBody.textContent = body;
        confirmBtn.textContent = buttonText;
        confirmBtn.className = buttonText === 'Delete' ? 'btn btn-danger' : 'btn btn-primary';

        // Store the callback function to be executed on click
        confirmActionCallback = onConfirm;

        confirmModalEl.style.zIndex = "1060"; // Ensure it appears over other modals/offcanvas
        confirmModal.show();
    }

    // Add a single, persistent listener to the main confirm button
    document.getElementById('confirm-overwrite-btn').addEventListener('click', () => {
        if (typeof confirmActionCallback === 'function') {
            confirmActionCallback();
        }
    });

    document.getElementById('confirm-import-btn').addEventListener('click', () => {
        const importText = document.getElementById('import-textarea').value;
        if (!importText.trim()) {
            showToast("Text area is empty.", 'danger');
            return;
        }

        try {
            // Create a temporary element to safely parse the HTML string
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = importText;

            const metaElements = Array.from(tempDiv.querySelectorAll('meta'));

            if (metaElements.length === 0) {
                showToast("No valid <meta> tags were found.", 'danger');
                return;
            }

            // Use your existing parser to create a config array
            const importedConfigs = metaElements.map(parseMetaToConfig);

            // Create a workspace object to pass to the existing load function
            const workspace = {
                configs: importedConfigs,
                // We create objects from the configs, so this can be empty
                objects: []
            };

            loadWorkspace(workspace);

            const importModal = bootstrap.Modal.getInstance(document.getElementById('import-meta-modal'));
            importModal.hide();
            showToast("Effect imported successfully!", 'success');
            document.getElementById('import-textarea').value = ''; // Clear textarea for next time

        } catch (error) {
            console.error("Error importing meta tags:", error);
            showToast("Could not parse the provided HTML. Please check the format.", 'danger');
        }
    });

    // Start the application.
    init();

});