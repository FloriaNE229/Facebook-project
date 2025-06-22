import api from './api.js';

export default {
    currentUser: null,
    posts: [],

    async init() {
        try {
            this.currentUser = await api.get('/me');
            this.posts = await api.get('/posts');
        } catch (error) {
            console.error("Store init failed:", error);
        }
    },

    // Exemple de méthode métier
    async likePost(postId) {
        await api.post(`/posts/${postId}/like`);
        this.posts.find(p => p.id === postId).likes++;
    }
};