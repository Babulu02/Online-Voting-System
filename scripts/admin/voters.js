/**
 * Voters Management for Admin Panel
 */
class VotersManager {
    constructor() {
        this.voters = [];
        this.filteredVoters = [];
        this.init();
    }

    init() {
        console.log('Initializing Voters Manager...');
        this.setupEventListeners();
        this.loadVoters();
    }

    setupEventListeners() {
        // Search functionality
        const voterSearch = document.getElementById('voterSearch');
        if (voterSearch) {
            voterSearch.addEventListener('input', (e) => {
                this.filterVoters(e.target.value);
            });
        }

        // Status filter
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filterVoters();
            });
        }

        // Add voter button
        const addVoterBtn = document.getElementById('addVoterBtn');
        if (addVoterBtn) {
            addVoterBtn.addEventListener('click', () => {
                this.showAddVoterModal();
            });
        }
    }

    async loadVoters() {
        try {
            console.log('Loading voters data...');
            this.showLoading(true);

            let voters = [];

            // Try API first
            try {
                if (window.apiService && typeof window.apiService.getUsers === 'function') {
                    const response = await apiService.getUsers();
                    voters = response.users || [];
                    console.log('API voters loaded:', voters.length);
                } else {
                    throw new Error('API service not available');
                }
            } catch (apiError) {
                console.log('API failed, using fallback data:', apiError);
                voters = this.getFallbackVoters();
            }

            this.voters = voters;
            this.filteredVoters = [...voters];
            this.renderVoters();

        } catch (error) {
            console.error('Error loading voters:', error);
            this.showError('Failed to load voters data');
        } finally {
            this.showLoading(false);
        }
    }

    getFallbackVoters() {
        // Get users from localStorage (demo users from registration)
        const demoUsers = JSON.parse(localStorage.getItem('demoUsers') || '{}');
        
        // Convert to array format
        const voters = Object.values(demoUsers).map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            dob: user.dob,
            gender: user.gender,
            status: 'verified',
            registered_at: user.registeredAt || new Date().toISOString(),
            has_voted: user.hasVoted || false,
            last_login: user.lastLogin || null
        }));

        console.log('Fallback voters loaded:', voters.length);
        return voters;
    }

    filterVoters(searchTerm = '') {
        const statusFilter = document.getElementById('statusFilter');
        const statusValue = statusFilter ? statusFilter.value : '';

        this.filteredVoters = this.voters.filter(voter => {
            const matchesSearch = !searchTerm || 
                voter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                voter.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                voter.email.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = !statusValue || voter.status === statusValue;
            
            return matchesSearch && matchesStatus;
        });

        this.renderVoters();
    }

    renderVoters() {
        const tableBody = document.getElementById('votersTableBody');
        if (!tableBody) return;

        if (this.filteredVoters.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="no-data">
                        <i class="fas fa-users-slash"></i>
                        <span>No voters found</span>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = this.filteredVoters.map(voter => {
            const registeredDate = new Date(voter.registered_at).toLocaleDateString();
            const lastLogin = voter.last_login ? new Date(voter.last_login).toLocaleDateString() : 'Never';
            
            return `
                <tr>
                    <td>
                        <strong>${voter.id}</strong>
                    </td>
                    <td>
                        <div class="user-info">
                            <div class="user-avatar">
                                <i class="fas fa-user"></i>
                            </div>
                            <div class="user-details">
                                <span class="user-name">${voter.name}</span>
                            </div>
                        </div>
                    </td>
                    <td>${voter.email}</td>
                    <td>
                        <span class="status-badge status-${voter.status}">
                            <i class="fas fa-${this.getStatusIcon(voter.status)}"></i>
                            ${this.formatStatus(voter.status)}
                        </span>
                    </td>
                    <td>${registeredDate}</td>
                    <td>
                        <span class="voting-status ${voter.has_voted ? 'voted' : 'not-voted'}">
                            <i class="fas fa-${voter.has_voted ? 'check' : 'times'}"></i>
                            ${voter.has_voted ? 'Voted' : 'Not Voted'}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon view-btn" data-user-id="${voter.id}" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-icon edit-btn" data-user-id="${voter.id}" title="Edit Voter">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon delete-btn" data-user-id="${voter.id}" title="Delete Voter">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        // Add event listeners to action buttons
        this.setupActionButtons();
    }

    setupActionButtons() {
        // View buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = e.target.closest('.view-btn').getAttribute('data-user-id');
                this.viewVoterDetails(userId);
            });
        });

        // Edit buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = e.target.closest('.edit-btn').getAttribute('data-user-id');
                this.editVoter(userId);
            });
        });

        // Delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = e.target.closest('.delete-btn').getAttribute('data-user-id');
                this.deleteVoter(userId);
            });
        });
    }

    getStatusIcon(status) {
        const icons = {
            'verified': 'check-circle',
            'pending': 'clock',
            'rejected': 'times-circle'
        };
        return icons[status] || 'user';
    }

    formatStatus(status) {
        const statusMap = {
            'verified': 'Verified',
            'pending': 'Pending',
            'rejected': 'Rejected'
        };
        return statusMap[status] || status;
    }

    viewVoterDetails(userId) {
        const voter = this.voters.find(v => v.id === userId);
        if (!voter) return;

        this.showVoterModal(voter, 'view');
    }

    editVoter(userId) {
        const voter = this.voters.find(v => v.id === userId);
        if (!voter) return;

        this.showVoterModal(voter, 'edit');
    }

    deleteVoter(userId) {
        const voter = this.voters.find(v => v.id === userId);
        if (!voter) return;

        if (confirm(`Are you sure you want to delete voter ${voter.name} (${voter.id})? This action cannot be undone.`)) {
            this.performDeleteVoter(userId);
        }
    }

    performDeleteVoter(userId) {
        try {
            // Remove from local data
            this.voters = this.voters.filter(v => v.id !== userId);
            this.filteredVoters = this.filteredVoters.filter(v => v.id !== userId);
            
            // Remove from localStorage (demo data)
            const demoUsers = JSON.parse(localStorage.getItem('demoUsers') || '{}');
            delete demoUsers[userId];
            localStorage.setItem('demoUsers', JSON.stringify(demoUsers));
            
            this.renderVoters();
            this.showNotification('Voter deleted successfully', 'success');
            
        } catch (error) {
            console.error('Error deleting voter:', error);
            this.showNotification('Failed to delete voter', 'error');
        }
    }

    showVoterModal(voter, mode = 'view') {
        // Create modal HTML
        const modalHTML = `
            <div class="modal" id="voterModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>${mode === 'view' ? 'Voter Details' : 'Edit Voter'}</h2>
                        <span class="close">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div class="voter-details">
                            <div class="detail-row">
                                <label>User ID:</label>
                                <span>${voter.id}</span>
                            </div>
                            <div class="detail-row">
                                <label>Name:</label>
                                <span>${voter.name}</span>
                            </div>
                            <div class="detail-row">
                                <label>Email:</label>
                                <span>${voter.email}</span>
                            </div>
                            <div class="detail-row">
                                <label>Date of Birth:</label>
                                <span>${new Date(voter.dob).toLocaleDateString()}</span>
                            </div>
                            <div class="detail-row">
                                <label>Gender:</label>
                                <span>${voter.gender}</span>
                            </div>
                            <div class="detail-row">
                                <label>Status:</label>
                                <span class="status-badge status-${voter.status}">${this.formatStatus(voter.status)}</span>
                            </div>
                            <div class="detail-row">
                                <label>Registration Date:</label>
                                <span>${new Date(voter.registered_at).toLocaleDateString()}</span>
                            </div>
                            <div class="detail-row">
                                <label>Last Login:</label>
                                <span>${voter.last_login ? new Date(voter.last_login).toLocaleDateString() : 'Never'}</span>
                            </div>
                            <div class="detail-row">
                                <label>Voting Status:</label>
                                <span class="voting-status ${voter.has_voted ? 'voted' : 'not-voted'}">
                                    ${voter.has_voted ? 'Has Voted' : 'Not Voted Yet'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" id="closeModal">Close</button>
                        ${mode === 'edit' ? `
                            <button class="btn btn-primary" id="saveChanges">Save Changes</button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal
        const existingModal = document.getElementById('voterModal');
        if (existingModal) existingModal.remove();

        // Add modal to document
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Setup modal events
        this.setupVoterModalEvents(voter, mode);
    }

    setupVoterModalEvents(voter, mode) {
        const modal = document.getElementById('voterModal');
        const closeBtn = modal.querySelector('.close');
        const closeBtn2 = modal.querySelector('#closeModal');

        const closeModal = () => {
            modal.style.display = 'none';
            setTimeout(() => modal.remove(), 300);
        };

        closeBtn.addEventListener('click', closeModal);
        closeBtn2.addEventListener('click', closeModal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // Show modal
        modal.style.display = 'block';
    }

    showAddVoterModal() {
        // Similar to view modal but for adding new voters
        this.showNotification('Add voter functionality coming soon!', 'info');
    }

    showLoading(show) {
        const loadingElement = document.getElementById('votersLoading');
        const tableElement = document.getElementById('votersTable');
        
        if (loadingElement) {
            loadingElement.style.display = show ? 'block' : 'none';
        }
        if (tableElement) {
            tableElement.style.display = show ? 'none' : 'table';
        }
    }

    showError(message) {
        const tableBody = document.getElementById('votersTableBody');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="error-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>${message}</span>
                        <button class="btn btn-outline retry-btn">Retry</button>
                    </td>
                </tr>
            `;
            
            // Add retry button event
            document.querySelector('.retry-btn').addEventListener('click', () => {
                this.loadVoters();
            });
        }
    }

    showNotification(message, type = 'info') {
        // Use the admin panel notification system
        if (window.adminPanel && typeof window.adminPanel.showNotification === 'function') {
            window.adminPanel.showNotification(message, type);
        } else {
            // Fallback notification
            alert(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if we're on the voters page
    if (document.getElementById('voters')) {
        window.VotersManager = new VotersManager();
    }
});