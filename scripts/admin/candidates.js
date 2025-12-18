// Candidates Management
class CandidatesManager {
    constructor() {
        this.candidates = [];
        this.init();
    }

    init() {
        this.loadCandidates();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('addCandidateBtn')?.addEventListener('click', () => {
            this.openCandidateModal();
        });
    }

    async loadCandidates() {
        try {
            this.candidates = await adminPanel.apiCall('/candidates');
            this.renderCandidatesGrid();
        } catch (error) {
            console.error('Error loading candidates:', error);
            adminPanel.showNotification('Failed to load candidates data', 'error');
        }
    }

    renderCandidatesGrid() {
        const container = document.getElementById('candidatesContainer');
        if (!container) return;

        container.innerHTML = this.candidates.map(candidate => `
            <div class="candidate-card">
                <div class="candidate-header">
                    <div class="candidate-photo">
                        <i class="fas fa-user-tie"></i>
                    </div>
                    <div class="candidate-info">
                        <h4>${candidate.name}</h4>
                        <p class="candidate-party">${candidate.party}</p>
                        <p class="candidate-position">${candidate.position}</p>
                    </div>
                </div>
                <div class="candidate-stats">
                    <div class="stat">
                        <span class="stat-value">${candidate.votes}</span>
                        <span class="stat-label">Votes</span>
                    </div>
                </div>
                <div class="candidate-actions">
                    <button class="btn btn-sm btn-outline" onclick="candidatesManager.editCandidate(${candidate.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="candidatesManager.viewDetails(${candidate.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="candidatesManager.deleteCandidate(${candidate.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    openCandidateModal(candidate = null) {
        // Implementation for candidate modal
        adminPanel.showNotification('Candidate modal would open here', 'info');
    }

    editCandidate(candidateId) {
        const candidate = this.candidates.find(c => c.id === candidateId);
        if (candidate) {
            this.openCandidateModal(candidate);
        }
    }

    viewDetails(candidateId) {
        const candidate = this.candidates.find(c => c.id === candidateId);
        if (candidate) {
            adminPanel.showNotification(`Viewing details for ${candidate.name}`, 'info');
        }
    }

    deleteCandidate(candidateId) {
        const candidate = this.candidates.find(c => c.id === candidateId);
        if (!candidate) return;

        if (confirm(`Are you sure you want to delete ${candidate.name}?`)) {
            this.candidates = this.candidates.filter(c => c.id !== candidateId);
            this.renderCandidatesGrid();
            adminPanel.showNotification('Candidate deleted successfully!', 'success');
        }
    }
}

// Initialize candidates manager
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('candidates')) {
        window.candidatesManager = new CandidatesManager();
    }
});