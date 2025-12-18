// Main Admin Panel Functionality
class AdminPanel {
    constructor() {
        this.currentSection = 'dashboard';
        this.init();
    }

    init() {
        this.checkAuth();
        this.setupEventListeners();
        this.loadDashboard();
        this.setupNavigation();
    }

    checkAuth() {
        const adminUser = JSON.parse(localStorage.getItem('adminUser'));
        if (!adminUser) {
            window.location.href = 'login.html';
            return;
        }
        
        // Update UI with admin info
        this.updateAdminInfo(adminUser);
    }

    updateAdminInfo(adminUser) {
        const userNameElement = document.querySelector('.user-name');
        const userRoleElement = document.querySelector('.user-role');
        
        if (userNameElement) {
            userNameElement.textContent = adminUser.username;
        }
        if (userRoleElement) {
            userRoleElement.textContent = this.formatRole(adminUser.role);
        }
    }

    formatRole(role) {
        const roles = {
            'super-admin': 'Super Admin',
            'staff-admin': 'Staff Admin'
        };
        return roles[role] || role;
    }

    setupEventListeners() {
        // Sidebar toggle
        document.getElementById('sidebarToggle').addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('collapsed');
        });

        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.refreshCurrentSection();
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Modal close buttons
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
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

        // Tab buttons
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabContainer = tab.closest('.elections-tabs');
                if (tabContainer) {
                    tabContainer.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    
                    const tabName = tab.getAttribute('data-tab');
                    this.loadElectionsByStatus(tabName);
                }
            });
        });
    }

    switchSection(sectionName) {
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[href="#${sectionName}"]`).classList.add('active');

        // Update active section
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionName).classList.add('active');

        // Update page title
        document.getElementById('pageTitle').textContent = this.getSectionTitle(sectionName);

        // Load section-specific data
        this.loadSectionData(sectionName);
        
        this.currentSection = sectionName;
    }

    getSectionTitle(sectionName) {
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
        return titles[sectionName] || 'Admin Panel';
    }

    loadSectionData(sectionName) {
        switch(sectionName) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'voters':
                this.loadVoters();
                break;
            case 'candidates':
                this.loadCandidates();
                break;
            case 'elections':
                this.loadElections();
                break;
            case 'results':
                this.loadResults();
                break;
            case 'notifications':
                this.loadNotifications();
                break;
            case 'security':
                this.loadSecurity();
                break;
            case 'audit':
                this.loadAuditLogs();
                break;
        }
    }

    refreshCurrentSection() {
        this.loadSectionData(this.currentSection);
        this.showNotification('Data refreshed successfully!', 'success');
    }

    loadDashboard() {
        // Dashboard data will be loaded by dashboard.js
        console.log('Loading dashboard...');
    }

    loadVoters() {
        // Voters data will be loaded by voters.js
        console.log('Loading voters...');
    }

    loadCandidates() {
        // Candidates data will be loaded by candidates.js
        console.log('Loading candidates...');
    }

    loadElections() {
        // Elections data will be loaded by elections.js
        console.log('Loading elections...');
    }

    loadResults() {
        // Results data will be loaded by results.js
        console.log('Loading results...');
    }

    loadNotifications() {
        console.log('Loading notifications...');
    }

    loadSecurity() {
        console.log('Loading security settings...');
    }

    loadAuditLogs() {
        console.log('Loading audit logs...');
    }

    logout() {
        localStorage.removeItem('adminUser');
        window.location.href = 'login.html';
    }

    showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification-toast');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification-toast ${type}`;
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
            border-radius: 5px;
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

    // Utility method for API calls (simulated)
    async apiCall(endpoint, method = 'GET', data = null) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In a real application, this would be an actual API call
        console.log(`API Call: ${method} ${endpoint}`, data);
        
        // Return mock data based on endpoint
        return this.getMockData(endpoint);
    }

    getMockData(endpoint) {
        const mockData = {
            '/dashboard/stats': {
                totalVoters: 12458,
                totalCandidates: 47,
                totalVotes: 8742,
                votingPercentage: 70.2
            },
            '/voters': this.generateMockVoters(50),
            '/candidates': this.generateMockCandidates(20),
            '/elections': this.generateMockElections(10),
            '/audit-logs': this.generateMockAuditLogs(25)
        };
        
        return mockData[endpoint] || {};
    }

    generateMockVoters(count) {
        // Implementation for generating mock voter data
        return Array.from({ length: count }, (_, i) => ({
            id: `V${10000 + i}`,
            name: `Voter ${i + 1}`,
            email: `voter${i + 1}@example.com`,
            status: ['verified', 'pending', 'rejected'][Math.floor(Math.random() * 3)],
            registeredAt: new Date(Date.now() - Math.random() * 10000000000).toISOString()
        }));
    }

    generateMockCandidates(count) {
        // Implementation for generating mock candidate data
        return Array.from({ length: count }, (_, i) => ({
            id: i + 1,
            name: `Candidate ${i + 1}`,
            party: `Party ${String.fromCharCode(65 + (i % 5))}`,
            position: ['President', 'Vice President', 'Secretary', 'Treasurer'][i % 4],
            votes: Math.floor(Math.random() * 1000)
        }));
    }

    generateMockElections(count) {
        // Implementation for generating mock election data
        return Array.from({ length: count }, (_, i) => ({
            id: i + 1,
            title: `Election ${i + 1}`,
            status: ['ongoing', 'upcoming', 'completed'][i % 3],
            startDate: new Date(Date.now() + (i - 2) * 86400000).toISOString(),
            endDate: new Date(Date.now() + (i + 5) * 86400000).toISOString(),
            totalVoters: Math.floor(Math.random() * 10000) + 1000,
            votesCast: Math.floor(Math.random() * 8000) + 500
        }));
    }

    generateMockAuditLogs(count) {
        // Implementation for generating mock audit log data
        const actions = ['login', 'create', 'update', 'delete', 'view'];
        const users = ['admin', 'staff1', 'staff2'];
        
        return Array.from({ length: count }, (_, i) => ({
            id: i + 1,
            timestamp: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
            user: users[Math.floor(Math.random() * users.length)],
            action: actions[Math.floor(Math.random() * actions.length)],
            details: `Performed ${actions[Math.floor(Math.random() * actions.length)]} action`,
            ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`
        }));
    }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
});

// Add CSS animations for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .notification-close {
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
    }
`;
document.head.appendChild(notificationStyles);