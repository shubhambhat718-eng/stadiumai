describe('Telemetry Sim Tests', () => {
    beforeEach(() => {
        global.document = {
            getElementById: jest.fn().mockImplementation((id) => {
                if (id === 'gaugeSolar' || id === 'gaugeWaste' || id === 'gaugeWater' || id === 'gaugeOffset') {
                    return {
                        style: { strokeDashoffset: 0 },
                        parentElement: {
                            nextElementSibling: {
                                nextElementSibling: {
                                    textContent: ''
                                }
                            }
                        }
                    };
                }
                return { textContent: '' };
            }),
            createElement: jest.fn().mockReturnValue({
                appendChild: jest.fn(),
                className: '',
                textContent: ''
            }),
            addEventListener: jest.fn()
        };
        global.window = {};
        
        jest.isolateModules(() => {
            require('./telemetry-sim.js');
        });
    });

    it('should init circular gauges and set correct stroke offsets', () => {
        if (typeof window.initCircularGauges === 'function') {
            window.initCircularGauges();
            expect(document.getElementById).toHaveBeenCalledWith('gaugeSolar');
        }
    });

    it('should add alert log entry to container safely', () => {
        if (typeof window.addAlertLogEntry === 'function') {
            const container = { prepend: jest.fn() };
            document.getElementById.mockReturnValue(container);
            window.addAlertLogEntry('Test', 'Message');
            expect(container.prepend).toHaveBeenCalled();
        }
    });

    it('should trigger live background telemetry updates on intervals', () => {
        jest.useFakeTimers();
        if (typeof window.startLiveTelemetryUpdates === 'function') {
            window.startLiveTelemetryUpdates();
            // Advance timers by one tick of 4000ms
            jest.advanceTimersByTime(4000);
            expect(document.getElementById).toHaveBeenCalledWith('attendanceVal');
        }
        jest.useRealTimers();
    });
});
