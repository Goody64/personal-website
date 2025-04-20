document.addEventListener('DOMContentLoaded', () => {
const toggleButton = document.getElementById('toggleMode');
// Toggle light and dark modes
const updateText = () => {
    if (document.body.classList.contains('dark-mode')) {
    toggleButton.textContent = 'Switch to Light Mode';
    } else {
    toggleButton.textContent = 'Switch to Dark Mode';
    }
};

toggleButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    updateText();
});

updateText(); 
});

const buttons = document.querySelectorAll('.expand-btn');
// Expand PinguType card when viewing project
buttons.forEach(button => {
button.addEventListener('click', () => {
    const card = button.closest('.project-card');
    const grid = card.closest('.projects-grid');
    
    const isExpanding = !card.classList.contains('expanded');

    document.querySelectorAll('.project-card.expanded').forEach(expandedCard => {
    expandedCard.classList.remove('expanded');
    });

    if (!isExpanding) {
    grid.classList.remove('expanded-mode');
    button.textContent = 'Show Project';
    return;
    }

    card.classList.add('expanded');
    grid.classList.add('expanded-mode');
    button.textContent = 'Hide Project';
});
});


let scrollLockTop = null;


const iframe = document.querySelector('#pingutype-iframe');

// Prevent auto-scrolling when using iFrame
iframe.addEventListener('mouseenter', () => {
scrollLockTop = window.scrollY;
});

iframe.addEventListener('mouseleave', () => {
scrollLockTop = null;
});

window.addEventListener('scroll', () => {
if (scrollLockTop !== null) {
    window.scrollTo({
    top: scrollLockTop,
    behavior: 'instant'
    });
}
});