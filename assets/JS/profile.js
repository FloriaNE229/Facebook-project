/**
 * PROFILE.JS - Gestion du profil utilisateur
 */
import { apiCall } from './api.js';
import { animateElement } from './animations.js';
import { store } from './store.js';

const ProfileManager = {
    currentUser: null,
    editing: false,

    async init() {
        await this.loadProfile();
        this.setupEventListeners();
    },

    async loadProfile() {
        try {
            const userId = document.getElementById('profile-container')?.dataset.userId;
            const endpoint = userId ? `/users/${userId}` : '/me';
            
            this.currentUser = await apiCall(endpoint);
            this.renderProfile();
            store.commit('setCurrentUser', this.currentUser);
        } catch (error) {
            console.error('Erreur chargement profil:', error);
        }
    },

    renderProfile() {
        const container = document.getElementById('profile-container');
        if (!container) return;

        container.innerHTML = `
            <div class="profile-header">
                <img src="${this.currentUser.avatar}" alt="Avatar" id="profile-avatar">
                <h2>${this.currentUser.username}</h2>
                <button id="edit-profile">${this.editing ? 'Annuler' : 'Modifier'}</button>
            </div>
            <div class="profile-details">
                <form id="profile-form" style="display: ${this.editing ? 'block' : 'none'}">
                    <input type="text" name="name" value="${this.currentUser.name}">
                    <textarea name="bio">${this.currentUser.bio || ''}</textarea>
                    <input type="file" id="avatar-upload" accept="image/*">
                    <button type="submit">Enregistrer</button>
                </form>
                <div class="profile-view" style="display: ${this.editing ? 'none' : 'block'}">
                    <p><strong>Nom:</strong> ${this.currentUser.name}</p>
                    <p><strong>Bio:</strong> ${this.currentUser.bio || 'Non renseignée'}</p>
                </div>
            </div>
        `;
    },

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.id === 'edit-profile') {
                this.toggleEditMode();
            }
        });

        document.addEventListener('submit', async (e) => {
            if (e.target.id === 'profile-form') {
                e.preventDefault();
                await this.saveProfile(new FormData(e.target));
            }
        });

        document.addEventListener('change', (e) => {
            if (e.target.id === 'avatar-upload') {
                this.previewAvatar(e.target.files[0]);
            }
        });
    },

    toggleEditMode() {
        this.editing = !this.editing;
        this.renderProfile();
        animateElement('profile-container', 'fadeIn');
    },

    async saveProfile(formData) {
        try {
            this.currentUser = await apiCall('/profile/update', 'POST', formData, true);
            this.editing = false;
            this.renderProfile();
            animateElement('profile-container', 'pulse');
        } catch (error) {
            console.error('Erreur sauvegarde profil:', error);
        }
    },

    previewAvatar(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('profile-avatar').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
};

// Initialisation automatique sur les pages de profil
if (window.location.pathname.includes('/profile')) {
    document.addEventListener('DOMContentLoaded', () => {
        ProfileManager.init();
    });
}