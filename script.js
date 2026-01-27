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
    const originalTable = document.getElementById('echo-tasks');
    
    if (tableWrapper.querySelectorAll('table').length > 1) {
        makeRowsClickable();
        return;
    }
    
    const tbody = originalTable.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    const defeatRows = [];
    const normalRows = [];
    
    rows.forEach(row => {
        if (isDefeatTask(row)) {
            defeatRows.push(row);
        } else {
            normalRows.push(row);
        }
    });
    
    const savedState = localStorage.getItem(STORAGE_KEY);
    const currentState = {};
    if (savedState) {
        const state = JSON.parse(savedState);
        Object.assign(currentState, state);
    } else {
        const checkboxes = originalTable.querySelectorAll('input[type="checkbox"][data-row-id]');
        checkboxes.forEach(checkbox => {
            const rowId = checkbox.getAttribute('data-row-id');
            if (rowId) {
                currentState[rowId] = checkbox.checked;
            }
        });
    }
    
    tableWrapper.innerHTML = '';
    
    const normalRowsPerColumn = Math.ceil(normalRows.length / 2);
    
    for (let col = 0; col < 2; col++) {
        const table = document.createElement('table');
        table.className = 'table-progress-tracking sortable';
        
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const th1 = document.createElement('th');
        th1.className = 'table-progress-tracking-header headerSort';
        th1.innerHTML = `
            <div class="header_icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="19" height="18" viewBox="0 0 19 18" fill="currentColor">
                    <path d="M9.95044 0C14.921 0 18.9504 4.02944 18.9504 9C18.9504 13.9706 14.921 18 9.95044 18C4.97988 18 0.950439 13.9706 0.950439 9C0.950439 4.02944 4.97988 0 9.95044 0ZM9.95044 2C6.08445 2 2.95044 5.13401 2.95044 9C2.95044 12.866 6.08445 16 9.95044 16C13.8164 16 16.9504 12.866 16.9504 9C16.9504 5.13401 13.8164 2 9.95044 2ZM12.2434 6.29297C12.6343 5.90205 13.2665 5.90222 13.6575 6.29297C14.0485 6.68397 14.0485 7.31603 13.6575 7.70703L9.65747 11.707C9.46247 11.902 9.20644 12 8.95044 12C8.69452 11.9999 8.43834 11.902 8.24341 11.707L6.24341 9.70703C5.85266 9.31601 5.85249 8.68389 6.24341 8.29297C6.63433 7.90205 7.26645 7.90222 7.65747 8.29297L8.95044 9.58594L12.2434 6.29297Z"></path>
                </svg>
            </div>
        `;
        
        const th2 = document.createElement('th');
        th2.className = 'unsortable';
        th2.textContent = 'Echo Reward';
        
        const th3 = document.createElement('th');
        th3.className = 'unsortable';
        th3.textContent = 'Triumphs';
        
        headerRow.appendChild(th1);
        headerRow.appendChild(th2);
        headerRow.appendChild(th3);
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        const newTbody = document.createElement('tbody');
        const startIndex = col * normalRowsPerColumn;
        const endIndex = Math.min(startIndex + normalRowsPerColumn, normalRows.length);
        
        for (let i = startIndex; i < endIndex; i++) {
            if (normalRows[i]) {
                const clonedRow = normalRows[i].cloneNode(true);
                const checkbox = clonedRow.querySelector('input[type="checkbox"][data-row-id]');
                if (checkbox) {
                    const rowId = checkbox.getAttribute('data-row-id');
                    if (rowId && currentState[rowId]) {
                        checkbox.checked = true;
                    }
                }
                newTbody.appendChild(clonedRow);
            }
        }
        
        table.appendChild(newTbody);
        tableWrapper.appendChild(table);
    }
    
    if (defeatRows.length > 0) {
        const defeatTable = document.createElement('table');
        defeatTable.className = 'table-progress-tracking sortable defeat-table';
        
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const th1 = document.createElement('th');
        th1.className = 'table-progress-tracking-header headerSort';
        th1.innerHTML = `
            <div class="header_icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="19" height="18" viewBox="0 0 19 18" fill="currentColor">
                    <path d="M9.95044 0C14.921 0 18.9504 4.02944 18.9504 9C18.9504 13.9706 14.921 18 9.95044 18C4.97988 18 0.950439 13.9706 0.950439 9C0.950439 4.02944 4.97988 0 9.95044 0ZM9.95044 2C6.08445 2 2.95044 5.13401 2.95044 9C2.95044 12.866 6.08445 16 9.95044 16C13.8164 16 16.9504 12.866 16.9504 9C16.9504 5.13401 13.8164 2 9.95044 2ZM12.2434 6.29297C12.6343 5.90205 13.2665 5.90222 13.6575 6.29297C14.0485 6.68397 14.0485 7.31603 13.6575 7.70703L9.65747 11.707C9.46247 11.902 9.20644 12 8.95044 12C8.69452 11.9999 8.43834 11.902 8.24341 11.707L6.24341 9.70703C5.85266 9.31601 5.85249 8.68389 6.24341 8.29297C6.63433 7.90205 7.26645 7.90222 7.65747 8.29297L8.95044 9.58594L12.2434 6.29297Z"></path>
                </svg>
            </div>
        `;
        
        const th2 = document.createElement('th');
        th2.className = 'unsortable';
        th2.textContent = 'Echo Reward';
        
        const th3 = document.createElement('th');
        th3.className = 'unsortable';
        th3.textContent = 'Triumphs';
        
        headerRow.appendChild(th1);
        headerRow.appendChild(th2);
        headerRow.appendChild(th3);
        thead.appendChild(headerRow);
        defeatTable.appendChild(thead);
        
        const defeatTbody = document.createElement('tbody');
        defeatRows.forEach(row => {
            const clonedRow = row.cloneNode(true);
            const checkbox = clonedRow.querySelector('input[type="checkbox"][data-row-id]');
            if (checkbox) {
                const rowId = checkbox.getAttribute('data-row-id');
                if (rowId && currentState[rowId]) {
                    checkbox.checked = true;
                }
            }
            defeatTbody.appendChild(clonedRow);
        });
        
        defeatTable.appendChild(defeatTbody);
        tableWrapper.appendChild(defeatTable);
    }
    
    const newCheckboxes = tableWrapper.querySelectorAll('input[type="checkbox"][data-row-id]');
    newCheckboxes.forEach(checkbox => {
        const newCheckbox = checkbox.cloneNode(true);
        checkbox.parentNode.replaceChild(newCheckbox, checkbox);
        
        newCheckbox.addEventListener('change', function() {
            saveState();
        });
    });
    
    makeRowsClickable();
    
    updateStats();
}

document.addEventListener('DOMContentLoaded', () => {
    const savedName = localStorage.getItem(CHARACTER_NAME_KEY);
    if (savedName) {
        document.getElementById('character-name').value = savedName;
    }
    
    loadAttempts();
    
    loadTheme();
    
    reorganizeTable();
    
    const characterNameInput = document.getElementById('character-name');
    characterNameInput.addEventListener('input', saveState);
    
    document.getElementById('reset-btn').addEventListener('click', resetAll);
    
    document.getElementById('increase-attempts').addEventListener('click', increaseAttempts);
    document.getElementById('decrease-attempts').addEventListener('click', decreaseAttempts);
    
    document.getElementById('theme-switch').addEventListener('change', toggleTheme);
    
    updateStats();
});
