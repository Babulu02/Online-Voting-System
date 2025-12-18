/**
 * Enhanced Main Application Module
 * Handles core functionality with multi-language support
 */

class SecureVoteApp {
    constructor() {
        this.currentUser = null;
        this.elections = [];
        this.realTimeUpdates = null;
        this.init();
    }

    init() {
        this.checkAuthState();
        this.loadElections();
        this.setupEventListeners();
        this.setupRealTimeUpdates();
        this.setupLanguageIntegration();
        this.loadResults();
        this.setupLanguageSelector();
    }

    checkAuthState() {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            try {
                this.currentUser = JSON.parse(userData);
                this.updateAuthUI();
            } catch (error) {
                console.error('Error parsing user data:', error);
                localStorage.removeItem('currentUser');
            }
        }
    }

    updateAuthUI() {
        const authButtons = document.querySelector('.auth-buttons');
        if (!authButtons) return;

        if (this.currentUser) {
            authButtons.innerHTML = `
                <div class="user-info">
                    <span>Welcome, ${this.currentUser.name}</span>
                    <button class="btn btn-outline" id="logoutBtn">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
            `;
            document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        } else {
            authButtons.innerHTML = `
                <button class="btn btn-outline" id="loginBtn">
                    <i class="fas fa-sign-in-alt"></i> Login
                </button>
                <button class="btn btn-primary" id="registerBtn">
                    <i class="fas fa-user-plus"></i> Register
                </button>
            `;
            document.getElementById('loginBtn').addEventListener('click', () => this.openAuthModal());
            document.getElementById('registerBtn').addEventListener('click', () => this.openAuthModal());
        }
    }

    setupEventListeners() {
        document.getElementById('loginBtn')?.addEventListener('click', () => this.openAuthModal());
        document.getElementById('registerBtn')?.addEventListener('click', () => this.openAuthModal());
        
        document.getElementById('voteNowBtn')?.addEventListener('click', () => {
            if (this.currentUser) {
                this.scrollToElections();
            } else {
                this.openAuthModal();
            }
        });

        this.setupModalHandlers();
        this.setupResultsRefresh();
        this.setupContactForm();
    }

    setupModalHandlers() {
        const authModal = document.getElementById('authModal');
        const closeBtn = authModal?.querySelector('.close');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeAuthModal());
        }
        
        window.addEventListener('click', (e) => {
            if (e.target === authModal) {
                this.closeAuthModal();
            }
        });

        this.setupTabHandlers();
    }

    setupTabHandlers() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.getAttribute('data-tab');
                
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                tabContents.forEach(content => content.classList.remove('active'));
                document.getElementById(tabName + 'Tab').classList.add('active');
            });
        });
    }

    setupResultsRefresh() {
        const refreshBtn = document.getElementById('refreshResults');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadResults();
                this.showNotification('Refreshing results...', 'info');
            });
        }
    }

    setupContactForm() {
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactForm(e);
            });
        }
    }

    async handleContactForm(e) {
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        submitBtn.innerHTML = '<div class="loading-spinner-small"></div> Sending...';
        submitBtn.disabled = true;

        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            this.showNotification('Message sent successfully! We will get back to you soon.', 'success');
            form.reset();
        } catch (error) {
            this.showNotification('Failed to send message. Please try again.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    openAuthModal() {
        const authModal = document.getElementById('authModal');
        if (authModal) {
            authModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    closeAuthModal() {
        const authModal = document.getElementById('authModal');
        if (authModal) {
            authModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    scrollToElections() {
        const electionsSection = document.getElementById('elections');
        if (electionsSection) {
            electionsSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    async loadElections() {
        try {
            console.log('Loading elections for display...');
            
            let elections = [];
            this.showElectionsLoading(true);
            
            elections = this.getMockElections();
            console.log('Final elections to display:', elections);
            
            this.elections = elections;
            this.renderElections(elections);
            
        } catch (error) {
            console.error('Error loading elections:', error);
            this.renderElections(this.getDefaultElections());
        }
    }

    showElectionsLoading(show) {
        const container = document.getElementById('electionsContainer');
        if (!container) return;
        
        if (show) {
            container.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>Loading elections...</p>
                </div>
            `;
        }
    }

    getMockElections() {
        console.log('Loading elections for user view...');
        
        const adminElections = JSON.parse(localStorage.getItem('adminElections') || '[]');
        console.log('Admin elections found:', adminElections.length);
        
        const currentDate = new Date();
        
        const processedAdminElections = adminElections.map(election => {
            const startDate = new Date(election.start_date);
            const endDate = new Date(election.end_date);
            const now = currentDate;
            
            let status = election.status;
            if (status === 'upcoming' && now >= startDate && now <= endDate) {
                status = 'active';
            } else if (status === 'active' && now > endDate) {
                status = 'completed';
            } else if (now < startDate) {
                status = 'upcoming';
            } else if (now > endDate) {
                status = 'completed';
            } else {
                status = 'active';
            }
            
            const participationRate = election.total_voters > 0 
                ? Math.round((election.votes_cast / election.total_voters) * 100)
                : 0;
            
            return {
                ...election,
                status: status,
                participation_rate: participationRate
            };
        });
        
        console.log('Processed admin elections:', processedAdminElections);
        
        const sampleElections = this.getDefaultElections();
        const allElections = [...processedAdminElections, ...sampleElections];
        const uniqueElections = allElections.filter((election, index, self) => 
            index === self.findIndex(e => e.id === election.id)
        );
        
        console.log('Combined elections:', uniqueElections);
        return uniqueElections;
    }

    getDefaultElections() {
        const currentDate = new Date();
        
        const sampleActiveElections = [
            {
                id: 1001,
                title: "Student Council Election 2024",
                description: "Vote for your student council representatives for the academic year 2024-2025. This election determines the leadership that will represent student interests and organize campus events throughout the year.",
                start_date: new Date(currentDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                end_date: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: "active",
                type: "student",
                total_voters: 1250,
                votes_cast: 845,
                participation_rate: 68,
                created_at: new Date(currentDate.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 1002,
                title: "University President Election",
                description: "Elect the next University President who will lead academic initiatives and represent the institution. Candidates present their vision for academic excellence and campus development.",
                start_date: new Date(currentDate.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                end_date: new Date(currentDate.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: "active",
                type: "university",
                total_voters: 5000,
                votes_cast: 3250,
                participation_rate: 65,
                created_at: new Date(currentDate.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 1003,
                title: "Computer Science Department Election",
                description: "Department-specific election for CS student representatives. Vote for candidates who will advocate for curriculum improvements and tech resources in the Computer Science department.",
                start_date: new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                end_date: new Date(currentDate.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: "active",
                type: "department",
                total_voters: 350,
                votes_cast: 280,
                participation_rate: 80,
                created_at: new Date(currentDate.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];

        const sampleUpcomingElections = [
            {
                id: 1004,
                title: "Sports Committee Election",
                description: "Elect representatives for the university sports committee. Candidates will oversee sports facilities, organize tournaments, and promote athletic activities across campus.",
                start_date: new Date(currentDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                end_date: new Date(currentDate.getTime() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: "upcoming",
                type: "sports",
                total_voters: 800,
                votes_cast: 0,
                participation_rate: 0,
                created_at: new Date(currentDate.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 1005,
                title: "Cultural Festival Committee",
                description: "Vote for the organizing committee of the annual cultural festival. Help select the team that will bring diverse cultural events and celebrations to our campus.",
                start_date: new Date(currentDate.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                end_date: new Date(currentDate.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: "upcoming",
                type: "cultural",
                total_voters: 600,
                votes_cast: 0,
                participation_rate: 0,
                created_at: new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];

        return [...sampleActiveElections, ...sampleUpcomingElections];
    }

    renderElections(elections) {
        const container = document.getElementById('electionsContainer');
        if (!container) {
            console.error('Elections container not found!');
            return;
        }

        console.log('Rendering elections:', elections);

        const activeElections = elections.filter(election => election.status === 'active');
        console.log('Active elections to display:', activeElections);

        if (activeElections.length === 0) {
            container.innerHTML = `
                <div class="empty-state-compact">
                    <i class="fas fa-calendar-times"></i>
                    <h3>No Active Elections</h3>
                    <p>There are currently no active elections. Check back later for upcoming voting opportunities.</p>
                    <button class="btn btn-outline" onclick="secureVoteApp.debugElections()">
                        <i class="fas fa-bug"></i> Debug
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = activeElections.map(election => {
            const participationRate = election.participation_rate || 0;
            const daysLeft = Math.ceil((new Date(election.end_date) - new Date()) / (1000 * 60 * 60 * 24));
            const typeIcon = this.getElectionTypeIcon(election.type);
            const typeLabel = this.getElectionTypeLabel(election.type);
            
            return `
                <div class="election-card" data-election-id="${election.id}">
                    <div class="election-header">
                        <div class="election-title-section">
                            <div class="election-type-badge">
                                <i class="${typeIcon}"></i>
                                <span>${typeLabel}</span>
                            </div>
                            <h3>${election.title}</h3>
                        </div>
                        <div class="election-status-section">
                            <span class="election-status active">
                                🟢 Active
                            </span>
                            <span class="days-left">${daysLeft}d left</span>
                        </div>
                    </div>
                    
                    <div class="election-body">
                        <p class="election-description" title="${election.description}">
                            ${election.description}
                        </p>
                        
                        <div class="election-stats-compact">
                            <div class="stat-compact">
                                <span class="stat-label">Voters</span>
                                <span class="stat-value">${(election.total_voters || 0).toLocaleString()}</span>
                            </div>
                            <div class="stat-compact">
                                <span class="stat-label">Votes</span>
                                <span class="stat-value">${(election.votes_cast || 0).toLocaleString()}</span>
                            </div>
                            <div class="stat-compact">
                                <span class="stat-label">Rate</span>
                                <span class="stat-value">${participationRate}%</span>
                            </div>
                        </div>
                        
                        <div class="progress-section">
                            <div class="progress-header">
                                <span class="progress-label">Participation</span>
                                <span class="progress-percentage">${participationRate}%</span>
                            </div>
                            <div class="progress-bar-compact">
                                <div class="progress-fill-compact" style="width: ${participationRate}%"></div>
                            </div>
                            <div class="progress-detail">
                                ${election.votes_cast || 0} / ${election.total_voters || 0} votes
                            </div>
                        </div>
                    </div>
                    
                    <div class="election-footer">
                        <button class="vote-now-btn-compact vote-now-btn" data-election-id="${election.id}">
                            <i class="fas fa-vote-yea"></i> Vote Now
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Add event listeners
        container.querySelectorAll('.vote-now-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const electionId = e.target.getAttribute('data-election-id');
                this.startVoting(electionId);
            });
        });

        console.log('Compact elections rendered successfully');
    }

    getElectionTypeIcon(type) {
        const icons = {
            'student': 'fas fa-user-graduate',
            'university': 'fas fa-university',
            'department': 'fas fa-laptop-code',
            'sports': 'fas fa-running',
            'cultural': 'fas fa-music',
            'general': 'fas fa-vote-yea'
        };
        return icons[type] || 'fas fa-vote-yea';
    }

    getElectionTypeLabel(type) {
        const labels = {
            'student': 'Student Election',
            'university': 'University Election',
            'department': 'Department Election',
            'sports': 'Sports Election',
            'cultural': 'Cultural Election',
            'general': 'General Election'
        };
        return labels[type] || 'Election';
    }

    startVoting(electionId) {
        if (!this.currentUser) {
            this.openAuthModal();
            return;
        }

        if (this.currentUser.hasVoted) {
            this.showNotification('You have already voted in this election.', 'warning');
            return;
        }

        if (window.votingApp) {
            votingApp.openVotingModal(electionId);
        } else {
            this.showNotification('Voting system is not available.', 'error');
        }
    }

    async loadResults() {
        try {
            this.showResultsLoadingState();
            
            let elections;
            
            if (window.apiService && typeof window.apiService.getElections === 'function') {
                const response = await apiService.getElections();
                elections = response.elections || [];
            } else {
                elections = this.elections.length > 0 ? this.elections : this.getMockElections();
            }
            
            const activeElections = elections.filter(e => e.status === 'active') || [];
            this.renderLiveResults(activeElections);
            
        } catch (error) {
            console.error('Error loading results:', error);
            this.showResultsError();
        }
    }

    showResultsLoadingState() {
        const container = document.getElementById('liveResultsContainer');
        if (container) {
            container.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>Loading live results...</p>
                </div>
            `;
        }
    }

    renderLiveResults(elections) {
        const container = document.getElementById('liveResultsContainer');
        if (!container) return;

        if (elections.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chart-line"></i>
                    <h3>No Active Elections</h3>
                    <p>There are no active elections with live results</p>
                </div>
            `;
            return;
        }

        container.innerHTML = elections.map(election => {
            const participationRate = election.participation_rate || 0;
            const totalVoters = election.total_voters || election.totalVoters || 0;
            const votesCast = election.votes_cast || election.votesCast || 0;
            const title = election.title || election.name;
            
            return `
                <div class="result-card" data-election-id="${election.id}">
                    <div class="result-header">
                        <h3>${title}</h3>
                        <span class="live-badge">
                            <i class="fas fa-circle"></i> LIVE
                        </span>
                    </div>
                    <div class="result-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${participationRate}%"></div>
                        </div>
                        <span class="progress-text">${participationRate}% Votes Cast</span>
                    </div>
                    <div class="election-stats">
                        <div class="stat">
                            <span class="stat-label">Total Voters</span>
                            <span class="stat-value">${totalVoters.toLocaleString()}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Votes Cast</span>
                            <span class="stat-value">${votesCast.toLocaleString()}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Participation</span>
                            <span class="stat-value">${participationRate}%</span>
                        </div>
                    </div>
                    <button class="btn btn-outline view-detailed-results" data-election-id="${election.id}">
                        <i class="fas fa-chart-pie"></i> View Detailed Results
                    </button>
                </div>
            `;
        }).join('');

        container.querySelectorAll('.view-detailed-results').forEach(button => {
            button.addEventListener('click', (e) => {
                const electionId = e.target.getAttribute('data-election-id');
                this.showDetailedResults(electionId);
            });
        });

        this.startResultsRealTimeUpdates();
    }

    async showDetailedResults(electionId) {
        try {
            this.showNotification('Loading detailed results...', 'info');
            
            let results;
            if (window.apiService && typeof window.apiService.getResults === 'function') {
                results = await apiService.getResults(electionId);
            } else {
                results = this.getMockDetailedResults(electionId);
            }
            
            this.showResultsModal(results);
            
        } catch (error) {
            console.error('Error loading detailed results:', error);
            this.showNotification('Failed to load detailed results', 'error');
        }
    }

    getMockDetailedResults(electionId) {
        const election = this.elections.find(e => e.id == electionId);
        if (!election) {
            return {
                electionId: electionId,
                title: "Detailed Election Results",
                totalVoters: 1000,
                votesCast: 650,
                participationRate: 65,
                candidates: [
                    { id: 1, name: "Candidate A", votes: 320, percentage: 49.2, party: "Independent" },
                    { id: 2, name: "Candidate B", votes: 220, percentage: 33.8, party: "Progress Party" },
                    { id: 3, name: "Candidate C", votes: 110, percentage: 16.9, party: "Unity Alliance" }
                ],
                regions: [
                    { name: "North District", participation: 72, leadingCandidate: "Candidate A" },
                    { name: "South District", participation: 68, leadingCandidate: "Candidate A" },
                    { name: "East District", participation: 61, leadingCandidate: "Candidate B" },
                    { name: "West District", participation: 59, leadingCandidate: "Candidate C" }
                ],
                lastUpdated: new Date().toISOString()
            };
        }

        const totalVotes = election.votes_cast || election.votesCast || 650;
        return {
            electionId: electionId,
            title: `${election.title} - Detailed Results`,
            totalVoters: election.total_voters || election.totalVoters || 1000,
            votesCast: totalVotes,
            participationRate: election.participation_rate || 65,
            candidates: [
                { id: 1, name: "John Smith", votes: Math.floor(totalVotes * 0.45), percentage: 45, party: "Independent" },
                { id: 2, name: "Maria Garcia", votes: Math.floor(totalVotes * 0.35), percentage: 35, party: "Progress Party" },
                { id: 3, name: "David Johnson", votes: Math.floor(totalVotes * 0.20), percentage: 20, party: "Unity Alliance" }
            ],
            regions: [
                { name: "District 1", participation: 75, leadingCandidate: "John Smith" },
                { name: "District 2", participation: 68, leadingCandidate: "Maria Garcia" },
                { name: "District 3", participation: 62, leadingCandidate: "John Smith" },
                { name: "District 4", participation: 58, leadingCandidate: "David Johnson" }
            ],
            lastUpdated: new Date().toISOString()
        };
    }

    showResultsModal(results) {
        let resultsModal = document.getElementById('resultsModal');
        
        if (!resultsModal) {
            resultsModal = document.createElement('div');
            resultsModal.id = 'resultsModal';
            resultsModal.className = 'modal';
            resultsModal.innerHTML = `
                <div class="modal-content results-modal">
                    <div class="modal-header">
                        <h2><i class="fas fa-chart-pie"></i> Detailed Election Results</h2>
                        <span class="close">&times;</span>
                    </div>
                    <div class="modal-body" id="detailedResultsContent">
                    </div>
                </div>
            `;
            document.body.appendChild(resultsModal);

            resultsModal.querySelector('.close').addEventListener('click', () => {
                resultsModal.style.display = 'none';
            });

            resultsModal.addEventListener('click', (e) => {
                if (e.target === resultsModal) {
                    resultsModal.style.display = 'none';
                }
            });
        }

        const content = document.getElementById('detailedResultsContent');
        content.innerHTML = this.createDetailedResultsHTML(results);

        resultsModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    createDetailedResultsHTML(results) {
        return `
            <div class="detailed-results">
                <div class="results-summary">
                    <h3>${results.title}</h3>
                    <div class="summary-stats">
                        <div class="summary-stat">
                            <span class="stat-label">Total Voters</span>
                            <span class="stat-value">${results.totalVoters.toLocaleString()}</span>
                        </div>
                        <div class="summary-stat">
                            <span class="stat-label">Votes Cast</span>
                            <span class="stat-value">${results.votesCast.toLocaleString()}</span>
                        </div>
                        <div class="summary-stat">
                            <span class="stat-label">Participation</span>
                            <span class="stat-value">${results.participationRate}%</span>
                        </div>
                    </div>
                </div>

                <div class="candidates-results">
                    <h4><i class="fas fa-user-tie"></i> Candidate Results</h4>
                    <div class="candidates-list">
                        ${results.candidates.map(candidate => `
                            <div class="candidate-result">
                                <div class="candidate-info">
                                    <span class="candidate-name">${candidate.name}</span>
                                    <span class="candidate-party">${candidate.party || 'Independent'}</span>
                                </div>
                                <div class="candidate-votes">
                                    <div class="vote-progress">
                                        <div class="progress-bar">
                                            <div class="progress-fill" style="width: ${candidate.percentage}%"></div>
                                        </div>
                                        <span class="vote-percentage">${candidate.percentage}%</span>
                                    </div>
                                    <span class="vote-count">${candidate.votes.toLocaleString()} votes</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                ${results.regions ? `
                <div class="regional-results">
                    <h4><i class="fas fa-map-marker-alt"></i> Regional Results</h4>
                    <div class="regions-grid">
                        ${results.regions.map(region => `
                            <div class="region-result">
                                <span class="region-name">${region.name}</span>
                                <span class="region-participation">${region.participation}% Participation</span>
                                <span class="region-leading">Leading: ${region.leadingCandidate}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                <div class="results-footer">
                    <p class="last-updated">
                        <i class="fas fa-clock"></i> 
                        Last updated: ${new Date(results.lastUpdated).toLocaleString()}
                    </p>
                </div>
            </div>
        `;
    }

    startResultsRealTimeUpdates() {
        if (this.resultsUpdateInterval) {
            clearInterval(this.resultsUpdateInterval);
        }

        this.resultsUpdateInterval = setInterval(() => {
            this.updateLiveResultsDisplay();
        }, 30000);
    }

    updateLiveResultsDisplay() {
        const resultCards = document.querySelectorAll('.result-card');
        resultCards.forEach(card => {
            const electionId = card.getAttribute('data-election-id');
            const election = this.elections.find(e => e.id == electionId);
            
            if (election && election.status === 'active') {
                if (Math.random() > 0.7) {
                    const progressFill = card.querySelector('.progress-fill');
                    const progressText = card.querySelector('.progress-text');
                    const votesCastElem = card.querySelector('.stat-value:nth-child(2)');
                    const participationElem = card.querySelector('.stat-value:nth-child(3)');
                    
                    if (progressFill && progressText) {
                        const currentWidth = parseFloat(progressFill.style.width) || 0;
                        const newWidth = Math.min(currentWidth + 0.5, 100);
                        progressFill.style.width = `${newWidth}%`;
                        progressText.textContent = `${newWidth.toFixed(1)}% Votes Cast`;
                        
                        if (votesCastElem && participationElem) {
                            const currentVotes = parseInt(votesCastElem.textContent.replace(/,/g, '')) || 0;
                            const newVotes = currentVotes + Math.floor(Math.random() * 5);
                            votesCastElem.textContent = newVotes.toLocaleString();
                            participationElem.textContent = `${newWidth.toFixed(1)}%`;
                        }
                    }
                }
            }
        });
    }

    showResultsError() {
        const container = document.getElementById('liveResultsContainer');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Unable to load results</h3>
                    <p>Please try again later</p>
                    <button class="btn btn-primary" onclick="secureVoteApp.loadResults()">
                        <i class="fas fa-redo"></i> Retry
                    </button>
                </div>
            `;
        }
    }

    setupRealTimeUpdates() {
        if (typeof io !== 'undefined') {
            this.socket = io();
            this.socket.on('resultsUpdate', (data) => {
                this.updateResultsDisplay(data);
            });
        }
    }

    setupLanguageIntegration() {
        if (window.languageManager) {
            window.languageManager.init();
            
            setTimeout(() => {
                const allSelectors = document.querySelectorAll('.language-selector');
                if (allSelectors.length > 1) {
                    for (let i = 1; i < allSelectors.length; i++) {
                        allSelectors[i].parentNode.remove();
                    }
                }
            }, 100);
        }
    }

    setupLanguageSelector() {
        const existingSelectors = document.querySelectorAll('.language-container');
        existingSelectors.forEach(selector => selector.remove());
        
        const nav = document.querySelector('nav ul');
        if (!nav) return;
        
        const languageContainer = document.createElement('li');
        languageContainer.className = 'language-container';
        languageContainer.innerHTML = `
            <div class="language-selector">
                <button class="language-toggle" id="languageToggle">
                    <i class="fas fa-globe"></i>
                    <span class="language-text">EN</span>
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div class="language-dropdown">
                    <div class="language-list">
                        <button class="language-option active" data-lang="en">
                            <span class="language-flag">🇺🇸</span>
                            <span class="language-name">English</span>
                        </button>
                        <button class="language-option" data-lang="es">
                            <span class="language-flag">🇪🇸</span>
                            <span class="language-name">Español</span>
                        </button>
                        <button class="language-option" data-lang="fr">
                            <span class="language-flag">🇫🇷</span>
                            <span class="language-name">Français</span>
                        </button>
                        <button class="language-option" data-lang="de">
                            <span class="language-flag">🇩🇪</span>
                            <span class="language-name">Deutsch</span>
                        </button>
                        <button class="language-option" data-lang="hi">
                            <span class="language-flag">🇮🇳</span>
                            <span class="language-name">हिन्दी</span>
                        </button>
                        <button class="language-option" data-lang="te">
                            <span class="language-flag">🇮🇳</span>
                            <span class="language-name">తెలుగు</span>
                        </button>
                        <button class="language-option" data-lang="ar">
                            <span class="language-flag">🇦🇪</span>
                            <span class="language-name">العربية</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        nav.appendChild(languageContainer);
        this.setupLanguageSelectorEvents();
    }

    setupLanguageSelectorEvents() {
        const languageToggle = document.getElementById('languageToggle');
        const languageSelector = document.querySelector('.language-selector');
        const languageOptions = document.querySelectorAll('.language-option');
        
        if (!languageToggle || !languageSelector) return;
        
        languageToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            languageSelector.classList.toggle('active');
        });
        
        languageOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = option.getAttribute('data-lang');
                this.changeLanguage(lang);
                
                languageOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                const langText = languageToggle.querySelector('.language-text');
                if (langText) {
                    langText.textContent = lang.toUpperCase();
                }
                
                languageSelector.classList.remove('active');
            });
        });
        
        document.addEventListener('click', (e) => {
            if (!languageSelector.contains(e.target)) {
                languageSelector.classList.remove('active');
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                languageSelector.classList.remove('active');
            }
        });
    }

    changeLanguage(lang) {
        console.log('Changing language to:', lang);
        
        const languageText = document.querySelector('.language-text');
        if (languageText) {
            languageText.textContent = lang.toUpperCase();
        }
        
        if (window.languageManager && typeof window.languageManager.changeLanguage === 'function') {
            window.languageManager.changeLanguage(lang);
        } else {
            this.showNotification(`Language changed to ${this.getLanguageName(lang)}`, 'info');
            this.applyBasicTranslations(lang);
        }
    }

    getLanguageName(lang) {
        const languages = {
            'en': 'English',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'hi': 'Hindi',
            'te': 'Telugu',
            'ar': 'Arabic'
        };
        return languages[lang] || 'English';
    }

    applyBasicTranslations(lang) {
        const translations = {
            'en': {
                'home': 'Home',
                'about': 'About',
                'elections': 'Elections',
                'results': 'Results',
                'contact': 'Contact',
                'adminPanel': 'Admin Panel',
                'login': 'Login',
                'register': 'Register',
                'welcome': 'Welcome to SecureVote',
                'tagline': 'Secure, Transparent, and Accessible Voting System',
                'voteNow': 'Vote Now',
                'viewResults': 'View Results',
                'liveResults': 'Live Results',
                'activeElections': 'Active Elections',
                'totalVoters': 'Total Voters',
                'votesCast': 'Votes Cast',
                'participation': 'Participation'
            },
            'es': {
                'home': 'Inicio',
                'about': 'Acerca de',
                'elections': 'Elecciones',
                'results': 'Resultados',
                'contact': 'Contacto',
                'adminPanel': 'Panel Admin',
                'login': 'Iniciar Sesión',
                'register': 'Registrarse',
                'welcome': 'Bienvenido a SecureVote',
                'tagline': 'Sistema de Votación Seguro, Transparente y Accesible',
                'voteNow': 'Votar Ahora',
                'viewResults': 'Ver Resultados',
                'liveResults': 'Resultados en Vivo',
                'activeElections': 'Elecciones Activas',
                'totalVoters': 'Total de Votantes',
                'votesCast': 'Votos Emitidos',
                'participation': 'Participación'
            },
            'fr': {
                'home': 'Accueil',
                'about': 'À propos',
                'elections': 'Élections',
                'results': 'Résultats',
                'contact': 'Contact',
                'adminPanel': 'Panneau Admin',
                'login': 'Connexion',
                'register': 'S\'inscrire',
                'welcome': 'Bienvenue sur SecureVote',
                'tagline': 'Système de Vote Sécurisé, Transparent et Accessible',
                'voteNow': 'Voter Maintenant',
                'viewResults': 'Voir les Résultats',
                'liveResults': 'Résultats en Direct',
                'activeElections': 'Élections Activas',
                'totalVoters': 'Total des Votants',
                'votesCast': 'Votes Exprimés',
                'participation': 'Participation'
            },
            'de': {
                'home': 'Startseite',
                'about': 'Über uns',
                'elections': 'Wahlen',
                'results': 'Ergebnisse',
                'contact': 'Kontakt',
                'adminPanel': 'Admin Panel',
                'login': 'Anmelden',
                'register': 'Registrieren',
                'welcome': 'Willkommen bei SecureVote',
                'tagline': 'Sicheres, Transparentes und Zugängliches Wahlsystem',
                'voteNow': 'Jetzt Wählen',
                'viewResults': 'Ergebnisse Anzeigen',
                'liveResults': 'Live Ergebnisse',
                'activeElections': 'Aktive Wahlen',
                'totalVoters': 'Gesamtwähler',
                'votesCast': 'Abgegebene Stimmen',
                'participation': 'Beteiligung'
            },
            'hi': {
                'home': 'होम',
                'about': 'हमारे बारे में',
                'elections': 'चुनाव',
                'results': 'परिणाम',
                'contact': 'संपर्क',
                'adminPanel': 'एडमिन पैनल',
                'login': 'लॉगिन',
                'register': 'रजिस्टर',
                'welcome': 'सिक्योरवोट में आपका स्वागत है',
                'tagline': 'सुरक्षित, पारदर्शी और सुलभ मतदान प्रणाली',
                'voteNow': 'अभी वोट करें',
                'viewResults': 'परिणाम देखें',
                'liveResults': 'लाइव परिणाम',
                'activeElections': 'सक्रिय चुनाव',
                'totalVoters': 'कुल मतदाता',
                'votesCast': 'डाले गए वोट',
                'participation': 'भागीदारी'
            },
            'te': {
                'home': 'హోమ్',
                'about': 'మా గురించి',
                'elections': 'ఎన్నికలు',
                'results': 'ఫలితాలు',
                'contact': 'సంప్రదించండి',
                'adminPanel': 'అడ్మిన్ ప్యానెల్',
                'login': 'లాగిన్',
                'register': 'నమోదు చేసుకోండి',
                'welcome': 'సెక్యూర్ వోట్ కు స్వాగతం',
                'tagline': 'సురక్షిత, పారదర్శక మరియు ప్రాప్యత ఓటింగ్ వ్యవస్థ',
                'voteNow': 'ఇప్పుడే వోట్ చేయండి',
                'viewResults': 'ఫలితాలు చూడండి',
                'liveResults': 'లైవ్ ఫలితాలు',
                'activeElections': 'సక్రియ ఎన్నికలు',
                'totalVoters': 'మొత్తం ఓటర్లు',
                'votesCast': 'వోట్లు వేయబడినవి',
                'participation': 'పాల్గొనడం'
            },
            'ar': {
                'home': 'الرئيسية',
                'about': 'حول',
                'elections': 'الانتخابات',
                'results': 'النتائج',
                'contact': 'اتصل بنا',
                'adminPanel': 'لوحة الإدارة',
                'login': 'تسجيل الدخول',
                'register': 'تسجيل',
                'welcome': 'مرحبًا بك في SecureVote',
                'tagline': 'نظام تصويت آمن وشفاف ومتاح',
                'voteNow': 'صوت الآن',
                'viewResults': 'عرض النتائج',
                'liveResults': 'النتائج المباشرة',
                'activeElections': 'الانتخابات النشطة',
                'totalVoters': 'إجمالي الناخبين',
                'votesCast': 'الأصوات المدلى بها',
                'participation': 'المشاركة'
            }
        };
        
        const translation = translations[lang] || translations['en'];
        
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translation[key]) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.setAttribute('placeholder', translation[key]);
                } else {
                    element.textContent = translation[key];
                }
            }
        });
        
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            if (translation[key]) {
                element.setAttribute('placeholder', translation[key]);
            }
        });

        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            if (translation[key]) {
                element.setAttribute('title', translation[key]);
            }
        });

        document.querySelectorAll('[data-i18n-alt]').forEach(element => {
            const key = element.getAttribute('data-i18n-alt');
            if (translation[key]) {
                element.setAttribute('alt', translation[key]);
            }
        });
    }

    showNotification(message, type = 'info') {
        let container = document.getElementById('notificationContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notificationContainer';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }        

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

        container.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease forwards';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);

        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        });
    }

    debugElections() {
        console.log('=== ELECTIONS DEBUG INFO ===');
        
        const adminElections = JSON.parse(localStorage.getItem('adminElections') || '[]');
        console.log('Admin elections in localStorage:', adminElections);
        
        console.log('Current elections in app:', this.elections);
        
        const container = document.getElementById('electionsContainer');
        console.log('Elections container exists:', !!container);
        
        if (container) {
            console.log('Current container content:', container.innerHTML);
        }
        
        console.log('============================');
    }

    refreshElections() {
        console.log('Force refreshing elections...');
        this.loadElections();
    }

    logout() {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        this.updateAuthUI();
        this.showNotification('Logged out successfully', 'success');
    }

    destroy() {
        if (this.resultsUpdateInterval) {
            clearInterval(this.resultsUpdateInterval);
        }
        if (this.socket) {
            this.socket.disconnect();
        }
    }
}

// Add compact CSS styles
const compactStyles = document.createElement('style');
compactStyles.textContent = `
    /* Compact Modern Election Cards */
    .election-card {
        background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        border-radius: 16px;
        box-shadow: 
            0 4px 20px rgba(0, 0, 0, 0.08),
            0 2px 4px rgba(0, 0, 0, 0.02);
        overflow: hidden;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid rgba(255, 255, 255, 0.8);
        position: relative;
        height: fit-content;
    }

    .election-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .election-card:hover {
        transform: translateY(-4px);
        box-shadow: 
            0 12px 40px rgba(0, 0, 0, 0.12),
            0 4px 8px rgba(0, 0, 0, 0.06);
    }

    .election-header {
        padding: 1.25rem 1.5rem 1rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
    }

    .election-title-section {
        flex: 1;
        min-width: 0;
    }

    .election-type-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        background: rgba(255, 255, 255, 0.15);
        padding: 0.3rem 0.75rem;
        border-radius: 12px;
        font-size: 0.7rem;
        margin-bottom: 0.6rem;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.3px;
    }

    .election-type-badge i {
        font-size: 0.75rem;
    }

    .election-header h3 {
        margin: 0;
        font-size: 1.1rem;
        line-height: 1.3;
        font-weight: 700;
        color: white;
        text-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }

    .election-status-section {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 0.4rem;
        flex-shrink: 0;
    }

    .election-status {
        padding: 0.35rem 0.8rem;
        border-radius: 10px;
        font-size: 0.7rem;
        font-weight: 700;
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        text-transform: uppercase;
        letter-spacing: 0.3px;
        white-space: nowrap;
    }

    .days-left {
        font-size: 0.75rem;
        opacity: 0.9;
        font-weight: 600;
        white-space: nowrap;
    }

    .election-body {
        padding: 1.25rem 1.5rem;
    }

    .election-description {
        color: #64748b;
        line-height: 1.5;
        margin-bottom: 1rem;
        font-size: 0.9rem;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    /* Compact Stats Grid */
    .election-stats-compact {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.75rem;
        margin: 1rem 0;
    }

    .stat-compact {
        text-align: center;
        padding: 0.75rem 0.5rem;
        background: linear-gradient(135deg, #f8fafc, #f1f5f9);
        border-radius: 10px;
        border: 1px solid #f1f5f9;
        transition: all 0.2s ease;
    }

    .stat-compact:hover {
        background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
        transform: translateY(-1px);
    }

    .stat-compact .stat-label {
        display: block;
        font-size: 0.7rem;
        color: #64748b;
        margin-bottom: 0.4rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.3px;
    }

    .stat-compact .stat-value {
        display: block;
        font-size: 1.1rem;
        font-weight: 800;
        color: #1e293b;
    }

    /* Progress Section */
    .progress-section {
        margin: 1rem 0 0.5rem;
    }

    .progress-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
        font-size: 0.8rem;
    }

    .progress-label {
        color: #475569;
        font-weight: 600;
    }

    .progress-percentage {
        color: #059669;
        font-weight: 700;
        font-size: 0.85rem;
    }

    .progress-bar-compact {
        width: 100%;
        height: 6px;
        background: #e2e8f0;
        border-radius: 3px;
        overflow: hidden;
        margin-bottom: 0.5rem;
    }

    .progress-fill-compact {
        height: 100%;
        background: linear-gradient(135deg, #10b981, #059669);
        border-radius: 3px;
        transition: width 0.8s ease;
        position: relative;
    }

    .progress-fill-compact::after {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
        animation: shimmer 2s infinite;
    }

    @keyframes shimmer {
        0% { left: -100%; }
        100% { left: 200%; }
    }

    .progress-detail {
        font-size: 0.75rem;
        color: #64748b;
        text-align: center;
    }

    .election-footer {
        padding: 1rem 1.5rem 1.25rem;
        background: #f8fafc;
        border-top: 1px solid #f1f5f9;
    }

    .vote-now-btn-compact {
        width: 100%;
        padding: 0.75rem 1.5rem;
        font-size: 0.9rem;
        font-weight: 700;
        transition: all 0.3s ease;
        border-radius: 10px;
        background: linear-gradient(135deg, #10b981, #059669);
        border: none;
        color: white;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        position: relative;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }

    .vote-now-btn-compact:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
        background: linear-gradient(135deg, #059669, #047857);
    }

    .vote-now-btn-compact:active {
        transform: translateY(0);
    }

    /* Empty State Compact */
    .empty-state-compact {
        text-align: center;
        padding: 2rem 1.5rem;
        color: #64748b;
        background: linear-gradient(135deg, #ffffff, #f8fafc);
        border-radius: 12px;
        border: 2px dashed #cbd5e0;
        margin: 1rem 0;
    }

    .empty-state-compact i {
        font-size: 2.5rem;
        margin-bottom: 1rem;
        color: #cbd5e0;
    }

    .empty-state-compact h3 {
        margin-bottom: 0.75rem;
        color: #475569;
        font-size: 1.1rem;
    }

    .empty-state-compact p {
        margin-bottom: 1.5rem;
        font-size: 0.9rem;
        line-height: 1.4;
    }

    /* Grid Layout for Multiple Cards */
    .elections-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 1.5rem;
        padding: 1rem 0;
    }

    @media (max-width: 768px) {
        .election-header {
            flex-direction: column;
            text-align: center;
            padding: 1rem 1.25rem 0.75rem;
            gap: 0.75rem;
        }
        
        .election-status-section {
            align-items: center;
            flex-direction: row;
            justify-content: center;
            gap: 0.75rem;
        }
        
        .election-body {
            padding: 1rem 1.25rem;
        }
        
        .election-stats-compact {
            gap: 0.5rem;
        }
        
        .election-footer {
            padding: 0.75rem 1.25rem 1rem;
        }
        
        .vote-now-btn-compact {
            padding: 0.7rem 1.25rem;
            font-size: 0.85rem;
        }
    }

    @media (max-width: 480px) {
        .election-card {
            border-radius: 12px;
            margin: 0.25rem 0;
        }
        
        .election-header h3 {
            font-size: 1rem;
        }
        
        .election-stats-compact {
            grid-template-columns: 1fr;
            gap: 0.5rem;
        }
        
        .stat-compact {
            padding: 0.6rem 0.5rem;
        }
    }

    @media (max-width: 640px) {
        .elections-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
        }
    }
`;
document.head.appendChild(compactStyles);

// Initialize the application
let secureVoteApp;

document.addEventListener('DOMContentLoaded', function() {
    secureVoteApp = new SecureVoteApp();
    window.secureVoteApp = secureVoteApp;
});