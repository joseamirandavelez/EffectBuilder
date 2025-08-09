// Shape.js
/**
 * Represents a drawable, interactive shape on the canvas.
 * Manages its own state, including position, size, appearance, and animation properties.
 */

// --- DEPENDENCIES: All of these functions are now self-contained in this file. ---
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

function drawPixelText(ctx, shape, textToRender) {
    const { x, y, width, height, pixelFont, fontSize, textAlign,
        textAnimation, scrollOffsetX, waveAngle, visibleCharCount } = shape;

    if (typeof textToRender !== 'string') return;

    const fontData = pixelFont === 'large' ? FONT_DATA_5PX : FONT_DATA_4PX;
    const { charWidth, charHeight, charSpacing, lineSpacing, map } = fontData;
    const pixelSize = fontSize / 10;

    const animatedText = textToRender.toUpperCase().substring(0, Math.floor(visibleCharCount));
    const lines = animatedText.split('\n');

    ctx.save();
    ctx.beginPath();

    if (textAnimation === 'wave') {
        const verticalPadding = 100;
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
 * Linearly interpolates between two hexadecimal colors.
 * @param {string} a - The starting color in hex format (e.g., "#RRGGBB").
 * @param {string} b - The ending color in hex format (e.g., "#RRGGBB").
 * @param {number} amount - The interpolation amount (0.0 to 1.0).
 * @returns {string} The interpolated color in hex format.
 */
function lerpColor(a, b, amount) {
    const amt = (typeof amount === 'number' && isFinite(amount)) ? Math.max(0, Math.min(1, amount)) : 0;

    // --- START: New HSL interpolation logic ---
    // Check if both inputs are HSL strings
    if (typeof a === 'string' && a.startsWith('hsl') && typeof b === 'string' && b.startsWith('hsl')) {
        const hslA = a.match(/(\d+(\.\d+)?)/g).map(Number);
        const hslB = b.match(/(\d+(\.\d+)?)/g).map(Number);
        const h = hslA[0] + amt * (hslB[0] - hslA[0]);
        const s = hslA[1] + amt * (hslB[1] - hslA[1]);
        const l = hslA[2] + amt * (hslB[2] - hslA[2]);
        return `hsl(${h}, ${s}%, ${l}%)`;
    }
    // --- END: New HSL interpolation logic ---
    const ah = parseInt(String(a).slice(1), 16), ar = ah >> 16, ag = (ah >> 8) & 0xff, ab = ah & 0xff, bh = parseInt(String(b).slice(1), 16), br = bh >> 16, bg = (bh >> 8) & 0xff, bb = bh & 0xff, rr = Math.round(ar + amt * (br - ar)), rg = Math.round(ag + amt * (bg - ag)), rb = Math.round(ab + amt * (bb - ab));
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

class Shape {
    constructor({ id, name, shape, x, y, width, height, rotation, gradient, gradType, scrollDirection, cycleColors, cycleSpeed, animationSpeed, ctx, innerDiameter, angularWidth, numberOfSegments, rotationSpeed, useSharpGradient, gradientStop, locked, numberOfRows, numberOfColumns, phaseOffset, animationMode, text, fontSize, textAlign, pixelFont, textAnimation, textAnimationSpeed, showTime, showDate, lineWidth, waveType, frequency, oscDisplayMode, pulseDepth, fillShape, enableWaveAnimation, waveStyle, waveCount, tetrisBlockCount, tetrisAnimation, tetrisSpeed, tetrisBounce, sides, points, starInnerRadius, enableStroke, strokeWidth, strokeGradType, strokeGradient, strokeScrollDir, strokeCycleColors, strokeCycleSpeed, strokeAnimationSpeed, fireSpread, pixelArtData, enableAudioReactivity, audioTarget, audioMetric, audioSensitivity, audioSmoothing, beatThreshold }) {
        // --- ALL properties are assigned here first ---
        this.dirty = true;
        this.id = id;
        this.name = name || `Object ${id}`;
        this.shape = shape || 'rectangle';
        this.x = x || 0;
        this.y = y || 0;
        this.width = width || 200;
        this.height = height || 152;
        this.rotation = rotation || 0;
        this.gradType = gradType || 'solid';
        this.gradient = gradient ? { ...gradient } : { color1: '#000000', color2: '#000000' };
        this.scrollDirection = scrollDirection || 'right';
        this.cycleColors = cycleColors || false;
        this.cycleSpeed = cycleSpeed || 0;
        this.animationSpeed = animationSpeed || 0;
        this.animationMode = animationMode || 'loop';
        this.ctx = ctx;
        this.hue1 = 0;
        this.hue2 = 90;
        this.scrollOffset = 0;
        this.enableStroke = enableStroke || false;
        this.strokeWidth = strokeWidth || 2;
        this.strokeGradType = strokeGradType || 'solid';
        this.strokeGradient = strokeGradient ? { ...strokeGradient } : { color1: '#FFFFFF', color2: '#000000' };
        this.strokeScrollDir = strokeScrollDir || 'right';
        this.strokeCycleColors = strokeCycleColors || false;
        this.strokeCycleSpeed = strokeCycleSpeed || 0;
        this.strokeAnimationSpeed = strokeAnimationSpeed || 0;
        this.strokeHue1 = 0;
        this.strokeHue2 = 90;
        this.strokeScrollOffset = 0;
        this.isReversing = false;
        this.animationState = 'scrolling';
        this.waitTimer = 0;
        this.innerDiameter = innerDiameter || 100;
        this.angularWidth = angularWidth || 20;
        this.numberOfSegments = numberOfSegments || 12;
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
        this.randomElementState = null;
        this.text = text || 'Hello';
        this.fontSize = fontSize || 60;
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
        this.lineWidth = lineWidth || 1;
        this.waveType = waveType || 'sine';
        this.frequency = frequency || 5;
        this.pulseDepth = pulseDepth !== undefined ? pulseDepth : 50;
        this.fillShape = fillShape || false;
        this.enableWaveAnimation = enableWaveAnimation !== undefined ? enableWaveAnimation : true;
        this.oscDisplayMode = oscDisplayMode || 'linear';
        this._pausedRotationSpeed = null;
        this._pausedAnimationSpeed = null;
        this.waveStyle = waveStyle || 'wavy';
        this.waveCount = waveCount || 5;
        this.tetrisBlockCount = tetrisBlockCount || 10;
        this.tetrisAnimation = tetrisAnimation || 'gravity';
        this.tetrisSpeed = tetrisSpeed || 5;
        this.tetrisBounce = tetrisBounce || 50;
        this.tetrisSpeedDivisor = 10.0;
        this.tetrisBlocks = [];
        this.tetrisSpawnTimer = 0;
        this.tetrisStackHeight = 0;
        this.tetrisActiveBlockIndex = 0;
        this.tetrisFadeState = 'in';
        this.sides = sides || 6;
        this.points = points || 5;
        this.starInnerRadius = starInnerRadius || 50;
        this.fireParticles = [];
        this.fireSpread = fireSpread || 100;
        this.particleSpawnCounter = 0;
        this.nextParticleId = 0;
        this.pixelArtData = pixelArtData || '[[1]]';
        this.internalScale = 1.0;
        this.colorOverride = null;
        this.audioHistory = new Array(30).fill(0); // Stores the last 30 frames of audio volume
        this.flashDecay = 0; // Controls the fade-out of the flash effect
        this.beatThreshold = beatThreshold || 30;
        this.baseBeatThreshold = this.beatThreshold;

        // --- ADD THESE NEW PROPERTIES ---
        // Sound Reactivity Properties
        this.enableAudioReactivity = enableAudioReactivity || false;
        this.audioTarget = audioTarget || 'size';
        this.audioMetric = audioMetric || 'volume';
        this.audioSensitivity = audioSensitivity || 10;
        this.smoothedAudioValue = 0;

        // Store base properties for non-destructive reactivity
        this.baseWidth = this.width;
        this.baseHeight = this.height;
        this.baseRotation = this.rotation;
        this.baseAnimationSpeed = this.animationSpeed;
        this.baseStrokeWidth = this.strokeWidth;
        this.baseGradient = { ...this.gradient };

        this.baseGradientStop = this.gradientStop;
        this.baseStarInnerRadius = this.starInnerRadius;
        this.baseInnerDiameter = this.innerDiameter;
        this.basePulseDepth = this.pulseDepth;
    }

    _applyAudioReactivity(audioData) {
        // Reset properties at the start of each frame.
        this.rotation = this.baseRotation || 0;
        this.internalScale = 1.0;
        this.colorOverride = null;
        this.gradient = { ...(this.baseGradient || { color1: '#000000', color2: '#000000' }) };

        // 1. Update Flash Decay
        if (this.flashDecay > 0) {
            this.flashDecay -= 0.18;
        }
        this.flashDecay = Math.max(0, this.flashDecay);

        // Exit if reactivity is disabled.
        if (!this.enableAudioReactivity || !audioData || !audioData[this.audioMetric] || this.audioTarget === 'none') {
            return;
        }

        const rawAudioValue = audioData[this.audioMetric].avg || 0;
        this.audioHistory.push(rawAudioValue);
        this.audioHistory.shift();

        const n = this.audioHistory.length;
        const mean = this.audioHistory.reduce((a, b) => a + b, 0) / n;
        const stdDev = Math.sqrt(this.audioHistory.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / n);
        const thresholdMultiplier = 0.5 + ((this.beatThreshold || 30) / 100.0) * 2.0;
        const threshold = mean + thresholdMultiplier * stdDev;

        if (rawAudioValue > threshold) {
            const sensitivity = (this.audioSensitivity / 100.0) * 1.5;
            this.flashDecay = Math.min(1.5, sensitivity);
        }

        const reactiveValue = this.flashDecay;
        const randomSign = Math.random() < 0.5 ? -1 : 1;

        switch (this.audioTarget) {
            case 'Flash':
                if (reactiveValue > 0) {
                    this.colorOverride = '#FFFFFF';
                    this.flashOpacity = Math.min(1.0, reactiveValue);
                } else { this.flashOpacity = 0; }
                break;
            case 'Size':
                this.internalScale = 1.0 + reactiveValue;
                break;
            case 'Rotation':
                this.rotation = this.baseRotation + (randomSign * reactiveValue * 180);
                break;
        }
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

    _getRandomColorForElement(elementIndex) {
        // FIX: Added this block to handle color cycling for random fills.
        if (this.cycleColors) {
            const hue = (this.hue1 + elementIndex * this.phaseOffset) % 360;
            return `hsl(${hue}, 100%, 50%)`;
        }

        if (this.gradType !== 'random') {
            return this.gradient.color1;
        }
        if (!this.randomElementState) {
            this.randomElementState = {};
        }

        if (!this.randomElementState[elementIndex]) {
            this.randomElementState[elementIndex] = {
                color: Math.random() < 0.5 ? this.gradient.color1 : this.gradient.color2,
                timer: Math.random() * 10 + 5
            };
        }

        const state = this.randomElementState[elementIndex];
        state.timer -= this.cycleSpeed;

        if (state.timer <= 0) {
            state.color = Math.random() < 0.5 ? this.gradient.color1 : this.gradient.color2;
            state.timer = Math.random() * 10 + 5;
        }

        return state.color;
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

    _updateFontSizeFromHeight() {
        if (this.shape !== 'text') return;

        const fontData = this.pixelFont === 'large' ? FONT_DATA_5PX : FONT_DATA_4PX;
        const { charHeight, lineSpacing } = fontData;
        const textToMeasure = this.getWrappedText() || ' ';
        const lines = textToMeasure.split('\n');

        const denominator = (lines.length * (charHeight + lineSpacing) - lineSpacing + 2);
        if (denominator <= 0) return;

        const newPixelSize = this.height / denominator;
        this.fontSize = Math.max(20, Math.round(newPixelSize * 10));
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
        const halfH = this.height / 2;

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

        const center = this.getCenter();
        const staticAngle = this.rotation * Math.PI / 180;

        this.ctx.save();
        this.ctx.translate(center.x, center.y);
        this.ctx.rotate(staticAngle);

        const halfW = this.width / 2;
        const halfH = this.height / 2;

        const localPoint = {
            x: (px - center.x) * Math.cos(-staticAngle) - (py - center.y) * Math.sin(-staticAngle),
            y: (px - center.x) * Math.sin(-staticAngle) + (py - center.y) * Math.cos(-staticAngle)
        };

        const h2 = this.handleSize / 2;
        const handlePositions = {
            'top-left': { x: -halfW, y: -halfH }, 'top': { x: 0, y: -halfH }, 'top-right': { x: halfW, y: -halfH },
            'left': { x: -halfW, y: 0 }, 'right': { x: halfW, y: 0 },
            'bottom-left': { x: -halfW, y: halfH }, 'bottom': { x: 0, y: halfH }, 'bottom-right': { x: halfW, y: halfH }
        };

        const rotHandleX = 0;
        const rotHandleY = -halfH + this.rotationHandleOffset;
        const dist = Math.sqrt(Math.pow(localPoint.x - rotHandleX, 2) + Math.pow(localPoint.y - rotHandleY, 2));

        this.ctx.restore();

        if (dist <= this.rotationHandleRadius + h2) {
            return { name: 'rotate', cursor: 'crosshair', type: 'rotation' };
        }

        for (const handle of this.handles) {
            const pos = handlePositions[handle.name];
            if (localPoint.x >= pos.x - h2 && localPoint.x <= pos.x + h2 && localPoint.y >= pos.y - h2 && localPoint.y <= pos.y + h2) {
                return handle;
            }
        }

        return null;
    }

    isPointInside(px, py) {
        const center = this.getCenter();
        const angle = -this.getRenderAngle();
        const s = Math.sin(angle);
        const c = Math.cos(angle);

        const dx = px - center.x;
        const dy = py - center.y;

        const localX = dx * c - dy * s;
        const localY = dx * s + dy * c;

        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;

        return (localX >= -halfWidth && localX <= halfWidth &&
            localY >= -halfHeight && localY <= halfHeight);
    }

    update(props) {
        // --- Store original state for calculations ---
        const oldWidth = this.width;
        const oldHeight = this.height;

        // --- PRE-UPDATE LOGIC ---
        const textChanged = props.text !== undefined && props.text !== this.text;
        const animationChanged = props.textAnimation !== undefined && props.textAnimation !== this.textAnimation;
        if ((textChanged && this.textAnimation === 'typewriter') || (animationChanged && props.textAnimation === 'typewriter')) {
            this.visibleCharCount = 0;
            this.typewriterWaitTimer = 0;
        }
        const animationTypeChanged = props.tetrisAnimation !== undefined && props.tetrisAnimation !== this.tetrisAnimation;
        const gradTypeChangedToTetris = (props.gradType !== undefined && props.gradType.startsWith('tetris')) && !this.gradType.startsWith('tetris');
        const blockCountChanged = props.tetrisBlockCount !== undefined && props.tetrisBlockCount !== this.tetrisBlockCount;
        if (animationTypeChanged || gradTypeChangedToTetris || blockCountChanged) {
            this.tetrisBlocks = [];
            this.tetrisSpawnTimer = 0;
            this.tetrisActiveBlockIndex = 0;
            this.tetrisFadeState = 'in';
        }
        if ((textChanged && (this.textAnimation === 'marquee' || this.textAnimation === 'wave')) || (animationChanged && (this.textAnimation === 'marquee' || this.textAnimation === 'wave'))) {
            this.scrollOffsetX = 0;
            this.waveAngle = 0;
        }
        const oldRows = this.numberOfRows;
        const oldCols = this.numberOfColumns;

        // --- UNIFIED UPDATE LOGIC ---
        // 1. Directly update the object's live properties from the form input.
        for (const key in props) {
            if (props[key] === undefined) continue;
            if (key === 'gradient' && typeof props[key] === 'object' && props[key] !== null) {
                if (props.gradient.color1 !== undefined) this.gradient.color1 = props.gradient.color1;
                if (props.gradient.color2 !== undefined) this.gradient.color2 = props.gradient.color2;
            } else if (key === 'strokeGradient' && typeof props[key] === 'object' && props[key] !== null) {
                if (props.strokeGradient.color1 !== undefined) this.strokeGradient.color1 = props.strokeGradient.color1;
                if (props.strokeGradient.color2 !== undefined) this.strokeGradient.color2 = props.strokeGradient.color2;
            } else {
                this[key] = props[key];
            }
        }

        this.dirty = true;

        // --- NEW: Adjust position to keep the center stationary ---
        if (props.width !== undefined || props.height !== undefined) {
            const dWidth = oldWidth - this.width;
            const dHeight = oldHeight - this.height;
            this.x += dWidth / 2;
            this.y += dHeight / 2;
        }

        // 2. AFTER updating, snapshot the new state into the 'base' properties.
        this.baseWidth = this.width;
        this.baseHeight = this.height;
        this.baseRotation = this.rotation;
        this.baseAnimationSpeed = this.animationSpeed;
        this.baseStrokeWidth = this.strokeWidth;
        this.baseGradient = { ...this.gradient };

        this.baseGradientStop = this.gradientStop;
        this.baseStarInnerRadius = this.starInnerRadius;
        this.baseInnerDiameter = this.innerDiameter;
        this.basePulseDepth = this.pulseDepth;

        // --- POST-UPDATE LOGIC ---
        if (this.numberOfRows !== oldRows || this.numberOfColumns !== oldCols) {
            this._shuffleCellOrder();
        }
        if (this.shape === 'text') {
            this._updateTextMetrics();
        }
    }

    _createLocalStrokeStyle(phase = 0) {
        if (this.colorOverride) {
            return this.colorOverride;
        }

        const c1 = this.strokeCycleColors ? `hsl(${this.strokeHue1 % 360}, 100%, 50%)` : this.strokeGradient.color1;
        const c2 = this.strokeCycleColors ? `hsl(${this.strokeHue2 % 360}, 100%, 50%)` : this.strokeGradient.color2;

        if (this.strokeGradType === 'alternating') {
            return (phase % 2 === 0) ? c1 : c2;
        }

        let phaseIndex = phase;
        if (this.animationMode === 'bounce-random') {
            if (this.cellOrder && this.cellOrder.length > phase) { phaseIndex = this.cellOrder[phase]; }
        } else if (this.animationMode === 'bounce-reversed' && this.isReversing) {
            let lastCellIndex = 0;
            if (this.shape === 'tetris') {
                lastCellIndex = Math.max(0, this.tetrisBlockCount - 1);
            } else {
                lastCellIndex = Math.max(0, (this.numberOfRows * this.numberOfColumns) - 1);
            }
            phaseIndex = lastCellIndex - phase;
        }

        const effectiveScrollOffset = this.strokeScrollOffset + phaseIndex * this.phaseOffset / 100.0;
        let p = (effectiveScrollOffset % 1.0 + 1.0) % 1.0;

        if (this.strokeGradType === 'linear') {
            const halfW = this.width / 2;
            const halfH = this.height / 2;
            let grad;

            switch (this.strokeScrollDir) {
                case 'up':
                    grad = this.ctx.createLinearGradient(0, halfH, 0, -halfH);
                    break;
                case 'down':
                    grad = this.ctx.createLinearGradient(0, -halfH, 0, halfH);
                    break;
                case 'left':
                    grad = this.ctx.createLinearGradient(halfW, 0, -halfW, 0);
                    break;
                case 'right':
                default:
                    grad = this.ctx.createLinearGradient(-halfW, 0, halfW, 0);
                    break;
            }

            if (this.animationMode.includes('bounce')) {
                grad.addColorStop(0, getPatternColor(0 - p, c1, c2));
                grad.addColorStop(0.5, getPatternColor(0.5 - p, c1, c2));
                grad.addColorStop(1, getPatternColor(1 - p, c1, c2));
            } else { // Loop mode
                const midPoint = 0.5;
                const stops = [];
                const getPatternColorAtTime = (time) => {
                    const t = (time % 1.0 + 1.0) % 1.0;
                    if (t < midPoint) return lerpColor(c1, c2, t / midPoint);
                    return lerpColor(c2, c1, (t - midPoint) / (1 - midPoint));
                };
                stops.push({ pos: 0, color: getPatternColorAtTime(0 - p) });
                stops.push({ pos: 1, color: getPatternColorAtTime(1 - p) });
                for (let i = -2; i <= 2; i++) {
                    const c1_pos = i + p;
                    const c2_pos = i + midPoint + p;
                    if (c1_pos > 0 && c1_pos < 1) stops.push({ pos: c1_pos, color: c1 });
                    if (c2_pos > 0 && c2_pos < 1) stops.push({ pos: c2_pos, color: c2 });
                }
                const uniqueStops = stops.sort((a, b) => a.pos - b.pos)
                    .filter((stop, index, self) => index === 0 || stop.pos > self[index - 1].pos + 0.0001);
                uniqueStops.forEach(stop => grad.addColorStop(stop.pos, stop.color));
            }
            return grad;
        }

        if (this.strokeGradType === 'radial') {
            const maxRadius = Math.max(this.width, this.height) / 2;
            if (maxRadius <= 0) return 'black';
            const grad = this.ctx.createRadialGradient(0, 0, 0, 0, 0, maxRadius);

            // FIX: Replaced the flawed "jumping" animation logic with the continuous,
            // looping algorithm used by the linear gradient. This creates a smooth pulse.
            if (this.animationMode.includes('bounce')) {
                // Bounce logic remains a simple pulse from center to edge and back.
                const wave = 1 - Math.abs(2 * p - 1);
                const midPoint = 0.5 * wave;
                grad.addColorStop(0, c1);
                grad.addColorStop(midPoint, c2);
                grad.addColorStop(1, c1);
            } else { // Loop mode
                const midPoint = 0.5; // Defines a 50/50 color split
                const stops = [];
                // This function defines the color at any point in the pattern
                const getPatternColorAtTime = (time) => {
                    const t = (time % 1.0 + 1.0) % 1.0; // Ensure time is always between 0.0 and 1.0
                    if (t < midPoint) return lerpColor(c1, c2, t / midPoint);
                    return lerpColor(c2, c1, (t - midPoint) / (1 - midPoint));
                };
                // Define the start and end colors based on the animation progress 'p'
                stops.push({ pos: 0, color: getPatternColorAtTime(0 - p) });
                stops.push({ pos: 1, color: getPatternColorAtTime(1 - p) });

                // Add intermediate color stops to create a seamless repeating pattern
                for (let i = -2; i <= 2; i++) {
                    const c1_pos = i + p;
                    const c2_pos = i + midPoint + p;
                    if (c1_pos > 0 && c1_pos < 1) stops.push({ pos: c1_pos, color: c1 });
                    if (c2_pos > 0 && c2_pos < 1) stops.push({ pos: c2_pos, color: c2 });
                }
                // Sort and apply the unique color stops to the gradient
                const uniqueStops = stops.sort((a, b) => a.pos - b.pos)
                    .filter((stop, index, self) => index === 0 || stop.pos > self[index - 1].pos + 0.0001);
                uniqueStops.forEach(stop => grad.addColorStop(stop.pos, stop.color));
            }
            return grad;
        }

        if (this.strokeGradType === 'rainbow' || this.strokeGradType === 'rainbow-radial') {
            const hueOffset = (this.strokeHue1 * 10) + (phaseIndex * (this.phaseOffset / 100.0) * 360);
            let grad;

            if (this.strokeGradType === 'rainbow-radial') {
                const maxRadius = Math.max(this.width, this.height) / 2;
                if (maxRadius <= 0) return 'black';
                grad = this.ctx.createRadialGradient(0, 0, 0, 0, 0, maxRadius);
            } else {
                const halfW = this.width / 2;
                const halfH = this.height / 2;
                switch (this.strokeScrollDir) {
                    case 'up':
                        grad = this.ctx.createLinearGradient(0, halfH, 0, -halfH);
                        break;
                    case 'down':
                        grad = this.ctx.createLinearGradient(0, -halfH, 0, halfH);
                        break;
                    case 'left':
                        grad = this.ctx.createLinearGradient(halfW, 0, -halfW, 0);
                        break;
                    case 'right':
                    default:
                        grad = this.ctx.createLinearGradient(-halfW, 0, halfW, 0);
                        break;
                }
            }

            const numStops = 60;
            for (let i = 0; i <= numStops; i++) {
                const hue = (i * (360 / numStops) + hueOffset) % 360;
                grad.addColorStop(i / numStops, `hsl(${hue}, 100%, 50%)`);
            }
            return grad;
        }
        return c1 || 'black';
    }

    /**
     * Creates a fill style for the shape's context, delegating to specialized helper methods.
     * This is the main dispatcher for creating gradients and fills.
     * @param {number} [phase=0] - The phase offset for animations, used in grids/groups.
     * @returns {CanvasGradient|string} The generated canvas style.
     */
    _createLocalFillStyle(phase = 0) {
        // --- START OF FIX ---
        // If the audio effect has set an override color, use it immediately.
        if (this.colorOverride) {
            return this.colorOverride;
        }
        // --- END OF FIX ---
        let c1 = this.gradient.color1;
        let c2 = this.gradient.color2;
        if (this.cycleColors) {
            c1 = `hsl(${(this.hue1 + phase * this.phaseOffset) % 360}, 100%, 50%)`;
            c2 = `hsl(${(this.hue2 + phase * this.phaseOffset) % 360}, 100%, 50%)`;
        }

        if (this.gradType === 'alternating') {
            return (phase % 2 === 0) ? c1 : c2;
        }
        const phaseIndex = this._getPhaseIndex(phase);
        const p = this._getAnimationProgress(phaseIndex);
        switch (this.gradType) {
            case 'linear':
                return this._createLinearGradient(c1, c2, p);
            case 'radial':
                return this._createRadialGradient(c1, c2, p);
            case 'rainbow':
            case 'rainbow-radial':
                const hueOffset = (this.scrollOffset * 360) + (phaseIndex * (this.phaseOffset / 100.0) * 360);
                return this._createRainbowGradient(hueOffset);
            default: // solid
                return c1 || 'black';
        }
    }

    /**
     * Determines the effective index for an animation phase, accounting for different animation modes.
     * @param {number} phase - The base phase value.
     * @returns {number} The calculated phase index.
     * @private
     */
    _getPhaseIndex(phase) {
        if (this.animationMode === 'bounce-random') {
            return (this.cellOrder && this.cellOrder.length > phase) ? this.cellOrder[phase] : phase;
        }
        if (this.animationMode === 'bounce-reversed' && this.isReversing) {
            let lastCellIndex = (this.numberOfRows * this.numberOfColumns) - 1;
            if (this.shape === 'tetris') {
                lastCellIndex = Math.max(0, this.tetrisBlockCount - 1);
            } else if (this.shape === 'pixel-art') {
                try {
                    const data = JSON.parse(this.pixelArtData);
                    lastCellIndex = Math.max(0, (data.length * data[0].length) - 1);
                } catch (e) { lastCellIndex = 0; }
            }
            return lastCellIndex - phase;
        }
        return phase;
    }

    /**
     * Calculates the animation progress value 'p' based on a phase index.
     * @param {number} phaseIndex - The effective phase index.
     * @returns {number} The animation progress value, always between 0.0 and 1.0.
     * @private
     */
    _getAnimationProgress(phaseIndex) {
        const effectiveScrollOffset = this.scrollOffset + phaseIndex * this.phaseOffset / 100.0;
        return (effectiveScrollOffset % 1.0 + 1.0) % 1.0;
    }

    /**
     * Creates a linear gradient style.
     * @param {string} c1 - The first color.
     * @param {string} c2 - The second color.
     * @param {number} p - The animation progress (0.0 to 1.0).
     * @returns {CanvasGradient} The generated linear gradient.
     * @private
     */
    _createLinearGradient(c1, c2, p) {
        const gradientStop = (typeof this.gradientStop === 'number' && isFinite(this.gradientStop)) ? this.gradientStop : 50;
        const progress = (typeof p === 'number' && isFinite(p)) ? p : 0;
        const halfW = this.width / 2;
        const halfH = this.height / 2;
        const isVertical = this.scrollDirection === 'up' || this.scrollDirection === 'down';
        const grad = isVertical ? this.ctx.createLinearGradient(0, -halfH, 0, halfH) : this.ctx.createLinearGradient(-halfW, 0, halfW, 0);
        if (this.useSharpGradient) {
            let p_bounce = progress;
            if (this.animationMode.includes('bounce')) {
                const bounce_progress = (progress < 0.5) ? (progress * 2) : ((1 - progress) * 2);
                p_bounce = bounce_progress * (1.0 - (gradientStop / 100.0));
            }
            const stopRatio = gradientStop / 100.0;
            const p1 = p_bounce;
            const p2 = p1 + stopRatio;
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
            if (this.animationMode.includes('bounce')) {
                grad.addColorStop(0, getPatternColor(0 - progress, c1, c2));
                grad.addColorStop(0.5, getPatternColor(0.5 - progress, c1, c2));
                grad.addColorStop(1, getPatternColor(1 - progress, c1, c2));
            } else {
                const midPoint = gradientStop / 100.0;
                const stops = [];
                const getPatternColorAtTime = (time) => {
                    const t = (time % 1.0 + 1.0) % 1.0;
                    if (midPoint <= 0.0001) return c2;
                    if (midPoint >= 0.9999) return c1;
                    if (t < midPoint) return lerpColor(c1, c2, t / midPoint);
                    return lerpColor(c2, c1, (t - midPoint) / (1 - midPoint));
                };
                stops.push({ pos: 0, color: getPatternColorAtTime(0 - progress) });
                stops.push({ pos: 1, color: getPatternColorAtTime(1 - progress) });
                for (let i = -2; i <= 2; i++) {
                    const c1_pos = i + progress;
                    const c2_pos = i + midPoint + progress;
                    if (c1_pos > 0 && c1_pos < 1) stops.push({ pos: c1_pos, color: c1 });
                    if (c2_pos > 0 && c2_pos < 1) stops.push({ pos: c2_pos, color: c2 });
                }
                const uniqueStops = stops.sort((a, b) => a.pos - b.pos).filter((stop, index, self) => index === 0 || stop.pos > self[index - 1].pos + 0.0001);
                uniqueStops.forEach(stop => {
                    const finalPos = (typeof stop.pos === 'number' && isFinite(stop.pos)) ? stop.pos : 0;
                    grad.addColorStop(Math.max(0, Math.min(1, finalPos)), stop.color);
                });
            }
        }
        return grad;
    }

    /**
     * Creates a radial gradient style, resulting in a smooth pulse.
     * @param {string} c1 - The first color.
     * @param {string} c2 - The second color.
     * @param {number} p - The animation progress (0.0 to 1.0).
     * @returns {CanvasGradient} The generated radial gradient.
     * @private
     */
    _createRadialGradient(c1, c2, p) {
        const gradientStop = (typeof this.gradientStop === 'number' && isFinite(this.gradientStop)) ? this.gradientStop : 50;
        const progress = (typeof p === 'number' && isFinite(p)) ? p : 0;
        const maxRadius = Math.max(this.width, this.height) / 2;
        if (maxRadius <= 0) return 'black';
        const grad = this.ctx.createRadialGradient(0, 0, 0, 0, 0, maxRadius);
        const wave = 1 - Math.abs(2 * progress - 1);
        if (this.useSharpGradient) {
            const stopPoint = (gradientStop / 100) * wave;
            grad.addColorStop(0, c1);
            grad.addColorStop(stopPoint, c1);
            grad.addColorStop(Math.min(1, stopPoint + 0.001), c2);
            grad.addColorStop(1, c2);
        } else {
            const midPoint = gradientStop / 100.0;
            const animatedMidPoint = midPoint * wave;
            grad.addColorStop(0, c1);
            grad.addColorStop(animatedMidPoint, c2);
            grad.addColorStop(1, c1);
        }
        return grad;
    }

    /**
     * Creates a rainbow gradient style (linear or radial).
     * @param {number} hueOffset - The starting hue for the rainbow animation.
     * @returns {CanvasGradient} The generated rainbow gradient.
     * @private
     */
    _createRainbowGradient(hueOffset) {
        let grad;
        const isVertical = this.scrollDirection === 'up' || this.scrollDirection === 'down';

        if (this.gradType === 'rainbow-radial') {
            const maxRadius = Math.max(this.width, this.height) / 2;
            if (maxRadius <= 0) return 'black';
            grad = this.ctx.createRadialGradient(0, 0, 0, 0, 0, maxRadius);
        } else {
            const halfW = this.width / 2;
            const halfH = this.height / 2;
            grad = isVertical
                ? this.ctx.createLinearGradient(0, halfH, 0, -halfH)
                : this.ctx.createLinearGradient(halfW, 0, -halfW, 0);
        }

        const numStops = 60;
        for (let i = 0; i <= numStops; i++) {
            const hue = (i * (360 / numStops) + hueOffset) % 360;
            grad.addColorStop(i / numStops, `hsl(${hue}, 100%, 50%)`);
        }
        return grad;
    }

    updateAnimationState(audioData) {
        this._applyAudioReactivity(audioData);

        // All speeds are now derived from the single, safeguarded 'animationSpeed' property.
        const safeSpeed = (typeof this.animationSpeed === 'number' && isFinite(this.animationSpeed)) ? this.animationSpeed : 0;

        if (this.shape === 'tetris') {
            if (this.tetrisAnimation === 'fade-in-stack') {
                if (this.tetrisBlocks.length === 0) {
                    const blockHeight = this.height / this.tetrisBlockCount;
                    for (let i = 0; i < this.tetrisBlockCount; i++) {
                        this.tetrisBlocks.push({
                            w: this.width, h: blockHeight, x: 0,
                            y: this.height - (i + 1) * blockHeight,
                            life: 0, settled: true
                        });
                    }
                    this.tetrisActiveBlockIndex = 0;
                    this.tetrisFadeState = 'in';
                }
                const fadeSpeed = this.tetrisSpeed / 100.0;
                if (this.tetrisFadeState === 'in') {
                    if (this.tetrisActiveBlockIndex < this.tetrisBlocks.length) {
                        const activeBlock = this.tetrisBlocks[this.tetrisActiveBlockIndex];
                        activeBlock.life += fadeSpeed;
                        if (activeBlock.life >= 1.0) {
                            activeBlock.life = 1.0;
                            this.tetrisActiveBlockIndex++;
                        }
                    } else {
                        this.tetrisFadeState = 'out';
                    }
                } else { // Fade-out phase
                    let allFadedOut = true;
                    this.tetrisBlocks.forEach(block => {
                        block.life -= fadeSpeed;
                        if (block.life > 0) { allFadedOut = false; } else { block.life = 0; }
                    });
                    if (allFadedOut) { this.tetrisBlocks = []; }
                }
            } else {
                this.tetrisSpawnTimer--;
                if (this.tetrisBlocks.length === 0 && this.tetrisSpawnTimer < 0) {
                    this.tetrisSpawnTimer = 0;
                    this.tetrisActiveBlockIndex = 0;
                }
                if (this.tetrisSpawnTimer <= 0 && this.tetrisBlocks.length < this.tetrisBlockCount) {
                    let newBlock = { vy: 0, vx: 0, life: 1.0, settled: false, fading: false };
                    const blockHeight = this.height / this.tetrisBlockCount;
                    newBlock.w = this.width; newBlock.h = blockHeight;
                    newBlock.x = 0; newBlock.y = -newBlock.h;
                    this.tetrisBlocks.push(newBlock);
                    if (this.tetrisAnimation === 'gravity' || this.tetrisAnimation === 'gravity-fade') {
                        this.tetrisSpawnTimer = 10;
                    }
                }
                if (this.tetrisAnimation === 'gravity' || this.tetrisAnimation === 'gravity-fade') {
                    this.tetrisBlocks.forEach((block, index) => {
                        if (block.settled) return;
                        const gravity = 0.5;
                        const bounceFactor = this.tetrisBounce / 100.0;
                        let bounceBoundaryTop = this.height;
                        this.tetrisBlocks.forEach((other, i) => {
                            if (i !== index && other.y > block.y) {
                                bounceBoundaryTop = Math.min(bounceBoundaryTop, other.y);
                            }
                        });
                        block.vy += gravity;
                        block.y += block.vy;
                        if (block.y + block.h >= bounceBoundaryTop) {
                            block.y = bounceBoundaryTop - block.h;
                            block.vy *= -bounceFactor;
                            let stableBoundaryTop = this.height;
                            this.tetrisBlocks.forEach((other, i) => {
                                if (i !== index && other.settled) {
                                    stableBoundaryTop = Math.min(stableBoundaryTop, other.y);
                                }
                            });
                            if (block.y + block.h >= stableBoundaryTop - 1 && Math.abs(block.vy) < 1) {
                                block.settled = true;
                            }
                        }
                    });
                } else { // Linear Animation
                    if (this.tetrisActiveBlockIndex < this.tetrisBlocks.length) {
                        const activeBlock = this.tetrisBlocks[this.tetrisActiveBlockIndex];
                        if (!activeBlock.settled) {
                            const speed = this.tetrisSpeed / this.tetrisSpeedDivisor;
                            let boundary = (this.tetrisActiveBlockIndex > 0) ? this.tetrisBlocks[this.tetrisActiveBlockIndex - 1].y : this.height;
                            activeBlock.y += speed;
                            if (activeBlock.y + activeBlock.h >= boundary) {
                                activeBlock.y = boundary - activeBlock.h;
                                activeBlock.settled = true;
                                this.tetrisActiveBlockIndex++;
                            }
                        }
                    }
                }
                if (this.tetrisAnimation === 'gravity-fade') {
                    this.tetrisBlocks.forEach(block => { if (block.settled) block.fading = true; });
                } else {
                    const allSpawned = this.tetrisBlocks.length === this.tetrisBlockCount;
                    const allSettled = this.tetrisBlocks.every(b => b.settled);
                    if (allSpawned && allSettled) {
                        this.tetrisBlocks.forEach(b => b.fading = true);
                    }
                }
                this.tetrisBlocks.forEach(block => { if (block.fading) block.life -= 0.05; });
                this.tetrisBlocks = this.tetrisBlocks.filter(b => b.life > 0);
            }
        }

        if (this.gradType !== 'random' && this.randomElementState) {
            this.randomElementState = null;
        }

        // Color cycling now uses the main animation speed.
        this.hue1 += safeSpeed * 10;
        this.hue2 += safeSpeed * 10;
        this.strokeHue1 += safeSpeed * 10;
        this.strokeHue2 += safeSpeed * 10;

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

        // Gradient scrolling now uses the main animation speed.
        if (this.gradType !== 'solid' && this.gradType !== 'alternating' && this.gradType !== 'random') {
            const increment = safeSpeed * gradientSpeedMultiplier;
            const directionMultiplier = (this.scrollDirection === 'left' || this.scrollDirection === 'up') ? -1 : 1;
            this.scrollOffset += increment * directionMultiplier;
        }

        // Stroke gradient scrolling now uses the main animation speed.
        if (this.strokeGradType !== 'solid' && this.strokeGradType !== 'alternating' && this.strokeGradType !== 'random') {
            const increment = safeSpeed * gradientSpeedMultiplier;
            const directionMultiplier = (this.strokeScrollDir === 'left' || this.strokeScrollDir === 'up') ? -1 : 1;
            this.strokeScrollOffset += increment * directionMultiplier;
        }

        const rotationIncrement = (typeof this.rotationSpeed === 'number' && isFinite(this.rotationSpeed)) ? (this.rotationSpeed / 1000) : 0;
        this.rotationAngle += rotationIncrement;

        let animationIncrement;
        if (this.shape == 'oscilloscope' && this.oscDisplayMode == 'seismic') {
            animationIncrement = safeSpeed * seismicAnimationSpeedMultiplier;
            const directionMultiplier = (this.scrollDirection === 'right' || this.scrollDirection === 'down') ? 1 : -1;
            animationIncrement *= directionMultiplier;
        } else {
            animationIncrement = safeSpeed * shapeAnimationSpeedMultiplier;
        }

        if (isFinite(animationIncrement)) {
            this.animationAngle += animationIncrement;
        }

        if (this.shape === 'fire' || this.shape === 'fire-radial') {
            const speed = (typeof this.animationSpeed === 'number' && isFinite(this.animationSpeed)) ? this.animationSpeed : 0;
            this.particleSpawnCounter += speed / 4.0;
            const particlesToSpawn = Math.floor(this.particleSpawnCounter);
            this.particleSpawnCounter -= particlesToSpawn;

            if (this.shape === 'fire') {
                this.fireParticles.forEach(p => { p.y -= p.speed; p.age++; });
                this.fireParticles = this.fireParticles.filter(p => p.age < p.maxAge);
                for (let i = 0; i < particlesToSpawn; i++) {
                    if (this.fireParticles.length < 300) {
                        const halfH = this.height / 2;
                        const maxAge = (Math.random() * 60 + 90);
                        const particleSpeed = (this.height / maxAge) * (Math.random() * 0.2 + 0.8);
                        const startSize = (Math.random() * 0.5 + 0.5) * (this.width / 7);

                        const newParticle = {
                            id: this.nextParticleId++,
                            x: (Math.random() - 0.5) * this.width * 0.9, y: halfH,
                            sizeX: startSize, sizeY: startSize * (Math.random() * 1.5 + 0.5),
                            age: 0, maxAge: maxAge, speed: particleSpeed
                        };

                        let baseColor;
                        const gradProgress = (newParticle.x + (this.width / 2)) / this.width;

                        if (this.cycleColors) {
                            const hue = (this.hue1 + newParticle.id * this.phaseOffset) % 360;
                            baseColor = `hsl(${hue}, 100%, 50%)`;
                        } else if (this.gradType === 'rainbow' || this.gradType === 'rainbow-radial') {
                            const hue = (gradProgress * 360 + this.hue1) % 360;
                            baseColor = `hsl(${hue}, 100%, 50%)`;
                        } else if (this.gradType === 'random') {
                            baseColor = Math.random() < 0.5 ? this.gradient.color1 : this.gradient.color2;
                        } else if (this.gradType === 'alternating') {
                            baseColor = newParticle.id % 2 === 0 ? this.gradient.color1 : this.gradient.color2;
                        } else if (this.gradType === 'linear') {
                            baseColor = lerpColor(this.gradient.color1, this.gradient.color2, gradProgress);
                        } else { // Solid color is the default
                            baseColor = this.gradient.color1;
                        }
                        newParticle.color = baseColor;
                        this.fireParticles.push(newParticle);
                    }
                }
            } else { // 'fire-radial'
                this.fireParticles.forEach(p => {
                    p.x += Math.cos(p.angle) * p.speed;
                    p.y += Math.sin(p.angle) * p.speed;
                    p.age++;
                });
                this.fireParticles = this.fireParticles.filter(p => p.age < p.maxAge);
                for (let i = 0; i < particlesToSpawn; i++) {
                    if (this.fireParticles.length < 300) {
                        const spreadMultiplier = this.fireSpread / 100.0;
                        const maxRadius = Math.min(this.width, this.height) / 2;
                        const maxAge = (Math.random() * 60 + 90);
                        const particleSpeed = (maxRadius / maxAge) * spreadMultiplier;
                        const startSize = (Math.random() * 0.5 + 0.5) * (Math.min(this.width, this.height) / 8);
                        if (maxAge < 1) continue;

                        const newParticle = {
                            id: this.nextParticleId++,
                            x: 0, y: 0,
                            sizeX: startSize, sizeY: startSize,
                            age: 0, maxAge: maxAge,
                            speed: particleSpeed, angle: Math.random() * 2 * Math.PI
                        };

                        let baseColor;
                        const gradProgress = newParticle.angle / (2 * Math.PI);

                        if (this.cycleColors) {
                            const hue = (this.hue1 + newParticle.id * this.phaseOffset) % 360;
                            baseColor = `hsl(${hue}, 100%, 50%)`;
                        } else if (this.gradType === 'rainbow' || this.gradType === 'rainbow-radial') {
                            const hue = (gradProgress * 360 + this.hue1) % 360;
                            baseColor = `hsl(${hue}, 100%, 50%)`;
                        } else if (this.gradType === 'random') {
                            baseColor = Math.random() < 0.5 ? this.gradient.color1 : this.gradient.color2;
                        } else if (this.gradType === 'alternating') {
                            baseColor = newParticle.id % 2 === 0 ? this.gradient.color1 : this.gradient.color2;
                        } else if (this.gradType === 'radial' || this.gradType === 'linear') {
                            baseColor = lerpColor(this.gradient.color1, this.gradient.color2, gradProgress);
                        } else { // Solid color is the default
                            baseColor = this.gradient.color1;
                        }
                        newParticle.color = baseColor;
                        this.fireParticles.push(newParticle);
                    }
                }
            }
        } else {
            if (this.fireParticles.length > 0) {
                this.fireParticles = [];
            }
        }
    }

    draw(isSelected) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const angleToUse = this.getRenderAngle();

        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(angleToUse);

        if (this.internalScale && this.internalScale !== 1.0) {
            this.ctx.scale(this.internalScale, this.internalScale);
        }

        const applyStrokeInside = () => {
            if (this.enableStroke && this.strokeWidth > 0) {
                this.ctx.save();
                this.ctx.clip();
                this.ctx.strokeStyle = this._createLocalStrokeStyle();
                this.ctx.lineWidth = this.strokeWidth * 2;
                this.ctx.stroke();
                this.ctx.restore();
            }
        };

        if (this.shape === 'fire' || this.shape === 'fire-radial') {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.rect(-this.width / 2, -this.height / 2, this.width, this.height);
            this.ctx.clip();

            // --- START OF FIX ---
            // These two lines, which drew a black rectangle, have been removed.
            // this.ctx.fillStyle = '#000000';
            // this.ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
            // --- END OF FIX ---

            this.ctx.globalCompositeOperation = 'lighter';
            this.fireParticles.forEach(p => {
                const lifeRatio = 1.0 - (p.age / p.maxAge);
                let particleColor;
                if (p.color.startsWith('hsl')) {
                    const baseHue = p.color.match(/hsl\((\d+\.?\d*)/)[1];
                    const lightness = 50 * lifeRatio;
                    particleColor = `hsl(${baseHue}, 100%, ${lightness}%)`;
                } else {
                    particleColor = lerpColor('#000000', p.color, lifeRatio);
                }
                const opacity = Math.sin(lifeRatio * Math.PI);
                this.ctx.beginPath();
                this.ctx.fillStyle = particleColor;
                this.ctx.globalAlpha = opacity;
                this.ctx.ellipse(p.x, p.y, p.sizeX * lifeRatio, p.sizeY * lifeRatio, 0, 0, 2 * Math.PI);
                this.ctx.fill();
            });
            this.ctx.restore();
        } else if (this.shape === 'pixel-art') {
            try {
                if (!this.pixelArtData) return;
                const data = (typeof this.pixelArtData === 'string') ? JSON.parse(this.pixelArtData) : this.pixelArtData;
                if (!Array.isArray(data) || data.length === 0 || !Array.isArray(data[0])) { return; }
                const rows = data.length;
                const cols = data[0].length;
                if (cols === 0) return;
                const cellWidth = this.width / cols;
                const cellHeight = this.height / rows;
                const isGradientFill = this.gradType === 'linear' || this.gradType === 'radial' || this.gradType.startsWith('rainbow');
                if (isGradientFill) { this.ctx.fillStyle = this._createLocalFillStyle(); }
                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        const alphaValue = data[r] && data[r][c] ? data[r][c] : 0;
                        if (alphaValue > 0) {
                            if (!isGradientFill) {
                                const cellIndex = r * cols + c;
                                this.ctx.fillStyle = this.gradType === 'random' ? this._getRandomColorForElement(cellIndex) : this._createLocalFillStyle(cellIndex);
                            }
                            this.ctx.globalAlpha = alphaValue;
                            this.ctx.fillRect(-this.width / 2 + c * cellWidth, -this.height / 2 + r * cellHeight, cellWidth, cellHeight);
                        }
                    }
                }
                this.ctx.globalAlpha = 1.0;
            } catch (e) { console.error("Failed to draw pixel art:", e); }
        } else if (this.shape === 'tetris') {
            this.ctx.beginPath();
            this.ctx.rect(-this.width / 2, -this.height / 2, this.width, this.height);
            this.ctx.clip();
            this.tetrisBlocks.forEach((block, index) => {
                this.ctx.fillStyle = this.gradType === 'random' ? this._getRandomColorForElement(index) : this._createLocalFillStyle(index);
                this.ctx.globalAlpha = block.life;
                const drawX = block.x - (this.width / 2);
                const drawY = block.y - (this.height / 2);
                this.ctx.fillRect(Math.round(drawX), Math.round(drawY), Math.ceil(block.w), Math.ceil(block.h));
            });
            this.ctx.globalAlpha = 1.0;
        } else if (this.shape === 'text') {
            const textToRender = this.getDisplayText();
            const centeredShape = { ...this, x: -this.width / 2, y: -this.height / 2, };
            this.ctx.fillStyle = this._createLocalFillStyle();
            drawPixelText(this.ctx, centeredShape, textToRender);
        } else if (this.shape === 'oscilloscope') {
            const activeAnimationAngle = this.enableWaveAnimation ? this.animationAngle : 0;
            if (this.oscDisplayMode === 'radial') {
                this.ctx.lineWidth = this.lineWidth;
                this.ctx.strokeStyle = this._createLocalFillStyle();
                const totalRadius = (Math.min(this.width, this.height) / 2) - (this.ctx.lineWidth / 2);
                if (totalRadius > 0) {
                    this.ctx.beginPath();
                    const baseRadius = totalRadius * (0.5 + (this.pulseDepth || 0) / 100.0 * 0.5);
                    const maxAmplitude = totalRadius - baseRadius;
                    for (let i = 0; i <= 360; i++) {
                        const angleRad = (i * Math.PI) / 180;
                        const waveFuncAngle = 2 * Math.PI * this.frequency * (i / 360) + activeAnimationAngle * 2;
                        let y_wave;
                        switch (this.waveType) {
                            case 'square': y_wave = Math.sin(waveFuncAngle) >= 0 ? 1 : -1; break;
                            case 'sawtooth': y_wave = (((waveFuncAngle / (2 * Math.PI)) % 1) * 2) - 1; break;
                            case 'triangle': y_wave = Math.asin(Math.sin(waveFuncAngle)) * (2 / Math.PI); break;
                            case 'earthquake': y_wave = Math.sin(waveFuncAngle * 0.8) * 0.5 + Math.sin(waveFuncAngle * 2.2) * 0.3 + Math.sin(waveFuncAngle * 5.0) * 0.2; break;
                            default: y_wave = Math.sin(waveFuncAngle); break;
                        }
                        const finalRadius = baseRadius + y_wave * maxAmplitude;
                        if (i === 0) this.ctx.moveTo(finalRadius * Math.cos(angleRad), finalRadius * Math.sin(angleRad));
                        else this.ctx.lineTo(finalRadius * Math.cos(angleRad), finalRadius * Math.sin(angleRad));
                    }
                    this.ctx.closePath();
                    this.ctx.stroke();
                }
            } else if (this.oscDisplayMode === 'seismic') {
                this.ctx.lineWidth = this.lineWidth;
                const maxRadius = Math.min(this.width, this.height) / 2;
                const waveCount = Math.max(1, this.waveCount);
                const spacing = maxRadius / waveCount;
                const totalCycle = maxRadius + spacing;
                const progress = ((activeAnimationAngle * 10) % totalCycle + totalCycle) % totalCycle;
                for (let i = waveCount - 1; i >= 0; i--) {
                    let radius = (progress + i * spacing) % totalCycle;
                    if (radius > maxRadius) continue;
                    let alpha = 1.0 - (radius / maxRadius);
                    const fadeInLimit = spacing;
                    if (radius < fadeInLimit) alpha *= (radius / fadeInLimit);
                    if (alpha <= 0) continue;
                    this.ctx.globalAlpha = alpha;
                    this.ctx.beginPath();
                    if (this.waveStyle === 'wavy') {
                        const points = Math.max(60, this.frequency * 20);
                        const maxAmplitude = (this.pulseDepth / 100) * 20;
                        const amplitude = maxAmplitude * (radius / maxRadius);
                        const rotationalPhase = (activeAnimationAngle / 10.0) - (i * (this.phaseOffset / this.frequency) * (Math.PI / 2));
                        for (let j = 0; j <= points; j++) {
                            const angle = (j / points) * 2 * Math.PI;
                            const freqAngle = angle * this.frequency;
                            let y_wave;
                            switch (this.waveType) {
                                case 'square': y_wave = Math.sin(freqAngle) >= 0 ? 1 : -1; break;
                                case 'sawtooth': y_wave = (((freqAngle / (2 * Math.PI)) % 1) * 2) - 1; break;
                                case 'triangle': y_wave = Math.asin(Math.sin(freqAngle)) * (2 / Math.PI); break;
                                case 'earthquake': y_wave = Math.sin(freqAngle * 0.8) * 0.5 + Math.sin(freqAngle * 2.2) * 0.3 + Math.sin(freqAngle * 5.0) * 0.2; break;
                                default: y_wave = Math.sin(freqAngle); break;
                            }
                            const r = radius + y_wave * amplitude;
                            const finalAngle = angle + rotationalPhase;
                            this.ctx[j === 0 ? 'moveTo' : 'lineTo'](Math.cos(finalAngle) * r, Math.sin(finalAngle) * r);
                        }
                    } else { this.ctx.arc(0, 0, radius, 0, 2 * Math.PI); }
                    this.ctx.closePath();
                    const style = this._createLocalFillStyle(i);
                    this.ctx.strokeStyle = style;
                    this.ctx.fillStyle = style;
                    if (this.fillShape) { this.ctx.fill(); } else { this.ctx.stroke(); }
                }
                this.ctx.globalAlpha = 1.0;
            } else { // Linear Mode
                const halfW = this.width / 2;
                const halfH = this.height / 2;
                const activeLineWidth = this.lineWidth;
                const amplitude = Math.max(1, (this.height - activeLineWidth) / 2);
                this.ctx.beginPath();
                for (let i = 0; i <= this.width; i++) {
                    const progress = i / this.width;
                    const angle = 2 * Math.PI * this.frequency * progress + activeAnimationAngle;
                    let y_wave;
                    switch (this.waveType) {
                        case 'square': y_wave = Math.sin(angle) >= 0 ? 1 : -1; break;
                        case 'sawtooth': y_wave = (((angle / (Math.PI * 2)) % 1) * 2) - 1; break;
                        case 'triangle': y_wave = Math.asin(Math.sin(angle)) * (2 / Math.PI); break;
                        case 'earthquake': y_wave = Math.sin(angle * 0.8) * 0.5 + Math.sin(angle * 2.2) * 0.3 + Math.sin(angle * 5.0) * 0.2; break;
                        default: y_wave = Math.sin(angle); break;
                    }
                    const px = -halfW + i;
                    const py = -y_wave * amplitude;
                    if (i === 0) this.ctx.moveTo(px, py); else this.ctx.lineTo(px, py);
                }
                if (this.fillShape) {
                    this.ctx.save();
                    this.ctx.lineTo(halfW, halfH);
                    this.ctx.lineTo(-halfW, halfH);
                    this.ctx.closePath();
                    this.ctx.fillStyle = this._createLocalFillStyle();
                    this.ctx.fill();
                    this.ctx.restore();
                }
                this.ctx.strokeStyle = this._createLocalFillStyle();
                this.ctx.lineWidth = this.lineWidth;
                if (this.ctx.lineWidth <= 0 || !isFinite(this.ctx.lineWidth)) { this.ctx.lineWidth = 1; }
                this.ctx.stroke();
            }
        } else {
            if (this.shape === 'ring') {
                const oR = this.width / 2; const iR = this.innerDiameter / 2;
                if (iR >= 0 && iR < oR && this.numberOfSegments > 0) {
                    const aStep = (2 * Math.PI) / this.numberOfSegments; const segAngle = (this.angularWidth * Math.PI) / 180;
                    for (let i = 0; i < this.numberOfSegments; i++) {
                        this.ctx.beginPath();
                        const startAngle = i * aStep + this.animationAngle; const endAngle = startAngle + segAngle;
                        this.ctx.moveTo(Math.cos(startAngle) * oR, Math.sin(startAngle) * oR);
                        this.ctx.arc(0, 0, oR, startAngle, endAngle, false);
                        this.ctx.lineTo(Math.cos(endAngle) * iR, Math.sin(endAngle) * iR);
                        this.ctx.arc(0, 0, iR, endAngle, startAngle, true);
                        this.ctx.closePath();
                        this.ctx.fillStyle = this.gradType === 'random' ? this._getRandomColorForElement(i) : this._createLocalFillStyle(i);
                        this.ctx.fill();
                        applyStrokeInside();
                    }
                }
            } else if (this.shape === 'rectangle' && (this.numberOfRows > 1 || this.numberOfColumns > 1)) {
                const cellW = this.width / this.numberOfColumns; const cellH = this.height / this.numberOfRows;
                for (let row = 0; row < this.numberOfRows; row++) {
                    for (let col = 0; col < this.numberOfColumns; col++) {
                        const cellIndex = row * this.numberOfColumns + col;
                        this.ctx.beginPath();
                        this.ctx.rect(-this.width / 2 + col * cellW, -this.height / 2 + row * cellH, cellW, cellH);
                        this.ctx.fillStyle = this.gradType === 'random' ? this._getRandomColorForElement(cellIndex) : this._createLocalFillStyle(cellIndex);
                        this.ctx.fill();
                        applyStrokeInside();
                    }
                }
            } else {
                this.ctx.beginPath();
                if (this.shape === 'circle') { this.ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, 2 * Math.PI); }
                else if (this.shape === 'polygon') {
                    const rX = this.width / 2; const rY = this.height / 2; const sides = Math.max(3, this.sides);
                    for (let i = 0; i < sides; i++) {
                        const a = (i / sides) * 2 * Math.PI - (Math.PI / 2);
                        this.ctx[i === 0 ? 'moveTo' : 'lineTo'](rX * Math.cos(a), rY * Math.sin(a));
                    }
                    this.ctx.closePath();
                } else if (this.shape === 'star') {
                    const oRX = this.width / 2; const oRY = this.height / 2;
                    const iRX = oRX * (this.starInnerRadius / 100); const iRY = oRY * (this.starInnerRadius / 100);
                    const points = Math.max(3, this.points);
                    for (let i = 0; i < 2 * points; i++) {
                        const rX = (i % 2 === 0) ? oRX : iRX; const rY = (i % 2 === 0) ? oRY : iRY;
                        const a = (i / (2 * points)) * 2 * Math.PI - (Math.PI / 2);
                        this.ctx[i === 0 ? 'moveTo' : 'lineTo'](rX * Math.cos(a), rY * Math.sin(a));
                    }
                    this.ctx.closePath();
                } else { this.ctx.rect(-this.width / 2, -this.height / 2, this.width, this.height); }
                this.ctx.fillStyle = this.gradType === 'random' ? this._getRandomColorForElement(0) : this._createLocalFillStyle();
                this.ctx.fill();
                applyStrokeInside();
            }
        }
        this.ctx.restore();
    }

    drawSelectionUI() {
        const selectionColor = this.locked ? 'orange' : '#00f6ff';
        const center = this.getCenter();
        const staticAngle = this.rotation * Math.PI / 180;

        this.ctx.save();
        this.ctx.translate(center.x, center.y);
        this.ctx.rotate(staticAngle);

        const halfW = this.width / 2;
        const halfH = this.height / 2;

        this.ctx.strokeStyle = selectionColor;
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([6, 4]);
        this.ctx.strokeRect(-halfW, -halfH, this.width, this.height);
        this.ctx.setLineDash([]);

        if (!this.locked) {
            this.ctx.fillStyle = selectionColor;
            const h2 = this.handleSize / 2;
            const handlePositions = [
                { x: -halfW, y: -halfH }, { x: 0, y: -halfH }, { x: halfW, y: -halfH },
                { x: -halfW, y: 0 }, { x: halfW, y: 0 },
                { x: -halfW, y: halfH }, { x: 0, y: halfH }, { x: halfW, y: halfH }
            ];
            handlePositions.forEach(pos => {
                this.ctx.fillRect(pos.x - h2, pos.y - h2, this.handleSize, this.handleSize);
            });

            const rotHandleX = 0;
            const rotHandleY = -halfH + this.rotationHandleOffset;
            this.ctx.beginPath();
            this.ctx.moveTo(0, -halfH);
            this.ctx.lineTo(rotHandleX, rotHandleY);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.arc(rotHandleX, rotHandleY, this.rotationHandleRadius, 0, 2 * Math.PI);
            this.ctx.fill();
        }

        this.ctx.restore();

        if (this.locked) {
            this.ctx.save();
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.fillText('白', center.x, center.y);
            this.ctx.restore();
        }
    }
}
