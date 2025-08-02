document.addEventListener('DOMContentLoaded', function () {
    const ADMIN_UID = 'zMj8mtfMjXeFMt072027JT7Jc7i1';
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userSessionGroup = document.getElementById('user-session-group');
    const galleryList = document.getElementById('gallery-project-list');

    // --- START: Edit Modal Element References ---
    const editProjectModalEl = document.getElementById('edit-project-modal');
    const editProjectForm = document.getElementById('edit-project-form');
    const editProjectIdInput = document.getElementById('edit-project-id');
    const editProjectNameInput = document.getElementById('edit-project-name');
    const editProjectDescriptionInput = document.getElementById('edit-project-description');
    const editProjectModal = new bootstrap.Modal(editProjectModalEl);
    // --- END: Edit Modal Element References ---

    // --- Firebase Authentication Handling ---
    if (loginBtn) {
        loginBtn.addEventListener('click', async () => {
            const provider = new window.GoogleAuthProvider();
            try {
                await window.signInWithPopup(window.auth, provider);
            } catch (error) {
                console.error("Authentication failed:", error);
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await window.signOut(window.auth);
            } catch (error) {
                console.error("Sign out failed:", error);
            }
        });
    }

    function updateUserAuthState(user) {
        if (user) {
            loginBtn.classList.add('d-none');
            userSessionGroup.classList.remove('d-none');
            document.getElementById('user-photo').src = user.photoURL;
            document.getElementById('user-display').textContent = user.displayName;
        } else {
            loginBtn.classList.remove('d-none');
            userSessionGroup.classList.add('d-none');
        }
        loadPublicGallery();
    }

    setTimeout(() => {
        if (window.auth) {
            window.onAuthStateChanged(window.auth, updateUserAuthState);
        } else {
            console.error("Firebase Auth is not initialized.");
        }
    }, 500);


    async function toggleFeaturedStatus(buttonEl, docIdToToggle) {
        buttonEl.disabled = true;
        buttonEl.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';

        try {
            const projectsRef = window.collection(window.db, "projects");
            const docToToggleRef = window.doc(projectsRef, docIdToToggle);
            const q = window.query(projectsRef, window.where("featured", "==", true));
            const currentlyFeaturedSnapshot = await window.getDocs(q);

            await window.runTransaction(window.db, async (transaction) => {
                const docToToggleSnap = await transaction.get(docToToggleRef);
                if (!docToToggleSnap.exists()) throw new Error("Document does not exist!");

                const isCurrentlyFeatured = docToToggleSnap.data().featured === true;
                const newFeaturedState = !isCurrentlyFeatured;

                if (newFeaturedState === true) {
                    currentlyFeaturedSnapshot.forEach((doc) => {
                        transaction.update(doc.ref, { featured: false });
                    });
                }
                transaction.update(docToToggleRef, { featured: newFeaturedState });
            });

            document.querySelectorAll('.btn-feature').forEach(btn => {
                const isNowFeatured = (btn.dataset.docId === docIdToToggle) && !buttonEl.classList.contains('btn-warning');
                btn.className = `btn btn-sm btn-feature ${isNowFeatured ? 'btn-warning' : 'btn-outline-warning'}`;
                btn.innerHTML = isNowFeatured ? '<i class="bi bi-star-fill"></i>' : '<i class="bi bi-star"></i>';
                btn.title = isNowFeatured ? 'Unfeature this effect' : 'Feature this effect';
                btn.disabled = false;
            });

        } catch (error) {
            console.error("Error updating featured status: ", error);
            buttonEl.innerHTML = '<i class="bi bi-exclamation-triangle"></i>';
        }
    }

    // --- START: New Edit Logic ---
    function openEditModal(project) {
        editProjectIdInput.value = project.docId;
        editProjectNameInput.value = project.name;
        const descriptionConf = project.configs.find(c => c.name === 'description');
        editProjectDescriptionInput.value = descriptionConf ? descriptionConf.default : '';
        editProjectModal.show();
    }

    editProjectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const saveBtn = document.getElementById('save-edit-btn');
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';

        const docId = editProjectIdInput.value;
        const newName = editProjectNameInput.value;
        const newDescription = editProjectDescriptionInput.value;

        try {
            const docRef = window.doc(window.db, "projects", docId);
            const docSnap = await window.getDoc(docRef);
            if (!docSnap.exists()) throw new Error("Document not found.");

            const updatedConfigs = docSnap.data().configs.map(conf => {
                if (conf.name === 'description') {
                    return { ...conf, default: newDescription };
                }
                if (conf.name === 'title') {
                    return { ...conf, default: newName };
                }
                return conf;
            });

            await window.updateDoc(docRef, {
                name: newName,
                configs: updatedConfigs
            });

            editProjectModal.hide();
            loadPublicGallery(); // Refresh the gallery to show changes

        } catch (error) {
            console.error("Error updating project:", error);
            alert("Failed to save changes.");
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = 'Save Changes';
        }
    });
    // --- END: New Edit Logic ---


    function populateGalleryPage(projects) {
        galleryList.innerHTML = '';
        const currentUser = window.auth.currentUser;

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
                img.style.width = '160px';
                img.style.height = '100px';
                img.style.objectFit = 'cover';
                img.className = 'rounded border me-3';
                contentDiv.appendChild(img);
            }

            const infoDiv = document.createElement('div');
            infoDiv.className = project.thumbnail ? 'ms-3' : '';
            infoDiv.style.minWidth = '0';

            const nameEl = document.createElement('strong');
            nameEl.textContent = project.name;
            infoDiv.appendChild(nameEl);

            const metaEl = document.createElement('small');
            metaEl.className = 'd-block text-body-secondary';
            const formattedDate = project.createdAt ? project.createdAt.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown Date';
            metaEl.textContent = `By ${project.creatorName || 'Anonymous'} on ${formattedDate}`;
            infoDiv.appendChild(metaEl);

            // FIX: Find and display the effect's description
            if (project.configs) {
                const descriptionConf = project.configs.find(c => c.name === 'description');
                if (descriptionConf && descriptionConf.default) {
                    const descEl = document.createElement('p');
                    descEl.className = 'mb-0 mt-1 small text-body-secondary';
                    // Truncate long descriptions for display
                    descEl.textContent = descriptionConf.default.length > 100 ?
                        descriptionConf.default.substring(0, 100) + '...' :
                        descriptionConf.default;
                    descEl.title = descriptionConf.default;
                    infoDiv.appendChild(descEl);
                }
            }

            contentDiv.appendChild(infoDiv);
            li.appendChild(contentDiv);

            const controlsDiv = document.createElement('div');
            controlsDiv.className = 'd-flex align-items-center gap-1';

            const loadBtn = document.createElement('a');
            loadBtn.className = 'btn btn-primary';
            loadBtn.innerHTML = '<i class="bi bi-box-arrow-down me-2"></i>Load';
            loadBtn.title = "Load Effect in Editor";
            loadBtn.href = `./?effectId=${project.docId}`;
            controlsDiv.appendChild(loadBtn);

            if (currentUser && (currentUser.uid === project.userId || currentUser.uid === ADMIN_UID)) {
                const editBtn = document.createElement('button');
                editBtn.className = 'btn btn-sm btn-outline-secondary';
                editBtn.innerHTML = '<i class="bi bi-pencil"></i>';
                editBtn.title = "Edit Name/Description";
                editBtn.onclick = () => openEditModal(project);
                controlsDiv.appendChild(editBtn);
            }

            if (currentUser && currentUser.uid === ADMIN_UID) {
                const featureBtn = document.createElement('button');
                const isFeatured = project.featured === true;
                featureBtn.className = `btn btn-sm btn-feature ${isFeatured ? 'btn-warning' : 'btn-outline-warning'}`;
                featureBtn.innerHTML = isFeatured ? '<i class="bi bi-star-fill"></i>' : '<i class="bi bi-star"></i>';
                featureBtn.title = isFeatured ? 'Unfeature this effect' : 'Feature this effect';
                featureBtn.dataset.docId = project.docId;
                featureBtn.onclick = function () { toggleFeaturedStatus(this, project.docId); };
                controlsDiv.appendChild(featureBtn);

                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'btn btn-sm btn-outline-danger';
                deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
                deleteBtn.title = "Delete Effect";
                deleteBtn.onclick = async () => {
                    if (confirm(`Are you sure you want to delete "${project.name}"? This cannot be undone.`)) {
                        try {
                            await window.deleteDoc(window.doc(window.db, "projects", project.docId));
                            li.remove();
                        } catch (error) {
                            console.error("Error deleting project:", error);
                            alert("Failed to delete project.");
                        }
                    }
                };
                controlsDiv.appendChild(deleteBtn);
            }

            li.appendChild(controlsDiv);
            galleryList.appendChild(li);
        });
    }

    async function loadPublicGallery() {
        galleryList.innerHTML = `<li class="list-group-item text-center p-4"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></li>`;
        try {
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

            populateGalleryPage(projects);

        } catch (error) {
            console.error("Error loading public gallery:", error);
            galleryList.innerHTML = '<li class="list-group-item text-danger">Could not load effects. Please try again later.</li>';
        }
    }
});