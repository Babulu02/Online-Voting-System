/**
 * Authentication System with Database Integration and Fallback
 * Handles both user and admin authentication
 */
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.currentAdmin = null;
        this.init();
    }

    init() {
        this.checkAuthStatus();
        this.setupEventListeners();
        this.setupAdminEventListeners();
    }

    checkAuthStatus() {
        // Check user authentication
        const userData = localStorage.getItem('currentUser');
        const userToken = localStorage.getItem('userToken');

        if (userData && userToken) {
            this.currentUser = JSON.parse(userData);
            this.updateUIForLoggedInUser(this.currentUser);
        }

        // Check admin authentication
        const adminData = localStorage.getItem('currentAdmin');
        const adminToken = localStorage.getItem('adminToken');

        if (adminData && adminToken) {
            this.currentAdmin = JSON.parse(adminData);
            
            // Verify admin token is still valid
            this.verifyAdminToken().then(valid => {
                if (valid && window.location.pathname.includes('admin/login.html')) {
                    this.redirectToAdminDashboard();
                }
            }).catch(() => {
                this.adminLogout();
            });
        }
    }

    setupEventListeners() {
        // User login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // User registration form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Logout buttons
        document.querySelectorAll('.logout-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        });

        // Password toggle for user forms
        document.querySelectorAll('.toggle-password').forEach(button => {
            button.addEventListener('click', (e) => {
                const input = e.target.closest('.password-input').querySelector('input');
                const icon = e.target.tagName === 'I' ? e.target : e.target.querySelector('i');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.className = 'fas fa-eye-slash';
                } else {
                    input.type = 'password';
                    icon.className = 'fas fa-eye';
                }
            });
        });

        // Enter key support
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                if (document.getElementById('loginForm')) {
                    this.handleLogin(e);
                } else if (document.getElementById('registerForm')) {
                    this.handleRegister(e);
                } else if (document.getElementById('adminLoginForm')) {
                    this.handleAdminLogin(e);
                }
            }
        });
    }

    setupAdminEventListeners() {
        const adminLoginForm = document.getElementById('adminLoginForm');
        if (adminLoginForm) {
            adminLoginForm.addEventListener('submit', (e) => this.handleAdminLogin(e));
        }

        // Admin logout
        const adminLogoutBtn = document.getElementById('adminLogoutBtn');
        if (adminLogoutBtn) {
            adminLogoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.adminLogout();
            });
        }
    }

    // USER AUTHENTICATION METHODS

    async handleLogin(e) {
        e.preventDefault();
        
        const userId = document.getElementById('loginId').value.trim();
        const password = document.getElementById('loginPassword').value;
        const loginBtn = document.querySelector('#loginForm button[type="submit"]');
        
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
                result = await this.apiLogin({
                    userId: userId,
                    password: password
                });
            } catch (apiError) {
                console.log('API login failed, trying fallback:', apiError);
                result = await this.fallbackLogin({
                    userId: userId,
                    password: password
                });
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
                ? `Invalid credentials. ${remainingAttempts} attempts remaining.`
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
        console.log('Registration attempt...');
        
        // Get form values
        const name = document.getElementById('registerName').value.trim();
        const userId = document.getElementById('registerId').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        const dob = document.getElementById('registerDob').value;
        const gender = document.querySelector('input[name="gender"]:checked');
        
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
        
        // Check face data (optional for now to test registration)
        const faceData = localStorage.getItem(`faceData_${userId}`);
        
        // Show loading state
        registerBtn.innerHTML = '<div class="loading-spinner-small"></div> Creating Account...';
        registerBtn.disabled = true;
        
        try {
            // Try API registration first
            let result;
            try {
                result = await this.apiRegister({
                    id: userId,
                    name: name,
                    email: email,
                    password: password,
                    dob: dob,
                    gender: gender.value,
                    faceData: faceData
                });
            } catch (apiError) {
                console.log('API registration failed, using fallback:', apiError);
                result = await this.fallbackRegister({
                    id: userId,
                    name: name,
                    email: email,
                    password: password,
                    dob: dob,
                    gender: gender.value
                });
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
            this.showNotification(error.message || 'Registration failed. Please try again.', 'error');
            console.error('Registration error:', error);
        } finally {
            registerBtn.innerHTML = originalText;
            registerBtn.disabled = false;
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
        // Fallback login for when backend is not available
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const users = JSON.parse(localStorage.getItem('demoUsers') || '{}');
                const user = users[credentials.userId];
                
                if (user && user.password === credentials.password) {
                    resolve({
                        success: true,
                        user: {
                            id: user.id,
                            name: user.name,
                            email: user.email
                        }
                    });
                } else {
                    reject(new Error('Invalid credentials'));
                }
            }, 1000);
        });
    }

    async apiRegister(userData) {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            // Return user data for session storage
            return {
                success: true,
                user: {
                    id: userData.id,
                    name: userData.name,
                    email: userData.email
                }
            };
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                throw new Error('Cannot connect to server. Please check if the backend is running.');
            }
            throw error;
        }
    }

    async fallbackRegister(userData) {
        // Fallback registration for when backend is not available
        return new Promise((resolve) => {
            setTimeout(() => {
                // Store user data in localStorage for demo purposes
                const users = JSON.parse(localStorage.getItem('demoUsers') || '{}');
                users[userData.id] = {
                    ...userData,
                    registeredAt: new Date().toISOString(),
                    hasVoted: false
                };
                localStorage.setItem('demoUsers', JSON.stringify(users));
                
                resolve({
                    success: true,
                    user: {
                        id: userData.id,
                        name: userData.name,
                        email: userData.email
                    }
                });
            }, 1000);
        });
    }

    validateRegistrationForm(formData) {
        const { name, userId, email, password, confirmPassword, dob, gender } = formData;

        // Basic validation
        if (!name || !userId || !email || !password || !confirmPassword || !dob || !gender) {
            return { isValid: false, message: 'All fields are required' };
        }

        // Name validation
        if (name.length < 2) {
            return { isValid: false, message: 'Name must be at least 2 characters long' };
        }

        // User ID validation
        if (userId.length < 4) {
            return { isValid: false, message: 'User ID must be at least 4 characters long' };
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { isValid: false, message: 'Please enter a valid email address' };
        }

        // Password validation
        if (password.length < 6) {
            return { isValid: false, message: 'Password must be at least 6 characters long' };
        }

        // Confirm password
        if (password !== confirmPassword) {
            return { isValid: false, message: 'Passwords do not match' };
        }

        // Age validation (must be at least 18 years old)
        const birthDate = new Date(dob);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 18) {
            return { isValid: false, message: 'You must be at least 18 years old to register' };
        }

        return { isValid: true, message: 'Validation successful' };
    }

    // ADMIN AUTHENTICATION METHODS

    async handleAdminLogin(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        // Validate inputs
        if (!username || !password) {
            this.showAdminMessage('Please enter both username and password.', 'error');
            return;
        }

        // Show loading state
        submitBtn.innerHTML = '<div class="loading-spinner-small"></div> Logging in...';
        submitBtn.disabled = true;

        try {
            // Try backend API first
            let response;
            try {
                response = await this.adminLogin({ username, password });
            } catch (apiError) {
                console.log('API login failed, trying fallback:', apiError);
                response = await this.fallbackAdminLogin(username, password);
            }
            
            if (response.success || response.token) {
                this.storeAdminData(response);
                this.showAdminMessage('Login successful! Redirecting...', 'success');
                
                setTimeout(() => {
                    this.redirectToAdminDashboard();
                }, 1000);
            } else {
                throw new Error(response.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showAdminMessage(error.message || 'Login failed. Please check your credentials.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async adminLogin(credentials) {
        try {
            const response = await fetch('/api/admin/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                throw new Error('Cannot connect to server. Please check if the backend is running.');
            }
            throw error;
        }
    }

    // Fallback authentication for development
    async fallbackAdminLogin(username, password) {
        // Default admin credentials
        const defaultAdmins = [
            { username: 'superadmin', password: 'admin123', role: 'super_admin', id: 1 },
            { username: 'admin', password: 'admin123', role: 'admin', id: 2 },
            { username: 'moderator', password: 'admin123', role: 'moderator', id: 3 }
        ];

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const admin = defaultAdmins.find(a => 
                    a.username === username && a.password === password
                );

                if (admin) {
                    resolve({
                        success: true,
                        token: this.generateTempToken(admin),
                        admin: {
                            id: admin.id,
                            username: admin.username,
                            role: admin.role,
                            lastLogin: new Date().toISOString()
                        }
                    });
                } else {
                    reject(new Error('Invalid username or password'));
                }
            }, 1000); // Simulate API delay
        });
    }

    generateTempToken(admin) {
        // Simple token generation for development
        return btoa(JSON.stringify({
            id: admin.id,
            username: admin.username,
            role: admin.role,
            timestamp: Date.now(),
            exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        }));
    }

    async verifyAdminToken() {
        const token = localStorage.getItem('adminToken');
        if (!token) return false;

        try {
            // For fallback tokens, just check if they're not expired
            if (token.includes('eyJ')) {
                // JWT token - verify with backend
                const response = await fetch('/api/admin/auth/verify', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    return false;
                }

                const data = await response.json();
                return data.valid === true;
            } else {
                // Fallback token - check expiration
                try {
                    const tokenData = JSON.parse(atob(token));
                    return tokenData.exp > Date.now();
                } catch {
                    return false;
                }
            }
        } catch (error) {
            console.error('Token verification error:', error);
            return false;
        }
    }

    storeAdminData(response) {
        // Store token and admin data
        localStorage.setItem('adminToken', response.token);
        
        const adminData = response.admin || {
            id: response.adminId,
            username: response.username,
            role: response.role
        };
        
        localStorage.setItem('currentAdmin', JSON.stringify(adminData));
        this.currentAdmin = adminData;

        // Update last login time in database if using real API
        if (response.token && !response.token.includes('eyJ')) {
            this.updateLastLogin(adminData.id);
        }
    }

    async updateLastLogin(adminId) {
        try {
            await fetch('/api/admin/auth/update-last-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify({ adminId })
            });
        } catch (error) {
            console.error('Failed to update last login:', error);
        }
    }

    redirectToAdminDashboard() {
        // Redirect to admin dashboard
        const basePath = window.location.pathname.includes('/admin/') ? '' : '/admin/';
        window.location.href = `${basePath}index.html`;
    }

    // SESSION MANAGEMENT

    storeUserSession(user) {
        const sessionData = {
            ...user,
            loginTime: Date.now(),
            sessionId: this.generateSessionId()
        };
        
        localStorage.setItem('currentUser', JSON.stringify(sessionData));
        localStorage.setItem('userToken', this.generateUserToken(user));
        this.currentUser = sessionData;
    }

    generateUserToken(user) {
        return btoa(JSON.stringify({
            userId: user.id,
            timestamp: Date.now(),
            exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        }));
    }

    generateSessionId() {
        return 'session_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    // SECURITY METHODS

    isAccountLocked(userId) {
        const lockData = localStorage.getItem(`lock_${userId}`);
        if (!lockData) return false;

        const { attempts, lockUntil } = JSON.parse(lockData);
        return attempts >= 5 && Date.now() < lockUntil;
    }

    getRemainingLockoutTime(userId) {
        const lockData = localStorage.getItem(`lock_${userId}`);
        if (!lockData) return 0;

        const { lockUntil } = JSON.parse(lockData);
        return Math.max(0, lockUntil - Date.now());
    }

    recordFailedAttempt(userId) {
        const lockKey = `lock_${userId}`;
        const lockData = JSON.parse(localStorage.getItem(lockKey) || '{"attempts":0}');
        
        lockData.attempts++;
        
        if (lockData.attempts >= 5) {
            lockData.lockUntil = Date.now() + (30 * 60 * 1000); // 30 minutes lock
        }
        
        localStorage.setItem(lockKey, JSON.stringify(lockData));
    }

    resetFailedAttempts(userId) {
        localStorage.removeItem(`lock_${userId}`);
    }

    getRemainingAttempts(userId) {
        const lockData = JSON.parse(localStorage.getItem(`lock_${userId}`) || '{"attempts":0}');
        return Math.max(0, 5 - lockData.attempts);
    }

    // UI METHODS

    updateUIForLoggedInUser(user) {
        // Update navigation
        const loginBtn = document.getElementById('loginBtn');
        const userInfo = document.getElementById('userInfo');
        const userName = document.getElementById('userName');

        if (loginBtn && userInfo) {
            loginBtn.style.display = 'none';
            userInfo.style.display = 'flex';
            if (userName) {
                userName.textContent = user.name;
            }
        }

        // Update admin UI if applicable
        if (user.role && user.role.includes('admin')) {
            const adminLink = document.getElementById('adminLink');
            if (adminLink) {
                adminLink.style.display = 'block';
            }
        }
    }

    closeAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            padding: 12px 16px;
            border-radius: 4px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            min-width: 300px;
            max-width: 500px;
        `;

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);

        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
    }

    showAdminMessage(message, type = 'info') {
        const messageEl = document.getElementById('adminMessage');
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.className = `message ${type}`;
            messageEl.style.display = 'block';

            // Auto-hide success messages, keep errors until dismissed
            if (type === 'success') {
                setTimeout(() => {
                    messageEl.style.display = 'none';
                }, 3000);
            }
        } else {
            this.showNotification(message, type);
        }
    }

    // LOGOUT METHODS

    handleLogout() {
        // Call logout API if available
        const token = localStorage.getItem('userToken');
        if (token) {
            fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }).catch(error => {
                console.error('Logout API error:', error);
            });
        }

        // Clear user session
        localStorage.removeItem('userToken');
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        
        // Update UI
        const loginBtn = document.getElementById('loginBtn');
        const userInfo = document.getElementById('userInfo');
        
        if (loginBtn && userInfo) {
            loginBtn.style.display = 'block';
            userInfo.style.display = 'none';
        }

        this.showNotification('Logged out successfully', 'success');
        setTimeout(() => location.reload(), 1000);
    }

    adminLogout() {
        // Call logout API if available
        const token = localStorage.getItem('adminToken');
        if (token && token.includes('eyJ')) {
            fetch('/api/admin/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }).catch(error => {
                console.error('Logout API error:', error);
            });
        }

        // Clear admin session
        localStorage.removeItem('adminToken');
        localStorage.removeItem('currentAdmin');
        this.currentAdmin = null;
        
        // Redirect to admin login page
        window.location.href = '/admin/login.html';
    }

    // STATIC METHODS

    static isUserAuthenticated() {
        const token = localStorage.getItem('userToken');
        const userData = localStorage.getItem('currentUser');
        return !!(token && userData);
    }

    static isAdminAuthenticated() {
        const token = localStorage.getItem('adminToken');
        const adminData = localStorage.getItem('currentAdmin');
        return !!(token && adminData);
    }

    static getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem('currentUser'));
        } catch (error) {
            return null;
        }
    }

    static getCurrentAdmin() {
        try {
            return JSON.parse(localStorage.getItem('currentAdmin'));
        } catch (error) {
            return null;
        }
    }

    static getUserToken() {
        return localStorage.getItem('userToken');
    }

    static getAdminToken() {
        return localStorage.getItem('adminToken');
    }

    static hasAdminPermission(requiredRole) {
        const admin = this.getCurrentAdmin();
        if (!admin) return false;

        const roleHierarchy = {
            'moderator': ['moderator'],
            'admin': ['moderator', 'admin'],
            'super_admin': ['moderator', 'admin', 'super_admin']
        };

        return roleHierarchy[admin.role]?.includes(requiredRole) || false;
    }

    static requireUserAuth() {
        if (!this.isUserAuthenticated()) {
            window.location.href = '/login.html';
            return false;
        }
        return true;
    }

    static requireAdminAuth() {
        if (!this.isAdminAuthenticated()) {
            window.location.href = '/admin/login.html';
            return false;
        }
        return true;
    }

    static requireAdminRole(requiredRole) {
        if (!this.isAdminAuthenticated()) {
            window.location.href = '/admin/login.html';
            return false;
        }

        if (!this.hasAdminPermission(requiredRole)) {
            window.location.href = '/admin/unauthorized.html';
            return false;
        }

        return true;
    }
}

// Add loading animation and notification styles
const authStyles = document.createElement('style');
authStyles.textContent = `
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
    
    .message {
        padding: 12px 16px;
        margin: 1rem 0;
        border-radius: 4px;
        font-weight: 500;
        display: none;
    }
    
    .message.success {
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
        display: block;
    }
    
    .message.error {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
        display: block;
    }
    
    .password-input {
        position: relative;
    }
    
    .toggle-password {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: #666;
        cursor: pointer;
        padding: 5px;
    }
    
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #3498db;
        color: white;
        padding: 12px 16px;
        border-radius: 4px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 10000;
        min-width: 300px;
        max-width: 500px;
    }
    
    .notification.success {
        background: #27ae60;
    }
    
    .notification.error {
        background: #e74c3c;
    }
    
    .notification-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        margin-left: 10px;
    }
`;
document.head.appendChild(authStyles);

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const authManager = new AuthManager();
    window.authManager = authManager;
    
    // Make static methods available globally
    window.AuthManager = AuthManager;
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}