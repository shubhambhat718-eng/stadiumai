"use strict";

/**
 * Global cache for Incident Command Center DOM elements.
 * @type {Object<string, HTMLElement>}
 */
const DOM_INCIDENT = {};

/**
 * Initializes the DOM cache elements for the incident command dashboard.
 */
function initIncidentDOMCache() {
    DOM_INCIDENT.actionActiveName = document.getElementById('actionActiveName');
    DOM_INCIDENT.actionActiveDesc = document.getElementById('actionActiveDesc');
    DOM_INCIDENT.actionActiveBtn = document.getElementById('actionActiveBtn');
    DOM_INCIDENT.genaiRecommendationText = document.getElementById('genaiRecommendationText');
    DOM_INCIDENT.commandGrid = document.getElementById('commandGrid');
}

let selectedBoxName = 'North Gate';
let selectedBoxType = 'clear_queue';
let selectedBoxDesc = 'Queue overflow > 15m. Reroute volunteers to Gate B.';
let selectedBoxBtnText = 'Clear Queue';

/**
 * Logs incident commands to standard console or alert feeds.
 * @param {string} source - Action origin (e.g. VIP ROOT, VOLUNTEER OP).
 * @param {string} message - Operation event details.
 */
function logToConsole(source, message) {
    if (window.addAlertLogEntry) {
        window.addAlertLogEntry(source, message);
    } else {
        console.log(`[${source}] ${message}`);
    }
}

/**
 * Activates console zone selection, toggling selections and caching options.
 * @param {HTMLElement} el - Selected box element cell.
 * @param {string} name - Zone name.
 * @param {string} desc - Alert description.
 * @param {string} actionType - Resolution identifier.
 * @param {string} buttonText - Resolution button text.
 */
window.selectConsoleBox = function(el, name, desc, actionType, buttonText) {
    const boxes = DOM_INCIDENT.commandGrid ? DOM_INCIDENT.commandGrid.querySelectorAll('.status-box') : [];
    boxes.forEach(box => {
        box.classList.remove('selected');
        box.setAttribute('aria-selected', 'false'); // Accessibility selection update
    });
    
    el.classList.add('selected');
    el.setAttribute('aria-selected', 'true');
    
    selectedBoxName = name;
    selectedBoxType = actionType;
    selectedBoxDesc = desc;
    selectedBoxBtnText = buttonText;
    
    if (DOM_INCIDENT.actionActiveName) DOM_INCIDENT.actionActiveName.textContent = name;
    if (DOM_INCIDENT.actionActiveDesc) DOM_INCIDENT.actionActiveDesc.textContent = desc;
    
    if (DOM_INCIDENT.actionActiveBtn) {
        DOM_INCIDENT.actionActiveBtn.textContent = buttonText;
        DOM_INCIDENT.actionActiveBtn.disabled = false;
    }

    // Refresh GenAI recommendation
    window.updateIncidentRecommendation();
};

/**
 * Executes operations command resolving protocol with clearance role checking.
 */
window.triggerConsoleAction = function() {
    if (!DOM_INCIDENT.actionActiveBtn) return;
    
    // SECURITY ACCESS CONTROL & ROLE CHECK
    if (window.activeClearance === 'fan') {
        alert("Unauthorized Access: Fan accounts are blocked from triggering operations console actions.");
        DOM_INCIDENT.actionActiveBtn.textContent = "Failed (Unauthorized)";
        return;
    }
    
    const isVIPAction = (selectedBoxType === 'adjust_hvac' || selectedBoxType === 'check_sensors');
    if (isVIPAction && window.activeClearance !== 'vip') {
        alert(`Access Denied: Action [${selectedBoxBtnText}] requires VIP Command Clearance (Root Auth).`);
        DOM_INCIDENT.actionActiveBtn.textContent = "VIP Required 🔒";
        setTimeout(() => {
            if (DOM_INCIDENT.actionActiveBtn) {
                DOM_INCIDENT.actionActiveBtn.textContent = selectedBoxBtnText;
                DOM_INCIDENT.actionActiveBtn.disabled = false;
            }
        }, 2000);
        return;
    }
    
    DOM_INCIDENT.actionActiveBtn.textContent = "Executing...";
    DOM_INCIDENT.actionActiveBtn.disabled = true;
    
    setTimeout(() => {
        if (DOM_INCIDENT.actionActiveBtn) DOM_INCIDENT.actionActiveBtn.textContent = "Complete ✅";
        
        const sourceLabel = window.activeClearance === 'fan' ? "GUEST DISPATCH" : 
                            window.activeClearance === 'volunteer' ? "VOLUNTEER OP" : "VIP ROOT";
        
        logToConsole(sourceLabel, `Executed resolving protocol for [${selectedBoxName}] - Action: ${selectedBoxType.toUpperCase()}`);
        
        // Update status tag of the box to ok (Normal)
        const activeBoxes = DOM_INCIDENT.commandGrid ? DOM_INCIDENT.commandGrid.querySelectorAll('.status-box') : [];
        activeBoxes.forEach(box => {
            const labelEl = box.querySelector('.status-box-lbl');
            if (labelEl && labelEl.textContent === selectedBoxName) {
                const tag = box.querySelector('.status-tag');
                if (tag) {
                    tag.className = "status-tag ok";
                    tag.textContent = "Normal";
                }
            }
        });
        
        setTimeout(() => {
            if (DOM_INCIDENT.actionActiveBtn) DOM_INCIDENT.actionActiveBtn.textContent = "Audit Logged";
        }, 1500);
    }, 1000);
};

/**
 * Updates GenAI Decision Support Recommendation card.
 */
window.updateIncidentRecommendation = function() {
    if (!DOM_INCIDENT.genaiRecommendationText) return;
    
    if (window.activeClearance === 'fan') {
        DOM_INCIDENT.genaiRecommendationText.textContent = "Access Denied: Please authorize operations credentials.";
        return;
    }
    
    let rec = "";
    if (selectedBoxName === 'North Gate') {
        rec = "AI analysis indicates turnstile bottleneck. Rerouting volunteer guide teams from South Parking (occupancy stable) will reduce Gate B queue pressure by an estimated 18% in under 10 minutes.";
    } else if (selectedBoxName === 'Section 104') {
        rec = "HVAC sensor anomaly detected (+2°C). Recommended: Adjust baffle valves dynamically to increase localized velocity. No solar grid battery draw is required.";
    } else if (selectedBoxName === 'Section 208') {
        rec = "Heat spike anomaly (+4°C) requires active cooling unit recalibration. Rerouting auxiliary graywater loop cooling loops to chiller 3 will accelerate return-to-nominal by 6 minutes.";
    } else if (selectedBoxName === 'Restrooms W2') {
        rec = "Water pressure drops suggest filtration blockages. Dispatched plumber requires digital telemetry reset. Action will prevent greywater filtration cycle collapse.";
    } else if (selectedBoxName === 'Solar Roof') {
        rec = "Peak irradiance loop active. Running grid audit maps power distribution load, optimizing local energy storage offsets by 0.12 Tons CO2.";
    } else if (selectedBoxName === 'Medical Stn 1') {
        rec = "Sensory room occupancy levels nominal. Run rotation audit to verify standby emergency personnel availability for next match prep.";
    } else if (selectedBoxName === 'Shuttle Hub') {
        rec = "Expressway congestion is adding 4 mins transit delay. Recommended: Reroute incoming Bus B1 through northern auxiliary corridor via GPS bypass.";
    } else if (selectedBoxName === 'South Parking') {
        rec = "Parking capacity is stabilizing. Broadcast sign update to parking portals to distribute vehicles towards Underpass Gate.";
    } else {
        rec = "Analyzing real-time stadium sensors... telemetry is nominal. Select an active incident zone to query operational recommendation.";
    }
    
    DOM_INCIDENT.genaiRecommendationText.textContent = rec;
};

// Bind elements on load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize element references
    initIncidentDOMCache();

    if (DOM_INCIDENT.commandGrid) {
        DOM_INCIDENT.commandGrid.querySelectorAll('.status-box').forEach(box => {
            box.addEventListener('click', () => {
                const name = box.getAttribute('data-name');
                const desc = box.getAttribute('data-desc');
                const action = box.getAttribute('data-action');
                const btnText = box.getAttribute('data-btn-text');
                window.selectConsoleBox(box, name, desc, action, btnText);
            });
            box.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const name = box.getAttribute('data-name');
                    const desc = box.getAttribute('data-desc');
                    const action = box.getAttribute('data-action');
                    const btnText = box.getAttribute('data-btn-text');
                    window.selectConsoleBox(box, name, desc, action, btnText);
                }
            });
        });
    }

    if (DOM_INCIDENT.actionActiveBtn) {
        DOM_INCIDENT.actionActiveBtn.addEventListener('click', () => {
            window.triggerConsoleAction();
        });
    }

    // Load initial recommendation
    window.updateIncidentRecommendation();
});

// Export for Jest testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { selectedBoxName, selectedBoxType, logToConsole };
}
