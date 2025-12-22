/**
 * Thanjavur TalkMate - Chat Interface JavaScript
 */

class TalkMateChat {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.contextVisible = false;
        this.isProcessing = false;
        
        // Initialize the system
        this.initializeSystem();
        
        // Load nearby places
        this.loadNearbyPlaces();
    }

    initializeElements() {
        // Main elements
        this.welcomeMessage = document.getElementById('welcomeMessage');
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        
        // Context controls
        this.contextControls = document.getElementById('contextControls');
        this.toggleContextBtn = document.getElementById('toggleContext');
        this.speakerSelect = document.getElementById('speakerSelect');
        this.locationSelect = document.getElementById('locationSelect');
        
        // Nearby places elements
        this.nearbySection = document.getElementById('nearbySection');
        this.toggleNearbyBtn = document.getElementById('toggleNearby');
        this.nearbyContent = document.getElementById('nearbyContent');
        this.tabButtons = document.querySelectorAll('.tab-btn');
        this.attractionsList = document.getElementById('attractionsList');
        this.restaurantsList = document.getElementById('restaurantsList');
        this.trafficInfo = document.getElementById('trafficInfo');
        
        // Modal elements
        this.errorModal = document.getElementById('errorModal');
        this.closeErrorModal = document.getElementById('closeErrorModal');
        this.errorMessage = document.getElementById('errorMessage');
        this.errorSuggestions = document.getElementById('errorSuggestions');
        
        // Example buttons
        this.exampleButtons = document.querySelectorAll('.example-btn');
    }

    setupEventListeners() {
        // Send message events
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Input validation
        this.messageInput.addEventListener('input', () => this.validateInput());

        // Context toggle
        this.toggleContextBtn.addEventListener('click', () => this.toggleContextControls());

        // Nearby places toggle
        this.toggleNearbyBtn.addEventListener('click', () => this.toggleNearbyPlaces());

        // Tab switching
        this.tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Example buttons
        this.exampleButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const query = e.target.getAttribute('data-query');
                this.messageInput.value = query;
                this.validateInput();
                this.sendMessage();
            });
        });

        // Modal close
        this.closeErrorModal.addEventListener('click', () => this.hideErrorModal());
        this.errorModal.addEventListener('click', (e) => {
            if (e.target === this.errorModal) {
                this.hideErrorModal();
            }
        });

        // Auto-resize textarea
        this.messageInput.addEventListener('input', () => this.autoResizeTextarea());
    }

    async initializeSystem() {
        try {
            // In a real implementation, this would initialize the backend
            // For now, we'll simulate system readiness
            await this.simulateSystemInit();
            console.log('TalkMate system initialized successfully');
        } catch (error) {
            console.error('Failed to initialize TalkMate:', error);
            this.showError('System initialization failed', 'INIT_ERROR', [
                'Please refresh the page',
                'Check your internet connection',
                'Contact support if the problem persists'
            ]);
        }
    }

    async simulateSystemInit() {
        // Simulate loading time
        return new Promise(resolve => setTimeout(resolve, 1000));
    }

    validateInput() {
        const message = this.messageInput.value.trim();
        this.sendButton.disabled = message.length === 0 || this.isProcessing;
    }

    autoResizeTextarea() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    }

    toggleContextControls() {
        this.contextVisible = !this.contextVisible;
        if (this.contextVisible) {
            this.contextControls.classList.remove('hidden');
        } else {
            this.contextControls.classList.add('hidden');
        }
    }

    async sendMessage() {
        if (this.isProcessing) return;

        const message = this.messageInput.value.trim();
        if (!message) return;

        // Get context
        const context = this.getContext();

        // Hide welcome message on first interaction
        if (this.welcomeMessage) {
            this.welcomeMessage.style.display = 'none';
        }

        // Add user message to chat
        this.addMessage(message, 'user', context);

        // Clear input and disable send button
        this.messageInput.value = '';
        this.validateInput();
        this.autoResizeTextarea();

        // Show loading indicator
        this.showLoading();

        try {
            // Process the query
            const response = await this.processQuery(message, context);
            
            // Hide loading and show response
            this.hideLoading();
            this.addMessage(response, 'assistant');

        } catch (error) {
            this.hideLoading();
            console.error('Error processing query:', error);
            
            this.showError(
                'Failed to process your query. Please try again.',
                'PROCESSING_ERROR',
                ['Check your internet connection', 'Try rephrasing your question', 'Refresh the page if the problem persists']
            );
        }
    }

    getContext() {
        const speaker = this.speakerSelect.value || undefined;
        const location = this.locationSelect.value || undefined;
        
        const context = {};
        if (speaker) context.speaker = speaker;
        if (location) context.location = location;
        
        return Object.keys(context).length > 0 ? context : undefined;
    }

    async processQuery(query, context) {
        try {
            const response = await fetch('/api/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query, context })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Handle error responses
            if (data.error) {
                return {
                    type: 'error',
                    message: data.message,
                    code: data.code,
                    suggestions: data.suggestions || []
                };
            }

            // Handle refusal responses
            if (!data.isWithinScope) {
                return {
                    type: 'refusal',
                    message: data.refusalMessage
                };
            }

            // Handle successful responses
            return {
                type: 'success',
                simpleEnglishMeaning: data.simpleEnglishMeaning,
                culturalExplanation: data.culturalExplanation,
                visitorGuidance: data.visitorGuidance,
                confidence: data.confidence,
                sourceEntries: data.sourceEntries || []
            };

        } catch (error) {
            console.error('API call failed:', error);
            
            // Fallback to mock response for development
            if (error.message.includes('fetch')) {
                console.warn('API unavailable, using mock response');
                return this.simulateResponse(query, context);
            }
            
            throw error;
        }
    }

    simulateResponse(query, context) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate processing time
                const response = this.generateMockResponse(query, context);
                resolve(response);
            }, 1500 + Math.random() * 1000); // 1.5-2.5 seconds
        });
    }

    generateMockResponse(query, context) {
        const lowerQuery = query.toLowerCase();
        
        // Check for out-of-scope queries
        if (lowerQuery.includes('chennai') || lowerQuery.includes('mumbai') || lowerQuery.includes('delhi')) {
            return {
                type: 'refusal',
                message: "I'm specialized in helping visitors understand local expressions and culture specifically in Thanjavur, particularly around the Brihadeeswarar Temple area. This query seems to be about other regions. I'd be happy to help with any questions about Thanjavur local culture and expressions instead!"
            };
        }

        // Mock responses for known phrases
        if (lowerQuery.includes('vanakkam anna') || lowerQuery.includes('vanakkam')) {
            return {
                type: 'success',
                simpleEnglishMeaning: 'Hello brother',
                culturalExplanation: 'A respectful greeting used by locals, especially when addressing someone older or in a position of respect. "Anna" (brother) is used regardless of actual family relation. This shows the Tamil cultural value of treating others as family.',
                visitorGuidance: 'Respond with "Vanakkam" and a slight nod. This shows respect for local customs and will be appreciated by locals.',
                confidence: 0.95,
                contextInfo: context ? this.getContextualInfo(context) : undefined
            };
        }

        if (lowerQuery.includes('auto la variya') || lowerQuery.includes('auto')) {
            return {
                type: 'success',
                simpleEnglishMeaning: 'Will you come in auto (rickshaw)?',
                culturalExplanation: 'Auto drivers\' way of asking if you want a ride. The tone and context determine if it\'s a genuine offer or just checking availability. Auto drivers are often local area experts.',
                visitorGuidance: 'If interested, ask "Evlo?" (how much) to negotiate the fare. Always agree on price before getting in. Auto drivers appreciate direct communication.',
                confidence: 0.88,
                contextInfo: context ? this.getContextualInfo(context) : undefined
            };
        }

        if (lowerQuery.includes('kadai irukka') || lowerQuery.includes('kadai')) {
            return {
                type: 'success',
                simpleEnglishMeaning: 'Is the shop there/open?',
                culturalExplanation: 'A common way shopkeepers and customers check if a business is operating. Often used when looking for specific items or services. Shows the community-oriented nature of local business.',
                visitorGuidance: 'If someone asks this, they\'re checking if a shop is open. A simple "yes" or "no" with pointing is helpful. Shopkeepers appreciate friendly interaction.',
                confidence: 0.82,
                contextInfo: context ? this.getContextualInfo(context) : undefined
            };
        }

        if (lowerQuery.includes('periya kovil') || lowerQuery.includes('big temple')) {
            return {
                type: 'success',
                simpleEnglishMeaning: 'Big temple',
                culturalExplanation: 'The local way to refer to Brihadeeswarar Temple. Locals rarely use the full Sanskrit name and prefer this simple, affectionate term. It reflects local pride and familiarity with their heritage.',
                visitorGuidance: 'When asking for directions, use "Periya kovil" instead of the full temple name - locals will understand immediately and appreciate your use of local terminology.',
                confidence: 0.92,
                contextInfo: context ? this.getContextualInfo(context) : undefined
            };
        }

        // Default response for unknown phrases
        return {
            type: 'no_match',
            message: 'I don\'t have specific information about this phrase in my Thanjavur knowledge base. This might be a very local expression or a new phrase that hasn\'t been documented yet. Try asking a local person directly for clarification, or provide more context about where and when you heard this phrase.'
        };
    }

    getContextualInfo(context) {
        let info = [];
        
        if (context.speaker) {
            const speakerInfo = {
                'shopkeeper': 'Shopkeepers in Thanjavur often use friendly, business-oriented expressions to build rapport with customers.',
                'auto_driver': 'Auto drivers are known for their direct, practical communication style and excellent local knowledge.',
                'temple_staff': 'Temple staff use respectful, traditional language that reflects the sacred nature of their work.',
                'elderly_local': 'Elderly locals often use traditional expressions that carry deep cultural significance.'
            };
            info.push(speakerInfo[context.speaker] || '');
        }

        if (context.location) {
            const locationInfo = {
                'temple_streets': 'Around the temple area, conversations often have a more respectful and traditional tone.',
                'markets': 'In market areas, language tends to be more commercial and negotiation-focused.',
                'public_areas': 'In public spaces, people use more general, widely understood expressions.'
            };
            info.push(locationInfo[context.location] || '');
        }

        return info.filter(Boolean).join(' ');
    }

    addMessage(content, sender, context = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;

        if (sender === 'user') {
            messageDiv.innerHTML = this.formatUserMessage(content, context);
        } else {
            messageDiv.innerHTML = this.formatAssistantMessage(content);
        }

        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    formatUserMessage(content, context) {
        let contextInfo = '';
        if (context) {
            const contextParts = [];
            if (context.speaker) contextParts.push(`👤 ${context.speaker.replace('_', ' ')}`);
            if (context.location) contextParts.push(`📍 ${context.location.replace('_', ' ')}`);
            if (contextParts.length > 0) {
                contextInfo = `<div class="context-info">${contextParts.join(' • ')}</div>`;
            }
        }

        return `
            <div class="message-bubble">
                ${content}
                ${contextInfo}
            </div>
        `;
    }

    formatAssistantMessage(response) {
        if (response.type === 'refusal') {
            return `
                <div class="message-bubble">
                    <div class="refusal-message">
                        ${response.message}
                    </div>
                </div>
            `;
        }

        if (response.type === 'no_match') {
            return `
                <div class="message-bubble">
                    <div class="response-section">
                        <h4>🤔 Not Found</h4>
                        <p>${response.message}</p>
                    </div>
                </div>
            `;
        }

        if (response.type === 'success') {
            let html = `
                <div class="message-bubble">
                    <div class="response-section">
                        <h4>📝 Meaning</h4>
                        <p>${response.simpleEnglishMeaning}</p>
                    </div>
                    
                    <div class="response-section">
                        <h4>🏛️ Cultural Context</h4>
                        <p>${response.culturalExplanation}</p>
                        ${response.contextInfo ? `<p><em>${response.contextInfo}</em></p>` : ''}
                    </div>
                    
                    <div class="response-section">
                        <h4>🧭 Visitor Guidance</h4>
                        <p>${response.visitorGuidance}</p>
                    </div>
            `;

            if (response.confidence < 0.7) {
                html += `
                    <div class="confidence-indicator">
                        ⚠️ Moderate confidence (${Math.round(response.confidence * 100)}%) - consider asking for more context
                    </div>
                `;
            }

            html += '</div>';
            return html;
        }

        return `
            <div class="message-bubble">
                <div class="error-message">
                    An unexpected error occurred while processing your query.
                </div>
            </div>
        `;
    }

    showLoading() {
        this.isProcessing = true;
        this.loadingIndicator.style.display = 'flex';
        this.validateInput();
        this.scrollToBottom();
    }

    hideLoading() {
        this.isProcessing = false;
        this.loadingIndicator.style.display = 'none';
        this.validateInput();
    }

    showError(message, code, suggestions = []) {
        this.errorMessage.textContent = message;
        
        if (suggestions.length > 0) {
            const suggestionsList = suggestions.map(s => `<li>${s}</li>`).join('');
            this.errorSuggestions.innerHTML = `<ul>${suggestionsList}</ul>`;
        } else {
            this.errorSuggestions.innerHTML = '';
        }

        this.errorModal.style.display = 'flex';
    }

    hideErrorModal() {
        this.errorModal.style.display = 'none';
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }

    toggleNearbyPlaces() {
        const isVisible = this.nearbyContent.style.display !== 'none';
        this.nearbyContent.style.display = isVisible ? 'none' : 'block';
        this.toggleNearbyBtn.textContent = isVisible ? 'Show Places' : 'Hide Places';
        
        if (!isVisible) {
            this.nearbySection.style.display = 'block';
        }
    }

    switchTab(tabName) {
        // Update tab buttons
        this.tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Show/hide tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
        });
        document.getElementById(tabName + 'Tab').style.display = 'block';

        // Load data if needed
        if (tabName === 'traffic' && !this.trafficLoaded) {
            this.loadTrafficInfo();
        }
    }

    async loadNearbyPlaces() {
        try {
            // Load attractions
            const attractionsResponse = await fetch('/api/nearby-attractions');
            const attractionsData = await attractionsResponse.json();
            this.displayAttractions(attractionsData.attractions || []);

            // Load restaurants
            const restaurantsResponse = await fetch('/api/nearby-restaurants');
            const restaurantsData = await restaurantsResponse.json();
            this.displayRestaurants(restaurantsData.restaurants || []);

            // Show nearby section
            this.nearbySection.style.display = 'block';

        } catch (error) {
            console.error('Error loading nearby places:', error);
        }
    }

    async loadTrafficInfo() {
        try {
            const response = await fetch('/api/traffic?from=Thanjavur Railway Station');
            const data = await response.json();
            this.displayTrafficInfo(data.traffic, data.directionsUrl);
            this.trafficLoaded = true;
        } catch (error) {
            console.error('Error loading traffic info:', error);
            this.trafficInfo.innerHTML = '<p>Unable to load traffic information</p>';
        }
    }

    displayAttractions(attractions) {
        if (!attractions.length) {
            this.attractionsList.innerHTML = '<p>No nearby attractions found</p>';
            return;
        }

        this.attractionsList.innerHTML = attractions.map(place => `
            <div class="place-item">
                <div class="place-info">
                    <div class="place-name">${place.name}</div>
                    <div class="place-details">
                        <span class="place-type">${place.type}</span>
                        ${place.rating ? `<span class="place-rating">⭐ ${place.rating}</span>` : ''}
                        <span class="place-distance">${place.distance}</span>
                        <span class="place-walking">${place.walkingTime}</span>
                        ${place.isOpen !== undefined ? 
                            `<span class="place-status ${place.isOpen ? 'open' : 'closed'}">
                                ${place.isOpen ? 'Open' : 'Closed'}
                            </span>` : ''
                        }
                    </div>
                </div>
            </div>
        `).join('');
    }

    displayRestaurants(restaurants) {
        if (!restaurants.length) {
            this.restaurantsList.innerHTML = '<p>No nearby restaurants found</p>';
            return;
        }

        this.restaurantsList.innerHTML = restaurants.map(place => `
            <div class="place-item">
                <div class="place-info">
                    <div class="place-name">${place.name}</div>
                    <div class="place-details">
                        <span class="place-type">${place.type}</span>
                        ${place.rating ? `<span class="place-rating">⭐ ${place.rating}</span>` : ''}
                        <span class="place-distance">${place.distance}</span>
                        <span class="place-walking">${place.walkingTime}</span>
                        ${place.isOpen !== undefined ? 
                            `<span class="place-status ${place.isOpen ? 'open' : 'closed'}">
                                ${place.isOpen ? 'Open' : 'Closed'}
                            </span>` : ''
                        }
                    </div>
                </div>
            </div>
        `).join('');
    }

    displayTrafficInfo(traffic, directionsUrl) {
        this.trafficInfo.innerHTML = `
            <div class="traffic-item">
                <div>
                    <strong>Current Traffic to Temple</strong>
                    <div>Estimated time: ${traffic.estimatedTime}</div>
                    <div>Best route: ${traffic.bestRoute}</div>
                </div>
                <span class="traffic-condition ${traffic.currentCondition}">
                    ${traffic.currentCondition.toUpperCase()}
                </span>
            </div>
            ${traffic.alternativeRoutes && traffic.alternativeRoutes.length > 0 ? `
                <div class="traffic-item">
                    <div>
                        <strong>Alternative Routes</strong>
                        <div>${traffic.alternativeRoutes.join(', ')}</div>
                    </div>
                </div>
            ` : ''}
            <div style="text-align: center; margin-top: 1rem;">
                <a href="${directionsUrl}" target="_blank" class="directions-btn">
                    🗺️ Get Directions
                </a>
            </div>
        `;
    }
}

// Initialize the chat when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TalkMateChat();
});

// Add some utility functions for potential future use
window.TalkMateUtils = {
    formatTamilText: (text) => {
        // Utility function to format Tamil text properly
        return text;
    },
    
    validateQuery: (query) => {
        // Utility function to validate queries
        return query && query.trim().length > 0;
    },
    
    extractContext: (text) => {
        // Utility function to extract context from natural language
        const context = {};
        
        // Simple keyword matching for demo purposes
        if (text.toLowerCase().includes('shopkeeper') || text.toLowerCase().includes('shop')) {
            context.speaker = 'shopkeeper';
        }
        if (text.toLowerCase().includes('auto') || text.toLowerCase().includes('driver')) {
            context.speaker = 'auto_driver';
        }
        if (text.toLowerCase().includes('temple') || text.toLowerCase().includes('priest')) {
            context.speaker = 'temple_staff';
        }
        if (text.toLowerCase().includes('elderly') || text.toLowerCase().includes('old')) {
            context.speaker = 'elderly_local';
        }
        
        return context;
    }
};