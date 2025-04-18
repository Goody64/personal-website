document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('toggleMode');

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
  