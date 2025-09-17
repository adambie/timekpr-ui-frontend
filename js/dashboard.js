async function showDashboard() {
    showPage('dashboard-page');
    
    const sshStatus = await apiCall('/ssh-status');
    if (sshStatus && sshStatus.success && !sshStatus.ssh_key_exists) {
        showNotification(sshStatus.message, 'warning');
    }
    
    const result = await apiCall('/dashboard');
    const content = document.getElementById('dashboard-content');
    
    if (result && result.success) {
        const usersWithSyncStatus = await Promise.all(
            result.users.map(async (user) => {
                const scheduleResult = await apiCall(`/schedule-sync-status/${user.id}`);
                return {
                    ...user,
                    isScheduleSynced: scheduleResult && scheduleResult.success ? scheduleResult.is_synced : true,
                    lastScheduleSync: scheduleResult && scheduleResult.success ? scheduleResult.last_synced : null,
                    lastScheduleModified: scheduleResult && scheduleResult.success ? scheduleResult.last_modified : null
                };
            })
        );
        
        content.innerHTML = renderDashboard(usersWithSyncStatus, sshStatus);
        
        if (usersWithSyncStatus && usersWithSyncStatus.length > 0) {
            usersWithSyncStatus.forEach(user => {
                setTimeout(async () => await initializeChart(user), 100);
            });
        }
    } else {
        content.innerHTML = '<div class="alert alert-danger">Failed to load dashboard data</div>';
    }
}

async function initializeChart(user) {
    const canvas = document.getElementById(`chart-${user.id}`);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const result = await apiCall(`/user/${user.id}/usage`);
    
    let labels = [];
    let values = [];
    
    if (result && result.success && result.data) {
        result.data.forEach(dayData => {
            const date = new Date(dayData.date);
            const isToday = date.toDateString() === new Date().toDateString();
            const label = isToday ? 'Today' : date.toLocaleDateString('en', { weekday: 'short', day: 'numeric' });
            labels.push(label);
            values.push(dayData.hours);
        });
    } else {
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const isToday = i === 6;
            const label = isToday ? 'Today' : date.toLocaleDateString('en', { weekday: 'short', day: 'numeric' });
            labels.push(label);
            values.push(0);
        }
    }
    
    const maxValue = Math.max(...values, 1);
    const yAxisMax = Math.ceil(maxValue);
    const stepSize = yAxisMax <= 4 ? 0.5 : 1;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Hours Used',
                data: values,
                backgroundColor: function(context) {
                    const index = context.dataIndex;
                    const weekday = labels[index];
                    if (weekday === 'Sat' || weekday === 'Sun') {
                        return 'rgb(245 158 11 / 0.6)';
                    }
                    return 'rgb(59 130 246 / 0.6)';
                },
                borderColor: function(context) {
                    const index = context.dataIndex;
                    const weekday = labels[index];
                    if (weekday === 'Sat' || weekday === 'Sun') {
                        return 'rgb(245 158 11)';
                    }
                    return 'rgb(59 130 246)';
                },
                borderWidth: 2,
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: yAxisMax,
                    ticks: {
                        stepSize: stepSize,
                        color: 'rgb(100 116 139)',
                        font: { size: 11 },
                        callback: function(value) {
                            if (value === 0) return '0h';
                            if (value < 1) {
                                const minutes = Math.round(value * 60);
                                return `${minutes}m`;
                            }
                            if (value % 1 === 0) {
                                return `${value}h`;
                            }
                            const hours = Math.floor(value);
                            const minutes = Math.round((value % 1) * 60);
                            return `${hours}h${minutes}m`;
                        }
                    },
                    title: {
                        display: true,
                        text: 'Hours',
                        color: 'rgb(100 116 139)',
                        font: { size: 12, weight: '500' }
                    },
                    grid: {
                        color: 'rgb(226 232 240 / 0.5)',
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        color: function(context) {
                            const weekday = labels[context.index];
                            if (weekday === 'Sat' || weekday === 'Sun') {
                                return 'rgb(245 158 11)';
                            }
                            return 'rgb(100 116 139)';
                        },
                        font: { size: 12, weight: '600' }
                    }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const hours = context.parsed.y;
                            const minutes = Math.round((hours % 1) * 60);
                            const wholeHours = Math.floor(hours);
                            
                            if (minutes === 0) {
                                return `${wholeHours}h 0m`;
                            } else {
                                return `${wholeHours}h ${minutes}m`;
                            }
                        }
                    }
                }
            }
        }
    });
}

function renderDashboard(users, sshStatus = null) {
    let content = '';
    
    if (sshStatus && sshStatus.success && !sshStatus.ssh_key_exists) {
        content += `
            <div class="alert alert-warning" style="grid-column: 1 / -1; margin-bottom: var(--space-6);">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                </svg>
                ${sshStatus.message}
            </div>
        `;
    }
    
    if (!users || users.length === 0) {
        content += '<div class="empty-state" style="grid-column: 1 / -1;"><h2>No Users Available</h2><p>No valid users have been added yet. Go to the Admin Panel to add and manage users.</p><button class="btn btn-primary btn-lg" onclick="showAdmin()">Go to Admin Panel</button></div>';
        return content;
    }
    
    content += users.map(user => `
        <div class="user-card">
            <div class="user-card-header">
                <div class="user-info">
                    <h2 class="user-name">${user.username}</h2>
                    <p class="user-location">${user.system_ip}</p>
                </div>
                <div class="sync-status">
                    ${user.pending_schedule || !user.isScheduleSynced ? `
                        <div class="badge badge-warning">
                            <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                            </svg>
                            Schedule Not Synced
                        </div>
                    ` : `
                        <div class="badge badge-success">
                            <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.061L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                            </svg>
                            Schedule Synced
                        </div>
                    `}
                </div>
            </div>
            <div class="user-card-body">
                <div class="user-stats">
                    <div class="stat-item">
                        <div class="stat-label">Time Left Today</div>
                        <div class="stat-value">${user.time_left || 'Unknown'}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Last Updated</div>
                        <div class="stat-value">${user.last_checked || 'Never'}</div>
                    </div>
                </div>
                
                ${user.pending_adjustment ? `
                <div class="badge badge-warning" style="margin-bottom: var(--space-4);">
                    <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                    </svg>
                    Pending Time: ${user.pending_adjustment}
                </div>
                ` : ''}
                ${user.pending_schedule ? `
                <div class="badge badge-warning" style="margin-bottom: var(--space-4);">
                    <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                        <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                    </svg>
                    Pending Schedule
                </div>
                ` : ''}
                
                <div class="user-actions">
                    <button class="btn btn-primary" onclick="openTimeAdjustModal(${user.id}, '${user.username}')">Adjust Time</button>
                    <button class="btn btn-secondary" onclick="showSchedule(${user.id})">Schedule</button>
                </div>
                
                <div class="user-chart">
                    <h4 class="chart-title">Usage This Week</h4>
                    <div class="chart-container">
                        <canvas id="chart-${user.id}"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    return content;
}