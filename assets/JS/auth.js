class AuthSystem {
    static init() {
        this.setupPasswordVisibilityToggles();
        this.setupAuthForms();
        this.setupToastDismiss();
        this.checkSessionStatus();
    }

    static setupPasswordVisibilityToggles() {
        document.addEventListener('click', (e) => {
            const toggle = e.target.closest('.toggle-password');
            if (!toggle) return;

            const control = toggle.closest('.control');
            if (!control) return;

            const input = control.querySelector('input');
            const icon = toggle.querySelector('i');
            
            if (input && icon) {
                const isPassword = input.type === 'password';
                input.type = isPassword ? 'text' : 'password';
                icon.classList.toggle('fa-eye', !isPassword);
                icon.classList.toggle('fa-eye-slash', isPassword);
                
                // Accessibilité
                input.setAttribute('aria-describedby', `password-${isPassword ? 'visible' : 'hidden'}`);
            }
        });
    }

    static setupAuthForms() {
        // Connexion
        document.getElementById('login-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleAuth('login');
        });

        // Inscription
        document.getElementById('register-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleAuth('register');
        });

        // Déconnexion
        document.getElementById('logout-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleLogout();
        });
    }

    static setupToastDismiss() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('#close-toast') || e.target.id === 'toast') {
                this.hideToast();
            }
        });
    }

    static async checkSessionStatus() {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) return;

        try {
            const response = await fetch('api/auth/validate.php', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error('Session invalide');
            }

            // Session valide - mettre à jour les données utilisateur si besoin
            const data = await response.json();
            localStorage.setItem('user', JSON.stringify(data.user));

        } catch (error) {
            this.handleInvalidSession();
        }
    }

    static async handleAuth(type) {
        const form = document.getElementById(`${type}-form`);
        if (!form) return;

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnState = {
            html: submitBtn.innerHTML,
            disabled: submitBtn.disabled
        };

        try {
            // Préparation du bouton de soumission
            this.prepareSubmitButton(submitBtn, type);

            // Validation côté client
            if (!this.validateForm(form, type)) {
                return;
            }

            // Envoi à l'API
            const response = await this.sendAuthRequest(type, form);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || 
                    `Erreur ${response.status} lors de ${type === 'login' ? 'la connexion' : 'l\'inscription'}`
                );
            }

            const data = await response.json();
            await this.handleAuthSuccess(type, data);

        } catch (error) {
            this.handleAuthError(error, type);
        } finally {
            this.resetSubmitButton(submitBtn, originalBtnState);
        }
    }

    static prepareSubmitButton(button, type) {
        button.disabled = true;
        button.innerHTML = `
            <span class="icon">
                <i class="fas fa-spinner fa-pulse" aria-hidden="true"></i>
            </span>
            <span>${type === 'login' ? 'Connexion en cours...' : 'Création du compte...'}</span>
        `;
        button.setAttribute('aria-busy', 'true');
    }

    static resetSubmitButton(button, originalState) {
        button.disabled = originalState.disabled;
        button.innerHTML = originalState.html;
        button.removeAttribute('aria-busy');
    }

    static validateForm(form, type) {
        let isValid = true;
        const inputs = form.querySelectorAll('input[required]');
        
        inputs.forEach(input => {
            input.classList.remove('is-danger');
            
            if (!input.value.trim()) {
                input.classList.add('is-danger');
                isValid = false;
            }
            
            // Validation spécifique pour les mots de passe
            if (input.type === 'password' && input.value.length < 8) {
                this.showToast('Le mot de passe doit contenir au moins 8 caractères', 'is-danger');
                input.classList.add('is-danger');
                isValid = false;
            }
        });

        // Validation spécifique à l'inscription
        if (type === 'register') {
            const password = form.querySelector('#register-password');
            const confirmPassword = form.querySelector('#register-confirm-password');
            
            if (password && confirmPassword && password.value !== confirmPassword.value) {
                this.showToast('Les mots de passe ne correspondent pas', 'is-danger');
                password.classList.add('is-danger');
                confirmPassword.classList.add('is-danger');
                isValid = false;
            }
        }

        return isValid;
    }

    static async sendAuthRequest(type, form) {
        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());

        return await fetch(`api/auth/${type}.php`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(payload)
        });
    }

    static async handleAuthSuccess(type, data) {
        const successMessage = data.message || 
            (type === 'login' ? 'Connexion réussie!' : 'Compte créé avec succès!');
        
        this.showToast(successMessage, 'is-success');

        if (type === 'login') {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Redirection vers la page d'accueil après connexion
            await new Promise(resolve => setTimeout(resolve, 1500));
            window.location.href = 'VUES/Clients/home.html';
        } else {
            // Après inscription, rediriger vers la page d'édition de profil
            form.reset();
            await new Promise(resolve => setTimeout(resolve, 1500));
            window.location.href = 'VUES/Clients/edit-profile.html';
        }
    }

    static handleAuthError(error, type) {
        console.error(`${type} Error:`, error);
        
        const errorMessage = error.message.includes('Network Error') 
            ? 'Erreur de réseau - Veuillez vérifier votre connexion'
            : error.message;
        
        this.showToast(errorMessage, 'is-danger');
    }

    static handleLogout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        
        this.showToast('Vous avez été déconnecté avec succès', 'is-info');
        
        // Redirection vers la page de connexion après déconnexion
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    static handleInvalidSession() {
        localStorage.removeItem('authToken');
        this.showToast('Votre session a expiré - Veuillez vous reconnecter', 'is-warning');
        
        if (!window.location.href.includes('index.html')) {
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
    }

    static showToast(message, type = 'is-success', duration = 5000) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');
        
        if (!toast || !toastMessage) return;
        
        toast.className = `notification ${type}`;
        toastMessage.textContent = message;
        toast.classList.remove('is-hidden');
        toast.setAttribute('aria-live', 'polite');

        // Fermeture automatique
        this.toastTimer = setTimeout(() => {
            this.hideToast();
        }, duration);
    }

    static hideToast() {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.classList.add('is-hidden');
            clearTimeout(this.toastTimer);
        }
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => AuthSystem.init());e