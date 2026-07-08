const { botAnswers } = require('./chat-assistant.js');

describe('Translations Tests', () => {
    it('should have basic translations for en, es, fr', () => {
        expect(botAnswers.en).toBeDefined();
        expect(botAnswers.es).toBeDefined();
        expect(botAnswers.fr).toBeDefined();
    });
});
