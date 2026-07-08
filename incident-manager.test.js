describe('Incident Manager Tests', () => {
    let mockAlert;
    
    beforeEach(() => {
        mockAlert = jest.fn();
        global.alert = mockAlert;
        
        global.window = { 
            activeClearance: 'fan', 
            addAlertLogEntry: jest.fn(),
            updateIncidentRecommendation: null
        };
        
        global.document = {
            getElementById: jest.fn().mockImplementation((id) => {
                if (id === 'actionActiveName' || id === 'actionActiveDesc' || id === 'genaiRecommendationText') {
                    return { textContent: '' };
                }
                if (id === 'actionActiveBtn') {
                    return { textContent: '', disabled: false };
                }
                return null;
            }),
            querySelectorAll: jest.fn().mockImplementation((selector) => {
                if (selector === '.status-box') {
                    return [
                        {
                            classList: { remove: jest.fn(), add: jest.fn() },
                            querySelector: jest.fn().mockImplementation((sel) => {
                                if (sel === '.status-box-lbl') return { textContent: 'North Gate' };
                                if (sel === '.status-tag') return { className: '', textContent: '' };
                                return null;
                            }),
                            getAttribute: jest.fn().mockImplementation((attr) => {
                                if (attr === 'data-name') return 'North Gate';
                                if (attr === 'data-desc') return 'Queue overflow';
                                if (attr === 'data-action') return 'clear_queue';
                                if (attr === 'data-btn-text') return 'Clear Queue';
                                return null;
                            })
                        }
                    ];
                }
                return [];
            }),
            addEventListener: jest.fn()
        };
        
        // Reset the module cache to reload incident-manager and bind DOMContentLoaded listeners
        jest.isolateModules(() => {
            require('./incident-manager.js');
        });
    });

    it('should select console box and update text contents', () => {
        const el = { classList: { add: jest.fn(), remove: jest.fn() } };
        window.selectConsoleBox(el, 'North Gate', 'Queue overflow', 'clear_queue', 'Clear Queue');
        expect(el.classList.add).toHaveBeenCalledWith('selected');
    });

    it('should block fan users from triggering console actions', () => {
        window.activeClearance = 'fan';
        window.triggerConsoleAction();
        expect(mockAlert).toHaveBeenCalledWith(expect.stringContaining('Unauthorized Access'));
    });

    it('should block volunteer users from VIP actions (HVAC)', () => {
        window.activeClearance = 'volunteer';
        
        // Setup selected box details to look like a VIP HVAC action
        const el = { classList: { add: jest.fn(), remove: jest.fn() } };
        window.selectConsoleBox(el, 'Section 208', 'Heat anomaly', 'adjust_hvac', 'Recalibrate HVAC');
        
        window.triggerConsoleAction();
        expect(mockAlert).toHaveBeenCalledWith(expect.stringContaining('requires VIP Command Clearance'));
    });

    it('should allow VIP users to trigger VIP actions successfully', () => {
        jest.useFakeTimers();
        window.activeClearance = 'vip';
        
        const el = { classList: { add: jest.fn(), remove: jest.fn() } };
        window.selectConsoleBox(el, 'Section 208', 'Heat anomaly', 'adjust_hvac', 'Recalibrate HVAC');
        
        window.triggerConsoleAction();
        expect(mockAlert).not.toHaveBeenCalled();
        
        // Fast-forward timers for dispatch execution simulation
        jest.runAllTimers();
        
        jest.useRealTimers();
    });

    it('should let volunteers run non-VIP actions like clear queue', () => {
        jest.useFakeTimers();
        window.activeClearance = 'volunteer';
        
        const el = { classList: { add: jest.fn(), remove: jest.fn() } };
        window.selectConsoleBox(el, 'North Gate', 'Queue overflow', 'clear_queue', 'Clear Queue');
        
        window.triggerConsoleAction();
        expect(mockAlert).not.toHaveBeenCalled();
        
        jest.runAllTimers();
        jest.useRealTimers();
    });

    it('should return appropriate recommendations based on selected active incident', () => {
        window.activeClearance = 'volunteer';
        
        const el = { classList: { add: jest.fn(), remove: jest.fn() } };
        
        // North Gate
        window.selectConsoleBox(el, 'North Gate', 'desc', 'action', 'btn');
        expect(document.getElementById('genaiRecommendationText').textContent).toContain('turnstile bottleneck');

        // Section 104
        window.selectConsoleBox(el, 'Section 104', 'desc', 'action', 'btn');
        expect(document.getElementById('genaiRecommendationText').textContent).toContain('HVAC sensor anomaly');

        // Section 208
        window.selectConsoleBox(el, 'Section 208', 'desc', 'action', 'btn');
        expect(document.getElementById('genaiRecommendationText').textContent).toContain('Heat spike anomaly');

        // Restrooms W2
        window.selectConsoleBox(el, 'Restrooms W2', 'desc', 'action', 'btn');
        expect(document.getElementById('genaiRecommendationText').textContent).toContain('Water pressure drops');

        // Solar Roof
        window.selectConsoleBox(el, 'Solar Roof', 'desc', 'action', 'btn');
        expect(document.getElementById('genaiRecommendationText').textContent).toContain('Peak irradiance loop');

        // Medical Stn 1
        window.selectConsoleBox(el, 'Medical Stn 1', 'desc', 'action', 'btn');
        expect(document.getElementById('genaiRecommendationText').textContent).toContain('Sensory room occupancy');

        // Shuttle Hub
        window.selectConsoleBox(el, 'Shuttle Hub', 'desc', 'action', 'btn');
        expect(document.getElementById('genaiRecommendationText').textContent).toContain('Expressway congestion');

        // South Parking
        window.selectConsoleBox(el, 'South Parking', 'desc', 'action', 'btn');
        expect(document.getElementById('genaiRecommendationText').textContent).toContain('Parking capacity is stabilizing');

        // Unknown
        window.selectConsoleBox(el, 'Unknown Zone', 'desc', 'action', 'btn');
        expect(document.getElementById('genaiRecommendationText').textContent).toContain('Analyzing real-time stadium sensors');
    });

    it('should deny recommendation texts when activeClearance is fan', () => {
        window.activeClearance = 'fan';
        window.updateIncidentRecommendation();
        expect(document.getElementById('genaiRecommendationText').textContent).toContain('Access Denied');
    });
});
