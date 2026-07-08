const { escapeHTML, getBotResponse } = require('./chat-assistant.js');

describe('StadiumAI Logic Tests', () => {
  beforeEach(() => {
    // Reset DOM Mocks
    global.window = {
      toggle3DLayer: jest.fn(),
      panStadiumCamera: jest.fn(),
      activeClearance: 'fan'
    };
    
    global.document = {
      querySelector: jest.fn().mockImplementation((selector) => {
        if (selector.includes('gaugeSolar')) {
          return { textContent: '2,950 kWh' };
        }
        if (selector.includes('gaugeOffset')) {
          return { textContent: '1.5 Tons' };
        }
        if (selector === '.status-box[data-name="Shuttle Hub"]') {
          return { querySelector: () => ({ textContent: 'Delay' }) };
        }
        if (selector === '.status-box[data-name="North Gate"]') {
          return { querySelector: () => ({ textContent: 'Crowded' }) };
        }
        // general fallback element
        return { textContent: '2,840 kWh' };
      }),
      getElementById: jest.fn().mockImplementation((id) => {
        if (id === 'attendanceVal') {
          return { textContent: '78,432 fans' };
        }
        return null;
      }),
      addEventListener: jest.fn()
    };
  });

  describe('escapeHTML', () => {
    it('should sanitize basic HTML tags', () => {
      expect(escapeHTML('<b>hello</b>')).toBe('&lt;b&gt;hello&lt;/b&gt;');
    });

    it('should sanitize attributes and scripts', () => {
      expect(escapeHTML('<script src="x"></script>')).toBe('&lt;script src=&quot;x&quot;&gt;&lt;/script&gt;');
      expect(escapeHTML('onmouseover="alert(1)"')).toBe('onmouseover=&quot;alert(1)&quot;');
    });
    
    it('should return empty string if no input is provided', () => {
      expect(escapeHTML('')).toBe('');
      expect(escapeHTML(null)).toBe('');
    });
  });

  describe('getBotResponse', () => {
    // 1. Accessibility
    it('should parse wheelchair intents in English, Spanish, and French', () => {
      const enRes = getBotResponse('Where is the wheelchair access?', 'en');
      expect(enRes).toContain('Interactive 3D access beacons highlighted');
      expect(global.window.toggle3DLayer).toHaveBeenCalledWith('access');

      const esRes = getBotResponse('Donde hay un ascensor?', 'es');
      expect(esRes).toContain('Los ascensores para discapacitados más cercanos');
      
      const frRes = getBotResponse('ou est PMR?', 'fr');
      expect(frRes).toContain('Les ascenseurs PMR sont actifs');
    });

    // 2. Concessions
    it('should parse concessions intents in all languages', () => {
      const enRes = getBotResponse('what is vegan food option?', 'en');
      expect(enRes).toContain('Plant-based Grill');

      const esRes = getBotResponse('comida vegetariana por favor', 'es');
      expect(esRes).toContain('Plant-based Grill');

      const frRes = getBotResponse('je veux manger vegan', 'fr');
      expect(frRes).toContain('Le grill végétal');
    });

    // 3. Transit / Shuttle
    it('should parse shuttle intents with delay active', () => {
      const enRes = getBotResponse('when is next shuttle bus?', 'en');
      expect(enRes).toContain('Delay detected! Shuttle Bus B');

      const esRes = getBotResponse('horario de traslado', 'es');
      expect(esRes).toContain('Autobús B tiene un retraso');

      const frRes = getBotResponse('navette bus?', 'fr');
      expect(frRes).toContain('La navette vers le centre subit 4 min');
    });

    it('should parse shuttle intents with normal status (no delay)', () => {
      // Override mock to return normal status
      global.document.querySelector = jest.fn().mockImplementation((selector) => {
        if (selector === '.status-box[data-name="Shuttle Hub"]') {
          return { querySelector: () => ({ textContent: 'Normal' }) };
        }
        return null;
      });

      const enRes = getBotResponse('bus schedule', 'en');
      expect(enRes).toContain('Shuttle services operating normally');

      const esRes = getBotResponse('traslado', 'es');
      expect(esRes).toContain('El servicio de traslado funciona normalmente');

      const frRes = getBotResponse('navette', 'fr');
      expect(frRes).toContain('Départs de navette toutes les 5 minutes');
    });

    // 4. Sustainability
    it('should parse eco sustainability intents in all languages', () => {
      const enRes = getBotResponse('what carbon neutral offset metrics', 'en');
      expect(enRes).toContain('Stadium energy grid draws 88% solar net capacity');
      expect(global.window.toggle3DLayer).toHaveBeenCalledWith('eco');

      const esRes = getBotResponse('grilla sostenible y sol', 'es');
      expect(esRes).toContain('estadio funciona con un 88% de energía solar');

      const frRes = getBotResponse('le reseau eco du stade', 'fr');
      expect(frRes).toContain('Le stade s\'alimente à 88% en solaire');
    });

    // 5. Gates / Crowds
    it('should parse gate and crowd intents when crowded', () => {
      const enRes = getBotResponse('is the gate congested?', 'en');
      expect(enRes).toContain('Crowd sensors detect turnstile congestion at North Gate');
      expect(global.window.panStadiumCamera).toHaveBeenCalledWith('B');

      const esRes = getBotResponse('puerta congestionada', 'es');
      expect(esRes).toContain('aglomeración en Puerta Norte');

      const frRes = getBotResponse('encombrement porte', 'fr');
      expect(frRes).toContain('signalent un encombrement à la Porte Nord');
    });

    it('should parse gate intents when normal (not crowded)', () => {
      // Override mock to return normal status
      global.document.querySelector = jest.fn().mockImplementation((selector) => {
        if (selector === '.status-box[data-name="North Gate"]') {
          return { querySelector: () => ({ textContent: 'Normal' }) };
        }
        return null;
      });

      const enRes = getBotResponse('gate directions', 'en');
      expect(enRes).toContain('Gate B (North stands) reports fluid throughput');

      const esRes = getBotResponse('puerta b', 'es');
      expect(esRes).toContain('Puerta B (norte stands) reporta filas mínimas');

      const frRes = getBotResponse('porte b', 'fr');
      expect(frRes).toContain('La Porte B (tribune nord) signale une attente fluide');
    });

    // 6. Greetings
    it('should parse greetings in all languages', () => {
      const enRes = getBotResponse('hi chatbot', 'en');
      expect(enRes).toContain('Hello! I am your StadiumAI GenAI Concierge');

      const esRes = getBotResponse('hola amigo', 'es');
      expect(esRes).toContain('Soy tu asistente GenAI. Puedo reportar telemetría');

      const frRes = getBotResponse('bonjour concierge', 'fr');
      expect(frRes).toContain('Bonjour! Je suis votre assistant GenAI');
    });

    // 7. General fallbacks
    it('should fall back to dynamic status message for other queries', () => {
      const enRes = getBotResponse('tell me about the match teams', 'en');
      expect(enRes).toContain('GenAI Inference: Reading live sensor feeds');

      const esRes = getBotResponse('partido de futbol', 'es');
      expect(esRes).toContain('Inferencia GenAI: Consultando sensores del estadio');

      const frRes = getBotResponse('coupe du monde', 'fr');
      expect(frRes).toContain('Inférence GenAI: Lecture des capteurs');
    });
  });
});
