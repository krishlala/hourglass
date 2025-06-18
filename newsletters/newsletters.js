const newsletterForm = document.getElementById('newsletterForm');
const popup = document.getElementById('popup');
const closePopupBtn = document.getElementById('closePopupBtn');

newsletterForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    // Simulate successful form submission
    popup.style.display = 'block';
    newsletterForm.reset();
});

closePopupBtn?.addEventListener('click', () => {
    popup.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === popup) {
        popup.style.display = 'none';
    }
});
