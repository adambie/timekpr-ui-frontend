function showAlert(message, type = 'info') {
    showNotification(message, type === 'danger' ? 'error' : type);
}

async function apiCall(endpoint, method = 'GET', data = null) {
    const config = {
        method,
        headers: {
            'Content-Type': 'application/json',
        }
    };
    
    if (endpoint !== '/login') {
        const token = getToken();
        if (token && !isTokenExpired(token)) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    
    if (data) {
        config.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const result = await response.json();
        
        if (response.status === 401) {
            removeToken();
            showLogin();
            return null;
        }
        
        return result;
    } catch (error) {
        console.error('API call failed:', error);
        showAlert('Connection error. Please check if the backend server is running.', 'danger');
        return null;
    }
}