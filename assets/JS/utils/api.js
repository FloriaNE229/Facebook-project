// Helper pour les headers
const getAuthHeader = () => ({
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
});

export default {
    async get(endpoint) {
        const response = await fetch(`/api${endpoint}`, {
            headers: getAuthHeader()
        });
        if (!response.ok) throw new Error(await response.text());
        return response.json();
    },

    async post(endpoint, data) {
        const response = await fetch(`/api${endpoint}`, {
            method: 'POST',
            headers: { 
                ...getAuthHeader(),
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(await response.text());
        return response.json();
    }
};