function hexToHsl(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h * 360, s * 100, l * 100];
}

function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
    const toHex = c => Math.round(c * 255).toString(16).padStart(2, '0');
    return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

// Helper function to compute world-coordinate edges and center
function getWorldPoints(obj) {
    const center = obj.getCenter();

    if (obj.shape === 'circle' || obj.shape === 'ring') {
        const outerRadius = obj.width / 2;
        let points = [
            { x: center.x, y: center.y - outerRadius, type: 'edge', handle: 'top' },
            { x: center.x, y: center.y + outerRadius, type: 'edge', handle: 'bottom' },
            { x: center.x - outerRadius, y: center.y, type: 'edge', handle: 'left' },
            { x: center.x + outerRadius, y: center.y, type: 'edge', handle: 'right' },
            { x: center.x, y: center.y, type: 'center', handle: 'center' }
        ];
        if (obj.shape === 'ring' && obj.innerDiameter > 0) {
            const innerRadius = obj.innerDiameter / 2;
            points.push(
                { x: center.x, y: center.y - innerRadius, type: 'edge', handle: 'top' },
                { x: center.x, y: center.y + innerRadius, type: 'edge', handle: 'bottom' },
                { x: center.x - innerRadius, y: center.y, type: 'edge', handle: 'left' },
                { x: center.x + innerRadius, y: center.y, type: 'edge', handle: 'right' }
            );
        }
        return points;
    }

    const angle = obj.getRenderAngle();
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const halfWidth = obj.width / 2;
    const halfHeight = obj.height / 2;
    const localPoints = [
        { x: -halfWidth, y: -halfHeight, type: 'edge', handle: 'top-left' },
        { x: halfWidth, y: -halfHeight, type: 'edge', handle: 'top-right' },
        { x: halfWidth, y: halfHeight, type: 'edge', handle: 'bottom-right' },
        { x: -halfWidth, y: halfHeight, type: 'edge', handle: 'bottom-left' },
        { x: 0, y: -halfHeight, type: 'center', handle: 'top' },
        { x: 0, y: halfHeight, type: 'center', handle: 'bottom' },
        { x: -halfWidth, y: 0, type: 'center', handle: 'left' },
        { x: halfWidth, y: 0, type: 'center', handle: 'right' },
        { x: 0, y: 0, type: 'center', handle: 'center' }
    ];
    return localPoints.map(point => ({
        x: center.x + (point.x * cosA - point.y * sinA),
        y: center.y + (point.x * sinA + point.y * cosA),
        type: point.type,
        handle: point.handle
    }));
}

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds have elapsed
 * since the last time the debounced function was invoked.
 * @param {function} func The function to debounce.
 * @param {number} [wait=500] The number of milliseconds to delay.
 * @returns {function} Returns the new debounced function.
 */
function debounce(func, wait = 100) {
    let timeout;
    return function (...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
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

const appHistory = {
    stack: [],
    index: -1,
    maxSize: 50,

    push(state) {
        if (isRestoring) return;
        const currentState = this.stack[this.index];
        if (currentState && JSON.stringify(state.objects) === JSON.stringify(currentState.objects)) {
            return;
        }
        if (this.index < this.stack.length - 1) {
            this.stack = this.stack.slice(0, this.index + 1);
        }
        this.stack.push(state);
        if (this.stack.length > this.maxSize) {
            this.stack.shift();
        } else {
            this.index++;
        }
        updateUndoRedoButtons();
    },

    undo() {
        if (this.index > 0) {
            this.index--;
            return this.stack[this.index];
        }
        return null;
    },

    redo() {
        if (this.index < this.stack.length - 1) {
            this.index++;
            return this.stack[this.index];
        }
        return null;
    }
};

function updateUndoRedoButtons() {
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    if (undoBtn) undoBtn.disabled = appHistory.index <= 0;
    if (redoBtn) redoBtn.disabled = appHistory.index >= appHistory.stack.length - 1;
}

function getCurrentState() {
    const plainObjects = JSON.parse(JSON.stringify(objects, (key, value) => {
        if (key === 'ctx') return undefined;
        return value;
    }));
    return {
        objects: plainObjects,
        selectedObjectIds: JSON.parse(JSON.stringify(selectedObjectIds)),
    };
}

function recordHistory() {
    appHistory.push(getCurrentState());
}

function restoreState(state) {
    isRestoring = true;
    const generalValues = getControlValues();
    objects = state.objects.map(data => new Shape({ ...data, ctx }));
    selectedObjectIds = state.selectedObjectIds;
    renderForm();
    for (const key in generalValues) {
        const el = form.elements[key];
        if (el && !key.startsWith('obj')) {
            if (el.type === 'checkbox') el.checked = generalValues[key];
            else el.value = generalValues[key];
        }
    }
    updateFormValuesFromObjects();
    drawFrame();
    updateToolbarState();
    updateUndoRedoButtons();
    isRestoring = false;
}

