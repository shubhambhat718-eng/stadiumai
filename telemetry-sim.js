window.initCircularGauges = function() {
    const solar = document.getElementById('gaugeSolar');
    const waste = document.getElementById('gaugeWaste');
    const water = document.getElementById('gaugeWater');
    const offset = document.getElementById('gaugeOffset');

    if (solar) solar.style.strokeDashoffset = 220 - (220 * 0.88);
    if (waste) waste.style.strokeDashoffset = 220 - (220 * 0.78);
    if (water) water.style.strokeDashoffset = 220 - (220 * 0.84);
    if (offset) offset.style.strokeDashoffset = 220 - (220 * 0.92);
};

window.addAlertLogEntry = function(source, message) {
    const container = document.getElementById('alertsContainer');
    if (!container) return;

    const entry = document.createElement('div');
    entry.className = "alert-entry";
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    const meta = document.createElement('div');
    meta.className = 'alert-meta';
    
    const timeSpan = document.createElement('span');
    timeSpan.className = 'alert-time';
    timeSpan.textContent = time;
    
    const badgeSpan = document.createElement('span');
    badgeSpan.className = 'alert-badge-icon';
    badgeSpan.style.color = 'var(--accent-cyan)';
    badgeSpan.textContent = '🛜 ' + source;
    
    meta.appendChild(timeSpan);
    meta.appendChild(badgeSpan);
    
    const msgDiv = document.createElement('div');
    msgDiv.className = 'alert-msg-text';
    msgDiv.textContent = message;
    
    entry.appendChild(meta);
    entry.appendChild(msgDiv);
    
    container.prepend(entry);
};

window.startLiveTelemetryUpdates = function() {
    setInterval(() => {
        // Attendance updates
        const attendanceVal = document.getElementById('attendanceVal');
        if (attendanceVal) {
            const baseAttendance = 78400 + Math.floor(Math.random() * 120);
            attendanceVal.textContent = `${baseAttendance.toLocaleString()} / 80,000`;
        }
        
        // Solar grid fluctuation
        const solarGauge = document.getElementById('gaugeSolar');
        if (solarGauge) {
            if (Math.random() > 0.6) {
                const solarPerc = 0.85 + Math.random() * 0.05;
                solarGauge.style.strokeDashoffset = 220 - (220 * solarPerc);
                const valField = solarGauge.parentElement.nextElementSibling.nextElementSibling;
                if (valField) {
                    valField.textContent = `${Math.floor(2800 + Math.random()*100)} kWh`;
                }
            }
        }
    }, 4000);
};
