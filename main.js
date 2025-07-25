let snapLines = [];

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

class RealAudioEngine {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.audio = {
            level: -100, // Start at silent
            density: 0,
            freq: null
        };
        this.isInitialized = false;
    }

    async start() {
        if (this.isInitialized) return true;
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });

            if (stream.getAudioTracks().length === 0) {
                alert("Audio permission was not granted. Please try again and be sure to check the 'Share audio' box.");
                stream.getTracks().forEach(track => track.stop());
                return false;
            }

            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            const source = this.audioContext.createMediaStreamSource(stream);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 512;

            const gainNode = this.audioContext.createGain();
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);

            source.connect(this.analyser);
            this.analyser.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            this.audio.freq = new Uint8Array(this.analyser.frequencyBinCount);
            this.isInitialized = true;
            console.log("Audio capture started successfully!");
            return true;
        } catch (err) {
            console.error("Error capturing audio:", err);
            alert("Could not start audio capture. This feature may not be supported by your browser or you may have cancelled the request.");
            return false;
        }
    }

    update() {
        if (!this.isInitialized || !this.audio.freq) return;

        // Get frequency data for the visualizer
        this.analyser.getByteFrequencyData(this.audio.freq);

        // --- START: New logic to calculate overall audio level ---
        // Calculate the average volume from all frequency bins
        let sum = 0;
        for (let i = 0; i < this.audio.freq.length; i++) {
            sum += this.audio.freq[i];
        }
        const average = sum / this.audio.freq.length;

        // Normalize the average (0-255) to a 0-1 range
        const normalizedLevel = average / 255;
        // Convert the 0-1 range to the decibel-like -100 to 0 range the oscilloscope expects
        this.audio.level = (normalizedLevel * 100) - 100;
        // --- END: New logic ---
    }
}

const engine = new RealAudioEngine();

// // This class simulates the SignalRGB engine.audio object for the web preview
// class MockAudioEngine {
//     constructor() {
//         this.audio = {
//             level: -50,
//             density: 0,
//             freq: new Int8Array(200).fill(0)
//         };
//     }
//     update(timestamp) {
//         const time = timestamp / 1000;
//         const pulse = (Math.sin(time * 3) + 1) / 2;
//         this.audio.level = -60 + (pulse * 60);
//         this.audio.density = (Math.cos(time * 2) + 1) / 2;
//         for (let i = 0; i < 200; i++) {
//             const spectrumPulse = (Math.sin(time * 3 + i * 0.2) + 1) / 2;
//             this.audio.freq[i] = Math.floor(spectrumPulse * pulse * 127);
//         }
//     }
// }
//const engine = new MockAudioEngine();


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

/**
 * Represents a drawable, interactive shape on the canvas.
 * Manages its own state, including position, size, appearance, and animation properties.
 */
class Shape {
    constructor({
        id, name, shape, x, y, width, height, rotation, gradient, gradType,
        gradientDirection, scrollDirection, cycleColors, cycleSpeed, animationSpeed, ctx,
        innerDiameter, angularWidth, numberOfSegments, rotationSpeed, useSharpGradient, gradientStop, locked,
        numberOfRows, numberOfColumns, phaseOffset, animationMode,
        text, fontFamily, fontSize, fontWeight, textAlign, pixelFont, textAnimation, textAnimationSpeed, showTime, showDate, bouncePauseTime, fps,
        oscAmplitude, oscFrequency, oscRadial, oscWaveType, oscDrawAsLine, oscLineThickness,
        oscAnimationType, oscAmplitude2, oscFrequency2,
        animationDriver, oscAmplitudeDriver,
        visStyle, visColorMode, visSmoothing, visGain, visBarCount, visNormalize
    }) {
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
        this.fps = fps || 50;
        this.bouncePauseTime = bouncePauseTime !== undefined ? bouncePauseTime : 0.6;
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
        this.handleSize = 8;
        this.rotationHandleOffset = -30;
        this.rotationHandleRadius = 6;
        this.handles = [
            { name: 'top-left', cursor: 'nwse-resize' }, { name: 'top', cursor: 'ns-resize' }, { name: 'top-right', cursor: 'nesw-resize' },
            { name: 'left', cursor: 'ew-resize' }, { name: 'right', cursor: 'ew-resize' },
            { name: 'bottom-left', cursor: 'nesw-resize' }, { name: 'bottom', cursor: 'ns-resize' }, { name: 'bottom-right', cursor: 'nwse-resize' }
        ];
        this.randomColorTimer = 0;
        this.cellColors = [];
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
        this.oscAmplitude = oscAmplitude !== undefined ? oscAmplitude : 20;
        this.oscFrequency = oscFrequency !== undefined ? oscFrequency : 10;
        this.oscRadial = oscRadial || false;
        this.oscPhase = 0;
        this.oscWaveType = oscWaveType || 'sine';
        this.oscDrawAsLine = oscDrawAsLine || false;
        this.oscLineThickness = oscLineThickness !== undefined ? oscLineThickness : 4;
        this.oscAnimationType = oscAnimationType || 'scroll';
        this.oscAmplitude2 = oscAmplitude2 !== undefined ? oscAmplitude2 : 10;
        this.oscFrequency2 = oscFrequency2 !== undefined ? oscFrequency2 : 25;
        this.oscPhase2 = 0;
        // Audio Properties
        this.animationDriver = animationDriver || 'time';
        this.oscAmplitudeDriver = oscAmplitudeDriver || 'manual';
        this.visStyle = visStyle || 'bars';
        this.visColorMode = visColorMode || 'gradient';
        this.visSmoothing = visSmoothing !== undefined ? visSmoothing : 5;
        this.visGain = visGain !== undefined ? visGain : 1;
        this.visBarCount = visBarCount !== undefined ? visBarCount : 50;
        this.visNormalize = visNormalize !== undefined ? visNormalize : true;
        this.smoothedFreq = new Array(this.visBarCount).fill(0);
        this.runningMax = 255;
        this.freqHistory = [];
        this.smoothedLevel = 0; // For oscilloscope
        this.levelHistory = []; // For oscilloscope
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
        if (!text || this.width <= 0) {
            return text;
        }
        const fontData = this.pixelFont === 'large' ? FONT_DATA_5PX : FONT_DATA_4PX;
        const pixelSize = this.fontSize / 10;
        const charPixelWidth = (fontData.charWidth + fontData.charSpacing) * pixelSize;
        if (charPixelWidth <= 0) {
            return text;
        }
        const maxCharsPerLine = Math.floor(this.width / charPixelWidth);
        if (maxCharsPerLine <= 0) {
            return text;
        }
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        words.forEach(word => {
            while (word.length > maxCharsPerLine) {
                if (currentLine.length > 0) {
                    lines.push(currentLine);
                    currentLine = '';
                }
                lines.push(word.substring(0, maxCharsPerLine));
                word = word.substring(maxCharsPerLine);
            }
            if (currentLine.length + word.length + (currentLine.length > 0 ? 1 : 0) > maxCharsPerLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                if (currentLine.length > 0) {
                    currentLine += ' ';
                }
                currentLine += word;
            }
        });
        if (currentLine.length > 0) {
            lines.push(currentLine);
        }
        return lines.join('\n');
    }

    _updateTextMetrics() {
        if (this.shape !== 'text' || !this.ctx) {
            return;
        }
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

    getLocalPoint(px, py) {
        const center = this.getCenter();
        const angle = -this.getRenderAngle();
        const s = Math.sin(angle);
        const c = Math.cos(angle);
        let tempX = px - center.x;
        let tempY = py - center.y;
        const rotatedX = tempX * c - tempY * s;
        const rotatedY = tempX * s + tempY * c;
        return { x: rotatedX + center.x, y: rotatedY + center.y };
    }

    getWorldCoordsOfCorner(handleName) {
        const handlePositions = this.getHandlePositions();
        const h2 = this.handleSize / 2;
        const localCorner = { x: handlePositions[handleName].x + h2, y: handlePositions[handleName].y + h2 };
        const center = this.getCenter();
        const angle = this.getRenderAngle();
        const s = Math.sin(angle);
        const c = Math.cos(angle);
        let tempX = localCorner.x - center.x;
        let tempY = localCorner.y - center.y;
        const rotatedX = tempX * c - tempY * s;
        const rotatedY = tempX * s + tempY * c;
        return { x: rotatedX + center.x, y: rotatedY + center.y };
    }

    // In main.js, REPLACE this entire method in the Shape class

    updateAnimationState(isSelected) {
        if (this.shape === 'oscilloscope') {
            this.oscPhase += this.animationSpeed * 0.1;
            if (this.oscAnimationType === 'interference') {
                this.oscPhase2 += this.animationSpeed * 0.07;
            }

            // Add smoothing logic for the oscilloscope's audio level
            if (typeof engine !== 'undefined' && engine.audio.level) {
                const targetLevel = (engine.audio.level + 100) / 100.0; // Normalize level to 0-1
                this.levelHistory.unshift(targetLevel);
                const trailLength = Math.max(10, Math.round(this.visSmoothing));
                while (this.levelHistory.length > trailLength) {
                    this.levelHistory.pop();
                }
                const sum = this.levelHistory.reduce((a, b) => a + b, 0);
                this.smoothedLevel = sum / this.levelHistory.length;
            }
        }

        if (this.shape === 'visualizer' && engine.audio.freq) {
            let currentFrameMax = 0;
            for (let i = 0; i < engine.audio.freq.length; i++) {
                if (engine.audio.freq[i] > currentFrameMax) {
                    currentFrameMax = engine.audio.freq[i];
                }
            }
            this.runningMax = Math.max(this.runningMax, currentFrameMax);
            const normalizationFactor = this.visNormalize ? (255 / Math.max(80, this.runningMax)) : 1;

            const barCount = this.visBarCount;
            const sampleStep = Math.floor(engine.audio.freq.length / barCount);

            for (let i = 0; i < barCount; i++) {
                const rawValue = engine.audio.freq[i * sampleStep] || 0;
                const targetValue = (rawValue > 0 ? rawValue : 0) * normalizationFactor;

                if (!this.freqHistory[i]) {
                    this.freqHistory[i] = [];
                }
                this.freqHistory[i].unshift(targetValue);

                const trailLength = Math.max(10, Math.round(this.visSmoothing));
                while (this.freqHistory[i].length > trailLength) {
                    this.freqHistory[i].pop();
                }

                const sum = this.freqHistory[i].reduce((a, b) => a + b, 0);
                this.smoothedFreq[i] = sum / this.freqHistory[i].length;
            }

            this.runningMax *= 0.995;
        }

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
            let increment = 0;
            let audioValue = 0;
            if (typeof engine !== 'undefined') {
                audioValue = (engine.audio.level + 100) / 100;
            }
            switch (this.animationDriver) {
                case 'level':
                    increment = audioValue;
                    break;
                case 'time':
                default:
                    increment = this.animationSpeed * 0.01;
                    break;
            }
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
                            this.waitTimer = this.bouncePauseTime * this.fps;
                        }
                    } else {
                        this.scrollOffset += increment;
                        const forwardBoundary = 1.0;
                        if (this.scrollOffset >= forwardBoundary) {
                            this.scrollOffset = forwardBoundary;
                            this.animationState = 'waiting';
                            this.waitTimer = this.bouncePauseTime * this.fps;
                        }
                    }
                }
            } else {
                if (this.animationDriver === 'time') {
                    const directionMultiplier = (this.scrollDirection === 'right' || this.scrollDirection === 'down') ? 1 : -1;
                    this.scrollOffset += increment * directionMultiplier;
                    this.scrollOffset = (this.scrollOffset % 1.0 + 1.0) % 1.0;
                } else {
                    this.scrollOffset = increment * (this.animationSpeed * 10);
                }
            }
        }
        if (!isSelected) {
            const rotationIncrement = (this.rotationSpeed || 0) / 1000;
            this.rotationAngle += rotationIncrement;
            this.animationAngle += rotationIncrement;
        }
    }

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
        const p = this.animationMode === 'loop' ? (effectiveScrollOffset % 1.0 + 1.0) % 1.0 : effectiveScrollOffset;
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

    draw(enableAnimation, isSelected) {
        if (enableAnimation) {
            this.updateAnimationState(isSelected);
        }
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const angleToUse = this.getRenderAngle();
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(angleToUse);
        this.ctx.translate(-centerX, -centerY);

        if (this.shape === 'visualizer') {
            const minGain = 1.0;
            const maxGain = 50.0;
            const normalizedSlider = (this.visGain - 1) / 9.0;
            const exponentialGain = minGain * Math.pow(maxGain / minGain, normalizedSlider);

            const barCount = this.visBarCount;
            const barWidth = this.width / barCount;
            for (let i = 0; i < barCount; i++) {
                const amplifiedValue = (this.smoothedFreq[i] || 0) * exponentialGain;
                const clampedValue = Math.min(amplifiedValue, 255);
                const barHeight = (clampedValue / 255) * this.height;
                const x = this.x + i * barWidth;
                let y, height;
                if (this.visStyle === 'centeredBars') {
                    y = this.y + (this.height - barHeight) / 2;
                    height = barHeight;
                } else {
                    y = this.y + this.height - barHeight;
                    height = barHeight;
                }
                if (this.visColorMode === 'gradient') {
                    this.ctx.fillStyle = this.createFillStyle();
                } else if (this.visColorMode === 'perBarGradient') {
                    const t = i / (barCount - 1);
                    this.ctx.fillStyle = getPatternColor(t, this.gradient.color1, this.gradient.color2);
                } else {
                    this.ctx.fillStyle = this.gradient.color1;
                }
                this.ctx.fillRect(x, y, barWidth, height);
            }
            this.ctx.restore();
            return;
        }

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
        } else if (this.shape === 'text') {
            this.ctx.fillStyle = this.createFillStyle();
            drawPixelText(this.ctx, this);
        } else {
            this.ctx.beginPath();
            switch (this.shape) {
                case 'rectangle':
                    this.ctx.rect(this.x, this.y, this.width, this.height);
                    break;
                case 'circle':
                    this.ctx.arc(centerX, centerY, this.width / 2, 0, 2 * Math.PI);
                    break;
                case 'oscilloscope':
                    this.ctx.beginPath();
                    let animAmplitude = this.oscAmplitude;
                    let animFrequency = this.oscFrequency;
                    let animPhase = this.oscPhase;

                    if (this.oscAmplitudeDriver === 'level') {
                        const audioValue = this.smoothedLevel;
                        const minGain = 1.0;
                        const maxGain = 50.0;
                        const normalizedSlider = (this.visGain - 1) / 9.0;
                        const exponentialGain = minGain * Math.pow(maxGain / minGain, normalizedSlider);
                        const finalAudioMultiplier = Math.min(audioValue * exponentialGain, 1.5);
                        animAmplitude *= finalAudioMultiplier;
                    }

                    switch (this.oscAnimationType) {
                        case 'pulseAmplitude':
                            animAmplitude *= (Math.sin(this.oscPhase) + 1) / 2;
                            break;
                        case 'pulseFrequency':
                            animFrequency *= ((Math.sin(this.oscPhase) + 1) / 2) + 0.5;
                            break;
                    }

                    const calculateSingleWave = (type, input) => {
                        switch (type) {
                            case 'square': return Math.sin(input) >= 0 ? 1 : -1;
                            case 'triangle': return Math.asin(Math.sin(input)) * (2 / Math.PI);
                            case 'sawtooth': return (input / Math.PI) % 2 - 1;
                            case 'sine': default: return Math.sin(input);
                        }
                    };

                    const calculateWaveValue = (input, freq, phase, amp) => {
                        if (this.oscAnimationType === 'interference') {
                            const wave1 = calculateSingleWave(this.oscWaveType, input * this.oscFrequency + this.oscPhase) * this.oscAmplitude;
                            const wave2 = calculateSingleWave(this.oscWaveType, input * this.oscFrequency2 + this.oscPhase2) * this.oscAmplitude2;
                            return (wave1 + wave2) / 2;
                        }
                        const waveInput = input * freq + phase;
                        return calculateSingleWave(this.oscWaveType, waveInput) * amp;
                    };

                    if (this.oscRadial) {
                        const baseRadius = Math.min(this.width, this.height) / 2;
                        const points = 360;
                        for (let i = 0; i <= points; i++) {
                            const angle = (i / points) * Math.PI * 2;
                            const radius = baseRadius + calculateWaveValue(angle, animFrequency, animPhase, animAmplitude);
                            const px = centerX + Math.cos(angle) * radius;
                            const py = centerY + Math.sin(angle) * radius;
                            if (i === 0) {
                                this.ctx.moveTo(px, py);
                            } else {
                                this.ctx.lineTo(px, py);
                            }
                        }
                    } else {
                        const wavePoints = Math.floor(this.width);
                        const firstPy = centerY + calculateWaveValue(0, animFrequency, animPhase, animAmplitude);
                        this.ctx.moveTo(this.x, firstPy);
                        for (let i = 1; i <= wavePoints; i++) {
                            const waveInput = (i / wavePoints);
                            const py = centerY + calculateWaveValue(waveInput, animFrequency, animPhase, animAmplitude);
                            const px = this.x + i;
                            this.ctx.lineTo(px, py);
                        }
                        if (!this.oscDrawAsLine) {
                            this.ctx.lineTo(this.x + this.width, this.y + this.height);
                            this.ctx.lineTo(this.x, this.y + this.height);
                        }
                    }
                    if (!this.oscDrawAsLine) {
                        this.ctx.closePath();
                    }
                    break;
            }

            if (this.shape === 'oscilloscope' && this.oscDrawAsLine) {
                this.ctx.strokeStyle = this.createFillStyle();
                this.ctx.lineWidth = this.oscLineThickness;
                this.ctx.stroke();
            } else {
                this.ctx.fillStyle = this.createFillStyle();
                this.ctx.fill();
            }
        }
        this.ctx.restore();
    }

    isPointInside(px, py) {
        const localPoint = this.getLocalPoint(px, py);
        return (localPoint.x >= this.x && localPoint.x <= this.x + this.width && localPoint.y >= this.y && localPoint.y <= this.y + this.height);
    }

    getHandleAtPoint(px, py) {
        if (this.locked) return null;
        const corners = [this.getWorldCoordsOfCorner('top-left'), this.getWorldCoordsOfCorner('top-right'), this.getWorldCoordsOfCorner('bottom-right'), this.getWorldCoordsOfCorner('bottom-left')];
        const minX = Math.min(...corners.map(c => c.x));
        const minY = Math.min(...corners.map(c => c.y));
        const maxX = Math.max(...corners.map(c => c.x));
        const maxY = Math.max(...corners.map(c => c.y));
        const h2 = this.handleSize / 2;
        const handlePositions = [
            { name: 'top-left', x: minX - h2, y: minY - h2, cursor: 'nwse-resize' }, { name: 'top', x: minX + (maxX - minX) / 2 - h2, y: minY - h2, cursor: 'ns-resize' },
            { name: 'top-right', x: maxX - h2, y: minY - h2, cursor: 'nesw-resize' }, { name: 'left', x: minX - h2, y: minY + (maxY - minY) / 2 - h2, cursor: 'ew-resize' },
            { name: 'right', x: maxX - h2, y: minY + (maxY - minY) / 2 - h2, cursor: 'ew-resize' }, { name: 'bottom-left', x: minX - h2, y: maxY - h2, cursor: 'nesw-resize' },
            { name: 'bottom', x: minX + (maxX - minX) / 2 - h2, y: maxY - h2, cursor: 'ns-resize' }, { name: 'bottom-right', x: maxX - h2, y: maxY - h2, cursor: 'nwse-resize' }
        ];
        for (const handle of handlePositions) {
            if (px >= handle.x && px <= handle.x + this.handleSize && py >= handle.y && py <= handle.y + this.handleSize) {
                return handle;
            }
        }
        return null;
    }

    getRotationHandleAtPoint(px, py) {
        if (this.locked) return null;
        const corners = [this.getWorldCoordsOfCorner('top-left'), this.getWorldCoordsOfCorner('top-right'), this.getWorldCoordsOfCorner('bottom-right'), this.getWorldCoordsOfCorner('bottom-left')];
        const minX = Math.min(...corners.map(c => c.x));
        const minY = Math.min(...corners.map(c => c.y));
        const maxX = Math.max(...corners.map(c => c.x));
        const maxY = Math.max(...corners.map(c => c.y));
        const handleX = minX + (maxX - minX) / 2;
        let handleY;
        const topMargin = 40;
        if (minY < topMargin) {
            handleY = maxY - this.rotationHandleOffset;
        } else {
            handleY = minY + this.rotationHandleOffset;
        }
        const dist = Math.sqrt(Math.pow(px - handleX, 2) + Math.pow(py - handleY, 2));
        if (dist <= this.rotationHandleRadius + this.handleSize / 2) {
            return { type: 'rotation' };
        }
        return null;
    }

    drawSelectionUI() {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const corners = [this.getWorldCoordsOfCorner('top-left'), this.getWorldCoordsOfCorner('top-right'), this.getWorldCoordsOfCorner('bottom-right'), this.getWorldCoordsOfCorner('bottom-left')];
        const minX = Math.min(...corners.map(c => c.x));
        const minY = Math.min(...corners.map(c => c.y));
        const maxX = Math.max(...corners.map(c => c.x));
        const maxY = Math.max(...corners.map(c => c.y));
        const bbWidth = maxX - minX;
        const bbHeight = maxY - minY;
        this.ctx.save();
        this.ctx.strokeStyle = this.locked ? 'orange' : '#00f6ff';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.strokeRect(minX, minY, bbWidth, bbHeight);
        this.ctx.setLineDash([]);
        if (!this.locked) {
            this.ctx.fillStyle = '#00f6ff';
            const h2 = this.handleSize / 2;
            const handlePositions = [
                { x: minX - h2, y: minY - h2 }, { x: minX + bbWidth / 2 - h2, y: minY - h2 }, { x: maxX - h2, y: minY - h2 },
                { x: minX - h2, y: minY + bbHeight / 2 - h2 }, { x: maxX - h2, y: minY + bbHeight / 2 - h2 },
                { x: minX - h2, y: maxY - h2 }, { x: minX + bbWidth / 2 - h2, y: maxY - h2 }, { x: maxX - h2, y: maxY - h2 }
            ];
            if (this.rotationSpeed === 0) {
                handlePositions.forEach(pos => this.ctx.fillRect(pos.x, pos.y, this.handleSize, this.handleSize));
            }
            const handleX = minX + bbWidth / 2;
            let handleY, stemStartY;
            const topMargin = 40;
            if (minY < topMargin) {
                handleY = maxY - this.rotationHandleOffset;
                stemStartY = maxY;
            } else {
                handleY = minY + this.rotationHandleOffset;
                stemStartY = minY;
            }
            this.ctx.beginPath();
            this.ctx.moveTo(minX + bbWidth / 2, stemStartY);
            this.ctx.lineTo(handleX, handleY);
            this.ctx.strokeStyle = '#00f6ff';
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.arc(handleX, handleY, this.rotationHandleRadius, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.restore();
        if (this.locked) {
            this.ctx.save();
            this.ctx.fillStyle = 'white';
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('🔒', centerX, centerY);
            this.ctx.restore();
        }
    }

    update(props) {
        if (props.visBarCount !== undefined && props.visBarCount !== this.visBarCount) {
            this.visBarCount = props.visBarCount;
            this.smoothedFreq = new Array(this.visBarCount).fill(0);
            this.freqHistory = []; // Reset history when bar count changes
        }

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
        const isTextTarget = this.shape === 'text';
        for (const key in props) {
            if (isTextTarget && key === 'height') {
                continue;
            }
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
        if (this.shape === 'text') {
            this._updateTextMetrics();
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // --- DOM Element References ---

    const ADMIN_UIDS = ['zMj8mtfMjXeFMt072027JT7Jc7i1'];
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
    const toolbar = document.getElementById('toolbar');
    const constrainBtn = document.getElementById('constrain-btn');
    const exportBtn = document.getElementById('export-btn');
    const shareBtn = document.getElementById('share-btn');
    const addObjectBtn = document.getElementById('add-object-btn');
    const confirmImportBtn = document.getElementById('confirm-import-btn');
    const confirmBtn = document.getElementById('confirm-overwrite-btn');
    const galleryOffcanvasEl = document.getElementById('gallery-offcanvas');
    const galleryList = document.getElementById('gallery-project-list');
    const galleryBody = galleryOffcanvasEl.querySelector('.offcanvas-body');

    // --- State Management ---
    let isRestoring = false; // Prevents history recording during an undo/redo action
    let configStore = [];
    let objects = [];
    let selectedObjectIds = [];
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
    let propertyClipboard = null;
    let sourceObjectIdForCopy = null;
    let needsRedraw = false;




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

    function drawSnapLines(snapLines) {
        // console.log('Entering drawSnapLines with snapLines:', snapLines);
        ctx.save();
        ctx.resetTransform();
        ctx.strokeStyle = 'blue'; // Solid blue, full opacity
        ctx.lineWidth = 2; // Slightly thicker for visibility
        ctx.setLineDash([]); // Solid line (no dashing)
        snapLines.forEach(line => {
            // console.log('Drawing line:', line);
            ctx.beginPath();
            if (line.type === 'horizontal') {
                ctx.moveTo(0, line.y);
                ctx.lineTo(canvas.width, line.y);
            } else if (line.type === 'vertical') {
                ctx.moveTo(line.x, 0);
                ctx.lineTo(line.x, canvas.height);
            }
            ctx.stroke();
        });
        // console.log('Canvas context after drawing:', {
        //     strokeStyle: ctx.strokeStyle,
        //     lineWidth: ctx.lineWidth,
        //     globalAlpha: ctx.globalAlpha,
        //     lineDash: ctx.getLineDash()
        // });
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
        const isAdmin = currentUser && ADMIN_UIDS.includes(currentUser.uid);
        galleryList.innerHTML = '';

        if (projects.length === 0) {
            galleryList.innerHTML = '<li class="list-group-item disabled">No effects found.</li>';
            return;
        }

        projects.forEach(project => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';

            if (project.isFeatured) {
                li.classList.add('bg-warning-subtle');
            }

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

            if (project.isFeatured) {
                const starIcon = document.createElement('span');
                starIcon.className = 'ms-2 text-warning';
                starIcon.innerHTML = '★';
                starIcon.title = 'Featured Effect';
                nameEl.appendChild(starIcon);
            }

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

            if ((currentUser && currentUser.uid === project.userId) || isAdmin) {
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'btn btn-sm btn-outline-danger';
                deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
                deleteBtn.title = "Delete Effect";
                deleteBtn.onclick = (e) => {
                    e.stopPropagation();
                    showConfirmModal('Delete Project', `Are you sure you want to delete "${project.name}"? This cannot be undone.`, 'Delete', async () => {
                        await window.deleteDoc(window.doc(window.db, "projects", project.docId));
                        showToast(`Project "${project.name}" deleted.`, 'info');
                        document.getElementById('browse-btn').click(); // Refresh the gallery
                    });
                };
                controlsDiv.appendChild(deleteBtn);
            }

            if (isAdmin && currentUser.uid !== project.userId) {
                const banBtn = document.createElement('button');
                banBtn.className = 'btn btn-sm btn-danger btn-ban-user';
                banBtn.innerHTML = '<i class="bi bi-person-x-fill"></i>';
                banBtn.title = `Ban User: ${project.creatorName}`;
                banBtn.dataset.userId = project.userId;
                banBtn.dataset.userName = project.creatorName || 'Anonymous';
                controlsDiv.appendChild(banBtn);
            }

            if (isAdmin && !project.isFeatured) {
                const featureBtn = document.createElement('button');
                featureBtn.className = 'btn btn-sm btn-outline-warning';
                featureBtn.innerHTML = '<i class="bi bi-star-fill"></i>';
                featureBtn.title = "Set as Featured Effect";
                featureBtn.onclick = () => {
                    showConfirmModal('Feature Effect', `Set "${project.name}" as the new featured effect? This will replace any other featured effect.`, 'Set as Featured', async () => {
                        // --- FIX START: Replaced batch write with separate update calls ---
                        const q = window.query(window.collection(window.db, "projects"), window.where("isFeatured", "==", true));
                        const querySnapshot = await window.getDocs(q);

                        // First, un-feature any existing featured doc
                        if (!querySnapshot.empty) {
                            const oldFeaturedDocRef = querySnapshot.docs[0].ref;
                            await window.updateDoc(oldFeaturedDocRef, { "isFeatured": false });
                        }

                        // Then, feature the new doc
                        const newFeaturedRef = window.doc(window.db, "projects", project.docId);
                        await window.updateDoc(newFeaturedRef, { "isFeatured": true });
                        // --- FIX END ---

                        showToast(`"${project.name}" is now the featured effect.`, 'success');
                        document.getElementById('browse-btn').click(); // Refresh gallery to show changes
                    });
                };
                controlsDiv.appendChild(featureBtn);
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
        // Manually override the max value for oscLineThickness to ensure it's always 100,
        // even when loading old effects that have a lower max value saved in their config.
        if (config.property && config.property.includes('_oscLineThickness')) {
            config.max = '100';
        }

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
            input.step = config.step || '1';
            const slider = document.createElement('input');
            slider.type = 'range';
            slider.className = 'form-range flex-grow-1 ms-2';
            slider.id = `${controlId}_slider`;
            slider.name = `${controlId}_slider`;
            if (min) slider.min = min;
            if (max) slider.max = max;
            slider.step = config.step || '1';
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
        } else if (type === 'textarea' || type === 'textfield') {
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

    // In main.js, REPLACE this entire function
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

        objects.forEach((liveObject, index) => {
            const exportId = index + 1;
            const originalId = liveObject.id;
            const originalConfigs = configStore.filter(c => c.property && c.property.startsWith(`obj${originalId}_`));

            originalConfigs.forEach(conf => {
                const tempConf = { ...conf };
                const propName = tempConf.property.substring(tempConf.property.indexOf('_') + 1);

                tempConf.property = `obj${exportId}_${propName}`;
                tempConf.label = `${liveObject.name}:${conf.label.split(':').slice(1).join(':')}`;

                let value = liveObject[propName];

                if (propName.startsWith('gradColor')) {
                    const colorKey = propName.replace('gradColor', 'color');
                    if (liveObject.gradient) value = liveObject.gradient[colorKey];
                } else if (propName === 'scrollDir') {
                    value = liveObject.scrollDirection;
                }
                if (value === undefined) { value = conf.default; }
                if (typeof value === 'boolean') { value = String(value); }

                const propsToScale = ['x', 'y', 'width', 'height', 'innerDiameter', 'fontSize'];
                const floatProps = ['visSmoothing', 'bouncePauseTime']; // List of props to keep as decimals

                if (conf.type === 'number') {
                    if (propName === 'animationSpeed') value = Math.round(liveObject.animationSpeed * 10);
                    else if (propName === 'cycleSpeed') value = Math.round(liveObject.cycleSpeed * 50);
                    else if (propsToScale.includes(propName)) value = Math.round(parseFloat(value) / 4);
                    // This check prevents rounding for our specified float properties
                    else if (!floatProps.includes(propName)) value = Math.round(parseFloat(value));
                }
                if (conf.type === 'textfield' && typeof value === 'string') { value = value.replace(/\n/g, '\\n'); }

                const attrs = Object.keys(tempConf).filter(attr => attr !== 'default').map(attrName => `${attrName}="${tempConf[attrName]}"`).join(' ');
                scriptHTML += `<meta ${attrs} default="${value}" />\n`;
            });
        });

        outputScriptArea.value = scriptHTML.trim();
    }


    /**
     * Shows or hides the 'Paste Properties' buttons based on the clipboard state.
     */
    function updateCopyPasteUI() {
        const allPasteButtons = form.querySelectorAll('.btn-paste-props');
        if (propertyClipboard) {
            allPasteButtons.forEach(btn => {
                const buttonId = parseInt(btn.dataset.id, 10);
                // Show the paste button only if it's not the source object
                if (buttonId !== propertyClipboard.sourceId) {
                    btn.classList.remove('d-none');
                } else {
                    btn.classList.add('d-none');
                }
            });
        } else {
            // If clipboard is empty, hide all paste buttons
            allPasteButtons.forEach(btn => btn.classList.add('d-none'));
        }
    }

    /**
     * Renders the entire controls form based on the current `configStore` and `objects` state.
     * Preserves the collapsed state of panels during re-rendering.
     */
    // In main.js, replace the entire renderForm function.

    // In main.js, REPLACE this entire function
    // In main.js, REPLACE this entire function
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

            const copyButton = document.createElement('button');
            copyButton.className = 'btn btn-sm btn-outline-secondary btn-copy-props d-flex align-items-center justify-content-center p-0 ms-2';
            copyButton.style.width = '28px';
            copyButton.style.height = '28px';
            copyButton.type = 'button';
            copyButton.dataset.id = id;
            copyButton.dataset.bsToggle = 'tooltip';
            copyButton.title = 'Copy Properties';
            copyButton.innerHTML = `<i class="bi bi-clipboard-plus"></i>`;
            controlsGroup.appendChild(copyButton);

            const pasteButton = document.createElement('button');
            pasteButton.className = 'btn btn-sm btn-outline-success btn-paste-props d-none d-flex align-items-center justify-content-center p-0 ms-2';
            pasteButton.style.width = '28px';
            pasteButton.style.height = '28px';
            pasteButton.type = 'button';
            pasteButton.dataset.id = id;
            pasteButton.dataset.bsToggle = 'tooltip';
            pasteButton.title = 'Paste Properties';
            pasteButton.innerHTML = `<i class="bi bi-clipboard-check-fill"></i>`;
            controlsGroup.appendChild(pasteButton);

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

            let groups = {
                'Shape Settings': ['shape', 'x', 'y', 'width', 'height', 'rotation', 'rotationSpeed'],
                'Color Settings': ['gradType', 'useSharpGradient', 'gradientStop', 'gradColor1', 'gradColor2', 'animationDriver', 'animationSpeed', 'animationMode', 'bouncePauseTime', 'scrollDir', 'cycleColors', 'cycleSpeed'],
                'Audio Settings': ['visGain', 'visSmoothing', 'visSensitivity', 'visNormalize'],
            };
            const groupOrder = [];

            const shape = fieldset.querySelector(`[name="obj${id}_shape"]`);

            const shapeConf = objectConfigs.find(c => c.property.endsWith('_shape'));
            const currentShape = obj.shape || (shapeConf ? shapeConf.default : 'rectangle');
            const antype = obj.oscAnimationType;

            if (currentShape == 'oscilloscope') {
                groups['Oscilloscope Settings'] = ['oscAnimationType', 'oscWaveType', 'oscAmplitudeDriver', 'oscDrawAsLine', 'oscLineThickness', 'oscAnimationType', 'oscAmplitude', 'oscFrequency', 'oscAmplitude2', 'oscFrequency2'];
                const drawAsLineCheckbox = fieldset.querySelector(`[name="obj${id}_oscDrawAsLine"]`);
            }
            if (currentShape == 'visualizer') {
                groups['Visualizer Settings'] = ['visStyle', 'visColorMode', 'visBarCount'];
            }
            if (currentShape == 'ring') {
                groups['Ring Settings'] = ['innerDiameter', 'numberOfSegments', 'angularWidth'];
            }
            if (currentShape == 'text') {
                groups['Text Settings'] = ['text', 'pixelFont', 'fontSize', 'textAlign', 'showTime', 'showDate', 'textAnimation', 'textAnimationSpeed', 'showTime', 'showDate', 'textAnimation', 'textAnimationSpeed'];
            }
            if (currentShape == 'rectangle') {
                groups['Grid Settings'] = ['numberOfRows', 'numberOfColumns', 'phaseOffset'];
            }

            for (const groupName in groups) {
                const groupContainer = document.createElement('div');
                const groupClass = groupName === 'Fill Style' ? 'fill-style-group' : '';
                groupContainer.className = `control-group card card-body bg-body mb-3 ${groupClass}`;
                const groupHeader = document.createElement('h6');
                groupHeader.className = 'fs-5 text-body-secondary border-bottom pb-1 mb-3';
                groupHeader.textContent = groupName;
                groupContainer.appendChild(groupHeader);
                const propsInGroup = groups[groupName];
                objectConfigs
                    .filter(conf => propsInGroup.includes(conf.property.substring(conf.property.indexOf('_') + 1)))
                    .forEach(conf => groupContainer.appendChild(createFormControl(conf)));
                if (groupContainer.children.length > 1) {
                    collapseWrapper.appendChild(groupContainer);
                }
            }

            const textGroup = document.createElement('div');
            textGroup.className = 'text-settings-group';
            textGroup.style.display = currentShape === 'text' ? 'block' : 'none';
            collapseWrapper.appendChild(textGroup);

            const animationModeSelect = fieldset.querySelector(`[name="obj${id}_animationMode"]`);
            const pauseTimeControl = fieldset.querySelector(`[name="obj${id}_bouncePauseTime"]`);
            if (animationModeSelect && pauseTimeControl) {
                const isBounce = animationModeSelect.value.includes('bounce');
                pauseTimeControl.closest('.mb-3').style.display = isBounce ? 'block' : 'none';
            }

            fieldset.appendChild(headerBar);
            fieldset.appendChild(collapseWrapper);
            form.appendChild(fieldset);

            // Hide controls that are not needed at the moment
            setTimeout(() => {
                const ampTypeInput = fieldset.querySelector(`[name="obj${id}_oscAnimationType"]`);
                const amp2Control = fieldset.querySelector(`[name="obj${id}_oscAmplitude2"]`);
                const freq2Control = fieldset.querySelector(`[name="obj${id}_oscFrequency2"]`);

                const antype = ampTypeInput?.value;

                if (antype !== "interference") {
                    if (amp2Control && amp2Control.closest('.mb-3')) {
                        amp2Control.closest('.mb-3').style.display = 'none';
                    }
                    if (freq2Control && freq2Control.closest('.mb-3')) {
                        freq2Control.closest('.mb-3').style.display = 'none';
                    }
                }
            }, 0);


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

                // Reorder the main `objects` array to match the new visual order.
                objects.sort((a, b) => newOrderedIds.indexOf(a.id) - newOrderedIds.indexOf(b.id));

                // --- DEBUGGING LOG ---
                // console.log("--- Reorder Action Complete ---");
                // console.log("New visual order of object IDs:", newOrderedIds);
                // console.log("Internal 'objects' array is now sorted:", objects.map(o => `{id: ${o.id}, name: '${o.name}'}`));
                // --- END DEBUGGING LOG ---

                // Now, simply redraw the canvas and regenerate the output script.
                drawFrame();
                generateOutputScript();
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

    const handleNameBlur = (e) => {
        if (e.target.classList.contains('object-name')) {
            const id = parseInt(e.target.dataset.id, 10);
            const newName = e.target.textContent || 'Unnamed';
            const obj = objects.find(o => o.id === id);
            if (obj) {
                obj.name = newName;
                configStore.forEach(conf => {
                    if (conf.property && conf.property.startsWith(`obj${id}_`)) {
                        const labelParts = conf.label.split(':');
                        conf.label = `${newName}:${labelParts.slice(1).join(':').trim()}`;
                    }
                });
                generateOutputScript();
                recordHistory(); // Add this to make renaming undoable
            }
        }
    };

    form.addEventListener('blur', handleNameBlur, true);

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

        // Get the current animation setting from the form once per frame.
        const animationEnabled = getControlValues().enableAnimation;

        // Draw all objects, passing the live animation setting.
        objects.forEach(obj => {
            if (obj instanceof Shape) {
                obj.draw(animationEnabled, selectedObjectIds.includes(obj.id));
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

    /**
     * The main animation loop, called via requestAnimationFrame, and throttled to a specific FPS.
     */
    function animate(timestamp) {
        requestAnimationFrame(animate);

        const now = timestamp;
        const elapsed = now - then;

        if (elapsed > fpsInterval) {
            then = now - (elapsed % fpsInterval);

            engine.update(timestamp);

            const enableAnimationCheckbox = document.getElementById('enableAnimation');
            const isAnimationEnabled = enableAnimationCheckbox ? enableAnimationCheckbox.checked : false;

            if (isAnimationEnabled || isDragging || isResizing || isRotating || needsRedraw) {
                drawFrame();
                needsRedraw = false; // Reset the flag after drawing.
            }
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

        // If a scrolling animation is active, force the justification to 'left'
        // to ensure the scroll calculation works correctly.
        if (values.textAnimation === 'marquee' || values.textAnimation === 'wave') {
            values.textAlign = 'left';
        }

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
                    let displayValue = value;

                    // If the input is a number field, round the value to the nearest integer.
                    if (input.type === 'number') {
                        displayValue = Math.round(value);
                    }

                    if (input.type === 'checkbox') {
                        input.checked = displayValue;
                    } else {
                        input.value = displayValue;
                    }

                    const slider = fieldset.querySelector(`[name="obj${obj.id}_${prop}_slider"]`);
                    if (slider) slider.value = displayValue;

                    const hexInput = fieldset.querySelector(`[name="obj${obj.id}_${prop}_hex"]`);
                    if (hexInput) hexInput.value = displayValue;
                }
            };

            // This loop now correctly updates all form fields from the object's properties
            Object.keys(obj).forEach(key => {
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
        objects = initialStates.map(state => new Shape({ ...state, ctx, fps }));
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
        currentProjectDocId = workspace.docId || null;
        updateShareButtonState();
        updateAll();
        //drawFrame();
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
            { property: `obj${newId}_shape`, label: `Object ${newId}: Shape`, type: 'combobox', default: 'rectangle', values: 'rectangle,circle,ring,text,oscilloscope,visualizer' },
            { property: `obj${newId}_x`, label: `Object ${newId}: X Position`, type: 'number', default: '10', min: '0', max: '320' },
            { property: `obj${newId}_y`, label: `Object ${newId}: Y Position`, type: 'number', default: '10', min: '0', max: '200' },
            { property: `obj${newId}_width`, label: `Object ${newId}: Width`, type: 'number', default: '50', min: '2', max: '320' },
            { property: `obj${newId}_height`, label: `Object ${newId}: Height`, type: 'number', default: '38', min: '2', max: '200' },
            { property: `obj${newId}_innerDiameter`, label: `Object ${newId}: Inner Diameter`, type: 'number', default: '25', min: '1', max: '318' },
            { property: `obj${newId}_fontSize`, label: `Object ${newId}: Font Size`, type: 'number', default: '15', min: '2', max: '100' },
            { property: `obj${newId}_rotation`, label: `Object ${newId}: Rotation`, type: 'number', default: '0', min: '-360', max: '360' },
            { property: `obj${newId}_numberOfSegments`, label: `Object ${newId}: Segments`, type: 'number', default: '12', min: '1', max: '50' },
            { property: `obj${newId}_angularWidth`, label: `Object ${newId}: Segment Angle`, type: 'number', min: '1', max: '360', default: '20' },
            { property: `obj${newId}_rotationSpeed`, label: `Object ${newId}: Rotation Speed`, type: 'number', default: '0', min: '-100', max: '100' },
            { property: `obj${newId}_animationDriver`, label: `Object ${newId}: Animation Driver`, type: 'combobox', values: 'time,level', default: 'time' },
            { property: `obj${newId}_animationSpeed`, label: `Object ${newId}: Speed/Sensitivity`, type: 'number', default: '2', min: '1', max: '50' },
            { property: `obj${newId}_animationMode`, label: `Object ${newId}: Animation Mode`, type: 'combobox', values: 'loop,bounce,bounce-reversed,bounce-random', default: 'loop' },
            { property: `obj${newId}_bouncePauseTime`, label: `Object ${newId}: Bounce Pause (Seconds)`, type: 'number', default: '0.6', min: '0', max: '10', step: '0.1' },
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
            { property: `obj${newId}_oscAmplitude`, label: `Object ${newId}: Wave Amplitude`, type: 'number', default: '20', min: '0', max: '500' },
            { property: `obj${newId}_oscFrequency`, label: `Object ${newId}: Wave Frequency`, type: 'number', default: '10', min: '1', max: '50' },
            { property: `obj${newId}_oscRadial`, label: `Object ${newId}: Radial Wave`, type: 'boolean', default: 'false' },
            { property: `obj${newId}_oscWaveType`, label: `Object ${newId}: Wave Type`, type: 'combobox', values: 'sine,square,triangle,sawtooth', default: 'sine' },
            { property: `obj${newId}_oscDrawAsLine`, label: `Object ${newId}: Draw as Line`, type: 'boolean', default: 'false' },
            { property: `obj${newId}_oscLineThickness`, label: `Object ${newId}: Line Thickness`, type: 'number', default: '4', min: '1', max: '100' },
            { property: `obj${newId}_oscAnimationType`, label: `Object ${newId}: Wave Animation`, type: 'combobox', values: 'scroll,pulseAmplitude,pulseFrequency,interference', default: 'scroll' },
            { property: `obj${newId}_oscAmplitude2`, label: `Object ${newId}: Wave 2 Amplitude`, type: 'number', default: '10', min: '0', max: '100' },
            { property: `obj${newId}_oscFrequency2`, label: `Object ${newId}: Wave 2 Frequency`, type: 'number', default: '25', min: '1', max: '50' },
            { property: `obj${newId}_oscAmplitudeDriver`, label: `Object ${newId}: Amplitude Driver`, type: 'combobox', values: 'manual,level', default: 'manual' },
            { property: `obj${newId}_visStyle`, label: `Object ${newId}: Style`, type: 'combobox', values: 'bars,centeredBars', default: 'bars' },
            { property: `obj${newId}_visColorMode`, label: `Object ${newId}: Color Mode`, type: 'combobox', values: 'solid,gradient,perBarGradient', default: 'gradient' },
            { property: `obj${newId}_visSmoothing`, label: `Object ${newId}: Smoothing`, type: 'number', default: '5', min: '1', max: '10', step: '1' },
            { property: `obj${newId}_visGain`, label: `Object ${newId}: Sensitivity`, type: 'number', default: '1', min: '1', max: '10', step: '0.1' },
            { property: `obj${newId}_visBarCount`, label: `Object ${newId}: Number of Bars`, type: 'number', default: '50', min: '1', max: '50' },
            { property: `obj${newId}_visNormalize`, label: `Object ${newId}: Normalize Audio`, type: 'boolean', default: 'true' }
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
            generateOutputScript();
            const effectTitle = getControlValues()['title'] || 'MyEffect';
            const metaTags = document.getElementById('output-script').value;
            const thumbnailDataUrl = generateThumbnail(document.getElementById('signalCanvas'));
            const safeFilename = effectTitle.replace(/[\s\/\\?%*:|"<>]/g, '_');
            const styleContent = `canvas { width: 100%; height: 100%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: #000000; } body { background-color: #000000; overflow: hidden; margin: 0; }`;
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
    if (!canvas) { return; }
    const ctx = canvas.getContext('2d');
    canvas.width = 320;
    canvas.height = 200;
    let objects = [];
    let propertyKeys = [];
    
    const engine = window.engine || { audio: { level: -100, freq: new Int8Array(200).fill(0) }};

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
        const metaElements = Array.from(document.querySelectorAll('head > meta[property]'));
        propertyKeys = metaElements.map(meta => meta.getAttribute('property'));
    }

    function createInitialObjects() {
        if (propertyKeys.length === 0) { return; }
        const uniqueIds = [...new Set(propertyKeys.map(p => {
            const match = p.match(/obj(\\\d+)_/);
            return match ? match[1] : null;
        }).filter(id => id !== null))];

        objects = uniqueIds.map(id => {
            const config = { id: parseInt(id), ctx: ctx, fps: fps, gradient: {} };
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
            
            config.animationSpeed = (config.animationSpeed || 0) / 10.0;
            config.cycleSpeed = (config.cycleSpeed || 0) / 50.0;
            if (config.textAnimationSpeed) { config.textAnimationSpeed /= 4.0; }
            
            config.gradientDirection = (config.scrollDirection === 'up' || config.scrollDirection === 'down') ? 'vertical' : 'horizontal';
            if (config.shape === 'ring' || config.shape === 'circle') { config.height = config.width; }
            
            return new Shape(config);
        });
    }

    function drawFrame() {
        if (!ctx) { return; }
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
                    switch(propName) {
                        case 'gradColor1': obj.gradient.color1 = value; break;
                        case 'gradColor2': obj.gradient.color2 = value; break;
                        case 'scrollDir': obj.scrollDirection = value; obj.gradientDirection = (value === 'up' || value === 'down') ? 'vertical' : 'horizontal'; break;
                        case 'animationSpeed': obj.animationSpeed = (value || 0) / 10.0; break;
                        case 'cycleSpeed': obj.cycleSpeed = (value || 0) / 50.0; break;
                        case 'rotationSpeed': obj.rotationSpeed = (value || 0); break;
                        case 'textAnimationSpeed': obj.textAnimationSpeed = (value || 0) / 4.0; break;
                        case 'visBarCount':
                            if (value !== obj.visBarCount) {
                                obj.visBarCount = value;
                                const newArray = new Array(obj.visBarCount).fill(0);
                                for (let j = 0; j < Math.min(obj.smoothedFreq.length, obj.visBarCount); j++) {
                                    newArray[j] = obj.smoothedFreq[j];
                                }
                                obj.smoothedFreq = newArray;
                            }
                            break;
                        default:
                            if (obj.hasOwnProperty(propName)) {
                                obj[propName] = value;
                            }
                            break;
                    }
                } catch (e) {}
            });
             if (obj.shape === 'text' && obj._updateTextMetrics) { obj._updateTextMetrics(); }
        });
        
        // This is the corrected drawing loop
        for (let i = objects.length - 1; i >= 0; i--) {
            const obj = objects[i]; // FIX: Correctly declare 'obj' before using it
            obj.draw(shouldAnimate, false);
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
                '<!DOCTYPE html>', '<html lang="en">', '<head>', '    <meta charset="UTF-8">',
                '    <title>' + effectTitle + '</title>', metaTags, '    <style>', styleContent,
                '    </style>', '</head>', bodyContent, '<script>', exportedScript, '</script>', '</html>'
            ].join('\n');

            exportPayload = {
                safeFilename, finalHtml, thumbnailDataUrl,
                imageExtension: 'png', exportDate: new Date()
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

    // This handles all live user interactions with the form controls.
    form.addEventListener('input', (e) => {
        const target = e.target;

        // Enforce a minimum value of 1 for size-related properties
        if (target.type === 'number') {
            const sizeProperties = ['_width', '_height', '_fontSize', '_innerDiameter'];
            if (sizeProperties.some(prop => target.name.includes(prop)) && parseFloat(target.value) < 1) {
                target.value = 1;
            }
        }

        // Show/hide oscilloscope line thickness and fill controls
        if (target.name && target.name.includes('_oscDrawAsLine')) {
            const objectId = target.name.match(/obj(\d+)_/)[1];
            const fieldset = form.querySelector(`fieldset[data-object-id="${objectId}"]`);
            if (fieldset) {
                const isChecked = target.checked;
                const thicknessControl = fieldset.querySelector(`[name="obj${objectId}_oscLineThickness"]`);
                const fillStyleGroup = fieldset.querySelector('.fill-style-group');

                if (thicknessControl) thicknessControl.closest('.mb-3').style.display = isChecked ? 'block' : 'none';
                if (fillStyleGroup) fillStyleGroup.style.display = isChecked ? 'none' : 'block';
            }
        }

        // Show/hide oscilloscope interference controls
        if (target.name && target.name.includes('_oscAnimationType')) {
            const objectId = target.name.match(/obj(\d+)_/)[1];
            const fieldset = form.querySelector(`fieldset[data-object-id="${objectId}"]`);
            if (fieldset) {
                const isInterference = target.value === 'interference';
                const amp2Control = fieldset.querySelector(`[name="obj${objectId}_oscAmplitude2"]`);
                const freq2Control = fieldset.querySelector(`[name="obj${objectId}_oscFrequency2"]`);

                if (amp2Control) amp2Control.closest('.mb-3').style.display = isInterference ? 'block' : 'none';
                if (freq2Control) freq2Control.closest('.mb-3').style.display = isInterference ? 'block' : 'none';
            }
        }

        // Show/hide the bounce pause time control
        if (target.name && target.name.includes('_animationMode')) {
            const objectId = target.name.match(/obj(\d+)_/)[1];
            const fieldset = form.querySelector(`fieldset[data-object-id="${objectId}"]`);
            if (fieldset) {
                const pauseTimeControl = fieldset.querySelector(`[name="obj${objectId}_bouncePauseTime"]`);
                if (pauseTimeControl) {
                    const isBounce = target.value.includes('bounce');
                    pauseTimeControl.closest('.mb-3').style.display = isBounce ? 'block' : 'none';
                }
            }
        }

        // Sync width/height for circles and rings
        if (target.name && (target.name.includes('_width') || target.name.includes('_height'))) {
            const match = target.name.match(/obj(\d+)_/);
            if (match) {
                const objectId = parseInt(match[1], 10);
                const obj = objects.find(o => o.id === objectId);
                if (obj && (obj.shape === 'circle' || obj.shape === 'ring')) {
                    const isWidth = target.name.includes('_width');
                    const otherProp = isWidth ? 'height' : 'width';
                    const otherInput = form.elements[`obj${objectId}_${otherProp}`];
                    if (otherInput) {
                        otherInput.value = target.value;
                        const otherSlider = form.elements[`obj${objectId}_${otherProp}_slider`];
                        if (otherSlider) { otherSlider.value = target.value; }
                    }
                }
            }
        }

        // Sync number inputs with sliders
        if (target.type === 'number' && document.getElementById(`${target.id}_slider`)) {
            document.getElementById(`${target.id}_slider`).value = target.value;
        } else if (target.type === 'range' && target.id.endsWith('_slider')) {
            document.getElementById(target.id.replace('_slider', '')).value = target.value;
        }

        // Sync color pickers with hex inputs
        if (target.type === 'color' && document.getElementById(`${target.id}_hex`)) {
            document.getElementById(`${target.id}_hex`).value = target.value;
        } else if (target.type === 'text' && target.id.endsWith('_hex')) {
            const colorPicker = document.getElementById(target.id.replace('_hex', ''));
            if (colorPicker && /^#[0-9A-F]{6}$/i.test(target.value)) {
                colorPicker.value = target.value;
            }
        }

        // Show/hide entire groups of settings based on the selected shape
        if (target.name && target.name.includes('_shape')) {
            const objectId = target.name.match(/obj(\d+)_/)[1];
            const shapeValue = target.value;
            const fieldset = form.querySelector(`fieldset[data-object-id="${objectId}"]`);
            if (fieldset) {
                const ringControls = fieldset.querySelector('.ring-settings-group');
                const gridControls = fieldset.querySelector('.grid-settings-group');
                const textControls = fieldset.querySelector('.text-settings-group');
                const oscilloscopeControls = fieldset.querySelector('.oscilloscope-settings-group');
                const visualizerControls = fieldset.querySelector('.visualizer-settings-group');

                if (ringControls) ringControls.style.display = shapeValue === 'ring' ? 'block' : 'none';
                if (gridControls) gridControls.style.display = shapeValue === 'rectangle' ? 'block' : 'none';
                if (textControls) textControls.style.display = shapeValue === 'text' ? 'block' : 'none';
                if (oscilloscopeControls) oscilloscopeControls.style.display = shapeValue === 'oscilloscope' ? 'block' : 'none';
                if (visualizerControls) visualizerControls.style.display = shapeValue === 'visualizer' ? 'block' : 'none';

                const heightControl = fieldset.querySelector(`[name="obj${objectId}_height"]`);
                if (heightControl) {
                    const heightFormGroup = heightControl.closest('.mb-3');
                    if (heightFormGroup) {
                        heightFormGroup.style.display = (shapeValue === 'ring' || shapeValue === 'text') ? 'none' : 'block';
                    }
                }

                const widthControl = fieldset.querySelector(`[name="obj${objectId}_width"]`);
                if (widthControl) {
                    const widthLabel = widthControl.closest('.mb-3').querySelector('label');
                    if (widthLabel) {
                        if (shapeValue === 'ring' || shapeValue === 'circle') {
                            widthLabel.textContent = 'Width/Outer Diameter';
                        } else {
                            widthLabel.textContent = 'Width';
                        }
                    }
                }
            }
        }

        // Disable text input if time or date is checked
        if (target.name && (target.name.includes('_showTime') || target.name.includes('_showDate'))) {
            const objectId = target.name.match(/obj(\d+)_/)[1];
            const fieldset = form.querySelector(`fieldset[data-object-id="${objectId}"]`);
            if (fieldset) {
                const timeToggle = fieldset.querySelector(`[name="obj${objectId}_showTime"]`);
                const dateToggle = fieldset.querySelector(`[name="obj${objectId}_showDate"]`);
                const textControl = fieldset.querySelector(`[name="obj${objectId}_text"]`);
                if (textControl) {
                    textControl.disabled = timeToggle.checked || dateToggle.checked;
                }
            }
        }

        // This was the source of flickering; it's now cleaned up.
        updateAll();
    });

    form.addEventListener('click', (e) => {
        const fieldset = e.target.closest('fieldset[data-object-id]');
        const isInteractive = e.target.closest('button, a, input, [contenteditable="true"]');
        const banBtn = e.target.closest('.btn-ban-user');

        // --- START: Handle Ban User Click ---
        if (banBtn) {
            e.preventDefault();
            const userIdToBan = banBtn.dataset.userId;
            const userNameToBan = banBtn.dataset.userName;
            const currentUser = window.auth.currentUser;

            if (!userIdToBan || !currentUser) return;

            showConfirmModal(
                'Confirm Ban',
                `Are you sure you want to ban "${userNameToBan}"? They will no longer be able to save new effects. This action is permanent.`,
                'Ban User',
                async () => {
                    try {
                        const banDocRef = window.doc(window.db, "bans", userIdToBan);
                        await window.setDoc(banDocRef, {
                            bannedBy: currentUser.uid,
                            bannedAt: new Date(),
                            creatorName: userNameToBan
                        });
                        showToast(`User "${userNameToBan}" has been banned.`, 'success');
                    } catch (error) {
                        showToast(`Failed to ban user: ${error.message}`, 'danger');
                    }
                }
            );
        }
        // --- END: Handle Ban User Click ---

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

        const copyBtn = e.target.closest('.btn-copy-props');
        const pasteBtn = e.target.closest('.btn-paste-props');

        // --- START: Handle Copy Click ---
        // --- START: Handle Copy Click ---
        if (copyBtn) {
            e.preventDefault();
            sourceObjectIdForCopy = parseInt(copyBtn.dataset.id, 10);

            //Ensure all checkboxes are unchecked by default when the modal opens
            const copyForm = document.getElementById('copy-properties-form');
            if (copyForm) {
                copyForm.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
            }

            const copyModal = new bootstrap.Modal(document.getElementById('copy-properties-modal'));
            copyModal.show();
        }
        // --- END: Handle Copy Click ---

        // --- START: Handle Paste Click ---
        if (pasteBtn) {
            e.preventDefault();
            if (!propertyClipboard) return;

            const id = parseInt(pasteBtn.dataset.id, 10);
            const targetObject = objects.find(o => o.id === id);
            if (targetObject) {
                // Use the object's update method to apply the copied properties
                targetObject.update(propertyClipboard.properties);

                // Clear the clipboard and update the UI
                //propertyClipboard = null;
                updateCopyPasteUI();

                // Refresh the form and canvas to show the new properties
                updateFormValuesFromObjects();
                drawFrame();
                recordHistory();
                showToast(`Pasted properties to "${targetObject.name}"`, 'success');
            }
        }
        // --- END: Handle Paste Click ---

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
            newState.locked = false; // <-- This new line ensures the duplicate is always unlocked

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

        const isTextInput = (target.tagName === 'INPUT' && (target.type === 'text' || target.type === 'number')) ||
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
                needsRedraw = true; // Request a redraw
                debouncedRecordHistory(); // Record history after movement
            }
        }

        // Handle Delete and Backspace keys for selected objects
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedObjectIds.length > 0) {
            e.preventDefault(); // Prevents browser back navigation on Backspace
            deleteObjects([...selectedObjectIds]); // Pass a copy of the array
        }

        // Handle Undo, Redo, Copy, and Paste
        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 'z':
                    e.preventDefault();
                    history.undo();
                    break;
                case 'y':
                    e.preventDefault();
                    history.redo();
                    break;
                case 'c': // --- Handle Copy ---
                    if (selectedObjectIds.length > 0) {
                        e.preventDefault();
                        const sourceId = selectedObjectIds[0]; // Copy from the first selected object
                        const sourceObject = objects.find(o => o.id === sourceId);

                        if (sourceObject) {
                            const propsToCopy = JSON.parse(JSON.stringify(sourceObject, (key, value) => {
                                if (key === 'ctx') return undefined;
                                return value;
                            }));

                            // Exclude properties that should never be copied
                            delete propsToCopy.id;
                            delete propsToCopy.name;
                            delete propsToCopy.shape;
                            delete propsToCopy.locked;
                            delete propsToCopy.x;
                            delete propsToCopy.y;
                            delete propsToCopy.rotation;

                            propertyClipboard = {
                                sourceId: sourceId,
                                properties: propsToCopy
                            };
                            showToast(`Copied all properties from "${sourceObject.name}"`, 'info');
                            updateCopyPasteUI();
                        }
                    }
                    break;
                case 'v': // --- Handle Paste ---
                    if (selectedObjectIds.length > 0 && propertyClipboard) {
                        e.preventDefault();

                        selectedObjectIds.forEach(id => {
                            const targetObject = objects.find(o => o.id === id);
                            if (targetObject) {
                                targetObject.update(propertyClipboard.properties);
                            }
                        });

                        showToast(`Pasted properties to ${selectedObjectIds.length} object(s).`, 'success');
                        propertyClipboard = null; // Clear clipboard after paste
                        updateCopyPasteUI();
                        updateFormValuesFromObjects();
                        drawFrame();
                        recordHistory();
                    }
                    break;
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
     * SAVE BUTTON: Handles permissions for overwriting and enforces bans.
     */
    document.getElementById('save-ws-btn').addEventListener('click', async () => {
        const user = window.auth.currentUser;
        if (!user) {
            showToast("You must be logged in to save.", 'danger');
            return;
        }

        const isAdmin = ADMIN_UIDS.includes(user.uid);
        const formValues = getControlValues();
        const name = formValues['title'] || 'Untitled Effect';
        const trimmedName = name.trim();

        if (!trimmedName) {
            showToast("Project name cannot be empty.", 'danger');
            return;
        }

        // Query for any project with the same name, regardless of creator
        const q = window.query(window.collection(window.db, "projects"), window.where("name", "==", trimmedName));
        const querySnapshot = await window.getDocs(q);

        const buildProjectData = () => {
            const generalConfigs = configStore.filter(c => !(c.property || c.name).startsWith('obj'));
            const objectConfigsInOrder = [];
            objects.forEach((liveObject, index) => {
                const newSequentialId = index + 1;
                const originalId = liveObject.id;
                const originalConfigs = configStore.filter(c => c.property && c.property.startsWith(`obj${originalId}_`));
                originalConfigs.forEach(conf => {
                    const newConf = { ...conf };
                    const propName = newConf.property.substring(newConf.property.indexOf('_') + 1);
                    newConf.property = `obj${newSequentialId}_${propName}`;
                    newConf.label = `${liveObject.name}:${conf.label.split(':').slice(1).join(':')}`;
                    let currentValue = liveObject[propName];
                    if (propName.startsWith('gradColor')) {
                        currentValue = liveObject.gradient[propName.replace('gradColor', 'color')];
                    } else if (propName === 'scrollDir') {
                        currentValue = liveObject.scrollDirection;
                    }
                    const propsToScale = ['x', 'y', 'width', 'height', 'innerDiameter', 'fontSize'];
                    const floatProps = ['visSmoothing', 'bouncePauseTime']; // Properties to keep as decimals

                    if (newConf.type === 'number') {
                        if (propName === 'animationSpeed') {
                            currentValue = Math.round(liveObject.animationSpeed * 10);
                        } else if (propName === 'cycleSpeed') {
                            currentValue = Math.round(liveObject.cycleSpeed * 50);
                        } else if (propsToScale.includes(propName)) {
                            currentValue = Math.round(parseFloat(currentValue) / 4);
                        } else if (!floatProps.includes(propName)) {
                            // Only round numbers that are not meant to be floats
                            currentValue = Math.round(parseFloat(currentValue));
                        }
                        // For properties in floatProps, we do nothing, preserving their decimal value.
                    }
                    if (typeof currentValue === 'boolean') { currentValue = String(currentValue); }
                    newConf.default = currentValue;
                    objectConfigsInOrder.push(newConf);
                });
            });
            const configsToSave = [...generalConfigs, ...objectConfigsInOrder];

            const titleConfig = configsToSave.find(c => c.name === 'title');
            if (titleConfig) titleConfig.default = formValues['title'] || 'Untitled Effect';

            const descriptionConfig = configsToSave.find(c => c.name === 'description');
            if (descriptionConfig) descriptionConfig.default = formValues['description'] || 'Built with Effect Builder';

            const publisherConfig = configsToSave.find(c => c.name === 'publisher');
            if (publisherConfig) publisherConfig.default = formValues['publisher'] || 'Anonymous';

            const animationConfig = configsToSave.find(c => c.property === 'enableAnimation');
            if (animationConfig) animationConfig.default = String(formValues['enableAnimation']);

            // --- START: Thumbnail Generation without Selection UI ---
            const originalSelection = [...selectedObjectIds]; // 1. Store the current selection
            selectedObjectIds = [];                         // 2. Temporarily deselect all objects
            drawFrame();                                    // 3. Redraw the canvas to get a clean image
            const thumbnail = generateThumbnail(document.getElementById('signalCanvas')); // 4. Generate the thumbnail
            selectedObjectIds = originalSelection;          // 5. Restore the original selection
            drawFrame();                                    // 6. Redraw again to make the selection box reappear
            // --- END: Thumbnail Generation without Selection UI ---

            return {
                name: trimmedName,
                thumbnail: thumbnail,
                configs: configsToSave,
                objects: objects.map((o, index) => ({ id: index + 1, name: o.name, locked: o.locked })),
                updatedAt: new Date()
            };
        };

        if (!querySnapshot.empty) {
            const existingDoc = querySnapshot.docs[0];
            if (existingDoc.data().userId === user.uid || isAdmin) {
                showConfirmModal('Confirm Overwrite', `A project named "${trimmedName}" already exists. Do you want to overwrite it?`, 'Overwrite', async () => {
                    try {
                        const projectData = buildProjectData();
                        await window.updateDoc(existingDoc.ref, projectData);
                        currentProjectDocId = existingDoc.id;
                        updateShareButtonState();
                        showToast(`Project "${trimmedName}" was overwritten successfully!`, 'success');
                    } catch (error) {
                        showToast("Error overwriting project: " + error.message, 'danger');
                    }
                });
            } else {
                showToast("A project with this name already exists. Please choose a different name.", 'danger');
            }
        } else {
            const banDocRef = window.doc(window.db, "bans", user.uid);
            const banDoc = await window.getDoc(banDocRef);
            if (banDoc.exists()) {
                showToast("You are unable to save new effects.", 'danger');
                return;
            }

            try {
                const projectData = buildProjectData();
                projectData.userId = user.uid;
                projectData.creatorName = user.displayName || 'Anonymous';
                projectData.isPublic = true;
                projectData.createdAt = new Date();

                const docRef = await window.addDoc(window.collection(window.db, "projects"), projectData);
                currentProjectDocId = docRef.id;
                updateShareButtonState();
                showToast(`Effect "${trimmedName}" was saved successfully!`, 'success');
            } catch (error) {
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

    toolbar.addEventListener('click', e => {
        const button = e.target.closest('button');
        if (!button || button.disabled || button.id === 'constrain-btn') return;
        const action = button.dataset.action;
        if (!action || selectedObjectIds.length === 0) return;

        const selected = selectedObjectIds.map(id => objects.find(o => o.id === id)).filter(o => o);
        if (selected.length === 0) return;

        const anchor = selected[0]; // The first selected object is typically the anchor

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
            case 'match-text-size':
                // FIX: The redundant 'const selected = ...' line that caused the error has been removed from here.
                const textObjects = selected.filter(obj => obj.shape === 'text');
                const gridObjects = selected.filter(obj => obj.shape === 'rectangle' && (obj.numberOfRows > 1 || obj.numberOfColumns > 1));

                if (textObjects.length >= 1 && gridObjects.length >= 1) {
                    const sourceGrid = gridObjects[0];
                    const cellHeight = sourceGrid.height / sourceGrid.numberOfRows;
                    textObjects.forEach(textObject => {
                        textObject.fontSize = cellHeight * 10;
                        textObject._updateTextMetrics();
                    });
                } else if (textObjects.length >= 2 && gridObjects.length === 0) {
                    const sourceText = textObjects[0];
                    const sourceFontSize = sourceText.fontSize;
                    textObjects.slice(1).forEach(targetText => {
                        targetText.fontSize = sourceFontSize;
                        targetText._updateTextMetrics();
                    });
                }
                break;
        }
        updateFormValuesFromObjects();
        recordHistory(); // Record state after a toolbar action
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

        if (selectedObjectIds.length === 1) {
            const selectedObject = objects.find(o => o.id === selectedObjectIds[0]);
            if (selectedObject && !selectedObject.locked) {
                const rotationHandle = selectedObject.getRotationHandleAtPoint(x, y);
                if (rotationHandle) {
                    isRotating = true;
                    isResizing = false;
                    isDragging = false;
                    const center = selectedObject.getCenter();
                    const startAngle = Math.atan2(y - center.y, x - center.x);
                    initialDragState = [{
                        id: selectedObject.id,
                        startAngle: startAngle,
                        initialObjectAngle: selectedObject.getRenderAngle()
                    }];
                    return;
                }
                const handle = selectedObject.getHandleAtPoint(x, y);
                if (handle) {
                    isResizing = true;
                    isRotating = false;
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
                        fontSize: selectedObject.fontSize,
                        anchorPoint: selectedObject.getWorldCoordsOfCorner(oppositeHandleName),
                        diameterRatio: selectedObject.shape === 'ring' ? selectedObject.innerDiameter / selectedObject.width : 1
                    }];
                    dragStartX = x;
                    dragStartY = y;
                    return;
                }
            }
        }

        const hitObjects = [];
        for (let i = objects.length - 1; i >= 0; i--) {
            if (objects[i].isPointInside(x, y)) {
                hitObjects.push(objects[i]);
            }
        }

        let targetObject = null;
        if (hitObjects.length > 0) {
            const alreadySelectedHit = hitObjects.find(obj => selectedObjectIds.includes(obj.id));
            if (alreadySelectedHit) {
                targetObject = alreadySelectedHit;
            } else {
                targetObject = hitObjects[0];
            }
        }

        if (targetObject) {
            const hitObjectId = targetObject.id;
            const wasAlreadySelected = selectedObjectIds.includes(hitObjectId);
            if (e.shiftKey || e.ctrlKey || e.metaKey) {
                if (wasAlreadySelected) {
                    selectedObjectIds = selectedObjectIds.filter(id => id !== hitObjectId);
                } else {
                    selectedObjectIds.push(hitObjectId);
                }
            } else {
                if (!wasAlreadySelected) {
                    selectedObjectIds = [hitObjectId];
                }
            }
            if (targetObject.rotationSpeed !== 0) {
                targetObject.rotation = 0;
                targetObject.rotationAngle = 0;
            }
        } else {
            selectedObjectIds = [];
        }

        if (selectedObjectIds.length > 0) {
            if (targetObject && !targetObject.locked) {
                isDragging = true;
                dragStartX = x;
                dragStartY = y;
                initialDragState = selectedObjectIds.map(id => {
                    const obj = objects.find(o => o.id === id);
                    if (obj && !obj.locked) {
                        return { id, x: obj.x, y: obj.y };
                    }
                    return null;
                }).filter(Boolean);
            } else {
                isDragging = false;
            }
        } else {
            isDragging = false;
        }

        updateToolbarState();
        syncPanelsWithSelection();
        needsRedraw = true; // Request a redraw instead of drawing directly
    });


    /**
     * Handles mouse movement over the canvas for dragging, resizing, and cursor updates.
     * @param {MouseEvent} e - The mousemove event object.
     */
    canvasContainer.addEventListener('mousemove', e => {
        e.preventDefault();
        const { x, y } = getCanvasCoordinates(e);

        if (isRotating) {
            const initial = initialDragState[0];
            const obj = objects.find(o => o.id === initial.id);
            if (!obj) return;

            const center = obj.getCenter();
            const currentAngle = Math.atan2(y - center.y, x - center.x);
            const angleDelta = currentAngle - initial.startAngle;
            const newAngleRad = initial.initialObjectAngle + angleDelta;

            obj.rotation = newAngleRad * 180 / Math.PI;
            obj.rotationAngle = newAngleRad;

            updateFormValuesFromObjects();
            drawFrame();
        } else if (isResizing) {
            const obj = objects.find(o => o.id === selectedObjectIds[0]);
            if (!obj) return;

            snapLines = [];
            const initial = initialDragState[0];
            const dx = x - dragStartX;
            const dy = y - dragStartY;

            let potentialX = initial.x;
            let potentialY = initial.y;
            let potentialWidth = initial.width;
            let potentialHeight = initial.height;
            let potentialFontSize = initial.fontSize;
            let isTextResize = obj.shape === 'text';

            if (isTextResize) {
                if (activeResizeHandle.includes('left') || activeResizeHandle.includes('right')) {
                    if (activeResizeHandle.includes('right')) {
                        potentialWidth = initial.width + dx;
                    }
                    if (activeResizeHandle.includes('left')) {
                        potentialWidth = initial.width - dx;
                        potentialX = initial.x + dx;
                    }
                    //obj.autoWidth = false;
                } else {
                    const scaleFactor = (initial.height + dy) / initial.height;
                    if (isFinite(scaleFactor) && scaleFactor > 0) {
                        potentialFontSize = Math.max(10, initial.fontSize * scaleFactor);
                    }
                }
            } else {
                if (activeResizeHandle.includes('right')) {
                    potentialWidth = initial.width + dx;
                }
                if (activeResizeHandle.includes('left')) {
                    potentialWidth = initial.width - dx;
                    potentialX = initial.x + dx;
                }
                if (activeResizeHandle.includes('bottom')) {
                    potentialHeight = initial.height + dy;
                }
                if (activeResizeHandle.includes('top')) {
                    potentialHeight = initial.height - dy;
                    potentialY = initial.y + dy;
                }
            }

            potentialWidth = Math.max(10, potentialWidth);
            potentialHeight = Math.max(10, potentialHeight);

            const movingEdges = {
                left: potentialX,
                right: potentialX + potentialWidth,
                top: potentialY,
                bottom: potentialY + potentialHeight,
                hCenter: potentialX + potentialWidth / 2,
                vCenter: potentialY + potentialHeight / 2
            };

            const SNAP_THRESHOLD = 20;
            const otherObjects = objects.filter(o => o.id !== obj.id);
            const snapTargets = otherObjects.map(o => ({
                left: o.x,
                right: o.x + o.width,
                top: o.y,
                bottom: o.y + o.height,
                hCenter: o.x + o.width / 2,
                vCenter: o.y + o.height / 2,
                width: o.width,
                height: o.height
            }));
            snapTargets.push({
                left: 0,
                right: canvas.width,
                top: 0,
                bottom: canvas.height,
                hCenter: canvas.width / 2,
                vCenter: canvas.height / 2
            });

            let snapDx = 0;
            let snapDy = 0;
            let minSnapDistX = SNAP_THRESHOLD;
            let minSnapDistY = SNAP_THRESHOLD;

            for (const target of snapTargets) {
                // Horizontal snapping
                if (activeResizeHandle.includes('right') || isTextResize) {
                    const snaps = [
                        { dist: Math.abs(movingEdges.right - target.left), adj: target.left - movingEdges.right, type: 'vertical', line: target.left },
                        { dist: Math.abs(movingEdges.right - target.right), adj: target.right - movingEdges.right, type: 'vertical', line: target.right },
                        { dist: Math.abs(movingEdges.right - target.hCenter), adj: target.hCenter - movingEdges.right, type: 'vertical', line: target.hCenter }
                    ];
                    for (const s of snaps) {
                        if (s.dist < minSnapDistX) {
                            minSnapDistX = s.dist;
                            snapDx = s.adj;
                            snapLines.push({ type: s.type, x: s.line });
                        }
                    }
                    if (target.width && Math.abs(potentialWidth - target.width) < minSnapDistX) {
                        minSnapDistX = Math.abs(potentialWidth - target.width);
                        snapDx = (potentialWidth - target.width) * -1;
                        snapLines.push({ type: 'vertical', x: potentialX + target.width });
                    }
                }
                if (activeResizeHandle.includes('left')) {
                    const snaps = [
                        { dist: Math.abs(movingEdges.left - target.left), adj: target.left - movingEdges.left, type: 'vertical', line: target.left },
                        { dist: Math.abs(movingEdges.left - target.right), adj: target.right - movingEdges.left, type: 'vertical', line: target.right },
                        { dist: Math.abs(movingEdges.left - target.hCenter), adj: target.hCenter - movingEdges.left, type: 'vertical', line: target.hCenter }
                    ];
                    for (const s of snaps) {
                        if (s.dist < minSnapDistX) {
                            minSnapDistX = s.dist;
                            snapDx = s.adj;
                            snapLines.push({ type: s.type, x: s.line });
                        }
                    }
                }
                if (activeResizeHandle.includes('h-center')) {
                    const snaps = [
                        { dist: Math.abs(movingEdges.hCenter - target.hCenter), adj: target.hCenter - movingEdges.hCenter, type: 'vertical', line: target.hCenter }
                    ];
                    for (const s of snaps) {
                        if (s.dist < minSnapDistX) {
                            minSnapDistX = s.dist;
                            snapDx = s.adj;
                            snapLines.push({ type: s.type, x: s.line });
                        }
                    }
                }

                // Vertical snapping
                if (activeResizeHandle.includes('bottom') || (isTextResize && !activeResizeHandle.includes('left') && !activeResizeHandle.includes('right'))) {
                    const snaps = [
                        { dist: Math.abs(movingEdges.bottom - target.top), adj: target.top - movingEdges.bottom, type: 'horizontal', line: target.top },
                        { dist: Math.abs(movingEdges.bottom - target.bottom), adj: target.bottom - movingEdges.bottom, type: 'horizontal', line: target.bottom },
                        { dist: Math.abs(movingEdges.bottom - target.vCenter), adj: target.vCenter - movingEdges.bottom, type: 'horizontal', line: target.vCenter }
                    ];
                    for (const s of snaps) {
                        if (s.dist < minSnapDistY) {
                            minSnapDistY = s.dist;
                            snapDy = s.adj;
                            snapLines.push({ type: s.type, y: s.line });
                        }
                    }
                    if (target.height && Math.abs(potentialHeight - target.height) < minSnapDistY) {
                        minSnapDistY = Math.abs(potentialHeight - target.height);
                        snapDy = (potentialHeight - target.height) * -1;
                        snapLines.push({ type: 'horizontal', y: potentialY + target.height });
                    }
                }
                if (activeResizeHandle.includes('top')) {
                    const snaps = [
                        { dist: Math.abs(movingEdges.top - target.top), adj: target.top - movingEdges.top, type: 'horizontal', line: target.top },
                        { dist: Math.abs(movingEdges.top - target.bottom), adj: target.bottom - movingEdges.top, type: 'horizontal', line: target.bottom },
                        { dist: Math.abs(movingEdges.top - target.vCenter), adj: target.vCenter - movingEdges.top, type: 'horizontal', line: target.vCenter }
                    ];
                    for (const s of snaps) {
                        if (s.dist < minSnapDistY) {
                            minSnapDistY = s.dist;
                            snapDy = s.adj;
                            snapLines.push({ type: s.type, y: s.line });
                        }
                    }
                }
                if (activeResizeHandle.includes('v-center')) {
                    const snaps = [
                        { dist: Math.abs(movingEdges.vCenter - target.vCenter), adj: target.vCenter - movingEdges.vCenter, type: 'horizontal', line: target.vCenter }
                    ];
                    for (const s of snaps) {
                        if (s.dist < minSnapDistY) {
                            minSnapDistY = s.dist;
                            snapDy = s.adj;
                            snapLines.push({ type: s.type, y: s.line });
                        }
                    }
                }
            }

            if (isTextResize) {
                if (activeResizeHandle.includes('left')) {
                    obj.x = potentialX + snapDx;
                    obj.width = Math.max(20, initial.width - dx - snapDx);
                }
                if (activeResizeHandle.includes('right')) {
                    obj.width = Math.max(20, initial.width + dx + snapDx);
                }
                if (activeResizeHandle.includes('top') || activeResizeHandle.includes('bottom')) {
                    obj.fontSize = Math.max(10, initial.fontSize * ((initial.height + dy + snapDy) / initial.height));
                }
                obj._updateTextMetrics();

            } else {
                obj.x = activeResizeHandle.includes('left') ? potentialX + snapDx : initial.x;
                obj.y = activeResizeHandle.includes('top') ? potentialY + snapDy : initial.y;
                obj.width = Math.max(10, activeResizeHandle.includes('left') ? potentialWidth - snapDx : potentialWidth + snapDx);
                obj.height = Math.max(10, activeResizeHandle.includes('top') ? potentialHeight - snapDy : potentialHeight + snapDy);
            }

            if (obj.shape === 'circle' || obj.shape === 'ring') {
                obj.height = obj.width;
                if (obj.shape === 'ring') {
                    obj.innerDiameter = obj.width * initial.diameterRatio;
                }
            }

            updateFormValuesFromObjects();
        } else if (isDragging) {
            const SNAP_THRESHOLD = 30;
            let dx = x - dragStartX;
            let dy = y - dragStartY;

            // Clear snap lines at the start of each mousemove
            snapLines = [];

            if (selectedObjectIds.length === 1) {
                const draggedObj = objects.find(o => o.id === selectedObjectIds[0]);
                const initial = initialDragState[0];
                if (draggedObj) {
                    let newX = initial.x + dx;
                    let newY = initial.y + dy;
                    let finalX = newX;
                    let finalY = newY;

                    // Define moving edges
                    const draggedEdges = {
                        left: newX,
                        right: newX + draggedObj.width,
                        top: newY,
                        bottom: newY + draggedObj.height,
                        hCenter: newX + draggedObj.width / 2,
                        vCenter: newY + draggedObj.height / 2
                    };

                    // Collect snap targets (other objects and canvas)
                    const otherObjects = objects.filter(o => o.id !== draggedObj.id);
                    const snapTargets = otherObjects.map(o => ({
                        left: o.x,
                        right: o.x + o.width,
                        top: o.y,
                        bottom: o.y + o.height,
                        hCenter: o.x + o.width / 2,
                        vCenter: o.y + o.height / 2
                    }));
                    snapTargets.push({
                        left: 0,
                        right: canvas.width,
                        top: 0,
                        bottom: canvas.height,
                        hCenter: canvas.width / 2,
                        vCenter: canvas.height / 2
                    });

                    // Calculate snapping adjustments
                    let minSnapDistX = SNAP_THRESHOLD;
                    let minSnapDistY = SNAP_THRESHOLD;
                    let bestSnapX = null;
                    let bestSnapY = null;

                    for (const target of snapTargets) {
                        // Horizontal snapping
                        const hSnaps = [
                            { dist: Math.abs(draggedEdges.left - target.left), newX: target.left, lineX: target.left },
                            { dist: Math.abs(draggedEdges.left - target.right), newX: target.right, lineX: target.right },
                            { dist: Math.abs(draggedEdges.right - target.left), newX: target.left - draggedObj.width, lineX: target.left },
                            { dist: Math.abs(draggedEdges.right - target.right), newX: target.right - draggedObj.width, lineX: target.right },
                            { dist: Math.abs(draggedEdges.hCenter - target.hCenter), newX: target.hCenter - draggedObj.width / 2, lineX: target.hCenter }
                        ];
                        for (const snap of hSnaps) {
                            if (snap.dist < minSnapDistX) {
                                minSnapDistX = snap.dist;
                                bestSnapX = snap.newX;
                                snapLines.push({ type: 'vertical', x: snap.lineX });
                            }
                        }

                        // Vertical snapping
                        const vSnaps = [
                            { dist: Math.abs(draggedEdges.top - target.top), newY: target.top, lineY: target.top },
                            { dist: Math.abs(draggedEdges.top - target.bottom), newY: target.bottom, lineY: target.bottom },
                            { dist: Math.abs(draggedEdges.bottom - target.top), newY: target.top - draggedObj.height, lineY: target.top },
                            { dist: Math.abs(draggedEdges.bottom - target.bottom), newY: target.bottom - draggedObj.height, lineY: target.bottom },
                            { dist: Math.abs(draggedEdges.vCenter - target.vCenter), newY: target.vCenter - draggedObj.height / 2, lineY: target.vCenter }
                        ];
                        for (const snap of vSnaps) {
                            if (snap.dist < minSnapDistY) {
                                minSnapDistY = snap.dist;
                                bestSnapY = snap.newY;
                                snapLines.push({ type: 'horizontal', y: snap.lineY });
                            }
                        }
                    }

                    // Apply snapping
                    if (bestSnapX !== null) {
                        finalX = bestSnapX;
                    }
                    if (bestSnapY !== null) {
                        finalY = bestSnapY;
                    }

                    // Constrain to canvas if enabled
                    if (constrainToCanvas) {
                        finalX = Math.max(0, Math.min(finalX, canvas.width - draggedObj.width));
                        finalY = Math.max(0, Math.min(finalY, canvas.height - draggedObj.height));
                    }

                    draggedObj.x = finalX;
                    draggedObj.y = finalY;

                    // console.log('snapLines:', snapLines); // Debug: Verify snap lines are populated
                }
            } else { // This is the block for multi-object dragging
                let dx = x - dragStartX;
                let dy = y - dragStartY;

                if (constrainToCanvas) {
                    // First, find the boundaries of the entire selection at its proposed new position
                    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
                    initialDragState.forEach(initial => {
                        const obj = objects.find(o => o.id === initial.id);
                        if (obj) {
                            const newObjX = initial.x + dx;
                            const newObjY = initial.y + dy;
                            minX = Math.min(minX, newObjX);
                            maxX = Math.max(maxX, newObjX + obj.width);
                            minY = Math.min(minY, newObjY);
                            maxY = Math.max(maxY, newObjY + obj.height);
                        }
                    });

                    // Next, calculate how much the entire group has overshot the canvas boundaries
                    let correctionDx = 0;
                    let correctionDy = 0;

                    if (minX < 0) {
                        correctionDx = -minX; // Nudge the group to the right
                    } else if (maxX > canvas.width) {
                        correctionDx = canvas.width - maxX; // Nudge the group to the left
                    }

                    if (minY < 0) {
                        correctionDy = -minY; // Nudge the group down
                    } else if (maxY > canvas.height) {
                        correctionDy = canvas.height - maxY; // Nudge the group up
                    }

                    // Apply the single correction to the overall mouse delta
                    dx += correctionDx;
                    dy += correctionDy;
                }

                // Finally, apply the same corrected delta to all objects in the selection
                initialDragState.forEach(initial => {
                    const obj = objects.find(o => o.id === initial.id);
                    if (obj) {
                        obj.x = initial.x + dx;
                        obj.y = initial.y + dy;
                    }
                });
            }

            updateFormValuesFromObjects();
        } else {
            // Update Cursor
            canvasContainer.style.cursor = 'default';
            if (selectedObjectIds.length === 1) {
                const selectedObject = objects.find(o => o.id === selectedObjectIds[0]);
                if (selectedObject && !selectedObject.locked) {
                    const rotationHandle = selectedObject.getRotationHandleAtPoint(x, y);
                    const resizeHandle = selectedObject.getHandleAtPoint(x, y);
                    if (rotationHandle) {
                        canvasContainer.style.cursor = 'crosshair';
                    } else if (resizeHandle) {
                        canvasContainer.style.cursor = resizeHandle.cursor;
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
        const wasManipulating = isDragging || isResizing || isRotating;

        if (isRotating) {
            const initial = initialDragState[0];
            const obj = objects.find(o => o.id === initial.id);
            if (obj) {
                obj.rotation = Math.round(obj.rotation);
            }
        }

        isDragging = false;
        isResizing = false;
        isRotating = false;
        activeResizeHandle = null;
        snapLines = []; // Clear snap lines

        if (wasManipulating) {
            initialDragState.forEach(initial => {
                const obj = objects.find(o => o.id === initial.id);
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

        needsRedraw = true; // Request a final redraw instead of drawing directly
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
    async function init() {
        const constrainBtn = document.getElementById('constrain-btn');

        constrainBtn.classList.remove('btn-secondary');
        if (constrainToCanvas) {
            constrainBtn.classList.add('btn-secondary');
        } else {
            constrainBtn.classList.add('btn-outline-secondary');
        }

        let effectLoaded = await loadSharedEffect();
        if (!effectLoaded) {
            effectLoaded = await loadFeaturedEffect();
        }

        if (!effectLoaded) {
            // If no shared or featured effect was loaded, load the default template
            const template = document.getElementById('initial-config');
            const metaElements = Array.from(template.content.querySelectorAll('meta'));
            configStore = metaElements.map(parseMetaToConfig);
            createInitialObjects();
            renderForm();
        }

        updateAll();

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
    }

    // --- SHARE BUTTON LOGIC ---
    document.getElementById('share-btn').addEventListener('click', async () => {
        const user = window.auth.currentUser;
        //syncConfigStoreWithForm();
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
                // console.log("Detaching gallery listener.");
                galleryListener(); // This is the unsubscribe function
                galleryListener = null;
            }
        });
    }

    // BROWSE GALLERY BUTTON
    document.getElementById('browse-btn').addEventListener('click', async () => {
        if (galleryListener) {
            galleryListener();
            galleryListener = null;
        }
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
                projects.push({
                    docId: doc.id,
                    ...data
                });
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
            return false;
        }

        try {
            const effectDocRef = window.doc(window.db, "projects", effectId);
            const effectDoc = await window.getDoc(effectDocRef);

            if (effectDoc.exists()) {
                // FIX: Pass the document ID along with the data
                const projectData = { docId: effectDoc.id, ...effectDoc.data() };

                if (projectData.isPublic) {
                    loadWorkspace(projectData);
                    showNotification("Shared effect loaded!");
                    return true;
                } else {
                    showNotification("This effect is not public.", 'danger');
                }
            } else {
                showNotification("Shared effect not found.", 'danger');
            }
        } catch (error) {
            console.error("Error loading shared effect:", error);
            showNotification("Could not load the shared effect.", 'danger');
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
        const shareUrl = `${window.location.origin}${window.location.pathname}?effectId=${currentProjectDocId}`;
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

    // In main.js, REPLACE the 'addObjectBtn' event listener
    addObjectBtn.addEventListener('click', () => {
        currentProjectDocId = null;
        updateShareButtonState();
        const newId = objects.length > 0 ? (Math.max(...objects.map(o => o.id))) + 1 : 1;
        const newConfigs = getDefaultObjectConfig(newId);
        configStore.push(...newConfigs);

        const state = {
            id: newId,
            name: `Object ${newId}`,
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

        const newShape = new Shape({ ...state, ctx, fps });
        objects.push(newShape);

        renderForm();
        updateFormValuesFromObjects();
        drawFrame();
        recordHistory();
    });

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

    // --- Logic for the Copy Properties Modal ---
    const confirmCopyBtn = document.getElementById('confirm-copy-btn');
    if (confirmCopyBtn) {
        confirmCopyBtn.addEventListener('click', () => {
            if (sourceObjectIdForCopy === null) return;

            const sourceObject = objects.find(o => o.id === sourceObjectIdForCopy);
            if (!sourceObject) return;

            // A map of checkbox IDs to all copyable properties
            const propertyGroups = {
                position: ['x', 'y', 'rotation'],
                size: ['width', 'height', 'innerDiameter', 'angularWidth', 'numberOfSegments'],
                fillStyle: ['gradient', 'gradType', 'gradientDirection', 'useSharpGradient', 'gradientStop'],
                animation: ['animationSpeed', 'animationMode', 'scrollDirection', 'rotationSpeed', 'bouncePauseTime'],
                colorAnimation: ['cycleColors', 'cycleSpeed'],
                grid: ['numberOfRows', 'numberOfColumns', 'phaseOffset'],
                text: ['text', 'fontSize', 'textAlign', 'pixelFont', 'textAnimation', 'textAnimationSpeed', 'showTime', 'showDate'],
                visualizer: ['visStyle', 'visColorMode', 'visSmoothing', 'visGain', 'visBarCount', 'visNormalize'],
                oscilloscope: ['oscAmplitude', 'oscFrequency', 'oscRadial', 'oscWaveType', 'oscDrawAsLine', 'oscLineThickness', 'oscAnimationType', 'oscAmplitude2', 'oscFrequency2', 'oscAmplitudeDriver']
            };

            // --- START: New Additive Logic ---
            // Start with an empty object and only add properties from checked groups.
            const propsToCopy = {};

            for (const group in propertyGroups) {
                const checkbox = document.getElementById(`copy-${group}`);
                if (checkbox && checkbox.checked) {
                    propertyGroups[group].forEach(prop => {
                        // Deep copy nested objects like 'gradient'
                        if (typeof sourceObject[prop] === 'object' && sourceObject[prop] !== null) {
                            propsToCopy[prop] = JSON.parse(JSON.stringify(sourceObject[prop]));
                        }
                        // Copy primitive values
                        else if (sourceObject[prop] !== undefined) {
                            propsToCopy[prop] = sourceObject[prop];
                        }
                    });
                }
            }
            // --- END: New Additive Logic ---

            // Store the filtered properties in the clipboard
            propertyClipboard = {
                sourceId: sourceObjectIdForCopy,
                properties: propsToCopy
            };
            showToast(`Selected properties copied from "${sourceObject.name}"`, 'info');
            updateCopyPasteUI(); // Show the 'Paste' buttons

            const copyModal = bootstrap.Modal.getInstance(document.getElementById('copy-properties-modal'));
            copyModal.hide();
            //sourceObjectIdForCopy = null; // Reset for next time
        });
    }

    document.getElementById('start-audio-btn').addEventListener('click', async () => {
        const btn = document.getElementById('start-audio-btn');
        const success = await engine.start(); // Wait for the user to give permission

        if (success) {
            // Only update the button if audio was successfully started
            btn.querySelector('.button-text').textContent = 'Audio Active';
            btn.disabled = true;
        }
    });

    /**
     * Finds and loads the single "featured" effect from the database.
     * @returns {boolean} True if a featured effect was found and loaded, otherwise false.
     */
    async function loadFeaturedEffect() {
        try {
            const q = window.query(window.collection(window.db, "projects"), window.where("isFeatured", "==", true), window.limit(1));
            const querySnapshot = await window.getDocs(q);
            if (!querySnapshot.empty) {
                const projectDoc = querySnapshot.docs[0];
                const projectData = { docId: projectDoc.id, ...projectDoc.data() };
                if (projectData.createdAt && projectData.createdAt.toDate) {
                    projectData.createdAt = projectData.createdAt.toDate();
                }
                loadWorkspace(projectData);
                showToast(`Loaded featured effect: "${projectData.name}"`, 'info');
                return true; // Success
            }
        } catch (error) {
            console.error("Error loading featured effect:", error);
        }
        return false; // No featured effect found or an error occurred
    }

    // Start the application.
    init();

});
