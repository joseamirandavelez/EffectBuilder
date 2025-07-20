/**
 * Populates the gallery list with project data.
 * @param {Array} projects - An array of project objects from Firebase.
 */
function populateGallery(projects) {
    const galleryList = document.getElementById('gallery-project-list');
    galleryList.innerHTML = ''; // Clear the loading spinner

    if (projects.length === 0) {
        galleryList.innerHTML = '<li class="list-group-item disabled">No public effects found.</li>';
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
        const loadBtn = document.createElement('a');
        loadBtn.className = 'btn btn-sm btn-outline-primary';
        loadBtn.innerHTML = '<i class="bi bi-box-arrow-down me-1"></i> Load';
        loadBtn.title = "Load Effect in Editor";
        loadBtn.href = `index.html?effectId=${project.docId}`;

        controlsDiv.appendChild(loadBtn);
        li.appendChild(controlsDiv);
        galleryList.appendChild(li);
    });
}

/**
 * Fetches all public projects from Firestore and displays them.
 */
async function loadPublicGallery() {
    const galleryList = document.getElementById('gallery-project-list');
    try {
        // Use the globally available Firebase functions from firebase.js
        const q = window.query(
            window.collection(window.db, "projects"), 
            window.where("isPublic", "==", true), 
            window.orderBy("createdAt", "desc")
        );
        const querySnapshot = await window.getDocs(q);

        const projects = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.createdAt && data.createdAt.toDate) {
                data.createdAt = data.createdAt.toDate();
            }
            projects.push({ docId: doc.id, ...data });
        });

        populateGallery(projects);

    } catch (error) {
        console.error("Error loading public gallery:", error);
        galleryList.innerHTML = '<li class="list-group-item text-danger">Could not load effects. Please try again later.</li>';
    }
}

// Load the gallery when the page is ready
document.addEventListener('DOMContentLoaded', () => {
    // A short delay ensures firebase.js has had time to initialize and set up window.db
    setTimeout(() => {
        if (window.db) {
            loadPublicGallery();
        } else {
            console.error("Firebase is not initialized. Make sure firebase.js is loaded.");
            const galleryList = document.getElementById('gallery-project-list');
            if (galleryList) {
                galleryList.innerHTML = '<li class="list-group-item text-danger">Could not connect to the database.</li>';
            }
        }
    }, 200);
});