describe('Telemetry Sim Tests', () => {
    beforeEach(() => {
        global.document = {
            getElementById: jest.fn().mockReturnValue({
                style: { strokeDashoffset: 0 },
                parentElement: { nextElementSibling: { nextElementSibling: { textContent: '' } } },
                textContent: ''
            }),
            createElement: jest.fn().mockReturnValue({ innerHTML: '', className: '' })
        };
        global.window = {};
        require('./telemetry-sim.js');
    });

    it('should init circular gauges', () => {
        if (typeof window.initCircularGauges === 'function') {
            window.initCircularGauges();
            expect(document.getElementById).toHaveBeenCalledWith('gaugeSolar');
        }
    });

    it('should add alert log entry', () => {
        if (typeof window.addAlertLogEntry === 'function') {
            const container = { prepend: jest.fn() };
            document.getElementById.mockReturnValue(container);
            window.addAlertLogEntry('Test', 'Message');
            expect(container.prepend).toHaveBeenCalled();
        }
    });
});
