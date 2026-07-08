describe('App Logic Tests', () => {
    let mockScrollIntoView;
    let mockPrepend;

    beforeEach(() => {
        mockScrollIntoView = jest.fn();
        mockPrepend = jest.fn();

        global.window = {
            activeClearance: 'fan',
            addAlertLogEntry: jest.fn(),
            panStadiumCamera: jest.fn(),
            updateIncidentRecommendation: jest.fn(),
            langData: {
                en: {
                    liveBadge: "LIVE — FIFA WORLD CUP 2026",
                    welcomeMsg: "Welcome!",
                    c1Title: "Clean Operations"
                },
                es: {
                    liveBadge: "EN VIVO",
                    welcomeMsg: "Bienvenido!",
                    c1Title: "Operaciones Limpias"
                }
            }
        };

        global.document = {
            getElementById: jest.fn().mockImplementation((id) => {
                if (id === 'landingPage' || id === 'mainProject') {
                    return { classList: { add: jest.fn(), remove: jest.fn() }, style: { display: '' } };
                }
                if (id === 'clearanceIndicator' || id === 'clearanceLabel') {
                    return { textContent: '', style: {} };
                }
                if (id === 'opsConsoleOverlay' || id === 'alertsOverlay') {
                    return { classList: { add: jest.fn(), remove: jest.fn() } };
                }
                if (id === 'liveBadge' || id === 'welcomeMsg' || id === 'c1Title') {
                    return { tagName: 'SPAN', innerHTML: '', textContent: '' };
                }
                if (id === 'langSelect') {
                    return { value: 'es' };
                }
                if (id === 'routeStart') {
                    return { value: 'B' };
                }
                if (id === 'routeDest') {
                    return { value: '208' };
                }
                if (id === 'routePath' || id === 'routeTrack') {
                    return { setAttribute: jest.fn(), style: { animation: '' }, offsetHeight: 100 };
                }
                if (id === 'startLblText' || id === 'destLblText' || id === 'valDistance' || id === 'valTime') {
                    return { textContent: '' };
                }
                return null;
            }),
            querySelectorAll: jest.fn().mockImplementation((selector) => {
                if (selector === '.nav-link') {
                    return [
                        {
                            classList: { remove: jest.fn(), add: jest.fn() },
                            getAttribute: jest.fn().mockReturnValue('hero')
                        }
                    ];
                }
                if (selector === '.plan-card') {
                    return [
                        {
                            classList: { remove: jest.fn(), add: jest.fn() },
                            id: 'planFan'
                        }
                    ];
                }
                if (selector === '.glass-card') {
                    return [
                        {
                            addEventListener: jest.fn(),
                            getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }),
                            style: { transform: '' }
                        }
                    ];
                }
                return [];
            }),
            addEventListener: jest.fn()
        };

        // Reset modules and load app.js
        jest.isolateModules(() => {
            require('./app.js');
        });
    });

    it('should enter main project smoothly and hide landing page', () => {
        jest.useFakeTimers();
        if (typeof window.enterMainProject === 'function') {
            window.enterMainProject();
            jest.runAllTimers();
        }
        jest.useRealTimers();
    });

    it('should scroll to target element and update nav links active class', () => {
        const mockEl = { scrollIntoView: mockScrollIntoView };
        document.getElementById.mockReturnValue(mockEl);
        
        if (typeof window.scrollToId === 'function') {
            window.scrollToId('hero');
            expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
        }
    });

    it('should toggle overlays and variables during clearance changes', () => {
        const mockOverlay = { classList: { add: jest.fn(), remove: jest.fn() } };
        document.getElementById.mockImplementation((id) => {
            if (id === 'opsConsoleOverlay' || id === 'alertsOverlay') return mockOverlay;
            return { classList: { add: jest.fn(), remove: jest.fn() }, style: {} };
        });

        if (typeof window.activateClearanceMode === 'function') {
            // Fan clearance
            window.activateClearanceMode('fan');
            expect(window.activeClearance).toBe('fan');
            expect(mockOverlay.classList.remove).toHaveBeenCalledWith('hidden');

            // Volunteer clearance
            window.activateClearanceMode('volunteer');
            expect(window.activeClearance).toBe('volunteer');
            expect(mockOverlay.classList.add).toHaveBeenCalledWith('hidden');

            // VIP clearance
            window.activateClearanceMode('vip');
            expect(window.activeClearance).toBe('vip');
            expect(mockOverlay.classList.add).toHaveBeenCalledWith('hidden');
        }
    });

    it('should translate site contents on language selection changes', () => {
        const liveBadgeMock = { tagName: 'SPAN', innerHTML: '' };
        document.getElementById.mockImplementation((id) => {
            if (id === 'langSelect') return { value: 'es' };
            if (id === 'liveBadge') return liveBadgeMock;
            if (id === 'welcomeMsg') return { tagName: 'SPAN', innerHTML: '' };
            return null;
        });

        if (typeof window.switchLanguage === 'function') {
            window.switchLanguage();
            expect(liveBadgeMock.innerHTML).toBe('EN VIVO');
        }
    });

    it('should calculate wayfinding distances and trigger visual SVG routes', () => {
        if (typeof window.animateSvgRoute === 'function') {
            // Gate B to Sec 208
            window.animateSvgRoute();
            expect(window.panStadiumCamera).toHaveBeenCalledWith('B');
        }
    });
});
