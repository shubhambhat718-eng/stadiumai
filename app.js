"use strict";

// Landing Page Transition
window.enterMainProject = function() {
    const landingPage = document.getElementById('landingPage');
    const mainProject = document.getElementById('mainProject');
    
    if (!landingPage || !mainProject) return;
    
    landingPage.classList.add('hidden');
    
    setTimeout(() => {
        landingPage.style.display = 'none';
        mainProject.style.display = 'block';
        mainProject.classList.add('visible');
        
        // Force Lucide to re-process all icons in the now-visible DOM
        if (window.lucide) {
            window.lucide.createIcons();
            // Double-pass to ensure absolutely everything is rendered
            setTimeout(() => { window.lucide.createIcons(); }, 50);
        }
        
        setTimeout(() => {
            if (typeof init3DTilt === 'function') init3DTilt();
            
            // Setup Three.js holographic twin now that container is visible
            const canvas = document.getElementById('stadium-canvas');
            if (canvas && window.initStadiumScene && !window.stadiumInitialized) {
                window.initStadiumScene(canvas);
                window.stadiumInitialized = true;
            }
        }, 200);
    }, 800);
};

// Initialize landing page icons on load
document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) {
        lucide.createIcons();
    }
});

window.activeClearance = 'fan';

window.scrollToId = function(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('onclick') && link.getAttribute('onclick').includes(id)) {
            link.classList.add('active');
        }
    });
};

window.activateClearanceMode = function(mode) {
    window.activeClearance = mode;
    document.querySelectorAll('.plan-card').forEach(card => card.classList.remove('active-plan'));
    
    const badge = document.getElementById('clearanceIndicator');
    const label = document.getElementById('clearanceLabel');
    
    // Ops console card is kept fully active/functional in all states. We only update status labels.
    if (mode === 'fan') {
        const fanCard = document.getElementById('planFan');
        if (fanCard) fanCard.classList.add('active-plan');
        if (label) label.textContent = "Fan View";
        if (badge) {
            badge.style.borderColor = 'rgba(59, 130, 246, 0.3)';
            badge.style.color = 'var(--accent-cyan)';
        }
    } else if (mode === 'volunteer') {
        const volCard = document.getElementById('planVolunteer');
        if (volCard) volCard.classList.add('active-plan');
        if (label) label.textContent = "Volunteer Auth";
        if (badge) {
            badge.style.borderColor = 'rgba(139, 92, 246, 0.4)';
            badge.style.color = 'var(--accent-purple)';
        }
    } else if (mode === 'vip') {
        const vipCard = document.getElementById('planVIP');
        if (vipCard) vipCard.classList.add('active-plan');
        if (label) label.textContent = "VIP Operator";
        if (badge) {
            badge.style.borderColor = 'rgba(16, 185, 129, 0.4)';
            badge.style.color = 'var(--success)';
        }
    }
    
    if (window.addAlertLogEntry) {
        window.addAlertLogEntry("SYSTEM", `Clearance context changed to: ${mode.toUpperCase()}`);
    }
};

window.switchLanguage = function() {
    const langSelect = document.getElementById('langSelect');
    if (!langSelect) return;
    const lang = langSelect.value;
    
    const t = window.langData ? window.langData[lang] : null;
    if (!t) return;
    
    for (const [key, value] of Object.entries(t)) {
        const el = document.getElementById(key);
        if (el) {
            if (el.tagName === 'INPUT') {
                el.placeholder = value;
            } else {
                el.innerHTML = value;
            }
        }
    }
    
    const welcome = document.getElementById('welcomeMsg');
    if (welcome) {
        welcome.innerHTML = t.welcomeMsg;
    }
    
    if (window.addAlertLogEntry) {
        window.addAlertLogEntry("SYS", `Language localized to: ${lang.toUpperCase()}`);
    }
};

window.animateSvgRoute = function() {
    const startSelect = document.getElementById('routeStart');
    const destSelect = document.getElementById('routeDest');
    if (!startSelect || !destSelect) return;
    
    const start = startSelect.value;
    const dest = destSelect.value;
    
    const path = document.getElementById('routePath');
    const track = document.getElementById('routeTrack');
    if (!path || !track) return;
    
    let dAttr = "M 30,80 L 120,80 L 180,30 L 350,30"; // default: Gate A to Sec 104
    
    if (start === 'B') {
        dAttr = "M 30,30 L 150,30 L 220,110 L 350,110";
    } else if (start === 'C') {
        dAttr = "M 30,130 L 180,130 L 240,60 L 350,60";
    }
    
    if (dest === '208') {
        dAttr = dAttr.replace(/L 350,(30|110|60)/, "L 350,130");
    } else if (dest === 'VIP') {
        dAttr = dAttr.replace(/L 350,(30|110|60)/, "L 350,70");
    }

    path.setAttribute('d', dAttr);
    track.setAttribute('d', dAttr);
    
    document.getElementById('startLblText').textContent = `Gate ${start}`;
    document.getElementById('destLblText').textContent = `Sec ${dest}`;
    
    let distVal = 240;
    let timeVal = 4;
    if (start === 'B') { distVal = 310; timeVal = 6; }
    if (start === 'C') { distVal = 180; timeVal = 3; }
    if (dest === 'VIP') { distVal += 50; timeVal += 1; }
    
    document.getElementById('valDistance').textContent = `${distVal} Meters`;
    document.getElementById('valTime').textContent = `${timeVal} Mins`;
    
    path.style.animation = 'none';
    path.offsetHeight; // trigger reflow
    path.style.animation = 'flowRoute 2s infinite linear';
    
    if (window.addAlertLogEntry) {
        window.addAlertLogEntry("GPS", `Recalculated route from Gate ${start} to Section ${dest}. Time: ${timeVal} min.`);
    }
    
    if (window.panStadiumCamera) {
        window.panStadiumCamera(start);
    }
};

// Subtle Card Tilt (Parallax) Effect
function init3DTilt() {
    const cards = document.querySelectorAll('.glass-card');
    cards.forEach(card => {
        let ticking = false;
        card.addEventListener('mousemove', (e) => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    
                    const xc = rect.width / 2;
                    const yc = rect.height / 2;
                    
                    const rotateY = ((x - xc) / xc) * 3.5; // Subtle Y rotation (Max 3.5 deg)
                    const rotateX = -((y - yc) / yc) * 3.5; // Subtle X rotation (Max 3.5 deg)
                    
                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`;
                    ticking = false;
                });
                ticking = true;
            }
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
    });
}



// Connect custom events from three-stadium module to telemetry alerts container
window.addEventListener('stadium-log', (e) => {
    addAlertLogEntry(e.detail.source, e.detail.message);
});

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialise Lucide icons
    if (window.lucide) {
        window.lucide.createIcons();
    }
    
    // 2. Initialise Circular Gauges offsets
    if (window.initCircularGauges) {
        window.initCircularGauges();
    }
    
    // 3. Setup Three.js holographic twin is deferred to enterMainProject
    // to ensure the canvas has non-zero dimensions when Three.js initializes.
    
    // 4. Start simulated background telemetry feeds
    if (window.startLiveTelemetryUpdates) {
        window.startLiveTelemetryUpdates();
    }
    
    // 5. Set starting clearance pass
    window.activateClearanceMode('fan');
    
    // 6. Setup 3D mouse tilt parallax on glass cards
    init3DTilt();
    
    console.log("🏟️ StadiumAI fully initialized globally with subtle 3D tilts.");
});
