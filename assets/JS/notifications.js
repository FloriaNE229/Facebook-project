/**
 * NOTIFICATIONS.JS - Gestion des notifications en temps réel
 */
import { apiCall } from './api.js';
import { animateElement } from './animations.js';

const NotificationCenter = {
    unreadCount: 0,
    notifications: [],

    async init() {
        await this.fetchNotifications();
        this.setupSocket();
        this.setupUI();
    },

    async fetchNotifications() {
        try {
            const data = await apiCall('/notifications');
            this.notifications = data;
            this.unreadCount = data.filter(n => !n.read).length;
            this.updateBadge();
        } catch (error) {
            console.error('Erreur chargement notifications:', error);
        }
    },

    setupSocket() {
        const socket = new WebSocket('wss://votre-api.com/notifications');

        socket.onmessage = (event) => {
            const notification = JSON.parse(event.data);
            this.addNotification(notification);
            animateElement('notif-badge', 'bounce');
        };
    },

    setupUI() {
        const bell = document.getElementById('notif-bell');
        if (bell) {
            bell.addEventListener('click', () => this.toggleDropdown());
        }

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.notification-container')) {
                this.closeDropdown();
            }
        });
    },

    addNotification(notification) {
        this.notifications.unshift(notification);
        this.unreadCount++;
        this.updateBadge();
        this.renderDropdown();
    },

    updateBadge() {
        const badge = document.getElementById('notif-badge');
        if (badge) {
            badge.textContent = this.unreadCount > 0 ? this.unreadCount : '';
            badge.style.display = this.unreadCount > 0 ? 'block' : 'none';
        }
    },

    renderDropdown() {
        const dropdown = document.getElementById('notif-dropdown');
        if (!dropdown) return;

        dropdown.innerHTML = this.notifications.slice(0, 5).map(notif => `
            <div class="notification-item ${notif.read ? '' : 'unread'}">
                <div class="icon">${this.getNotificationIcon(notif.type)}</div>
                <div class="content">
                    <p>${notif.message}</p>
                    <small>${new Date(notif.timestamp).toLocaleTimeString()}</small>
                </div>
            </div>
        `).join('');
    },

    getNotificationIcon(type) {
        const icons = {
            message: '💬',
            friend: '👋',
            like: '❤️',
            system: 'ℹ️'
        };
        return icons[type] || '🔔';
    }
};

// Initialisation automatique
document.addEventListener('DOMContentLoaded', () => {
    NotificationCenter.init();
});