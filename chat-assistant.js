"use strict";

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
 * Retrieves the appropriate AI response based on the user's intent.
 * @param {string} query - The user query.
 * @param {string} lang - The selected language code.
 * @returns {string} - The localized response.
 */
function getBotResponse(query, lang) {
    query = query.toLowerCase();
    const dict = botAnswers[lang] || botAnswers['en'];
    
    if (query.includes('elevator') || query.includes('wheelchair') || query.includes('access') || query.includes('ascensor') || query.includes('handicap')) {
        if (window.toggle3DLayer) window.toggle3DLayer('access');
        return dict.elevator;
    } else if (query.includes('vegan') || query.includes('food') || query.includes('eat') || query.includes('comida') || query.includes('nourriture')) {
        return dict.vegan;
    } else if (query.includes('shuttle') || query.includes('bus') || query.includes('transit') || query.includes('traslado') || query.includes('navette')) {
        return dict.shuttle;
    } else if (query.includes('eco') || query.includes('solar') || query.includes('carbon') || query.includes('green') || query.includes('sostenible') || query.includes('sol')) {
        if (window.toggle3DLayer) window.toggle3DLayer('eco');
        return dict.eco;
    } else if (query.includes('gate') || query.includes('puerta') || query.includes('porte')) {
        if (window.panStadiumCamera) window.panStadiumCamera('B');
        return dict.gate;
    } else if (query.includes('hello') || query.includes('hi') || query.includes('hola') || query.includes('bonjour')) {
        return lang === 'es' ? '¡Hola! ¿Cómo puedo ayudarte hoy con la Copa del Mundo?' : 
                lang === 'fr' ? 'Bonjour! Comment puis-je vous aider aujourd\'hui?' :
                'Hello! How can I assist you today with the World Cup operations?';
    }
    
    return "I'm processing your request with StadiumAI generative sensors. Based on real-time stadium metrics, everything is nominal. Please let me know if you need specific elevator mappings, eco grids, or bus timetables.";
}

function appendMessage(sender, text, isAI) {
    const container = document.getElementById('chatContainer');
    if (!container) return;

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
    
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
    
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

window.handleChipClick = function(text) {
    const input = document.getElementById('chatInput');
    if (input) {
        input.value = text;
        window.handleSendChat();
    }
};

window.handleSendChat = function() {
    const input = document.getElementById('chatInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    
    const langSelect = document.getElementById('langSelect');
    const lang = langSelect ? langSelect.value : 'en';
    
    // User message bubble
    appendMessage("You", text, false);
    input.value = '';
    
    // AI Response Simulation
    setTimeout(() => {
        const reply = getBotResponse(text, lang);
        appendMessage("StadiumAI", reply, true);
    }, 750);
};

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { escapeHTML, getBotResponse, botAnswers };
}
