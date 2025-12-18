/**
 * Enhanced Features Module
 * Adds new functionality to the SecureVote platform
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeEnhancedFeatures();
});

/**
 * Initializes all enhanced features
 */
function initializeEnhancedFeatures() {
    setupMobileNavigation();
    setupBackToTop();
    setupLiveStats();
    setupElectionFilters();
    setupContactFormEnhancements();
    setupLoadingScreen();
    setupRealTimeUpdates();
    setupAccessibilityFeatures();
}

/**
 * Mobile navigation functionality
 */
function setupMobileNavigation() {
    const mobileToggle = document.getElementById('mobileMenuToggle');
    const mobileNav = document.getElementById('mobileNav');
    
    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener('click', function() {
            mobileNav.classList.toggle('active');
            this.classList.toggle('active');
        });
        
        // Close mobile nav when clicking outside
        document.addEventListener('click', function(e) {
            if (!mobileToggle.contains(e.target) && !mobileNav.contains(e.target)) {
                mobileNav.classList.remove('active');
                mobileToggle.classList.remove('active');
            }
        });
    }
}

/**
 * Back to top button functionality
 */
function setupBackToTop() {
    const backToTop = document.getElementById('backToTop');
    
    if (backToTop) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });
        
        backToTop.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

/**
 * Live statistics counter animation
 */
function setupLiveStats() {
    const stats = {
        totalVotes: 15427,
        activeElections: 3,
        registeredUsers: 8921
    };
    
    // Animate numbers
    Object.keys(stats).forEach(stat => {
        const element = document.getElementById(stat);
        if (element) {
            animateCounter(element, 0, stats[stat], 2000);
        }
    });
}

/**
 * Animate counter from start to end
 */
function animateCounter(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value.toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

/**
 * Election filtering and search functionality
 */
function setupElectionFilters() {
    const filterBtns = document.querySelectorAll('.election-filters .filter-btn');
    const searchInput = document.getElementById('electionSearch');
    
    // Filter button functionality
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filter elections (implementation depends on your election data structure)
            filterElections(filter);
        });
    });
    
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            searchElections(searchTerm);
        });
    }
}

/**
 * Enhanced contact form functionality
 */
function setupContactFormEnhancements() {
    const contactForm = document.getElementById('contactForm');
    const messageTextarea = document.getElementById('contactMessage');
    const charCount = document.getElementById('charRemaining');
    
    if (messageTextarea && charCount) {
        messageTextarea.addEventListener('input', function() {
            const remaining = 500 - this.value.length;
            charCount.textContent = remaining;
            
            if (remaining < 50) {
                charCount.style.color = 'var(--danger)';
            } else if (remaining < 100) {
                charCount.style.color = 'var(--warning)';
            } else {
                charCount.style.color = 'var(--gray)';
            }
        });
    }
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleContactFormSubmission(this);
        });
    }
}

/**
 * Handle contact form submission with enhanced feedback
 */
async function handleContactFormSubmission(form) {
    const submitBtn = form.querySelector('#contactSubmit');
    const originalText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.innerHTML = '<div class="loading"></div> Sending...';
    submitBtn.disabled = true;
    
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Show success message
        showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
        form.reset();
        
        // Reset character count
        const charCount = document.getElementById('charRemaining');
        if (charCount) charCount.textContent = '500';
        
    } catch (error) {
        showNotification('Failed to send message. Please try again.', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

/**
 * Loading screen management
 */
function setupLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    
    if (loadingScreen) {
        // Simulate loading process
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }, 1500);
    }
}

/**
 * Real-time updates for live data
 */
function setupRealTimeUpdates() {
    // Update live indicator
    const liveIndicator = document.getElementById('liveIndicator');
    if (liveIndicator) {
        setInterval(() => {
            liveIndicator.classList.toggle('pulsing');
        }, 2000);
    }
    
    // Simulate real-time vote updates
    setInterval(updateLiveResults, 5000);
}

/**
 * Update live results with simulated data
 */
function updateLiveResults() {
    // This would typically fetch from an API
    const progressBars = document.querySelectorAll('.progress-fill');
    
    progressBars.forEach(bar => {
        const currentWidth = parseInt(bar.style.width);
        const newWidth = Math.min(currentWidth + Math.random() * 5, 100);
        bar.style.width = `${newWidth}%`;
        
        // Update percentage text
        const progressText = bar.closest('.result-progress').querySelector('.progress-text');
        if (progressText) {
            progressText.textContent = `${Math.round(newWidth)}% Votes Cast`;
        }
    });
}

/**
 * Accessibility features
 */
function setupAccessibilityFeatures() {
    // Skip link functionality
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
        skipLink.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.setAttribute('tabindex', '-1');
                target.focus();
            }
        });
    }
    
    // Enhanced keyboard navigation
    document.addEventListener('keydown', function(e) {
        // Close modals with Escape key
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal[style*="display: block"]');
            if (openModal) {
                openModal.style.display = 'none';
            }
        }
    });
}

/**
 * Enhanced notification system
 */
function showEnhancedNotification(message, type, duration = 5000) {
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(notification);
    
    // Auto-remove after duration
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, duration);
}

/**
 * Get appropriate icon for notification type
 */
function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showEnhancedNotification,
        animateCounter
    };
}