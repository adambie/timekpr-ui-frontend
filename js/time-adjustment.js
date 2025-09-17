let currentUserId = null;
let currentUsername = '';
let timeAdjustment = 0;

function openTimeAdjustModal(userId, username) {
    currentUserId = userId;
    currentUsername = username;
    document.getElementById('modalUsername').textContent = username;
    resetTime();
    document.getElementById('timeAdjustModal').style.display = 'flex';
}

function closeTimeAdjustModal() {
    document.getElementById('timeAdjustModal').style.display = 'none';
    document.getElementById('modalStatus').textContent = '';
    document.getElementById('modalStatus').className = '';
}

function adjustTime(minutes) {
    timeAdjustment += minutes;
    updateTimeDisplay();
}

function resetTime() {
    timeAdjustment = 0;
    updateTimeDisplay();
}

function updateTimeDisplay() {
    const display = document.getElementById('timeAdjustment');
    display.textContent = timeAdjustment;
    
    if (timeAdjustment > 0) {
        display.style.color = 'var(--success)';
    } else if (timeAdjustment < 0) {
        display.style.color = 'var(--danger)';
    } else {
        display.style.color = 'var(--text-primary)';
    }
}

async function submitTimeAdjustment() {
    if (timeAdjustment === 0) {
        showNotification('No time adjustment specified', 'error');
        return;
    }
    
    const seconds = timeAdjustment * 60;
    const operation = seconds > 0 ? '+' : '-';
    const absoluteSeconds = Math.abs(seconds);
    
    const statusEl = document.getElementById('modalStatus');
    statusEl.textContent = 'Applying changes...';
    statusEl.className = 'status-loading';
    
    const result = await apiCall('/modify-time', 'POST', {
        user_id: currentUserId,
        operation,
        seconds: absoluteSeconds
    });
    
    if (result && result.success) {
        statusEl.textContent = 'Success! Time adjusted successfully.';
        statusEl.className = 'status-success';
        
        setTimeout(() => {
            closeTimeAdjustModal();
            showDashboard();
        }, 1500);
    } else {
        statusEl.textContent = `Error: ${result ? result.message : 'Failed to adjust time'}`;
        statusEl.className = 'status-error';
    }
}