/**
 * Elections Management for Admin Panel
 */
class ElectionsManager {
    constructor() {
        this.elections = [];
        this.currentTab = 'active';
        this.init();
    }

    init() {
        console.log('Initializing Elections Manager...');
        this.setupEventListeners();
        this.loadElections();
    }

    setupEventListeners() {
        // Create election button
        const createElectionBtn = document.getElementById('createElectionBtn');
        if (createElectionBtn) {
            createElectionBtn.addEventListener('click', () => {
                this.showCreateElectionModal();
            });
        }

        // Tab buttons
        document.querySelectorAll('.elections-tabs .tab-btn').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Update active tab
        document.querySelectorAll('.elections-tabs .tab-btn').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Filter and display elections
        this.filterElectionsByTab();
    }

    async loadElections() {
        try {
            console.log('Loading elections data...');
            this.showLoading(true);

            let elections = [];

            // Try API first
            try {
                if (window.apiService && typeof window.apiService.getElections === 'function') {
                    const response = await apiService.getElections();
                    elections = response.elections || [];
                    console.log('API elections loaded:', elections.length);
                } else {
                    throw new Error('API service not available');
                }
            } catch (apiError) {
                console.log('API failed, using fallback data:', apiError);
                elections = this.getFallbackElections();
            }

            this.elections = elections;
            this.filterElectionsByTab();

        } catch (error) {
            console.error('Error loading elections:', error);
            this.showError('Failed to load elections data');
        } finally {
            this.showLoading(false);
        }
    }

    getFallbackElections() {
        // Get elections from localStorage or use default mock data
        const storedElections = JSON.parse(localStorage.getItem('adminElections') || '[]');
        
        if (storedElections.length > 0) {
            console.log('Loaded elections from localStorage:', storedElections.length);
            return storedElections;
        }

        // Return default mock elections if none stored
        return this.getMockElections();
    }

    getMockElections() {
        const currentDate = new Date();
        return [
            {
                id: 1,
                title: "Student Council Election 2024",
                description: "Annual election for student council representatives",
                start_date: new Date(currentDate.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days ago
                end_date: new Date(currentDate.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days from now
                status: "active",
                type: "student",
                total_voters: 1250,
                votes_cast: 845,
                created_at: new Date(currentDate.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 2,
                title: "Class Representative Election",
                description: "Election for class representatives across all departments",
                start_date: new Date(currentDate.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days from now
                end_date: new Date(currentDate.getTime() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 20 days from now
                status: "upcoming",
                type: "student",
                total_voters: 800,
                votes_cast: 0,
                created_at: new Date(currentDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
    }

    filterElectionsByTab() {
        let filteredElections = [];

        switch (this.currentTab) {
            case 'active':
                filteredElections = this.elections.filter(election => election.status === 'active');
                break;
            case 'upcoming':
                filteredElections = this.elections.filter(election => election.status === 'upcoming');
                break;
            case 'completed':
                filteredElections = this.elections.filter(election => election.status === 'completed');
                break;
            case 'all':
                filteredElections = this.elections;
                break;
        }

        this.renderElections(filteredElections);
    }

    renderElections(elections) {
        const container = document.getElementById('electionsContainer');
        if (!container) return;

        if (elections.length === 0) {
            container.innerHTML = `
                <div class="no-elections">
                    <i class="fas fa-calendar-times"></i>
                    <h3>No Elections Found</h3>
                    <p>No ${this.currentTab} elections available</p>
                    ${this.currentTab === 'active' ? '<button class="btn btn-primary" id="createFirstElection">Create First Election</button>' : ''}
                </div>
            `;

            // Add event listener for create first election button
            const createFirstBtn = document.getElementById('createFirstElection');
            if (createFirstBtn) {
                createFirstBtn.addEventListener('click', () => {
                    this.showCreateElectionModal();
                });
            }
            return;
        }

        container.innerHTML = elections.map(election => {
            const startDate = new Date(election.start_date).toLocaleDateString();
            const endDate = new Date(election.end_date).toLocaleDateString();
            const createdDate = new Date(election.created_at).toLocaleDateString();
            const participationRate = election.total_voters > 0 
                ? Math.round((election.votes_cast / election.total_voters) * 100) 
                : 0;

            return `
                <div class="election-admin-card" data-election-id="${election.id}">
                    <div class="election-header">
                        <h3>${election.title}</h3>
                        <span class="election-status ${election.status}">
                            ${this.getStatusText(election.status)}
                        </span>
                    </div>
                    <div class="election-body">
                        <p class="election-description">${election.description}</p>
                        <div class="election-meta">
                            <div class="meta-item">
                                <i class="fas fa-calendar-alt"></i>
                                <span>${startDate} - ${endDate}</span>
                            </div>
                            <div class="meta-item">
                                <i class="fas fa-users"></i>
                                <span>${election.total_voters} voters</span>
                            </div>
                            <div class="meta-item">
                                <i class="fas fa-vote-yea"></i>
                                <span>${election.votes_cast} votes cast</span>
                            </div>
                            <div class="meta-item">
                                <i class="fas fa-percentage"></i>
                                <span>${participationRate}% participation</span>
                            </div>
                        </div>
                        ${election.status === 'active' ? `
                            <div class="participation-bar">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${participationRate}%"></div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    <div class="election-footer">
                        <div class="election-actions">
                            <button class="btn btn-outline view-results" data-election-id="${election.id}">
                                <i class="fas fa-chart-bar"></i> Results
                            </button>
                            <button class="btn btn-outline edit-election" data-election-id="${election.id}">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn btn-danger delete-election" data-election-id="${election.id}">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                        <div class="election-created">
                            Created: ${createdDate}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Add event listeners
        this.setupElectionActions();
    }

    setupElectionActions() {
        // View results
        document.querySelectorAll('.view-results').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const electionId = e.target.closest('.view-results').getAttribute('data-election-id');
                this.viewElectionResults(electionId);
            });
        });

        // Edit election
        document.querySelectorAll('.edit-election').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const electionId = e.target.closest('.edit-election').getAttribute('data-election-id');
                this.editElection(electionId);
            });
        });

        // Delete election
        document.querySelectorAll('.delete-election').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const electionId = e.target.closest('.delete-election').getAttribute('data-election-id');
                this.deleteElection(electionId);
            });
        });
    }

    showCreateElectionModal() {
        const modalHTML = `
            <div class="modal" id="createElectionModal">
                <div class="modal-content large">
                    <div class="modal-header">
                        <h2>Create New Election</h2>
                        <span class="close">&times;</span>
                    </div>
                    <div class="modal-body">
                        <form id="createElectionForm">
                            <div class="form-group">
                                <label for="electionTitle">Election Title *</label>
                                <input type="text" id="electionTitle" required placeholder="Enter election title">
                            </div>
                            <div class="form-group">
                                <label for="electionDescription">Description *</label>
                                <textarea id="electionDescription" required rows="3" placeholder="Describe the election purpose and scope"></textarea>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="electionStartDate">Start Date *</label>
                                    <input type="date" id="electionStartDate" required>
                                </div>
                                <div class="form-group">
                                    <label for="electionEndDate">End Date *</label>
                                    <input type="date" id="electionEndDate" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="electionType">Election Type *</label>
                                    <select id="electionType" required>
                                        <option value="">Select Type</option>
                                        <option value="student">Student Election</option>
                                        <option value="university">University Election</option>
                                        <option value="department">Department Election</option>
                                        <option value="general">General Election</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="totalVoters">Total Voters *</label>
                                    <input type="number" id="totalVoters" required min="1" placeholder="Estimated number of voters">
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="electionStatus">Initial Status</label>
                                <select id="electionStatus">
                                    <option value="upcoming">Upcoming</option>
                                    <option value="active">Active (Start Immediately)</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" id="cancelCreate">Cancel</button>
                        <button class="btn btn-primary" id="submitElection">Create Election</button>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal
        const existingModal = document.getElementById('createElectionModal');
        if (existingModal) existingModal.remove();

        // Add modal to document
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Setup modal events
        this.setupCreateModalEvents();

        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('electionStartDate').min = today;
        document.getElementById('electionEndDate').min = today;

        // Show modal
        document.getElementById('createElectionModal').style.display = 'block';
    }

    setupCreateModalEvents() {
        const modal = document.getElementById('createElectionModal');
        const closeBtn = modal.querySelector('.close');
        const cancelBtn = modal.querySelector('#cancelCreate');
        const submitBtn = modal.querySelector('#submitElection');
        const form = modal.querySelector('#createElectionForm');

        const closeModal = () => {
            modal.style.display = 'none';
            setTimeout(() => modal.remove(), 300);
        };

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // Form submission
        submitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleCreateElection();
        });

        // Date validation
        const startDateInput = document.getElementById('electionStartDate');
        const endDateInput = document.getElementById('electionEndDate');

        startDateInput.addEventListener('change', () => {
            endDateInput.min = startDateInput.value;
        });
    }

    async handleCreateElection() {
        const form = document.getElementById('createElectionForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const electionData = {
            title: document.getElementById('electionTitle').value.trim(),
            description: document.getElementById('electionDescription').value.trim(),
            start_date: document.getElementById('electionStartDate').value,
            end_date: document.getElementById('electionEndDate').value,
            type: document.getElementById('electionType').value,
            total_voters: parseInt(document.getElementById('totalVoters').value),
            status: document.getElementById('electionStatus').value,
            votes_cast: 0
        };

        // Validate dates
        const startDate = new Date(electionData.start_date);
        const endDate = new Date(electionData.end_date);
        
        if (endDate <= startDate) {
            this.showNotification('End date must be after start date', 'error');
            return;
        }

        try {
            console.log('Creating election:', electionData);
            
            // Try API first
            let newElection;
            try {
                if (window.apiService && typeof window.apiService.createElection === 'function') {
                    const response = await apiService.createElection(electionData);
                    newElection = response.election;
                } else {
                    throw new Error('API service not available');
                }
            } catch (apiError) {
                console.log('API failed, using fallback:', apiError);
                newElection = await this.fallbackCreateElection(electionData);
            }

            // Add to local data
            this.elections.push(newElection);
            
            // Close modal and refresh
            document.getElementById('createElectionModal').style.display = 'none';
            setTimeout(() => document.getElementById('createElectionModal').remove(), 300);
            
            this.showNotification('Election created successfully!', 'success');
            this.filterElectionsByTab();

        } catch (error) {
            console.error('Error creating election:', error);
            this.showNotification(error.message || 'Failed to create election', 'error');
        }
    }

    async fallbackCreateElection(electionData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Generate unique ID
                const newId = Math.max(0, ...this.elections.map(e => e.id)) + 1;
                
                const newElection = {
                    id: newId,
                    ...electionData,
                    created_at: new Date().toISOString()
                };

                // Save to localStorage
                const allElections = [...this.elections, newElection];
                localStorage.setItem('adminElections', JSON.stringify(allElections));

                resolve(newElection);
            }, 1000);
        });
    }

    viewElectionResults(electionId) {
        this.showNotification(`Viewing results for election ${electionId}`, 'info');
        // Navigate to results section
        if (window.AdminPanel) {
            window.AdminPanel.switchSection('results');
        }
    }

    editElection(electionId) {
        this.showNotification(`Edit election ${electionId} - Coming soon!`, 'info');
    }

    deleteElection(electionId) {
        const election = this.elections.find(e => e.id == electionId);
        if (!election) return;

        if (confirm(`Are you sure you want to delete "${election.title}"? This action cannot be undone.`)) {
            this.performDeleteElection(electionId);
        }
    }

    performDeleteElection(electionId) {
        try {
            // Remove from local data
            this.elections = this.elections.filter(e => e.id != electionId);
            
            // Update localStorage
            localStorage.setItem('adminElections', JSON.stringify(this.elections));
            
            this.filterElectionsByTab();
            this.showNotification('Election deleted successfully', 'success');
            
        } catch (error) {
            console.error('Error deleting election:', error);
            this.showNotification('Failed to delete election', 'error');
        }
    }

    getStatusText(status) {
        const statusMap = {
            'active': '🟢 Active',
            'upcoming': '🟡 Upcoming',
            'completed': '🔴 Completed'
        };
        return statusMap[status] || status;
    }

    showLoading(show) {
        const loadingElement = document.getElementById('electionsLoading');
        const containerElement = document.getElementById('electionsContainer');
        
        if (loadingElement) {
            loadingElement.style.display = show ? 'block' : 'none';
        }
        if (containerElement) {
            containerElement.style.display = show ? 'none' : 'grid';
        }
    }

    showError(message) {
        const container = document.getElementById('electionsContainer');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error Loading Elections</h3>
                    <p>${message}</p>
                    <button class="btn btn-outline retry-btn">Retry</button>
                </div>
            `;
            
            document.querySelector('.retry-btn').addEventListener('click', () => {
                this.loadElections();
            });
        }
    }

    showNotification(message, type = 'info') {
        if (window.adminPanel && typeof window.adminPanel.showNotification === 'function') {
            window.adminPanel.showNotification(message, type);
        } else {
            alert(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('elections')) {
        window.ElectionsManager = new ElectionsManager();
    }
});