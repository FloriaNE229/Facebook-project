/**
 * Gestion des transitions et de l'interface
 * pour une application monopage (SPA)
 */

import { includeHTML, showFlashMessage } from './utils.js';

// Configuration de l'application
const AppConfig = {
    theme: {
        primary: '#4361ee',
        secondary: '#f72585',
        darkMode: false
    },
    animations: {
        pageTransition: 'fade',
        duration: 300
    }
};

// Cache pour stocker les pages chargées
const pageCache = new Map();

// Transition entre les vues
async function loadPage(pageName) {
    const mainContent = document.getElementById('app-content');
    
    if (!pageName) {
        pageName = 'accueil'; // Page par défaut
    }

    // Animation de sortie
    mainContent.classList.add('animate__animated', `animate__${AppConfig.animations.pageTransition}Out`);
    
    await new Promise(resolve => setTimeout(resolve, AppConfig.animations.duration));

    try {
        // Vérifier le cache avant de charger
        let pageContent;
        if (pageCache.has(pageName)) {
            pageContent = pageCache.get(pageName);
        } else {
            const response = await fetch(`vues/clients/${pageName}.html`);
            if (!response.ok) throw new Error('Page non trouvée');
            pageContent = await response.text();
            pageCache.set(pageName, pageContent);
        }

        // Injection du contenu
        mainContent.innerHTML = pageContent;
        mainContent.classList.remove(`animate__${AppConfig.animations.pageTransition}Out`);
        mainContent.classList.add('animate__animated', `animate__${AppConfig.animations.pageTransition}In`);

        // Déclencher les événements post-chargement
        window.dispatchEvent(new CustomEvent('pageChanged', {
            detail: { 
                page: pageName,
                timestamp: Date.now()
            }
        }));

        // Inclure les composants HTML
        await includeHTML();

    } catch (error) {
        console.error('Erreur de chargement:', error);
        showFlashMessage('Erreur de chargement de la page', 'error');
        loadPage('erreur'); // Page de fallback
    }
}

// Gestion du thème
function applyTheme() {
    const root = document.documentElement;
    root.style.setProperty('--primary', AppConfig.theme.primary);
    root.style.setProperty('--secondary', AppConfig.theme.secondary);
    document.body.classList.toggle('dark-mode', AppConfig.theme.darkMode);
}

// Router simple
function handleRouting() {
    const hash = window.location.hash.substring(1);
    loadPage(hash || 'accueil');
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Appliquer le thème
    applyTheme();
    
    // Gestion initiale du routage
    handleRouting();
    
    // Écouteur pour les changements de hash
    window.addEventListener('hashchange', handleRouting);
    
    // Exposer les fonctions globales si nécessaire
    window.App = {
        navigate: loadPage,
        setTheme: (darkMode) => {
            AppConfig.theme.darkMode = darkMode;
            applyTheme();
        }
    };
});