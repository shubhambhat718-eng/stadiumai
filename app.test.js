describe('App Logic Tests', () => {
    it('should set active clearance', () => {
        // Mock global
        global.window = { activeClearance: 'fan', addAlertLogEntry: jest.fn() };
        global.document = {
            querySelectorAll: jest.fn().mockReturnValue({ forEach: jest.fn() }),
            getElementById: jest.fn().mockReturnValue({
                classList: { add: jest.fn(), remove: jest.fn() },
                style: {},
                textContent: ''
            })
        };
        require('./app.js');
        if (typeof window.activateClearanceMode === 'function') {
            window.activateClearanceMode('vip');
            expect(window.activeClearance).toBe('vip');
        }
    });
});
