const THEME_KEY = 'deepwoken-theme';

function loadTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const themeSwitch = document.getElementById('theme-switch');
    const themeLabel = document.getElementById('theme-label');
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        if (themeSwitch) themeSwitch.checked = true;
    } else {
        document.body.classList.remove('dark-theme');
        if (themeSwitch) themeSwitch.checked = false;
    }
    
    updateThemeLabel();
}

function updateThemeLabel() {
    const themeLabel = document.getElementById('theme-label');
    if (themeLabel) {
        themeLabel.textContent = document.body.classList.contains('dark-theme') ? 'Dark' : 'Light';
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    if (document.body.classList.contains('dark-theme')) {
        localStorage.setItem(THEME_KEY, 'dark');
    } else {
        localStorage.setItem(THEME_KEY, 'light');
    }
    updateThemeLabel();
}

document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
    
    const themeSwitch = document.getElementById('theme-switch');
    if (themeSwitch) {
        themeSwitch.addEventListener('change', toggleTheme);
    }
});
