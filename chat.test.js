const { escapeHTML, getBotResponse } = require('./chat-assistant.js');

describe('StadiumAI Logic Tests', () => {
  describe('escapeHTML', () => {
    it('should sanitize basic HTML tags', () => {
      expect(escapeHTML('<b>hello</b>')).toBe('&lt;b&gt;hello&lt;/b&gt;');
    });

    it('should sanitize attributes and scripts', () => {
      expect(escapeHTML('<script src="x"></script>')).toBe('&lt;script src=&quot;x&quot;&gt;&lt;/script&gt;');
      expect(escapeHTML('onmouseover="alert(1)"')).toBe('onmouseover=&quot;alert(1)&quot;');
    });
  });

  describe('getBotResponse', () => {
    it('should parse wheelchair intents in English', () => {
      const res = getBotResponse('Where is the wheelchair access?', 'en');
      expect(res).toContain('nearest handicap elevators');
    });

    it('should parse food intents in French', () => {
      const res = getBotResponse('Je veux manger vegan', 'fr');
      expect(res).toContain('Grill végétal');
    });

    it('should provide default response for unknown queries', () => {
      const res = getBotResponse('random text here', 'en');
      expect(res).toContain('processing your request');
    });
  });
});
