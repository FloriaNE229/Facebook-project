/**
 * CHAT.JS - Module de messagerie instantanée
 */
import { getCurrentUser } from './auth.js';
import { apiCall } from './api.js';
import { animateElement } from './animations.js';

const ChatManager = {
    socket: null,
    currentConversation: null,

    init() {
        this.setupEventListeners();
        this.connectWebSocket();
    },

    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            const form = document.getElementById('chat-form');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.sendMessage();
                });
            }
        });
    },

    connectWebSocket() {
        // Implémentation WebSocket avec reconnexion automatique
        this.socket = new WebSocket(`wss://votre-api.com/chat?token=${getCurrentUser().token}`);

        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.displayMessage(message);
            animateElement('message-bubble', 'pulse');
        };

        this.socket.onclose = () => {
            setTimeout(() => this.connectWebSocket(), 3000);
        };
    },

    async sendMessage() {
        const input = document.getElementById('chat-input');
        if (!input.value.trim()) return;

        const message = {
            content: input.value,
            conversationId: this.currentConversation,
            timestamp: Date.now()
        };

        try {
            await apiCall('/chat/send', 'POST', message);
            input.value = '';
        } catch (error) {
            console.error('Erreur envoi message:', error);
        }
    },

    displayMessage(message) {
        const container = document.getElementById('messages-container');
        if (!container) return;

        const isCurrentUser = message.senderId === getCurrentUser().id;
        const messageHTML = `
            <div class="message ${isCurrentUser ? 'sent' : 'received'}">
                <div class="content">${message.content}</div>
                <div class="timestamp">${new Date(message.timestamp).toLocaleTimeString()}</div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', messageHTML);
        container.scrollTop = container.scrollHeight;
    }
};

// Export pour utilisation globale si nécessaire
window.ChatManager = ChatManager;

// Initialisation automatique si sur la page de chat
if (window.location.pathname.includes('/chat')) {
    ChatManager.init();
}