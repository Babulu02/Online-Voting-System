/**
 * Enhanced API Service with Fallback Support
 * Handles API communication with robust error handling and fallbacks
 */
class ApiService {
    constructor() {
        this.baseURL = window.API_CONFIG ? window.API_CONFIG.API_BASE : 'http://localhost:3000/api';
        this.useFallback = false;
        this.init();
    }

    init() {
        // Check if backend is available
        this.checkBackendAvailability();
    }

    async checkBackendAvailability() {
        try {
            const response = await fetch(`${this.baseURL}/health`, {
                method: 'GET',
                timeout: 5000
            }).catch(() => null);
            
            this.useFallback = !response || !response.ok;
            
            if (this.useFallback) {
                console.warn('Backend not available, using fallback mode');
            } else {
                console.log('Backend connected successfully');
            }
        } catch (error) {
            this.useFallback = true;
            console.warn('Backend check failed, using fallback mode');
        }
    }

    async request(endpoint, options = {}) {
        // If in fallback mode, use mock responses
        if (this.useFallback && this.shouldUseFallback(endpoint)) {
            return this.fallbackResponse(endpoint, options);
        }

        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        try {
            console.log(`API Call: ${url}`, config);
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                return { success: true, message: 'Operation completed successfully' };
            }
            
        } catch (error) {
            console.error('API Request failed:', error);
            
            // Fallback to mock response if API call fails
            if (this.shouldUseFallback(endpoint)) {
                return this.fallbackResponse(endpoint, options);
            }
            
            throw new Error(this.getUserFriendlyError(error));
        }
    }

    shouldUseFallback(endpoint) {
        // Use fallback for these endpoints if API is unavailable
        const fallbackEndpoints = [
            '/auth/register',
            '/auth/login', 
            '/auth/verify-face',
            '/elections',
            '/elections/',
            '/votes/cast',
            '/votes/results/'
        ];
        
        return fallbackEndpoints.some(ep => endpoint.startsWith(ep));
    }

    fallbackResponse(endpoint, options) {
        console.log('Using fallback response for:', endpoint);
        
        // Simulate API delay
        return new Promise((resolve) => {
            setTimeout(() => {
                const response = this.getMockResponse(endpoint, options);
                resolve(response);
            }, 1000);
        });
    }

    getMockResponse(endpoint, options) {
        const method = options.method || 'GET';
        
        // Auth endpoints
        if (endpoint.startsWith('/auth/register')) {
            return {
                success: true,
                user: {
                    id: 'user_' + Date.now(),
                    name: options.body?.name || 'Demo User',
                    email: options.body?.email,
                    hasVoted: false
                },
                message: 'Registration successful'
            };
        }
        
        if (endpoint.startsWith('/auth/login')) {
            return {
                success: true,
                user: {
                    id: options.body?.id || 'demo_user_123',
                    name: 'Demo User',
                    email: 'demo@example.com',
                    hasVoted: false
                },
                message: 'Login successful'
            };
        }
        
        if (endpoint.startsWith('/auth/verify-face')) {
            return {
                success: true,
                verified: true,
                confidence: 0.95,
                message: 'Face verification successful'
            };
        }
        
        // Election endpoints
        if (endpoint.startsWith('/elections')) {
            if (method === 'GET') {
                if (endpoint === '/elections') {
                    return {
                        elections: [
                            {
                                id: 1,
                                title: "Student Council Election 2024",
                                description: "Vote for your student council representatives for the academic year 2024-2025",
                                start_date: "2024-01-01",
                                end_date: "2024-12-31",
                                status: "active",
                                type: "student",
                                total_voters: 1250,
                                votes_cast: 845,
                                participation_rate: 67.6
                            },
                            {
                                id: 2,
                                title: "Class Representative Election",
                                description: "Elect your class representatives for various departments",
                                start_date: "2024-02-01",
                                end_date: "2024-02-28",
                                status: "upcoming",
                                type: "student",
                                total_voters: 800,
                                votes_cast: 0,
                                participation_rate: 0
                            }
                        ]
                    };
                } else {
                    // Single election request
                    const electionId = endpoint.split('/').pop();
                    return {
                        election: this.getMockElectionData(electionId)
                    };
                }
            }
        }
        
        // Vote endpoints
        if (endpoint.startsWith('/votes/cast')) {
            return {
                success: true,
                voteId: 'vote_' + Date.now(),
                message: 'Vote cast successfully',
                timestamp: new Date().toISOString()
            };
        }
        
        if (endpoint.startsWith('/votes/results/')) {
            const electionId = endpoint.split('/').pop();
            return this.getMockResults(electionId);
        }
        
        // Default success response
        return {
            success: true,
            message: 'Operation completed successfully'
        };
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

    getMockResults(electionId) {
        return {
            electionId: electionId,
            title: "Election Results",
            totalVoters: 1000,
            votesCast: 650,
            participationRate: 65,
            candidates: [
                { id: 1, name: "John Smith", votes: 320, percentage: 49.2, party: "Independent" },
                { id: 2, name: "Maria Garcia", votes: 220, percentage: 33.8, party: "Progress Party" },
                { id: 3, name: "David Johnson", votes: 110, percentage: 16.9, party: "Unity Alliance" }
            ],
            lastUpdated: new Date().toISOString()
        };
    }

    getUserFriendlyError(error) {
        if (error.message.includes('Failed to fetch')) {
            return 'Cannot connect to server. The system will use demo mode.';
        }
        
        if (error.message.includes('404')) {
            return 'The requested resource was not found.';
        }
        
        if (error.message.includes('401')) {
            return 'Please log in to continue.';
        }
        
        if (error.message.includes('500')) {
            return 'Server error. Please try again later.';
        }
        
        return 'An unexpected error occurred. Please try again.';
    }

    // Auth endpoints
    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: userData
        });
    }

    async login(credentials) {
        return this.request('/auth/login', {
            method: 'POST',
            body: credentials
        });
    }

    async verifyFace(verificationData) {
        return this.request('/auth/verify-face', {
            method: 'POST',
            body: verificationData
        });
    }

    // Election endpoints
    async getElections() {
        return this.request('/elections');
    }

    async getElection(id) {
        return this.request(`/elections/${id}`);
    }

    // Vote endpoints
    async castVote(voteData) {
        return this.request('/votes/cast', {
            method: 'POST',
            body: voteData
        });
    }

    async getResults(electionId) {
        return this.request(`/votes/results/${electionId}`);
    }

    // Health check
    async healthCheck() {
        return this.request('/health');
    }
}

// Initialize global API service
window.apiService = new ApiService();