class Router {
    constructor() {
        this.routes = {
            '#login': {
                view: 'Vues/clients/login.html',
                script: 'auth.js',
                authRequired: false,
                title: 'Connexion - FriendSphere'
            },
            '#register': {
                view: 'vues/clients/register.html',
                script: 'auth.js',
                authRequired: false,
                title: 'Inscription - FriendSphere'
            },
            '#home': {
                view: 'vues/clients/home.html',
                script: 'posts.js',
                authRequired: true,
                title: 'Accueil - FriendSphere'
            },
            '#profile': {
                view: 'vues/clients/profile.html',
                script: 'profile.js',
                authRequired: true,
                title: 'Profil - FriendSphere'
            },
            '': { 
                view: 'vues/clients/home.html',
                script: 'posts.js',
                authRequired: true,
                title: 'FriendSphere'
            },
            '#404': {
                view: 'vues/errors/404.html',
                script: null,
                authRequired: false,
                title: 'Page non trouvée - FriendSphere'
            }
        };
        
        this.currentScript = null;
        this.eventListeners = [];
        this.authToken = localStorage.getItem('authToken');
        this.transitionDuration = 300; // Durée de transition en ms
    }

    init() {
        // Délégation d'événement pour tous les liens internes
        document.body.addEventListener('click', this.handleLinkClick.bind(this));
        
        // Gestion des changements d'URL
        window.addEventListener('hashchange', this.handleRouteChange.bind(this));
        
        // Chargement initial
        this.handleRouteChange();
    }

    handleLinkClick(e) {
        const link = e.target.closest('a[href^="#"]');
        if (link) {
            e.preventDefault();
            this.navigateTo(link.getAttribute('href'));
        }
    }

    async handleRouteChange() {
        const [path, queryString] = window.location.hash.split('?');
        const route = this.routes[path] || this.routes['#404'];
        const queryParams = new URLSearchParams(queryString);

        // Vérification d'authentification
        if (route.authRequired && !this.isAuthenticated()) {
            return this.navigateTo(`#login?redirect=${encodeURIComponent(path)}`);
        }

        await this.loadRoute(route);
    }

    async loadRoute(route) {
        try {
            const mainContent = document.getElementById('main-content');
            
            // Transition de sortie
            mainContent.style.opacity = '0';
            await this.waitForTransition(mainContent);
            
            // Chargement de la vue
            const response = await fetch(route.view);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            mainContent.innerHTML = await response.text();
            document.title = route.title;
            
            // Gestion des scripts
            this.loadScript(route.script);
            this.initEventListeners();

            // Transition d'entrée
            mainContent.style.opacity = '1';
            
            // Déclenche un événement personnalisé pour les composants
            this.dispatchRouteChangedEvent(route);

        } catch (error) {
            console.error('Router error:', error);
            this.showError(`Erreur de chargement: ${error.message}`);
        }
    }

    async waitForTransition(element) {
        return new Promise(resolve => {
            const onEnd = () => {
                element.removeEventListener('transitionend', onEnd);
                resolve();
            };
            
            element.addEventListener('transitionend', onEnd);
            setTimeout(resolve, this.transitionDuration); // Fallback
        });
    }

    loadScript(scriptName) {
        // Nettoyage du script précédent
        if (this.currentScript) {
            document.body.removeChild(this.currentScript);
            this.currentScript = null;
        }

        if (!scriptName) return;

        const script = document.createElement('script');
        script.src = `assets/js/${scriptName}`;
        script.async = true;
        script.onerror = () => console.error(`Failed to load script: ${scriptName}`);
        
        document.body.appendChild(script);
        this.currentScript = script;
    }

    initEventListeners() {
        this.clearEventListeners();

        // Gestion de la connexion
        this.setupLoginForm();
        
        // Ajouter d'autres écouteurs ici au besoin
    }

    setupLoginForm() {
        const loginForm = document.getElementById('login-form');
        if (!loginForm) return;

        const handler = async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            try {
                const response = await fetch('api/auth/login.php', {
                    method: 'POST',
                    body: JSON.stringify(Object.fromEntries(formData)),
                    headers: { 'Content-Type': 'application/json' }
                });

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                
                const data = await response.json();
                
                if (data.success) {
                    this.handleSuccessfulLogin(data.token);
                } else {
                    this.showNotification(data.message || 'Erreur de connexion', 'error');
                }
            } catch (error) {
                console.error('Login error:', error);
                this.showNotification('Erreur réseau', 'error');
            }
        };

        loginForm.addEventListener('submit', handler);
        this.eventListeners.push({ element: loginForm, type: 'submit', handler });
    }

    handleSuccessfulLogin(token) {
        localStorage.setItem('authToken', token);
        this.authToken = token;
        
        // Gestion de la redirection après connexion
        const redirect = new URLSearchParams(window.location.hash.split('?')[1]).get('redirect');
        this.navigateTo(redirect || '#home');
        
        this.showNotification('Connexion réussie!', 'success');
    }

    clearEventListeners() {
        this.eventListeners.forEach(({ element, type, handler }) => {
            element.removeEventListener(type, handler);
        });
        this.eventListeners = [];
    }

    dispatchRouteChangedEvent(route) {
        const event = new CustomEvent('routeChanged', {
            detail: { route }
        });
        document.dispatchEvent(event);
    }

    isAuthenticated() {
        // Vérification plus robuste si nécessaire
        return !!this.authToken;
    }

    navigateTo(path) {
        if (!path.startsWith('#')) path = `#${path}`;
        if (window.location.hash !== path) {
            window.location.hash = path;
        } else {
            // Force le rechargement si même hash
            this.handleRouteChange();
        }
    }

    showNotification(message, type = 'info') {
        const notificationsContainer = document.getElementById('notifications') || 
                                     this.createNotificationsContainer();
        
        const notification = document.createElement('div');
        notification.className = `notification is-${type}`;
        notification.innerHTML = `
            <button class="delete" aria-label="Fermer"></button>
            ${message}
        `;
        
        notificationsContainer.appendChild(notification);
        
        notification.querySelector('.delete').addEventListener('click', () => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 150);
        });

        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 150);
        }, 5000);
    }

    createNotificationsContainer() {
        const container = document.createElement('div');
        container.id = 'notifications';
        container.className = 'notifications-container';
        document.body.appendChild(container);
        return container;
    }

    showError(message) {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="error-container">
                <div class="notification is-danger">
                    ${message}
                </div>
                <a href="#home" class="button is-link">Retour à l'accueil</a>
            </div>
        `;
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    const router = new Router();
    router.init();
});