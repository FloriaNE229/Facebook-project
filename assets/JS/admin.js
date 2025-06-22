/**
 * ADMIN.JS - Panel d'administration
 */
import { apiCall } from './api.js';
import { store } from './store.js';

const AdminPanel = {
    async init() {
        await this.loadStats();
        await this.loadUsers();
        this.setupEventListeners();
    },

    async loadStats() {
        try {
            const stats = await apiCall('/admin/stats');
            this.renderStats(stats);
        } catch (error) {
            console.error('Erreur chargement stats:', error);
        }
    },

    async loadUsers(page = 1) {
        try {
            const users = await apiCall(`/admin/users?page=${page}`);
            this.renderUserTable(users);
        } catch (error) {
            console.error('Erreur chargement utilisateurs:', error);
        }
    },

    renderStats(stats) {
        const container = document.getElementById('admin-stats');
        if (!container) return;

        container.innerHTML = `
            <div class="stat-card">
                <h3>Utilisateurs</h3>
                <p>${stats.totalUsers}</p>
            </div>
            <div class="stat-card">
                <h3>Actifs (24h)</h3>
                <p>${stats.activeUsers}</p>
            </div>
            <div class="stat-card">
                <h3>Nouveaux (7j)</h3>
                <p>${stats.newUsers}</p>
            </div>
        `;
    },

    renderUserTable(users) {
        const table = document.getElementById('users-table');
        if (!table) return;

        table.innerHTML = `
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(user => `
                    <tr>
                        <td>${user.id}</td>
                        <td>${user.email}</td>
                        <td>
                            <select class="role-select" data-id="${user.id}">
                                <option ${user.role === 'user' ? 'selected' : ''}>user</option>
                                <option ${user.role === 'moderator' ? 'selected' : ''}>moderator</option>
                                <option ${user.role === 'admin' ? 'selected' : ''}>admin</option>
                            </select>
                        </td>
                        <td>
                            <span class="status-badge ${user.banned ? 'banned' : 'active'}">
                                ${user.banned ? 'Banni' : 'Actif'}
                            </span>
                        </td>
                        <td>
                            <button class="btn-ban" data-id="${user.id}">
                                ${user.banned ? 'Débannir' : 'Bannir'}
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;
    },

    setupEventListeners() {
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('role-select')) {
                this.updateUserRole(e.target.dataset.id, e.target.value);
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-ban')) {
                this.toggleBanUser(e.target.dataset.id);
            }
        });
    }
};

// Initialisation conditionnelle
if (window.location.pathname.startsWith('/admin')) {
    document.addEventListener('DOMContentLoaded', () => {
        AdminPanel.init();
    });
}