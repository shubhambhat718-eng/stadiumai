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
    
    entry.innerHTML = `
        <div class="alert-meta">
            <span class="alert-time">${time}</span>
            <span class="alert-badge-icon" style="color:var(--accent-cyan)">🛜 ${source}</span>
        </div>
        <div class="alert-msg-text">${message}</div>
    `;
    
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
