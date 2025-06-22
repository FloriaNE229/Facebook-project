/**
 * FRIENDS.JS - Gestion des relations sociales
 */
import { apiCall } from './api.js';
import { store } from './store.js';

const FriendsSystem = {
    state: {
        friendsList: [],
        pendingRequests: []
    },

    async init() {
        await this.loadFriends();
        this.setupUIListeners();
    },

    async loadFriends() {
        try {
            const data = await apiCall('/friends/list');
            this.state.friendsList = data.friends;
            this.state.pendingRequests = data.pending;
            this.updateStore();
            this.renderFriendsList();
        } catch (error) {
            console.error('Erreur chargement amis:', error);
        }
    },

    renderFriendsList() {
        const container = document.getElementById('friends-container');
        if (!container) return;

        container.innerHTML = this.state.friendsList.map(friend => `
            <div class="friend-card" data-id="${friend.id}">
                <img src="${friend.avatar}" alt="${friend.name}">
                <h4>${friend.name}</h4>
                <button class="btn-chat" data-id="${friend.id}">Chat</button>
                <button class="btn-remove" data-id="${friend.id}">Retirer</button>
            </div>
        `).join('');
    },

    setupUIListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-remove')) {
                this.removeFriend(e.target.dataset.id);
            }
            if (e.target.classList.contains('btn-chat')) {
                this.startChat(e.target.dataset.id);
            }
        });
    },

    async removeFriend(friendId) {
        try {
            await apiCall(`/friends/remove/${friendId}`, 'DELETE');
            await this.loadFriends(); // Rafraîchir la liste
        } catch (error) {
            console.error('Erreur suppression ami:', error);
        }
    },

    startChat(friendId) {
        // Intégration avec le module chat
        if (window.ChatManager) {
            ChatManager.currentConversation = `private_${friendId}`;
            window.location.href = '/chat';
        }
    },

    updateStore() {
        store.commit('updateFriends', this.state.friendsList);
    }
};

export default FriendsSystem;