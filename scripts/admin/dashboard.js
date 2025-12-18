// Dashboard functionality
class AdminDashboard {
    constructor() {
        this.charts = {};
        this.init();
    }

    init() {
        this.loadStats();
        this.setupCharts();
        this.loadRecentActivities();
        this.setupAutoRefresh();
    }

    async loadStats() {
        try {
            const stats = await adminPanel.apiCall('/dashboard/stats');
            this.updateStatsCards(stats);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    updateStatsCards(stats) {
        const statsData = [
            { element: document.querySelector('.stat-card:nth-child(1) h3'), value: stats.totalVoters?.toLocaleString() },
            { element: document.querySelector('.stat-card:nth-child(2) h3'), value: stats.totalCandidates?.toLocaleString() },
            { element: document.querySelector('.stat-card:nth-child(3) h3'), value: stats.totalVotes?.toLocaleString() },
            { element: document.querySelector('.stat-card:nth-child(4) h3'), value: stats.votingPercentage + '%' }
        ];

        statsData.forEach(stat => {
            if (stat.element) {
                this.animateValue(stat.element, 0, parseInt(stat.value) || 0, 2000);
            }
        });
    }

    animateValue(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            
            if (typeof end === 'number') {
                element.textContent = value.toLocaleString();
            } else {
                element.textContent = end;
            }
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    setupCharts() {
        this.createElectionStatusChart();
        this.createVotingProgressChart();
    }

    createElectionStatusChart() {
        const ctx = document.getElementById('electionStatusChart')?.getContext('2d');
        if (!ctx) return;

        this.charts.electionStatus = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Ongoing', 'Upcoming', 'Completed'],
                datasets: [{
                    data: [3, 4, 3],
                    backgroundColor: [
                        '#2ecc71',
                        '#3498db',
                        '#95a5a6'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                cutout: '70%'
            }
        });
    }

    createVotingProgressChart() {
        const ctx = document.getElementById('votingProgressChart')?.getContext('2d');
        if (!ctx) return;

        this.charts.votingProgress = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM'],
                datasets: [{
                    label: 'Votes Cast',
                    data: [1200, 1900, 3000, 5000, 6200, 7500, 8742],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
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

    loadRecentActivities() {
        const activities = [
            {
                icon: 'user-plus',
                content: 'New voter registered - John Doe (ID: V12345)',
                time: '2 minutes ago'
            },
            {
                icon: 'vote-yea',
                content: 'Vote cast in Student Council Election',
                time: '5 minutes ago'
            },
            {
                icon: 'user-check',
                content: 'Voter identity verified - Sarah Wilson',
                time: '10 minutes ago'
            },
            {
                icon: 'exclamation-triangle',
                content: 'Failed login attempt from IP: 192.168.1.100',
                time: '15 minutes ago'
            },
            {
                icon: 'cog',
                content: 'System maintenance completed',
                time: '1 hour ago'
            }
        ];

        const container = document.querySelector('.activities-list');
        if (container) {
            container.innerHTML = activities.map(activity => `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas fa-${activity.icon}"></i>
                    </div>
                    <div class="activity-content">
                        <p>${activity.content}</p>
                        <span class="activity-time">${activity.time}</span>
                    </div>
                </div>
            `).join('');
        }
    }

    setupAutoRefresh() {
        // Refresh dashboard every 30 seconds
        setInterval(() => {
            if (document.getElementById('dashboard').classList.contains('active')) {
                this.loadStats();
            }
        }, 30000);
    }

    // Method to update charts with real data
    updateCharts(data) {
        if (this.charts.electionStatus) {
            this.charts.electionStatus.data.datasets[0].data = data.electionStatus;
            this.charts.electionStatus.update();
        }

        if (this.charts.votingProgress) {
            this.charts.votingProgress.data.datasets[0].data = data.votingProgress;
            this.charts.votingProgress.update();
        }
    }
}

// Initialize dashboard when the dashboard section is active
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on dashboard page
    if (document.getElementById('dashboard')) {
        window.dashboard = new AdminDashboard();
        
        // Refresh dashboard when section becomes active
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (mutation.target.id === 'dashboard' && mutation.target.classList.contains('active')) {
                        window.dashboard.loadStats();
                    }
                }
            });
        });

        observer.observe(document.getElementById('dashboard'), {
            attributes: true,
            attributeFilter: ['class']
        });
    }
});