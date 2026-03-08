document.addEventListener('DOMContentLoaded', () => {
    // User authentication state
    let isLoggedIn = false;
    
    // Check if user is logged in from local storage
    const storedUser = localStorage.getItem('habeshaHeartsUser');
    if (storedUser) {
        isLoggedIn = true;
        const userData = JSON.parse(storedUser);
        console.log('Welcome back,', userData.name);
    } else {
        // Defer modal so initial card paint is not blocked.
        const showLater = () => setTimeout(showAuthModal, 80);
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(showLater, { timeout: 500 });
        } else {
            requestAnimationFrame(showLater);
        }
    }
    
    // Initialize profiles data
    const profiles = [
        {
            name: "Mehalet",
            age: 32,
            location: "Addis Ababa",
            bio: "Doctor who loves traditional Ethiopian cuisine and hiking in the mountains. Looking for someone to explore Addis with!",
            interests: ["Coffee Ceremonies", "Music", "Travel", "Cooking"]
        },
        {
            name: "Dawit",
            age: 32,
            location: "Dire Dawa",
            bio: "Software engineer with a passion for Ethiopian jazz and modern art. I enjoy weekend trips to historical sites and trying new restaurants.",
            interests: ["Technology", "Jazz", "History", "Food"]
        },
        {
            name: "Ghion",
            age: 26,
            location: "Bahir Dar",
            bio: "University professor teaching literature. I love poetry, traditional dance, and spending time near Lake Tana. Looking for a thoughtful companion.",
            interests: ["Literature", "Dance", "Nature", "Teaching"]
        },
        {
            name: "Sem",
            age: 42,
            location: "Gondar",
            bio: "Photographer capturing Ethiopia's beauty. When not behind the camera, I enjoy trekking and playing guitar. Seeking someone adventurous.",
            interests: ["Photography", "Music", "Outdoors", "Art"]
        },
        {
            name: "Bethlehem",
            age: 27,
            location: "Hawassa",
            bio: "Chef specializing in fusion Ethiopian cuisine. I spend my free time at local markets finding ingredients and swimming in Lake Hawassa.",
            interests: ["Cooking", "Swimming", "Markets", "Travel"]
        }
    ];
    
    let currentProfileIndex = 0;
    
    // Display initial profile
    displayCurrentProfile();
    
    // Navigation button functionality
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', (event) => {
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Add ripple effect on click
            const ripple = document.createElement('span');
            ripple.classList.add('nav-ripple');
            btn.appendChild(ripple);
            
            const rect = btn.getBoundingClientRect();
            ripple.style.width = ripple.style.height = Math.max(rect.width, rect.height) + 'px';
            ripple.style.left = (event.clientX - rect.left - ripple.offsetWidth / 2) + 'px';
            ripple.style.top = (event.clientY - rect.top - ripple.offsetHeight / 2) + 'px';
            
            ripple.classList.add('show');
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Card action buttons interactions
    const likeBtn = document.querySelector('.like-btn');
    const skipBtn = document.querySelector('.skip-btn');
    const messageBtn = document.querySelector('.message-btn');
    
    likeBtn.addEventListener('click', () => {
        // Enhanced like animation
        likeBtn.style.transform = 'scale(1.2) rotate(10deg)';
        
        // Add heart particles
        createHeartParticles();
        
        setTimeout(() => {
            likeBtn.style.transform = 'scale(1)';
            // Move to next profile after liking
            moveToNextProfile();
        }, 300);
    });
    
    skipBtn.addEventListener('click', () => {
        // Enhanced skip animation
        const card = document.querySelector('.profile-card');
        card.style.transform = 'translateX(-100px) rotate(-5deg)';
        card.style.opacity = '0';
        card.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.transform = 'translateX(100px) rotate(5deg)';
            
            // Move to next profile
            moveToNextProfile();
            
            setTimeout(() => {
                card.style.transform = '';
                card.style.opacity = '1';
            }, 50);
        }, 500);
    });
    
    messageBtn.addEventListener('click', () => {
        // Simulate opening a chat
        messageBtn.classList.add('active');
        const navMessage = document.querySelectorAll('.nav-btn')[1];
        navBtns.forEach(b => b.classList.remove('active'));
        navMessage.classList.add('active');
        // Could open a message interface here
    });

    // Function to display current profile
    function displayCurrentProfile() {
        const profile = profiles[currentProfileIndex];
        const profileCard = document.querySelector('.profile-card');
        
        // Update profile data in the DOM
        profileCard.querySelector('.profile-info h2').textContent = `${profile.name}, ${profile.age}`;
        profileCard.querySelector('.profile-info p').innerHTML = `<span class="location-icon">📍</span> ${profile.location}`;
        profileCard.querySelector('.profile-bio p').textContent = profile.bio;
        
        // Update interests
        const interestsContainer = profileCard.querySelector('.profile-interests');
        interestsContainer.innerHTML = '';
        profile.interests.forEach(interest => {
            const tag = document.createElement('span');
            tag.classList.add('interest-tag');
            tag.textContent = interest;
            interestsContainer.appendChild(tag);
        });
        
        // Randomize profile photo pattern
        updateProfilePhoto();
    }
    
    // Function to move to next profile
    function moveToNextProfile() {
        currentProfileIndex = (currentProfileIndex + 1) % profiles.length;
        displayCurrentProfile();
    }
    
    // Function to update profile photo with random pattern
    function updateProfilePhoto() {
        const colors = ['#006b3f', '#fcd116', '#b71c1c', '#9c27b0', '#2196f3'];
        const photoSvg = document.querySelector('.profile-photo svg');
        
        // Randomly select colors for the pattern
        const color1 = colors[Math.floor(Math.random() * colors.length)];
        const color2 = colors[Math.floor(Math.random() * colors.length)];
        const color3 = colors[Math.floor(Math.random() * colors.length)];
        
        // Update pattern colors
        const pattern = photoSvg.querySelector('pattern');
        const rects = pattern.querySelectorAll('rect');
        rects[0].setAttribute('fill', color1);
        rects[1].setAttribute('fill', color2);
        rects[3].setAttribute('fill', color3);
    }

    // Function to create heart particles on like
    function createHeartParticles() {
        const container = document.querySelector('.profile-card');
        const likeBtn = document.querySelector('.like-btn');
        const btnRect = likeBtn.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        const originX = btnRect.left + btnRect.width/2 - containerRect.left;
        const originY = btnRect.top + btnRect.height/2 - containerRect.top;
        
        for (let i = 0; i < 6; i++) {
            const particle = document.createElement('div');
            particle.innerHTML = `
                <svg viewBox="0 0 24 24" width="12" height="12">
                    <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z" fill="var(--primary)"/>
                </svg>
            `;
            particle.classList.add('heart-particle');
            container.appendChild(particle);
            
            const angle = Math.random() * Math.PI * 2;
            const distance = 30 + Math.random() * 80;
            const duration = 500 + Math.random() * 1000;
            
            particle.style.left = `${originX}px`;
            particle.style.top = `${originY}px`;
            
            // Random animation
            particle.animate([
                { 
                    transform: 'translate(-50%, -50%) scale(0.2)',
                    opacity: 1
                },
                { 
                    transform: `translate(
                        calc(-50% + ${Math.cos(angle) * distance}px), 
                        calc(-50% + ${Math.sin(angle) * distance}px)
                    ) scale(${0.5 + Math.random()})`,
                    opacity: 0
                }
            ], {
                duration: duration,
                easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            });
            
            // Remove particle after animation
            setTimeout(() => {
                particle.remove();
            }, duration);
        }
    }
    
    // Enhanced match thumbnails interactions
    const matchThumbnails = document.querySelectorAll('.match-thumbnail');
    matchThumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('mouseenter', () => {
            thumbnail.style.transform = 'translateY(-5px)';
            thumbnail.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        });
        
        thumbnail.addEventListener('mouseleave', () => {
            thumbnail.style.transform = 'translateY(0)';
        });
        
        thumbnail.addEventListener('click', () => {
            thumbnail.animate([
                { transform: 'scale(0.95)' },
                { transform: 'scale(1.05)' },
                { transform: 'scale(1)' }
            ], {
                duration: 300,
                easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            });
        });
    });
    
    // Function to show authentication modal
    function showAuthModal() {
        // Create modal if it doesn't exist
        if (!document.querySelector('.auth-modal-overlay')) {
            createAuthModal();
        }
        
        const modal = document.querySelector('.auth-modal');
        const overlay = document.querySelector('.auth-modal-overlay');
        
        overlay.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    }
    
    // Function to create auth modal
    function createAuthModal() {
        const overlay = document.createElement('div');
        overlay.classList.add('auth-modal-overlay');
        
        overlay.innerHTML = `
            <div class="auth-modal">
                <div class="auth-header">
                    <h2>Join Habesha Hearts</h2>
                    <button class="auth-modal-close">&times;</button>
                </div>
                <div class="auth-body">
                    <div id="login-form">
                        <div class="form-group">
                            <label for="login-email">Email</label>
                            <input type="email" id="login-email" placeholder="Your email">
                            <div class="form-error" id="login-email-error">Please enter a valid email</div>
                        </div>
                        <div class="form-group">
                            <label for="login-password">Password</label>
                            <input type="password" id="login-password" placeholder="Your password">
                            <div class="form-error" id="login-password-error">Password must be at least 6 characters</div>
                        </div>
                        <div class="auth-actions">
                            <button class="auth-btn primary" id="login-btn">Log In</button>
                            <button class="auth-btn secondary" id="guest-btn">Continue as Guest</button>
                        </div>
                        <div class="auth-form-switch">
                            Don't have an account? <a id="show-signup">Sign Up</a>
                        </div>
                    </div>
                    
                    <div id="signup-form" style="display: none;">
                        <div class="form-group">
                            <label for="signup-name">Full Name</label>
                            <input type="text" id="signup-name" placeholder="Your name">
                            <div class="form-error" id="signup-name-error">Please enter your name</div>
                        </div>
                        <div class="form-group">
                            <label for="signup-email">Email</label>
                            <input type="email" id="signup-email" placeholder="Your email">
                            <div class="form-error" id="signup-email-error">Please enter a valid email</div>
                        </div>
                        <div class="form-group">
                            <label for="signup-password">Password</label>
                            <input type="password" id="signup-password" placeholder="Create a password">
                            <div class="form-error" id="signup-password-error">Password must be at least 6 characters</div>
                        </div>
                        <div class="form-group">
                            <label for="signup-age">Age</label>
                            <input type="number" id="signup-age" placeholder="Your age" min="18" max="120">
                            <div class="form-error" id="signup-age-error">You must be at least 18 years old</div>
                        </div>
                        <div class="form-group">
                            <label for="signup-location">Location</label>
                            <input type="text" id="signup-location" placeholder="Your city">
                            <div class="form-error" id="signup-location-error">Please enter your location</div>
                        </div>
                        <div class="auth-actions">
                            <button class="auth-btn primary" id="signup-btn">Create Account</button>
                        </div>
                        <div class="form-terms">
                            By signing up, you agree to our Terms of Service and Privacy Policy
                        </div>
                        <div class="auth-form-switch">
                            Already have an account? <a id="show-login">Log In</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Setup event listeners for the modal
        setupAuthListeners();
    }
    
    // Function to setup auth modal listeners
    function setupAuthListeners() {
        const overlay = document.querySelector('.auth-modal-overlay');
        const closeBtn = document.querySelector('.auth-modal-close');
        const showSignupBtn = document.getElementById('show-signup');
        const showLoginBtn = document.getElementById('show-login');
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        const loginBtn = document.getElementById('login-btn');
        const signupBtn = document.getElementById('signup-btn');
        const guestBtn = document.getElementById('guest-btn');
        
        // Close modal when clicking X
        closeBtn.addEventListener('click', () => {
            hideAuthModal();
        });
        
        // Close modal when clicking outside
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                hideAuthModal();
            }
        });
        
        // Switch between login and signup forms
        showSignupBtn.addEventListener('click', () => {
            loginForm.style.display = 'none';
            signupForm.style.display = 'block';
        });
        
        showLoginBtn.addEventListener('click', () => {
            signupForm.style.display = 'none';
            loginForm.style.display = 'block';
        });
        
        // Login functionality
        loginBtn.addEventListener('click', () => {
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            // Simple validation
            let isValid = true;
            
            if (!isValidEmail(email)) {
                document.getElementById('login-email-error').classList.add('visible');
                isValid = false;
            } else {
                document.getElementById('login-email-error').classList.remove('visible');
            }
            
            if (!password || password.length < 6) {
                document.getElementById('login-password-error').classList.add('visible');
                isValid = false;
            } else {
                document.getElementById('login-password-error').classList.remove('visible');
            }
            
            if (isValid) {
                // Check if user exists in local storage
                const users = JSON.parse(localStorage.getItem('habeshaHeartsUsers') || '[]');
                const user = users.find(u => u.email === email && u.password === password);
                
                if (user) {
                    // Log user in
                    localStorage.setItem('habeshaHeartsUser', JSON.stringify(user));
                    isLoggedIn = true;
                    hideAuthModal();
                    showUserWelcome(user.name);
                } else {
                    alert('Invalid email or password. Please try again.');
                }
            }
        });
        
        // Signup functionality
        signupBtn.addEventListener('click', () => {
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const age = document.getElementById('signup-age').value;
            const location = document.getElementById('signup-location').value;
            
            // Simple validation
            let isValid = true;
            
            if (!name) {
                document.getElementById('signup-name-error').classList.add('visible');
                isValid = false;
            } else {
                document.getElementById('signup-name-error').classList.remove('visible');
            }
            
            if (!isValidEmail(email)) {
                document.getElementById('signup-email-error').classList.add('visible');
                isValid = false;
            } else {
                document.getElementById('signup-email-error').classList.remove('visible');
            }
            
            if (!password || password.length < 6) {
                document.getElementById('signup-password-error').classList.add('visible');
                isValid = false;
            } else {
                document.getElementById('signup-password-error').classList.remove('visible');
            }
            
            if (!age || age < 18) {
                document.getElementById('signup-age-error').classList.add('visible');
                isValid = false;
            } else {
                document.getElementById('signup-age-error').classList.remove('visible');
            }
            
            if (!location) {
                document.getElementById('signup-location-error').classList.add('visible');
                isValid = false;
            } else {
                document.getElementById('signup-location-error').classList.remove('visible');
            }
            
            if (isValid) {
                // Create new user
                const newUser = {
                    name,
                    email,
                    password,
                    age,
                    location,
                    joinDate: new Date().toISOString(),
                    interests: []
                };
                
                // Add to users list
                const users = JSON.parse(localStorage.getItem('habeshaHeartsUsers') || '[]');
                
                // Check if email already exists
                if (users.some(u => u.email === email)) {
                    alert('This email is already registered. Please log in instead.');
                    return;
                }
                
                users.push(newUser);
                localStorage.setItem('habeshaHeartsUsers', JSON.stringify(users));
                
                // Log in the new user
                localStorage.setItem('habeshaHeartsUser', JSON.stringify(newUser));
                isLoggedIn = true;
                hideAuthModal();
                showUserWelcome(newUser.name);
            }
        });
        
        // Guest login
        guestBtn.addEventListener('click', () => {
            hideAuthModal();
        });
    }
    
    // Function to hide auth modal
    function hideAuthModal() {
        const modal = document.querySelector('.auth-modal');
        modal.classList.remove('active');
        
        setTimeout(() => {
            document.querySelector('.auth-modal-overlay').style.display = 'none';
        }, 300);
    }
    
    // Function to show welcome message
    function showUserWelcome(name) {
        const welcomeToast = document.createElement('div');
        welcomeToast.style.position = 'fixed';
        welcomeToast.style.bottom = '20px';
        welcomeToast.style.left = '50%';
        welcomeToast.style.transform = 'translateX(-50%)';
        welcomeToast.style.backgroundColor = 'var(--primary)';
        welcomeToast.style.color = 'white';
        welcomeToast.style.padding = '10px 20px';
        welcomeToast.style.borderRadius = '5px';
        welcomeToast.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
        welcomeToast.style.zIndex = '1000';
        welcomeToast.style.transition = 'all 0.3s ease';
        welcomeToast.style.opacity = '0';
        
        welcomeToast.textContent = `Welcome, ${name}! Happy matching!`;
        
        document.body.appendChild(welcomeToast);
        
        setTimeout(() => {
            welcomeToast.style.opacity = '1';
            welcomeToast.style.transform = 'translateX(-50%) translateY(-10px)';
        }, 10);
        
        setTimeout(() => {
            welcomeToast.style.opacity = '0';
            welcomeToast.style.transform = 'translateX(-50%) translateY(10px)';
            
            setTimeout(() => {
                welcomeToast.remove();
            }, 300);
        }, 3000);
    }
    
    // Helper function to validate email
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Add logout option to profile button
    const profileBtn = document.querySelectorAll('.nav-btn')[2];
    profileBtn.addEventListener('click', () => {
        if (isLoggedIn) {
            // Show logout confirmation
            if (confirm('Do you want to log out?')) {
                localStorage.removeItem('habeshaHeartsUser');
                isLoggedIn = false;
                showAuthModal();
            }
        } else {
            showAuthModal();
        }
    });
});
