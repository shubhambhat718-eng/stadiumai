"use strict";

let selectedBoxName = 'North Gate';
let selectedBoxType = 'clear_queue';
let selectedBoxDesc = 'Queue overflow > 15m. Reroute volunteers to Gate B.';
let selectedBoxBtnText = 'Clear Queue';

function logToConsole(source, message) {
    if (window.addAlertLogEntry) {
        window.addAlertLogEntry(source, message);
    } else {
        console.log(`[${source}] ${message}`);
    }
}

window.selectConsoleBox = function(el, name, desc, actionType, buttonText) {
    document.querySelectorAll('.status-box').forEach(box => box.classList.remove('selected'));
    el.classList.add('selected');
    
    selectedBoxName = name;
    selectedBoxType = actionType;
    selectedBoxDesc = desc;
    selectedBoxBtnText = buttonText;
    
    const nameEl = document.getElementById('actionActiveName');
    if (nameEl) nameEl.textContent = name;
    
    const descEl = document.getElementById('actionActiveDesc');
    if (descEl) descEl.textContent = desc;
    
    const actionBtn = document.getElementById('actionActiveBtn');
    if (actionBtn) {
        actionBtn.textContent = buttonText;
        actionBtn.disabled = false;
    }

    // Refresh GenAI recommendation
    window.updateIncidentRecommendation();
};

window.triggerConsoleAction = function() {
    const btn = document.getElementById('actionActiveBtn');
    if (!btn) return;
    
    // SECURITY ACCESS CONTROL & ROLE CHECK
    if (window.activeClearance === 'fan') {
        alert("Unauthorized Access: Fan accounts are blocked from triggering operations console actions.");
        btn.textContent = "Failed (Unauthorized)";
        return;
    }
    
    const isVIPAction = (selectedBoxType === 'adjust_hvac' || selectedBoxType === 'check_sensors');
    if (isVIPAction && window.activeClearance !== 'vip') {
        alert(`Access Denied: Action [${selectedBoxBtnText}] requires VIP Command Clearance (Root Auth).`);
        btn.textContent = "VIP Required 🔒";
        setTimeout(() => {
            btn.textContent = selectedBoxBtnText;
            btn.disabled = false;
        }, 2000);
        return;
    }
    
    btn.textContent = "Executing...";
    btn.disabled = true;
    
    setTimeout(() => {
        btn.textContent = "Complete ✅";
        
        // Log custom tag adapted to active clearance pass
        const sourceLabel = window.activeClearance === 'fan' ? "GUEST DISPATCH" : 
                            window.activeClearance === 'volunteer' ? "VOLUNTEER OP" : "VIP ROOT";
        
        logToConsole(sourceLabel, `Executed resolving protocol for [${selectedBoxName}] - Action: ${selectedBoxType.toUpperCase()}`);
        
        // Update status tag of the box to ok (Normal)
        document.querySelectorAll('.status-box').forEach(box => {
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
            btn.textContent = "Audit Logged";
        }, 1500);
    }, 1000);
};

window.updateIncidentRecommendation = function() {
    const recText = document.getElementById('genaiRecommendationText');
    if (!recText) return;
    
    if (window.activeClearance === 'fan') {
        recText.textContent = "Access Denied: Please authorize operations credentials.";
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
    
    recText.textContent = rec;
};

// Bind elements on load
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('commandGrid');
    if (grid) {
        grid.querySelectorAll('.status-box').forEach(box => {
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

    const actionBtn = document.getElementById('actionActiveBtn');
    if (actionBtn) {
        actionBtn.addEventListener('click', () => {
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
