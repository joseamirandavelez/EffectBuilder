// --- State Management ---
let isRestoring = false;
let configStore = [];
let objects = [];
let selectedObjectIds = [];
let oldSelection = [];
let needsRedraw = false;
let constrainToCanvas = true;
let verticalSplit, horizontalSplit;
let lastHSizes, lastVSizes;
let fps = 50;
let fpsInterval;
let then;
let galleryListener = null;
let lastVisibleDoc = null;
let isLoadingMore = false;
let currentGalleryQuery = null;
let currentProjectDocId = null;
let confirmActionCallback = null;
let exportPayload = {};
let propertyClipboard = null;
let sourceObjectId = null;

let cachedSnapTargets = null;
let snapLines = [];
let isDragging = false;
let isResizing = false;
let isRotating = false;
let activeResizeHandle = null;
let initialDragState = [];
let dragStartX = 0;
let dragStartY = 0;
let audioContext;
let analyser;
let frequencyData;
let isAudioSetup = false;
let gradientSpeedMultiplier = 1 / 400;
let shapeAnimationSpeedMultiplier = 0.05;
let seismicAnimationSpeedMultiplier = 0.015;
let tetrisSpeedDivisor = 10.0;

const EXPORT_GRADIENT_SPEED_MULTIPLIER = gradientSpeedMultiplier;
const EXPORT_SHAPE_ANIMATION_SPEED_MULTIPLIER = shapeAnimationSpeedMultiplier;
const EXPORT_SEISMIC_ANIMATION_SPEED_MULTIPLIER = seismicAnimationSpeedMultiplier;
const EXPORT_TETRIS_SPEED_DIVISOR = tetrisSpeedDivisor * 4;



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

class ExportedShape extends Shape {
    constructor(config) {
        const scaledConfig = { ...config };
        const scaleFactor = 4.0;

        // Scale up internal dimensions to match the base class's logic
        const propsToScaleUp = ['innerDiameter', 'fontSize', 'lineWidth', 'pulseDepth'];
        propsToScaleUp.forEach(prop => {
            if (scaledConfig[prop] !== undefined) {
                scaledConfig[prop] *= scaleFactor;
            }
        });

        // Initialize the base Shape class with the fully corrected config
        super(scaledConfig);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('startAudioBtn').addEventListener('click', setupAudio);

    if (!localStorage.getItem('termsAccepted')) {
        var termsModal = new bootstrap.Modal(document.getElementById('accept-terms-modal'));
        termsModal.show();
    }
    document.getElementById('accept-terms-btn').addEventListener('click', function () {
        localStorage.setItem('termsAccepted', 'true');
    });
    document.getElementById('accept-terms2-btn').addEventListener('click', function () {
        localStorage.setItem('termsAccepted', 'true');
    });

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
    const toolbar = document.getElementById('toolbar');
    const constrainBtn = document.getElementById('constrain-btn');
    const exportBtn = document.getElementById('export-btn');
    const shareBtn = document.getElementById('share-btn');
    const addObjectBtn = document.getElementById('add-object-btn');
    const confirmImportBtn = document.getElementById('confirm-import-btn');
    const confirmBtn = document.getElementById('confirm-overwrite-btn');
    const coordsDisplay = document.getElementById('coords-display');

    const shapePropertyMap = {
        rectangle: [
            'x', 'y', 'width', 'height', 'rotation', 'gradType', 'useSharpGradient', 'gradientStop',
            'gradColor1', 'gradColor2', 'cycleColors', 'animationMode', 'animationSpeed', 'rotationSpeed',
            'cycleSpeed', 'scrollDir', 'phaseOffset', 'numberOfRows', 'numberOfColumns',
            'enableStroke', 'strokeWidth', 'strokeGradType', 'strokeGradColor1', 'strokeGradColor2', 'strokeCycleColors', 'strokeCycleSpeed', 'strokeAnimationSpeed', 'strokeScrollDir',
        ],
        circle: [
            'x', 'y', 'width', 'height', 'rotation', 'gradType', 'useSharpGradient', 'gradientStop',
            'gradColor1', 'gradColor2', 'cycleColors', 'animationMode', 'animationSpeed', 'rotationSpeed',
            'cycleSpeed', 'scrollDir', 'phaseOffset',
            'enableStroke', 'strokeWidth', 'strokeGradType', 'strokeGradColor1', 'strokeGradColor2', 'strokeCycleColors', 'strokeCycleSpeed', 'strokeAnimationSpeed', 'strokeScrollDir',
        ],
        ring: [
            'x', 'y', 'width', 'height', 'rotation', 'gradType', 'gradColor1', 'gradColor2', 'cycleColors',
            'animationSpeed', 'rotationSpeed', 'cycleSpeed', 'innerDiameter', 'numberOfSegments', 'angularWidth',
            'enableStroke', 'strokeWidth', 'strokeGradType', 'strokeGradColor1', 'strokeGradColor2', 'strokeCycleColors', 'strokeCycleSpeed', 'strokeAnimationSpeed', 'strokeScrollDir',
        ],
        polygon: [
            'x', 'y', 'width', 'height', 'rotation', 'gradType', 'useSharpGradient', 'gradientStop',
            'gradColor1', 'gradColor2', 'cycleColors', 'animationMode', 'animationSpeed', 'rotationSpeed',
            'cycleSpeed', 'scrollDir', 'phaseOffset', 'sides',
            'enableStroke', 'strokeWidth', 'strokeGradType', 'strokeGradColor1', 'strokeGradColor2', 'strokeCycleColors', 'strokeCycleSpeed', 'strokeAnimationSpeed', 'strokeScrollDir',
        ],
        star: [
            'x', 'y', 'width', 'height', 'rotation', 'gradType', 'useSharpGradient', 'gradientStop',
            'gradColor1', 'gradColor2', 'cycleColors', 'animationMode', 'animationSpeed', 'rotationSpeed',
            'cycleSpeed', 'scrollDir', 'phaseOffset', 'points', 'starInnerRadius',
            'enableStroke', 'strokeWidth', 'strokeGradType', 'strokeGradColor1', 'strokeGradColor2', 'strokeCycleColors', 'strokeCycleSpeed', 'strokeAnimationSpeed', 'strokeScrollDir',
        ],
        text: [
            'x', 'y', 'width', 'height', 'rotation', 'gradType', 'gradColor1', 'gradColor2', 'cycleColors',
            'animationSpeed', 'text', 'fontSize', 'textAlign', 'pixelFont', 'textAnimation',
            'textAnimationSpeed', 'showTime', 'showDate'
        ],
        oscilloscope: [
            'x', 'y', 'width', 'height', 'rotation', 'gradType', 'gradColor1', 'gradColor2', 'cycleColors',
            'animationMode', 'animationSpeed', 'rotationSpeed', 'cycleSpeed', 'scrollDir', 'phaseOffset',
            'lineWidth', 'waveType', 'frequency', 'oscDisplayMode', 'pulseDepth', 'fillShape',
            'enableWaveAnimation', 'waveStyle', 'waveCount',
            'enableStroke', 'strokeWidth', 'strokeGradType', 'strokeGradColor1', 'strokeGradColor2', 'strokeCycleColors', 'strokeCycleSpeed', 'strokeAnimationSpeed', 'strokeScrollDir',
        ],
        tetris: [
            'x', 'y', 'width', 'height', 'rotation', 'gradType', 'useSharpGradient', 'gradientStop',
            'gradColor1', 'gradColor2', 'cycleColors', 'cycleSpeed', 'animationSpeed', 'phaseOffset',
            'tetrisAnimation', 'tetrisBlockCount', 'tetrisDropDelay', 'tetrisSpeed', 'tetrisBounce'
        ],
        fire: [
            'x', 'y', 'width', 'height', 'rotation', 'gradType', 'gradColor1', 'gradColor2', 'cycleColors',
            'animationSpeed', 'cycleSpeed', 'scrollDir'
        ],
        // FIX: Standardized to 'fire-radial'.
        'fire-radial': [
            'x', 'y', 'width', 'height', 'rotation', 'gradType', 'gradColor1', 'gradColor2', 'cycleColors',
            'animationSpeed', 'cycleSpeed', 'scrollDir', 'fireSpread'
        ],
        'pixel-art': [
            'x', 'y', 'width', 'height', 'rotation', 'gradType', 'useSharpGradient', 'gradientStop',
            'gradColor1', 'gradColor2', 'cycleColors', 'animationMode', 'animationSpeed', 'rotationSpeed',
            'cycleSpeed', 'scrollDir', 'phaseOffset', 'pixelArtData'
        ]
    };

    const galleryOffcanvasEl = document.getElementById('gallery-offcanvas');
    const galleryList = document.getElementById('gallery-project-list');
    const galleryBody = galleryOffcanvasEl.querySelector('.offcanvas-body');




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
     * Clears all objects and resets the workspace to a blank state.
     */
    function resetWorkspace() {
        // Clear all object-specific data
        objects = [];
        configStore = configStore.filter(c => !(c.property || c.name).startsWith('obj'));
        selectedObjectIds = [];

        // Reset the undo/redo appHistory
        appHistory.stack = [];
        appHistory.index = -1;

        // Reset the project title
        const titleInput = form.elements['title'];
        if (titleInput) titleInput.value = 'Untitled Effect';

        // Update the entire UI
        renderForm();
        drawFrame();
        updateUndoRedoButtons();

        // Record this new, blank state as the first appHistory entry
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
            li.id = `gallery-item-${project.docId}`;

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

            // FIX: This line adds the author and date information to the display.
            infoDiv.appendChild(metaEl);

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

            if (currentUser && currentUser.uid === ADMIN_UID) {
                const featureBtn = document.createElement('button');
                const isFeatured = project.featured === true;

                featureBtn.className = `btn btn-sm btn-feature ${isFeatured ? 'btn-warning' : 'btn-outline-warning'}`;
                featureBtn.innerHTML = isFeatured ? '<i class="bi bi-star-fill"></i>' : '<i class="bi bi-star"></i>';
                featureBtn.title = isFeatured ? 'Unfeature this effect' : 'Feature this effect';
                featureBtn.dataset.docId = project.docId;

                featureBtn.onclick = function () {
                    toggleFeaturedStatus(this, project.docId);
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

    const themeSwitcherBtn = document.getElementById('theme-switcher-btn');
    if (themeSwitcherBtn) {
        themeSwitcherBtn.addEventListener('click', () => {
            const themes = ['light', 'dark', 'auto'];
            const currentTheme = getStoredTheme() || getPreferredTheme();
            const currentIndex = themes.indexOf(currentTheme);
            const nextIndex = (currentIndex + 1) % themes.length;
            const newTheme = themes[nextIndex];

            setStoredTheme(newTheme);
            setTheme(newTheme);
            updateThemeSwitcherUI(newTheme);
        });
    }

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
    // document.querySelectorAll('[data-bs-theme-value]').forEach(button => {
    //     button.addEventListener('click', () => {
    //         const theme = button.getAttribute('data-bs-theme-value');
    //         setStoredTheme(theme);
    //         setTheme(theme);
    //         updateThemeSwitcherUI(theme);
    //     });
    // });

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
            property, name, label, type, default: defaultValue,
            values, min, max, description
        } = config;
        const controlId = property || name;
        const formGroup = document.createElement('div');
        formGroup.className = 'mb-3';
        const labelEl = document.createElement('label');
        labelEl.htmlFor = controlId;
        labelEl.className = 'form-label';

        if (label) {
            const cleanLabel = label.includes(':') ? label.substring(label.indexOf(':') + 1).trim() : label;
            labelEl.textContent = cleanLabel;

            if (description) {
                labelEl.title = description;
            } else {
                labelEl.title = `Controls the ${cleanLabel.toLowerCase()}`;
            }
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
                option.textContent = val.charAt(0).toUpperCase() + val.slice(1).replace('-', ' ');
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
                const cleanLabel = label.includes(':') ? label.substring(label.indexOf(':') + 1).trim() : label;
                checkLabel.textContent = cleanLabel;
            }
            checkGroup.appendChild(check);
            checkGroup.appendChild(checkLabel);
            formGroup.appendChild(checkGroup);
        } else if (type === 'textarea' || type === 'textfield') {
            const textarea = document.createElement('textarea');
            textarea.id = controlId;
            textarea.className = 'form-control';
            textarea.name = controlId;
            textarea.rows = (type === 'textarea') ? 10 : 3; // Give more rows for pixel art data
            textarea.textContent = defaultValue.replace(/\\n/g, '\n');
            formGroup.appendChild(textarea);

            // FIX: This block adds the link specifically for the pixelArtData control.
            if (controlId.endsWith('_pixelArtData')) {
                const toolLink = document.createElement('a');
                toolLink.href = 'https://pixelart.nolliergb.com/';
                toolLink.target = '_blank';
                toolLink.rel = 'noopener noreferrer';
                toolLink.className = 'form-text d-block mt-2';
                toolLink.innerHTML = 'Open Pixel Art Data Generator <i class="bi bi-box-arrow-up-right"></i>';
                formGroup.appendChild(toolLink);
            }

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
        let jsVars = '';
        let allKeys = [];
        // const minimize = document.getElementById('minimize-props-export')?.checked ?? false;
        const minimize = true;

        // const essentialProps = [
        //     'title', 'description', 'publisher', 'enableAnimation', 'gradType',
        //     'gradColor1', 'gradColor2', 'cycleColors', 'cycleSpeed', 'animationSpeed',
        //     'text', 'fontSize', 'frequency', 'waveCount', 'pulseDepth', 'animationMode',
        //     'strokeGradColor1', 'strokeGradColor2', 'strokeCycleColors', 'strokeAnimationSpeed', 'strokeCycleSpeed',
        //     'audioMetric', 'beatThreshold', 'audioSensitivity'
        // ];

        const essentialProps = [
            'gradType', 'gradColor1', 'gradColor2', 'animationSpeed', 'strokeGradType', 'strokeGradColor1', 'strokeGradColor2', 'strokeAnimationSpeed',
            'title', 'description', 'publisher', 'enableAnimation', 'enableSound',
            'enableAudioReactivity', 'audioMetric', 'beatThreshold', 'audioSensitivity'
        ];

        const generalValues = getControlValues();

        configStore.filter(conf => {
            const key = conf.property || conf.name;
            return key && !key.startsWith('obj');
        }).forEach(conf => {
            const key = conf.property || conf.name;
            // const isEssential = essentialProps.includes(key);
            const isEssential = true;
            if (generalValues[key] !== undefined) {
                allKeys.push(key);
                let exportValue = generalValues[key];
                const isEditable = !minimize || isEssential;

                if (isEditable) {
                    if (conf.name && !conf.property) {
                        scriptHTML += `<meta ${key}="${exportValue}" />\n`;
                    } else {
                        const attrs = [
                            `property="${conf.property}"`,
                            `label="${conf.label}"`,
                            `type="${conf.type}"`
                        ];
                        if (conf.values) attrs.push(`values="${conf.values}"`);
                        if (conf.min) attrs.push(`min="${conf.min}"`);
                        if (conf.max) attrs.push(`max="${conf.max}"`);
                        scriptHTML += `<meta ${attrs.join(' ')} default="${exportValue}" />\n`;
                    }
                } else {
                    jsVars += `const ${key} = ${JSON.stringify(exportValue)};\n`;
                }
            }
        });

        objects.forEach(obj => {
            const name = obj.name || `Object ${obj.id}`;
            const objectConfigs = configStore.filter(c => c.property && c.property.startsWith(`obj${obj.id}_`));
            const commonProps = shapePropertyMap['rectangle'];
            const validPropsForShape = shapePropertyMap[obj.shape] || commonProps;

            objectConfigs.forEach(conf => {
                const propName = conf.property.substring(conf.property.indexOf('_') + 1);
                const isEssential = essentialProps.includes(propName);

                // if (propName !== 'shape' && !validPropsForShape.includes(propName)) {
                //     return;
                // }

                // if (!isEssential) {
                //     return;
                // }

                let liveValue;

                if (propName.startsWith('gradColor')) {
                    liveValue = obj.gradient[propName.replace('gradColor', 'color')];
                } else if (propName.startsWith('strokeGradColor')) {
                    liveValue = obj.strokeGradient[propName.replace('strokeGradColor', 'color')];
                } else if (propName === 'scrollDir') {
                    liveValue = obj.scrollDirection;
                } else if (propName === 'strokeScrollDir') {
                    liveValue = obj.strokeScrollDir;
                }
                else {
                    liveValue = obj[propName];
                }

                let exportValue = liveValue;
                const propsToScale = ['x', 'y', 'width', 'height', 'innerDiameter', 'fontSize', 'lineWidth', 'strokeWidth'];

                if (conf.type === 'number') {
                    const numValue = parseFloat(liveValue) || 0;
                    if (propsToScale.includes(propName) || propName === 'pulseDepth') {
                        exportValue = Math.round(numValue / 4);
                    } else if (propName === 'textAnimationSpeed') {
                        // --- THE FIX IS HERE ---
                        // The value is now correctly divided by 4 to match the canvas scaling.
                        exportValue = Math.round(numValue / 4);
                    } else if (propName === 'animationSpeed' || propName === 'strokeAnimationSpeed') {
                        exportValue = Math.round(numValue * 10);
                    } else if (propName === 'cycleSpeed' || propName === 'strokeCycleSpeed') {
                        exportValue = Math.round(numValue * 50);
                    } else {
                        exportValue = Math.round(numValue);
                    }
                } else if (typeof liveValue === 'boolean') {
                    exportValue = String(liveValue);
                } else if (conf.type === 'textfield' && typeof liveValue === 'string') {
                    exportValue = liveValue.replace(/\n/g, '\\n');
                }

                if (exportValue === undefined) return;

                allKeys.push(conf.property);
                const isEditable = !minimize || isEssential;

                if (isEditable) {
                    conf.label = `${name}: ${conf.label.split(':').slice(1).join(':').trim()}`;
                    if (propName === 'width' && (obj.shape === 'circle' || obj.shape === 'ring')) {
                        conf.label = `${name}: Width/Outer Diameter`;
                    }

                    const attrs = [
                        `property="${conf.property}"`,
                        `label="${conf.label}"`
                    ];
                    if (conf.values) attrs.push(`values="${conf.values}"`);
                    if (conf.min) attrs.push(`min="${conf.min}"`);
                    if (conf.max) attrs.push(`max="${conf.max}"`);
                    scriptHTML += `<meta ${attrs.join(' ')} type="${conf.type}" default="${exportValue}" />\n`;
                } else {
                    jsVars += `const ${conf.property} = ${JSON.stringify(exportValue)};\n`;
                }
            });
        });

        outputScriptArea.value = scriptHTML.trim();
        return { metaTags: scriptHTML.trim(), jsVars: jsVars.trim(), allKeys: JSON.stringify(allKeys) };
    }

    /**
     * Renders the entire controls form based on the current `configStore` and `objects` state.
     * Preserves the collapsed state of panels during re-rendering.
     */
    // In main.js, replace the entire renderForm function.

    // function renderForm() {
    //     const existingTooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    //     existingTooltips.forEach(el => {
    //         const tooltip = bootstrap.Tooltip.getInstance(el);
    //         if (tooltip) tooltip.dispose();
    //     });

    //     const generalSettingsValues = {};
    //     const generalConfigs = configStore.filter(c => !(c.property || c.name).startsWith('obj'));
    //     generalConfigs.forEach(conf => {
    //         const key = conf.property || conf.name;
    //         const el = form.elements[key];
    //         if (el) {
    //             generalSettingsValues[key] = (el.type === 'checkbox') ? el.checked : el.value;
    //         }
    //     });

    //     const collapseStates = {};
    //     const generalCollapseEl = form.querySelector('#collapse-general');
    //     collapseStates.general = generalCollapseEl ? generalCollapseEl.classList.contains('show') : true;

    //     const allObjectCollapses = form.querySelectorAll('.collapse[id^="collapse-obj-"]');
    //     allObjectCollapses.forEach(el => {
    //         const fieldset = el.closest('fieldset');
    //         if (fieldset) {
    //             const id = parseInt(fieldset.dataset.objectId, 10);
    //             collapseStates[id] = el.classList.contains('show');
    //         }
    //     });

    //     form.innerHTML = '';
    //     const grouped = groupConfigs(configStore);

    //     const generalFieldset = document.createElement('fieldset');
    //     generalFieldset.className = 'border p-2 mb-3 rounded bg-body-secondary';
    //     const generalHeaderBar = document.createElement('div');
    //     generalHeaderBar.className = 'd-flex justify-content-between align-items-center w-100 px-2';
    //     const generalHeaderText = document.createElement('span');
    //     generalHeaderText.className = 'fs-5 fw-semibold';
    //     generalHeaderText.textContent = 'General Settings';
    //     generalHeaderBar.appendChild(generalHeaderText);
    //     const generalCollapseId = 'collapse-general';
    //     const generalCollapseButton = document.createElement('button');
    //     const showGeneral = collapseStates.general;
    //     generalCollapseButton.className = `btn btn-sm btn-outline-secondary ms-2 legend-button ${showGeneral ? '' : 'collapsed'} d-flex align-items-center justify-content-center p-0`;
    //     generalCollapseButton.style.width = '28px';
    //     generalCollapseButton.style.height = '28px';
    //     generalCollapseButton.type = 'button';
    //     generalCollapseButton.dataset.bsToggle = 'collapse';
    //     generalCollapseButton.dataset.bsTarget = `#${generalCollapseId}`;
    //     generalCollapseButton.setAttribute('aria-expanded', showGeneral);
    //     generalHeaderBar.appendChild(generalCollapseButton);
    //     const generalCollapseWrapper = document.createElement('div');
    //     generalCollapseWrapper.id = generalCollapseId;
    //     generalCollapseWrapper.className = `collapse p-3 ${showGeneral ? 'show' : ''}`;
    //     const generalSeparator = document.createElement('hr');
    //     generalSeparator.className = 'mt-2 mb-3';
    //     generalCollapseWrapper.appendChild(generalSeparator);

    //     if (currentProjectMetadata.creatorName) {
    //         const infoContainer = document.createElement('div');
    //         infoContainer.className = 'mb-3 small text-body-secondary';
    //         const authorEl = document.createElement('div');
    //         authorEl.innerHTML = `<strong>Author:</strong> ${currentProjectMetadata.creatorName}`;
    //         infoContainer.appendChild(authorEl);
    //         if (currentProjectMetadata.createdAt) {
    //             const dateEl = document.createElement('div');
    //             const formattedDate = currentProjectMetadata.createdAt.toLocaleDateString(undefined, {
    //                 year: 'numeric', month: 'long', day: 'numeric'
    //             });
    //             dateEl.innerHTML = `<strong>Created:</strong> ${formattedDate}`;
    //             infoContainer.appendChild(dateEl);
    //         }
    //         generalCollapseWrapper.appendChild(infoContainer);
    //     }

    //     grouped.general.forEach(conf => generalCollapseWrapper.appendChild(createFormControl(conf)));
    //     generalFieldset.appendChild(generalHeaderBar);
    //     generalFieldset.appendChild(generalCollapseWrapper);
    //     form.appendChild(generalFieldset);

    //     objects.forEach(obj => {
    //         const id = obj.id;
    //         const objectConfigs = grouped.objects[id];
    //         if (!objectConfigs) return;

    //         const objectName = obj.name || `Object ${id}`;
    //         const fieldset = document.createElement('fieldset');
    //         fieldset.className = 'border p-2 mb-3 rounded bg-body-secondary';
    //         fieldset.dataset.objectId = id;

    //         const headerBar = document.createElement('div');
    //         headerBar.className = 'd-flex align-items-center w-100 px-2';
    //         const dragHandle = document.createElement('div');
    //         dragHandle.className = 'drag-handle me-2 text-body-secondary';
    //         dragHandle.style.cursor = 'grab';
    //         dragHandle.innerHTML = '<i class="bi bi-grip-vertical"></i>';
    //         headerBar.appendChild(dragHandle);
    //         const editableArea = document.createElement('div');
    //         editableArea.className = 'editable-name-area d-flex align-items-center';
    //         const nameSpan = document.createElement('span');
    //         nameSpan.className = 'object-name fs-5 fw-semibold';
    //         nameSpan.style.minWidth = '0';
    //         nameSpan.contentEditable = true;
    //         nameSpan.dataset.id = id;
    //         nameSpan.textContent = objectName;
    //         editableArea.appendChild(nameSpan);
    //         const pencilIcon = document.createElement('i');
    //         pencilIcon.className = 'bi bi-pencil-fill ms-2';
    //         pencilIcon.addEventListener('click', (e) => {
    //             e.stopPropagation();
    //             nameSpan.focus();
    //             const range = document.createRange();
    //             const selection = window.getSelection();
    //             range.selectNodeContents(nameSpan);
    //             range.collapse(false);
    //             selection.removeAllRanges();
    //             selection.addRange(range);
    //         });
    //         editableArea.appendChild(pencilIcon);
    //         headerBar.appendChild(editableArea);
    //         const controlsGroup = document.createElement('div');
    //         controlsGroup.className = 'd-flex align-items-center flex-shrink-0 ms-auto';
    //         const lockButton = document.createElement('button');
    //         const isLocked = obj.locked || false;
    //         lockButton.className = `btn btn-sm btn-lock ${isLocked ? 'btn-warning' : 'btn-outline-secondary'} d-flex align-items-center justify-content-center p-0 ms-2`;
    //         lockButton.style.width = '28px';
    //         lockButton.style.height = '28px';
    //         lockButton.type = 'button';
    //         lockButton.dataset.id = id;
    //         lockButton.dataset.bsToggle = 'tooltip';
    //         lockButton.title = isLocked ? 'Unlock Object' : 'Lock Object';
    //         lockButton.innerHTML = `<i class="bi ${isLocked ? 'bi-lock-fill' : 'bi-unlock-fill'}"></i>`;
    //         controlsGroup.appendChild(lockButton);
    //         const dropdown = document.createElement('div');
    //         dropdown.className = 'dropdown';
    //         dropdown.innerHTML = `<button class="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center p-0" style="width: 28px; height: 28px;" type="button" data-bs-toggle="dropdown" aria-expanded="false"><i class="bi bi-list fs-5"></i></button><ul class="dropdown-menu dropdown-menu-dark"><li><a class="dropdown-item btn-duplicate" href="#" data-id="${id}"><i class="bi bi-copy me-2"></i>Duplicate</a></li><li><a class="dropdown-item btn-delete text-danger" href="#" data-id="${id}"><i class="bi bi-trash me-2"></i>Delete</a></li></ul>`;
    //         controlsGroup.appendChild(dropdown);
    //         const collapseId = `collapse-obj-${id}`;
    //         const collapseButton = document.createElement('button');
    //         const showObject = collapseStates[id] === true || selectedObjectIds.includes(id);
    //         collapseButton.className = `btn btn-sm btn-outline-secondary ms-2 legend-button ${showObject ? '' : 'collapsed'} d-flex align-items-center justify-content-center p-0`;
    //         collapseButton.style.width = '28px';
    //         collapseButton.style.height = '28px';
    //         collapseButton.type = 'button';
    //         collapseButton.dataset.bsToggle = 'collapse';
    //         collapseButton.dataset.bsTarget = `#${collapseId}`;
    //         collapseButton.setAttribute('aria-expanded', showObject);
    //         controlsGroup.appendChild(collapseButton);
    //         headerBar.appendChild(controlsGroup);

    //         const collapseWrapper = document.createElement('div');
    //         collapseWrapper.id = collapseId;
    //         collapseWrapper.className = `collapse p-3 ${showObject ? 'show' : ''}`;
    //         collapseWrapper.appendChild(document.createElement('hr'));

    //         // --- START OF FIX 1: UNIFY SPEED CONTROLS ---
    //         const groups = {
    //             'Geometry': ['shape', 'x', 'y', 'width', 'height', 'rotation', 'rotationSpeed'],
    //             'Color & Animation': ['gradType', 'gradColor1', 'gradColor2', 'useSharpGradient', 'gradientStop', 'phaseOffset', 'cycleColors', 'animationMode', 'animationSpeed', 'scrollDir'],
    //             'Sound Reactivity': ['enableAudioReactivity', 'audioTarget', 'audioMetric', 'beatThreshold', 'audioSensitivity']
    //         };
    //         // --- END OF FIX 1 ---
    //         const currentShape = obj.shape;

    //         for (const groupName in groups) {
    //             const groupContainer = document.createElement('div');
    //             groupContainer.className = 'control-group card card-body bg-body mb-3';
    //             const groupHeader = document.createElement('h6');
    //             groupHeader.className = 'fs-5 text-body-secondary border-bottom pb-1 mb-3';
    //             groupHeader.textContent = groupName;
    //             groupContainer.appendChild(groupHeader);
    //             const propsInGroup = groups[groupName];
    //             propsInGroup.forEach(propName => {
    //                 const conf = objectConfigs.find(c => c.property.endsWith(`_${propName}`));
    //                 if (conf) {
    //                     const showForGradient = obj.gradType === 'linear' || obj.gradType === 'radial';
    //                     if ((propName === 'useSharpGradient' || propName === 'gradientStop') && !showForGradient) return;

    //                     if (propName === 'phaseOffset') {
    //                         const isGrid = obj.shape === 'rectangle' && (obj.numberOfRows > 1 || obj.numberOfColumns > 1);
    //                         const isSeismic = obj.shape === 'oscilloscope' && obj.oscDisplayMode === 'seismic';
    //                         const isTetris = obj.shape === 'tetris';
    //                         const isPixelArt = obj.shape === 'pixel-art';
    //                         if (!isGrid && !isSeismic && !isTetris && !isPixelArt) return;
    //                     }

    //                     if (propName === 'animationSpeed' && currentShape === 'ring') return;
    //                     groupContainer.appendChild(createFormControl(conf));
    //                 }
    //             });
    //             if (groupContainer.children.length > 1) {
    //                 collapseWrapper.appendChild(groupContainer);
    //             }
    //         }

    //         const createSettingsGroup = (title, propList, displayCondition) => {
    //             if (!displayCondition) return;
    //             const group = document.createElement('div');
    //             group.className = 'control-group card card-body bg-body mb-3';
    //             const header = document.createElement('h6');
    //             header.className = 'fs-5 text-body-secondary border-bottom pb-1 mb-3';
    //             header.textContent = title;
    //             group.appendChild(header);
    //             objectConfigs.filter(c => propList.includes(c.property.substring(c.property.indexOf('_') + 1))).forEach(c => group.appendChild(createFormControl(c)));
    //             if (group.children.length > 1) {
    //                 collapseWrapper.appendChild(group);
    //             }
    //         };

    //         // --- START OF FIX 2: SIMPLIFY OSCILLOSCOPE STROKE ---
    //         const ringSettings = ['innerDiameter', 'numberOfSegments', 'angularWidth'];
    //         const gridSettings = ['numberOfRows', 'numberOfColumns'];
    //         const oscilloscopeSettings = ['lineWidth', 'waveType', 'frequency', 'oscDisplayMode', 'pulseDepth', 'fillShape', 'enableWaveAnimation', 'waveStyle', 'waveCount'];
    //         const tetrisSettings = ['tetrisBlockCount', 'tetrisAnimation', 'tetrisDropDelay', 'tetrisSpeed', 'tetrisBounce'];
    //         const polygonSettings = ['sides'];
    //         const starSettings = ['points', 'starInnerRadius'];
    //         const strokeSettings = ['enableStroke', 'strokeWidth', 'strokeGradType', 'strokeGradColor1', 'strokeGradColor2', 'strokeCycleColors', 'strokeScrollDir'];
    //         const radialFireSettings = ['fireSpread'];
    //         const pixelArtSettings = ['pixelArtData'];
    //         const textSubGroups = {
    //             'Text Content': ['text', 'pixelFont', 'fontSize', 'textAlign'],
    //             'Time & Date Display': ['showTime', 'showDate'],
    //             'Text Animation': ['textAnimation', 'textAnimationSpeed']
    //         };

    //         createSettingsGroup('Ring Settings', ringSettings, currentShape === 'ring');
    //         createSettingsGroup('Polygon Settings', polygonSettings, currentShape === 'polygon');
    //         createSettingsGroup('Star Settings', starSettings, currentShape === 'star');
    //         createSettingsGroup('Oscilloscope Settings', oscilloscopeSettings, currentShape === 'oscilloscope');
    //         createSettingsGroup('Grid Settings', gridSettings, currentShape === 'rectangle');
    //         createSettingsGroup('Tetris Animation Settings', tetrisSettings, currentShape === 'tetris');
    //         // This condition now hides the Stroke panel for oscilloscopes.
    //         createSettingsGroup('Stroke Settings', strokeSettings, currentShape !== 'text' && currentShape !== 'tetris' && currentShape !== 'fire' && currentShape !== 'fire-radial' && currentShape !== 'pixel-art' && currentShape !== 'oscilloscope');
    //         createSettingsGroup('Pixel Art Settings', pixelArtSettings, currentShape === 'pixel-art');
    //         createSettingsGroup('Radial Fire Settings', radialFireSettings, currentShape === 'fire-radial');
    //         // --- END OF FIX 2 ---

    //         const textGroup = document.createElement('div');
    //         textGroup.style.display = currentShape === 'text' ? 'block' : 'none';
    //         for (const subGroupName in textSubGroups) {
    //             const subGroupContainer = document.createElement('div');
    //             subGroupContainer.className = 'card card-body bg-body mb-2';
    //             const subGroupHeader = document.createElement('h6');
    //             subGroupHeader.className = 'fs-5 text-body-secondary border-bottom pb-1 mb-3';
    //             subGroupHeader.textContent = subGroupName;
    //             subGroupContainer.appendChild(subGroupHeader);
    //             const propsInSubGroup = textSubGroups[subGroupName];
    //             objectConfigs.filter(c => propsInSubGroup.includes(c.property.substring(c.property.indexOf('_') + 1))).forEach(c => subGroupContainer.appendChild(createFormControl(c)));
    //             if (subGroupContainer.children.length > 1) {
    //                 textGroup.appendChild(subGroupContainer);
    //             }
    //         }
    //         collapseWrapper.appendChild(textGroup);

    //         fieldset.appendChild(headerBar);
    //         fieldset.appendChild(collapseWrapper);
    //         form.appendChild(fieldset);
    //     });

    //     for (const key in generalSettingsValues) {
    //         const el = form.elements[key];
    //         if (el) {
    //             if (el.type === 'checkbox') {
    //                 el.checked = generalSettingsValues[key];
    //             } else {
    //                 el.value = generalSettingsValues[key];
    //             }
    //         }
    //     }

    //     updateFormValuesFromObjects();
    //     new bootstrap.Tooltip(document.body, {
    //         selector: "[data-bs-toggle='tooltip']",
    //         trigger: 'hover'
    //     });
    // }

    function renderForm() {
        const existingTooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        existingTooltips.forEach(el => {
            const tooltip = bootstrap.Tooltip.getInstance(el);
            if (tooltip) tooltip.dispose();
        });

        const generalSettingsValues = {};
        const generalConfigs = configStore.filter(c => !(c.property || c.name).startsWith('obj'));
        generalConfigs.forEach(conf => {
            const key = conf.property || conf.name;
            const el = form.elements[key];
            if (el) {
                generalSettingsValues[key] = (el.type === 'checkbox') ? el.checked : el.value;
            }
        });

        const generalCollapseEl = form.querySelector('#collapse-general');
        const generalCollapseState = generalCollapseEl ? generalCollapseEl.classList.contains('show') : true;

        const activeCollapseStates = {};
        const allObjectCollapses = form.querySelectorAll('.collapse[id^="collapse-obj-"]');
        allObjectCollapses.forEach(el => {
            const fieldset = el.closest('fieldset');
            if (fieldset) {
                const id = parseInt(fieldset.dataset.objectId, 10);
                activeCollapseStates[id] = el.classList.contains('show');
            }
        });

        const activeTab = form.querySelector('.tab-pane.show.active');
        const activeTabId = activeTab ? activeTab.id : null;
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
        const showGeneral = generalCollapseState;
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
        objects.forEach((obj, objectIndex) => {
            const id = obj.id;
            const objectConfigs = grouped.objects[id] || [];
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
            const showObject = activeCollapseStates[id] === true || selectedObjectIds.includes(id);
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
            const tabNav = document.createElement('ul');
            tabNav.className = 'nav nav-tabs';
            tabNav.id = `object-tabs-${id}`;
            tabNav.setAttribute('role', 'tablist');
            const tabContent = document.createElement('div');
            tabContent.className = 'tab-content';
            tabContent.id = `object-tab-content-${id}`;
            const controlGroupMap = {
                'Geometry': { props: ['shape', 'x', 'y', 'width', 'height', 'rotation', 'rotationSpeed', 'autoWidth', 'innerDiameter', 'numberOfSegments', 'angularWidth', 'sides', 'points', 'starInnerRadius'], icon: 'bi-box-fill' },
                'Fill & Animation': { props: ['gradType', 'gradColor1', 'gradColor2', 'cycleColors', 'cycleSpeed', 'useSharpGradient', 'gradientStop', 'animationMode', 'animationSpeed', 'scrollDir', 'phaseOffset', 'numberOfRows', 'numberOfColumns', 'textAnimationSpeed'], icon: 'bi-palette-fill' },
                'Stroke': { props: ['enableStroke', 'strokeWidth', 'strokeGradType', 'strokeGradColor1', 'strokeGradColor2', 'strokeCycleColors', 'strokeCycleSpeed', 'strokeAnimationSpeed', 'strokeScrollDir'], icon: 'bi-brush-fill' },
                'Text': { props: ['text', 'fontSize', 'textAlign', 'pixelFont', 'textAnimation', 'showTime', 'showDate'], icon: 'bi-fonts' },
                'Oscilloscope': { props: ['lineWidth', 'waveType', 'frequency', 'oscDisplayMode', 'pulseDepth', 'fillShape', 'enableWaveAnimation', 'waveStyle', 'waveCount'], icon: 'bi-graph-up-arrow' },
                'Tetris': { props: ['tetrisBlockCount', 'tetrisAnimation', 'tetrisSpeed', 'tetrisBounce'], icon: 'bi-grid-3x3-gap-fill' },
                'Fire': { props: ['fireSpread'], icon: 'bi-fire' },
                'Pixel Art': { props: ['pixelArtData'], icon: 'bi-image-fill' },
                'Audio': { props: ['enableAudioReactivity', 'audioTarget', 'audioMetric', 'beatThreshold', 'audioSensitivity', 'audioSmoothing'], icon: 'bi-mic-fill' },
            };
            const validPropsForShape = shapePropertyMap[obj.shape] || shapePropertyMap['rectangle'];
            const essentialProps = grouped.general.map(c => c.property || c.name);
            let isFirstTab = true;
            for (const groupName in controlGroupMap) {
                const groupProps = controlGroupMap[groupName].props;
                const relevantProps = objectConfigs.filter(conf => {
                    const propName = conf.property.substring(conf.property.indexOf('_') + 1);
                    const isEssential = essentialProps.includes(propName);
                    const isShapeSpecific = validPropsForShape.includes(propName);
                    const isAudioGroup = groupName === 'Audio';
                    return groupProps.includes(propName) && (isEssential || isShapeSpecific || isAudioGroup);
                });
                if (relevantProps.length > 0) {
                    const tabId = `tab-${id}-${groupName.replace(/\s/g, '-')}`;
                    const paneId = `pane-${id}-${groupName.replace(/\s/g, '-')}`;
                    const tabItem = document.createElement('li');
                    tabItem.className = 'nav-item';
                    tabItem.setAttribute('role', 'presentation');
                    const tabButton = document.createElement('button');
                    tabButton.className = `nav-link ${isFirstTab ? 'active' : ''}`;
                    tabButton.id = tabId;
                    tabButton.dataset.bsToggle = 'tab';
                    tabButton.dataset.bsTarget = `#${paneId}`;
                    tabButton.type = 'button';
                    tabButton.setAttribute('role', 'tab');
                    tabButton.setAttribute('aria-controls', paneId);
                    tabButton.setAttribute('aria-selected', isFirstTab);
                    const icon = document.createElement('i');
                    icon.className = `bi ${controlGroupMap[groupName].icon} me-2`;
                    tabButton.appendChild(icon);
                    tabButton.appendChild(document.createTextNode(groupName));
                    tabItem.appendChild(tabButton);
                    tabNav.appendChild(tabItem);
                    const pane = document.createElement('div');
                    pane.className = `tab-pane fade ${isFirstTab ? 'show active' : ''}`;
                    pane.id = paneId;
                    pane.setAttribute('role', 'tabpanel');
                    pane.setAttribute('aria-labelledby', tabId);
                    const groupCard = document.createElement('div');
                    groupCard.className = 'card card-body bg-body mb-3';
                    const groupHeader = document.createElement('h6');
                    groupHeader.className = 'text-body-secondary border-bottom pb-1 mb-3';
                    groupHeader.textContent = groupName;
                    groupCard.appendChild(groupHeader);
                    relevantProps.forEach(conf => {
                        const newControl = createFormControl(conf);
                        if (newControl) {
                            groupCard.appendChild(newControl);
                        }
                    });
                    pane.appendChild(groupCard);
                    tabContent.appendChild(pane);
                    isFirstTab = false;
                }
            }
            collapseWrapper.appendChild(tabNav);
            collapseWrapper.appendChild(tabContent);
            fieldset.appendChild(headerBar);
            fieldset.appendChild(collapseWrapper);
            form.appendChild(fieldset);
        });
        for (const key in generalSettingsValues) {
            const el = form.elements[key];
            if (el) {
                if (el.type === 'checkbox') {
                    el.checked = generalSettingsValues[key];
                } else {
                    el.value = generalSettingsValues[key];
                }
            }
        }
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

                // --- 1. Get the new visual order from the UI ---
                const fieldsets = Array.from(form.querySelectorAll('fieldset[data-object-id]'));
                const newOrderedIds = fieldsets.map(fieldset => parseInt(fieldset.dataset.objectId, 10));

                // --- 2. Reorder the live `objects` array (this part was already correct) ---
                objects.sort((a, b) => newOrderedIds.indexOf(a.id) - newOrderedIds.indexOf(b.id));

                // --- 3. Reorder the `configStore` to match the new object order (THE FIX) ---
                // Separate general configs from object-specific ones
                const generalConfigs = configStore.filter(c => !(c.property || '').startsWith('obj'));
                const objectConfigs = configStore.filter(c => (c.property || '').startsWith('obj'));

                // Group all object configs by their ID
                const configsById = {};
                objectConfigs.forEach(conf => {
                    const match = conf.property.match(/^obj(\d+)_/);
                    if (match) {
                        const id = parseInt(match[1], 10);
                        if (!configsById[id]) {
                            configsById[id] = [];
                        }
                        configsById[id].push(conf);
                    }
                });

                // Rebuild the object configs list in the new order
                const reorderedObjectConfigs = [];
                newOrderedIds.forEach(id => {
                    if (configsById[id]) {
                        reorderedObjectConfigs.push(...configsById[id]);
                    }
                });

                // Combine them back into the main configStore
                configStore = [...generalConfigs, ...reorderedObjectConfigs];

                // --- 4. Update the application state ---
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
        const copyBtn = document.getElementById('copy-props-btn');
        const pasteBtn = document.getElementById('paste-props-btn');

        singleSelectButtons.forEach(btn => btn.disabled = selectedObjectIds.length === 0);
        multiSelectButtons.forEach(btn => {
            if (btn.id !== 'match-text-size-btn') {
                btn.disabled = selectedObjectIds.length < 2;
            }
        });

        if (copyBtn) {
            copyBtn.disabled = selectedObjectIds.length === 0;
        }
        if (pasteBtn) {
            pasteBtn.disabled = !propertyClipboard || selectedObjectIds.length === 0;
        }

        if (matchTextSizeBtn) {
            const selected = selectedObjectIds.map(id => objects.find(o => o.id === id)).filter(o => o);
            const textObjects = selected.filter(obj => obj.shape === 'text');
            const gridObjects = selected.filter(obj => obj.shape === 'rectangle' && (obj.numberOfRows > 1 || obj.numberOfColumns > 1));

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

    // function drawFrame(audioData = {}) { // <-- Add audioData parameter
    //     ctx.fillStyle = 'black';
    //     ctx.fillRect(0, 0, canvas.width, canvas.height);

    //     const animationEnabled = getControlValues().enableAnimation;
    //     const soundEnabled = getControlValues().enableSound

    //     for (let i = objects.length - 1; i >= 0; i--) {
    //         const obj = objects[i];
    //         if (obj instanceof Shape) {
    //             if (animationEnabled) {
    //                 obj.updateAnimationState(audioData); // <-- Pass audioData here
    //             }
    //             obj.draw(selectedObjectIds.includes(obj.id));
    //         } else {
    //             console.error('Invalid object in objects array:', obj);
    //         }
    //     }

    //     if (selectedObjectIds.length > 0) {
    //         selectedObjectIds.forEach(id => {
    //             const obj = objects.find(o => o.id === id);
    //             if (obj && obj instanceof Shape) {
    //                 obj.drawSelectionUI();
    //             }
    //         });
    //     }

    //     drawSnapLines(snapLines);
    // }

    function drawFrame(audioData = {}) {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const isAnimating = getControlValues().enableAnimation;

        objects.forEach(obj => {
            const shouldDraw = obj.dirty || isAnimating;

            if (shouldDraw) {
                if (isAnimating) {
                    obj.updateAnimationState(audioData);
                }
                obj.draw(selectedObjectIds.includes(obj.id));
                obj.dirty = false;
            }
        });

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

    // function animate(timestamp) {
    //     requestAnimationFrame(animate);

    //     const now = timestamp;
    //     const elapsed = now - then;

    //     if (elapsed > fpsInterval) {
    //         then = now - (elapsed % fpsInterval);

    //         let audioData = {};
    //         if (isAudioSetup) {
    //             // If audio is running, get real metrics
    //             audioData = getAudioMetrics();
    //         } else {
    //             // Otherwise, use the mock data as a fallback
    //             const time = now / 1000;
    //             audioData = {
    //                 bass: (Math.sin(time * 2) + 1) / 2,
    //                 mids: (Math.sin(time * 1.5 + 1) + 1) / 2,
    //                 highs: (Math.sin(time * 3 + 2) + 1) / 2,
    //                 volume: (Math.sin(time) + 1) / 2
    //             };
    //         }

    //         drawFrame(audioData); // Pass the data (real or mock) to the draw function
    //     }
    // }
    function animate(timestamp) {
        requestAnimationFrame(animate);

        const now = timestamp;
        const elapsed = now - then;

        if (elapsed > fpsInterval) {
            then = now - (elapsed % fpsInterval);

            // Get the current state of the 'Enable Sound' checkbox from the form.
            const generalValues = getControlValues();
            const soundEnabled = generalValues.enableSound;

            let audioData = {};

            // Check if audio is enabled AND if the setup has been completed.
            if (soundEnabled && isAudioSetup) {
                // Use real audio metrics from the Web Audio API.
                audioData = getAudioMetrics();
            } else {
                // Otherwise, use the mock data as a fallback.
                const time = now / 1000;
                audioData = {
                    bass: (Math.sin(time * 2) + 1) / 2,
                    mids: (Math.sin(time * 1.5 + 1) + 1) / 2,
                    highs: (Math.sin(time * 3 + 2) + 1) / 2,
                    volume: (Math.sin(time) + 1) / 2
                };
            }

            drawFrame(audioData);
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
        // The complete list of properties that need to be scaled up by 4x.
        const propsToScale = ['x', 'y', 'width', 'height', 'innerDiameter', 'fontSize', 'lineWidth', 'strokeWidth', 'pulseDepth'];

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

                // Scale the appropriate properties from their UI value to the internal live value.
                if (propsToScale.includes(key)) {
                    value *= 4;
                }

                // Correctly route properties to their nested objects.
                if (key.startsWith('gradColor')) {
                    if (!values.gradient) values.gradient = {};
                    values.gradient[key.replace('grad', '').toLowerCase()] = value;
                } else if (key.startsWith('strokeGradColor')) {
                    if (!values.strokeGradient) values.strokeGradient = {};
                    values.strokeGradient[key.replace('strokeGradColor', 'color').toLowerCase()] = value;
                } else if (key === 'scrollDir') {
                    values.scrollDirection = value;
                } else if (key === 'strokeScrollDir') {
                    values.strokeScrollDir = value;
                } else {
                    values[key] = value;
                }
            }
        });

        // Scale down the speed values for the live object.
        values.cycleSpeed = (values.cycleSpeed || 0) / 50.0;
        values.animationSpeed = (values.animationSpeed || 0) / 10.0;
        values.strokeCycleSpeed = (values.strokeCycleSpeed || 0) / 50.0;
        values.strokeAnimationSpeed = (values.strokeAnimationSpeed || 0) / 10.0;
        // Note: textAnimationSpeed is a plain value and is not scaled.

        if (values.shape === 'ring') {
            values.height = values.width;
        }

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

            // If the object's rotation is paused, handle the speed update separately.
            if (obj._pausedRotationSpeed !== null && newProps.rotationSpeed !== undefined) {
                obj._pausedRotationSpeed = newProps.rotationSpeed; // Update the stored speed
                delete newProps.rotationSpeed; // Prevent overwriting the live (paused) speed
            }

            obj.update(newProps);
        });
        generateOutputScript();
    }

    /**
     * Reads all properties from the 'objects' array and updates the form inputs to match.
     */
    function updateFormValuesFromObjects() {
        // The complete list of properties that need to be scaled down by 4x for the UI.
        const propsToScale = ['x', 'y', 'width', 'height', 'innerDiameter', 'fontSize', 'lineWidth', 'strokeWidth', 'pulseDepth'];

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

            Object.keys(obj).forEach(key => {
                if (key === 'rotationSpeed' && obj._pausedRotationSpeed !== null) {
                    return;
                }
                if (propsToScale.includes(key)) {
                    updateField(key, obj[key] / 4);
                } else if (key === 'gradient') {
                    updateField('gradColor1', obj.gradient.color1);
                    updateField('gradColor2', obj.gradient.color2);
                } else if (key === 'strokeGradient') {
                    updateField('strokeGradColor1', obj.strokeGradient.color1);
                    updateField('strokeGradColor2', obj.strokeGradient.color2);
                } else if (key === 'animationSpeed' || key === 'strokeAnimationSpeed') {
                    // FIX: textAnimationSpeed is no longer incorrectly scaled here.
                    updateField(key, obj[key] * 10);
                } else if (key === 'cycleSpeed' || key === 'strokeCycleSpeed') {
                    updateField(key, obj[key] * 50);
                } else if (key === 'scrollDirection') {
                    updateField('scrollDir', obj.scrollDirection);
                } else if (key === 'strokeScrollDir') {
                    updateField('strokeScrollDir', obj.strokeScrollDir);
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
    function createInitialObjects(orderedIds = null) {
        const grouped = groupConfigs(configStore);
        const initialStates = [];
        const propsToScale = ['x', 'y', 'width', 'height', 'innerDiameter', 'fontSize'];

        // --- FIX: Use the provided order, or fall back to the default order ---
        const idsToProcess = orderedIds || Object.keys(grouped.objects);

        idsToProcess.forEach(id => {
            if (!grouped.objects[id]) return; // Ensure the config for this ID exists

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

            propsToScale.forEach(prop => {
                if (config[prop] !== undefined) {
                    config[prop] *= 4;
                }
            });

            config.cycleSpeed = (config.cycleSpeed || 0) / 50.0;
            config.animationSpeed = (config.animationSpeed || 0) / 10.0;
            if (config.shape === 'ring' || config.shape === 'circle') {
                config.height = config.width;
            }
            initialStates.push(config);
        });

        objects = initialStates.map(state => new Shape({ ...state, ctx }));
    }

    /**
     * Loads a workspace state from a provided object, ensuring all properties,
     * including complex shapes and strokes, are correctly applied.
     * @param {object} workspace - The workspace object to load.
     */
    // function loadWorkspace(workspace) {
    //     currentProjectMetadata = {
    //         creatorName: workspace.creatorName,
    //         createdAt: (workspace.createdAt && workspace.createdAt.toDate) ? workspace.createdAt.toDate() : workspace.createdAt
    //     };

    //     const loadedConfigs = workspace.configs;
    //     const objectIds = [...new Set(
    //         loadedConfigs
    //             .map(c => (c.property || '').match(/^obj(\d+)_/))
    //             .filter(match => match)
    //             .map(match => parseInt(match[1], 10))
    //     )];

    //     const mergedConfigStore = loadedConfigs.filter(c => !(c.property || '').startsWith('obj'));

    //     objectIds.forEach(id => {
    //         const fullDefaultConfig = getDefaultObjectConfig(id);
    //         const savedObjectConfigs = loadedConfigs.filter(c => c.property && c.property.startsWith(`obj${id}_`));
    //         const savedPropsMap = new Map(savedObjectConfigs.map(c => [c.property, c]));

    //         // This is the updated merging logic
    //         const mergedObjectConfigs = fullDefaultConfig.map(defaultConf => {
    //             if (savedPropsMap.has(defaultConf.property)) {
    //                 const savedConf = savedPropsMap.get(defaultConf.property);

    //                 // Start with the up-to-date default configuration...
    //                 const mergedConf = { ...defaultConf };

    //                 // ...then override it with the user's saved data.
    //                 // This preserves the user's selection and custom name...
    //                 if (savedConf.hasOwnProperty('default')) {
    //                     mergedConf.default = savedConf.default;
    //                 }
    //                 if (savedConf.hasOwnProperty('label')) {
    //                     mergedConf.label = savedConf.label;
    //                 }
    //                 // ...while always using the latest 'values', 'min', 'max', etc. from the default.
    //                 return mergedConf;
    //             }
    //             return defaultConf;
    //         });
    //         mergedConfigStore.push(...mergedObjectConfigs);
    //     });

    //     configStore = mergedConfigStore;

    //     createInitialObjects(objectIds);

    //     if (workspace.objects) {
    //         workspace.objects.forEach(savedObj => {
    //             const obj = objects.find(o => o.id === savedObj.id);
    //             if (obj) {
    //                 obj.name = savedObj.name;
    //                 obj.locked = savedObj.locked || false;
    //             }
    //         });
    //     }

    //     renderForm();

    //     for (const config of configStore) {
    //         const key = config.property || config.name;
    //         const el = form.elements[key];
    //         if (el) {
    //             if (el.type === 'checkbox') {
    //                 el.checked = (config.default === true || config.default === 'true');
    //             } else {
    //                 el.value = config.default;
    //             }
    //             if (el.type === 'number') {
    //                 const slider = document.getElementById(`${el.id}_slider`);
    //                 if (slider) slider.value = el.value;
    //             }
    //             if (el.type === 'color') {
    //                 const hexInput = document.getElementById(`${el.id}_hex`);
    //                 if (hexInput) hexInput.value = el.value;
    //             }
    //         }
    //     }
    //     if (workspace.creatorName) {
    //         const publisherInput = form.elements['publisher'];
    //         if (publisherInput) publisherInput.value = workspace.creatorName;
    //     }

    //     objects.forEach(obj => {
    //         const finalProps = getFormValuesForObject(obj.id);
    //         delete finalProps.shape;
    //         obj.update(finalProps);
    //     });

    //     currentProjectDocId = workspace.docId || null;
    //     updateShareButtonState();
    //     generateOutputScript();
    //     drawFrame();

    //     if (workspace.docId) {
    //         const newUrl = `${window.location.pathname}?effectId=${workspace.docId}`;
    //         const effectTitle = workspace.name || "SRGB Effect Builder";
    //         window.history.pushState({ effectId: workspace.docId }, effectTitle, newUrl);
    //     }
    // }
    function loadWorkspace(workspace) {
        currentProjectMetadata = {
            creatorName: workspace.creatorName,
            createdAt: (workspace.createdAt && workspace.createdAt.toDate) ? workspace.createdAt.toDate() : workspace.createdAt
        };

        const loadedConfigs = workspace.configs;
        const objectIds = [...new Set(
            loadedConfigs
                .map(c => (c.property || '').match(/^obj(\d+)_/))
                .filter(match => match)
                .map(match => parseInt(match[1], 10))
        )];

        // --- START OF FIX ---
        // 1. Get the default general configs from the template.
        const template = document.getElementById('initial-config');
        const defaultMetaElements = Array.from(template.content.querySelectorAll('meta'));
        const defaultConfigs = defaultMetaElements.map(parseMetaToConfig);
        const defaultGeneralConfigs = defaultConfigs.filter(c => !(c.property || c.name).startsWith('obj'));
        const defaultObjectConfigs = defaultConfigs.filter(c => (c.property || c.name).startsWith('obj'));

        // 2. Separate loaded configs into general and object-specific.
        const loadedGeneralConfigs = loadedConfigs.filter(c => !(c.property || c.name).startsWith('obj'));
        const loadedObjectConfigs = loadedConfigs.filter(c => (c.property || c.name).startsWith('obj'));

        // 3. Create a merged list for general configs, prioritizing loaded configs.
        const mergedGeneralConfigs = defaultGeneralConfigs.map(defaultConf => {
            const loadedConf = loadedGeneralConfigs.find(c => (c.property || c.name) === (defaultConf.property || defaultConf.name));
            return loadedConf || defaultConf;
        });

        // 4. Create a map of default object properties for a full set of defaults.
        const defaultObjectProps = {};
        objectIds.forEach(id => {
            const defaults = getDefaultObjectConfig(id);
            defaults.forEach(c => defaultObjectProps[c.property] = c);
        });

        // 5. Merge the loaded object properties with the defaults.
        const mergedObjectConfigs = loadedObjectConfigs.map(loadedConf => {
            const defaultConf = defaultObjectProps[loadedConf.property];
            if (defaultConf) {
                return { ...defaultConf, default: loadedConf.default, label: loadedConf.label };
            }
            return loadedConf;
        });

        // 6. Combine all merged configs into the final configStore.
        configStore = [...mergedGeneralConfigs, ...mergedObjectConfigs];
        // --- END OF FIX ---

        createInitialObjects(objectIds);

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
        if (workspace.creatorName) {
            const publisherInput = form.elements['publisher'];
            if (publisherInput) publisherInput.value = workspace.creatorName;
        }

        objects.forEach(obj => {
            const finalProps = getFormValuesForObject(obj.id);
            delete finalProps.shape;
            obj.update(finalProps);
        });

        currentProjectDocId = workspace.docId || null;
        updateShareButtonState();
        generateOutputScript();
        drawFrame();

        if (workspace.docId) {
            const newUrl = `${window.location.pathname}?effectId=${workspace.docId}`;
            const effectTitle = workspace.name || "SRGB Effect Builder";
            window.history.pushState({ effectId: workspace.docId }, effectTitle, newUrl);
        }
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
            // Geometry & Transform
            { property: `obj${newId}_shape`, label: `Object ${newId}: Shape`, type: 'combobox', default: 'rectangle', values: 'rectangle,circle,ring,polygon,star,text,oscilloscope,tetris,fire,fire-radial,pixel-art', description: 'The basic shape of the object.' },
            { property: `obj${newId}_x`, label: `Object ${newId}: X Position`, type: 'number', default: '10', min: '0', max: '320' },
            { property: `obj${newId}_y`, label: `Object ${newId}: Y Position`, type: 'number', default: '10', min: '0', max: '200' },
            { property: `obj${newId}_width`, label: `Object ${newId}: Width`, type: 'number', default: '50', min: '2', max: '320' },
            { property: `obj${newId}_height`, label: `Object ${newId}: Height`, type: 'number', default: '38', min: '2', max: '200' },
            { property: `obj${newId}_rotation`, label: `Object ${newId}: Rotation`, type: 'number', default: '0', min: '-360', max: '360', description: 'The static rotation of the object in degrees.' },

            // Fill Style & Animation
            { property: `obj${newId}_gradType`, label: `Object ${newId}: Fill Type`, type: 'combobox', default: 'linear', values: 'solid,linear,radial,alternating,random,rainbow,rainbow-radial', description: 'The type of color fill or gradient to use.' },
            { property: `obj${newId}_useSharpGradient`, label: `Object ${newId}: Use Sharp Gradient`, type: 'boolean', default: 'false', description: 'If checked, creates a hard line between colors in Linear/Radial gradients instead of a smooth blend.' },
            { property: `obj${newId}_gradientStop`, label: `Object ${newId}: Gradient Stop %`, type: 'number', default: '50', min: '0', max: '100', description: 'For sharp gradients, this is the percentage width of the primary color band.' },
            { property: `obj${newId}_gradColor1`, label: `Object ${newId}: Color 1`, type: 'color', default: '#00ff00' },
            { property: `obj${newId}_gradColor2`, label: `Object ${newId}: Color 2`, type: 'color', default: '#d400ff' },
            { property: `obj${newId}_cycleColors`, label: `Object ${newId}: Cycle Colors`, type: 'boolean', default: 'false', description: 'Animates the colors by cycling through the color spectrum.' },
            { property: `obj${newId}_animationMode`, label: `Object ${newId}: Animation Mode`, type: 'combobox', values: 'loop,bounce,bounce-reversed,bounce-random', default: 'loop', description: 'Determines how the gradient animation behaves.' },
            { property: `obj${newId}_animationSpeed`, label: `Object ${newId}: Animation Speed`, type: 'number', default: '2', min: '0', max: '100', description: 'Master speed for gradient scroll, random color flicker, and oscilloscope movement.' },
            { property: `obj${newId}_rotationSpeed`, label: `Object ${newId}: Rotation Speed`, type: 'number', default: '0', min: '-100', max: '100', description: 'The continuous rotation speed of the object. Overrides static rotation.' },
            { property: `obj${newId}_scrollDir`, label: `Object ${newId}: Scroll Direction`, type: 'combobox', values: 'right,left,up,down', default: 'right', description: 'The direction the gradient animation moves.' },
            { property: `obj${newId}_phaseOffset`, label: `Object ${newId}: Phase Offset`, type: 'number', default: '10', min: '0', max: '100', description: 'Offsets the gradient animation for each item in a grid, seismic wave, or Tetris block, creating a cascading effect.' },

            // Shape-Specific Properties
            { property: `obj${newId}_sides`, label: `Object ${newId}: Sides`, type: 'number', default: '6', min: '3', max: '50', description: '(Polygon) The number of sides for the polygon.' },
            { property: `obj${newId}_points`, label: `Object ${newId}: Points`, type: 'number', default: '5', min: '3', max: '50', description: '(Star) The number of points on the star.' },
            { property: `obj${newId}_starInnerRadius`, label: `Object ${newId}: Inner Radius %`, type: 'number', default: '50', min: '1', max: '99', description: '(Star) The size of the inner points as a percentage of the outer radius.' },
            { property: `obj${newId}_innerDiameter`, label: `Object ${newId}: Inner Diameter`, type: 'number', default: '25', min: '1', max: '318', description: '(Ring) The diameter of the inner hole of the ring.' },
            { property: `obj${newId}_numberOfSegments`, label: `Object ${newId}: Segments`, type: 'number', default: '12', min: '1', max: '50', description: '(Ring) The number of individual segments that make up the ring.' },
            { property: `obj${newId}_angularWidth`, label: `Object ${newId}: Segment Angle`, type: 'number', min: '1', max: '360', default: '20', description: '(Ring) The width of each ring segment, in degrees.' },
            { property: `obj${newId}_numberOfRows`, label: `Object ${newId}: Number of Rows`, type: 'number', default: '1', min: '1', max: '100', description: '(Grid) The number of vertical cells in the grid.' },
            { property: `obj${newId}_numberOfColumns`, label: `Object ${newId}: Number of Columns`, type: 'number', default: '1', min: '1', max: '100', description: '(Grid) The number of horizontal cells in the grid.' },
            { property: `obj${newId}_text`, label: `Object ${newId}: Text`, type: 'textfield', default: 'New Text' },
            { property: `obj${newId}_fontSize`, label: `Object ${newId}: Font Size`, type: 'number', default: '15', min: '2', max: '100' },
            { property: `obj${newId}_textAlign`, label: `Object ${newId}: Justification`, type: 'combobox', values: 'left,center,right', default: 'center' },
            { property: `obj${newId}_pixelFont`, label: `Object ${newId}: Pixel Font Style`, type: 'combobox', values: 'small,large', default: 'small' },
            { property: `obj${newId}_textAnimation`, label: `Object ${newId}: Text Animation`, type: 'combobox', values: 'none,marquee,typewriter,wave', default: 'none' },
            { property: `obj${newId}_textAnimationSpeed`, label: `Object ${newId}: Animation Speed`, type: 'number', min: '1', max: '100', default: '10' },
            { property: `obj${newId}_showTime`, label: `Object ${newId}: Show Current Time`, type: 'boolean', default: 'false', description: 'Overrides the text content to show the current time.' },
            { property: `obj${newId}_showDate`, label: `Object ${newId}: Show Current Date`, type: 'boolean', default: 'false', description: 'Overrides the text content to show the current date.' },
            { property: `obj${newId}_lineWidth`, label: `Object ${newId}: Line Width`, type: 'number', default: '1', min: '1', max: '20' },
            { property: `obj${newId}_waveType`, label: `Object ${newId}: Wave Type`, type: 'combobox', default: 'sine', values: 'sine,square,sawtooth,triangle,earthquake' },
            { property: `obj${newId}_frequency`, label: `Object ${newId}: Frequency / Wave Peaks`, type: 'number', default: '5', min: '1', max: '50' },
            { property: `obj${newId}_oscDisplayMode`, label: `Object ${newId}: Display Mode`, type: 'combobox', default: 'linear', values: 'linear,radial,seismic' },
            { property: `obj${newId}_pulseDepth`, label: `Object ${newId}: Pulse Depth`, type: 'number', default: '50', min: '0', max: '100', description: 'The intensity of the wave\'s amplitude or pulse effect.' },
            { property: `obj${newId}_fillShape`, label: `Object ${newId}: Fill Shape`, type: 'boolean', default: 'false', description: 'For linear oscilloscopes, fills the area under the wave.' },
            { property: `obj${newId}_enableWaveAnimation`, label: `Object ${newId}: Enable Wave Animation`, type: 'boolean', default: 'true', description: 'Toggles the movement of the oscilloscope wave.' },
            { property: `obj${newId}_waveStyle`, label: `Object ${newId}: Seismic Wave Style`, type: 'combobox', default: 'wavy', values: 'wavy,round' },
            { property: `obj${newId}_waveCount`, label: `Object ${newId}: Seismic Wave Count`, type: 'number', default: '5', min: '1', max: '20' },
            { property: `obj${newId}_tetrisBlockCount`, label: `Object ${newId}: Block Count`, type: 'number', default: '10', min: '1', max: '50', description: '(Tetris) The number of blocks in the animation cycle.' },
            { property: `obj${newId}_tetrisAnimation`, label: `Object ${newId}: Drop Physics`, type: 'combobox', values: 'gravity,linear,gravity-fade,fade-in-stack', default: 'gravity', description: '(Tetris) The physics governing how the blocks fall. Gravity-fade removes blocks as they settle.' },
            { property: `obj${newId}_tetrisSpeed`, label: `Object ${newId}: Drop Speed`, type: 'number', default: '5', min: '1', max: '100', description: '(Tetris) The speed of the drop animation.' },
            { property: `obj${newId}_tetrisBounce`, label: `Object ${newId}: Bounce Factor`, type: 'number', default: '50', min: '0', max: '90', description: '(Tetris) How much the blocks bounce on impact. 0 is no bounce.' },
            { property: `obj${newId}_fireSpread`, label: `Object ${newId}: Fire Spread %`, type: 'number', default: '100', min: '1', max: '100', description: '(fire-radial) Controls how far the flames spread from the center.' },
            { property: `obj${newId}_enableStroke`, label: `Object ${newId}: Enable Stroke`, type: 'boolean', default: 'false' },
            { property: `obj${newId}_strokeWidth`, label: `Object ${newId}: Stroke Width`, type: 'number', default: '2', min: '1', max: '50' },
            { property: `obj${newId}_strokeGradType`, label: `Object ${newId}: Stroke Type`, type: 'combobox', default: 'solid', values: 'solid,linear,radial,rainbow,rainbow-radial' },
            { property: `obj${newId}_strokeGradColor1`, label: `Object ${newId}: Stroke Color 1`, type: 'color', default: '#FFFFFF' },
            { property: `obj${newId}_strokeGradColor2`, label: `Object ${newId}: Stroke Color 2`, type: 'color', default: '#000000' },
            { property: `obj${newId}_strokeCycleColors`, label: `Object ${newId}: Cycle Stroke Colors`, type: 'boolean', default: 'false' },
            { property: `obj${newId}_strokeScrollDir`, label: `Object ${newId}: Stroke Scroll Direction`, type: 'combobox', default: 'right', values: 'right,left,up,down' },
            { property: `obj${newId}_enableAudioReactivity`, label: `Object ${newId}: Enable Sound Reactivity`, type: 'boolean', default: 'false', description: 'Enables the object to react to sound.' },
            { property: `obj${newId}_audioTarget`, label: `Object ${newId}: Reactive Property`, type: 'combobox', default: 'Flash', values: 'none,Flash,Size,Rotation', description: 'Which property of the object will be affected by the sound.' },
            { property: `obj${newId}_audioMetric`, label: `Object ${newId}: Audio Metric`, type: 'combobox', default: 'volume', values: 'volume,bass,mids,highs', description: 'Which part of the audio spectrum to react to.' },
            { property: `obj${newId}_beatThreshold`, label: `Object ${newId}: Beat Threshold`, type: 'number', default: '30', min: '1', max: '100', description: 'Sensitivity for beat detection. Higher values are MORE sensitive. Default is 30.' },
            { property: `obj${newId}_audioSensitivity`, label: `Object ${newId}: Sensitivity`, type: 'number', default: '50', min: '0', max: '200', description: 'How strongly the object reacts to the audio metric.' },
            { property: `obj${newId}_audioSmoothing`, label: `Object ${newId}: Smoothing`, type: 'number', default: '50', min: '0', max: '99', description: 'Smooths out the reaction to prevent flickering. Higher values are smoother.' },
            { property: `obj${newId}_autoWidth`, label: `Object ${newId}: Auto-Width`, type: 'boolean', default: 'false', description: 'For text objects, automatically sets the object\'s width to the width of the text.' },
        ];
    }

    function getLocalDateFromUTC(dateUTC) {
        const offsetInMs = dateUTC.getTimezoneOffset() * 60 * 1000;
        return new Date(dateUTC.getTime() - offsetInMs);
    }

    function serializeFontData(fontData, varName) {
        return 'const ' + varName + ' = ' + JSON.stringify(fontData) + ';';
    }

    async function exportFile() {
        const exportButton = document.getElementById('export-btn');
        exportButton.disabled = true;
        exportButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Preparing...';

        try {
            updateObjectsFromForm();
            const { metaTags, jsVars, allKeys } = generateOutputScript();
            const effectTitle = getControlValues()['title'] || 'MyEffect';
            const thumbnailDataUrl = generateThumbnail(document.getElementById('signalCanvas'));
            const safeFilename = effectTitle.replace(/[\s\/\\?%*:|"<>]/g, '_');

            const styleContent =
                '        canvas { width: 100%; height: 100%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: #000000; }\n' +
                '        body { background-color: #000000; overflow: hidden; margin: 0; }\n';

            const bodyContent = '<body><canvas id="signalCanvas"></canvas></body>';

            // --- START OF DEFINITIVE FIX ---
            // This new logic cleanly converts all necessary code to strings without manipulation.
            const shapeClasses = [
                Shape.toString(),
                `
    class ExportedShape extends Shape {
        constructor(config) {
            const scaledConfig = { ...config };
            // We no longer need to scale props here as it's handled during object creation.
            super(scaledConfig);
        }
        _applyAudioReactivity(audioData) {
            // This directly calls the SignalRGB-specific logic.
            (${srgb_applyAudioReactivity.toString()}).call(this, audioData);
        }
    }
                `
            ].join('\n\n');
            // --- END OF DEFINITIVE FIX ---

            const exportedScript = `
    document.addEventListener('DOMContentLoaded', function () {
        const canvas = document.getElementById('signalCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = 320; // Use full resolution for export
        canvas.height = 200;
        let objects = [];
        
        ${jsVars}

        let gradientSpeedMultiplier = ${EXPORT_GRADIENT_SPEED_MULTIPLIER};
        let shapeAnimationSpeedMultiplier = ${EXPORT_SHAPE_ANIMATION_SPEED_MULTIPLIER};
        let seismicAnimationSpeedMultiplier = ${EXPORT_SEISMIC_ANIMATION_SPEED_MULTIPLIER};
        let tetrisSpeedDivisor = ${EXPORT_TETRIS_SPEED_DIVISOR};

        const hexToHsl = ${hexToHsl.toString()};
        const hslToHex = ${hslToHex.toString()};
        const getSignalRGBAudioMetrics = ${getSignalRGBAudioMetrics.toString()};
        const srgb_applyAudioReactivity = ${srgb_applyAudioReactivity.toString()};
        
        const FONT_DATA_4PX = ${JSON.stringify(FONT_DATA_4PX)};
        const FONT_DATA_5PX = ${JSON.stringify(FONT_DATA_5PX)};
        const drawPixelText = ${drawPixelText.toString()};
        const lerpColor = ${lerpColor.toString()};
        const getPatternColor = ${getPatternColor.toString()};
        
        ${shapeClasses}

        let fps = 50;
        let fpsInterval;
        let then;

        const allPropKeys = ${JSON.parse(JSON.stringify(allKeys))};

        function createInitialObjects() {
            if (allPropKeys.length === 0) return;
            
            const uniqueIds = [...new Set(allPropKeys.map(p => {
                if (!p.startsWith('obj')) return null;
                const end = p.indexOf('_');
                if (end <= 3) return null;
                const idString = p.substring(3, end);
                const id = parseInt(idString, 10);
                return isNaN(id) ? null : String(id);
            }).filter(id => id !== null))];
            
            objects = uniqueIds.map(id => {
                const config = { id: parseInt(id), ctx: ctx, gradient: {}, strokeGradient: {} };
                const prefix = 'obj' + id + '_';
                
                allPropKeys.filter(p => p.startsWith(prefix)).forEach(key => {
                    const propName = key.substring(prefix.length);
                    try {
                        let value = eval(key);
                        if (value === "true") value = true;
                        if (value === "false") value = false;

                        if (propName.startsWith('gradColor')) {
                            config.gradient[propName.replace('grad', '').toLowerCase()] = value;
                        } else if (propName.startsWith('strokeGradColor')) {
                            config.strokeGradient[propName.replace('strokeGradColor', 'color').toLowerCase()] = value;
                        } else if (propName === 'scrollDir') {
                            config.scrollDirection = value;
                        } else if (propName === 'strokeScrollDir') {
                            config.strokeScrollDir = value;
                        } else {
                            config[propName] = value;
                        }
                    } catch (e) {}
                });
                
                config.animationSpeed = (config.animationSpeed / 4 || 0) / 10.0;
                
                return new ExportedShape(config);
            });
        }

        function drawFrame() {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            let shouldAnimate = false;
            try { shouldAnimate = eval('enableAnimation') == true; } catch(e) {}
            
            const audioData = getSignalRGBAudioMetrics();

            objects.forEach(obj => {
                const prefix = 'obj' + obj.id + '_';
                const propsToUpdate = { gradient: {}, strokeGradient: {} };

                allPropKeys.filter(p => p.startsWith(prefix)).forEach(key => {
                    const propName = key.substring(prefix.length);
                    try {
                        let value = eval(key);
                        if (value === "true") value = true;
                        if (value === "false") value = false;

                        if (propName.startsWith('gradColor')) {
                            propsToUpdate.gradient[propName.replace('grad', '').toLowerCase()] = value;
                        } else if (propName.startsWith('strokeGradColor')) {
                            propsToUpdate.strokeGradient[propName.replace('strokeGradColor', 'color').toLowerCase()] = value;
                        } else if (propName === 'scrollDir') {
                            propsToUpdate.scrollDirection = value;
                        } else if (propName === 'strokeScrollDir') {
                            propsToUpdate.strokeScrollDir = value;
                        } else if (propName === 'animationSpeed') {
                            propsToUpdate.animationSpeed = (value || 0) / 10.0;
                        } else {
                            propsToUpdate[propName] = value;
                        }
                    } catch (e) {}
                });

                obj.update(propsToUpdate);

                if (shouldAnimate) {
                    obj.updateAnimationState(audioData);
                }
            });

            for (let i = objects.length - 1; i >= 0; i--) {
                objects[i].draw(false);
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

        // This listener now only handles live, non-destructive updates to the canvas.
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

    document.addEventListener('keydown', (e) => {
        const target = e.target;

        // --- THE FIX IS HERE ---
        // This check is now more comprehensive. It stops hotkeys from firing
        // if the user is focused on ANY input, textarea, or editable element.
        const isInputFocused = target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable;

        if (isInputFocused) {
            // If the user is typing in any form field, do not trigger global hotkeys.
            return;
        }

        // Handle keyboard movement for selected objects
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
                e.preventDefault();
                updateFormValuesFromObjects();
                drawFrame();
                debouncedRecordHistory();
            }
        }

        // Handle Delete and Backspace keys for selected objects
        if ((e.key === 'Delete') && selectedObjectIds.length > 0) {
            e.preventDefault();
            deleteObjects([...selectedObjectIds]);
        }

        // Handle Undo and Redo
        if (e.ctrlKey || e.metaKey) {
            if (e.key.toLowerCase() === 'z') {
                e.preventDefault();
                appHistory.undo();
            } else if (e.key.toLowerCase() === 'y') {
                e.preventDefault();
                appHistory.redo();
            }
        }
    });;


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
     */
    function syncConfigStoreWithState() {
        const currentValues = getControlValues();

        configStore.forEach(conf => {
            const key = conf.property || conf.name;
            const isObjectProp = key.startsWith('obj');

            if (!isObjectProp) {
                if (currentValues[key] !== undefined) {
                    conf.default = currentValues[key];
                }
            } else {
                const match = key.match(/^obj(\d+)_/);
                if (!match) return;

                const id = parseInt(match[1], 10);
                const propName = key.substring(match[0].length);
                const obj = objects.find(o => o.id === id);
                if (!obj) return;

                let liveValue;

                // --- START OF FIX ---
                // This logic ensures we save the permanent base colors, not the temporary flash colors.
                if (propName === 'gradColor1') {
                    liveValue = obj.baseGradient.color1;
                } else if (propName === 'gradColor2') {
                    liveValue = obj.baseGradient.color2;
                } else if (propName.startsWith('strokeGradColor')) {
                    liveValue = obj.strokeGradient[propName.replace('strokeGradColor', 'color')];
                    // --- END OF FIX ---
                } else if (propName === 'scrollDir') {
                    liveValue = obj.scrollDirection;
                } else if (propName === 'strokeScrollDir') {
                    liveValue = obj.strokeScrollDir;
                } else {
                    liveValue = obj[propName];
                }

                if (liveValue === undefined) return;

                const propsToScaleDown = ['x', 'y', 'width', 'height', 'innerDiameter', 'fontSize', 'lineWidth', 'strokeWidth', 'pulseDepth'];
                const animPropsToScaleUp = ['animationSpeed', 'strokeAnimationSpeed'];

                if (propsToScaleDown.includes(propName)) {
                    liveValue /= 4.0;
                } else if (animPropsToScaleUp.includes(propName)) {
                    liveValue *= 10.0;
                }

                if (typeof liveValue === 'boolean') {
                    liveValue = String(liveValue);
                } else if (typeof liveValue === 'number') {
                    liveValue = Math.round(liveValue);
                } else if (propName === 'text' && typeof liveValue === 'string') {
                    liveValue = liveValue.replace(/\n/g, '\\n');
                }

                conf.default = liveValue;
            }
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

        syncConfigStoreWithState();

        const name = getControlValues()['title'] || 'Untitled Effect';
        const trimmedName = name.trim();

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
            configs: sanitizedConfigs,
            objects: objects.map(o => ({ id: o.id, name: o.name, locked: o.locked })),
            updatedAt: new Date()
        };

        const q = window.query(window.collection(window.db, "projects"), window.where("userId", "==", user.uid), window.where("name", "==", trimmedName));
        const querySnapshot = await window.getDocs(q);

        if (!querySnapshot.empty) {
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
        if (!button || button.disabled || !button.dataset.action) {
            return;
        }

        const action = button.dataset.action;
        if (selectedObjectIds.length === 0) {
            return;
        }

        const selectedObjects = selectedObjectIds.map(id => objects.find(o => o.id === id)).filter(o => o);
        if (selectedObjects.length === 0) {
            return;
        }
        const anchor = selectedObjects[0];

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
                    if (o.shape === 'text') {
                        o._updateFontSizeFromHeight();
                    }
                });
                break;
            case 'match-text-size':
                const textObjects = selectedObjects.filter(obj => obj.shape === 'text');
                const gridObjects = selectedObjects.filter(obj => obj.shape === 'rectangle' && (obj.numberOfRows > 1 || obj.numberOfColumns > 1));
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

        selectedObjects.forEach(o => {
            o.x = Math.round(o.x);
            o.y = Math.round(o.y);
        });

        // **THE FIX IS HERE:** Call the correct function name to update the form.
        updateFormValuesFromObjects();
        recordHistory();
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
        dragStartX = x;
        dragStartY = y;
        oldSelection = [...selectedObjectIds]; // Store selection state at the start of the click

        // Check for handle interaction on a single selected object first
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
                        const anchorPoint = selectedObject.getWorldCoordsOfCorner(oppositeHandleName);

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
                    return; // Exit early since we're manipulating a handle
                }
            }
        }

        // --- THIS IS THE CRITICAL FIX ---
        // If not interacting with a handle, determine the new selection state immediately.
        // By reversing the objects array, we check from the top-most rendered object down.
        const hitObject = [...objects].find(obj => obj.isPointInside(x, y));

        if (hitObject && !hitObject.locked) {
            const isSelected = selectedObjectIds.includes(hitObject.id);
            // If the clicked object is not already selected, make it the new selection.
            if (!isSelected) {
                // For multi-select, check for Shift/Ctrl key, otherwise just select the single object.
                if (e.shiftKey || e.ctrlKey || e.metaKey) {
                    selectedObjectIds.push(hitObject.id);
                } else {
                    selectedObjectIds = [hitObject.id];
                }
                // Update UI immediately to reflect the new selection
                updateToolbarState();
                syncPanelsWithSelection();
                drawFrame();
            }

            // Now, prepare the drag state based on the *correct* selection.
            isDragging = true; // Set isDragging to true to prepare for movement.
            initialDragState = selectedObjectIds.map(id => {
                const obj = objects.find(o => o.id === id);
                return { id, x: obj.x, y: obj.y };
            });

        } else if (!hitObject) {
            // If clicking on an empty area, clear the selection.
            selectedObjectIds = [];
            updateToolbarState();
            syncPanelsWithSelection();
            drawFrame();
        }
    });;


    /**
     * Handles mouse movement over the canvas for dragging, resizing, and cursor updates.
     * @param {MouseEvent} e - The mousemove event object.
     */
    canvasContainer.addEventListener('mousemove', e => {
        if (coordsDisplay) {
            const { x, y } = getCanvasCoordinates(e);
            coordsDisplay.textContent = `${Math.round(x / 4)}, ${Math.round(y / 4)}: (${Math.round(x)}, ${Math.round(y)})`;
        }

        e.preventDefault();
        const { x, y } = getCanvasCoordinates(e);

        if (!isDragging && !isResizing && !isRotating && e.buttons === 1 && initialDragState.length > 0) {
            const dx = x - dragStartX;
            const dy = y - dragStartY;
            if (Math.sqrt(dx * dx + dy * dy) > 5) {
                isDragging = true;
                const hitObject = [...objects].reverse().find(obj => obj.isPointInside(dragStartX, dragStartY));
                if (hitObject && !selectedObjectIds.includes(hitObject.id)) {
                    if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
                        selectedObjectIds = [hitObject.id];
                        updateToolbarState();
                        syncPanelsWithSelection();
                    }
                }
            }
        }

        if (isRotating) {
            const initial = initialDragState[0];
            const obj = objects.find(o => o.id === initial.id);
            if (obj) {
                const center = obj.getCenter();
                const currentAngle = Math.atan2(y - center.y, x - center.x);
                const angleDelta = currentAngle - initial.startAngle;
                obj.rotation = (initial.initialObjectAngle + angleDelta) * 180 / Math.PI;
                needsRedraw = true;
            }
        } else if (isResizing) {
            const SNAP_THRESHOLD = 10;
            const initial = initialDragState[0];
            let mouseX = x;
            let mouseY = y;
            snapLines = [];

            if (!cachedSnapTargets) {
                cachedSnapTargets = [];
                const otherObjects = objects.filter(o => !selectedObjectIds.includes(o.id));
                otherObjects.forEach(otherObj => cachedSnapTargets.push(...getWorldPoints(otherObj)));
                cachedSnapTargets.push(
                    { x: canvas.width / 2, y: canvas.height / 2, type: 'center' }, { x: canvas.width / 2, y: 0, type: 'edge' }, { x: canvas.width / 2, y: canvas.height, type: 'edge' }, { x: 0, y: canvas.height / 2, type: 'edge' }, { x: canvas.width, y: canvas.height / 2, type: 'edge' }
                );
            }

            const unSnappedState = (() => {
                const tempObj = new Shape({ ...objects.find(o => o.id === initial.id) });
                const anchorPoint = initial.anchorPoint;
                const resizeAngle = tempObj.rotation * Math.PI / 180; // Use static rotation for box shape
                const isSideHandle = activeResizeHandle === 'top' || activeResizeHandle === 'bottom' || activeResizeHandle === 'left' || activeResizeHandle === 'right';
                if (isSideHandle) {
                    const dragVecX = x - dragStartX;
                    const dragVecY = y - dragStartY;
                    const s = Math.sin(resizeAngle);
                    const c = Math.cos(resizeAngle);
                    let newWidth = initial.initialWidth;
                    let newHeight = initial.initialHeight;
                    let centerShiftX = 0, centerShiftY = 0;
                    if (activeResizeHandle === 'right' || activeResizeHandle === 'left') {
                        const change = dragVecX * c + dragVecY * s;
                        newWidth += activeResizeHandle === 'left' ? -change : change;
                        centerShiftX = (change / 2) * c;
                        centerShiftY = (change / 2) * s;
                    } else {
                        const change = -dragVecX * s + dragVecY * c;
                        newHeight += activeResizeHandle === 'top' ? -change : change;
                        centerShiftX = (change / 2) * -s;
                        centerShiftY = (change / 2) * c;
                    }
                    const initialCenter = { x: initial.initialX + initial.initialWidth / 2, y: initial.initialY + initial.initialHeight / 2 };
                    const newCenterX = initialCenter.x + centerShiftX;
                    const newCenterY = initialCenter.y + centerShiftY;
                    tempObj.width = newWidth;
                    tempObj.height = newHeight;
                    tempObj.x = newCenterX - tempObj.width / 2;
                    tempObj.y = newCenterY - tempObj.height / 2;
                } else {
                    const worldVecX = x - anchorPoint.x;
                    const worldVecY = y - anchorPoint.y;
                    const localVecX = worldVecX * Math.cos(-resizeAngle) - worldVecY * Math.sin(-resizeAngle);
                    const localVecY = worldVecX * Math.sin(-resizeAngle) + worldVecY * Math.cos(-resizeAngle);
                    const handleXSign = activeResizeHandle.includes('left') ? -1 : 1;
                    const handleYSign = activeResizeHandle.includes('top') ? -1 : 1;
                    tempObj.width = localVecX * handleXSign;
                    tempObj.height = localVecY * handleYSign;
                    const worldSizingVecX = (tempObj.width * handleXSign) * Math.cos(resizeAngle) - (tempObj.height * handleYSign) * Math.sin(resizeAngle);
                    const worldSizingVecY = (tempObj.width * handleXSign) * Math.sin(resizeAngle) + (tempObj.height * handleYSign) * Math.cos(resizeAngle);
                    const newCenterX = anchorPoint.x + worldSizingVecX / 2;
                    const newCenterY = anchorPoint.y + worldSizingVecY / 2;
                    tempObj.x = newCenterX - tempObj.width / 2;
                    tempObj.y = newCenterY - tempObj.height / 2;
                }
                return tempObj;
            })();

            const ghostPoints = getWorldPoints(unSnappedState);
            let pointsToSnap;
            const isHorizontalOnly = activeResizeHandle === 'left' || activeResizeHandle === 'right';
            const isVerticalOnly = activeResizeHandle === 'top' || activeResizeHandle === 'bottom';

            if (isHorizontalOnly) {
                pointsToSnap = ghostPoints.filter(p => p.handle && p.handle.includes(activeResizeHandle));
            } else if (isVerticalOnly) {
                pointsToSnap = ghostPoints.filter(p => p.handle && p.handle.includes(activeResizeHandle));
            } else {
                pointsToSnap = ghostPoints;
            }

            const hSnaps = [], vSnaps = [];

            pointsToSnap.forEach(point => {
                cachedSnapTargets.forEach(target => {
                    if (point.type === target.type) {
                        if (Math.abs(point.x - target.x) < SNAP_THRESHOLD) hSnaps.push({ dist: Math.abs(point.x - target.x), adj: target.x - point.x, line: target.x });
                        if (Math.abs(point.y - target.y) < SNAP_THRESHOLD) vSnaps.push({ dist: Math.abs(point.y - target.y), adj: target.y - point.y, line: target.y });
                    }
                });
            });

            if (!isVerticalOnly && hSnaps.length > 0) {
                hSnaps.sort((a, b) => a.dist - b.dist);
                mouseX += hSnaps[0].adj;
                snapLines.push({ type: 'vertical', x: hSnaps[0].line, duration: 2 });
            }
            if (!isHorizontalOnly && vSnaps.length > 0) {
                vSnaps.sort((a, b) => a.dist - b.dist);
                mouseY += vSnaps[0].adj;
                snapLines.push({ type: 'horizontal', y: vSnaps[0].line, duration: 2 });
            }

            const obj = objects.find(o => o.id === initial.id);
            if (obj) {
                const finalState = (() => {
                    const tempObj = new Shape({ ...objects.find(o => o.id === initial.id) });
                    const anchorPoint = initial.anchorPoint;
                    const resizeAngle = tempObj.rotation * Math.PI / 180; // Use static rotation for box shape
                    const isSideHandle = activeResizeHandle === 'top' || activeResizeHandle === 'bottom' || activeResizeHandle === 'left' || activeResizeHandle === 'right';
                    if (isSideHandle) {
                        const dragVecX = mouseX - dragStartX;
                        const dragVecY = mouseY - dragStartY;
                        const s = Math.sin(resizeAngle);
                        const c = Math.cos(resizeAngle);
                        let newWidth = initial.initialWidth;
                        let newHeight = initial.initialHeight;
                        let centerShiftX = 0, centerShiftY = 0;
                        if (activeResizeHandle === 'right' || activeResizeHandle === 'left') {
                            const change = dragVecX * c + dragVecY * s;
                            newWidth += activeResizeHandle === 'left' ? -change : change;
                            centerShiftX = (change / 2) * c;
                            centerShiftY = (change / 2) * s;
                        } else {
                            const change = -dragVecX * s + dragVecY * c;
                            newHeight += activeResizeHandle === 'top' ? -change : change;
                            centerShiftX = (change / 2) * -s;
                            centerShiftY = (change / 2) * c;
                        }
                        const initialCenter = { x: initial.initialX + initial.initialWidth / 2, y: initial.initialY + initial.initialHeight / 2 };
                        const newCenterX = initialCenter.x + centerShiftX;
                        const newCenterY = initialCenter.y + centerShiftY;
                        tempObj.width = newWidth;
                        tempObj.height = newHeight;
                        tempObj.x = newCenterX - tempObj.width / 2;
                        tempObj.y = newCenterY - tempObj.height / 2;
                    } else {
                        const worldVecX = mouseX - anchorPoint.x;
                        const worldVecY = mouseY - anchorPoint.y;
                        const localVecX = worldVecX * Math.cos(-resizeAngle) - worldVecY * Math.sin(-resizeAngle);
                        const localVecY = worldVecX * Math.sin(-resizeAngle) + worldVecY * Math.cos(-resizeAngle);
                        const handleXSign = activeResizeHandle.includes('left') ? -1 : 1;
                        const handleYSign = activeResizeHandle.includes('top') ? -1 : 1;
                        tempObj.width = localVecX * handleXSign;
                        tempObj.height = localVecY * handleYSign;
                        const worldSizingVecX = (tempObj.width * handleXSign) * Math.cos(resizeAngle) - (tempObj.height * handleYSign) * Math.sin(resizeAngle);
                        const worldSizingVecY = (tempObj.width * handleXSign) * Math.sin(resizeAngle) + (tempObj.height * handleYSign) * Math.cos(resizeAngle);
                        const newCenterX = anchorPoint.x + worldSizingVecX / 2;
                        const newCenterY = anchorPoint.y + worldSizingVecY / 2;
                        tempObj.x = newCenterX - tempObj.width / 2;
                        tempObj.y = newCenterY - tempObj.height / 2;
                    }
                    return tempObj;
                })();

                obj.width = Math.round(Math.max(10, finalState.width));
                obj.height = Math.round(Math.max(10, finalState.height));
                obj.x = Math.round(finalState.x);
                obj.y = Math.round(finalState.y);

                if (obj.shape === 'ring') {
                    obj.innerDiameter = Math.round(obj.width * initial.diameterRatio);
                }
                needsRedraw = true;
            }
        } else if (isDragging) {
            snapLines = [];
            const dx = x - dragStartX;
            const dy = y - dragStartY;
            const SNAP_THRESHOLD = 10;
            let finalDx = dx;
            let finalDy = dy;

            if (!cachedSnapTargets) {
                cachedSnapTargets = [];
                const otherObjects = objects.filter(o => !selectedObjectIds.includes(o.id));
                otherObjects.forEach(otherObj => {
                    cachedSnapTargets.push(...getWorldPoints(otherObj));
                });
                cachedSnapTargets.push(
                    { x: canvas.width / 2, y: canvas.height / 2, type: 'center' },
                    { x: canvas.width / 2, y: 0, type: 'edge' },
                    { x: canvas.width / 2, y: canvas.height, type: 'edge' },
                    { x: 0, y: canvas.height / 2, type: 'edge' },
                    { x: canvas.width, y: canvas.height / 2, type: 'edge' }
                );
            }

            const hSnaps = [], vSnaps = [];

            initialDragState.forEach(state => {
                const obj = objects.find(o => o.id === state.id);
                if (obj) {
                    const originalX = obj.x;
                    const originalY = obj.y;
                    obj.x = state.x + dx;
                    obj.y = state.y + dy;
                    const selectedPoints = getWorldPoints(obj);
                    selectedPoints.forEach(point => {
                        cachedSnapTargets.forEach(target => {
                            if (point.type === target.type) {
                                if (Math.abs(point.x - target.x) < SNAP_THRESHOLD) hSnaps.push({ dist: Math.abs(point.x - target.x), adj: target.x - point.x, line: target.x, snapType: point.type });
                                if (Math.abs(point.y - target.y) < SNAP_THRESHOLD) vSnaps.push({ dist: Math.abs(point.y - target.y), adj: target.y - point.y, line: target.y, snapType: point.type });
                            }
                        });
                    });
                    obj.x = originalX;
                    obj.y = originalY;
                }
            });

            if (hSnaps.length > 0) {
                hSnaps.sort((a, b) => a.dist - b.dist);
                finalDx += hSnaps[0].adj;
                snapLines.push({ type: 'vertical', x: hSnaps[0].line, duration: 2, snapType: hSnaps[0].snapType });
            }
            if (vSnaps.length > 0) {
                vSnaps.sort((a, b) => a.dist - b.dist);
                finalDy += vSnaps[0].adj;
                snapLines.push({ type: 'horizontal', y: vSnaps[0].line, duration: 2, snapType: vSnaps[0].snapType });
            }

            initialDragState.forEach(state => {
                const obj = objects.find(o => o.id === state.id);
                if (obj) {
                    let newX = state.x + finalDx;
                    let newY = state.y + finalDy;
                    if (constrainToCanvas) {
                        const tempObj = new Shape({ ...obj, x: newX, y: newY });
                        const { minX, minY, maxX, maxY } = getBoundingBox(tempObj);
                        if (minX < 0) newX -= minX;
                        if (maxX > canvas.width) newX -= (maxX - canvas.width);
                        if (minY < 0) newY -= minY;
                        if (maxY > canvas.height) newY -= (maxY - canvas.height);
                    }
                    obj.x = newX;
                    obj.y = newY;
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
    });;

    /**
     * Handles the mouseup event to finalize dragging or resizing operations.
     * @param {MouseEvent} e - The mouseup event object.
     */
    canvasContainer.addEventListener('mouseup', e => {
        e.preventDefault();
        const { x, y } = getCanvasCoordinates(e);
        const wasManipulating = isDragging || isResizing || isRotating;

        // This block handles the logic for a "click" action (when not dragging/resizing).
        if (!wasManipulating) {
            const hitObject = objects.find(obj => obj.isPointInside(x, y));

            if (hitObject) {
                const hitObjectId = hitObject.id;
                const wasAlreadySelected = oldSelection.includes(hitObjectId);

                if (e.shiftKey || e.ctrlKey || e.metaKey) {
                    if (wasAlreadySelected) {
                        selectedObjectIds = oldSelection.filter(id => id !== hitObjectId);
                    } else {
                        selectedObjectIds = [...oldSelection, hitObjectId];
                    }
                } else {
                    selectedObjectIds = [hitObjectId];
                }
            } else {
                selectedObjectIds = [];
            }
        }

        if (isRotating) {
            const obj = objects.find(o => o.id === initialDragState[0].id);
            if (obj) {
                obj.rotation = Math.round(obj.rotation);
            }
        }

        // Reset all manipulation states.
        isDragging = false;
        isResizing = false;
        isRotating = false;
        activeResizeHandle = null;
        initialDragState = [];
        snapLines = [];
        cachedSnapTargets = null;

        if (wasManipulating) {
            // Finalize object properties after manipulation.
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

            // FIX: Reverted to a direct, immediate call to recordHistory(). A mouse drag is a single
            // action that should be saved instantly upon completion.
            recordHistory();
        }

        // Update the UI to reflect the new selection state.
        updateToolbarState();
        syncPanelsWithSelection();
        canvasContainer.style.cursor = 'default';
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
        const constrainBtn = document.getElementById('constrain-btn');
        constrainBtn.classList.remove('btn-secondary', 'btn-outline-secondary');
        if (constrainToCanvas) {
            constrainBtn.classList.add('btn-secondary');
        } else {
            constrainBtn.classList.add('btn-outline-secondary');
        }

        const effectLoaded = await loadSharedEffect();

        if (!effectLoaded) {
            const template = document.getElementById('initial-config');
            const metaElements = Array.from(template.content.querySelectorAll('meta'));
            configStore = metaElements.map(parseMetaToConfig);
            createInitialObjects();
            renderForm();

            // Explicitly set form values from the default config
            for (const config of configStore) {
                const key = config.property || config.name;
                const el = form.elements[key];
                if (el) {
                    if (el.type === 'checkbox') {
                        el.checked = (config.default === true || config.default === 'true');
                    } else {
                        el.value = config.default;
                    }
                }
            }
            generateOutputScript(); // Generate script after setup
        }

        updateObjectsFromForm();

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

        const generalCollapseWrapper = document.querySelector('#collapse-general .p-3');
        if (generalCollapseWrapper) {
            const minimizeFormGroup = document.createElement('div');
            minimizeFormGroup.className = 'form-check form-switch my-3';

            const checkbox = document.createElement('input');
            checkbox.className = 'form-check-input';
            checkbox.type = 'checkbox';
            checkbox.id = 'minimize-props-export';
            checkbox.checked = true; // Default to ON

            const label = document.createElement('label');
            label.className = 'form-check-label';
            label.htmlFor = 'minimize-props-export';
            label.textContent = 'Minimize Properties for Export';

            const helpText = document.createElement('div');
            helpText.className = 'form-text mt-1';
            helpText.textContent = 'Reduces editable properties to only the essentials (colors, speeds, text), writing all others as fixed variables in the script. This can improve load times.';

            minimizeFormGroup.appendChild(checkbox);
            minimizeFormGroup.appendChild(label);
            minimizeFormGroup.appendChild(helpText);
            generalCollapseWrapper.appendChild(minimizeFormGroup);
        }

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
     * Generates a small data URL thumbnail from the main canvas, ensuring no selection UI is visible.
     * @param {HTMLCanvasElement} sourceCanvas - The main canvas to capture.
     * @returns {string} A dataURL string of the thumbnail.
     */
    function generateThumbnail(sourceCanvas, width = 200) {
        // Temporarily store the current selection
        const originalSelection = [...selectedObjectIds];

        // Deselect all objects to hide the selection UI
        selectedObjectIds = [];
        drawFrame(); // Redraw the canvas without selection boxes

        const thumbnailCanvas = document.createElement('canvas');
        const thumbWidth = width;
        const thumbHeight = (sourceCanvas.height / sourceCanvas.width) * thumbWidth;
        thumbnailCanvas.width = thumbWidth;
        thumbnailCanvas.height = thumbHeight;
        const thumbCtx = thumbnailCanvas.getContext('2d');

        // Draw the clean main canvas onto the smaller thumbnail canvas
        thumbCtx.drawImage(sourceCanvas, 0, 0, thumbWidth, thumbHeight);
        const dataUrl = thumbnailCanvas.toDataURL('image/jpeg', 0.7);

        // Restore the original selection and redraw the canvas for the user
        selectedObjectIds = originalSelection;
        drawFrame();

        return dataUrl;
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

        // This is the corrected line:
        configStore.unshift(...newConfigs);

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
        objects.unshift(newShape);

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
        const target = e.target;

        // Handle UI re-rendering for controls with dependencies.
        // This runs only after the user has finished making a change.
        if (target.name && (
            target.name.includes('_shape') ||
            target.name.includes('_gradType') ||
            target.name.includes('_numberOfRows') ||
            target.name.includes('_numberOfColumns') ||
            target.name.includes('_oscDisplayMode')
        )) {
            updateObjectsFromForm(); // Sync state before re-rendering
            renderForm();
            updateFormValuesFromObjects(); // Sync state again after re-rendering to ensure consistency
        }

        debouncedRecordHistory();
    });

    // --- FINAL: Robust Copy/Paste Properties Logic ---
    const copyPropsBtn = document.getElementById('copy-props-btn');
    const pastePropsBtn = document.getElementById('paste-props-btn');
    const copyPropsModalEl = document.getElementById('copy-props-modal');
    const confirmCopyBtn = document.getElementById('confirm-copy-props-btn');
    const copyPropsForm = document.getElementById('copy-props-form');

    if (copyPropsBtn && pastePropsBtn && copyPropsModalEl && confirmCopyBtn && copyPropsForm) {
        const copyPropsModal = new bootstrap.Modal(copyPropsModalEl);

        copyPropsBtn.addEventListener('click', () => {
            if (selectedObjectIds.length === 0) return;
            sourceObjectId = selectedObjectIds[0];
            const sourceObject = objects.find(o => o.id === sourceObjectId);
            if (!sourceObject) return;

            copyPropsForm.reset();

            const shapeSpecificContainer = document.getElementById('shape-specific-props-container');
            const shapeSpecificName = document.getElementById('shape-specific-name');
            const shapeSpecificProps = ['ring', 'oscilloscope', 'text', 'rectangle'];

            if (shapeSpecificProps.includes(sourceObject.shape)) {
                shapeSpecificName.textContent = sourceObject.shape.charAt(0).toUpperCase() + sourceObject.shape.slice(1);
                shapeSpecificContainer.classList.remove('d-none');
            } else {
                shapeSpecificContainer.classList.add('d-none');
            }

            copyPropsModal.show();
        });

        confirmCopyBtn.addEventListener('click', () => {
            const sourceObject = objects.find(o => o.id === sourceObjectId);
            if (!sourceObject) return;

            const propsToCopy = {};

            if (copyPropsForm.elements['copy-position'].checked) { Object.assign(propsToCopy, { x: sourceObject.x, y: sourceObject.y }); }
            if (copyPropsForm.elements['copy-size'].checked) { Object.assign(propsToCopy, { width: sourceObject.width, height: sourceObject.height }); }
            if (copyPropsForm.elements['copy-rotation'].checked) { Object.assign(propsToCopy, { rotation: sourceObject.rotation, rotationSpeed: sourceObject.rotationSpeed }); }
            if (copyPropsForm.elements['copy-fill-style'].checked) { Object.assign(propsToCopy, { gradType: sourceObject.gradType, useSharpGradient: sourceObject.useSharpGradient, gradientStop: sourceObject.gradientStop, gradient: { ...sourceObject.gradient } }); }

            // CORRECTED: This block now properly includes animationSpeed
            if (copyPropsForm.elements['copy-animation'].checked) {
                Object.assign(propsToCopy, {
                    animationMode: sourceObject.animationMode,
                    animationSpeed: sourceObject.animationSpeed,

                    scrollDirection: sourceObject.scrollDirection
                });
            }

            if (copyPropsForm.elements['copy-color-animation'].checked) { Object.assign(propsToCopy, { cycleColors: sourceObject.cycleColors, cycleSpeed: sourceObject.cycleSpeed }); }

            if (copyPropsForm.elements['copy-shape-type'].checked) { propsToCopy.shape = sourceObject.shape; }
            if (copyPropsForm.elements['copy-shape-specific'].checked) {
                switch (sourceObject.shape) {
                    case 'ring': Object.assign(propsToCopy, { innerDiameter: sourceObject.innerDiameter, numberOfSegments: sourceObject.numberOfSegments, angularWidth: sourceObject.angularWidth }); break;
                    case 'oscilloscope': Object.assign(propsToCopy, { lineWidth: sourceObject.lineWidth, waveType: sourceObject.waveType, frequency: sourceObject.frequency, oscDisplayMode: sourceObject.oscDisplayMode, pulseDepth: sourceObject.pulseDepth, fillShape: sourceObject.fillShape }); break;
                    case 'text': Object.assign(propsToCopy, { text: sourceObject.text, fontSize: sourceObject.fontSize, textAlign: sourceObject.textAlign, pixelFont: sourceObject.pixelFont, textAnimation: sourceObject.textAnimation, textAnimationSpeed: sourceObject.textAnimationSpeed, showTime: sourceObject.showTime, showDate: sourceObject.showDate }); break;
                    case 'rectangle': Object.assign(propsToCopy, { numberOfRows: sourceObject.numberOfRows, numberOfColumns: sourceObject.numberOfColumns, phaseOffset: sourceObject.phaseOffset }); break;
                }
            }

            propertyClipboard = propsToCopy;
            updateToolbarState();
            showToast("Properties copied to clipboard!", 'info');
            copyPropsModal.hide();
        });

        pastePropsBtn.addEventListener('click', () => {
            if (!propertyClipboard || selectedObjectIds.length === 0) return;

            const destObjects = selectedObjectIds.map(id => objects.find(o => o.id === id));
            destObjects.forEach(obj => {
                if (obj) {
                    obj.update(propertyClipboard);
                }
            });

            if (propertyClipboard.hasOwnProperty('shape')) {
                renderForm();
            }

            updateFormValuesFromObjects();
            drawFrame();
            recordHistory();
            showToast(`Properties pasted to ${destObjects.length} object(s).`, 'success');
        });
    }

    /**
     * Analyzes the current audio frame and returns calculated metrics, including average and peak values.
     * @returns {object} An object with bass, mids, highs, and volume properties.
     */
    /**
 * Analyzes the current audio frame and returns calculated metrics, including average and peak values.
 * @returns {object} An object with bass, mids, highs, and volume properties.
 */
    function getAudioMetrics() {
        if (!analyser) {
            return {
                bass: { avg: 0, peak: 0 },
                mids: { avg: 0, peak: 0 },
                highs: { avg: 0, peak: 0 },
                volume: { avg: 0, peak: 0 }
            };
        }

        analyser.getByteFrequencyData(frequencyData);

        const bassEndIndex = Math.floor(analyser.frequencyBinCount * 0.1);
        const midsEndIndex = Math.floor(analyser.frequencyBinCount * 0.4);

        let bassTotal = 0, midsTotal = 0, highsTotal = 0;
        let bassPeak = 0, midsPeak = 0, highsPeak = 0;
        let volumeTotal = 0;

        for (let i = 0; i < analyser.frequencyBinCount; i++) {
            const value = frequencyData[i];
            volumeTotal += value; // Add every frequency value to the total volume

            if (i < bassEndIndex) {
                bassTotal += value;
                if (value > bassPeak) bassPeak = value;
            } else if (i < midsEndIndex) {
                midsTotal += value;
                if (value > midsPeak) midsPeak = value;
            } else {
                highsTotal += value;
                if (value > highsPeak) highsPeak = value;
            }
        }

        // --- START OF FIX ---
        // This provides a single, reliable 'avg' property for the volume metric.
        const volumeAvg = (volumeTotal / analyser.frequencyBinCount) / 255;
        // --- END OF FIX ---

        return {
            bass: {
                avg: (bassTotal / (bassEndIndex || 1)) / 255,
                peak: bassPeak / 255
            },
            mids: {
                avg: (midsTotal / ((midsEndIndex - bassEndIndex) || 1)) / 255,
                peak: midsPeak / 255
            },
            highs: {
                avg: (highsTotal / ((analyser.frequencyBinCount - midsEndIndex) || 1)) / 255,
                peak: highsPeak / 255
            },
            // We now provide the calculated average volume.
            volume: {
                avg: volumeAvg,
                peak: volumeAvg // For volume, peak and avg can be the same for simplicity.
            }
        };
    }

    /**
 * Sets up the Web Audio API to listen to a specific browser tab's audio.
 */
    async function setupAudio() {
        if (isAudioSetup) return;

        try {
            // Step 1: Request permission to capture a tab. 
            // We must request video:true to get the audio permission prompt.
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                }
            });

            // Step 2: Check if the user actually shared audio.
            if (stream.getAudioTracks().length === 0) {
                // Stop the video track to remove the "sharing this screen" icon.
                stream.getVideoTracks()[0].stop();
                alert("Audio sharing was not enabled. Please try again and make sure to check the 'Share tab audio' box.");
                return;
            }

            // Step 3: Create the audio context and connect the nodes (same as before).
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;

            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);

            frequencyData = new Uint8Array(analyser.frequencyBinCount);
            isAudioSetup = true;

            // Stop the video track, as we only need the audio.
            // This also removes the "sharing this screen" bar from the browser.
            stream.getVideoTracks()[0].stop();

            // Update the button UI
            const startBtn = document.getElementById('startAudioBtn');
            startBtn.textContent = 'Listening...';
            startBtn.disabled = true;
            showToast("Tab audio connected! Your visualizer is now live.", "success");

        } catch (err) {
            // This error happens if the user clicks "Cancel".
            console.error('Error capturing tab:', err);
            showToast("Tab capture was canceled or failed.", "error");
        }
    }

    /**
 * [SignalRGB Export] Analyzes SignalRGB's audio engine data and returns calculated metrics.
 * @returns {object} An object with bass, mids, highs, and volume properties (0-1 range).
 */
    function getSignalRGBAudioMetrics() {
        // Use a try/catch block in case the 'engine' object is not available.
        if (enableSound) {
            const freqArray = engine.audio.freq || new Array(200).fill(0);
            const level = engine.audio.level || -100;

            // The frequency array from SignalRGB has 200 elements.
            const bassEndIndex = 20;   // ~0-10% of spectrum
            const midsEndIndex = 80;   // ~10-40% of spectrum

            let bassTotal = 0, midsTotal = 0, highsTotal = 0;

            for (let i = 0; i < bassEndIndex; i++) {
                bassTotal += freqArray[i];
            }
            for (let i = bassEndIndex; i < midsEndIndex; i++) {
                midsTotal += freqArray[i];
            }
            for (let i = midsEndIndex; i < freqArray.length; i++) {
                highsTotal += freqArray[i];
            }

            // Normalize the frequency bands to a 0-1 range.
            const bass = (bassTotal / (bassEndIndex || 1));
            const mids = (midsTotal / ((midsEndIndex - bassEndIndex) || 1));
            const highs = (highsTotal / ((freqArray.length - midsEndIndex) || 1));

            // Convert SignalRGB's -100 to 0 level to our 0 to 1 volume scale.
            const volume = (level + 100) / 100.0;

            return {
                bass: { avg: bass, peak: bass },
                mids: { avg: mids, peak: mids },
                highs: { avg: highs, peak: highs },
                volume: { avg: volume, peak: volume }
            };

        } else {
            // If engine data is not available, return silent values.
            return {
                bass: { avg: 0, peak: 0 },
                mids: { avg: 0, peak: 0 },
                highs: { avg: 0, peak: 0 },
                volume: { avg: 0, peak: 0 }
            };
        }
    }

    /**
     * [SignalRGB Export] A version of _applyAudioReactivity that works within SignalRGB.
     * This function is converted to a method of the Shape class during export.
     */
    function srgb_applyAudioReactivity(audioData) {
        this.rotation = this.baseRotation || 0;
        this.internalScale = 1.0;
        this.colorOverride = null;
        this.gradient = { ...(this.baseGradient || { color1: '#000000', color2: '#000000' }) };
        if (this.flashDecay > 0) { this.flashDecay -= 0.18; }
        this.flashDecay = Math.max(0, this.flashDecay);

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
                const randomSign = Math.random() < 0.5 ? -1 : 1;
                this.rotation = this.baseRotation + (randomSign * reactiveValue * 180);
                break;
        }
    }

    function applyHistoryState(state) {
        if (!state) return;
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

    if (undoBtn) {
        undoBtn.addEventListener('click', () => {
            const state = appHistory.undo();
            applyHistoryState(state);
        });
    }
    if (redoBtn) {
        redoBtn.addEventListener('click', () => {
            const state = appHistory.redo();
            applyHistoryState(state);
        });
    }

    // Start the application.
    init();
});