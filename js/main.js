document.addEventListener('DOMContentLoaded', async function() {
    initializeTheme();
    
    const isLoggedIn = await checkSession();
    if (isLoggedIn) {
        return;
    }
    
    document.getElementById('login-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('login-error');
        
        const result = await login(username, password);
        
        if (result !== true) {
            errorDiv.textContent = result;
            errorDiv.style.display = 'block';
        } else {
            errorDiv.style.display = 'none';
        }
    });
    
    document.getElementById('add-user-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('new-username').value;
        const systemIp = document.getElementById('new-system-ip').value;
        
        await addUser(username, systemIp);
    });
    
    document.getElementById('password-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        await changePassword(currentPassword, newPassword, confirmPassword);
    });
    
    showLogin();
});