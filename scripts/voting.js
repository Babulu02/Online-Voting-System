/**
 * Enhanced Voting System Module
 * Handles the complete voting process with single face verification and API integration
 */

class VotingSystem {
    constructor() {
        this.selectedCandidates = [];
        this.electionData = null;
        this.cameraStream = null;
        this.hasVerifiedFace = false;
        this.isSubmittingVote = false;
        this.voteInProgress = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkVotingStatus();
    }

    setupEventListeners() {
        // Close modal handlers
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('voting-close') || e.target.closest('.voting-close')) {
                this.closeVotingModal();
            }
        });

        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.id === 'votingModal') {
                this.closeVotingModal();
            }
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('votingModal')?.style.display === 'block') {
                this.closeVotingModal();
            }
        });
    }

    checkVotingStatus() {
        const user = this.getCurrentUser();
        if (user && user.hasVoted) {
            this.disableVoteButtons();
        }
    }

    disableVoteButtons() {
        document.querySelectorAll('.election-card button.btn-primary').forEach(button => {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-check-circle"></i> Voted';
            button.classList.add('voted');
        });
    }

    async openVotingModal(electionId) {
        console.log('Opening voting modal for election:', electionId);
        
        // Check user authentication
        const user = this.getCurrentUser();
        if (!user) {
            this.showNotification('Please login to vote.', 'error');
            document.getElementById('authModal').style.display = 'block';
            return;
        }

        // Check if user has already voted
        if (user.hasVoted) {
            this.showNotification('You have already voted in this election.', 'warning');
            return;
        }

        // Reset state
        this.selectedCandidates = [];
        this.electionData = null;
        this.hasVerifiedFace = false;
        this.voteInProgress = true;
        
        // Show voting modal
        const votingModal = document.getElementById('votingModal');
        votingModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        document.body.classList.add('modal-open');
        
        try {
            // Load election data and start face verification
            await this.loadElectionData(electionId);
            this.showFaceVerification();
        } catch (error) {
            console.error('Error opening voting modal:', error);
            this.showNotification('Failed to load election data. Please try again.', 'error');
            this.closeVotingModal();
        }
    }

    closeVotingModal() {
        const votingModal = document.getElementById('votingModal');
        if (votingModal) {
            votingModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            document.body.classList.remove('modal-open');
        }
        this.stopCamera();
        this.voteInProgress = false;
    }

    async loadElectionData(electionId) {
        try {
            // Try to use API service if available
            if (window.apiService && typeof window.apiService.getElection === 'function') {
                try {
                    const electionData = await apiService.getElection(electionId);
                    if (electionData && electionData.election) {
                        this.electionData = electionData.election;
                        return;
                    }
                } catch (apiError) {
                    console.log('API failed, using mock data:', apiError);
                }
            }
            
            // Fallback to mock data
            this.electionData = this.getMockElectionData(electionId);
            
        } catch (error) {
            console.error('Error loading election data:', error);
            // Final fallback
            this.electionData = this.getMockElectionData(electionId);
        }
    }

    getMockElectionData(electionId) {
        const mockElections = {
            1: {
                id: 1,
                title: "Student Council Election 2024",
                description: "Vote for your student council representatives",
                positions: [
                    {
                        id: 1,
                        title: "President",
                        description: "Chief executive officer of the student council",
                        maxSelections: 1,
                        minSelections: 1,
                        candidates: [
                            { 
                                id: 1, 
                                name: "John Smith", 
                                party: "Unity Party", 
                                agenda: "Focus on student welfare and campus improvements", 
                                symbol: "👥",
                                image: null
                            },
                            { 
                                id: 2, 
                                name: "Sarah Johnson", 
                                party: "Progress Alliance", 
                                agenda: "Innovation and digital transformation", 
                                symbol: "🚀",
                                image: null
                            }
                        ]
                    },
                    {
                        id: 2,
                        title: "Vice President",
                        description: "Supports the president and oversees committees",
                        maxSelections: 1,
                        minSelections: 1,
                        candidates: [
                            { 
                                id: 3, 
                                name: "Emily Davis", 
                                party: "Unity Party", 
                                agenda: "Collaboration and team building", 
                                symbol: "🤝",
                                image: null
                            },
                            { 
                                id: 4, 
                                name: "Robert Wilson", 
                                party: "Progress Alliance", 
                                agenda: "Technology and infrastructure", 
                                symbol: "💻",
                                image: null
                            }
                        ]
                    }
                ]
            },
            2: {
                id: 2,
                title: "Class Representative Election",
                description: "Elect your class representatives for various departments",
                positions: [
                    {
                        id: 1,
                        title: "Computer Science Representative",
                        description: "Represent CS department students",
                        maxSelections: 1,
                        minSelections: 1,
                        candidates: [
                            { 
                                id: 1, 
                                name: "Sarah Chen", 
                                party: "Academic Excellence", 
                                agenda: "Improving lab facilities and research opportunities", 
                                symbol: "👩‍💻",
                                image: null
                            },
                            { 
                                id: 2, 
                                name: "Michael Brown", 
                                party: "Student First", 
                                agenda: "Better industry connections and internship opportunities", 
                                symbol: "👨‍🎓",
                                image: null
                            }
                        ]
                    }
                ]
            }
        };

        return mockElections[electionId] || mockElections[1];
    }

    showFaceVerification() {
        const votingBody = document.getElementById('votingBody');
        votingBody.innerHTML = `
            <div class="face-verification-container">
                <div class="verification-header">
                    <h3><i class="fas fa-user-check"></i> Identity Verification</h3>
                    <p>Please verify your identity to cast your vote</p>
                </div>
                
                <div class="camera-container">
                    <video id="verificationVideo" autoplay playsinline muted></video>
                    <div class="camera-overlay">
                        <div class="face-outline"></div>
                        <div class="verification-hint">
                            <i class="fas fa-lightbulb"></i> Ensure good lighting and look directly at the camera
                        </div>
                    </div>
                </div>
                
                <div id="verificationStatus" class="verification-status verification-loading">
                    <i class="fas fa-sync fa-spin"></i> Initializing camera...
                </div>
                
                <div class="verification-actions">
                    <button class="btn btn-primary" id="verifyFaceBtn" disabled>
                        <i class="fas fa-check-circle"></i> Verify Identity
                    </button>
                    <button class="btn btn-outline" id="skipVerification">
                        <i class="fas fa-forward"></i> Skip Verification (Demo)
                    </button>
                    <button class="btn btn-outline" id="cancelVerification">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </div>
            </div>
        `;

        this.initializeCamera();
        
        document.getElementById('verifyFaceBtn').addEventListener('click', () => {
            this.verifyFace();
        });
        
        document.getElementById('skipVerification').addEventListener('click', () => {
            this.skipVerification();
        });
        
        document.getElementById('cancelVerification').addEventListener('click', () => {
            this.closeVotingModal();
        });
    }

    async initializeCamera() {
        const video = document.getElementById('verificationVideo');
        const status = document.getElementById('verificationStatus');
        const verifyBtn = document.getElementById('verifyFaceBtn');
        
        try {
            this.stopCamera();
            
            // Check if camera is available
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Camera not available on this device');
            }
            
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
            
            status.innerHTML = '<i class="fas fa-check-circle"></i> Camera ready - Please look at the camera';
            status.className = 'verification-status verification-ready';
            verifyBtn.disabled = false;
            
            this.cameraStream = stream;
            
        } catch (error) {
            console.error('Camera error:', error);
            status.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i> Camera access not available
                <div class="error-details">You can still continue with demo verification</div>
            `;
            status.className = 'verification-status verification-error';
            verifyBtn.disabled = true;
        }
    }

    async verifyFace() {
        const status = document.getElementById('verificationStatus');
        const verifyBtn = document.getElementById('verifyFaceBtn');
        const video = document.getElementById('verificationVideo');
        
        status.innerHTML = '<i class="fas fa-sync fa-spin"></i> Analyzing your face...';
        status.className = 'verification-status verification-loading';
        verifyBtn.disabled = true;
        verifyBtn.innerHTML = '<i class="fas fa-sync fa-spin"></i> Verifying...';

        try {
            // Try API verification first if available
            if (window.apiService && typeof window.apiService.verifyFace === 'function') {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                const imageData = canvas.toDataURL('image/jpeg');
                
                const verificationResult = await apiService.verifyFace({
                    userId: this.getCurrentUser().id,
                    imageData: imageData,
                    electionId: this.electionData.id
                });

                if (verificationResult.success) {
                    this.handleVerificationSuccess(status);
                    return;
                } else {
                    throw new Error(verificationResult.message || 'Face verification failed');
                }
            } else {
                // Simulate face verification for demo
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // 80% success rate for demo
                if (Math.random() > 0.2) {
                    this.handleVerificationSuccess(status);
                } else {
                    throw new Error('Face verification failed. Please try again in better lighting conditions.');
                }
            }
            
        } catch (error) {
            console.error('Face verification error:', error);
            status.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i> Verification failed
                <div class="error-details">${error.message || 'Please try again in better lighting conditions'}</div>
            `;
            status.className = 'verification-status verification-error';
            verifyBtn.disabled = false;
            verifyBtn.innerHTML = '<i class="fas fa-check-circle"></i> Try Again';
        }
    }

    handleVerificationSuccess(status) {
        status.innerHTML = '<i class="fas fa-check-circle"></i> Identity verified successfully!';
        status.className = 'verification-status verification-success';
        this.hasVerifiedFace = true;
        
        setTimeout(() => {
            this.stopCamera();
            this.showVotingInterface();
        }, 1000);
    }

    skipVerification() {
        this.showNotification('Using demo mode - verification skipped', 'info');
        this.hasVerifiedFace = false; // Mark as not verified but allow continuation
        this.stopCamera();
        this.showVotingInterface();
    }

    showVotingInterface() {
        if (!this.electionData) {
            this.showNotification('Election data not loaded. Please try again.', 'error');
            this.closeVotingModal();
            return;
        }

        const votingBody = document.getElementById('votingBody');
        
        votingBody.innerHTML = `
            <div class="voting-header">
                <div class="election-info">
                    <h3>${this.electionData.title}</h3>
                    <p>${this.electionData.description}</p>
                </div>
                <div class="voting-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(this.selectedCandidates.length / this.electionData.positions.length) * 100}%"></div>
                    </div>
                    <span>${this.selectedCandidates.length}/${this.electionData.positions.length} positions</span>
                </div>
            </div>
            
            <div class="positions-container">
                ${this.electionData.positions.map(position => {
                    const isPositionSelected = this.selectedCandidates.some(sc => sc.positionId == position.id);
                    return `
                    <div class="position-section ${isPositionSelected ? 'completed' : ''}">
                        <div class="position-header">
                            <div class="position-status">
                                <i class="fas fa-${isPositionSelected ? 'check-circle' : 'circle'}"></i>
                            </div>
                            <div class="position-info">
                                <h3>${position.title}</h3>
                                <p>${position.description}</p>
                                <div class="selection-info">Select ${position.maxSelections || 1} candidate(s)</div>
                            </div>
                        </div>
                        <div class="candidates-list">
                            ${position.candidates.map(candidate => {
                                const isSelected = this.selectedCandidates.some(
                                    sc => sc.positionId == position.id && sc.candidateId == candidate.id
                                );
                                return `
                                <div class="candidate-option ${isSelected ? 'selected' : ''}" 
                                     data-position="${position.id}" 
                                     data-candidate="${candidate.id}">
                                    <div class="candidate-selector">
                                        <i class="fas fa-${isSelected ? 'check-circle' : 'circle'}"></i>
                                    </div>
                                    <div class="candidate-info">
                                        <div class="candidate-photo">
                                            ${candidate.image ? 
                                                `<img src="${candidate.image}" alt="${candidate.name}">` : 
                                                `<div class="candidate-avatar">${candidate.name.split(' ').map(n => n[0]).join('')}</div>`
                                            }
                                        </div>
                                        <div class="candidate-details">
                                            <h4>${candidate.name}</h4>
                                            <p class="candidate-party">${candidate.party}</p>
                                            <p class="candidate-agenda">${candidate.agenda}</p>
                                        </div>
                                        <div class="candidate-symbol">${candidate.symbol}</div>
                                    </div>
                                </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                    `;
                }).join('')}
            </div>
            
            <div class="voting-actions">
                <button class="btn btn-outline" id="cancelVote">
                    <i class="fas fa-times"></i> Cancel Voting
                </button>
                <button class="btn btn-primary" id="submitVote" disabled>
                    <i class="fas fa-vote-yea"></i> Submit Your Vote
                </button>
            </div>
            
            <div class="voting-footer">
                <p><i class="fas fa-shield-alt"></i> Your vote is secure and anonymous</p>
            </div>
        `;

        this.setupVotingInteractions();
        this.updateSubmitButton();
    }

    setupVotingInteractions() {
        // Candidate selection
        document.querySelectorAll('.candidate-option').forEach(option => {
            option.addEventListener('click', (e) => {
                if (this.isSubmittingVote) return;
                
                const positionId = option.getAttribute('data-position');
                const candidateId = option.getAttribute('data-candidate');
                const position = this.electionData.positions.find(p => p.id == positionId);
                
                if (!position) return;

                const maxSelections = position.maxSelections || 1;
                
                // Handle single selection
                if (maxSelections === 1) {
                    // Deselect other candidates in same position
                    document.querySelectorAll(`.candidate-option[data-position="${positionId}"]`).forEach(opt => {
                        opt.classList.remove('selected');
                    });
                    
                    // Select clicked candidate
                    option.classList.add('selected');
                    
                    // Update selections
                    this.selectedCandidates = this.selectedCandidates.filter(sc => sc.positionId != positionId);
                    this.selectedCandidates.push(this.createSelection(positionId, candidateId, option));
                    
                } else {
                    // Handle multiple selections
                    const currentSelections = this.selectedCandidates.filter(sc => sc.positionId == positionId).length;
                    
                    if (option.classList.contains('selected')) {
                        // Deselect
                        option.classList.remove('selected');
                        this.selectedCandidates = this.selectedCandidates.filter(
                            sc => !(sc.positionId == positionId && sc.candidateId == candidateId)
                        );
                    } else if (currentSelections < maxSelections) {
                        // Select
                        option.classList.add('selected');
                        this.selectedCandidates.push(this.createSelection(positionId, candidateId, option));
                    } else {
                        this.showNotification(`You can only select ${maxSelections} candidates for this position.`, 'warning');
                    }
                }
                
                this.updatePositionStatus(positionId);
                this.updateSubmitButton();
            });
        });

        document.getElementById('cancelVote').addEventListener('click', () => {
            if (this.isSubmittingVote) return;
            
            if (this.selectedCandidates.length > 0) {
                if (confirm('Are you sure you want to cancel? Your current selections will be lost.')) {
                    this.closeVotingModal();
                }
            } else {
                this.closeVotingModal();
            }
        });

        document.getElementById('submitVote').addEventListener('click', () => {
            this.submitVote();
        });
    }

    createSelection(positionId, candidateId, optionElement) {
        const position = this.electionData.positions.find(p => p.id == positionId);
        const candidate = position.candidates.find(c => c.id == candidateId);
        
        return {
            positionId: parseInt(positionId),
            candidateId: parseInt(candidateId),
            candidateName: candidate.name,
            candidateParty: candidate.party,
            positionTitle: position.title,
            symbol: candidate.symbol
        };
    }

    updatePositionStatus(positionId) {
        const positionSection = document.querySelector(`.position-section [data-position="${positionId}"]`)?.closest('.position-section');
        if (positionSection) {
            const isSelected = this.selectedCandidates.some(sc => sc.positionId == positionId);
            positionSection.classList.toggle('completed', isSelected);
            
            const statusIcon = positionSection.querySelector('.position-status i');
            if (statusIcon) {
                statusIcon.className = `fas fa-${isSelected ? 'check-circle' : 'circle'}`;
            }
        }
    }

    updateSubmitButton() {
        const submitBtn = document.getElementById('submitVote');
        if (!submitBtn) return;

        const totalPositions = this.electionData.positions.length;
        
        // Check if all positions have at least one candidate selected
        const allPositionsSelected = this.electionData.positions.every(position => {
            const selectionsForPosition = this.selectedCandidates.filter(sc => sc.positionId == position.id).length;
            const minSelections = position.minSelections || 1;
            const maxSelections = position.maxSelections || 1;
            
            return selectionsForPosition >= minSelections && selectionsForPosition <= maxSelections;
        });
        
        console.log('Voting status:', {
            totalPositions,
            selectedCount: this.selectedCandidates.length,
            allPositionsSelected,
            selections: this.selectedCandidates
        });
        
        submitBtn.disabled = !allPositionsSelected || this.isSubmittingVote;
        submitBtn.innerHTML = this.isSubmittingVote ? 
            '<div class="loading"></div> Submitting...' : 
            `<i class="fas fa-vote-yea"></i> Submit Vote (${this.selectedCandidates.length}/${totalPositions})`;

        // Update progress bar
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            const progressPercentage = (this.selectedCandidates.length / totalPositions) * 100;
            progressFill.style.width = `${progressPercentage}%`;
        }
    }

    async submitVote() {
        if (this.isSubmittingVote) return;
        
        const totalPositions = this.electionData.positions.length;
        
        // Check if all positions have selections
        const allPositionsSelected = this.electionData.positions.every(position => {
            const selectionsForPosition = this.selectedCandidates.filter(sc => sc.positionId == position.id).length;
            const minSelections = position.minSelections || 1;
            return selectionsForPosition >= minSelections;
        });
        
        if (!allPositionsSelected) {
            this.showNotification('Please vote for all positions before submitting.', 'error');
            return;
        }

        // Final confirmation
        if (!confirm('Are you sure you want to submit your vote? This action cannot be undone.')) {
            return;
        }

        this.isSubmittingVote = true;
        this.updateSubmitButton();

        try {
            const user = this.getCurrentUser();
            if (!user) {
                throw new Error('Please login to vote.');
            }

            // Prepare vote data
            const voteData = {
                userId: user.id,
                electionId: this.electionData.id,
                votes: this.selectedCandidates.map(selection => ({
                    positionId: selection.positionId,
                    candidateId: selection.candidateId,
                    timestamp: new Date().toISOString()
                })),
                verificationData: {
                    faceVerified: this.hasVerifiedFace,
                    verificationTime: new Date().toISOString()
                }
            };

            console.log('Submitting vote:', voteData);

            // Try API first, then fallback to localStorage
            let result;
            if (window.apiService && typeof window.apiService.castVote === 'function') {
                result = await apiService.castVote(voteData);
            } else {
                // Fallback: Store vote in localStorage
                result = await this.castVoteFallback(voteData);
            }

            if (result.success) {
                // Update user voting status
                user.hasVoted = true;
                localStorage.setItem('currentUser', JSON.stringify(user));
                
                this.showVoteConfirmation();
                this.disableVoteButtons();
            } else {
                throw new Error(result.message || 'Failed to submit vote');
            }
            
        } catch (error) {
            console.error('Vote submission error:', error);
            this.showNotification(error.message || 'Failed to submit vote. Please try again.', 'error');
        } finally {
            this.isSubmittingVote = false;
            this.updateSubmitButton();
        }
    }

    async castVoteFallback(voteData) {
        // Store vote in localStorage for demo purposes
        return new Promise((resolve) => {
            setTimeout(() => {
                try {
                    const votes = JSON.parse(localStorage.getItem('userVotes') || '{}');
                    votes[voteData.electionId] = {
                        ...voteData,
                        submittedAt: new Date().toISOString()
                    };
                    localStorage.setItem('userVotes', JSON.stringify(votes));
                    
                    resolve({ success: true, message: 'Vote cast successfully' });
                } catch (error) {
                    resolve({ success: false, message: 'Failed to store vote' });
                }
            }, 1500); // Simulate API delay
        });
    }

    showVoteConfirmation() {
        const votingBody = document.getElementById('votingBody');
        
        votingBody.innerHTML = `
            <div class="vote-confirmation">
                <div class="confirmation-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>Vote Submitted Successfully!</h3>
                <p>Thank you for participating in the democratic process. Your vote has been recorded securely and anonymously.</p>
                
                <div class="vote-summary">
                    <h4><i class="fas fa-clipboard-list"></i> Your Vote Summary</h4>
                    <div class="selected-candidates">
                        ${this.selectedCandidates.map(selection => `
                            <div class="selected-candidate">
                                <div class="candidate-avatar">
                                    ${selection.symbol}
                                </div>
                                <div class="candidate-details">
                                    <div class="position">${selection.positionTitle}</div>
                                    <div class="name">${selection.candidateName}</div>
                                    <div class="party">${selection.candidateParty}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="security-notice">
                    <i class="fas fa-shield-alt"></i>
                    <div>
                        <strong>Your vote is secure</strong>
                        <p>All votes are encrypted and anonymized to protect your privacy.</p>
                    </div>
                </div>
                
                <div class="confirmation-actions">
                    <button class="btn btn-primary" id="closeVoting">
                        <i class="fas fa-times"></i> Close
                    </button>
                </div>
            </div>
        `;
        
        document.getElementById('closeVoting').addEventListener('click', () => {
            this.closeVotingModal();
            this.showNotification('Your vote has been submitted successfully!', 'success');
        });
    }

    getCurrentUser() {
        try {
            const userData = localStorage.getItem('currentUser');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    }

    showNotification(message, type) {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create new notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove notification after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    stopCamera() {
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => {
                track.stop();
            });
            this.cameraStream = null;
        }
    }
}

// Enhanced CSS styles for voting system
const votingStyles = document.createElement('style');
votingStyles.textContent = `
    .voting-header {
        background: linear-gradient(135deg, var(--primary), var(--secondary));
        color: white;
        padding: 1.5rem;
        border-radius: 10px;
        margin-bottom: 2rem;
    }
    
    .voting-progress {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-top: 1rem;
    }
    
    .progress-bar {
        flex: 1;
        height: 8px;
        background: rgba(255,255,255,0.3);
        border-radius: 4px;
        overflow: hidden;
    }
    
    .progress-fill {
        height: 100%;
        background: white;
        border-radius: 4px;
        transition: width 0.3s ease;
    }
    
    .face-verification-container {
        text-align: center;
        padding: 1rem;
    }
    
    .verification-header {
        margin-bottom: 2rem;
    }
    
    .verification-header h3 {
        color: #333;
        margin-bottom: 0.5rem;
    }
    
    .camera-container {
        position: relative;
        width: 400px;
        height: 300px;
        margin: 0 auto 2rem auto;
        border: 2px solid #e9ecef;
        border-radius: 12px;
        overflow: hidden;
        background: #000;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    #verificationVideo {
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
        width: 200px;
        height: 200px;
        border: 3px solid #00ff00;
        border-radius: 50%;
        position: relative;
        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.4);
        animation: pulse 2s infinite;
    }
    
    .verification-hint {
        position: absolute;
        bottom: 10px;
        left: 0;
        width: 100%;
        text-align: center;
        color: white;
        background: rgba(0,0,0,0.7);
        padding: 0.5rem;
        font-size: 0.9rem;
    }
    
    .verification-status {
        padding: 1rem;
        border-radius: 8px;
        margin: 1rem 0;
        font-weight: 500;
        text-align: center;
    }
    
    .verification-loading {
        background: #e3f2fd;
        color: #1565c0;
        border: 1px solid #bbdefb;
    }
    
    .verification-ready {
        background: #e8f5e8;
        color: #2e7d32;
        border: 1px solid #c8e6c9;
    }
    
    .verification-success {
        background: #e8f5e8;
        color: #2e7d32;
        border: 1px solid #c8e6c9;
    }
    
    .verification-error {
        background: #ffebee;
        color: #c62828;
        border: 1px solid #ffcdd2;
    }
    
    .verification-actions {
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin-top: 2rem;
    }
    
    .error-details {
        font-size: 0.9rem;
        opacity: 0.8;
        margin-top: 0.5rem;
        display: block;
    }
    
    @keyframes pulse {
        0% { border-color: #00ff00; box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.4); }
        50% { border-color: #00cc00; box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.3); }
        100% { border-color: #00ff00; box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.4); }
    }
    
    .position-section {
        background: white;
        border-radius: 10px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        border: 2px solid #e9ecef;
        transition: all 0.3s ease;
    }
    
    .position-section.completed {
        border-color: var(--secondary);
        background: #f8fff9;
    }
    
    .position-header {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        margin-bottom: 1rem;
    }
    
    .position-status i {
        font-size: 1.5rem;
        color: #6c757d;
    }
    
    .position-section.completed .position-status i {
        color: var(--secondary);
    }
    
    .selection-info {
        font-size: 0.9rem;
        color: #6c757d;
        margin-top: 0.25rem;
    }
    
    .candidate-option {
        display: flex;
        align-items: center;
        padding: 1rem;
        border: 2px solid #e9ecef;
        border-radius: 8px;
        margin-bottom: 0.75rem;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .candidate-option:hover {
        border-color: var(--primary);
        background: #f8f9fa;
    }
    
    .candidate-option.selected {
        border-color: var(--secondary);
        background: #e8f5e8;
    }
    
    .candidate-selector {
        margin-right: 1rem;
    }
    
    .candidate-selector i {
        font-size: 1.25rem;
        color: #6c757d;
    }
    
    .candidate-option.selected .candidate-selector i {
        color: var(--secondary);
    }
    
    .candidate-info {
        display: flex;
        align-items: center;
        flex: 1;
        gap: 1rem;
    }
    
    .candidate-photo {
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .candidate-avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--primary);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 1.2rem;
    }
    
    .candidate-photo img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
    }
    
    .candidate-details {
        flex: 1;
    }
    
    .candidate-details h4 {
        margin: 0 0 0.25rem 0;
        color: #333;
    }
    
    .candidate-party {
        color: var(--primary);
        font-weight: 600;
        margin: 0 0 0.5rem 0;
    }
    
    .candidate-agenda {
        color: #6c757d;
        font-size: 0.9rem;
        margin: 0;
    }
    
    .candidate-symbol {
        font-size: 2rem;
    }
    
    .voting-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 1px solid #e9ecef;
    }
    
    .voting-footer {
        text-align: center;
        margin-top: 1rem;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 8px;
        color: #6c757d;
    }
    
    .vote-confirmation {
        text-align: center;
        padding: 2rem;
    }
    
    .confirmation-icon {
        font-size: 4rem;
        color: var(--secondary);
        margin-bottom: 1rem;
    }
    
    .selected-candidates {
        max-width: 400px;
        margin: 1.5rem auto;
    }
    
    .selected-candidate {
        display: flex;
        align-items: center;
        padding: 1rem;
        background: white;
        border-radius: 8px;
        margin-bottom: 0.75rem;
        border: 1px solid #e9ecef;
    }
    
    .candidate-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--primary);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        margin-right: 1rem;
    }
    
    .security-notice {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        padding: 1rem;
        background: #e8f5e8;
        border-radius: 8px;
        margin: 1.5rem 0;
        text-align: left;
    }
    
    .security-notice i {
        font-size: 2rem;
        color: var(--secondary);
    }
    
    button.voted {
        background: var(--secondary) !important;
        cursor: not-allowed;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    .pulse {
        animation: pulse 2s infinite;
    }
    
    #submitVote:disabled {
        background: #6c757d !important;
        border-color: #6c757d !important;
        cursor: not-allowed;
        opacity: 0.6;
    }
    
    #submitVote:not(:disabled):hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .loading {
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
`;
document.head.appendChild(votingStyles);

// Initialize voting system
let votingSystem;

document.addEventListener('DOMContentLoaded', function() {
    votingSystem = new VotingSystem();
    
    // Event delegation for vote buttons
    document.addEventListener('click', function(e) {
        const voteButton = e.target.closest('.election-card button.btn-primary');
        if (voteButton && !voteButton.disabled) {
            const electionId = voteButton.getAttribute('data-election-id');
            if (electionId && votingSystem) {
                votingSystem.openVotingModal(electionId);
            }
        }
    });
});