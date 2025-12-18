/**
 * Enhanced Authentication Module
 * Handles user login, registration, and face verification with language support
 */

class AuthManager {
    constructor() {
        this.cameraStream = null;
        this.faceCaptured = false;
        this.maxLoginAttempts = 3;
        this.lockoutTime = 15 * 60 * 1000; // 15 minutes
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupAuthModals();
        this.checkExistingSession();
    }

    setupEventListeners() {
        console.log('Setting up auth event listeners...');
        
        // Auth buttons in header
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const logoutBtn = document.getElementById('logoutBtn');

        if (loginBtn) {
            console.log('Login button found, adding listener');
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openAuthModal('login');
            });
        } else {
            console.log('Login button NOT found');
        }

        if (registerBtn) {
            console.log('Register button found, adding listener');
            registerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openAuthModal('register');
            });
        } else {
            console.log('Register button NOT found');
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }

        // Auth form submissions
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        if (loginForm) {
            console.log('Login form found, adding listener');
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin(e);
            });
        }

        if (registerForm) {
            console.log('Register form found, adding listener');
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister(e);
            });
        }

        // Input validation
        document.getElementById('registerDob')?.addEventListener('change', () => {
            this.validateAge();
        });

        document.getElementById('registerId')?.addEventListener('input', (e) => {
            this.validateUserId(e.target.value);
        });

        document.getElementById('registerEmail')?.addEventListener('blur', (e) => {
            this.validateEmail(e.target.value);
        });

        // Password visibility toggle
        document.querySelectorAll('.toggle-password').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                this.togglePasswordVisibility(e.target);
            });
        });
    }

    setupAuthModals() {
        // Tab switching in auth modal
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('data-tab');
                this.switchAuthTab(tabName);
            });
        });

        // Close modal handlers
        document.querySelectorAll('.close, .cancel-btn').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                this.closeAuthModal();
            });
        });

        // Close modal when clicking outside
        document.getElementById('authModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'authModal') {
                this.closeAuthModal();
            }
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('authModal')?.style.display === 'block') {
                this.closeAuthModal();
            }
        });
    }

    checkExistingSession() {
        const currentUser = this.getCurrentUser();
        if (currentUser) {
            this.updateUIForLoggedInUser(currentUser);
        }
    }

    getCurrentUser() {
        try {
            const userData = localStorage.getItem('currentUser');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            this.clearSession();
            return null;
        }
    }

    updateUIForLoggedInUser(user) {
        // Update navigation
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const userInfo = document.getElementById('userInfo');

        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'block';
        if (userInfo) {
            userInfo.style.display = 'block';
            userInfo.textContent = `Welcome, ${user.name}`;
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const userId = document.getElementById('loginId').value.trim();
        const password = document.getElementById('loginPassword').value;
        const loginBtn = document.querySelector('#loginForm button[type="submit"]');
        
        console.log('Login attempt for user:', userId);
        
        // Check if account is temporarily locked
        if (this.isAccountLocked(userId)) {
            const remainingTime = this.getRemainingLockoutTime(userId);
            this.showNotification(`Account temporarily locked. Try again in ${Math.ceil(remainingTime / 60000)} minutes.`, 'error');
            return;
        }
        
        // Validate inputs
        if (!userId || !password) {
            this.showNotification('Please enter both ID and password', 'error');
            return;
        }
        
        // Show loading state
        const originalText = loginBtn.innerHTML;
        loginBtn.innerHTML = '<div class="loading-spinner-small"></div> Verifying...';
        loginBtn.disabled = true;
        
        try {
            // Try API login first, then fallback
            let result;
            try {
                console.log('Trying API login...');
                result = await this.apiLogin({
                    userId: userId,
                    password: password
                });
                console.log('API login successful');
            } catch (apiError) {
                console.log('API login failed, trying fallback:', apiError);
                result = await this.fallbackLogin({
                    userId: userId,
                    password: password
                });
                console.log('Fallback login successful');
            }
            
            // Reset failed attempts on successful login
            this.resetFailedAttempts(userId);
            
            // Store user session securely
            this.storeUserSession(result.user);
            this.closeAuthModal();
            
            const successMessage = `Welcome back, ${result.user.name}!`;
            this.showNotification(successMessage, 'success');
            
            // Update UI and reload
            this.updateUIForLoggedInUser(result.user);
            setTimeout(() => location.reload(), 1000);
            
        } catch (error) {
            // Increment failed attempts
            this.recordFailedAttempt(userId);
            
            const remainingAttempts = this.getRemainingAttempts(userId);
            const errorMessage = remainingAttempts > 0 
                ? `${error.message} ${remainingAttempts} attempts remaining.`
                : 'Account locked due to too many failed attempts. Please try again later.';
                
            this.showNotification(errorMessage, 'error');
            console.error('Login error:', error);
        } finally {
            loginBtn.innerHTML = originalText;
            loginBtn.disabled = false;
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        console.log('Registration attempt started...');
        
        try {
            // Get form values
            const name = document.getElementById('registerName').value.trim();
            const userId = document.getElementById('registerId').value.trim();
            const email = document.getElementById('registerEmail').value.trim();
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;
            const dob = document.getElementById('registerDob').value;
            const gender = document.querySelector('input[name="gender"]:checked');
            
            console.log('Form values:', { name, userId, email, dob, gender: gender?.value });
            
            const registerBtn = document.getElementById('registerSubmit');
            const originalText = registerBtn.innerHTML;
            
            // Validate all fields
            const validation = this.validateRegistrationForm({
                name, userId, email, password, confirmPassword, dob, gender
            });
            
            if (!validation.isValid) {
                this.showNotification(validation.message, 'error');
                return;
            }
            
            // Show loading state
            registerBtn.innerHTML = '<div class="loading-spinner-small"></div> Creating Account...';
            registerBtn.disabled = true;
            
            // Prepare user data
            const userData = {
                userId: userId,
                name: name,
                email: email,
                password: password,
                dob: dob,
                gender: gender.value
            };
            
            console.log('Attempting registration with data:', userData);
            
            let result;
            
            // Try API registration first
            try {
                console.log('Trying API registration...');
                result = await this.apiRegister(userData);
                console.log('API registration successful:', result);
            } catch (apiError) {
                console.log('API registration failed, using fallback:', apiError);
                result = await this.fallbackRegister(userData);
                console.log('Fallback registration successful:', result);
            }

            // Store user session
            this.storeUserSession(result.user);
            this.closeAuthModal();
            
            const successMessage = `Registration successful! Welcome to SecureVote, ${name}.`;
            this.showNotification(successMessage, 'success');
            
            // Update UI and reload
            this.updateUIForLoggedInUser(result.user);
            setTimeout(() => location.reload(), 1500);
            
        } catch (error) {
            console.error('Registration error details:', error);
            this.showNotification(error.message || 'Registration failed. Please try again.', 'error');
        }
    }

    async apiLogin(credentials) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                'Accept': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            return data;
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                throw new Error('Cannot connect to server. Please check if the backend is running.');
            }
            throw error;
        }
    }

    async fallbackLogin(credentials) {
        // Enhanced fallback login for when backend is not available
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    console.log('Attempting fallback login for:', credentials.userId);
                    const users = JSON.parse(localStorage.getItem('demoUsers') || '{}');
                    const user = users[credentials.userId];
                    
                    console.log('Available users:', Object.keys(users));
                    
                    if (user && user.password === credentials.password) {
                        // Update last login
                        user.lastLogin = new Date().toISOString();
                        users[credentials.userId] = user;
                        localStorage.setItem('demoUsers', JSON.stringify(users));
                        
                        resolve({
                            success: true,
                            user: {
                                id: user.id,
                                name: user.name,
                                email: user.email
                            }
                        });
                    } else {
                        reject(new Error('Invalid credentials. Please check your User ID and password.'));
                    }
                } catch (error) {
                    console.error('Fallback login error:', error);
                    reject(new Error('Login failed in fallback mode.'));
                }
            }, 1000);
        });
    }

    async apiRegister(userData) {
        try {
            console.log('Making API call to /api/auth/register with data:', userData);
            
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                'Accept': 'application/json'
                },
                body: JSON.stringify({
                    userId: userData.userId,
                    name: userData.name,
                    email: userData.email,
                    password: userData.password,
                    dob: userData.dob,
                    gender: userData.gender
                })
            });

            console.log('API response status:', response.status);
            
            const data = await response.json();
            console.log('API response data:', data);

            if (!response.ok) {
                throw new Error(data.error || `Registration failed with status: ${response.status}`);
            }

            // Return user data for session storage
            return {
                success: true,
                user: {
                    id: userData.userId,
                    name: userData.name,
                    email: userData.email
                }
            };
        } catch (error) {
            console.error('API registration error:', error);
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                throw new Error('Cannot connect to server. Using demo registration instead.');
            }
            throw error;
        }
    }

    async fallbackRegister(userData) {
        // Enhanced fallback registration for when backend is not available
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    console.log('Starting fallback registration for:', userData.userId);
                    
                    // Store user data in localStorage for demo purposes
                    const users = JSON.parse(localStorage.getItem('demoUsers') || '{}');
                    
                    // Check if user already exists
                    if (users[userData.userId]) {
                        reject(new Error('User ID already exists. Please choose a different ID.'));
                        return;
                    }
                    
                    // Check if email already exists
                    const existingUser = Object.values(users).find(user => user.email === userData.email);
                    if (existingUser) {
                        reject(new Error('Email already exists. Please use a different email.'));
                        return;
                    }
                    
                    // Create new user
                    users[userData.userId] = {
                        id: userData.userId,
                        name: userData.name,
                        email: userData.email,
                        password: userData.password, // In real app, this should be hashed
                        dob: userData.dob,
                        gender: userData.gender,
                        registeredAt: new Date().toISOString(),
                        hasVoted: false,
                        lastLogin: null
                    };
                    
                    localStorage.setItem('demoUsers', JSON.stringify(users));
                    console.log('Fallback registration successful, users in storage:', Object.keys(users));
                    
                    resolve({
                        success: true,
                        user: {
                            id: userData.userId,
                            name: userData.name,
                            email: userData.email
                        }
                    });
                } catch (error) {
                    console.error('Fallback registration error:', error);
                    reject(new Error('Registration failed in fallback mode.'));
                }
            }, 1000);
        });
    }

    validateRegistrationForm(data) {
        const { name, userId, email, password, confirmPassword, dob, gender } = data;
        
        console.log('Validating form data:', data);
        
        // Check required fields
        if (!name || !userId || !email || !password || !confirmPassword || !dob || !gender) {
            return { isValid: false, message: 'Please fill in all required fields.' };
        }
        
        // Validate name
        if (name.length < 2 || name.length > 50) {
            return { isValid: false, message: 'Name must be between 2 and 50 characters.' };
        }
        
        // Validate user ID format - make it more flexible for testing
        if (!/^[A-Z0-9_-]{5,20}$/i.test(userId)) {
            return { isValid: false, message: 'User ID must be 5-20 alphanumeric characters (letters, numbers, -, _).' };
        }
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { isValid: false, message: 'Please enter a valid email address.' };
        }
        
        // Validate password strength - make it simpler for testing
        if (password.length < 6) {
            return { isValid: false, message: 'Password must be at least 6 characters long.' };
        }
        
        // Check password match
        if (password !== confirmPassword) {
            return { isValid: false, message: 'Passwords do not match.' };
        }
        
        // Validate age
        const ageValidation = this.validateAge(dob);
        if (!ageValidation.isValid) {
            return { isValid: false, message: ageValidation.message };
        }
        
        return { isValid: true, message: 'All fields are valid.' };
    }

    validateAge(dob) {
        const birthDate = new Date(dob);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        const isAdult = age > 18 || (age === 18 && monthDiff >= 0);
        
        if (!isAdult) {
            return { isValid: false, message: 'You must be 18 years or older to register.' };
        }
        
        // Check if age is reasonable (not over 120 years)
        if (age > 120) {
            return { isValid: false, message: 'Please enter a valid date of birth.' };
        }
        
        return { isValid: true, message: 'Age requirement satisfied.' };
    }

    validateUserId(userId) {
        if (!userId) return;
        
        const idRegex = /^[A-Z0-9_-]{5,20}$/i;
        const idMessage = document.getElementById('idMessage');
        
        if (!idRegex.test(userId)) {
            idMessage.innerHTML = '<i class="fas fa-times-circle"></i> ID must be 5-20 alphanumeric characters';
            idMessage.className = "message error";
            return false;
        } else {
            idMessage.innerHTML = '<i class="fas fa-check-circle"></i> ID format is valid';
            idMessage.className = "message success";
            return true;
        }
    }

    validateEmail(email) {
        if (!email) return;
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const emailMessage = document.getElementById('emailMessage');
        
        if (!emailRegex.test(email)) {
            emailMessage.innerHTML = '<i class="fas fa-times-circle"></i> Please enter a valid email address';
            emailMessage.className = "message error";
            return false;
        } else {
            emailMessage.innerHTML = '<i class="fas fa-check-circle"></i> Email format is valid';
            emailMessage.className = "message success";
            return true;
        }
    }

    // Security methods for login attempts
    recordFailedAttempt(userId) {
        const attempts = JSON.parse(localStorage.getItem('loginAttempts') || '{}');
        const userAttempts = attempts[userId] || { count: 0, lastAttempt: null };
        
        userAttempts.count++;
        userAttempts.lastAttempt = Date.now();
        
        attempts[userId] = userAttempts;
        localStorage.setItem('loginAttempts', JSON.stringify(attempts));
    }

    resetFailedAttempts(userId) {
        const attempts = JSON.parse(localStorage.getItem('loginAttempts') || '{}');
        delete attempts[userId];
        localStorage.setItem('loginAttempts', JSON.stringify(attempts));
    }

    isAccountLocked(userId) {
        const attempts = JSON.parse(localStorage.getItem('loginAttempts') || '{}');
        const userAttempts = attempts[userId];
        
        if (!userAttempts || userAttempts.count < this.maxLoginAttempts) {
            return false;
        }
        
        // Check if lockout period has expired
        const timeSinceLastAttempt = Date.now() - userAttempts.lastAttempt;
        return timeSinceLastAttempt < this.lockoutTime;
    }

    getRemainingLockoutTime(userId) {
        const attempts = JSON.parse(localStorage.getItem('loginAttempts') || '{}');
        const userAttempts = attempts[userId];
        
        if (!userAttempts || userAttempts.count < this.maxLoginAttempts) {
            return 0;
        }
        
        const timeSinceLastAttempt = Date.now() - userAttempts.lastAttempt;
        return Math.max(0, this.lockoutTime - timeSinceLastAttempt);
    }

    getRemainingAttempts(userId) {
        const attempts = JSON.parse(localStorage.getItem('loginAttempts') || '{}');
        const userAttempts = attempts[userId];
        
        if (!userAttempts) {
            return this.maxLoginAttempts;
        }
        
        return Math.max(0, this.maxLoginAttempts - userAttempts.count);
    }

    storeUserSession(user) {
        // Add session metadata
        const sessionData = {
            ...user,
            sessionStart: Date.now(),
            lastActivity: Date.now()
        };
        
        localStorage.setItem('currentUser', JSON.stringify(sessionData));
    }

    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            this.clearSession();
            this.showNotification('You have been logged out successfully.', 'success');
            setTimeout(() => location.reload(), 1000);
        }
    }

    clearSession() {
        localStorage.removeItem('currentUser');
        // Note: Don't clear face data as it might be needed for future verification
    }

    togglePasswordVisibility(toggleBtn) {
        const passwordInput = toggleBtn.closest('.password-input').querySelector('input');
        const icon = toggleBtn.querySelector('i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            passwordInput.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }

    /**
     * Initialize camera for face capture in registration
     */
    async initializeCamera() {
        const video = document.getElementById('video');
        const faceStatus = document.getElementById('faceStatus');
        const captureBtn = document.getElementById('captureFace');
        
        if (!video) {
            console.error('Video element not found');
            return;
        }

        try {
            // Stop any existing camera stream
            this.stopCamera();
            
            // Request camera access
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                } 
            });
            
            video.srcObject = stream;
            video.addEventListener('loadedmetadata', () => {
                video.play();
            });
            
            if (faceStatus) {
                faceStatus.innerHTML = '<i class="fas fa-check-circle"></i> Camera ready - Position your face in the frame';
                faceStatus.className = "status-message success";
            }
            
            if (captureBtn) {
                captureBtn.disabled = false;
            }
            
            this.cameraStream = stream;
            
        } catch (error) {
            console.error('Camera initialization error:', error);
            if (faceStatus) {
                faceStatus.innerHTML = `
                    <i class="fas fa-exclamation-triangle"></i> Camera access denied
                    <div class="error-details">Please allow camera access to complete registration</div>
                `;
                faceStatus.className = "status-message error";
            }
            if (captureBtn) {
                captureBtn.disabled = true;
            }
        }
    }

    /**
     * Capture face image for registration
     */
    captureFaceForRegistration() {
        const video = document.getElementById('video');
        const canvas = document.getElementById('canvas');
        const faceStatus = document.getElementById('faceStatus');
        const registerSubmit = document.getElementById('registerSubmit');
        const captureBtn = document.getElementById('captureFace');
        
        if (!video || !canvas) {
            console.error('Video or canvas element not found');
            return;
        }

        try {
            // Draw current video frame to canvas
            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Convert to data URL (in real app, you'd send this to your backend)
            const imageData = canvas.toDataURL('image/jpeg');
            
            // Store face data temporarily
            const userId = document.getElementById('registerId').value.trim();
            if (userId) {
                localStorage.setItem(`faceData_${userId}`, imageData);
            }
            
            // Update UI
            this.faceCaptured = true;
            
            if (faceStatus) {
                faceStatus.innerHTML = '<i class="fas fa-check-circle"></i> Face captured successfully!';
                faceStatus.className = "status-message success";
            }
            
            if (registerSubmit) {
                registerSubmit.disabled = false;
            }
            
            if (captureBtn) {
                captureBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Retake Photo';
                captureBtn.classList.add('retake');
            }
            
            // Stop camera after capture
            this.stopCamera();
            
        } catch (error) {
            console.error('Face capture error:', error);
            if (faceStatus) {
                faceStatus.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Failed to capture face. Please try again.';
                faceStatus.className = "status-message error";
            }
        }
    }

    /**
     * Stop camera stream
     */
    stopCamera() {
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => {
                track.stop();
            });
            this.cameraStream = null;
        }
        
        const video = document.getElementById('video');
        if (video && video.srcObject) {
            video.srcObject = null;
        }
    }

    /**
     * Setup camera event listeners
     */
    setupCameraListeners() {
        const captureBtn = document.getElementById('captureFace');
        if (captureBtn) {
            // Remove existing listeners to avoid duplicates
            captureBtn.replaceWith(captureBtn.cloneNode(true));
            
            // Get the new button reference
            const newCaptureBtn = document.getElementById('captureFace');
            newCaptureBtn.addEventListener('click', () => {
                if (this.faceCaptured) {
                    // Retake photo
                    this.faceCaptured = false;
                    this.initializeCamera();
                    newCaptureBtn.innerHTML = '<i class="fas fa-camera"></i> Capture Face';
                    newCaptureBtn.classList.remove('retake');
                    
                    const faceStatus = document.getElementById('faceStatus');
                    if (faceStatus) {
                        faceStatus.innerHTML = '<i class="fas fa-info-circle"></i> Camera initializing...';
                        faceStatus.className = "status-message info";
                    }
                    
                    const registerSubmit = document.getElementById('registerSubmit');
                    if (registerSubmit) {
                        registerSubmit.disabled = true;
                    }
                } else {
                    this.captureFaceForRegistration();
                }
            });
        }
    }

    openAuthModal(defaultTab = 'login') {
        console.log('Opening auth modal...');
        const authModal = document.getElementById('authModal');
        if (!authModal) {
            console.log('Auth modal not found!');
            return;
        }

        authModal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        this.switchAuthTab(defaultTab);

        // Reset forms when opening modal
        document.getElementById('loginForm')?.reset();
        document.getElementById('registerForm')?.reset();
        
        // Reset face capture state
        this.faceCaptured = false;
        this.stopCamera();
        
        // Setup camera when register tab is active
        if (defaultTab === 'register') {
            setTimeout(() => {
                this.setupCameraListeners();
                this.initializeCamera();
            }, 100);
        }
    }

    closeAuthModal() {
        const authModal = document.getElementById('authModal');
        if (authModal) {
            authModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        this.stopCamera();
    }

    switchAuthTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');
        
        // Handle camera for registration tab
        if (tabName === 'register') {
            setTimeout(() => {
                this.setupCameraListeners();
                this.initializeCamera();
            }, 100);
        } else {
            this.stopCamera();
        }
    }

    getTranslatedMessage(key, fallback) {
        if (!window.languageManager) return fallback;
        
        const translation = translations[window.languageManager.currentLang];
        if (translation && translation[key]) {
            return translation[key];
        }
        
        return fallback;
    }

    showNotification(message, type) {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create new notification element with improved colors
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                <span class="notification-message">${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove notification after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.3s ease forwards';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);

        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        });
    }

    // Debug method to check registration status
    debugRegistration() {
        console.log('=== REGISTRATION DEBUG INFO ===');
        console.log('LocalStorage demoUsers:', JSON.parse(localStorage.getItem('demoUsers') || '{}'));
        console.log('Current user:', localStorage.getItem('currentUser'));
        console.log('Login attempts:', localStorage.getItem('loginAttempts'));
        console.log('Face data keys:', Object.keys(localStorage).filter(key => key.startsWith('faceData_')));
        console.log('=============================');
    }
}

// Enhanced CSS styles with improved notification colors
const authNotificationStyles = document.createElement('style');
authNotificationStyles.textContent = `
    .modal-open {
        overflow: hidden;
    }

    .password-input {
        position: relative;
    }

    .toggle-password {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: #666;
        cursor: pointer;
        padding: 5px;
    }

    .toggle-password:hover {
        color: #333;
    }

    /* Improved Notification Colors */
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        margin-bottom: 15px;
        border-left: 5px solid;
        animation: slideInRight 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        min-width: 300px;
        max-width: 400px;
        overflow: hidden;
        z-index: 10000;
    }

    .notification.success {
        border-left-color: #10b981;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
    }

    .notification.error {
        border-left-color: #ef4444;
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: white;
    }

    .notification.warning {
        border-left-color: #f59e0b;
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: white;
    }

    .notification.info {
        border-left-color: #3b82f6;
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: white;
    }

    .notification-content {
        display: flex;
        align-items: center;
        padding: 1.25rem;
        gap: 1rem;
    }

    .notification-content i {
        font-size: 1.25rem;
        flex-shrink: 0;
    }

    .notification-message {
        flex: 1;
        font-weight: 500;
        line-height: 1.4;
    }

    .notification-close {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 6px;
        transition: background-color 0.2s ease;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .notification-close:hover {
        background: rgba(255, 255, 255, 0.3);
    }

    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    .message {
        font-size: 0.9rem;
        margin-top: 0.25rem;
        display: flex;
        align-items: center;
        gap: 5px;
    }

    .message.error {
        color: #e74c3c;
    }

    .message.success {
        color: #27ae60;
    }

    .message.warning {
        color: #f39c12;
    }

    .loading-spinner-small {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid #f3f3f3;
        border-top: 2px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-right: 8px;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    /* FIXED Camera Styles */
    .camera-container {
        position: relative;
        width: 300px;
        height: 225px;
        margin: 1rem auto;
        border: 2px solid #e9ecef;
        border-radius: 8px;
        overflow: hidden;
        background: #f8f9fa;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    #video, #canvas {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }

    .camera-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .face-outline {
        width: 150px;
        height: 150px;
        border: 3px solid #00ff00;
        border-radius: 50%;
        position: relative;
        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.3);
        animation: pulse 2s infinite;
    }

    @keyframes pulse {
        0% { border-color: #00ff00; }
        50% { border-color: #00cc00; }
        100% { border-color: #00ff00; }
    }

    .status-message {
        padding: 0.75rem;
        border-radius: 6px;
        margin: 1rem 0;
        font-size: 0.9rem;
        text-align: center;
        border-left: 4px solid transparent;
    }

    .status-message.success {
        background: #d4edda;
        color: #155724;
        border-left-color: #28a745;
    }

    .status-message.error {
        background: #f8d7da;
        color: #721c24;
        border-left-color: #dc3545;
    }

    .status-message.info {
        background: #d1ecf1;
        color: #0c5460;
        border-left-color: #17a2b8;
    }

    .error-details {
        font-size: 0.8rem;
        opacity: 0.8;
        margin-top: 0.25rem;
        display: block;
    }

    #captureFace.retake {
        background: #6c757d;
        border-color: #6c757d;
    }

    #captureFace.retake:hover {
        background: #5a6268;
        border-color: #545b62;
    }

    .face-registration {
        text-align: center;
        padding: 1rem 0;
    }

    .face-registration .btn {
        margin: 0.5rem;
    }

    /* Ensure camera container is properly centered */
    .form-group .face-registration {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    /* Fix for camera loading state */
    .camera-container:empty::before {
        content: "Initializing camera...";
        display: flex;
        align-items: center;
        justify-content: center;
        color: #6c757d;
        font-style: italic;
    }
`;
document.head.appendChild(authNotificationStyles);

// Initialize auth manager
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing AuthManager...');
    window.authManager = new AuthManager();
});