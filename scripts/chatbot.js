/**
 * Chatbot Module
 * AI-powered virtual assistant for voting system
 * Provides real-time help and information to users
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeChatbot();
});

/**
 * Initializes chatbot functionality and event listeners
 */
function initializeChatbot() {
    const chatbotToggle = document.getElementById('chatbotToggle');
    const chatbotContainer = document.getElementById('chatbotContainer');
    const maximizeChatbot = document.getElementById('maximizeChatbot');
    const minimizeChatbot = document.getElementById('minimizeChatbot');
    const closeChatbot = document.getElementById('closeChatbot');
    const sendMessage = document.getElementById('sendMessage');
    const chatbotInput = document.getElementById('chatbotInput');
    
    let isMaximized = false;
    
    // =========================================================================
    // Chatbot Control Event Listeners
    // =========================================================================
    
    // Toggle chatbot visibility
    chatbotToggle.addEventListener('click', function() {
        chatbotContainer.classList.remove('minimized', 'maximized');
        chatbotContainer.style.display = 'flex';
        chatbotToggle.style.display = 'none';
        chatbotInput.focus();
        isMaximized = false;
    });
    
    // Maximize chatbot window
    maximizeChatbot.addEventListener('click', function() {
        if (isMaximized) {
            chatbotContainer.classList.remove('maximized');
            maximizeChatbot.innerHTML = '<i class="fas fa-expand"></i>';
            isMaximized = false;
        } else {
            chatbotContainer.classList.add('maximized');
            chatbotContainer.classList.remove('minimized');
            maximizeChatbot.innerHTML = '<i class="fas fa-compress"></i>';
            isMaximized = true;
        }
    });
    
    // Minimize chatbot window
    minimizeChatbot.addEventListener('click', function() {
        chatbotContainer.classList.add('minimized');
        chatbotContainer.classList.remove('maximized');
        maximizeChatbot.innerHTML = '<i class="fas fa-expand"></i>';
        isMaximized = false;
    });
    
    // Close chatbot completely
    closeChatbot.addEventListener('click', function() {
        chatbotContainer.style.display = 'none';
        chatbotToggle.style.display = 'flex';
        chatbotContainer.classList.remove('maximized');
        maximizeChatbot.innerHTML = '<i class="fas fa-expand"></i>';
        isMaximized = false;
    });
    
    // Send message on button click
    sendMessage.addEventListener('click', sendChatbotMessage);
    
    // Send message on Enter key press
    chatbotInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendChatbotMessage();
        }
    });
    
    // Auto-focus input when chatbot opens
    chatbotToggle.addEventListener('click', function() {
        setTimeout(() => {
            chatbotInput.focus();
        }, 300);
    });
}

/**
 * Handles sending user messages and generating bot responses
 */
function sendChatbotMessage() {
    const input = document.getElementById('chatbotInput');
    const message = input.value.trim();
    
    // Ignore empty messages
    if (message === '') return;
    
    // Add user message to chat display
    addMessageToChat(message, 'user');
    input.value = '';
    
    // Show typing indicator for better UX
    showTypingIndicator();
    
    // Generate and display bot response after delay
    setTimeout(() => {
        removeTypingIndicator();
        const response = generateChatbotResponse(message);
        addMessageToChat(response, 'bot');
    }, 1500 + Math.random() * 1000); // Random delay for natural conversation feel
}

/**
 * Adds a message to the chat display
 * @param {string} message - The message text to display
 * @param {string} sender - The sender type ('user' or 'bot')
 */
function addMessageToChat(message, sender) {
    const messagesContainer = document.getElementById('chatbotMessages');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}-message`;
    
    const messageText = document.createElement('p');
    messageText.textContent = message;
    messageElement.appendChild(messageText);
    
    messagesContainer.appendChild(messageElement);
    
    // Auto-scroll to latest message
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Displays typing indicator while bot is "thinking"
 */
function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatbotMessages');
    const typingElement = document.createElement('div');
    typingElement.className = 'typing-indicator';
    typingElement.id = 'typingIndicator';
    typingElement.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    
    messagesContainer.appendChild(typingElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Removes the typing indicator from chat
 */
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

/**
 * Generates appropriate bot responses based on user input
 * @param {string} userMessage - The user's message
 * @returns {string} - The bot's response
 */
function generateChatbotResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // =========================================================================
    // Response Mapping - Voting System Specific
    // =========================================================================
    
    // Voting process questions
    if (message.includes('how to vote') || message.includes('voting process')) {
        return "To vote: 1) Log in with your ID 2) Verify your identity with face recognition 3) Select your preferred candidates 4) Submit your vote. It's that simple!";
    }
    
    // Eligibility questions
    if (message.includes('eligibility') || message.includes('eligible')) {
        return "To be eligible to vote, you must be: 1) 18 years or older 2) Registered with a valid Voter ID or Student ID 3) Have completed face registration during signup.";
    }
    
    // Face recognition questions
    if (message.includes('face recognition') || message.includes('face verification')) {
        return "Our face recognition system ensures one person, one vote. During registration, we capture your facial data. When voting, we verify it's really you. Your face data is encrypted and stored securely.";
    }
    
    // Security questions
    if (message.includes('security') || message.includes('safe')) {
        return "SecureVote uses multiple security layers: Face recognition, encrypted data transmission, secure servers, and audit trails. Your vote and personal data are completely secure with us.";
    }
    
    // Results questions
    if (message.includes('result') || message.includes('when will results')) {
        return "Election results are typically announced after the voting period ends. You can check the Results section on our website for live updates (after polls close).";
    }
    
    // Registration questions
    if (message.includes('register') || message.includes('sign up')) {
        return "To register: Click the Register button, fill in your details including Voter/Student ID, verify you're 18+, and complete face registration. You'll only need your ID to log in afterward.";
    }
    
    // Login questions
    if (message.includes('login') || message.includes('log in')) {
        return "After registration, simply enter your Voter ID or Student ID on the login page. No password needed! We'll use face verification for additional security when voting.";
    }
    
    // Problem/help questions
    if (message.includes('problem') || message.includes('issue') || message.includes('help')) {
        return "I'm here to help! Please describe your issue in more detail, or contact our support team at support@securevote.com for immediate assistance.";
    }
    
    // Age requirement questions
    if (message.includes('age') || message.includes('18')) {
        return "You must be 18 years or older to register and vote. We verify your age during registration using your date of birth.";
    }
    
    // ID requirement questions
    if (message.includes('id') || message.includes('voter id') || message.includes('student id')) {
        return "You need a valid Voter ID or Student ID to register. This will be your unique identifier for logging in and voting.";
    }
    
    // =========================================================================
    // Default Responses for Unmatched Queries
    // =========================================================================
    
    const defaultResponses = [
        "I'm here to help with any voting-related questions! What would you like to know?",
        "You can ask me about voting procedures, security, registration, or election results.",
        "I'm your VoteAssistant. How can I make your voting experience better?",
        "Need help with the voting process? I've got you covered! Ask me anything about SecureVote.",
        "I can help you understand how to register, vote securely, or check election results. What do you need help with?"
    ];
    
    // Return random default response for unmatched queries
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}