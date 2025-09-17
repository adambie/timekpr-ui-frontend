async function showAdmin() {
    showPage('admin-page');
    
    const result = await apiCall('/admin');
    const content = document.getElementById('admin-content');
    
    if (result && result.success) {
        content.innerHTML = renderAdmin(result.users);
    } else {
        content.innerHTML = '<div class="alert alert-danger">Failed to load admin data</div>';
    }
}

function renderAdmin(users) {
    if (!users || users.length === 0) {
        return '<div class="alert alert-info">No users found.</div>';
    }
    
    return `
        <div class="card">
            <div class="card-header">
                <h5>Managed Users</h5>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>System IP</th>
                                <th>Status</th>
                                <th>Last Checked</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${users.map(user => `
                                <tr>
                                    <td>${user.username}</td>
                                    <td>${user.system_ip}</td>
                                    <td>
                                        <span class="badge bg-${user.is_valid ? 'success' : 'danger'}">
                                            ${user.is_valid ? 'Valid' : 'Invalid'}
                                        </span>
                                    </td>
                                    <td>${user.last_checked}</td>
                                    <td>
                                        <button class="btn btn-sm btn-primary" onclick="validateUser(${user.id})">Validate</button>
                                        <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id}, '${user.username}')">Delete</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

async function addUser(username, systemIp) {
    const result = await apiCall('/users/add', 'POST', {
        username,
        system_ip: systemIp
    });
    
    if (result && result.success) {
        showAlert(result.message, 'success');
        document.getElementById('add-user-form').reset();
        setTimeout(showAdmin, 1000);
    } else {
        showAlert(result ? result.message : 'Failed to add user', 'danger');
    }
}

async function validateUser(userId) {
    const result = await apiCall(`/users/validate/${userId}`);
    
    if (result && result.success) {
        showAlert(result.message, 'success');
        setTimeout(showAdmin, 1000);
    } else {
        showAlert(result ? result.message : 'Failed to validate user', 'danger');
    }
}

async function deleteUser(userId, username) {
    if (confirm(`Are you sure you want to delete user "${username}"?`)) {
        const result = await apiCall(`/users/delete/${userId}`, 'POST');
        
        if (result && result.success) {
            showAlert(result.message, 'success');
            setTimeout(showAdmin, 1000);
        } else {
            showAlert(result ? result.message : 'Failed to delete user', 'danger');
        }
    }
}