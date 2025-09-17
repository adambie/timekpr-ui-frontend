function getToken() {
    return localStorage.getItem('jwt_token');
}

function setToken(token) {
    localStorage.setItem('jwt_token', token);
}

function removeToken() {
    localStorage.removeItem('jwt_token');
}

function isTokenExpired(token) {
    if (!token) return true;
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        return payload.exp < currentTime;
    } catch (error) {
        return true;
    }
}

async function login(username, password) {
    const result = await apiCall('/login', 'POST', { username, password });
    
    if (result && result.success && result.token) {
        setToken(result.token);
        currentUser = username;
        showDashboard();
        return true;
    } else {
        return result ? result.message : 'Login failed';
    }
}

async function logout() {
    removeToken();
    currentUser = null;
    showLogin();
}

async function checkSession() {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
        removeToken();
        return false;
    }
    
    const result = await apiCall('/dashboard');
    if (result && result.success) {
        currentUser = 'admin';
        showDashboard();
        return true;
    } else {
        removeToken();
        return false;
    }
}