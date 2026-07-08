"use strict";

/**
 * Global cache for DOM elements to improve runtime lookup performance.
 * @type {Object<string, HTMLElement>}
 */
const DOM = {};

/**
 * Initializes the DOM cache elements on page load.
 */
function initDOMCache() {
    DOM.landingPage = document.getElementById('landingPage');
    DOM.mainProject = document.getElementById('mainProject');
    DOM.canvas = document.getElementById('stadium-canvas');
    DOM.clearanceIndicator = document.getElementById('clearanceIndicator');
    DOM.clearanceLabel = document.getElementById('clearanceLabel');
    DOM.opsOverlay = document.getElementById('opsConsoleOverlay');
    DOM.alertsOverlay = document.getElementById('alertsOverlay');
    DOM.langSelect = document.getElementById('langSelect');
    DOM.routeStart = document.getElementById('routeStart');
    DOM.routeDest = document.getElementById('routeDest');
    DOM.routePath = document.getElementById('routePath');
    DOM.routeTrack = document.getElementById('routeTrack');
    DOM.startLblText = document.getElementById('startLblText');
    DOM.destLblText = document.getElementById('destLblText');
    DOM.valDistance = document.getElementById('valDistance');
    DOM.valTime = document.getElementById('valTime');
    DOM.valAccessible = document.getElementById('valAccessible');
    DOM.welcomeMsg = document.getElementById('welcomeMsg');
}

/**
 * Transitions the application from the landing viewport overlay to the main twin.
 */
window.enterMainProject = function() {
    if (!DOM.landingPage || !DOM.mainProject) return;
    
    DOM.landingPage.classList.add('hidden');
    
    setTimeout(() => {
        DOM.landingPage.style.display = 'none';
        DOM.mainProject.style.display = 'block';
        DOM.mainProject.classList.add('visible');
        
        if (window.lucide) {
            window.lucide.createIcons();
            setTimeout(() => { window.lucide.createIcons(); }, 50);
        }
        
        setTimeout(() => {
            if (typeof init3DTilt === 'function') init3DTilt();
            
            if (DOM.canvas && window.initStadiumScene && !window.stadiumInitialized) {
                window.initStadiumScene(DOM.canvas);
                window.stadiumInitialized = true;
            }
        }, 200);
    }, 800);
};

// Initialize landing page icons on load
document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) {
        window.lucide.createIcons();
    }
});

/**
 * Tracks the current active role-based permission clearance level.
 * @type {string}
 */
window.activeClearance = 'fan';

/**
 * Smoothly scrolls the viewport window to a specified section element.
 * @param {string} id - The target HTML section identifier.
 */
window.scrollToId = function(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-target') === id) {
            link.classList.add('active');
        }
    });
};

/**
 * Updates interface component visibilities and badges for security clearance roles.
 * @param {string} mode - The clearance mode name ('fan', 'volunteer', 'vip').
 */
window.activateClearanceMode = function(mode) {
    window.activeClearance = mode;
    
    const cards = document.querySelectorAll('.plan-card');
    cards.forEach(card => {
        card.classList.remove('active-plan');
        card.setAttribute('aria-selected', 'false');
    });
    
    if (mode === 'fan') {
        const fanCard = document.getElementById('planFan');
        if (fanCard) {
            fanCard.classList.add('active-plan');
            fanCard.setAttribute('aria-selected', 'true');
        }
        if (DOM.clearanceLabel) DOM.clearanceLabel.textContent = "Fan View";
        if (DOM.clearanceIndicator) {
            DOM.clearanceIndicator.style.borderColor = 'rgba(59, 130, 246, 0.3)';
            DOM.clearanceIndicator.style.color = 'var(--accent-cyan)';
        }
        if (DOM.opsOverlay) DOM.opsOverlay.classList.remove('hidden');
        if (DOM.alertsOverlay) DOM.alertsOverlay.classList.remove('hidden');
    } else if (mode === 'volunteer') {
        const volCard = document.getElementById('planVolunteer');
        if (volCard) {
            volCard.classList.add('active-plan');
            volCard.setAttribute('aria-selected', 'true');
        }
        if (DOM.clearanceLabel) DOM.clearanceLabel.textContent = "Volunteer Auth";
        if (DOM.clearanceIndicator) {
            DOM.clearanceIndicator.style.borderColor = 'rgba(139, 92, 246, 0.4)';
            DOM.clearanceIndicator.style.color = 'var(--accent-purple)';
        }
        if (DOM.opsOverlay) DOM.opsOverlay.classList.add('hidden');
        if (DOM.alertsOverlay) DOM.alertsOverlay.classList.add('hidden');
        
        if (typeof window.updateIncidentRecommendation === 'function') {
            window.updateIncidentRecommendation();
        }
    } else if (mode === 'vip') {
        const vipCard = document.getElementById('planVIP');
        if (vipCard) {
            vipCard.classList.add('active-plan');
            vipCard.setAttribute('aria-selected', 'true');
        }
        if (DOM.clearanceLabel) DOM.clearanceLabel.textContent = "VIP Operator";
        if (DOM.clearanceIndicator) {
            DOM.clearanceIndicator.style.borderColor = 'rgba(16, 185, 129, 0.4)';
            DOM.clearanceIndicator.style.color = 'var(--success)';
        }
        if (DOM.opsOverlay) DOM.opsOverlay.classList.add('hidden');
        if (DOM.alertsOverlay) DOM.alertsOverlay.classList.add('hidden');
        
        if (typeof window.updateIncidentRecommendation === 'function') {
            window.updateIncidentRecommendation();
        }
    }
    
    if (window.addAlertLogEntry) {
        window.addAlertLogEntry("SYSTEM", `Clearance context changed to: ${mode.toUpperCase()}`);
    }
};

/**
 * Handles language switching, localizing text nodes using pure textContent for safety.
 */
window.switchLanguage = function() {
    if (!DOM.langSelect) return;
    const lang = DOM.langSelect.value;
    
    const t = window.langData ? window.langData[lang] : null;
    if (!t) return;
    
    for (const [key, value] of Object.entries(t)) {
        const el = document.getElementById(key);
        if (el) {
            if (el.tagName === 'INPUT') {
                el.placeholder = value;
            } else {
                el.textContent = value; // Secure textContent binding to prevent XSS
            }
        }
    }
    
    if (DOM.welcomeMsg) {
        DOM.welcomeMsg.textContent = t.welcomeMsg; // Secure textContent binding
    }
    
    if (window.addAlertLogEntry) {
        window.addAlertLogEntry("SYS", `Language localized to: ${lang.toUpperCase()}`);
    }
};

/**
 * Updates and animates the holographic wayfinding route path from selected Gates.
 */
window.animateSvgRoute = function() {
    if (!DOM.routeStart || !DOM.routeDest || !DOM.routePath || !DOM.routeTrack) return;
    
    const start = DOM.routeStart.value;
    const dest = DOM.routeDest.value;
    
    let dAttr = "M 30,80 L 120,80 L 180,30 L 350,30"; 
    
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

    DOM.routePath.setAttribute('d', dAttr);
    DOM.routeTrack.setAttribute('d', dAttr);
    
    if (DOM.startLblText) DOM.startLblText.textContent = `Gate ${start}`;
    if (DOM.destLblText) DOM.destLblText.textContent = `Sec ${dest}`;
    
    let distVal = 240;
    let timeVal = 4;
    if (start === 'B') { distVal = 310; timeVal = 6; }
    if (start === 'C') { distVal = 180; timeVal = 3; }
    if (dest === 'VIP') { distVal += 50; timeVal += 1; }
    
    if (DOM.valDistance) DOM.valDistance.textContent = `${distVal} Meters`;
    if (DOM.valTime) DOM.valTime.textContent = `${timeVal} Mins`;
    
    DOM.routePath.style.animation = 'none';
    DOM.routePath.offsetHeight; 
    DOM.routePath.style.animation = 'flowRoute 2s infinite linear';
    
    if (window.addAlertLogEntry) {
        window.addAlertLogEntry("GPS", `Recalculated route from Gate ${start} to Section ${dest}. Time: ${timeVal} min.`);
    }
    
    if (window.panStadiumCamera) {
        window.panStadiumCamera(start);
    }
};

/**
 * Initializes visual 3D tilt effects on cards.
 */
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
                    
                    const rotateY = ((x - xc) / xc) * 3.5; 
                    const rotateX = -((y - yc) / yc) * 3.5; 
                    
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
    if (window.addAlertLogEntry) {
        window.addAlertLogEntry(e.detail.source, e.detail.message);
    }
});

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM element references cache
    initDOMCache();

    // Event binding
    const enterBtn = document.getElementById('landingEnterBtn');
    if (enterBtn) {
        enterBtn.addEventListener('click', () => {
            window.enterMainProject();
        });
    }

    const navbarLinks = document.getElementById('navbarLinks');
    if (navbarLinks) {
        navbarLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                const target = link.getAttribute('data-target');
                if (target) window.scrollToId(target);
            });
        });
    }

    const btnGoDash = document.getElementById('btnGoDash');
    if (btnGoDash) {
        btnGoDash.addEventListener('click', () => {
            const target = btnGoDash.getAttribute('data-target');
            if (target) window.scrollToId(target);
        });
    }

    const btnGoChat = document.getElementById('btnGoChat');
    if (btnGoChat) {
        btnGoChat.addEventListener('click', () => {
            const target = btnGoChat.getAttribute('data-target');
            if (target) window.scrollToId(target);
        });
    }

    if (DOM.langSelect) {
        DOM.langSelect.addEventListener('change', () => {
            window.switchLanguage();
        });
    }

    if (DOM.routeStart) {
        DOM.routeStart.addEventListener('change', () => {
            window.animateSvgRoute();
        });
    }

    if (DOM.routeDest) {
        DOM.routeDest.addEventListener('change', () => {
            window.animateSvgRoute();
        });
    }

    const layerControls = document.getElementById('layerControls');
    if (layerControls) {
        layerControls.querySelectorAll('.layer-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const layer = btn.getAttribute('data-layer');
                if (layer && typeof window.toggle3DLayer === 'function') {
                    window.toggle3DLayer(layer);
                }
            });
        });
    }

    const clearancePlansGrid = document.getElementById('clearancePlansGrid');
    if (clearancePlansGrid) {
        clearancePlansGrid.querySelectorAll('.plan-card').forEach(card => {
            card.addEventListener('click', () => {
                const mode = card.getAttribute('data-mode');
                if (mode) window.activateClearanceMode(mode);
            });
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const mode = card.getAttribute('data-mode');
                    if (mode) window.activateClearanceMode(mode);
                }
            });
        });
    }
    
    // 1. Initialise Lucide icons
    if (window.lucide) {
        window.lucide.createIcons();
    }
    
    // 2. Initialise Circular Gauges offsets
    if (window.initCircularGauges) {
        window.initCircularGauges();
    }
    
    // 4. Start simulated background telemetry feeds
    if (window.startLiveTelemetryUpdates) {
        window.startLiveTelemetryUpdates();
    }
    
    // 5. Set starting clearance pass
    window.activateClearanceMode('fan');
    
    // 6. Setup 3D mouse tilt parallax on glass cards
    init3DTilt();
    
    console.log("🏟️ StadiumAI fully initialized programmatically with strict event listeners.");
});
