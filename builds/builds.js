const BUILDS_KEY = 'deepwoken-builds';

let builds = [];
let editingIndex = -1;

function loadBuilds() {
    const saved = localStorage.getItem(BUILDS_KEY);
    if (saved) {
        builds = JSON.parse(saved);
    } else {
        builds = [];
    }
    renderBuilds();
}

function saveBuilds() {
    localStorage.setItem(BUILDS_KEY, JSON.stringify(builds));
}

function renderBuilds() {
    const grid = document.getElementById('builds-grid');
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const filterType = document.getElementById('filter-select').value;

    let filteredBuilds = builds.filter(build => {
        const matchesSearch = build.name.toLowerCase().includes(searchTerm) ||
                            build.description.toLowerCase().includes(searchTerm) ||
                            build.oath.toLowerCase().includes(searchTerm);
        const matchesFilter = filterType === 'all' || build.type === filterType;
        return matchesSearch && matchesFilter;
    });

    if (filteredBuilds.length === 0 && builds.length === 0) {
        grid.innerHTML = '<div class="empty-state"><p>No hay builds aún. ¡Crea tu primer build!</p></div>';
        return;
    }

    if (filteredBuilds.length === 0) {
        grid.innerHTML = '<div class="empty-state"><p>No se encontraron builds que coincidan con tu búsqueda.</p></div>';
        return;
    }

    grid.innerHTML = filteredBuilds.map((build, index) => {
        const actualIndex = builds.indexOf(build);
        return `
            <div class="build-card">
                <div class="build-header">
                    <h3 class="build-name">${escapeHtml(build.name)}</h3>
                    <span class="build-tag build-tag-${build.type}">${build.type.toUpperCase()}</span>
                </div>
                <div class="build-stats">
                    <div class="stat-item">
                        <span class="stat-label">Power</span>
                        <span class="stat-value">${build.power}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Weapon</span>
                        <span class="stat-value">${build.weapon}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Oath</span>
                        <span class="stat-value">${escapeHtml(build.oath)}</span>
                    </div>
                </div>
                <div class="build-description">
                    <p>${escapeHtml(build.description || 'Sin descripción')}</p>
                </div>
                <div class="build-footer">
                    <span class="build-author">Por: ${escapeHtml(build.author || 'Anónimo')}</span>
                    <div class="build-actions">
                        <button class="btn-icon-small" onclick="editBuild(${actualIndex})">✎</button>
                        <button class="btn-icon-small" onclick="deleteBuild(${actualIndex})">🗑</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function openModal(isEdit = false) {
    const modal = document.getElementById('build-modal');
    const form = document.getElementById('build-form');
    const title = document.getElementById('modal-title');
    
    if (isEdit) {
        title.textContent = 'Editar Build';
    } else {
        title.textContent = 'Nuevo Build';
        form.reset();
        editingIndex = -1;
    }
    
    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('build-modal');
    modal.classList.remove('active');
    const form = document.getElementById('build-form');
    form.reset();
    editingIndex = -1;
}

function editBuild(index) {
    if (index < 0 || index >= builds.length) return;
    
    const build = builds[index];
    editingIndex = index;
    
    document.getElementById('build-name-input').value = build.name;
    document.getElementById('build-type-select').value = build.type;
    document.getElementById('build-power').value = build.power;
    document.getElementById('build-weapon').value = build.weapon;
    document.getElementById('build-oath').value = build.oath;
    document.getElementById('build-description-input').value = build.description || '';
    
    openModal(true);
}

function deleteBuild(index) {
    if (index < 0 || index >= builds.length) return;
    
    if (confirm('¿Estás seguro de que quieres eliminar este build?')) {
        builds.splice(index, 1);
        saveBuilds();
        renderBuilds();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    loadBuilds();
    
    document.getElementById('add-build-btn').addEventListener('click', () => openModal(false));
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('cancel-btn').addEventListener('click', closeModal);
    
    document.getElementById('build-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('build-name-input').value.trim();
        const type = document.getElementById('build-type-select').value;
        const power = parseInt(document.getElementById('build-power').value);
        const weapon = parseInt(document.getElementById('build-weapon').value);
        const oath = document.getElementById('build-oath').value.trim();
        const description = document.getElementById('build-description-input').value.trim();
        
        if (!name || !oath) {
            alert('Por favor completa todos los campos requeridos.');
            return;
        }
        
        const buildData = {
            name,
            type,
            power,
            weapon,
            oath,
            description,
            author: 'Usuario',
            createdAt: new Date().toISOString()
        };
        
        if (editingIndex >= 0) {
            builds[editingIndex] = buildData;
        } else {
            builds.push(buildData);
        }
        
        saveBuilds();
        renderBuilds();
        closeModal();
    });
    
    document.getElementById('search-input').addEventListener('input', renderBuilds);
    document.getElementById('filter-select').addEventListener('change', renderBuilds);
    
    document.getElementById('build-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
});

window.editBuild = editBuild;
window.deleteBuild = deleteBuild;
