document.addEventListener('DOMContentLoaded', () => {
    // Configuration initiale améliorée
    const app = {
        state: {
            currentUser: {
                id: 1,
                name: "Utilisateur",
                avatar: "https://i.pravatar.cc/150?img=3",
                coverImage: "https://source.unsplash.com/random/800x200"
            },
            posts: [],
            darkMode: localStorage.getItem('darkMode') === 'true',
            animationsEnabled: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            isLoading: false
        },

        // Initialisation
        init() {
            this.setupTheme();
            this.setupEventListeners();
            this.loadPosts().then(() => {
                this.animateElement(document.querySelector('header'), 'fadeInDown');
                this.updateUI();
            });
        },

        // Gestion du thème
        setupTheme() {
            if (this.state.darkMode) {
                document.documentElement.classList.add('dark-mode');
            }
        },

        // Écouteurs d'événements
        setupEventListeners() {
            // Navigation avec animation
            document.body.addEventListener('click', (e) => {
                const link = e.target.closest('a[href^="#"]');
                if (link) {
                    e.preventDefault();
                    this.animatePageTransition(link.getAttribute('href').replace('#', ''));
                }

                // Gestion des likes
                const likeBtn = e.target.closest('.like-btn');
                if (likeBtn) {
                    const postId = parseInt(likeBtn.closest('[data-post-id]').dataset.postId);
                    this.animateLike(postId);
                }
            });

            // Nouveau post
            document.getElementById('new-post-btn')?.addEventListener('click', () => {
                this.handleNewPost();
            });

            // Basculer le mode sombre
            document.getElementById('theme-toggle')?.addEventListener('click', () => {
                this.toggleDarkMode();
            });

            window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
                this.state.animationsEnabled = !e.matches;
            });
        },

        // Animation de transition entre pages
        async animatePageTransition(page) {
            const currentPage = document.querySelector('.page.active');
            const nextPage = document.getElementById(`${page}-page`);
            
            if (!nextPage) return;

            // Animation de sortie
            if (currentPage) {
                await this.animateElement(currentPage, 'fadeOut');
                currentPage.classList.remove('active');
            }

            // Animation d'entrée
            nextPage.classList.add('active');
            await this.animateElement(nextPage, 'fadeIn');
            
            // Mise à jour de l'URL
            history.pushState(null, '', `#${page}`);
        },

        // Chargement des posts avec simulation API
        async loadPosts() {
            this.state.isLoading = true;
            this.updateUI();

            // Simulation de chargement asynchrone
            await new Promise(resolve => setTimeout(resolve, 800));

            this.state.posts = [
                {
                    id: 1,
                    author: "Jean Dupont",
                    avatar: "https://i.pravatar.cc/150?img=1",
                    content: "Bonjour à tous ! Voici mon premier post.",
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    likes: 12,
                    comments: [
                        {
                            id: 1,
                            author: "Marie Martin",
                            avatar: "https://i.pravatar.cc/150?img=5",
                            content: "Super post !",
                            timestamp: new Date(Date.now() - 1800000).toISOString()
                        }
                    ],
                    liked: false,
                    animate: true
                },
                {
                    id: 2,
                    author: "Sophie Lambert",
                    avatar: "https://i.pravatar.cc/150?img=8",
                    content: "Quelqu'un a des recommandations de livres ?",
                    timestamp: new Date(Date.now() - 7200000).toISOString(),
                    likes: 8,
                    comments: [],
                    liked: true,
                    animate: true
                }
            ];

            this.state.isLoading = false;
            this.renderPosts();
        },

    
        renderPosts() {
            const container = document.getElementById('posts-container');
            if (!container) return;

            container.innerHTML = this.state.posts.map((post, index) => `
                <div class="post ${post.animate ? 'animate__animated animate__fadeIn' : ''}" 
                     data-post-id="${post.id}"
                     style="${post.animate ? '--animation-delay: ' + (0.1 * index) + 's' : ''}">
                    <div class="post-header">
                        <img src="${post.avatar}" alt="${post.author}" class="post-avatar">
                        <div class="post-author">${post.author}</div>
                        <div class="post-time">${this.formatTimeAgo(post.timestamp)}</div>
                    </div>
                    <div class="post-content">${post.content}</div>
                    <div class="post-actions">
                        <button class="like-btn ${post.liked ? 'liked' : ''}" aria-label="J'aime">
                            <span class="like-count">${post.likes}</span>
                        </button>
                        <button class="comment-btn" aria-label="Commenter">
                            <span class="comment-count">${post.comments.length}</span>
                        </button>
                    </div>
                    ${post.comments.length > 0 ? `
                        <div class="post-comments">
                            ${post.comments.map(comment => `
                                <div class="comment">
                                    <img src="${comment.avatar}" alt="${comment.author}" class="comment-avatar">
                                    <div>
                                        <div class="comment-author">${comment.author}</div>
                                        <div class="comment-content">${comment.content}</div>
                                        <div class="comment-time">${this.formatTimeAgo(comment.timestamp)}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            `).join('');

            // Réinitialiser les flags d'animation après le rendu
            this.state.posts.forEach(post => post.animate = false);
        },

        // Animation de like
        async animateLike(postId) {
            const post = this.state.posts.find(p => p.id === postId);
            if (!post) return;

            const likeBtn = document.querySelector(`[data-post-id="${postId}"] .like-btn`);
            if (!likeBtn) return;

            // Animation de base
            likeBtn.classList.add('animate__animated', 'animate__pulse');
            
            // Animation spéciale pour like/dislike
            if (!post.liked) {
                likeBtn.classList.add('animate__heartBeat');
            }

            // Attendre la fin de l'animation avant de mettre à jour
            await new Promise(resolve => {
                likeBtn.addEventListener('animationend', () => {
                    likeBtn.classList.remove('animate__animated', 'animate__pulse', 'animate__heartBeat');
                    resolve();
                }, { once: true });
            });

            this.toggleLike(postId);
        },

        // Basculer like
        toggleLike(postId) {
            const post = this.state.posts.find(p => p.id === postId);
            if (!post) return;

            post.liked = !post.liked;
            post.likes += post.liked ? 1 : -1;
            
            this.updatePost(postId);
        },

        // Gestion nouveau post
        async handleNewPost() {
            const contentInput = document.getElementById('new-post-content');
            const content = contentInput?.value.trim();
            
            if (!content) {
                await this.animateElement(contentInput, 'shakeX');
                contentInput?.focus();
                return;
            }

            const newPost = {
                id: Date.now(),
                author: this.state.currentUser.name,
                avatar: this.state.currentUser.avatar,
                content: content,
                timestamp: new Date().toISOString(),
                likes: 0,
                comments: [],
                liked: false,
                animate: true
            };

            // Animation de chargement
            this.state.isLoading = true;
            this.updateUI();
            
            // Simulation d'envoi au serveur
            await new Promise(resolve => setTimeout(resolve, 500));

            this.state.posts.unshift(newPost);
            contentInput.value = '';
            this.state.isLoading = false;
            
            // Re-render et animation spéciale
            this.renderPosts();
            await this.animateElement(
                document.querySelector(`[data-post-id="${newPost.id}"]`), 
                'bounceIn'
            );
        },

        // Mettre à jour un post spécifique
        updatePost(postId) {
            const postElement = document.querySelector(`[data-post-id="${postId}"]`);
            if (!postElement) return;

            const post = this.state.posts.find(p => p.id === postId);
            if (!post) return;

            // Mise à jour des éléments du DOM
            const likeBtn = postElement.querySelector('.like-btn');
            const likeCount = postElement.querySelector('.like-count');
            
            likeBtn?.classList.toggle('liked', post.liked);
            likeCount?.textContent = post.likes;
        },

        // Basculer le mode sombre
        toggleDarkMode() {
            this.state.darkMode = !this.state.darkMode;
            localStorage.setItem('darkMode', this.state.darkMode);
            
            document.documentElement.classList.toggle('dark-mode', this.state.darkMode);
            this.animateElement(document.documentElement, 'fadeIn');
        },

        // Fonction helper pour les animations
        animateElement(element, animation = 'fadeIn') {
            return new Promise((resolve) => {
                if (!element || !this.state.animationsEnabled) {
                    resolve();
                    return;
                }

                element.classList.add('animate__animated', `animate__${animation}`);
                
                const handleAnimationEnd = () => {
                    element.classList.remove('animate__animated', `animate__${animation}`);
                    element.removeEventListener('animationend', handleAnimationEnd);
                    resolve();
                };

                element.addEventListener('animationend', handleAnimationEnd, { once: true });
            });
        },

        // Formatage de la date
        formatTimeAgo(timestamp) {
            const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
            
            const intervals = {
                an: 31536000,
                mois: 2592000,
                semaine: 604800,
                jour: 86400,
                heure: 3600,
                minute: 60
            };
            
            for (const [unit, secondsInUnit] of Object.entries(intervals)) {
                const interval = Math.floor(seconds / secondsInUnit);
                if (interval >= 1) {
                    return `il y a ${interval} ${unit}${interval === 1 ? '' : 's'}`;
                }
            }
            
            return 'à l\'instant';
        },

        // Mise à jour de l'UI
        updateUI() {
            // Mise à jour du loader
            const loader = document.getElementById('loader');
            if (loader) {
                loader.style.display = this.state.isLoading ? 'flex' : 'none';
            }

            // Mise à jour de l'avatar utilisateur
            const userAvatar = document.getElementById('user-avatar');
            if (userAvatar) {
                userAvatar.src = this.state.currentUser.avatar;
                userAvatar.alt = this.state.currentUser.name;
            }

            // Mise à jour du thème
            const themeIcon = document.getElementById('theme-icon');
            if (themeIcon) {
                themeIcon.className = this.state.darkMode ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    };

    // Démarrer l'application
    app.init();
});