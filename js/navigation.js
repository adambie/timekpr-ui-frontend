function showPage(pageId) {
    document.querySelectorAll('[id$="-page"]').forEach(page => {
        page.classList.add('hidden');
    });
    
    document.getElementById(pageId).classList.remove('hidden');
    currentPage = pageId.replace('-page', '');
}

function showLogin() {
    showPage('login-page');
    
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    
    document.getElementById('login-error').style.display = 'none';
}

async function showSettings() {
    showPage('settings-page');
}

async function changePassword(currentPassword, newPassword, confirmPassword) {
    if (newPassword !== confirmPassword) {
        showAlert('New passwords do not match', 'danger');
        return;
    }
    
    const result = await apiCall('/change-password', 'POST', {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
    });
    
    const messageDiv = document.getElementById('password-message');
    
    if (result && result.success) {
        messageDiv.innerHTML = '<div class="alert alert-success">Password changed successfully</div>';
        document.getElementById('password-form').reset();
    } else {
        messageDiv.innerHTML = `<div class="alert alert-danger">${result ? result.message : 'Failed to change password'}</div>`;
    }
}