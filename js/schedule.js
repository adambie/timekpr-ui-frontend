async function showSchedule(userId) {
    const result = await apiCall(`/schedule-sync-status/${userId}`);
    
    if (result && result.success) {
        const schedule = result.schedule || {
            hours: { monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0, saturday: 0, sunday: 0 },
            intervals: { 
                monday: { start_time: '00:00', end_time: '23:59' },
                tuesday: { start_time: '00:00', end_time: '23:59' },
                wednesday: { start_time: '00:00', end_time: '23:59' },
                thursday: { start_time: '00:00', end_time: '23:59' },
                friday: { start_time: '00:00', end_time: '23:59' },
                saturday: { start_time: '00:00', end_time: '23:59' },
                sunday: { start_time: '00:00', end_time: '23:59' }
            }
        };
        
        const user = document.querySelector(`[onclick*="showSchedule(${userId})"]`)?.closest('.user-card')?.querySelector('.user-name')?.textContent || 'User';
        
        document.getElementById('scheduleModalUsername').textContent = user;
        document.getElementById('scheduleUserId').value = userId;
        
        // Set checkbox state based on whether time ranges are non-default
        const hasCustomTimeRanges = Object.values(schedule.intervals || {}).some(interval => 
            interval.start_time !== '00:00' || interval.end_time !== '23:59'
        );
        document.getElementById('enable-time-ranges').checked = hasCustomTimeRanges;
        
        const scheduleRows = document.getElementById('schedule-rows');
        scheduleRows.innerHTML = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => {
            const dayKey = day.toLowerCase();
            const isWeekend = index >= 5;
            
            const intervals = schedule.intervals || {};
            const dayInterval = intervals[dayKey] || { start_time: '00:00', end_time: '23:59' };
            
            return `
                <div class="schedule-row" style="padding: var(--space-4) var(--space-6); display: grid; grid-template-columns: 120px 1fr 1fr; gap: var(--space-4); align-items: center; border-bottom: 1px solid var(--border-primary); transition: background-color var(--transition-fast); ${index === 6 ? 'border-bottom: none;' : ''}">
                    <div style="font-weight: 600; color: ${isWeekend ? 'var(--warning)' : 'var(--text-primary)'}; font-size: var(--font-size-base);">${day}</div>
                    
                    <div style="display: flex; align-items: center; gap: var(--space-3);">
                        <div style="display: flex; align-items: center; gap: var(--space-2);">
                            <button type="button" onclick="adjustScheduleTime('${dayKey}', -0.25)" style="width: 32px; height: 32px; border: 1px solid var(--border-primary); background: var(--bg-elevated); color: var(--text-primary); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; cursor: pointer; font-weight: 600;">−</button>
                            <input type="number" 
                                   id="${dayKey}" 
                                   name="${dayKey}" 
                                   value="${schedule.hours[dayKey] || 0}" 
                                   min="0" 
                                   max="24" 
                                   step="0.25" 
                                   style="width: 80px; padding: var(--space-2) var(--space-3); border: 1px solid var(--border-primary); border-radius: var(--radius-md); background: var(--bg-primary); color: var(--text-primary); text-align: center; font-size: var(--font-size-base); font-weight: 500;">
                            <button type="button" onclick="adjustScheduleTime('${dayKey}', 0.25)" style="width: 32px; height: 32px; border: 1px solid var(--border-primary); background: var(--bg-elevated); color: var(--text-primary); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; cursor: pointer; font-weight: 600;">+</button>
                        </div>
                        <span style="font-size: var(--font-size-sm); color: var(--text-tertiary); min-width: 40px;">hours</span>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: var(--space-2);">
                        <input type="time" 
                               id="${dayKey}_start_time" 
                               name="${dayKey}_start_time" 
                               value="${dayInterval.start_time}" 
                               style="padding: var(--space-2) var(--space-3); border: 1px solid var(--border-primary); border-radius: var(--radius-md); background: var(--bg-primary); color: var(--text-primary); font-size: var(--font-size-base);">
                        <span style="color: var(--text-tertiary); font-weight: 600;">to</span>
                        <input type="time" 
                               id="${dayKey}_end_time" 
                               name="${dayKey}_end_time" 
                               value="${dayInterval.end_time}" 
                               style="padding: var(--space-2) var(--space-3); border: 1px solid var(--border-primary); border-radius: var(--radius-md); background: var(--bg-primary); color: var(--text-primary); font-size: var(--font-size-base);">
                    </div>
                </div>
            `;
        }).join('');
        
        document.getElementById('scheduleModalStatus').innerHTML = '';
        
        document.getElementById('scheduleModal').classList.add('active');
    } else {
        showNotification('Failed to load schedule data', 'error');
    }
}

function adjustScheduleTime(dayId, change) {
    const input = document.getElementById(dayId);
    let currentValue = parseFloat(input.value) || 0;
    let newValue = Math.max(0, Math.min(24, currentValue + change));
    input.value = newValue;
}

function setWeekdays() {
    const hours = document.getElementById('bulk-hours').value;
    if (!hours) return;
    ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
        document.getElementById(day).value = hours;
    });
}

function setWeekends() {
    const hours = document.getElementById('bulk-hours').value;
    if (!hours) return;
    ['saturday', 'sunday'].forEach(day => {
        document.getElementById(day).value = hours;
    });
}

function setAllDays() {
    const hours = document.getElementById('bulk-hours').value;
    if (!hours) return;
    ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(day => {
        document.getElementById(day).value = hours;
    });
}

function adjustBulkTime(change) {
    const input = document.getElementById('bulk-hours');
    let currentValue = parseFloat(input.value) || 0;
    let newValue = Math.max(0, Math.min(24, currentValue + change));
    input.value = newValue;
}

function setTimeRangeAll() {
    const startTime = document.getElementById('bulk-start-time').value;
    const endTime = document.getElementById('bulk-end-time').value;
    
    if (!startTime || !endTime) {
        showNotification('Please enter both start and end times', 'warning');
        return;
    }
    
    if (startTime >= endTime) {
        showNotification('Start time must be before end time', 'warning');
        return;
    }
    
    ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(day => {
        document.getElementById(`${day}_start_time`).value = startTime;
        document.getElementById(`${day}_end_time`).value = endTime;
    });
    
    showNotification(`Time range ${startTime} - ${endTime} applied to all days`, 'success');
}

function closeScheduleModal() {
    document.getElementById('scheduleModal').classList.remove('active');
    document.getElementById('scheduleModalStatus').innerHTML = '';
}

async function submitSchedule() {
    const userId = document.getElementById('scheduleUserId').value;
    const scheduleData = {
        user_id: parseInt(userId),
        monday: parseFloat(document.getElementById('monday').value || 0),
        tuesday: parseFloat(document.getElementById('tuesday').value || 0),
        wednesday: parseFloat(document.getElementById('wednesday').value || 0),
        thursday: parseFloat(document.getElementById('thursday').value || 0),
        friday: parseFloat(document.getElementById('friday').value || 0),
        saturday: parseFloat(document.getElementById('saturday').value || 0),
        sunday: parseFloat(document.getElementById('sunday').value || 0)
    };

    // Only include time ranges if the checkbox is checked
    const enableTimeRanges = document.getElementById('enable-time-ranges').checked;
    if (enableTimeRanges) {
        scheduleData.monday_start_time = document.getElementById('monday_start_time').value;
        scheduleData.monday_end_time = document.getElementById('monday_end_time').value;
        scheduleData.tuesday_start_time = document.getElementById('tuesday_start_time').value;
        scheduleData.tuesday_end_time = document.getElementById('tuesday_end_time').value;
        scheduleData.wednesday_start_time = document.getElementById('wednesday_start_time').value;
        scheduleData.wednesday_end_time = document.getElementById('wednesday_end_time').value;
        scheduleData.thursday_start_time = document.getElementById('thursday_start_time').value;
        scheduleData.thursday_end_time = document.getElementById('thursday_end_time').value;
        scheduleData.friday_start_time = document.getElementById('friday_start_time').value;
        scheduleData.friday_end_time = document.getElementById('friday_end_time').value;
        scheduleData.saturday_start_time = document.getElementById('saturday_start_time').value;
        scheduleData.saturday_end_time = document.getElementById('saturday_end_time').value;
        scheduleData.sunday_start_time = document.getElementById('sunday_start_time').value;
        scheduleData.sunday_end_time = document.getElementById('sunday_end_time').value;
    }
    
    console.log('Saving schedule:', scheduleData);
    
    const statusEl = document.getElementById('scheduleModalStatus');
    statusEl.innerHTML = '<div class="spinner"></div> Saving schedule...';
    statusEl.className = 'text-info';
    
    const result = await apiCall('/schedule/update', 'POST', scheduleData);
    
    if (result && result.success) {
        statusEl.innerHTML = '✓ Schedule saved successfully';
        statusEl.className = 'text-success';
        setTimeout(() => {
            closeScheduleModal();
            showDashboard();
        }, 1000);
    } else {
        const message = result ? result.message : 'Failed to save schedule';
        statusEl.innerHTML = `✗ ${message}`;
        statusEl.className = 'text-danger';
    }
}