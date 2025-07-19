// Import necessary Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBIzgQqxHMTdCsW0UG4MOEuFWwjEYAFYbk",
    authDomain: "effect-builder.firebaseapp.com",
    projectId: "effect-builder",
    storageBucket: "effect-builder.appspot.com",
    messagingSenderId: "638106955712",
    appId: "1:638106955712:web:e98ee4cd023fd84d466225",
    measurementId: "G-4TBX7711GH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
        const loadBtn = document.createElement('a'); // Changed to an anchor tag for easy linking
        loadBtn.className = 'btn btn-sm btn-outline-primary';
        loadBtn.innerHTML = '<i class="bi bi-box-arrow-down me-1"></i> Load';
        loadBtn.title = "Load Effect in Editor";
        // Create a link that opens the editor with the effectId in the URL
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
        const q = query(collection(db, "projects"), where("isPublic", "==", true), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        const projects = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Convert Firestore Timestamp to JavaScript Date object
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
    loadPublicGallery();
});