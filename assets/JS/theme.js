/**
 * Gestion du thème sombre 
 */
class ThemeManager {
    static init() {
        // 1. Vérifie le localStorage
        this.isDark = localStorage.getItem('fb-theme') === 'dark';
        
        // 2. Applique le thème initial
        this.applyTheme();
        
        // 3. Configure les écouteurs
        this.setupEventListeners();
    }

    static applyTheme() {
        document.documentElement.classList.toggle('dark-mode', this.isDark);
        
        // Pour Bulma (override des variables CSS)
        if (this.isDark) {
            document.documentElement.style.setProperty('--scheme-main', '#242526');
            document.documentElement.style.setProperty('--background', '#18191a');
            document.documentElement.style.setProperty('--text', '#e4e6eb');
        }
    }

    static setupEventListeners() {
        // Écouteur pour le toggle dans parametres.php
        document.addEventListener('change', (e) => {
            if (e.target.id === 'theme-toggle') {
                this.isDark = e.target.checked;
                localStorage.setItem('fb-theme', this.isDark ? 'dark' : 'light');
                this.applyTheme();
                
                // Envoi au serveur si utilisateur connecté
                if (window.currentUser) {
                    fetch('/api/users/update-theme.php', {
                        method: 'POST',
                        body: JSON.stringify({ dark_mode: this.isDark })
                    });
                }
            }
        });
    }
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => ThemeManager.init());