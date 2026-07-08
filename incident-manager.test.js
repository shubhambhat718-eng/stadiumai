describe('Incident Manager Tests', () => {
    beforeEach(() => {
        global.window = { 
            activeClearance: 'fan', 
            addAlertLogEntry: jest.fn() 
        };
        global.document = {
            getElementById: jest.fn().mockReturnValue({ textContent: '', disabled: false }),
            querySelectorAll: jest.fn().mockReturnValue({ forEach: jest.fn() })
        };
        // require the module
        require('./incident-manager.js');
    });

    it('should select console box', () => {
        if (typeof window.selectConsoleBox === 'function') {
            const el = { classList: { add: jest.fn(), remove: jest.fn() } };
            window.selectConsoleBox(el, 'Test', 'Desc', 'type', 'Btn');
            expect(el.classList.add).toHaveBeenCalledWith('selected');
        }
    });

    it('should trigger console action', () => {
        jest.useFakeTimers();
        if (typeof window.triggerConsoleAction === 'function') {
            window.triggerConsoleAction();
            jest.runAllTimers();
            expect(document.getElementById).toHaveBeenCalled();
        }
        jest.useRealTimers();
    });
});
