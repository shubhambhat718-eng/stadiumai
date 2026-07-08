"use strict";

/**
 * Global cache for Chat DOM nodes to optimize event loops.
 * @type {Object<string, HTMLElement>}
 */
const DOM_CHAT = {};

/**
 * Initializes DOM references for the chat interface.
 */
function initChatDOMCache() {
    DOM_CHAT.chatContainer = document.getElementById('chatContainer');
    DOM_CHAT.chatInput = document.getElementById('chatInput');
    DOM_CHAT.langSelect = document.getElementById('langSelect');
    DOM_CHAT.suggestedChips = document.getElementById('suggestedChips');
    DOM_CHAT.attendanceEl = document.getElementById('attendanceVal');
    
    // Telemetry node caches
    DOM_CHAT.solarValEl = document.querySelector('#sustainabilityCard .eco-circle-gauge:nth-child(1) .gauge-value');
    DOM_CHAT.carbonValEl = document.querySelector('#sustainabilityCard .eco-circle-gauge:nth-child(4) .gauge-value');
    DOM_CHAT.shuttleBox = document.querySelector('.status-box[data-name="Shuttle Hub"]');
    DOM_CHAT.gateBox = document.querySelector('.status-box[data-name="North Gate"]');
}

const botAnswers = {
    en: {
        elevator: '♿ The nearest handicap elevators are situated at Gate A (ground level, behind Section 100) and at the VIP entrance (North-West wing). Priority access is active.',
        vegan: '🍔 Vegan dining options include: \n• Plant-based Grill (Section 104, 2 min walk) \n• Organic Green Garden (Concourse West, Level 2) \n• Acai Bowl (Gate C, Ground Level)',
        shuttle: '🚌 The Shuttle to Downtown leaves from Gate 7. Current schedules: \n• Bus B1: 4 min wait (Rerouted via highway) \n• Bus B2: 9 min wait \n• Platform capacity: Normal',
        eco: '🌱 The venue is running on 88% solar net energy today. Graywater recycling loops are processing 4,200L hourly, offsetting 1.2 Tons of CO2 emissions. Zero-waste volunteers are stationed at every aisle.',
        gate: '🚪 Gate B is located on the North side of the stadium stands. Take Section 120 elevator down to Level 1 and turn right.'
    },
    es: {
        elevator: '♿ Los ascensores para discapacitados más cercanos están ubicados en la Puerta A (nivel del suelo, detrás de la Sección 100) y en la entrada VIP (ala Noroeste).',
        vegan: '🍔 Las opciones veganas incluyen: \n• Parrilla a base de plantas (Sección 104, 2 min) \n• Jardín Verde Orgánico (Concourse Oeste, Nivel 2)',
        shuttle: '🚌 El servicio de traslado al centro sale de la Puerta 7. Autobús B1: 4 min de espera (redirigido).',
        eco: '🌱 El estadio funciona hoy con un 88% de energía solar. Reciclamos 4,200L de agua por hora.',
        gate: '🚪 La puerta B está en el lado norte del estadio. Tome el ascensor de la sección 120 hacia el nivel 1.'
    },
    fr: {
        elevator: '♿ Les ascenseurs PMR les plus proches sont à la Porte A (rez-de-chaussée, derrière la section 100) et à l\'entrée VIP (aile Nord-Ouest).',
        vegan: '🍔 Options végétaliennes: \n• Grill végétal (Section 104, 2 min) \n• Jardin vert bio (Concourse Ouest, Niveau 2)',
        shuttle: '🚌 La navette vers le centre-ville part de la Porte 7. Attente: 4 min.',
        eco: '🌱 Le stade fonctionne aujourd\'hui à 88% d\'énergie solaire. Recyclage de 4200L d\'eau par heure.',
        gate: '🚪 La porte B est située sur le côté nord du stade. Prenez l\'ascenseur de la section 120.'
    }
};

/**
 * Escapes HTML characters to prevent XSS vulnerabilities.
 * @param {string} str - The string to sanitize.
 * @returns {string} - The sanitized string.
 */
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

/**
 * Retrieves the appropriate dynamic, telemetry-aware AI response.
 * @param {string} query - The user query.
 * @param {string} lang - The selected language code.
 * @returns {string} - The localized response.
 */
function getBotResponse(query, lang) {
    query = query.toLowerCase();
    const l = lang === 'es' ? 'es' : lang === 'fr' ? 'fr' : 'en';
    
    // Read from DOM cache values
    const solarVal = DOM_CHAT.solarValEl ? DOM_CHAT.solarValEl.textContent : "2,840 kWh";
    const carbonVal = DOM_CHAT.carbonValEl ? DOM_CHAT.carbonValEl.textContent : "1.2 Tons";
    const attendanceVal = DOM_CHAT.attendanceEl ? DOM_CHAT.attendanceEl.textContent.split(' ')[0] : "78,432";

    // 1. Accessibility query
    if (query.includes('elevator') || query.includes('wheelchair') || query.includes('access') || query.includes('ascensor') || query.includes('handicap') || query.includes('pmr')) {
        if (window.toggle3DLayer) window.toggle3DLayer('access');
        
        if (l === 'es') {
            return `♿ GenAI Telemetría: Los ascensores para discapacitados más cercanos están ubicados en la Puerta A (detrás de la Sección 100) y la entrada VIP. Hemos activado los beacons en el jumeau digital 3D.`;
        } else if (l === 'fr') {
            return `♿ Télémesure GenAI: Les ascenseurs PMR sont actifs à la Porte A (derrière Section 100) et à l'entrée VIP. Balises d'accès 3D activées sur votre écran.`;
        } else {
            return `♿ GenAI Telemetry: The nearest handicap elevators are verified active at Gate A (ground level, behind Section 100) and the VIP Entrance. Interactive 3D access beacons highlighted.`;
        }
    }
    
    // 2. Concessions query
    if (query.includes('vegan') || query.includes('food') || query.includes('eat') || query.includes('comida') || query.includes('nourriture') || query.includes('restaurant')) {
        if (l === 'es') {
            return `🍔 Concesiones GenAI: Plant-based Grill (Sección 104, a 2 min a pie) reporta stock completo y filas normales. También opciones orgánicas en Concourse Oeste, Nivel 2.`;
        } else if (l === 'fr') {
            return `🍔 Concessions GenAI: Le grill végétal (Section 104, 2 min de marche) signale un inventaire complet et temps d'attente normal. Alternatives bio au Concourse Ouest Niveau 2.`;
        } else {
            return `🍔 GenAI Concessions: Plant-based Grill (Section 104, 2 min walk) reports full stock with normal queues. Alternative organic selections available at Concourse West, Level 2.`;
        }
    }
    
    // 3. Transit query
    if (query.includes('shuttle') || query.includes('bus') || query.includes('transit') || query.includes('traslado') || query.includes('navette') || query.includes('traffic')) {
        const tag = DOM_CHAT.shuttleBox ? DOM_CHAT.shuttleBox.querySelector('.status-tag') : null;
        const shuttleStatus = tag ? tag.textContent : "Normal";
        
        if (shuttleStatus.toLowerCase().includes('delay') || shuttleStatus.toLowerCase().includes('retard')) {
            if (l === 'es') {
                return `🚌 Tránsito GenAI: ¡Retraso detectado! La navette al centro experimenta 4 minutos de demora en Autopista. Autobús B1 reprogramado en 4 min, Autobús B2 en 9 min desde la Puerta 7.`;
            } else if (l === 'fr') {
                return `🚌 Transit GenAI: Retard détecté! La navette vers le centre subit 4 min d'attente sur l'autoroute. Navette B1 à 4 min, Navette B2 à 9 min depuis la Porte 7.`;
            } else {
                return `🚌 GenAI Transit: Delay detected! Shuttle Bus B is experiencing 4 minutes of highway congestion. Alternative Bus B1 departs in 4 min, Bus B2 in 9 min from Gate 7.`;
            }
        } else {
            if (l === 'es') {
                return `🚌 Tránsito GenAI: El servicio de traslado funciona normalmente. Autobuses saliendo cada 5 minutos desde la plataforma de la Puerta 7.`;
            } else if (l === 'fr') {
                return `🚌 Transit GenAI: Fonctionnement normal. Départs de navette toutes les 5 minutes depuis la Porte 7.`;
            } else {
                return `🚌 GenAI Transit: Shuttle services operating normally. Departures scheduled every 5 minutes from the Gate 7 platform.`;
            }
        }
    }
    
    // 4. Sustainability query
    if (query.includes('eco') || query.includes('solar') || query.includes('carbon') || query.includes('green') || query.includes('sostenible') || query.includes('sol') || query.includes('recycl')) {
        if (window.toggle3DLayer) window.toggle3DLayer('eco');
        
        if (l === 'es') {
            return `🌱 Sostenibilidad GenAI: El estadio funciona con un 88% de energía solar (generación actual: ${solarVal}). Compensación acumulada: ${carbonVal} CO2. Reciclaje de agua: 4,200L/h. Capa ecológica activada en 3D.`;
        } else if (l === 'fr') {
            return `🌱 Éco-Responsabilité GenAI: Le stade s'alimente à 88% en solaire (production: ${solarVal}). Émissions compensées: ${carbonVal} CO2. Recyclage de l'eau: 4 200 L/h. Grid écologique affiché en 3D.`;
        } else {
            return `🌱 GenAI Sustainability: Stadium energy grid draws 88% solar net capacity (production: ${solarVal}). Offset accumulation: ${carbonVal} CO2. Water loop processing: 4,200L/h. Eco-grid layers active.`;
        }
    }
    
    // 5. Crowd / Gate query
    if (query.includes('gate') || query.includes('puerta') || query.includes('porte') || query.includes('crowd') || query.includes('queue') || query.includes('congestion')) {
        const tag = DOM_CHAT.gateBox ? DOM_CHAT.gateBox.querySelector('.status-tag') : null;
        const isCrowded = tag ? tag.textContent.toLowerCase().includes('crowd') : false;
        
        if (isCrowded) {
            if (window.panStadiumCamera) window.panStadiumCamera('B');
            if (l === 'es') {
                return `⚠️ Alerta GenAI: Sensores detectan embotellamiento en Puerta Norte (cola > 15m). Se aconseja desviar a la Puerta B (espera normal). Hemos enfocado la Puerta B en la cámara 3D.`;
            } else if (l === 'fr') {
                return `⚠️ Alerte GenAI: Les capteurs signalent un encombrement à la Porte Nord (file > 15m). Déviation conseillée vers Porte B (attente normale). Caméra 3D braquée sur Porte B.`;
            } else {
                return `⚠️ GenAI Alert: Crowd sensors detect turnstile congestion at North Gate (queues > 15m). Rerouting to Gate B (normal wait times) is recommended. Camera panned to Gate B on the 3D twin.`;
            }
        } else {
            if (window.panStadiumCamera) window.panStadiumCamera('B');
            if (l === 'es') {
                return `🚪 Puertas GenAI: Puerta B (norte stands) reporta filas mínimas. Tome ascensor Sección 120 al Nivel 1.`;
            } else if (l === 'fr') {
                return `🚪 Portes GenAI: La Porte B (tribune nord) signale une attente fluide. Prenez l'ascenseur Section 120 au Niveau 1.`;
            } else {
                return `🚪 GenAI Gates: Gate B (North stands) reports fluid throughput. Take Section 120 elevator down to Level 1 and turn right.`;
            }
        }
    }
    
    // 6. Greeting query
    if (query.includes('hello') || query.includes('hi') || query.includes('hola') || query.includes('bonjour') || query.includes('hey')) {
        if (l === 'es') {
            return `¡Hola! Soy tu asistente GenAI. Puedo reportar telemetría en tiempo real de asistencia (actual: ${attendanceVal} fans), producción solar (${solarVal}), incidentes de puertas o transporte.`;
        } else if (l === 'fr') {
            return `Bonjour! Je suis votre assistant GenAI. Je peux vous informer sur l'affluence (${attendanceVal} spectateurs), l'énergie solaire (${solarVal}), l'accès PMR et les navettes.`;
        } else {
            return `Hello! I am your StadiumAI GenAI Concierge. I can report on live attendance (current: ${attendanceVal} fans), solar production (${solarVal}), wayfinding pathing, gate queues, or accessible transit.`;
        }
    }
    
    // 7. General fallback
    if (l === 'es') {
        return `Inferencia GenAI: Consultando sensores del estadio. Asistencia actual: ${attendanceVal}. Todo funciona nominalmente. Consulte por ascensores, comida vegana, transporte ecológico o incidentes.`;
    } else if (l === 'fr') {
        return `Inférence GenAI: Lecture des capteurs. Affluence: ${attendanceVal}. Tout est nominal. Demandez des détails sur les ascenseurs, repas végétaliens, navettes ou la grille éco.`;
    } else {
        return `GenAI Inference: Reading live sensor feeds. Attendance: ${attendanceVal}. Stadium operations are nominal. Ask me for wheelchair elevators, plant-based food vendors, bus delays, or eco parameters.`;
    }
}

/**
 * Appends a bubble chat dialogue to the message board safely.
 * @param {string} sender - Name of message sender.
 * @param {string} text - Message text.
 * @param {boolean} isAI - Indicates if AI-sent bubble.
 */
function appendMessage(sender, text, isAI) {
    if (!DOM_CHAT.chatContainer) return;

    // Secure the input
    const sanitizedText = escapeHTML(text);

    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${isAI ? 'ai' : 'user'}`;
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = `chat-avatar ${isAI ? 'ai' : 'user'}`;
    const icon = document.createElement('i');
    icon.setAttribute('data-lucide', isAI ? 'sparkles' : 'user');
    icon.style.width = '14px';
    icon.style.height = '14px';
    avatarDiv.appendChild(icon);

    const textBubble = document.createElement('div');
    textBubble.className = 'chat-text-bubble';
    
    const strong = document.createElement('strong');
    strong.textContent = escapeHTML(sender) + ': ';
    textBubble.appendChild(strong);
    
    const lines = sanitizedText.split('\n');
    lines.forEach((line, index) => {
        textBubble.appendChild(document.createTextNode(line));
        if (index < lines.length - 1) {
            textBubble.appendChild(document.createElement('br'));
        }
    });

    bubble.appendChild(avatarDiv);
    bubble.appendChild(textBubble);
    
    DOM_CHAT.chatContainer.appendChild(bubble);
    DOM_CHAT.chatContainer.scrollTop = DOM_CHAT.chatContainer.scrollHeight;
    
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

window.handleChipClick = function(text) {
    if (DOM_CHAT.chatInput) {
        DOM_CHAT.chatInput.value = text;
        window.handleSendChat();
    }
};

window.handleSendChat = function() {
    if (!DOM_CHAT.chatInput) return;
    const text = DOM_CHAT.chatInput.value.trim();
    if (!text) return;
    
    const lang = DOM_CHAT.langSelect ? DOM_CHAT.langSelect.value : 'en';
    
    // User message bubble
    appendMessage("You", text, false);
    DOM_CHAT.chatInput.value = '';
    
    // AI Response Simulation
    setTimeout(() => {
        const reply = getBotResponse(text, lang);
        appendMessage("StadiumAI", reply, true);
    }, 750);
};

// Bind elements on load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize element caches
    initChatDOMCache();

    const chatSendBtn = document.getElementById('chatSendBtn');
    if (chatSendBtn) {
        chatSendBtn.addEventListener('click', () => {
            window.handleSendChat();
        });
    }

    if (DOM_CHAT.chatInput) {
        DOM_CHAT.chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                window.handleSendChat();
            }
        });
    }

    if (DOM_CHAT.suggestedChips) {
        DOM_CHAT.suggestedChips.querySelectorAll('.suggested-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const query = chip.getAttribute('data-query');
                if (query) window.handleChipClick(query);
            });
        });
    }
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { escapeHTML, getBotResponse, botAnswers };
}
