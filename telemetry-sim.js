"use strict";

/**
 * Global cache for Telemetry simulation DOM elements.
 * @type {Object<string, HTMLElement>}
 */
const DOM_TELEMETRY = {};

/**
 * Initializes DOM elements cache for telemetry outputs.
 */
function initTelemetryDOMCache() {
    DOM_TELEMETRY.solar = document.getElementById('gaugeSolar');
    DOM_TELEMETRY.waste = document.getElementById('gaugeWaste');
    DOM_TELEMETRY.water = document.getElementById('gaugeWater');
    DOM_TELEMETRY.offset = document.getElementById('gaugeOffset');
    DOM_TELEMETRY.alertsContainer = document.getElementById('alertsContainer');
    DOM_TELEMETRY.attendanceVal = document.getElementById('attendanceVal');
    
    // Live forecast nodes
    DOM_TELEMETRY.valPredCon = document.getElementById('valPredCon');
    DOM_TELEMETRY.valPredHvac = document.getElementById('valPredHvac');
    DOM_TELEMETRY.valPredEco = document.getElementById('valPredEco');
    DOM_TELEMETRY.valPredTransit = document.getElementById('valPredTransit');
}

/**
 * Calibrates sustainability circular gauges stroke offsets during load.
 */
window.initCircularGauges = function() {
    if (DOM_TELEMETRY.solar) DOM_TELEMETRY.solar.style.strokeDashoffset = 220 - (220 * 0.88);
    if (DOM_TELEMETRY.waste) DOM_TELEMETRY.waste.style.strokeDashoffset = 220 - (220 * 0.78);
    if (DOM_TELEMETRY.water) DOM_TELEMETRY.water.style.strokeDashoffset = 220 - (220 * 0.84);
    if (DOM_TELEMETRY.offset) DOM_TELEMETRY.offset.style.strokeDashoffset = 220 - (220 * 0.92);
};

/**
 * Prepeands a localized alert event directly to the live console ticker.
 * @param {string} source - Component reporting alert.
 * @param {string} message - Content of alert.
 */
window.addAlertLogEntry = function(source, message) {
    if (!DOM_TELEMETRY.alertsContainer) return;

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
    msgDiv.textContent = message; // Safe textContent parsing to prevent XSS
    
    entry.appendChild(meta);
    entry.appendChild(msgDiv);
    
    DOM_TELEMETRY.alertsContainer.prepend(entry);
};

/**
 * Starts live interval callbacks simulating hardware updates, crowd sizes, and GenAI predictions.
 */
window.startLiveTelemetryUpdates = function() {
    setInterval(() => {
        // 1. Attendance updates
        if (DOM_TELEMETRY.attendanceVal) {
            const baseAttendance = 78400 + Math.floor(Math.random() * 120);
            DOM_TELEMETRY.attendanceVal.textContent = `${baseAttendance.toLocaleString()} / 80,000`;
        }
        
        // 2. Solar grid fluctuation
        if (DOM_TELEMETRY.solar) {
            if (Math.random() > 0.6) {
                const solarPerc = 0.85 + Math.random() * 0.05;
                DOM_TELEMETRY.solar.style.strokeDashoffset = 220 - (220 * solarPerc);
                const valField = DOM_TELEMETRY.solar.parentElement.nextElementSibling.nextElementSibling;
                if (valField) {
                    valField.textContent = `${Math.floor(2800 + Math.random()*100)} kWh`;
                }
            }
        }

        // 3. GenAI Live Forecast updates (fluctuations)
        if (DOM_TELEMETRY.valPredCon) {
            const waitTime = 3 + Math.floor(Math.random() * 4);
            DOM_TELEMETRY.valPredCon.textContent = `Section 104: ${waitTime}m (Normal)`;
        }
        
        if (DOM_TELEMETRY.valPredHvac) {
            const hvacTemp = (20.5 + Math.random() * 1.5).toFixed(1);
            DOM_TELEMETRY.valPredHvac.textContent = `Sec 208 Cooling: ${hvacTemp}°C (Nominal)`;
        }

        if (DOM_TELEMETRY.valPredEco) {
            const co2Offset = (1.3 + Math.random() * 0.2).toFixed(2);
            DOM_TELEMETRY.valPredEco.textContent = `Est. Peak today: ${co2Offset} Tons CO₂`;
        }

        if (DOM_TELEMETRY.valPredTransit) {
            const delayTime = 3 + Math.floor(Math.random() * 5);
            DOM_TELEMETRY.valPredTransit.textContent = `Bus B1: Delay to ${delayTime}m`;
        }
    }, 4000);
};

// Bind elements on load
document.addEventListener('DOMContentLoaded', () => {
    // Initialise caching
    initTelemetryDOMCache();
});
