/**
 * Système de traduction 
 */
class I18n {
    static init() {
        this.lang = localStorage.getItem('fb-lang') || 'fr';
        this.loadTranslations();
    }

    static loadTranslations() {
        // Chargement asynchrone des traductions
        fetch(`/api/i18n/translations.php?lang=${this.lang}`)
            .then(res => res.json())
            .then(translations => {
                this.translations = translations;
                this.applyTranslations();
            });
    }

    static applyTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = this.translations[key] || key;
        });

        document.documentElement.lang = this.lang;
    }

    static changeLanguage(lang) {
        this.lang = lang;
        localStorage.setItem('fb-lang', lang);
        this.loadTranslations();
        
    
        if (window.currentUser) {
            fetch('/api/users/update-language.php', {
                method: 'POST',
                body: JSON.stringify({ lang })
            });
        }
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => I18n.init());