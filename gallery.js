document.addEventListener('DOMContentLoaded', function () {
    const ADMIN_UID = 'zMj8mtfMjXeFMt072027JT7Jc7i1';
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userSessionGroup = document.getElementById('user-session-group');
    const galleryList = document.getElementById('gallery-project-list');
    const editProjectModalEl = document.getElementById('edit-project-modal');
    const editProjectForm = document.getElementById('edit-project-form');
    const editProjectIdInput = document.getElementById('edit-project-id');
    const editProjectNameInput = document.getElementById('edit-project-name');
    const editProjectDescriptionInput = document.getElementById('edit-project-description');
    const editProjectModal = new bootstrap.Modal(editProjectModalEl);

    // --- Pagination State Variables ---
    const projectsPerPage = 8;
    let allProjects = [];
    let currentPage = 1;
    const paginationNavTop = document.getElementById('pagination-nav-top');
    const paginationNavBottom = document.getElementById('pagination-nav');
    const paginationContainerTop = document.getElementById('pagination-container-top');
    const paginationContainerBottom = document.getElementById('pagination-container-bottom');


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


    // --- Admin & Edit Functions ---
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
            loadPublicGallery();
        } catch (error) {
            console.error("Error updating project:", error);
            alert("Failed to save changes.");
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = 'Save Changes';
        }
    });

    // --- Pagination Rendering Functions ---
    function renderPage(pageNumber) {
        currentPage = pageNumber;
        const startIndex = (pageNumber - 1) * projectsPerPage;
        const endIndex = startIndex + projectsPerPage;
        const projectsForPage = allProjects.slice(startIndex, endIndex);

        renderProjects(projectsForPage);
        renderPagination();
        window.scrollTo(0, 0);
    }

    function renderProjects(projects) {
        galleryList.innerHTML = '';
        const currentUser = window.auth.currentUser;

        if (projects.length === 0) {
            galleryList.innerHTML = '<li class="list-group-item disabled">No effects found.</li>';
            return;
        }

        projects.forEach(project => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center p-3';
            li.id = `gallery-item-${project.docId}`;

            let description = 'No description provided.';
            if (project.configs) {
                const descriptionConf = project.configs.find(c => c.name === 'description');
                if (descriptionConf && descriptionConf.default) {
                    description = descriptionConf.default;
                }
            }

            const contentDiv = document.createElement('div');
            contentDiv.className = 'd-flex align-items-center flex-grow-1 me-2';
            contentDiv.style.minWidth = '0';
            contentDiv.innerHTML = `
                ${project.thumbnail ? `<a href="./?effectId=${project.docId}"><img src="${project.thumbnail}" style="width: 160px; height: 100px; object-fit: cover;" class="rounded border me-4"></a>` : ''}
                <div style="min-width: 0;">
                    <strong class="d-block">${project.name}</strong>
                    <small class="d-block text-body-secondary">By ${project.creatorName || 'Anonymous'}</small>
                    <p class="mb-0 mt-1 small text-body-secondary" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${description}">
                        ${description}
                    </p>
                </div>
            `;
            li.appendChild(contentDiv);

            const controlsDiv = document.createElement('div');
            controlsDiv.className = 'd-flex align-items-center gap-2';
            
            const loadBtn = document.createElement('a');
            loadBtn.className = 'btn btn-primary';
            loadBtn.innerHTML = '<i class="bi bi-box-arrow-down me-2"></i>Load';
            loadBtn.title = "Load Effect in Editor";
            loadBtn.href = `./?effectId=${project.docId}`;
            controlsDiv.appendChild(loadBtn);

            const buttonsSubDiv = document.createElement('div');
            buttonsSubDiv.className = 'd-flex flex-column gap-1';

            if (currentUser && (currentUser.uid === project.userId || currentUser.uid === ADMIN_UID)) {
                const editBtn = document.createElement('button');
                editBtn.className = 'btn btn-sm btn-outline-secondary';
                editBtn.innerHTML = '<i class="bi bi-pencil"></i>';
                editBtn.title = "Edit Name/Description";
                editBtn.onclick = () => openEditModal(project);
                buttonsSubDiv.appendChild(editBtn);
            }

            if (currentUser && currentUser.uid === ADMIN_UID) {
                const featureBtn = document.createElement('button');
                const isFeatured = project.featured === true;
                featureBtn.className = `btn btn-sm btn-feature ${isFeatured ? 'btn-warning' : 'btn-outline-warning'}`;
                featureBtn.innerHTML = isFeatured ? '<i class="bi bi-star-fill"></i>' : '<i class="bi bi-star"></i>';
                featureBtn.title = isFeatured ? 'Unfeature this effect' : 'Feature this effect';
                featureBtn.dataset.docId = project.docId;
                featureBtn.onclick = function () { toggleFeaturedStatus(this, project.docId); };
                buttonsSubDiv.appendChild(featureBtn);

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
                buttonsSubDiv.appendChild(deleteBtn);
            }

            if(buttonsSubDiv.hasChildNodes()){
                 controlsDiv.appendChild(buttonsSubDiv);
            }
           
            li.appendChild(controlsDiv);
            galleryList.appendChild(li);
        });
    }

    function renderPagination() {
        const containers = [paginationContainerTop, paginationContainerBottom];
        const navs = [paginationNavTop, paginationNavBottom];

        containers.forEach(container => { if(container) container.innerHTML = '' });

        const totalPages = Math.ceil(allProjects.length / projectsPerPage);
        
        if (totalPages <= 1) {
            navs.forEach(nav => { if(nav) nav.style.display = 'none' });
            return;
        }
        navs.forEach(nav => { if(nav) nav.style.display = 'flex' });

        const createPageItem = (text, page, isDisabled = false, isActive = false) => {
            const li = document.createElement('li');
            li.className = `page-item ${isDisabled ? 'disabled' : ''} ${isActive ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link" href="#" data-page="${page}">${text}</a>`;
            return li;
        };

        const items = [];
        items.push(createPageItem('Previous', currentPage - 1, currentPage === 1));
        for (let i = 1; i <= totalPages; i++) {
            items.push(createPageItem(i, i, false, i === currentPage));
        }
        items.push(createPageItem('Next', currentPage + 1, currentPage === totalPages));

        containers.forEach(container => {
            if(container) {
                items.forEach(item => container.appendChild(item.cloneNode(true)));
            }
        });
    }

    function handlePaginationClick(e) {
        e.preventDefault();
        const target = e.target.closest('a');
        if (target && target.dataset.page && !target.closest('.page-item.disabled')) {
            const pageNumber = parseInt(target.dataset.page, 10);
            if (pageNumber !== currentPage) {
                renderPage(pageNumber);
            }
        }
    }

    if (paginationContainerTop) paginationContainerTop.addEventListener('click', handlePaginationClick);
    if (paginationContainerBottom) paginationContainerBottom.addEventListener('click', handlePaginationClick);
    
    // --- Data Loading ---
    async function loadPublicGallery() {
        galleryList.innerHTML = `<li class="list-group-item text-center p-4"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></li>`;
        try {
            const q = window.query(
                window.collection(window.db, "projects"),
                window.where("isPublic", "==", true),
                window.orderBy("createdAt", "desc")
            );
            const querySnapshot = await window.getDocs(q);
            
            allProjects = []; // Clear previous results
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.createdAt && data.createdAt.toDate) {
                    data.createdAt = data.createdAt.toDate();
                }
                allProjects.push({ docId: doc.id, ...data });
            });

            renderPage(1); // Render the first page of the new data

        } catch (error) {
            console.error("Error loading public gallery:", error);
            galleryList.innerHTML = '<li class="list-group-item text-danger">Could not load effects. Please try again later.</li>';
        }
    }
});