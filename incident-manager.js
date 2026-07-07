let selectedBoxName = 'North Gate';
let selectedBoxType = 'clear_queue';

function logToConsole(source, message) {
    if (window.addAlertLogEntry) {
        window.addAlertLogEntry(source, message);
    } else {
        console.log(`[${source}] ${message}`);
    }
}

window.selectConsoleBox = function(el, name, desc, actionType, buttonText) {
    // Keep fully operational in all views - Remove clearance blockage
    document.querySelectorAll('.status-box').forEach(box => box.classList.remove('selected'));
    el.classList.add('selected');
    
    selectedBoxName = name;
    selectedBoxType = actionType;
    
    document.getElementById('actionActiveName').textContent = name;
    document.getElementById('actionActiveDesc').textContent = desc;
    
    const actionBtn = document.getElementById('actionActiveBtn');
    if (actionBtn) {
        actionBtn.textContent = buttonText;
        actionBtn.disabled = false;
    }
};

window.triggerConsoleAction = function() {
    const btn = document.getElementById('actionActiveBtn');
    if (!btn) return;
    
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
