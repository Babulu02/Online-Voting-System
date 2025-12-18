/**
 * Admin Panel Main Controller
 * Handles navigation and overall admin panel functionality
 */
class AdminPanel {
    constructor() {
        this.currentSection = 'dashboard';
        this.init();
    }

    init() {
        console.log('Initializing Admin Panel...');
        this.setupNavigation();
        this.setupEventListeners();
        this.loadInitialData();
    }

    setupNavigation() {
        // Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = link.getAttribute('href').substring(1);
                this.switchSection(targetSection);
            });
        });

        // Tab buttons for elections
        document.querySelectorAll('.elections-tabs .tab-btn').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabContainer = e.target.closest('.elections-tabs');
                if (tabContainer) {
                    tabContainer.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
                    e.target.classList.add('active');
                    
                    const tabName = e.target.getAttribute('data-tab');
                    console.log('Switching to tab:', tabName);
                    // This will be handled by elections.js
                }
            });
        });
    }

    setupEventListeners() {
        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                document.querySelector('.sidebar').classList.toggle('collapsed');
                document.querySelector('.main-content').classList.toggle('expanded');
            });
        }

        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshCurrentSection();
            });
        }

        // Add basic logout functionality if not already handled
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn && !logoutBtn.hasAttribute('data-listener-added')) {
            logoutBtn.setAttribute('data-listener-added', 'true');
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }
    }

    switchSection(sectionName) {
        console.log('Switching to section:', sectionName);
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[href="#${sectionName}"]`).classList.add('active');

        // Update active section
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
        } else {
            console.error('Section not found:', sectionName);
        }

        // Update page title
        this.updatePageTitle(sectionName);
        
        this.currentSection = sectionName;

        // Load section data
        this.loadSectionData(sectionName);
    }

    updatePageTitle(sectionName) {
        const titles = {
            'dashboard': 'Dashboard Overview',
            'voters': 'Manage Voters',
            'candidates': 'Manage Candidates',
            'elections': 'Manage Elections',
            'results': 'Voting Results',
            'notifications': 'Notifications & Announcements',
            'security': 'Security & Access',
            'audit': 'Audit Logs'
        };
        
        const titleElement = document.getElementById('pageTitle');
        if (titleElement) {
            titleElement.textContent = titles[sectionName] || 'Admin Panel';
        }
    }

    loadInitialData() {
        // Load dashboard by default
        this.loadSectionData('dashboard');
    }

    loadSectionData(sectionName) {
        console.log('Loading data for section:', sectionName);
        
        // Show loading state
        this.showSectionLoading(sectionName, true);

        // Simulate loading data
        setTimeout(() => {
            this.showSectionLoading(sectionName, false);
            
            // Initialize section-specific functionality
            switch(sectionName) {
                case 'dashboard':
                    if (window.DashboardManager) {
                        window.DashboardManager.init();
                    }
                    break;
                case 'voters':
                    if (window.VotersManager) {
                        window.VotersManager.init();
                    }
                    break;
                case 'candidates':
                    if (window.CandidatesManager) {
                        window.CandidatesManager.init();
                    }
                    break;
                case 'elections':
                    if (window.ElectionsManager) {
                        window.ElectionsManager.init();
                    }
                    break;
                case 'results':
                    if (window.ResultsManager) {
                        window.ResultsManager.init();
                    }
                    break;
            }
        }, 500);
    }

    showSectionLoading(sectionName, show) {
        const section = document.getElementById(sectionName);
        if (!section) return;

        const loadingElements = section.querySelectorAll('.table-loading, .elections-loading, .results-loading, .candidates-loading');
        const contentElements = section.querySelectorAll('.data-table, .elections-grid, .results-container, .candidates-grid');

        if (show) {
            loadingElements.forEach(el => el.style.display = 'block');
            contentElements.forEach(el => el.style.display = 'none');
        } else {
            loadingElements.forEach(el => el.style.display = 'none');
            contentElements.forEach(el => el.style.display = 'block');
        }
    }

    refreshCurrentSection() {
        console.log('Refreshing current section:', this.currentSection);
        this.loadSectionData(this.currentSection);
        this.showNotification('Data refreshed successfully!', 'success');
    }

    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            // Clear admin authentication data
            localStorage.removeItem('adminToken');
            localStorage.removeItem('currentAdmin');
            
            // Redirect to login page
            window.location.href = 'login.html';
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `admin-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
        `;

        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    getNotificationColor(type) {
        const colors = {
            'success': '#27ae60',
            'error': '#e74c3c',
            'warning': '#f39c12',
            'info': '#3498db'
        };
        return colors[type] || '#3498db';
    }
}

// Add CSS for notifications
const adminNotificationStyles = document.createElement('style');
adminNotificationStyles.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .admin-notification .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: 10px;
    }
    
    .sidebar.collapsed {
        width: 70px;
    }
    
    .sidebar.collapsed .logo span,
    .sidebar.collapsed .nav-link span,
    .sidebar.collapsed .user-details,
    .sidebar.collapsed .sidebar-actions {
        display: none;
    }
    
    .main-content.expanded {
        margin-left: 70px;
    }
`;
document.head.appendChild(adminNotificationStyles);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.AdminPanel = new AdminPanel();
});