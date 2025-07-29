// At the top of main.js
let cachedSnapTargets = null;
let snapLines = [];
let isDragging = false;
let isResizing = false;
let isRotating = false;
let activeResizeHandle = null;
let initialDragState = [];
let dragStartX = 0;
let dragStartY = 0;

// Helper function to compute world-coordinate edges and center
function getWorldPoints(obj) {
    const center = obj.getCenter();
    const angle = obj.getRenderAngle();
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const halfWidth = obj.width / 2;
    const halfHeight = obj.height / 2;
    const localPoints = [
        { x: -halfWidth, y: -halfHeight, type: 'edge' },   // Top-left
        { x: halfWidth, y: -halfHeight, type: 'edge' },    // Top-right
        { x: halfWidth, y: halfHeight, type: 'edge' },     // Bottom-right
        { x: -halfWidth, y: halfHeight, type: 'edge' },    // Bottom-left
        { x: 0, y: -halfHeight, type: 'center' },          // Top-center
        { x: 0, y: halfHeight, type: 'center' },           // Bottom-center
        { x: -halfWidth, y: 0, type: 'center' },           // Center-left
        { x: halfWidth, y: 0, type: 'center' },            // Center-right
        { x: 0, y: 0, type: 'center' }                     // True center
    ];
    return localPoints.map(point => ({
        x: center.x + (point.x * cosA - point.y * sinA),
        y: center.y + (point.x * sinA + point.y * cosA),
        type: point.type
    }));
}

const FONT_DATA_4PX = {
    name: 'small', charWidth: 3, charHeight: 4, charSpacing: 1, lineSpacing: 2,
    map: {
        'A': ['010', '101', '111', '101'], 'B': ['110', '101', '111', '110'], 'C': ['011', '100', '100', '011'],
        'D': ['110', '101', '101', '110'], 'E': ['111', '100', '110', '111'], 'F': ['111', '100', '110', '100'],
        'G': ['011', '100', '101', '011'], 'H': ['101', '101', '111', '101'], 'I': ['111', '010', '010', '111'],
        'J': ['011', '001', '101', '010'], 'K': ['101', '110', '110', '101'], 'L': ['100', '100', '100', '111'],
        'M': ['101', '111', '101', '101'], 'N': ['110', '101', '101', '101'], 'O': ['010', '101', '101', '010'],
        'P': ['111', '101', '110', '100'], 'Q': ['010', '101', '111', '011'], 'R': ['110', '101', '110', '101'],
        'S': ['011', '100', '010', '110'], 'T': ['111', '010', '010', '010'], 'U': ['101', '101', '101', '011'],
        'V': ['101', '101', '010', '010'], 'W': ['101', '101', '111', '101'], 'X': ['101', '010', '010', '101'],
        'Y': ['101', '010', '010', '010'], 'Z': ['111', '001', '010', '111'],
        'a': ['000', '010', '111', '101'], 'b': ['100', '110', '101', '110'], 'c': ['000', '011', '100', '011'],
        'd': ['001', '011', '101', '011'], 'e': ['000', '010', '111', '111'], 'f': ['010', '100', '110', '100'],
        'g': ['011', '101', '011', '001'], 'h': ['100', '110', '101', '101'], 'i': ['010', '000', '010', '010'],
        'j': ['001', '000', '001', '010'], 'k': ['100', '110', '110', '101'], 'l': ['010', '010', '010', '010'],
        'm': ['000', '111', '111', '101'], 'n': ['000', '110', '101', '101'], 'o': ['000', '010', '101', '010'],
        'p': ['110', '101', '110', '100'], 'q': ['011', '101', '011', '001'], 'r': ['000', '110', '100', '100'],
        's': ['000', '111', '100', '011'], 't': ['100', '111', '100', '010'], 'u': ['000', '101', '101', '011'],
        'v': ['000', '101', '101', '010'], 'w': ['000', '101', '111', '111'], 'x': ['000', '101', '010', '101'],
        'y': ['101', '101', '011', '001'], 'z': ['000', '111', '010', '111'],
        '0': ['010', '101', '101', '010'], '1': ['010', '110', '010', '010'], '2': ['110', '001', '010', '111'],
        '3': ['111', '010', '101', '010'], '4': ['100', '101', '111', '001'], '5': ['111', '100', '011', '110'],
        '6': ['011', '100', '111', '010'], '7': ['111', '001', '010', '010'], '8': ['010', '101', '010', '101'],
        '9': ['010', '111', '001', '110'], '.': ['000', '000', '000', '010'], ',': ['000', '000', '010', '010'],
        '!': ['010', '010', '000', '010'], '?': ['010', '101', '000', '010'], "'": ['010', '010', '000', '000'],
        '"': ['101', '101', '000', '000'], ':': ['000', '010', '000', '010'], ';': ['000', '010', '010', '010'],
        '(': ['010', '100', '100', '010'], ')': ['100', '010', '010', '100'], '-': ['000', '000', '111', '000'],
        '+': ['000', '010', '111', '010'], '=': ['000', '111', '000', '111'], '*': ['101', '010', '101', '000'],
        '/': ['001', '010', '100', '000'], '\\': ['100', '010', '001', '000'], '#': ['010', '111', '010', '111'],
        '$': ['010', '111', '101', '111'], '%': ['101', '001', '010', '101'], '&': ['010', '101', '010', '101'],
        ' ': ['000', '000', '000', '000']
    }
};

// Large Font (5x5 pixels for better readability)
const FONT_DATA_5PX = {
    name: 'large', charWidth: 5, charHeight: 5, charSpacing: 1, lineSpacing: 1,
    map: {
        'A': ['01110', '10001', '11111', '10001', '10001'], 'B': ['11110', '10001', '11110', '10001', '11110'],
        'C': ['01110', '10000', '10000', '10000', '01110'], 'D': ['11110', '10001', '10001', '10001', '11110'],
        'E': ['11111', '10000', '11110', '10000', '11111'], 'F': ['11111', '10000', '11110', '10000', '10000'],
        'G': ['01110', '10000', '10111', '10001', '01110'], 'H': ['10001', '10001', '11111', '10001', '10001'],
        'I': ['11111', '00100', '00100', '00100', '11111'], 'J': ['00111', '00001', '00001', '10001', '01110'],
        'K': ['10001', '10010', '11100', '10010', '10001'], 'L': ['10000', '10000', '10000', '10000', '11111'],
        'M': ['10001', '11011', '10101', '10001', '10001'], 'N': ['10001', '11001', '10101', '10011', '10001'],
        'O': ['01110', '10001', '10001', '10001', '01110'], 'P': ['11110', '10001', '11110', '10000', '10000'],
        'Q': ['01110', '10001', '10101', '10010', '01101'], 'R': ['11110', '10001', '11110', '10010', '10001'],
        'S': ['01110', '10000', '01110', '00001', '11110'], 'T': ['11111', '00100', '00100', '00100', '00100'],
        'U': ['10001', '10001', '10001', '10001', '01110'], 'V': ['10001', '10001', '10001', '01010', '00100'],
        'W': ['10001', '10001', '10101', '11011', '10001'], 'X': ['10001', '01010', '00100', '01010', '10001'],
        'Y': ['10001', '01010', '00100', '00100', '00100'], 'Z': ['11111', '00010', '00100', '01000', '11111'],
        'a': ['00000', '01110', '10001', '01111', '00000'], 'b': ['10000', '10000', '11110', '10001', '11110'],
        'c': ['00000', '01110', '10000', '10000', '01110'], 'd': ['00001', '00001', '01111', '10001', '01111'],
        'e': ['00000', '01110', '11111', '10000', '01110'], 'f': ['00110', '01001', '01000', '01000', '01000'],
        'g': ['00000', '01111', '10001', '01111', '00001'], 'h': ['10000', '10000', '11110', '10001', '10001'],
        'i': ['01110', '00000', '01100', '01000', '01110'], 'j': ['00110', '00000', '00110', '00100', '11000'],
        'k': ['10000', '10010', '11100', '11100', '10010'], 'l': ['01000', '01000', '01000', '01000', '01110'],
        'm': ['00000', '11010', '10101', '10101', '10001'], 'n': ['00000', '11110', '10001', '10001', '10001'],
        'o': ['00000', '01110', '10001', '10001', '01110'], 'p': ['00000', '11110', '10001', '11110', '10000'],
        'q': ['00000', '01111', '10001', '01111', '00001'], 'r': ['00000', '10110', '11000', '10000', '10000'],
        's': ['00000', '01111', '01000', '10010', '11100'], 't': ['01000', '11110', '01000', '01000', '00110'],
        'u': ['00000', '10001', '10001', '10001', '01111'], 'v': ['00000', '10001', '10001', '01010', '00100'],
        'w': ['00000', '10101', '10101', '11111', '10101'], 'x': ['00000', '10001', '01110', '01110', '10001'],
        'y': ['00000', '10001', '10001', '01111', '00001'], 'z': ['00000', '11111', '00110', '01100', '11111'],
        '0': ['01110', '10011', '10101', '11001', '01110'], '1': ['00100', '01100', '00100', '00100', '01110'],
        '2': ['01110', '10001', '00110', '01000', '11111'], '3': ['11111', '00010', '01100', '00001', '11110'],
        '4': ['00110', '01010', '10010', '11111', '00010'], '5': ['11111', '10000', '11110', '00001', '11110'],
        '6': ['01110', '10000', '11110', '10001', '01110'], '7': ['11111', '00001', '00010', '00100', '00100'],
        '8': ['01110', '10001', '01110', '10001', '01110'], '9': ['01110', '10001', '01111', '00001', '01110'],
        ' ': ['00000', '00000', '00000', '00000', '00000'], '.': ['00000', '00000', '00000', '01100', '01100'],
        ',': ['00000', '00000', '00000', '01100', '01000'], '!': ['01100', '01100', '01100', '00000', '01100'],
        '?': ['01110', '10001', '00110', '00000', '00100'], "'": ['00110', '00110', '00100', '00000', '00000'],
        '"': ['11011', '11011', '00000', '00000', '00000'], ':': ['00000', '01100', '00000', '01100', '00000'],
        ';': ['00000', '00000', '01100', '00000', '01000'], '(': ['00100', '01000', '01000', '01000', '00100'],
        ')': ['10000', '01000', '01000', '01000', '10000'], '-': ['00000', '00000', '11111', '00000', '00000'],
        '+': ['00000', '00100', '01110', '00100', '00000'], '=': ['00000', '11111', '00000', '11111', '00000'],
        '*': ['01010', '01010', '11111', '01010', '01010'], '/': ['00001', '00010', '00100', '01000', '10000'],
        '\\': ['10000', '01000', '00100', '00010', '00001'], '#': ['01010', '11111', '01010', '11111', '01010'],
        '$': ['00100', '01110', '10101', '01110', '00100'], '%': ['11001', '01010', '00100', '01010', '10011'],
        '&': ['01110', '10001', '01110', '10101', '01011']
    }
};

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds have elapsed
 * since the last time the debounced function was invoked.
 * @param {function} func The function to debounce.
 * @param {number} [wait=500] The number of milliseconds to delay.
 * @returns {function} Returns the new debounced function.
 */
function debounce(func, wait = 500) {
    let timeout;
    return function (...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

function drawPixelText(ctx, shape) {
    const { x, y, width, height, pixelFont, fontSize, textAlign,
        textAnimation, scrollOffsetX, waveAngle, visibleCharCount } = shape;

    const textToRender = shape.getDisplayText();
    if (typeof textToRender !== 'string') return;

    const fontData = pixelFont === 'large' ? FONT_DATA_5PX : FONT_DATA_4PX;
    const { charWidth, charHeight, charSpacing, lineSpacing, map } = fontData;
    const pixelSize = fontSize / 10; // This is our margin size

    const animatedText = textToRender.toUpperCase().substring(0, Math.floor(visibleCharCount));
    const lines = animatedText.split('\n');

    ctx.save();
    ctx.beginPath();

    if (textAnimation === 'wave') {
        const verticalPadding = 100; // Extra clipping space for wave animation
        ctx.rect(x, y - verticalPadding, width, height + verticalPadding * 2);
    } else {
        ctx.rect(x, y, width, height);
    }
    ctx.clip();

    lines.forEach((line, lineIndex) => {
        const lineWidth = line.length * (charWidth + charSpacing) * pixelSize - (charSpacing * pixelSize);
        let lineStartX = x;
        if (textAlign === 'center') {
            lineStartX = x + (width - lineWidth) / 2;
        } else if (textAlign === 'right') {
            lineStartX = x + width - lineWidth;
        }

        for (let i = 0; i < line.length; i++) {
            const charData = map[line[i]] || map['?'];
            if (!charData) continue;

            let dx = lineStartX + i * (charWidth + charSpacing) * pixelSize + scrollOffsetX;
            // Apply the top margin to the drawing's Y position
            let dy = y + pixelSize + lineIndex * (charHeight + lineSpacing) * pixelSize;

            if (textAnimation === 'wave') {
                dy += Math.sin(waveAngle + i * 0.5) * (pixelSize * 2);
            }

            if (dx > x + width || dx < x - (charWidth * pixelSize)) {
                continue;
            }

            for (let r = 0; r < charHeight; r++) {
                for (let c = 0; c < charWidth; c++) {
                    if (charData[r] && charData[r][c] === '1') {
                        ctx.fillRect(dx + c * pixelSize, dy + r * pixelSize, pixelSize, pixelSize);
                    }
                }
            }
        }
    });

    ctx.restore();
}

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

function getBoundingBox(obj) {
    const corners = [
        obj.getWorldCoordsOfCorner('top-left'),
        obj.getWorldCoordsOfCorner('top-right'),
        obj.getWorldCoordsOfCorner('bottom-right'),
        obj.getWorldCoordsOfCorner('bottom-left')
    ];
    return {
        minX: Math.min(...corners.map(c => c.x)),
        minY: Math.min(...corners.map(c => c.y)),
        maxX: Math.max(...corners.map(c => c.x)),
        maxY: Math.max(...corners.map(c => c.y)),
    };
}

/**
 * Represents a drawable, interactive shape on the canvas.
 * Manages its own state, including position, size, appearance, and animation properties.
 */
class Shape {
    constructor({ id, name, shape, x, y, width, height, rotation, gradient, gradType, gradientDirection, scrollDirection, cycleColors, cycleSpeed, animationSpeed, ctx, innerDiameter, angularWidth, numberOfSegments, rotationSpeed, useSharpGradient, gradientStop, locked, numberOfRows, numberOfColumns, phaseOffset, animationMode, text, fontFamily, fontSize, fontWeight, textAlign, pixelFont, textAnimation, textAnimationSpeed, showTime, showDate, lineWidth, waveType, frequency, oscDisplayMode, pulseDepth, fillShape }) {
        this.id = id;
        this.name = name || `Object ${id}`;
        this.shape = shape;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.rotation = rotation || 0;
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
        this.rotationAngle = 0;
        this.animationAngle = 0;
        this.useSharpGradient = useSharpGradient !== undefined ? useSharpGradient : false;
        this.gradientStop = gradientStop !== undefined ? parseFloat(gradientStop) : 50;
        this.locked = locked || false;
        this.numberOfRows = numberOfRows || 1;
        this.numberOfColumns = numberOfColumns || 1;
        this.phaseOffset = phaseOffset || 10;
        this.cellOrder = [];
        this._shuffleCellOrder();
        this.handleSize = 15;
        this.rotationHandleOffset = -30;
        this.rotationHandleRadius = 15;
        this.handles = [{ name: 'top-left', cursor: 'nwse-resize' }, { name: 'top', cursor: 'ns-resize' }, { name: 'top-right', cursor: 'nesw-resize' }, { name: 'left', cursor: 'ew-resize' }, { name: 'right', cursor: 'ew-resize' }, { name: 'bottom-left', cursor: 'nesw-resize' }, { name: 'bottom', cursor: 'ns-resize' }, { name: 'bottom-right', cursor: 'nwse-resize' }];
        this.randomColorTimer = 0;
        this.cellColors = [];
        this.text = text || 'Hello';
        this.fontFamily = fontFamily || 'Arial';
        this.fontSize = fontSize || 60;
        this.fontWeight = fontWeight || 'bold';
        this.textAlign = textAlign || 'center';
        this.pixelFont = pixelFont || 'small';
        this.textAnimation = textAnimation || 'none';
        this.textAnimationSpeed = textAnimationSpeed || 10;
        this.scrollOffsetX = 0;
        this.visibleCharCount = 0;
        this.waveAngle = 0;
        this.typewriterWaitTimer = 0;
        this.showTime = showTime || false;
        this.showDate = showDate || false;
        this.lineWidth = lineWidth || 2;
        this.waveType = waveType || 'sine';
        this.frequency = frequency || 5;
        this.pulseDepth = pulseDepth !== undefined ? pulseDepth : 50;
        this.fillShape = fillShape || false;
        this.oscDisplayMode = oscDisplayMode || 'linear';
        this.waveMinY = this.y;
        this.waveMaxY = this.y + this.height;
        this._pausedRotationSpeed = null;
    }

    getDisplayText() {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const year = now.getFullYear();
        const dateString = `${month}/${day}/${year}`;
        if (this.showDate && this.showTime) {
            return `${dateString} ${timeString}`;
        } else if (this.showTime) {
            return timeString;
        } else if (this.showDate) {
            return dateString;
        }
        return this.text || '';
    }

    getWrappedText() {
        const text = this.getDisplayText();
        return text;
    }

    _updateTextMetrics() {
        if (this.shape !== 'text' || !this.ctx) return;
        const fontData = this.pixelFont === 'large' ? FONT_DATA_5PX : FONT_DATA_4PX;
        const { charWidth, charHeight, charSpacing, lineSpacing } = fontData;
        const textToMeasure = this.getWrappedText() || ' ';
        const lines = textToMeasure.split('\n');
        const pixelSize = this.fontSize / 10;
        const textBlockHeight = lines.length * (charHeight + lineSpacing) * pixelSize - (lineSpacing * pixelSize);
        this.height = textBlockHeight + (2 * pixelSize);
    }

    _shuffleCellOrder() {
        const totalCells = this.numberOfRows * this.numberOfColumns;
        this.cellOrder = Array.from({ length: totalCells }, (_, i) => i);
        for (let i = this.cellOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cellOrder[i], this.cellOrder[j]] = [this.cellOrder[j], this.cellOrder[i]];
        }
    }

    getCenter() {
        return { x: this.x + this.width / 2, y: this.y + this.height / 2 };
    }

    getRenderAngle() {
        return (this.rotationSpeed !== 0) ? this.rotationAngle : (this.rotation * Math.PI / 180);
    }

    getWorldCoordsOfCorner(handleName) {
        const center = this.getCenter();
        const halfW = this.width / 2;
        let halfH = this.height / 2;

        if (this.shape === 'oscilloscope') {
            const waveHeight = this.waveMaxY - this.waveMinY;
            halfH = waveHeight / 2;
        }

        let localCorner = { x: 0, y: 0 };
        if (handleName.includes('left')) localCorner.x = -halfW;
        if (handleName.includes('right')) localCorner.x = halfW;
        if (handleName.includes('top')) localCorner.y = -halfH;
        if (handleName.includes('bottom')) localCorner.y = halfH;

        const angle = this.getRenderAngle();
        const s = Math.sin(angle);
        const c = Math.cos(angle);
        const rotatedX = localCorner.x * c - localCorner.y * s;
        const rotatedY = localCorner.x * s + localCorner.y * c;

        return { x: center.x + rotatedX, y: center.y + rotatedY };
    }

    getHandleAtPoint(px, py) {
        if (this.locked) return null;
        let minX, minY, bbWidth, bbHeight;

        if (this.shape === 'circle' || this.shape === 'ring') {
            const center = this.getCenter();
            bbWidth = this.width;
            bbHeight = this.height;
            minX = center.x - bbWidth / 2;
            minY = center.y - bbHeight / 2;
        } else {
            const corners = [
                this.getWorldCoordsOfCorner('top-left'),
                this.getWorldCoordsOfCorner('top-right'),
                this.getWorldCoordsOfCorner('bottom-right'),
                this.getWorldCoordsOfCorner('bottom-left')
            ];
            minX = Math.min(...corners.map(c => c.x));
            minY = Math.min(...corners.map(c => c.y));
            const maxX = Math.max(...corners.map(c => c.x));
            const maxY = Math.max(...corners.map(c => c.y));
            bbWidth = maxX - minX;
            bbHeight = maxY - minY;
        }

        const maxX = minX + bbWidth;
        const maxY = minY + bbHeight;

        const topMargin = 40;
        let rotHandleY;
        if (minY < topMargin) { rotHandleY = maxY - this.rotationHandleOffset; }
        else { rotHandleY = minY + this.rotationHandleOffset; }
        const rotHandleX = minX + bbWidth / 2;
        const dist = Math.sqrt(Math.pow(px - rotHandleX, 2) + Math.pow(py - rotHandleY, 2));
        if (dist <= this.rotationHandleRadius + this.handleSize / 2) {
            return { name: 'rotate', cursor: 'crosshair', type: 'rotation' };
        }

        const h2 = this.handleSize / 2;
        const handlePositions = {
            'top-left': { x: minX, y: minY }, 'top': { x: minX + bbWidth / 2, y: minY }, 'top-right': { x: maxX, y: minY },
            'left': { x: minX, y: minY + bbHeight / 2 }, 'right': { x: maxX, y: minY + bbHeight / 2 },
            'bottom-left': { x: minX, y: maxY }, 'bottom': { x: minX + bbWidth / 2, y: maxY }, 'bottom-right': { x: maxX, y: maxY }
        };
        for (const handle of this.handles) {
            const pos = handlePositions[handle.name];
            if (px >= pos.x - h2 && px <= pos.x + h2 && py >= pos.y - h2 && py <= pos.y + h2) {
                return handle;
            }
        }

        return null;
    }

    isPointInside(px, py) {
        const center = this.getCenter();
        const angle = -this.getRenderAngle();
        const dx = px - center.x;
        const dy = py - center.y;
        const local_dx = dx * Math.cos(angle) - dy * Math.sin(angle);
        const local_dy = dx * Math.sin(angle) + dy * Math.cos(angle);
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        return (local_dx >= -halfWidth && local_dx <= halfWidth &&
            local_dy >= -halfHeight && local_dy <= halfHeight);
    }

    update(props) {
        const textChanged = props.text !== undefined && props.text !== this.text;
        const animationChanged = props.textAnimation !== undefined && props.textAnimation !== this.textAnimation;
        if ((textChanged && this.textAnimation === 'typewriter') || (animationChanged && props.textAnimation === 'typewriter')) {
            this.visibleCharCount = 0;
            this.typewriterWaitTimer = 0;
        }
        if ((textChanged && (this.textAnimation === 'marquee' || this.textAnimation === 'wave')) || (animationChanged && (this.textAnimation === 'marquee' || this.textAnimation === 'wave'))) {
            this.scrollOffsetX = 0;
            this.waveAngle = 0;
        }
        const oldRows = this.numberOfRows;
        const oldCols = this.numberOfColumns;
        for (const key in props) {
            if (props[key] !== undefined) {
                if (key === 'gradient' && typeof props[key] === 'object' && props[key] !== null) {
                    if (props.gradient.color1 !== undefined) this.gradient.color1 = props.gradient.color1;
                    if (props.gradient.color2 !== undefined) this.gradient.color2 = props.gradient.color2;
                } else {
                    // FIX: Removed hasOwnProperty check to allow all properties from the form to update.
                    this[key] = props[key];
                }
            }
        }
        if (this.numberOfRows !== oldRows || this.numberOfColumns !== oldCols) {
            this._shuffleCellOrder();
        }
        if (this.shape === 'text') {
            this._updateTextMetrics();
        }
    }

    updateAnimationState() {
        if (this.cycleColors) {
            this.hue1 += this.cycleSpeed;
            this.hue2 += this.cycleSpeed;
        }
        const currentText = this.getDisplayText();
        const textSpeed = this.textAnimationSpeed / 100;
        switch (this.textAnimation) {
            case 'marquee':
            case 'wave':
                const fontData = this.pixelFont === 'large' ? FONT_DATA_5PX : FONT_DATA_4PX;
                const pixelSize = this.fontSize / 10;
                const textWidth = currentText.length * (fontData.charWidth + fontData.charSpacing) * pixelSize;
                this.scrollOffsetX -= textSpeed * 20;
                if (this.scrollOffsetX < -textWidth) { this.scrollOffsetX = this.width; }
                if (this.textAnimation === 'wave') { this.waveAngle += textSpeed; }
                this.visibleCharCount = currentText.length;
                break;
            case 'typewriter':
                if (this.typewriterWaitTimer > 0) {
                    this.typewriterWaitTimer--;
                    if (this.typewriterWaitTimer <= 0) { this.visibleCharCount = 0; }
                } else {
                    this.visibleCharCount += textSpeed;
                    if (this.visibleCharCount >= currentText.length) {
                        this.visibleCharCount = currentText.length;
                        this.typewriterWaitTimer = 50;
                    }
                }
                this.scrollOffsetX = 0;
                break;
            default:
                this.scrollOffsetX = 0;
                this.visibleCharCount = currentText.length;
                break;
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
                        if (this.animationMode === 'bounce-random') { this._shuffleCellOrder(); }
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
                    } else {
                        this.scrollOffset += increment;
                        const forwardBoundary = 1.0;
                        if (this.scrollOffset >= forwardBoundary) {
                            this.scrollOffset = forwardBoundary;
                            this.animationState = 'waiting';
                            this.waitTimer = 30;
                        }
                    }
                }
            } else {
                const directionMultiplier = (this.scrollDirection === 'right' || this.scrollDirection === 'down') ? 1 : -1;
                this.scrollOffset += increment * directionMultiplier;
                this.scrollOffset = (this.scrollOffset % 1.0 + 1.0) % 1.0;
            }
        }

        const rotationIncrement = (this.rotationSpeed || 0) / 1000;
        this.rotationAngle += rotationIncrement;

        const animationIncrement = (this.animationSpeed || 0) * 0.05;
        this.animationAngle += animationIncrement;
    }

    createFillStyle(phase = 0) {
        let phaseIndex = phase;
        if (this.animationMode === 'bounce-random') {
            if (this.cellOrder && this.cellOrder.length > phase) { phaseIndex = this.cellOrder[phase]; }
        } else if (this.animationMode === 'bounce-reversed' && this.isReversing) {
            const lastCellIndex = Math.max(0, (this.numberOfRows * this.numberOfColumns) - 1);
            phaseIndex = lastCellIndex - phase;
        }
        const phaseIncrement = this.phaseOffset / 100.0;
        const effectiveScrollOffset = this.scrollOffset + phaseIndex * phaseIncrement;
        const p = this.animationMode === 'loop' ? (effectiveScrollOffset % 1.0 + 1.0) % 1.0 : effectiveScrollOffset;
        const c1 = this.cycleColors ? `hsl(${(this.hue1 + phase * this.phaseOffset) % 360}, 100%, 50%)` : this.gradient.color1;
        const c2 = this.cycleColors ? `hsl(${(this.hue2 + phase * this.phaseOffset) % 360}, 100%, 50%)` : this.gradient.color2;
        const isLinear = this.gradType && this.gradType.includes('linear');
        const isRadial = this.gradType && this.gradType.includes('radial');
        if (this.gradType === 'alternating') { return (phase % 2 === 0) ? c1 : c2; }
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
                    const p1 = p; const p2 = p1 + stopRatio;
                    if (p2 > 1.0) {
                        const wrapped_p2 = p2 - 1.0;
                        grad.addColorStop(0, c1); grad.addColorStop(wrapped_p2, c1);
                        grad.addColorStop(wrapped_p2, c2); grad.addColorStop(p1, c2);
                        grad.addColorStop(p1, c1); grad.addColorStop(1, c1);
                    } else {
                        grad.addColorStop(0, c2); grad.addColorStop(p1, c2);
                        grad.addColorStop(p1, c1); grad.addColorStop(p2, c1);
                        grad.addColorStop(p2, c2); grad.addColorStop(1, c2);
                    }
                } else {
                    const p1 = p; const p2 = p1 + stopRatio;
                    const clamped_p1 = Math.max(0, Math.min(1, p1));
                    const clamped_p2 = Math.max(0, Math.min(1, p2));
                    grad.addColorStop(0, c2);
                    if (clamped_p1 > 0) grad.addColorStop(clamped_p1, c2);
                    if (clamped_p1 < clamped_p2) {
                        grad.addColorStop(clamped_p1, c1); grad.addColorStop(clamped_p2, c1);
                    }
                    if (clamped_p2 < 1) grad.addColorStop(clamped_p2, c2);
                    grad.addColorStop(1, c2);
                }
            } else {
                const stops = [{ pos: 0, color: getPatternColor(0 - p, c1, c2) }];
                for (let i = -2; i <= 2; i++) {
                    const c1_pos = i + p; const c2_pos = i + 0.5 + p;
                    if (c1_pos > 0 && c1_pos < 1) stops.push({ pos: c1_pos, color: c1 });
                    if (c2_pos > 0 && c2_pos < 1) stops.push({ pos: c2_pos, color: c2 });
                }
                stops.push({ pos: 1, color: getPatternColor(1 - p, c1, c2) });
                const uniqueStops = stops.sort((a, b) => a.pos - b.pos).filter((stop, index, self) => index === 0 || stop.pos > self[index - 1].pos);
                uniqueStops.forEach(stop => grad.addColorStop(stop.pos, stop.color));
            }
            return grad;
        } else if (isRadial) {
            const centerX = this.x + this.width / 2; const centerY = this.y + this.height / 2;
            const maxRadius = Math.max(this.width, this.height) / 2;
            const grad = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
            const radialP = (p % 1.0 + 1.0) % 1.0;
            const wave = 1 - Math.abs(2 * radialP - 1);
            if (this.useSharpGradient) {
                const stopPoint = (this.gradientStop / 100) * wave;
                grad.addColorStop(0, c1); grad.addColorStop(stopPoint, c1);
                grad.addColorStop(Math.min(1, stopPoint + 0.001), c2); grad.addColorStop(1, c2);
            } else {
                const gradientStopPosition = this.gradientStop / 100.0;
                const midPoint = gradientStopPosition * wave;
                grad.addColorStop(0, c1); grad.addColorStop(midPoint, c2); grad.addColorStop(1, c1);
            }
            return grad;
        }
        return c1 || 'black';
    }

    draw(isSelected) {
        if (isSelected && this.rotationSpeed !== 0) {
            this.rotation = (this.rotationAngle * 180 / Math.PI) % 360;
            this._pausedRotationSpeed = this.rotationSpeed;
            this.rotationSpeed = 0;
        } else if (!isSelected && this._pausedRotationSpeed !== null) {
            this.rotationSpeed = this._pausedRotationSpeed;
            this._pausedRotationSpeed = null;
        }

        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const angleToUse = this.getRenderAngle();
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(angleToUse);
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
            if (isRandom) {
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
                        if (!this.cellColors[cellIndex]) { this.cellColors[cellIndex] = Math.random() < 0.5 ? c1 : c2; }
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
        } else if (this.shape === 'text') {
            this.ctx.fillStyle = this.createFillStyle();
            drawPixelText(this.ctx, this);
        } else if (this.shape === 'oscilloscope') {
            this.ctx.lineWidth = this.lineWidth;
            this.ctx.beginPath();

            if (this.oscDisplayMode === 'radial') {
                const radialCenterX = this.x + this.width / 2;
                const radialCenterY = this.y + this.height / 2;
                const frequency = this.frequency;
                const totalRadius = Math.min(this.width, this.height) / 2;
                const pulseRatio = (this.pulseDepth || 0) / 100.0;
                const baseRadius = totalRadius * (0.5 + pulseRatio * 0.5);
                const maxAmplitude = totalRadius - baseRadius;
                const breathFactor = 1 + Math.sin(this.animationAngle) * 0.2;

                for (let i = 0; i <= 360; i++) {
                    const angleRad = (i * Math.PI) / 180;
                    const progress = i / 360;
                    const waveFuncAngle = 2 * Math.PI * frequency * progress + this.animationAngle * 2;
                    let y_wave;
                    switch (this.waveType) {
                        case 'square': y_wave = Math.sin(waveFuncAngle) >= 0 ? 1 : -1; break;
                        case 'sawtooth': y_wave = (((waveFuncAngle / (2 * Math.PI)) % 1) * 2) - 1; break;
                        case 'triangle': y_wave = Math.asin(Math.sin(waveFuncAngle)) * (2 / Math.PI); break;
                        case 'sine': default: y_wave = Math.sin(waveFuncAngle); break;
                    }
                    const modulatedRadius = baseRadius + y_wave * maxAmplitude;
                    const finalRadius = modulatedRadius * breathFactor;
                    const px = radialCenterX + finalRadius * Math.cos(angleRad);
                    const py = radialCenterY + finalRadius * Math.sin(angleRad);
                    if (i === 0) { this.ctx.moveTo(px, py); } else { this.ctx.lineTo(px, py); }
                }
                this.ctx.closePath();
                this.waveMinY = radialCenterY - totalRadius * breathFactor;
                this.waveMaxY = radialCenterY + totalRadius * breathFactor;

            } else { // Linear mode
                const waveCenterY = this.y + this.height / 2;
                const amplitude = this.height / 2;
                const frequency = this.frequency;
                let minY = Infinity, maxY = -Infinity;
                for (let i = 0; i <= this.width; i++) {
                    const progress = i / this.width;
                    const angle = 2 * Math.PI * frequency * progress + this.animationAngle;
                    let y_wave;
                    switch (this.waveType) {
                        case 'square': y_wave = Math.sin(angle) >= 0 ? 1 : -1; break;
                        case 'sawtooth': y_wave = 2 * (progress * frequency - Math.floor(0.5 + progress * frequency)); break;
                        case 'triangle': y_wave = Math.asin(Math.sin(angle)) * (2 / Math.PI); break;
                        case 'sine': default: y_wave = Math.sin(angle); break;
                    }
                    const px = this.x + i;
                    const py = waveCenterY - y_wave * amplitude;
                    if (py < minY) minY = py;
                    if (py > maxY) maxY = py;
                    if (i === 0) { this.ctx.moveTo(px, py); } else { this.ctx.lineTo(px, py); }
                }

                if (this.fillShape) {
                    this.ctx.lineTo(this.x + this.width, this.y + this.height);
                    this.ctx.lineTo(this.x, this.y + this.height);
                    this.ctx.closePath();
                }

                this.waveMinY = minY;
                this.waveMaxY = maxY;
            }

            if (this.fillShape) {
                this.ctx.fillStyle = this.createFillStyle();
                this.ctx.fill();
            }
            this.ctx.strokeStyle = this.createFillStyle();
            this.ctx.stroke();

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
        this.ctx.restore();
    }

    drawSelectionUI() {
        const selectionColor = this.locked ? 'orange' : '#00f6ff';
        this.ctx.save();
        this.ctx.strokeStyle = selectionColor;
        this.ctx.fillStyle = selectionColor;
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);

        let minX, minY, bbWidth, bbHeight;

        if (this.shape === 'circle' || this.shape === 'ring') {
            const center = this.getCenter();
            bbWidth = this.width;
            bbHeight = this.height;
            minX = center.x - bbWidth / 2;
            minY = center.y - bbHeight / 2;
        } else {
            const corners = [
                this.getWorldCoordsOfCorner('top-left'),
                this.getWorldCoordsOfCorner('top-right'),
                this.getWorldCoordsOfCorner('bottom-right'),
                this.getWorldCoordsOfCorner('bottom-left')
            ];
            minX = Math.min(...corners.map(c => c.x));
            minY = Math.min(...corners.map(c => c.y));
            const maxX = Math.max(...corners.map(c => c.x));
            const maxY = Math.max(...corners.map(c => c.y));
            bbWidth = maxX - minX;
            bbHeight = maxY - minY;
        }

        this.ctx.strokeRect(minX, minY, bbWidth, bbHeight);
        this.ctx.setLineDash([]);

        const h2 = this.handleSize / 2;
        const maxX = minX + bbWidth;
        const maxY = minY + bbHeight;
        const handlePositions = [
            { x: minX - h2, y: minY - h2 }, { x: minX + bbWidth / 2 - h2, y: minY - h2 }, { x: maxX - h2, y: minY - h2 },
            { x: minX - h2, y: minY + bbHeight / 2 - h2 }, { x: maxX - h2, y: minY + bbHeight / 2 - h2 },
            { x: minX - h2, y: maxY - h2 }, { x: minX + bbWidth / 2 - h2, y: maxY - h2 }, { x: maxX - h2, y: maxY - h2 }
        ];
        handlePositions.forEach(pos => this.ctx.fillRect(pos.x, pos.y, this.handleSize, this.handleSize));

        const topMargin = 40;
        let handleY;
        let stemStartY;
        const handleX = minX + bbWidth / 2;
        if (minY < topMargin) {
            stemStartY = maxY;
            handleY = maxY - this.rotationHandleOffset;
        } else {
            stemStartY = minY;
            handleY = minY + this.rotationHandleOffset;
        }
        this.ctx.beginPath();
        this.ctx.moveTo(handleX, stemStartY);
        this.ctx.lineTo(handleX, handleY);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.arc(handleX, handleY, this.rotationHandleRadius, 0, 2 * Math.PI);
        this.ctx.fill();

        this.ctx.restore();

        if (this.locked) {
            const centerX = minX + bbWidth / 2;
            const centerY = minY + bbHeight / 2;
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('🔒', centerX, centerY);
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // --- DOM Element References ---
    const ADMIN_UID = 'zMj8mtfMjXeFMt072027JT7Jc7i1';
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    const canvas = document.getElementById('signalCanvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    canvas.width = 1280;
    canvas.height = 800;
    const canvasContainer = document.getElementById('canvas-container');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Failed to get 2D context');
        return;
    }
    const form = document.getElementById('controls-form');
    const outputScriptArea = document.getElementById('output-script');
    const copyBtn = document.getElementById('copy-btn');
    // const copyToastEl = document.getElementById('copy-toast');
    // const copyToast = new bootstrap.Toast(copyToastEl);
    const toolbar = document.getElementById('toolbar');
    const constrainBtn = document.getElementById('constrain-btn');
    // const loadProjectModalEl = document.getElementById('load-project-modal');
    // const loadProjectModal = new bootstrap.Modal(loadProjectModalEl);
    // const loadProjectList = document.getElementById('load-project-list');
    const exportBtn = document.getElementById('export-btn');
    // const saveProjectModalEl = document.getElementById('save-project-modal');
    // const saveProjectModal = new bootstrap.Modal(saveProjectModalEl);
    // const saveProjectNameInput = document.getElementById('save-project-name-input');
    // const confirmSaveBtn = document.getElementById('confirm-save-btn');
    // const existingProjectList = document.getElementById('save-project-existing-list');
    // const notificationModalEl = document.getElementById('notification-modal');
    // const notificationModal = new bootstrap.Modal(notificationModalEl);
    // const notificationModalBody = document.getElementById('notification-modal-body');
    // const confirmOverwriteModalEl = document.getElementById('confirm-overwrite-modal');
    // const confirmOverwriteModal = new bootstrap.Modal(confirmOverwriteModalEl);
    // const confirmOverwriteBtn = document.getElementById('confirm-overwrite-btn');
    const shareBtn = document.getElementById('share-btn');
    const addObjectBtn = document.getElementById('add-object-btn');
    const confirmImportBtn = document.getElementById('confirm-import-btn');
    const confirmBtn = document.getElementById('confirm-overwrite-btn');
    // const confirmModalEl = document.getElementById('confirm-overwrite-modal');
    const coordsDisplay = document.getElementById('coords-display');

    // --- State Management ---
    let isRestoring = false; // Prevents history recording during an undo/redo action
    let configStore = [];
    let objects = [];
    let selectedObjectIds = [];
    let needsRedraw = false;
    let isDragging = false;
    let isResizing = false;
    let isRotating = false;
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
    let lastVisibleDoc = null; // For lazy loading pagination
    let isLoadingMore = false; // To prevent multiple simultaneous loads
    let currentGalleryQuery = null; // To store the query for lazy loading
    let currentProjectDocId = null; // Tracks the current saved project ID
    let confirmActionCallback = null; // For the confirmation modal
    let exportPayload = {};

    const galleryOffcanvasEl = document.getElementById('gallery-offcanvas');
    const galleryList = document.getElementById('gallery-project-list');
    const galleryBody = galleryOffcanvasEl.querySelector('.offcanvas-body');


    const history = {
        stack: [],
        index: -1,
        maxSize: 50, // Limit the number of undo steps

        /**
         * Pushes a new state to the history stack.
         * @param {object} state - A snapshot of the current application state.
         */
        push(state) {
            if (isRestoring) return; // Don't record history when restoring a state

            // If we've undone actions, new actions should clear the "redo" stack
            if (this.index < this.stack.length - 1) {
                this.stack = this.stack.slice(0, this.index + 1);
            }

            this.stack.push(state);

            // Trim the stack if it exceeds the maximum size
            if (this.stack.length > this.maxSize) {
                this.stack.shift();
            }

            this.index = this.stack.length - 1;
            updateUndoRedoButtons();
        },

        /**
         * Moves to the previous state in the history.
         */
        undo() {
            if (this.index > 0) {
                this.index--;
                restoreState(this.stack[this.index]);
            }
        },

        /**
         * Moves to the next state in the history (redoes an undo).
         */
        redo() {
            if (this.index < this.stack.length - 1) {
                this.index++;
                restoreState(this.stack[this.index]);
            }
        },
    };

    const debouncedRecordHistory = debounce(recordHistory);

    async function toggleFeaturedStatus(buttonEl, docIdToToggle) {
        buttonEl.disabled = true;
        buttonEl.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';

        try {
            const projectsRef = window.collection(window.db, "projects");
            const docToToggleRef = window.doc(projectsRef, docIdToToggle);

            // --- THE FIX IS HERE ---
            // Step 1: Perform all READS before the transaction begins.
            // Find any effect that is currently featured.
            const q = window.query(projectsRef, window.where("featured", "==", true));
            const currentlyFeaturedSnapshot = await window.getDocs(q);

            // Step 2: Perform all WRITES inside the transaction.
            await window.runTransaction(window.db, async (transaction) => {
                const docToToggleSnap = await transaction.get(docToToggleRef);
                if (!docToToggleSnap.exists()) {
                    throw new Error("Document does not exist!");
                }

                const isCurrentlyFeatured = docToToggleSnap.data().featured === true;
                const newFeaturedState = !isCurrentlyFeatured;

                // If we are about to feature this item...
                if (newFeaturedState === true) {
                    // ...un-feature all other items found in our read step.
                    currentlyFeaturedSnapshot.forEach((doc) => {
                        transaction.update(doc.ref, { featured: false });
                    });
                }

                // Finally, set the new featured state on the document we clicked.
                transaction.update(docToToggleRef, { featured: newFeaturedState });
            });

            // --- UI update logic (unchanged) ---
            const allFeatureButtons = document.querySelectorAll('.btn-feature');
            allFeatureButtons.forEach(btn => {
                if (btn.dataset.docId === docIdToToggle) {
                    const isNowFeatured = !buttonEl.classList.contains('btn-warning');
                    btn.className = `btn btn-sm btn-feature ${isNowFeatured ? 'btn-warning' : 'btn-outline-warning'}`;
                    btn.innerHTML = isNowFeatured ? '<i class="bi bi-star-fill"></i>' : '<i class="bi bi-star"></i>';
                    btn.title = isNowFeatured ? 'Unfeature this effect' : 'Feature this effect';
                } else {
                    btn.className = 'btn btn-sm btn-feature btn-outline-warning';
                    btn.innerHTML = '<i class="bi bi-star"></i>';
                    btn.title = 'Feature this effect';
                }
            });

            showToast("Featured effect updated successfully!", 'success');

        } catch (error) {
            console.error("Error updating featured status: ", error);
            showToast("Failed to update featured status.", 'danger');
        } finally {
            buttonEl.disabled = false;
            // The UI update above will replace the spinner, so no need to restore innerHTML here.
        }
    }

    function drawSnapLines(snapLines) {
        ctx.save();
        ctx.resetTransform();
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);
        snapLines.forEach(line => {
            if (line.duration <= 0) return;
            ctx.strokeStyle = line.snapType === 'center' ? 'purple' : line.type === 'horizontal' ? 'blue' : 'red';
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            if (line.type === 'horizontal') {
                ctx.moveTo(0, line.y);
                ctx.lineTo(canvas.width, line.y);
            } else if (line.type === 'vertical') {
                ctx.moveTo(line.x, 0);
                ctx.lineTo(line.x, canvas.height);
            }
            ctx.stroke();
            ctx.globalAlpha = 1.0;
        });
        ctx.restore();
    }

    /**
     * Updates the enabled/disabled state of the undo/redo buttons.
     */
    function updateUndoRedoButtons() {
        if (undoBtn) undoBtn.disabled = history.index <= 0;
        if (redoBtn) redoBtn.disabled = history.index >= history.stack.length - 1;
    }

    /**
     * Captures a serializable snapshot of the application's current state.
     * @returns {object} The current state snapshot.
     */
    function getCurrentState() {
        // Create a deep, plain-object copy of the objects array
        const plainObjects = JSON.parse(JSON.stringify(objects, (key, value) => {
            if (key === 'ctx') return undefined; // Exclude non-serializable canvas context
            return value;
        }));

        // This now correctly saves the objects, the form's structure, and the selection state.
        return {
            objects: plainObjects,
            configs: JSON.parse(JSON.stringify(configStore)),
            selectedObjectIds: JSON.parse(JSON.stringify(selectedObjectIds)),
        };
    }

    /**
     * A wrapper function to simplify recording the current state to history.
     */
    function recordHistory() {
        history.push(getCurrentState());
    }

    /**
     * Restores the application to a given state snapshot.
     * @param {object} state - The state object to restore.
     */
    function restoreState(state) {
        isRestoring = true;

        // Restore all parts of the application state from history
        objects = state.objects.map(data => new Shape({ ...data, ctx }));
        configStore = state.configs; // <-- This correctly restores the form's blueprint
        selectedObjectIds = state.selectedObjectIds;

        // Re-render the entire UI based on the fully restored state
        renderForm();
        updateFormValuesFromObjects();
        drawFrame();
        updateToolbarState();
        updateUndoRedoButtons();

        isRestoring = false;
    }

    /**
     * Clears all objects and resets the workspace to a blank state.
     */
    function resetWorkspace() {
        // Clear all object-specific data
        objects = [];
        configStore = configStore.filter(c => !(c.property || c.name).startsWith('obj'));
        selectedObjectIds = [];

        // Reset the undo/redo history
        history.stack = [];
        history.index = -1;

        // Reset the project title
        const titleInput = form.elements['title'];
        if (titleInput) titleInput.value = 'Untitled Effect';

        // Update the entire UI
        renderForm();
        drawFrame();
        updateUndoRedoButtons();

        // Record this new, blank state as the first history entry
        recordHistory();

        // Clear any saved project ID from the session
        currentProjectDocId = null;
        updateShareButtonState();

        showToast("New workspace created.", "info");
    }




    /**
     * Updates the enabled/disabled state of the share button.
     */
    function updateShareButtonState() {
        shareBtn.disabled = !currentProjectDocId;
    }

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
            li.id = `gallery-item-${project.docId}`; // Add an ID for easy access

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
            infoDiv.style.minWidth = '0';

            const nameEl = document.createElement('strong');
            nameEl.textContent = project.name;
            const metaEl = document.createElement('small');
            metaEl.className = 'd-block text-body-secondary';
            const formattedDate = project.createdAt ? project.createdAt.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown Date';
            metaEl.textContent = `By ${project.creatorName || 'Anonymous'} on ${formattedDate}`;

            infoDiv.appendChild(nameEl);
            if (project.configs) {
                const descriptionConf = project.configs.find(c => c.name === 'description');
                if (descriptionConf && descriptionConf.default) {
                    const descEl = document.createElement('p');
                    descEl.className = 'mb-0 mt-1 small text-body-secondary';
                    descEl.textContent = descriptionConf.default;
                    descEl.title = descriptionConf.default;
                    infoDiv.appendChild(descEl);
                }
            }
            contentDiv.appendChild(infoDiv);
            li.appendChild(contentDiv);

            const controlsDiv = document.createElement('div');
            controlsDiv.className = 'd-flex flex-column gap-1';

            // Load Button
            const loadBtn = document.createElement('button');
            loadBtn.className = 'btn btn-sm btn-outline-primary';
            loadBtn.innerHTML = '<i class="bi bi-box-arrow-down"></i>';
            loadBtn.title = "Load Effect";
            loadBtn.onclick = () => {
                loadWorkspace(project);
                const galleryOffcanvas = bootstrap.Offcanvas.getInstance(galleryOffcanvasEl);
                galleryOffcanvas.hide();
                showToast(`Effect "${project.name}" loaded!`, 'success');
            };
            controlsDiv.appendChild(loadBtn);

            // Delete Button (only for the project owner)
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
                        }
                    );
                };
                controlsDiv.appendChild(deleteBtn);
            }

            // ================= START: NEW ADMIN "FEATURE" BUTTON =================
            // Show the button only if the logged-in user is the admin
            if (currentUser && currentUser.uid === ADMIN_UID) {
                const featureBtn = document.createElement('button');
                const isFeatured = project.featured === true;

                featureBtn.className = `btn btn-sm btn-feature ${isFeatured ? 'btn-warning' : 'btn-outline-warning'}`;
                featureBtn.innerHTML = isFeatured ? '<i class="bi bi-star-fill"></i>' : '<i class="bi bi-star"></i>';
                featureBtn.title = isFeatured ? 'Unfeature this effect' : 'Feature this effect';
                featureBtn.dataset.docId = project.docId;

                featureBtn.onclick = function () { // Use a standard function to get `this`
                    toggleFeaturedStatus(this, project.docId);
                };

                controlsDiv.appendChild(featureBtn);
            }
            // ================== END: NEW ADMIN "FEATURE" BUTTON ==================

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
        const {
            property,
            name,
            label,
            type,
            default: defaultValue,
            values,
            min,
            max
        } = config;
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
        } else if (type === 'textarea' || type === 'textfield') { // This condition is now updated
            const textarea = document.createElement('textarea');
            textarea.id = controlId;
            textarea.className = 'form-control';
            textarea.name = controlId;
            textarea.rows = 3;
            textarea.textContent = defaultValue;
            formGroup.appendChild(textarea);
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

    function generateOutputScript() {
        let scriptHTML = '';
        const generalValues = getControlValues();

        configStore.filter(c => {
            const key = c.property || c.name;
            return key && !key.startsWith('obj');
        }).forEach(conf => {
            const key = conf.property || conf.name;
            if (generalValues[key] !== undefined) {
                if (conf.name && !conf.property) {
                    scriptHTML += `<meta ${key}="${generalValues[key]}" />\n`;
                } else {
                    const attrs = Object.keys(conf).filter(attr => attr !== 'default').map(attrName => `${attrName}="${conf[attrName]}"`).join(' ');
                    scriptHTML += `<meta ${attrs} default="${generalValues[key]}" />\n`;
                }
            }
        });

        objects.forEach(obj => {
            const name = obj.name || `Object ${obj.id}`;
            const allPossibleConfigs = getDefaultObjectConfig(obj.id);
            const propsToScale = ['x', 'y', 'width', 'height', 'innerDiameter', 'fontSize'];

            allPossibleConfigs.forEach(conf => {
                const propName = conf.property.substring(conf.property.indexOf('_') + 1);
                let value = obj[propName];

                if (propName.startsWith('gradColor')) {
                    const colorKey = propName.replace('gradColor', 'color');
                    if (obj.gradient) value = obj.gradient[colorKey];
                } else if (propName === 'scrollDir') {
                    value = obj.scrollDirection;
                }

                if (value === undefined || value === null) {
                    value = conf.default;
                }

                if (typeof value === 'boolean') {
                    value = String(value);
                }

                if (conf.type === 'number') {
                    if (propName === 'animationSpeed') {
                        value = Math.round(obj.animationSpeed * 10);
                    } else if (propName === 'cycleSpeed') {
                        value = Math.round(obj.cycleSpeed * 50);
                    } else if (propsToScale.includes(propName)) {
                        // Scale down pixel values by 4 for export
                        value = Math.round(parseFloat(value) / 4);
                    } else {
                        value = Math.round(parseFloat(value));
                    }
                }

                if (conf.type === 'textfield' && typeof value === 'string') {
                    value = value.replace(/\n/g, '\\n');
                }

                conf.label = `${name}: ${conf.label.split(':').slice(1).join(':').trim()}`;
                if (propName === 'width' && (obj.shape === 'circle' || obj.shape === 'ring')) {
                    conf.label = `${name}: Width/Outer Diameter`;
                }

                const attrs = Object.keys(conf).filter(attr => attr !== 'default' && attr !== 'type').map(attrName => `${attrName}="${conf[attrName]}"`).join(' ');
                scriptHTML += `<meta ${attrs} type="${conf.type}" default="${value}" />\n`;
            });
        });

        outputScriptArea.value = scriptHTML.trim();
    }

    /**
     * Renders the entire controls form based on the current `configStore` and `objects` state.
     * Preserves the collapsed state of panels during re-rendering.
     */
    // In main.js, replace the entire renderForm function.

    function renderForm() {
        const existingTooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        existingTooltips.forEach(el => {
            const tooltip = bootstrap.Tooltip.getInstance(el);
            if (tooltip) tooltip.dispose();
        });

        const collapseStates = {};
        const generalCollapseEl = form.querySelector('#collapse-general');
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
            const showObject = collapseStates[id] === true || selectedObjectIds.includes(id);
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
            collapseWrapper.appendChild(document.createElement('hr'));

            const groups = {
                'Transform & Shape': ['shape', 'x', 'y', 'width', 'height', 'rotation', 'rotationSpeed'],
                'Fill Style': ['gradType', 'useSharpGradient', 'gradientStop', 'gradColor1', 'gradColor2'],
                'Animation': ['animationMode', 'animationSpeed', 'scrollDir'],
                'Color Animation': ['cycleColors', 'cycleSpeed']
            };

            const currentShape = obj.shape;

            for (const groupName in groups) {
                const groupContainer = document.createElement('div');
                groupContainer.className = 'control-group card card-body bg-body mb-3';
                const groupHeader = document.createElement('h6');
                groupHeader.className = 'fs-5 text-body-secondary border-bottom pb-1 mb-3';
                groupHeader.textContent = groupName;
                groupContainer.appendChild(groupHeader);
                const propsInGroup = groups[groupName];
                objectConfigs
                    .filter(conf => {
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
            const oscilloscopeSettings = ['lineWidth', 'waveType', 'frequency', 'oscDisplayMode', 'pulseDepth', 'fillShape'];
            const textSubGroups = {
                'Text Content': ['text', 'pixelFont', 'fontSize', 'textAlign'],
                'Time & Date Display': ['showTime', 'showDate'],
                'Text Animation': ['textAnimation', 'textAnimationSpeed']
            };

            const ringGroup = document.createElement('div');
            ringGroup.className = 'control-group card card-body bg-body mb-3 ring-settings-group';
            ringGroup.style.display = currentShape === 'ring' ? 'block' : 'none';
            const ringHeader = document.createElement('h6');
            ringHeader.className = 'text-body-secondary border-bottom pb-1 mb-3';
            ringHeader.textContent = 'Ring Settings';
            ringGroup.appendChild(ringHeader);
            objectConfigs.filter(c => ringSettings.includes(c.property.substring(c.property.indexOf('_') + 1))).forEach(c => ringGroup.appendChild(createFormControl(c)));
            collapseWrapper.appendChild(ringGroup);

            const oscilloscopeGroup = document.createElement('div');
            oscilloscopeGroup.className = 'control-group card card-body bg-body mb-3 oscilloscope-settings-group';
            oscilloscopeGroup.style.display = currentShape === 'oscilloscope' ? 'block' : 'none';
            const oscilloscopeHeader = document.createElement('h6');
            oscilloscopeHeader.className = 'text-body-secondary border-bottom pb-1 mb-3';
            oscilloscopeHeader.textContent = 'Oscilloscope Settings';
            oscilloscopeGroup.appendChild(oscilloscopeHeader);
            objectConfigs.filter(c => oscilloscopeSettings.includes(c.property.substring(c.property.indexOf('_') + 1))).forEach(c => oscilloscopeGroup.appendChild(createFormControl(c)));
            collapseWrapper.appendChild(oscilloscopeGroup);

            const textGroup = document.createElement('div');
            textGroup.className = 'text-settings-group';
            textGroup.style.display = currentShape === 'text' ? 'block' : 'none';

            for (const subGroupName in textSubGroups) {
                const subGroupContainer = document.createElement('div');
                subGroupContainer.className = 'card card-body bg-body mb-2';
                const subGroupHeader = document.createElement('h6');
                subGroupHeader.className = 'fs-5 text-body-secondary border-bottom pb-1 mb-3';
                subGroupHeader.textContent = subGroupName;
                subGroupContainer.appendChild(subGroupHeader);
                const propsInSubGroup = textSubGroups[subGroupName];
                objectConfigs
                    .filter(c => propsInSubGroup.includes(c.property.substring(c.property.indexOf('_') + 1)))
                    .forEach(c => subGroupContainer.appendChild(createFormControl(c)));
                if (subGroupContainer.children.length > 1) {
                    textGroup.appendChild(subGroupContainer);
                }
            }
            collapseWrapper.appendChild(textGroup);

            const gridGroup = document.createElement('div');
            gridGroup.className = 'control-group card card-body bg-body mb-3 grid-settings-group';
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

        updateFormValuesFromObjects();
        new bootstrap.Tooltip(document.body, {
            selector: "[data-bs-toggle='tooltip']",
            trigger: 'hover'
        });
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
                const fieldsets = Array.from(form.querySelectorAll('fieldset[data-object-id]'));
                const newOrderedIds = fieldsets.map(fieldset => parseInt(fieldset.dataset.objectId, 10));

                // Reorder the main `objects` array to match the new visual order
                objects.sort((a, b) => newOrderedIds.indexOf(a.id) - newOrderedIds.indexOf(b.id));

                // The rendering loop respects the objects array order, so just redraw and save.
                updateObjectsFromForm();
                drawFrame();
                recordHistory();
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
                // FIXED: This now correctly reads the 'checked' property for all booleans,
                // including the 'enableAnimation' checkbox.
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
    function getCanvasCoordinates(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    /**
     * Enables or disables toolbar buttons based on the current selection.
     */
    function updateToolbarState() {
        const multiSelectButtons = toolbar.querySelectorAll('[data-action^="match-"]');
        const singleSelectButtons = toolbar.querySelectorAll('[data-action^="align-screen-"], [data-action="fit-canvas"]');
        const matchTextSizeBtn = document.getElementById('match-text-size-btn');

        singleSelectButtons.forEach(btn => btn.disabled = selectedObjectIds.length === 0);
        // Disable all generic "match" buttons if less than 2 objects are selected
        multiSelectButtons.forEach(btn => {
            if (btn.id !== 'match-text-size-btn') {
                btn.disabled = selectedObjectIds.length < 2;
            }
        });

        if (matchTextSizeBtn) {
            const selected = selectedObjectIds.map(id => objects.find(o => o.id === id)).filter(o => o);
            const textObjects = selected.filter(obj => obj.shape === 'text');
            const gridObjects = selected.filter(obj => obj.shape === 'rectangle' && (obj.numberOfRows > 1 || obj.numberOfColumns > 1));

            // Enable if we have at least one of each, OR if we have two or more text objects.
            const canMatchTextToGrid = textObjects.length >= 1 && gridObjects.length >= 1;
            const canMatchTextToText = textObjects.length >= 2 && gridObjects.length === 0;

            matchTextSizeBtn.disabled = !(canMatchTextToGrid || canMatchTextToText);
        }
    }

    /**
     * Updates the form control values to match the state of the shape objects on the canvas.
     * This function is called after any direct manipulation on the canvas (drag, resize).
     */
    function updateFormFromShapes() {
        objects.forEach(obj => {
            const fieldset = form.querySelector(`fieldset[data-object-id="${obj.id}"]`);
            if (!fieldset) return;

            const updateField = (prop, value) => {
                const input = fieldset.querySelector(`[name="obj${obj.id}_${prop}"]`);
                if (input) {
                    if (input.type === 'checkbox') {
                        input.checked = value;
                    } else {
                        input.value = value;
                    }
                    const slider = fieldset.querySelector(`[name="obj${obj.id}_${prop}_slider"]`);
                    if (slider) slider.value = value;
                    const hexInput = fieldset.querySelector(`[name="obj${obj.id}_${prop}_hex"]`);
                    if (hexInput) hexInput.value = value;
                }
            };

            updateField('x', Math.round(obj.x));
            updateField('y', Math.round(obj.y));
            updateField('width', Math.round(obj.width));
            updateField('height', Math.round(obj.height));
            updateField('fontSize', Math.round(obj.fontSize));
            updateField('shape', obj.shape);
            updateField('gradType', obj.gradType);

            // Correct the scaling for animation and cycle speeds
            updateField('animationSpeed', obj.animationSpeed * 10);
            updateField('cycleSpeed', obj.cycleSpeed * 50);

            updateField('animationMode', obj.animationMode);
            updateField('scrollDirection', obj.scrollDirection);
            updateField('innerDiameter', Math.round(obj.innerDiameter));
            updateField('angularWidth', obj.angularWidth);
            updateField('numberOfSegments', obj.numberOfSegments);
            updateField('rotationSpeed', obj.rotationSpeed);
            updateField('useSharpGradient', obj.useSharpGradient);
            updateField('gradientStop', obj.gradientStop);
            updateField('numberOfRows', obj.numberOfRows);
            updateField('numberOfColumns', obj.numberOfColumns);
            updateField('phaseOffset', obj.phaseOffset);
            updateField('text', obj.text);
            updateField('fontFamily', obj.fontFamily);
            updateField('fontWeight', obj.fontWeight);
            updateField('gradColor1', obj.gradient.color1);
            updateField('gradColor2', obj.gradient.color2);
        });
        generateOutputScript();
    }

    function drawObject(obj) {
        ctx.save();
        ctx.translate(obj.x + obj.width / 2, obj.y + obj.height / 2);
        if (obj.rotation) {
            ctx.rotate(obj.rotation * Math.PI / 180);
        }
        ctx.translate(-(obj.x + obj.width / 2), -(obj.y + obj.height / 2));

        if (obj.shape === 'rectangle') {
            ctx.fillStyle = obj.fillColor || 'rgba(0, 0, 255, 0.5)';
            ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
        } else if (obj.shape === 'circle') {
            ctx.fillStyle = obj.fillColor || 'rgba(0, 0, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(obj.x + obj.width / 2, obj.y + obj.height / 2, obj.width / 2, 0, 2 * Math.PI);
            ctx.fill();
        } else if (obj.shape === 'ring') {
            ctx.fillStyle = obj.fillColor || 'rgba(0, 0, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(obj.x + obj.width / 2, obj.y + obj.height / 2, obj.width / 2, 0, 2 * Math.PI);
            ctx.arc(obj.x + obj.width / 2, obj.y + obj.height / 2, obj.innerDiameter / 2, 0, 2 * Math.PI, true);
            ctx.fill();
        } else if (obj.shape === 'text') {
            ctx.font = `${obj.fontSize}px ${obj.fontFamily || 'Arial'}`;
            ctx.fillStyle = obj.fillColor || 'black';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(obj.text || '', obj.x, obj.y);
        }

        ctx.restore();
    }

    function drawFrame() {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const animationEnabled = getControlValues().enableAnimation;

        // Draw all objects
        objects.forEach(obj => {
            if (obj instanceof Shape) {
                // Animation state is now updated here, for all unselected objects
                if (animationEnabled && !selectedObjectIds.includes(obj.id)) {
                    obj.updateAnimationState();
                }
                obj.draw(selectedObjectIds.includes(obj.id));
            } else {
                console.error('Invalid object in objects array:', obj);
            }
        });

        // Draw selection UI for selected objects
        if (selectedObjectIds.length > 0) {
            selectedObjectIds.forEach(id => {
                const obj = objects.find(o => o.id === id);
                if (obj && obj instanceof Shape) {
                    obj.drawSelectionUI();
                }
            });
        }

        drawSnapLines(snapLines);
    }

    function animate(timestamp) {
        requestAnimationFrame(animate);

        const now = timestamp;
        const elapsed = now - then;

        if (elapsed > fpsInterval) {
            then = now - (elapsed % fpsInterval);

            // Always draw a frame to keep the UI responsive
            drawFrame();
        }
    }

    /**
     * Deletes one or more objects from the scene.
     * @param {number[]} idsToDelete - An array of object IDs to delete.
     */
    function deleteObjects(idsToDelete) {
        if (!Array.isArray(idsToDelete) || idsToDelete.length === 0) {
            return;
        }

        // Filter the main objects array
        objects = objects.filter(o => !idsToDelete.includes(o.id));

        // Filter the configuration store to remove definitions for the deleted objects
        configStore = configStore.filter(conf => {
            const key = conf.property || conf.name;
            if (!key.startsWith('obj')) return true; // Keep general configs
            const match = key.match(/^obj(\d+)_/);
            if (match) {
                const id = parseInt(match[1], 10);
                return !idsToDelete.includes(id);
            }
            return true;
        });

        // Clear the selection
        selectedObjectIds = [];

        // Update the UI and record the change
        renderForm();
        updateFormValuesFromObjects();
        updateToolbarState();
        drawFrame();
        recordHistory();
    }

    /**
     * Gathers all form values for a specific object ID.
     * @param {number} id - The ID of the object to get values for.
     * @returns {object} An object containing all properties for the shape.
     */
    function getFormValuesForObject(id) {
        const values = {};
        const prefix = `obj${id}_`;
        const configs = configStore.filter(c => c.property && c.property.startsWith(prefix));
        const propsToScale = ['x', 'y', 'width', 'height', 'innerDiameter', 'fontSize'];

        configs.forEach(conf => {
            const key = conf.property.replace(prefix, '');
            const el = form.elements[conf.property];
            if (el) {
                let value;
                if (el.type === 'checkbox') {
                    value = el.checked;
                } else if (el.type === 'number') {
                    value = el.value === '' ? 0 : parseFloat(el.value);
                } else {
                    value = el.value;
                }

                // Scale up pixel values from the form for the internal model
                if (propsToScale.includes(key)) {
                    value *= 4;
                }

                if (key.startsWith('gradColor')) {
                    if (!values.gradient) values.gradient = {};
                    values.gradient[key.replace('grad', '').toLowerCase()] = value;
                } else if (key === 'scrollDir') {
                    values.scrollDirection = value;
                } else {
                    values[key] = value;
                }
            }
        });

        values.gradientDirection = (values.scrollDirection === 'up' || values.scrollDirection === 'down') ? 'vertical' : 'horizontal';
        values.cycleSpeed = (values.cycleSpeed || 0) / 50.0;
        values.animationSpeed = (values.animationSpeed || 0) / 10.0;
        if (values.shape === 'ring' || values.shape === 'circle') values.height = values.width;

        return values;
    }

    /**
     * Reads all values from the form and updates the live 'objects' array.
     * This is now the primary way user input affects the application state.
     */
    function updateObjectsFromForm() {
        if (isRestoring) return;
        objects.forEach(obj => {
            const newProps = getFormValuesForObject(obj.id);
            obj.update(newProps);
        });
        generateOutputScript();
    }

    /**
     * Reads all properties from the 'objects' array and updates the form inputs
     * to match. This is used after an action on the canvas (drag/resize) or
     * after undo/redo.
     */
    function updateFormValuesFromObjects() {
        const propsToScale = ['x', 'y', 'width', 'height', 'innerDiameter', 'fontSize'];

        objects.forEach(obj => {
            const fieldset = form.querySelector(`fieldset[data-object-id="${obj.id}"]`);
            if (!fieldset) return;

            const updateField = (prop, value) => {
                const input = fieldset.querySelector(`[name="obj${obj.id}_${prop}"]`);
                if (input) {
                    if (input.type === 'checkbox') input.checked = value;
                    else input.value = value;

                    const slider = fieldset.querySelector(`[name="obj${obj.id}_${prop}_slider"]`);
                    if (slider) slider.value = value;

                    const hexInput = fieldset.querySelector(`[name="obj${obj.id}_${prop}_hex"]`);
                    if (hexInput) hexInput.value = value;
                }
            };

            // This loop now correctly updates all form fields from the object's properties
            Object.keys(obj).forEach(key => {
                if (key === 'rotationSpeed' && obj._pausedRotationSpeed !== null) {
                    return;
                }
                if (propsToScale.includes(key)) {
                    // Scale down the high-res internal value for display in the form.
                    updateField(key, obj[key] / 4);
                } else if (key === 'gradient') {
                    updateField('gradColor1', obj.gradient.color1);
                    updateField('gradColor2', obj.gradient.color2);
                } else if (key === 'animationSpeed') {
                    updateField(key, obj[key] * 10);
                } else if (key === 'cycleSpeed') {
                    updateField(key, obj[key] * 50);
                } else if (key === 'scrollDirection') {
                    updateField('scrollDir', obj.scrollDirection);
                } else if (typeof obj[key] !== 'object' && typeof obj[key] !== 'function') {
                    updateField(key, obj[key]);
                }
            });
        });
        generateOutputScript();
    }



    /**
     * A master update function that syncs the shapes from the form and regenerates the output script.
     */
    function updateAll() {
        updateObjectsFromForm();
        drawFrame();
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
        const propsToScale = ['x', 'y', 'width', 'height', 'innerDiameter', 'fontSize'];

        Object.keys(grouped.objects).forEach(id => {
            const config = { id: parseInt(id), gradient: {} };
            const representativeConfig = grouped.objects[id][0];
            if (representativeConfig && representativeConfig.label.includes(':')) {
                config.name = representativeConfig.label.split(':')[0];
            }

            grouped.objects[id].forEach(conf => {
                const key = conf.property.replace(`obj${id}_`, '');
                let value = conf.default;
                if (conf.type === 'number') value = parseFloat(value);
                else if (conf.type === 'boolean') value = (value === 'true');

                if (key.startsWith('gradColor')) {
                    config.gradient[key.replace('grad', '').toLowerCase()] = value;
                } else if (key === 'scrollDir') {
                    config.scrollDirection = value;
                } else {
                    config[key] = value;
                }
            });

            // Scales up the pixel values from the 320x200 system to the 1280x800 builder canvas
            propsToScale.forEach(prop => {
                if (config[prop] !== undefined) {
                    config[prop] *= 4;
                }
            });

            // Applies non-scaled transformations
            config.cycleSpeed = (config.cycleSpeed || 0) / 50.0;
            config.animationSpeed = (config.animationSpeed || 0) / 10.0;
            if (config.shape === 'ring' || config.shape === 'circle') {
                config.height = config.width;
            }
            initialStates.push(config);
        });

        // Creates the final Shape objects from the processed states
        objects = initialStates.map(state => new Shape({ ...state, ctx }));
    }

    /**
     * Loads a workspace state from a provided object.
     * @param {object} workspace - The workspace object to load.
     * @param {object[]} workspace.configs - The array of configuration objects.
     * @param {object[]} workspace.objects - The array of saved object states (name, id, locked).
     */
    function loadWorkspace(workspace) {
        const loadedConfigs = workspace.configs;

        // Identify all unique object IDs from the loaded configuration
        const objectIds = [...new Set(
            loadedConfigs
                .map(c => (c.property || '').match(/^obj(\d+)_/))
                .filter(match => match)
                .map(match => parseInt(match[1], 10))
        )];

        // Start building the new, merged config store. First, take all general (non-object) settings.
        const mergedConfigStore = loadedConfigs.filter(c => !(c.property || '').startsWith('obj'));

        // For each object, merge its saved properties with the latest default properties
        objectIds.forEach(id => {
            const fullDefaultConfig = getDefaultObjectConfig(id);
            const savedObjectConfigs = loadedConfigs.filter(c => c.property && c.property.startsWith(`obj${id}_`));
            const savedPropsMap = new Map(savedObjectConfigs.map(c => [c.property, c]));

            const mergedObjectConfigs = fullDefaultConfig.map(defaultConf => {
                // If a property exists in the saved data, use the saved version.
                if (savedPropsMap.has(defaultConf.property)) {
                    return savedPropsMap.get(defaultConf.property);
                }
                // Otherwise, use the new default from the current application code.
                return defaultConf;
            });

            mergedConfigStore.push(...mergedObjectConfigs);
        });

        // The application's main configStore is now the complete, merged version.
        configStore = mergedConfigStore;

        // Proceed with the rest of the loading process as before.
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
        currentProjectDocId = workspace.docId || null;
        updateShareButtonState();
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
            // Adds "oscilloscope" to the dropdown list
            { property: `obj${newId}_shape`, label: `Object ${newId}: Shape`, type: 'combobox', default: 'rectangle', values: 'rectangle,circle,ring,text,oscilloscope' },

            // --- SCALED PROPERTIES ---
            { property: `obj${newId}_x`, label: `Object ${newId}: X Position`, type: 'number', default: '10', min: '0', max: '320' },
            { property: `obj${newId}_y`, label: `Object ${newId}: Y Position`, type: 'number', default: '10', min: '0', max: '200' },
            { property: `obj${newId}_width`, label: `Object ${newId}: Width`, type: 'number', default: '50', min: '2', max: '320' },
            { property: `obj${newId}_height`, label: `Object ${newId}: Height`, type: 'number', default: '38', min: '2', max: '200' },
            { property: `obj${newId}_innerDiameter`, label: `Object ${newId}: Inner Diameter`, type: 'number', default: '25', min: '1', max: '318' },
            { property: `obj${newId}_fontSize`, label: `Object ${newId}: Font Size`, type: 'number', default: '15', min: '2', max: '100' },

            // --- OSCILLOSCOPE PROPERTIES ---
            { property: `obj${newId}_lineWidth`, label: `Object ${newId}: Line Width`, type: 'number', default: '2', min: '1', max: '20' },
            { property: `obj${newId}_waveType`, label: `Object ${newId}: Wave Type`, type: 'combobox', default: 'sine', values: 'sine,square,sawtooth,triangle' },
            { property: `obj${newId}_frequency`, label: `Object ${newId}: Frequency`, type: 'number', default: '5', min: '1', max: '50' },
            { property: `obj${newId}_oscDisplayMode`, label: `Object ${newId}: Display Mode`, type: 'combobox', default: 'linear', values: 'linear,radial' },
            { property: `obj${newId}_pulseDepth`, label: `Object ${newId}: Pulse Depth`, type: 'number', default: '50', min: '0', max: '100' },
            { property: `obj${newId}_fillShape`, label: `Object ${newId}: Fill Shape`, type: 'boolean', default: 'false' },

            // --- OTHER PROPERTIES ---
            { property: `obj${newId}_rotation`, label: `Object ${newId}: Rotation`, type: 'number', default: '0', min: '-360', max: '360' },
            { property: `obj${newId}_numberOfSegments`, label: `Object ${newId}: Segments`, type: 'number', default: '12', min: '1', max: '50' },
            { property: `obj${newId}_angularWidth`, label: `Object ${newId}: Segment Angle`, type: 'number', min: '1', max: '360', default: '20' },
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
            { property: `obj${newId}_phaseOffset`, label: `Object ${newId}: Phase Offset`, type: 'number', default: '10', min: '0', max: '100' },
            { property: `obj${newId}_text`, label: `Object ${newId}: Text`, type: 'textfield', default: 'New Text' },
            { property: `obj${newId}_textAlign`, label: `Object ${newId}: Justification`, type: 'combobox', values: 'left,center,right', default: 'center' },
            { property: `obj${newId}_pixelFont`, label: `Object ${newId}: Pixel Font Style`, type: 'combobox', values: 'small,large', default: 'small' },
            { property: `obj${newId}_textAnimation`, label: `Object ${newId}: Text Animation`, type: 'combobox', values: 'none,marquee,typewriter,wave', default: 'none' },
            { property: `obj${newId}_textAnimationSpeed`, label: `Object ${newId}: Animation Speed`, type: 'number', min: '1', max: '100', default: '10' },
            { property: `obj${newId}_showTime`, label: `Object ${newId}: Show Current Time`, type: 'boolean', default: 'false' },
            { property: `obj${newId}_showDate`, label: `Object ${newId}: Show Current Date`, type: 'boolean', default: 'false' },
        ];
    }

    function getLocalDateFromUTC(dateUTC) {
        const offsetInMs = dateUTC.getTimezoneOffset() * 60 * 1000;
        return new Date(dateUTC.getTime() - offsetInMs);
    }

    function serializeFontData(fontData, varName) {
        return 'const ' + varName + ' = ' + JSON.stringify(fontData) + ';';
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
        exportButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Preparing...';

        try {
            generateOutputScript(); // Ensure meta tags are up-to-date
            const effectTitle = getControlValues()['title'] || 'MyEffect';
            const metaTags = document.getElementById('output-script').value;
            const thumbnailDataUrl = generateThumbnail(document.getElementById('signalCanvas'));
            const safeFilename = effectTitle.replace(/[\s\/\\?%*:|"<>]/g, '_');

            const styleContent =
                '        canvas { width: 100%; height: 100%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: #000000; }\n' +
                '        body { background-color: #000000; overflow: hidden; margin: 0; }\n';

            const bodyContent = '<body><canvas id="signalCanvas"></canvas></body>';

            const fontData4pxString = 'const FONT_DATA_4PX = ' + JSON.stringify(FONT_DATA_4PX) + ';';
            const fontData5pxString = 'const FONT_DATA_5PX = ' + JSON.stringify(FONT_DATA_5PX) + ';';
            const shapeClassString = Shape.toString();
            const drawPixelTextString = drawPixelText.toString();
            const lerpColorString = lerpColor.toString();
            const getPatternColorString = getPatternColor.toString();

            const exportedScript = `
document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('signalCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 320;
    canvas.height = 200;
    let objects = [];
    let propertyKeys = [];

    // --- Injected Functions, Classes, and Data ---
    ${fontData4pxString}
    ${fontData5pxString}
    ${drawPixelTextString}
    ${lerpColorString}
    ${getPatternColorString}
    ${shapeClassString}

    let fps = 50;
    let fpsInterval;
    let then;

    function discoverProperties() {
        const metaElements = Array.from(document.querySelectorAll('head > meta[property^="obj"]'));
        propertyKeys = metaElements.map(meta => meta.getAttribute('property'));
    }

    function createInitialObjects() {
        if (propertyKeys.length === 0) return;
        const uniqueIds = [...new Set(propertyKeys.map(p => {
            const match = p.match(/obj(\\\d+)_/);
            return match ? match[1] : null;
        }).filter(id => id !== null))];
        
        objects = uniqueIds.map(id => {
            const config = { id: parseInt(id), ctx: ctx, gradient: {} };
            const prefix = 'obj' + id + '_';
            
            propertyKeys.filter(p => p.startsWith(prefix)).forEach(key => {
                const propName = key.substring(prefix.length);
                try {
                    const value = eval(key);
                    if (propName.startsWith('gradColor')) {
                        config.gradient[propName.replace('grad', '').toLowerCase()] = value;
                    } else if (propName === 'scrollDir') {
                        config.scrollDirection = value;
                    } else {
                        config[propName] = value;
                    }
                } catch (e) {}
            });
            
            // --- SPEED FIX: Divide all speeds by 4 ---
            const scaleFactor = 4.0;
            if (config.animationSpeed) config.animationSpeed /= scaleFactor;
            if (config.cycleSpeed) config.cycleSpeed /= scaleFactor;
            if (config.rotationSpeed) config.rotationSpeed /= scaleFactor;
            if (config.textAnimationSpeed) config.textAnimationSpeed /= scaleFactor;
            
            config.animationSpeed = (config.animationSpeed || 0) / 10.0;
            config.cycleSpeed = (config.cycleSpeed || 0) / 50.0;
            
            if (config.shape === 'ring' || config.shape === 'circle') {
                config.height = config.width;
            }
            return new Shape(config);
        });
    }

    function drawFrame() {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        let shouldAnimate = false;
        try { shouldAnimate = eval('enableAnimation') == true; } catch(e) {}

        objects.forEach(obj => {
            const prefix = 'obj' + obj.id + '_';
            propertyKeys.filter(p => p.startsWith(prefix)).forEach(key => {
                const propName = key.substring(prefix.length);
                try {
                    const value = eval(key);
                    const scaleFactor = 4.0;
                    switch(propName) {
                        case 'gradColor1': obj.gradient.color1 = value; break;
                        case 'gradColor2': obj.gradient.color2 = value; break;
                        case 'scrollDir': obj.scrollDirection = value; break;
                        // --- SPEED FIX: Also divide speeds by 4 during live updates ---
                        case 'animationSpeed': obj.animationSpeed = ((value || 0) / scaleFactor) / 10.0; break;
                        case 'cycleSpeed': obj.cycleSpeed = ((value || 0) / scaleFactor) / 50.0; break;
                        case 'rotationSpeed': obj.rotationSpeed = (value || 0) / scaleFactor; break;
                        case 'textAnimationSpeed': obj.textAnimationSpeed = (value || 0) / scaleFactor; break;
                        default:
                            if(obj.hasOwnProperty(propName)) {
                                obj[propName] = value;
                            }
                            break;
                    }
                } catch (e) {}
            });
             if (obj.shape === 'text' && obj._updateTextMetrics) {
                obj._updateTextMetrics();
            }
        });

        for (let i = objects.length - 1; i >= 0; i--) {
            objects[i].draw(shouldAnimate, false);
        }
    }

    function animate(timestamp) {
        requestAnimationFrame(animate);
        const now = timestamp;
        const elapsed = now - then;

        if (elapsed > fpsInterval) {
            then = now - (elapsed % fpsInterval);
            drawFrame();
        }
    }

    function init() {
        discoverProperties();
        createInitialObjects();
        
        fpsInterval = 1000 / fps;
        then = window.performance.now();
        animate(then);
    }

    init();
});`;

            const finalHtml = [
                '<!DOCTYPE html>',
                '<html lang="en">',
                '<head>',
                '    <meta charset="UTF-8">',
                '    <title>' + effectTitle + '</title>',
                metaTags,
                '    <style>',
                styleContent,
                '    </style>',
                '</head>',
                bodyContent,
                '<script>',
                exportedScript,
                '</script>',
                '</html>'
            ].join('\n');

            exportPayload = {
                safeFilename,
                finalHtml,
                thumbnailDataUrl,
                imageExtension: 'png',
                exportDate: new Date()
            };

            const exportModal = new bootstrap.Modal(document.getElementById('export-options-modal'));
            exportModal.show();

        } catch (error) {
            console.error('Export preparation failed:', error);
            showToast('Failed to prepare export: ' + error.message, 'danger');
        } finally {
            exportButton.disabled = false;
            exportButton.innerHTML = '<i class="bi bi-download"></i> Export';
        }
    }

    form.addEventListener('input', (e) => {
        const target = e.target;

        // Sync number inputs with their corresponding range sliders
        if (target.type === 'number' && document.getElementById(`${target.id}_slider`)) {
            document.getElementById(`${target.id}_slider`).value = target.value;
        } else if (target.type === 'range' && target.id.endsWith('_slider')) {
            document.getElementById(target.id.replace('_slider', '')).value = target.value;
        }

        // Sync color pickers with their corresponding hex input fields
        if (target.type === 'color' && document.getElementById(`${target.id}_hex`)) {
            document.getElementById(`${target.id}_hex`).value = target.value;
        } else if (target.type === 'text' && target.id.endsWith('_hex')) {
            const colorPicker = document.getElementById(target.id.replace('_hex', ''));
            if (colorPicker && /^#[0-9A-F]{6}$/i.test(target.value)) {
                colorPicker.value = target.value;
            }
        }

        // This block handles dynamically showing/hiding controls when the shape is changed.
        if (target.name && target.name.includes('_shape')) {
            // This requires a full re-render and state update
            updateObjectsFromForm();
            renderForm();
            updateFormValuesFromObjects();
            return; // Exit early
        }

        // For all other inputs, just update the object data and redraw
        updateObjectsFromForm();
        drawFrame();
    });

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
            const idToDelete = parseInt(deleteBtn.dataset.id, 10);
            deleteObjects([idToDelete]); // Use the new, centralized delete function
        }

        if (duplicateBtn) {
            e.preventDefault();

            const idToCopy = parseInt(duplicateBtn.dataset.id, 10);
            const objectToCopy = objects.find(o => o.id === idToCopy);
            if (!objectToCopy) return;

            // 1. Create a true copy of the source object's live properties
            const newState = JSON.parse(JSON.stringify(objectToCopy, (key, value) => {
                if (key === 'ctx') return undefined; // Exclude non-serializable canvas context
                return value;
            }));

            // 2. Assign a new ID and Name, and offset it slightly
            const newId = (objects.reduce((maxId, o) => Math.max(maxId, o.id), 0)) + 1;
            newState.id = newId;
            newState.name = `${objectToCopy.name} Copy`;
            newState.x += 20;
            newState.y += 20;

            // 3. Create the new Shape instance from the copied state
            const newShape = new Shape({ ...newState, ctx });
            objects.push(newShape);

            // 4. Generate a new set of form configurations based on the new object's state
            const oldConfigs = configStore.filter(c => c.property && c.property.startsWith(`obj${idToCopy}_`));
            const newConfigs = oldConfigs.map(oldConf => {
                const newConf = { ...oldConf };
                const propName = oldConf.property.substring(oldConf.property.indexOf('_') + 1);
                newConf.property = `obj${newId}_${propName}`;
                newConf.label = `${newState.name}:${oldConf.label.split(':')[1]}`;

                // Get the live value from the newly created shape
                let liveValue = newShape[propName];
                if (propName.startsWith('gradColor')) {
                    liveValue = newShape.gradient[propName.replace('gradColor', 'color')];
                } else if (propName === 'scrollDir') {
                    liveValue = newShape.scrollDirection;
                }

                // Apply inverse scaling to get the correct UI/form value
                const propsToScale = ['x', 'y', 'width', 'height', 'innerDiameter', 'fontSize'];
                if (propsToScale.includes(propName)) {
                    liveValue /= 4;
                } else if (propName === 'animationSpeed') {
                    liveValue *= 10;
                } else if (propName === 'cycleSpeed') {
                    liveValue *= 50;
                }

                newConf.default = liveValue;
                return newConf;
            });

            configStore.push(...newConfigs);

            // 5. Update the UI
            selectedObjectIds = [newId];
            renderForm();
            syncPanelsWithSelection();
            drawFrame();
            recordHistory();
        }
    });

    if (undoBtn) {
        undoBtn.addEventListener('click', () => history.undo());
    }
    if (redoBtn) {
        redoBtn.addEventListener('click', () => history.redo());
    }

    document.addEventListener('keydown', (e) => {
        const target = e.target;
        const isTextInput = (target.tagName === 'INPUT' && target.type === 'text') ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable;

        if (isTextInput) {
            return; // Let the browser handle its native events for text fields
        }

        // NEW: Handle keyboard movement for selected objects
        if (selectedObjectIds.length > 0) {
            let moveAmount = 1; // Default move by 1 pixel
            if (e.shiftKey) {
                moveAmount = 10; // Move by 10 pixels if Shift is held
            }

            let moved = false;
            selectedObjectIds.forEach(id => {
                const obj = objects.find(o => o.id === id);
                if (obj && !obj.locked) {
                    let newX = obj.x;
                    let newY = obj.y;

                    switch (e.key) {
                        case 'ArrowUp':
                            newY -= moveAmount;
                            moved = true;
                            break;
                        case 'ArrowDown':
                            newY += moveAmount;
                            moved = true;
                            break;
                        case 'ArrowLeft':
                            newX -= moveAmount;
                            moved = true;
                            break;
                        case 'ArrowRight':
                            newX += moveAmount;
                            moved = true;
                            break;
                    }

                    if (moved) {
                        // Apply canvas constraints if enabled
                        if (constrainToCanvas) {
                            newX = Math.max(0, Math.min(newX, canvas.width - obj.width));
                            newY = Math.max(0, Math.min(newY, canvas.height - obj.height));
                        }
                        obj.x = newX;
                        obj.y = newY;
                    }
                }
            });

            if (moved) {
                e.preventDefault(); // Prevent default browser scroll behavior
                updateFormValuesFromObjects(); // Update form fields
                drawFrame(); // Redraw canvas
                debouncedRecordHistory(); // Record history after movement
            }
        }

        // Handle Delete and Backspace keys for selected objects
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedObjectIds.length > 0) {
            e.preventDefault(); // Prevents browser back navigation on Backspace
            deleteObjects([...selectedObjectIds]); // Pass a copy of the array
        }

        // Handle Undo and Redo
        if (e.ctrlKey || e.metaKey) {
            if (e.key.toLowerCase() === 'z') {
                e.preventDefault();
                history.undo();
            } else if (e.key.toLowerCase() === 'y') {
                e.preventDefault();
                history.redo();
            }
        }
    });


    document.getElementById('export-copy-btn').addEventListener('click', () => {
        if (exportPayload.finalHtml) {
            navigator.clipboard.writeText(exportPayload.finalHtml).then(() => {
                showToast("HTML code copied to clipboard!", 'success');
                const exportModal = bootstrap.Modal.getInstance(document.getElementById('export-options-modal'));
                exportModal.hide();
            }).catch(err => {
                console.error('Failed to copy text: ', err);
                showToast("Could not copy code. See console for details.", 'danger');
            });
        }
    });

    document.getElementById('export-download-btn').addEventListener('click', async () => {
        const { safeFilename, finalHtml, thumbnailDataUrl, imageExtension, exportDate } = exportPayload;
        if (!finalHtml) return;

        try {
            const zip = new JSZip();
            // FIXED: Removed the invalid backslash `\` before the backtick
            zip.file(`${safeFilename}.html`, finalHtml, { date: exportDate });

            const imageResponse = await fetch(thumbnailDataUrl);
            const imageBlob = await imageResponse.blob();
            // FIXED: Removed the invalid backslash `\` before the backtick
            zip.file(`${safeFilename}.${imageExtension}`, imageBlob, { date: exportDate });

            const zipBlob = await zip.generateAsync({ type: "blob" });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(zipBlob);
            // FIXED: Removed the invalid backslash `\` before the backtick
            link.download = `${safeFilename}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

            const exportModal = bootstrap.Modal.getInstance(document.getElementById('export-options-modal'));
            exportModal.hide();
            showToast("Zip file download started.", 'info');

        } catch (error) {
            console.error('Zip creation failed:', error);
            showToast('Failed to create .zip file.', 'danger');
        }
    });

    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(outputScriptArea.value).then(() => {
            showNotification("Script header copied to clipboard!");
        });
    });

    /**
     * Updates the global configStore with the current live state of all Shape objects.
     * This ensures that when the project is saved, the most recent changes (including those
     * made via direct canvas manipulation) are captured in the configuration blueprint.
     */
    function syncConfigStoreWithState() {
        objects.forEach(obj => {
            const configsForThisObject = configStore.filter(c => c.property && c.property.startsWith(`obj${obj.id}_`));

            configsForThisObject.forEach(conf => {
                const propName = conf.property.substring(conf.property.indexOf('_') + 1);
                let liveValue;

                // Get the live value from the object instance
                if (propName.startsWith('gradColor')) {
                    const colorKey = propName.replace('gradColor', 'color');
                    liveValue = obj.gradient[colorKey];
                } else if (propName === 'scrollDir') {
                    liveValue = obj.scrollDirection;
                } else {
                    liveValue = obj[propName];
                }

                if (liveValue === undefined) return;

                // Apply transformations to convert internal value to config value
                const propsToScale = ['x', 'y', 'width', 'height', 'innerDiameter', 'fontSize'];
                if (propsToScale.includes(propName)) {
                    liveValue /= 4;
                } else if (propName === 'animationSpeed') {
                    liveValue *= 10;
                } else if (propName === 'cycleSpeed') {
                    liveValue *= 50;
                }

                if (typeof liveValue === 'boolean') {
                    liveValue = String(liveValue);
                }

                // Round numbers to avoid floating point issues
                if (typeof liveValue === 'number') {
                    liveValue = Math.round(liveValue);
                }

                // Update the 'default' attribute in the configStore
                conf.default = liveValue;
            });
        });
    }

    /**
     * SAVE BUTTON: Checks for duplicates before saving.
     */
    document.getElementById('save-ws-btn').addEventListener('click', async () => {
        const user = window.auth.currentUser;
        if (!user) {
            showToast("You must be logged in to save.", 'danger');
            return;
        }

        // --- FIX: Sync configStore with the live object state before saving ---
        syncConfigStoreWithState();
        // --- END FIX ---

        const name = getControlValues()['title'] || 'Untitled Effect';
        const trimmedName = name.trim();

        // Sanitize the configStore to remove any keys with undefined values
        const sanitizedConfigs = configStore.map(conf => {
            const sanitized = {};
            for (const key in conf) {
                if (conf[key] !== undefined) {
                    sanitized[key] = conf[key];
                }
            }
            return sanitized;
        });

        const thumbnail = generateThumbnail(document.getElementById('signalCanvas'));
        const projectData = {
            name: trimmedName,
            thumbnail: thumbnail,
            configs: sanitizedConfigs, // This will now have the correct, up-to-date values
            objects: objects.map(o => ({ id: o.id, name: o.name, locked: o.locked })),
            updatedAt: new Date()
        };

        const q = window.query(window.collection(window.db, "projects"), window.where("userId", "==", user.uid), window.where("name", "==", trimmedName));
        const querySnapshot = await window.getDocs(q);

        if (!querySnapshot.empty) {
            // Project exists, confirm overwrite
            const existingDocId = querySnapshot.docs[0].id;
            showConfirmModal(
                'Confirm Overwrite',
                `A project named "${trimmedName}" already exists. Do you want to overwrite it?`,
                'Overwrite',
                async () => {
                    try {
                        const docRef = window.doc(window.db, "projects", existingDocId);
                        await window.updateDoc(docRef, projectData);
                        currentProjectDocId = existingDocId;
                        updateShareButtonState();
                        showToast(`Project "${trimmedName}" was overwritten successfully!`, 'success');
                    } catch (error) {
                        console.error("Error overwriting document: ", error);
                        showToast("Error overwriting project: " + error.message, 'danger');
                    }
                }
            );
        } else {
            // Project is new, create it
            try {
                projectData.userId = user.uid;
                projectData.creatorName = user.displayName || 'Anonymous';
                projectData.isPublic = true;
                projectData.createdAt = new Date();

                const docRef = await window.addDoc(window.collection(window.db, "projects"), projectData);
                currentProjectDocId = docRef.id;
                updateShareButtonState();
                showToast(`Effect "${trimmedName}" was saved successfully!`, 'success');
            } catch (error) {
                console.error("Error saving new document: ", error);
                showToast("Error saving project: " + error.message, 'danger');
            }
        }
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

        document.getElementById('galleryOffcanvasLabel').textContent = 'My Effects';
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

    /**
     * Handles toolbar button clicks for alignment and matching actions.
     * @param {Event} e - The click event.
     */
    function handleToolbarAction(e) {
        const button = e.target.closest('button');
        if (!button || button.disabled || button.id === 'constrain-btn') return;
        const action = button.dataset.action;
        if (!action || selectedObjectIds.length === 0) {
            console.log('No action or no objects selected:', { action, selectedObjectIds });
            return;
        }

        const selectedObjects = selectedObjectIds.map(id => objects.find(o => o.id === id)).filter(o => o);
        if (selectedObjects.length === 0) {
            console.log('No valid objects found for selection:', { selectedObjectIds });
            return;
        }
        const anchor = selectedObjects[0]; // The first selected object is typically the anchor

        console.log('Handling toolbar action:', { action, selectedCount: selectedObjects.length });

        switch (action) {
            case 'align-screen-left':
                selectedObjects.forEach(o => o.x = 0);
                break;
            case 'align-screen-right':
                selectedObjects.forEach(o => o.x = canvas.width - o.width);
                break;
            case 'align-screen-h-center':
                selectedObjects.forEach(o => o.x = (canvas.width - o.width) / 2);
                break;
            case 'align-screen-top':
                selectedObjects.forEach(o => o.y = 0);
                break;
            case 'align-screen-bottom':
                selectedObjects.forEach(o => o.y = canvas.height - o.height);
                break;
            case 'align-screen-v-center':
                selectedObjects.forEach(o => o.y = (canvas.height - o.height) / 2);
                break;
            case 'match-width':
                selectedObjects.slice(1).forEach(o => o.width = anchor.width);
                break;
            case 'match-height':
                selectedObjects.slice(1).forEach(o => o.height = anchor.height);
                break;
            case 'match-both':
                selectedObjects.slice(1).forEach(o => {
                    o.width = anchor.width;
                    o.height = anchor.height;
                });
                break;
            case 'fit-canvas':
                selectedObjects.forEach(o => {
                    o.x = 0;
                    o.y = 0;
                    o.width = canvas.width;
                    o.height = canvas.height;
                });
                break;
            case 'match-text-size':
                const textObjects = selectedObjects.filter(obj => obj.shape === 'text');
                const gridObjects = selectedObjects.filter(obj => obj.shape === 'rectangle' && (obj.numberOfRows > 1 || obj.numberOfColumns > 1));
                if (textObjects.length >= 1 && gridObjects.length >= 1) {
                    // Scenario 1: Match Text to Grid
                    const sourceGrid = gridObjects[0];
                    const cellHeight = sourceGrid.height / sourceGrid.numberOfRows;
                    textObjects.forEach(textObject => {
                        textObject.fontSize = cellHeight * 10;
                        textObject._updateTextMetrics();
                    });
                } else if (textObjects.length >= 2 && gridObjects.length === 0) {
                    // Scenario 2: Match Text to other Text
                    const sourceText = textObjects[0];
                    const sourceFontSize = sourceText.fontSize;
                    textObjects.slice(1).forEach(targetText => {
                        targetText.fontSize = sourceFontSize;
                        targetText._updateTextMetrics();
                    });
                }
                break;
            default:
                console.log('Unknown action:', action);
        }

        // Round positions to avoid floating-point drift
        selectedObjects.forEach(o => {
            o.x = Math.round(o.x);
            o.y = Math.round(o.y);
        });

        updateFormFromShapes();
        recordHistory();
        needsRedraw = true;
        drawFrame();
    }

    toolbar.addEventListener('click', handleToolbarAction);

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
            constrainBtn.classList.add('btn-secondary');
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
        const oldSelection = [...selectedObjectIds];

        // Check for handle interaction on a single selected object
        if (selectedObjectIds.length === 1) {
            const selectedObject = objects.find(o => o.id === selectedObjectIds[0]);
            if (selectedObject) {
                const handle = selectedObject.getHandleAtPoint(x, y);
                if (handle) {
                    if (handle.type === 'rotation') {
                        isRotating = true;
                        const center = selectedObject.getCenter();
                        const startAngle = Math.atan2(y - center.y, x - center.x);
                        initialDragState = [{ id: selectedObject.id, startAngle: startAngle, initialObjectAngle: selectedObject.getRenderAngle() }];
                    } else {
                        isResizing = true;
                        activeResizeHandle = handle.name;
                        const oppositeHandleName = getOppositeHandle(handle.name);

                        let anchorPoint;

                        if (selectedObject.shape === 'circle' || selectedObject.shape === 'ring' || selectedObject.shape === 'oscilloscope') {
                            const center = selectedObject.getCenter();
                            const halfSize = selectedObject.width / 2;
                            const signX = oppositeHandleName.includes('left') ? -1 : (oppositeHandleName.includes('right') ? 1 : 0);
                            const signY = oppositeHandleName.includes('top') ? -1 : (oppositeHandleName.includes('bottom') ? 1 : 0);
                            anchorPoint = {
                                x: center.x + (signX * halfSize),
                                y: center.y + (signY * halfSize)
                            };
                        } else {
                            anchorPoint = selectedObject.getWorldCoordsOfCorner(oppositeHandleName);
                        }

                        initialDragState = [{
                            id: selectedObject.id,
                            initialX: selectedObject.x,
                            initialY: selectedObject.y,
                            initialWidth: selectedObject.width,
                            initialHeight: selectedObject.height,
                            anchorPoint: anchorPoint,
                            diameterRatio: selectedObject.shape === 'ring' ? selectedObject.innerDiameter / selectedObject.width : 1
                        }];
                    }
                    dragStartX = x;
                    dragStartY = y;
                    return;
                }
            }
        }

        // If no handles were touched, check for selection or dragging
        const hitObject = [...objects].reverse().find(obj => obj.isPointInside(x, y));

        if (hitObject) {
            const hitObjectId = hitObject.id;
            const wasAlreadySelected = oldSelection.includes(hitObjectId);
            if (e.shiftKey || e.ctrlKey || e.metaKey) {
                if (wasAlreadySelected) {
                    selectedObjectIds = oldSelection.filter(id => id !== hitObjectId);
                } else {
                    selectedObjectIds.push(hitObjectId);
                }
            } else if (!wasAlreadySelected) {
                selectedObjectIds = [hitObjectId];
            }
            if (!hitObject.locked) {
                isDragging = true;
                dragStartX = x;
                dragStartY = y;
                initialDragState = selectedObjectIds.map(id => { const obj = objects.find(o => o.id === id); return { id, x: obj.x, y: obj.y }; });
            }
        } else {
            selectedObjectIds = [];
        }

        // --- PAUSE / RESUME LOGIC ---
        const deselectedObjects = oldSelection
            .filter(id => !selectedObjectIds.includes(id))
            .map(id => objects.find(o => o.id === id))
            .filter(o => o);

        deselectedObjects.forEach(obj => {
            if (obj._pausedRotationSpeed !== null) {
                obj.rotationSpeed = obj._pausedRotationSpeed;
                obj._pausedRotationSpeed = null;
            }
        });

        const newlySelectedObjects = selectedObjectIds
            .filter(id => !oldSelection.includes(id))
            .map(id => objects.find(o => o.id === id))
            .filter(o => o);

        newlySelectedObjects.forEach(obj => {
            if (obj.rotationSpeed !== 0) {
                obj._pausedRotationSpeed = obj.rotationSpeed;
                obj.rotationSpeed = 0;
            }
        });
        // --- END PAUSE / RESUME ---

        updateToolbarState();
        syncPanelsWithSelection();
        drawFrame();
    });


    /**
     * Handles mouse movement over the canvas for dragging, resizing, and cursor updates.
     * @param {MouseEvent} e - The mousemove event object.
     */
    canvasContainer.addEventListener('mousemove', e => {
        if (coordsDisplay) {
            const { x, y } = getCanvasCoordinates(e);
            coordsDisplay.textContent = `${Math.round(x)}, ${Math.round(y)}`;
        }

        e.preventDefault();
        const { x, y } = getCanvasCoordinates(e); // Displayed coordinates

        if (isRotating) {
            const initial = initialDragState[0];
            const obj = objects.find(o => o.id === initial.id);
            if (obj) {
                const center = { x: obj.x, y: obj.y };
                const currentAngle = Math.atan2(y - center.y, x - center.x);
                const angleDelta = currentAngle - initial.startAngle;
                obj.rotation = (initial.initialObjectAngle + angleDelta) * 180 / Math.PI;
                needsRedraw = true;
            }
        } else if (isResizing) {
            const initial = initialDragState[0];
            const obj = objects.find(o => o.id === initial.id);
            if (obj) {
                const anchorPoint = initial.anchorPoint;
                const mouseX = x;
                const mouseY = y;

                if (obj.shape === 'circle' || obj.shape === 'ring') {
                    const isSideHandle = activeResizeHandle === 'top' || activeResizeHandle === 'bottom' || activeResizeHandle === 'left' || activeResizeHandle === 'right';
                    if (isSideHandle) {
                        let diameter;
                        if (activeResizeHandle === 'top' || activeResizeHandle === 'bottom') {
                            diameter = Math.abs(mouseY - anchorPoint.y);
                            const newCenterY = (mouseY + anchorPoint.y) / 2;
                            obj.y = Math.round(newCenterY - diameter / 2);
                            obj.x = Math.round(anchorPoint.x - diameter / 2);
                        } else {
                            diameter = Math.abs(mouseX - anchorPoint.x);
                            const newCenterX = (mouseX + anchorPoint.x) / 2;
                            obj.x = Math.round(newCenterX - diameter / 2);
                            obj.y = Math.round(anchorPoint.y - diameter / 2);
                        }
                        obj.width = Math.round(Math.max(10, diameter));
                        obj.height = obj.width;
                    } else {
                        let newWidth = Math.abs(mouseX - anchorPoint.x);
                        let newHeight = Math.abs(mouseY - anchorPoint.y);
                        let newX = Math.min(mouseX, anchorPoint.x);
                        let newY = Math.min(mouseY, anchorPoint.y);
                        const diameter = Math.max(newWidth, newHeight);

                        if (activeResizeHandle.includes('left')) newX = anchorPoint.x - diameter;
                        if (activeResizeHandle.includes('top')) newY = anchorPoint.y - diameter;

                        obj.width = Math.round(Math.max(10, diameter));
                        obj.height = obj.width;
                        obj.x = Math.round(newX);
                        obj.y = Math.round(newY);
                    }
                    if (obj.shape === 'ring') {
                        obj.innerDiameter = Math.round(obj.width * initial.diameterRatio);
                    }
                } else {
                    // --- ROTATION-AWARE LOGIC FOR RECTANGLES ---
                    const angle = obj.getRenderAngle();
                    const isSideHandle = activeResizeHandle === 'top' || activeResizeHandle === 'bottom' || activeResizeHandle === 'left' || activeResizeHandle === 'right';

                    if (isSideHandle) {
                        const dragVecX = mouseX - dragStartX;
                        const dragVecY = mouseY - dragStartY;
                        const s = Math.sin(angle);
                        const c = Math.cos(angle);

                        let newWidth = initial.initialWidth;
                        let newHeight = initial.initialHeight;
                        let centerShiftX = 0;
                        let centerShiftY = 0;

                        if (activeResizeHandle === 'right') {
                            const change = dragVecX * c + dragVecY * s;
                            newWidth += change;
                            centerShiftX = (change / 2) * c;
                            centerShiftY = (change / 2) * s;
                        } else if (activeResizeHandle === 'left') {
                            const change = dragVecX * c + dragVecY * s;
                            newWidth -= change;
                            centerShiftX = (change / 2) * c;
                            centerShiftY = (change / 2) * s;
                        } else if (activeResizeHandle === 'bottom') {
                            const change = -dragVecX * s + dragVecY * c;
                            newHeight += change;
                            centerShiftX = (change / 2) * -s;
                            centerShiftY = (change / 2) * c;
                        } else if (activeResizeHandle === 'top') {
                            const change = -dragVecX * s + dragVecY * c;
                            newHeight -= change;
                            centerShiftX = (change / 2) * -s;
                            centerShiftY = (change / 2) * c;
                        }

                        const initialCenter = {
                            x: initial.initialX + initial.initialWidth / 2,
                            y: initial.initialY + initial.initialHeight / 2
                        };
                        const newCenterX = initialCenter.x + centerShiftX;
                        const newCenterY = initialCenter.y + centerShiftY;

                        obj.width = Math.round(Math.max(10, newWidth));
                        obj.height = Math.round(Math.max(10, newHeight));
                        obj.x = Math.round(newCenterX - obj.width / 2);
                        obj.y = Math.round(newCenterY - obj.height / 2);
                    } else {
                        const worldVecX = x - anchorPoint.x;
                        const worldVecY = y - anchorPoint.y;
                        const s_local = Math.sin(-angle);
                        const c_local = Math.cos(-angle);
                        const localVecX = worldVecX * c_local - worldVecY * s_local;
                        const localVecY = worldVecX * s_local + worldVecY * c_local;
                        const handleXSign = activeResizeHandle.includes('left') ? -1 : 1;
                        const handleYSign = activeResizeHandle.includes('top') ? -1 : 1;
                        let newWidth = localVecX * handleXSign;
                        let newHeight = localVecY * handleYSign;

                        const localSizingVecX = newWidth * handleXSign;
                        const localSizingVecY = newHeight * handleYSign;
                        const s_world = Math.sin(angle);
                        const c_world = Math.cos(angle);
                        const worldSizingVecX = localSizingVecX * c_world - localSizingVecY * s_world;
                        const worldSizingVecY = localSizingVecX * s_world + localSizingVecY * c_world;
                        const newCenterX = anchorPoint.x + worldSizingVecX / 2;
                        const newCenterY = anchorPoint.y + worldSizingVecY / 2;

                        obj.width = Math.round(Math.max(10, newWidth));
                        obj.height = Math.round(Math.max(10, newHeight));
                        obj.x = Math.round(newCenterX - obj.width / 2);
                        obj.y = Math.round(newCenterY - obj.height / 2);
                    }
                }

                needsRedraw = true;
            }
        } else if (isDragging) {
            snapLines = []; // Clear previous snap lines
            const dx = x - dragStartX;
            const dy = y - dragStartY;
            const SNAP_THRESHOLD = 10;
            let finalDx = dx;
            let finalDy = dy;

            // On the first drag frame, cache all possible snap targets.
            if (!cachedSnapTargets) {
                cachedSnapTargets = [];
                // Add snap points from all non-selected objects
                const otherObjects = objects.filter(o => !selectedObjectIds.includes(o.id));
                otherObjects.forEach(otherObj => {
                    cachedSnapTargets.push(...getWorldPoints(otherObj));
                });
                // Add canvas centerlines as snap targets
                cachedSnapTargets.push(
                    { x: canvas.width / 2, y: canvas.height / 2, type: 'center' },
                    { x: canvas.width / 2, y: 0, type: 'edge' },
                    { x: canvas.width / 2, y: canvas.height, type: 'edge' },
                    { x: 0, y: canvas.height / 2, type: 'edge' },
                    { x: canvas.width, y: canvas.height / 2, type: 'edge' }
                );
            }

            const hSnaps = [];
            const vSnaps = [];

            // Find potential snaps for all selected objects
            initialDragState.forEach(state => {
                const obj = objects.find(o => o.id === state.id);
                if (obj) {
                    const originalX = obj.x;
                    const originalY = obj.y;
                    // Temporarily move object to its potential new position
                    obj.x = state.x + dx;
                    obj.y = state.y + dy;
                    const selectedPoints = getWorldPoints(obj);

                    // Find all potential horizontal and vertical snaps for this object
                    selectedPoints.forEach(point => {
                        cachedSnapTargets.forEach(target => {
                            if (point.type === target.type) {
                                if (Math.abs(point.x - target.x) < SNAP_THRESHOLD) {
                                    // FIX: Store the target's coordinate ('line') for drawing
                                    hSnaps.push({ dist: Math.abs(point.x - target.x), adj: target.x - point.x, line: target.x });
                                }
                                if (Math.abs(point.y - target.y) < SNAP_THRESHOLD) {
                                    // FIX: Store the target's coordinate ('line') for drawing
                                    vSnaps.push({ dist: Math.abs(point.y - target.y), adj: target.y - point.y, line: target.y });
                                }
                            }
                        });
                    });
                    // Revert object to its actual current position
                    obj.x = originalX;
                    obj.y = originalY;
                }
            });

            // Apply the closest snap
            if (hSnaps.length > 0) {
                hSnaps.sort((a, b) => a.dist - b.dist);
                finalDx += hSnaps[0].adj;
                // FIX: Use the stored 'line' property for the correct position
                snapLines.push({ type: 'vertical', x: hSnaps[0].line, duration: 2 });
            }
            if (vSnaps.length > 0) {
                vSnaps.sort((a, b) => a.dist - b.dist);
                finalDy += vSnaps[0].adj;
                // FIX: Use the stored 'line' property for the correct position
                snapLines.push({ type: 'horizontal', y: vSnaps[0].line, duration: 2 });
            }

            // Apply canvas boundary constraints if enabled
            if (constrainToCanvas) {
                let constrainedDx = finalDx;
                let constrainedDy = finalDy;
                initialDragState.forEach(state => {
                    const obj = objects.find(o => o.id === state.id);
                    if (obj) {
                        // Temporarily move the object to its potential final position to get its bounding box
                        const originalX = obj.x;
                        const originalY = obj.y;
                        obj.x = state.x + finalDx;
                        obj.y = state.y + finalDy;
                        const { minX, minY, maxX, maxY } = getBoundingBox(obj);
                        obj.x = originalX;
                        obj.y = originalY;

                        // Check if this bounding box is out of bounds and adjust the delta
                        if (minX < 0) constrainedDx = Math.max(constrainedDx, -minX + finalDx);
                        if (maxX > canvas.width) constrainedDx = Math.min(constrainedDx, canvas.width - maxX + finalDx);
                        if (minY < 0) constrainedDy = Math.max(constrainedDy, -minY + finalDy);
                        if (maxY > canvas.height) constrainedDy = Math.min(constrainedDy, canvas.height - maxY + finalDy);
                    }
                });
                finalDx = constrainedDx;
                finalDy = constrainedDy;
            }

            // Apply the final, corrected delta to all selected objects
            initialDragState.forEach(state => {
                const obj = objects.find(o => o.id === state.id);
                if (obj) {
                    obj.x = state.x + finalDx;
                    obj.y = state.y + finalDy;
                }
            });

            needsRedraw = true;
        } else {
            let cursor = 'default';
            const topObject = [...objects].reverse().find(obj => obj.isPointInside(x, y));
            if (topObject) {
                cursor = 'pointer';
                if (selectedObjectIds.includes(topObject.id)) {
                    const handle = topObject.getHandleAtPoint(x, y);
                    if (handle) {
                        cursor = handle.cursor;
                    } else if (!topObject.locked) {
                        cursor = 'move';
                    }
                }
            }
            canvasContainer.style.cursor = cursor;
        }
    });

    /**
     * Handles the mouseup event to finalize dragging or resizing operations.
     * @param {MouseEvent} e - The mouseup event object.
     */
    canvasContainer.addEventListener('mouseup', e => {
        // console.log('canvasContainer mouseup fired', { isDragging, isResizing, isRotating });
        e.preventDefault();
        const wasManipulating = isDragging || isResizing || isRotating;

        if (isRotating) {
            const obj = objects.find(o => o.id === initialDragState[0].id);
            if (obj) {
                obj.rotation = Math.round(obj.rotation);
            }
        }

        isDragging = false;
        isResizing = false;
        isRotating = false;
        activeResizeHandle = null;
        initialDragState = [];
        snapLines = [];
        cachedSnapTargets = null;

        if (wasManipulating) {
            selectedObjectIds.forEach(id => {
                const obj = objects.find(o => o.id === id);
                if (obj) {
                    obj.x = Math.round(obj.x);
                    obj.y = Math.round(obj.y);
                    obj.width = Math.round(obj.width);
                    obj.height = Math.round(obj.height);
                    if (obj.innerDiameter) obj.innerDiameter = Math.round(obj.innerDiameter);
                    if (obj.fontSize) obj.fontSize = Math.round(obj.fontSize);
                }
            });
            updateFormValuesFromObjects();
            recordHistory();
        }

        canvasContainer.style.cursor = 'default';
        needsRedraw = true;
        drawFrame();
    });

    canvasContainer.addEventListener('mouseleave', e => {
        // isDragging = false;
        // isResizing = false;
    });


    exportBtn.addEventListener('click', exportFile);

    /**
     * The main initialization function for the application.
     * It sets up the initial configuration, creates objects, renders the form,
     * initializes tooltips, starts the animation loop, and sets up the resizable panels.
     */
    // In main.js, replace your entire init function with this:

    async function init() {
        // Setup UI elements that don't depend on loaded objects
        const constrainBtn = document.getElementById('constrain-btn');
        constrainBtn.classList.remove('btn-secondary', 'btn-outline-secondary');
        if (constrainToCanvas) {
            constrainBtn.classList.add('btn-secondary');
        } else {
            constrainBtn.classList.add('btn-outline-secondary');
        }

        // --- Core Loading Logic ---
        // First, try to load a shared or featured effect from the network.
        // The 'await' keyword forces the code to wait here until the function is finished.
        const effectLoaded = await loadSharedEffect();

        // If, and only if, no effect was loaded from the network, then
        // load the default effect from the HTML template.
        if (!effectLoaded) {
            const template = document.getElementById('initial-config');
            const metaElements = Array.from(template.content.querySelectorAll('meta'));
            configStore = metaElements.map(parseMetaToConfig);
            createInitialObjects();
            renderForm();
            updateAll();
        }

        // --- Final Setup (runs after objects are loaded from one source or the other) ---
        new bootstrap.Tooltip(document.body, {
            selector: "[data-bs-toggle='tooltip']",
            trigger: 'hover'
        });
        updateToolbarState();

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
        recordHistory();
        updateUndoRedoButtons();

        const lastUpdatedSpan = document.getElementById('last-updated-span');
        if (lastUpdatedSpan) {
            const now = new Date();
            const formattedDate = now.toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });
            const formattedTime = now.toLocaleTimeString('en-US', {
                hour: 'numeric', minute: '2-digit', timeZoneName: 'short'
            });
            lastUpdatedSpan.textContent = `Current as of: ${formattedDate}, ${formattedTime}`;
        }
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
            const shareUrl = `${window.location.origin}${window.location.pathname} ? effectId = ${docRef.id}`;
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
                // console.log("Detaching gallery listener.");
                galleryListener(); // This is the unsubscribe function
                galleryListener = null;
            }
        });
    }

    // BROWSE GALLERY BUTTON
    document.getElementById('browse-btn').addEventListener('click', async () => {
        document.getElementById('galleryOffcanvasLabel').textContent = 'Community Gallery';
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

        if (effectId) {
            try {
                const effectDocRef = window.doc(window.db, "projects", effectId);
                const effectDoc = await window.getDoc(effectDocRef);

                if (effectDoc.exists()) {
                    const projectData = { docId: effectDoc.id, ...effectDoc.data() };
                    if (projectData.isPublic) {
                        loadWorkspace(projectData);
                        showToast("Shared effect loaded!", 'success');
                        return true; // Report success
                    } else {
                        showToast("This effect is not public.", 'danger');
                    }
                } else {
                    showToast("Shared effect not found.", 'danger');
                }
            } catch (error) {
                console.error("Error loading shared effect:", error);
                showToast("Could not load the shared effect.", 'danger');
            }
            return false; // Report failure
        }

        try {
            const q = window.query(window.collection(window.db, "projects"), window.where("featured", "==", true), window.limit(1));
            const querySnapshot = await window.getDocs(q);

            if (!querySnapshot.empty) {
                const featuredDoc = querySnapshot.docs[0];
                const projectData = { docId: featuredDoc.id, ...featuredDoc.data() };
                loadWorkspace(projectData);
                showToast(`Featured effect "${projectData.name}" loaded!`, 'info');
                return true; // Report success
            }
        } catch (error) {
            console.error("Error loading featured effect:", error);
        }

        return false; // Report failure (no featured effect found)
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

        document.getElementById('galleryOffcanvasLabel').textContent = 'My Effects';
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
    function generateThumbnail(sourceCanvas, width = 200) {
        const thumbnailCanvas = document.createElement('canvas');
        const thumbWidth = width;
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
    // In main.js, replace the entire showConfirmModal function with this one:
    function showConfirmModal(title, body, buttonText, onConfirm) {
        const confirmModalEl = document.getElementById('confirm-overwrite-modal');
        const confirmModalInstance = bootstrap.Modal.getInstance(confirmModalEl) || new bootstrap.Modal(confirmModalEl);
        const confirmModalTitle = document.getElementById('confirmOverwriteModalLabel');
        const confirmModalBody = document.getElementById('confirm-overwrite-modal-body');
        const confirmBtn = document.getElementById('confirm-overwrite-btn');

        confirmModalTitle.textContent = title;
        confirmModalBody.textContent = body;
        confirmBtn.textContent = buttonText;
        confirmBtn.className = `btn ${buttonText.toLowerCase() === 'delete' ? 'btn-danger' : 'btn-primary'}`;

        const handleConfirm = async () => {
            if (typeof onConfirm === 'function') {
                await onConfirm(); // Wait for the async action (like saving) to complete
            }
            confirmModalInstance.hide(); // Hide the modal after the action is done
        };

        confirmBtn.addEventListener('click', handleConfirm, { once: true });

        // This listener cleans up in case the user closes the modal without confirming
        const handleModalHide = () => {
            confirmBtn.removeEventListener('click', handleConfirm);
        };
        confirmModalEl.addEventListener('hidden.bs.modal', handleModalHide, { once: true });

        confirmModalInstance.show();
    }

    confirmImportBtn.addEventListener('click', () => {
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

    /**
     * SHARE BUTTON: Opens a modal with the share link if the project is saved.
     */
    shareBtn.addEventListener('click', () => {
        if (!currentProjectDocId) {
            showToast("Please save the effect before sharing.", 'info');
            return; // Stop if not saved
        }

        // If saved, populate the input and show the modal
        const shareUrl = `${window.location.origin}${window.location.pathname} ? effectId = ${currentProjectDocId}`;
        const shareLinkInput = document.getElementById('share-link-input');
        shareLinkInput.value = shareUrl;

        const shareModal = new bootstrap.Modal(document.getElementById('share-modal'));
        shareModal.show();
    });

    /**
      * COPY SHARE LINK BUTTON: Copies the link from the share modal.
      */
    document.getElementById('copy-share-link-btn').addEventListener('click', () => {
        const shareLinkInput = document.getElementById('share-link-input');
        navigator.clipboard.writeText(shareLinkInput.value).then(() => {
            showToast("Link copied to clipboard!", 'success');
        });
    });

    document.getElementById('new-ws-btn').addEventListener('click', () => {
        showConfirmModal(
            'Create New Workspace',
            'Are you sure you want to clear the current workspace? Any unsaved changes will be lost.',
            'Clear Workspace',
            () => {
                resetWorkspace();
            }
        );
    });

    addObjectBtn.addEventListener('click', () => {
        currentProjectDocId = null;
        updateShareButtonState();
        const newId = objects.length > 0 ? (Math.max(...objects.map(o => o.id))) + 1 : 1;
        const newConfigs = getDefaultObjectConfig(newId);
        configStore.push(...newConfigs);

        const state = {
            id: newId,
            name: `Object ${newId}`, // Explicitly sets the default name
            gradient: {}
        };

        newConfigs.forEach(conf => {
            const key = conf.property.replace(`obj${newId}_`, '');
            let value = conf.default;

            if (conf.type === 'number') {
                value = parseFloat(value);
            } else if (conf.type === 'boolean') {
                value = (value === 'true');
            }

            if (key.startsWith('gradColor')) {
                state.gradient[key.replace('grad', '').toLowerCase()] = value;
            } else if (key === 'scrollDir') {
                state.scrollDirection = value;
            } else {
                state[key] = value;
            }
        });

        const propsToScale = ['x', 'y', 'width', 'height', 'innerDiameter', 'fontSize'];
        propsToScale.forEach(prop => {
            if (state[prop] !== undefined) {
                state[prop] *= 4;
            }
        });

        const newShape = new Shape({ ...state, ctx });
        objects.push(newShape);

        renderForm();
        updateFormValuesFromObjects();
        drawFrame();
        recordHistory();
    });;

    /**
     * CONFIRMATION MODAL: General listener for confirm button.
     */
    confirmBtn.addEventListener('click', () => {
        if (typeof confirmActionCallback === 'function') {
            confirmActionCallback();
        }
    });

    // This handles committed changes from text boxes, dropdowns, color pickers, and checkboxes.
    form.addEventListener('change', (e) => {
        recordHistory();
    });

    // Start the application.
    init();

});
