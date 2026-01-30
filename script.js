const tasksData = [
    { id: 'food', reward: 1 },
    { id: 'fishing', reward: 1 },
    { id: 'modify-mantra', reward: 1 },
    { id: 'pure-ore', reward: 1 },
    { id: 'chime-win', reward: 1 },
    { id: 'attribute-flask', reward: 2 },
    { id: 'master-armor', reward: 2 },
    { id: 'deep-shrine', reward: 2 },
    { id: 'miserables', reward: 2 },
    { id: 'yunshul', reward: 2 },
    { id: 'unbound-attribute', reward: 5 },
    { id: 'oath', reward: 5 },
    { id: 'soulbound-enchant', reward: 5 },
    { id: 'enchant-item', reward: 5 },
    { id: 'laplace-enchant', reward: 5 },
    { id: 'world-event', reward: 5 },
    { id: 'pluripotent-alloy', reward: 5 },
    { id: 'murmur', reward: 5 },
    { id: 'serpents', reward: 5 },
    { id: 'duke', reward: 5 },
    { id: 'ferryman', reward: 5 },
    { id: 'chaser', reward: 5 },
    { id: 'primadon', reward: 5 },
    { id: 'scion', reward: 10 },
    { id: 'hell-mode', reward: 10 },
    { id: 'layer2-no-hook', reward: 10 },
    { id: 'power-level', reward: 15 },
    { id: 'resonance', reward: 15 }
];

const STORAGE_KEY = 'deepwoken-echoes-data';
const CHARACTER_NAME_KEY = 'deepwoken-character-name';
const ATTEMPTS_KEY = 'deepwoken-attempts';
const THEME_KEY = 'deepwoken-theme';

function saveState() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"][data-row-id]');
    const state = {};
    
    checkboxes.forEach(checkbox => {
        const rowId = checkbox.getAttribute('data-row-id');
        if (rowId) {
            state[rowId] = checkbox.checked;
        }
    });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    
    const characterName = document.getElementById('character-name').value;
    localStorage.setItem(CHARACTER_NAME_KEY, characterName);
    
    updateStats();
}

function loadState() {
    const savedState = localStorage.getItem(STORAGE_KEY);
    const savedName = localStorage.getItem(CHARACTER_NAME_KEY);
    
    if (savedName) {
        document.getElementById('character-name').value = savedName;
    }
    
    if (savedState) {
        const state = JSON.parse(savedState);
        const checkboxes = document.querySelectorAll('input[type="checkbox"][data-row-id]');
        
        checkboxes.forEach(checkbox => {
            const rowId = checkbox.getAttribute('data-row-id');
            if (rowId && state[rowId]) {
                checkbox.checked = true;
            }
        });
    }
    
    updateStats();
}

function updateStats() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"][data-row-id]');
    let totalEchoes = 0;
    let completedTasks = 0;
    const completedTasksSet = new Set();
    
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            const rowId = checkbox.getAttribute('data-row-id');
            if (rowId && !completedTasksSet.has(rowId)) {
                const task = tasksData.find(t => t.id === rowId);
                if (task) {
                    totalEchoes += task.reward;
                    completedTasks++;
                    completedTasksSet.add(rowId);
                }
            }
        }
    });
    
    document.getElementById('total-echoes').textContent = Math.round(totalEchoes * 3.2);
    document.getElementById('completed-tasks').textContent = completedTasks;
    document.getElementById('total-tasks').textContent = tasksData.length;
}

function loadAttempts() {
    const savedAttempts = localStorage.getItem(ATTEMPTS_KEY);
    if (savedAttempts !== null) {
        document.getElementById('attempts-count').textContent = savedAttempts;
    }
}

function saveAttempts() {
    const attempts = document.getElementById('attempts-count').textContent;
    localStorage.setItem(ATTEMPTS_KEY, attempts);
}

function increaseAttempts() {
    const attemptsElement = document.getElementById('attempts-count');
    let currentAttempts = parseInt(attemptsElement.textContent) || 0;
    currentAttempts++;
    attemptsElement.textContent = currentAttempts;
    saveAttempts();
}

function decreaseAttempts() {
    const attemptsElement = document.getElementById('attempts-count');
    let currentAttempts = parseInt(attemptsElement.textContent) || 0;
    if (currentAttempts > 0) {
        currentAttempts--;
        attemptsElement.textContent = currentAttempts;
        saveAttempts();
    }
}

function updateThemeLabel() {
    const themeLabel = document.getElementById('theme-label');
    const themeSwitch = document.getElementById('theme-switch');
    if (themeLabel) {
        themeLabel.textContent = themeSwitch.checked ? 'Dark' : 'Light';
    }
}

function loadTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const themeSwitch = document.getElementById('theme-switch');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeSwitch.checked = true;
    } else {
        document.body.classList.remove('dark-theme');
        themeSwitch.checked = false;
    }
    updateThemeLabel();
}

function toggleTheme() {
    const themeSwitch = document.getElementById('theme-switch');
    if (themeSwitch.checked) {
        document.body.classList.add('dark-theme');
        localStorage.setItem(THEME_KEY, 'dark');
    } else {
        document.body.classList.remove('dark-theme');
        localStorage.setItem(THEME_KEY, 'light');
    }
    updateThemeLabel();
}

function resetAll() {
    if (confirm('¿Estás seguro de que quieres resetear todas las tareas? Esta acción no se puede deshacer.')) {
        const checkboxes = document.querySelectorAll('input[type="checkbox"][data-row-id]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        document.getElementById('character-name').value = '';
        
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(CHARACTER_NAME_KEY);
        
        reorganizeTable();
        updateStats();
    }
}

function sortTable(columnIndex) {
    const table = document.getElementById('echo-tasks');
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const isAscending = table.dataset.sortOrder !== 'asc';
    
    rows.sort((a, b) => {
        let aValue, bValue;
        
        if (columnIndex === 0) {
            const aChecked = a.querySelector('input[type="checkbox"]').checked;
            const bChecked = b.querySelector('input[type="checkbox"]').checked;
            aValue = aChecked ? 1 : 0;
            bValue = bChecked ? 1 : 0;
        } else if (columnIndex === 1) {
            const aRowId = a.querySelector('td[data-row-id]').getAttribute('data-row-id');
            const bRowId = b.querySelector('td[data-row-id]').getAttribute('data-row-id');
            const aTask = tasksData.find(t => t.id === aRowId);
            const bTask = tasksData.find(t => t.id === bRowId);
            aValue = aTask ? aTask.reward : 0;
            bValue = bTask ? bTask.reward : 0;
        } else {
            return 0;
        }
        
        if (aValue === bValue) return 0;
        return isAscending ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });
    
    rows.forEach(row => tbody.appendChild(row));
    table.dataset.sortOrder = isAscending ? 'asc' : 'desc';
}

function makeRowsClickable() {
    const rows = document.querySelectorAll('tbody tr');
    rows.forEach(row => {
        row.style.cursor = 'pointer';
        
        if (row.dataset.clickable === 'true') {
            return;
        }
        row.dataset.clickable = 'true';
        
        row.addEventListener('click', function(e) {
            const target = e.target;
            if (target.tagName === 'INPUT' && target.type === 'checkbox') {
                return;
            }
            if (target.tagName === 'LABEL') {
                return;
            }
            if (target.closest('.wds-checkbox')) {
                return;
            }
            
            const checkbox = this.querySelector('input[type="checkbox"][data-row-id]');
            if (checkbox) {
                e.preventDefault();
                e.stopPropagation();
                checkbox.checked = !checkbox.checked;
                saveState();
            }
        });
    });
}

function isDefeatTask(row) {
    const text = row.textContent.toLowerCase();
    return text.includes('defeat') || text.includes('clear a world event');
}

function reorganizeTable() {
    const tableWrapper = document.querySelector('.table-wrapper');
    
    if (tableWrapper && tableWrapper.querySelectorAll('table').length >= 3) {
        loadState();
        
        const checkboxes = tableWrapper.querySelectorAll('input[type="checkbox"][data-row-id]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                saveState();
            });
        });
        
        makeRowsClickable();
        updateStats();
        return;
    }
}

function initTracker() {
    const savedName = localStorage.getItem(CHARACTER_NAME_KEY);
    if (savedName) {
        const nameInput = document.getElementById('character-name');
        if (nameInput) {
            nameInput.value = savedName;
        }
    }
    
    loadState();
    loadAttempts();
    
    reorganizeTable();
    
    const characterNameInput = document.getElementById('character-name');
    if (characterNameInput) {
        characterNameInput.addEventListener('input', saveState);
    }
    
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetAll);
    }
    
    const increaseBtn = document.getElementById('increase-attempts');
    if (increaseBtn) {
        increaseBtn.addEventListener('click', increaseAttempts);
    }
    
    const decreaseBtn = document.getElementById('decrease-attempts');
    if (decreaseBtn) {
        decreaseBtn.addEventListener('click', decreaseAttempts);
    }
    
    updateStats();
    
    if (typeof Router !== 'undefined' && Router.updateRouterPadding) {
        setTimeout(() => Router.updateRouterPadding(), 100);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    
    const themeSwitch = document.getElementById('theme-switch');
    if (themeSwitch) {
        themeSwitch.addEventListener('change', toggleTheme);
    }
});
