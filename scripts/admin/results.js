// Results Management
class ResultsManager {
    constructor() {
        this.currentElection = null;
        this.charts = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadInitialResults();
    }

    setupEventListeners() {
        document.getElementById('electionSelect')?.addEventListener('change', (e) => {
            this.loadElectionResults(e.target.value);
        });
    }

    async loadInitialResults() {
        try {
            // Load available elections for the dropdown
            const elections = await adminPanel.apiCall('/elections');
            this.populateElectionDropdown(elections);
            
            // Load results for the first election or default election
            if (elections.length > 0) {
                this.loadElectionResults(elections[0].id);
            }
        } catch (error) {
            console.error('Error loading initial results:', error);
        }
    }

    populateElectionDropdown(elections) {
        const select = document.getElementById('electionSelect');
        if (!select) return;

        select.innerHTML = '<option value="">Select Election</option>' +
            elections.map(election => `
                <option value="${election.id}">${election.title}</option>
            `).join('');

        if (elections.length > 0) {
            select.value = elections[0].id;
        }
    }

    async loadElectionResults(electionId) {
        if (!electionId) return;

        try {
            // Simulate loading election-specific results
            const results = await this.getElectionResults(electionId);
            this.currentElection = results;
            this.updateResultsDisplay(results);
            this.createCharts(results);
        } catch (error) {
            console.error('Error loading election results:', error);
            adminPanel.showNotification('Failed to load election results', 'error');
        }
    }

    async getElectionResults(electionId) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock data for demonstration
        return {
            id: electionId,
            title: 'Student Council Election 2024',
            candidates: [
                { name: 'John Smith', party: 'Unity Party', votes: 2450, color: '#3498db' },
                { name: 'Sarah Johnson', party: 'Progress Alliance', votes: 1980, color: '#2ecc71' },
                { name: 'Michael Brown', party: 'Student First', votes: 1560, color: '#e74c3c' },
                { name: 'Emily Davis', party: 'Future Leaders', votes: 980, color: '#f39c12' },
                { name: 'Robert Wilson', party: 'Independent', votes: 450, color: '#9b59b6' }
            ],
            totalVotes: 7420,
            votingPercentage: 74.2
        };
    }

    updateResultsDisplay(results) {
        // Update results table
        const tbody = document.getElementById('resultsTableBody');
        if (tbody) {
            tbody.innerHTML = results.candidates.map(candidate => `
                <tr>
                    <td>${candidate.name}</td>
                    <td>${candidate.party}</td>
                    <td>${candidate.votes.toLocaleString()}</td>
                    <td>${this.calculatePercentage(candidate.votes, results.totalVotes)}%</td>
                </tr>
            `).join('');
        }

        // Update election title in charts
        const chartTitle = document.querySelector('#resultsChart').closest('.chart-card h3');
        if (chartTitle) {
            chartTitle.textContent = `Live Results - ${results.title}`;
        }
    }

    createCharts(results) {
        this.createResultsChart(results);
        this.createDistributionChart(results);
    }

    createResultsChart(results) {
        const ctx = document.getElementById('resultsChart')?.getContext('2d');
        if (!ctx) return;

        // Destroy existing chart if it exists
        if (this.charts.results) {
            this.charts.results.destroy();
        }

        this.charts.results = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: results.candidates.map(c => c.name),
                datasets: [{
                    label: 'Votes',
                    data: results.candidates.map(c => c.votes),
                    backgroundColor: results.candidates.map(c => c.color),
                    borderColor: results.candidates.map(c => this.darkenColor(c.color)),
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Vote Count by Candidate'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString();
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    createDistributionChart(results) {
        const ctx = document.getElementById('distributionChart')?.getContext('2d');
        if (!ctx) return;

        // Destroy existing chart if it exists
        if (this.charts.distribution) {
            this.charts.distribution.destroy();
        }

        this.charts.distribution = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: results.candidates.map(c => c.name),
                datasets: [{
                    data: results.candidates.map(c => c.votes),
                    backgroundColor: results.candidates.map(c => c.color),
                    borderColor: '#fff',
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${context.label}: ${value.toLocaleString()} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    calculatePercentage(votes, total) {
        if (!total || total === 0) return 0;
        return ((votes / total) * 100).toFixed(1);
    }

    darkenColor(color) {
        // Simple function to darken a color for borders
        return color.replace(/^#/, '').replace(/../g, color => 
            ('0' + Math.min(255, Math.max(0, parseInt(color, 16) - 20)).toString(16)).substr(-2)
        );
    }

    // Method to refresh results (for live updates)
    refreshResults() {
        if (this.currentElection) {
            this.loadElectionResults(this.currentElection.id);
        }
    }

    // Method to export results
    exportResults(format = 'pdf') {
        if (!this.currentElection) {
            adminPanel.showNotification('No election results to export', 'warning');
            return;
        }

        // Simulate export process
        adminPanel.showNotification(`Exporting results as ${format.toUpperCase()}...`, 'info');
        
        setTimeout(() => {
            adminPanel.showNotification('Results exported successfully!', 'success');
        }, 2000);
    }
}

// Initialize results manager
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('results')) {
        window.resultsManager = new ResultsManager();
        
        // Set up auto-refresh for live results (every 30 seconds)
        setInterval(() => {
            if (document.getElementById('results').classList.contains('active')) {
                window.resultsManager.refreshResults();
            }
        }, 30000);
    }
});