describe('Translations Parity Tests', () => {
    beforeEach(() => {
        global.window = {};
        // Reset cache and reload translations
        jest.isolateModules(() => {
            require('./translations.js');
        });
    });

    it('should have loaded langData into global window scope', () => {
        expect(global.window.langData).toBeDefined();
        expect(global.window.langData.en).toBeDefined();
        expect(global.window.langData.es).toBeDefined();
        expect(global.window.langData.fr).toBeDefined();
    });

    it('should have matching translation keys across all locales to prevent missing text', () => {
        const enKeys = Object.keys(global.window.langData.en).sort();
        const esKeys = Object.keys(global.window.langData.es).sort();
        const frKeys = Object.keys(global.window.langData.fr).sort();
        
        expect(esKeys).toEqual(enKeys);
        expect(frKeys).toEqual(enKeys);
    });
});
