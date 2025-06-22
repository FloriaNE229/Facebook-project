// Helpers DOM intégrés directement
export const isMobile = () => window.innerWidth < 768;

export const scrollToElement = (selector) => {
    document.querySelector(selector)?.scrollIntoView({ 
        behavior: 'smooth' 
    });
};

// Gestion des animations
export const animate = {
    element(element, animation) {
        if (isMobile() || !element) return;

        element.classList.add(`animate__animated`, `animate__${animation}`);
        element.addEventListener('animationend', () => {
            element.classList.remove(`animate__animated`, `animate__${animation}`);
        }, { once: true });
    },

    // Exemple spécifique (like Facebook)
    pop(element) {
        this.element(element, 'bounceIn');
    }
};