document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for anchor links
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                const offsetTop = targetElement.offsetTop;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Fade-in effect for elements when they come into view
    const fadeInElements = document.querySelectorAll('.fade-in');
    const options = {
        threshold: 0.5
    };
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.intersectionRatio > 0) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, options);

    fadeInElements.forEach(element => {
        observer.observe(element);
    });

    // Add bounce effect to elements
    const bounceElements = document.querySelectorAll('.bounce');
    bounceElements.forEach(element => {
        element.addEventListener('mouseover', function() {
            this.style.transform = 'scale(1.1)';
        });
        element.addEventListener('mouseout', function() {
            this.style.transform = 'scale(1)';
        });
    });

    // Typing effect for text
    const typingElements = document.querySelectorAll('.typing');
    typingElements.forEach(element => {
        const text = element.textContent;
        element.textContent = '';
        let i = 0;
        const typingInterval = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typingInterval);
            }
        }, 50);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const openPopupBtn = document.getElementById('openPopupBtn');
    const closePopupBtn = document.getElementById('closePopupBtn');
    const popup = document.getElementById('popup');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    // Function to open the popup
    openPopupBtn.addEventListener('click', () => {
        popup.style.display = 'block';
    });

    // Function to close the popup
    closePopupBtn.addEventListener('click', () => {
        popup.style.display = 'none';
    });

    // Close popup if user clicks outside of it
    window.addEventListener('click', (event) => {
        if (event.target === popup) {
            popup.style.display = 'none';
        }
    });

    // Function to handle login form submission
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const loginEmail = document.getElementById('loginEmail').value;
        const loginPassword = document.getElementById('loginPassword').value;

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: loginEmail,
                    password: loginPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Login successful');
                // Optionally redirect to another page or update UI
            } else {
                alert('Login failed: ' + data.message);
            }
        } catch (error) {
            console.error('Error logging in:', error);
            alert('Login failed. Please try again later.');
        }
    });

    // Function to handle signup form submission
    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const signupEmail = document.getElementById('signupEmail').value;
        const signupPassword = document.getElementById('signupPassword').value;

        try {
            const response = await fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: signupEmail,
                    password: signupPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Signup successful. Please check your email for confirmation.');
                // Optionally redirect to another page or update UI
            } else {
                alert('Signup failed: ' + data.message);
            }
        } catch (error) {
            console.error('Error signing up:', error);
            alert('Signup failed. Please try again later.');
        }
    });
});