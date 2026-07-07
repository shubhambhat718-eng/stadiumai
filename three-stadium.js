let scene, camera, renderer, stadiumGroup, particles, pathTube, beaconGroup, ecoGroup;
let pPositions, initialColors, targetColors, particleCount = 1800;
let timeTick = 0;

const beaconPositions = [
    new THREE.Vector3(-45, 1, 30),
    new THREE.Vector3(45, 1, -30),
    new THREE.Vector3(-30, 8, -35),
    new THREE.Vector3(30, 8, 35)
];

function logToConsole(source, message) {
    if (window.addAlertLogEntry) {
        window.addAlertLogEntry(source, message);
    } else {
        console.log(`[${source}] ${message}`);
    }
}

window.initStadiumScene = function(canvas) {
    scene = new THREE.Scene();
    scene.background = null;
    scene.fog = new THREE.FogExp2(0x09091f, 0.007);

    camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set(50, 40, 65);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lights
    const ambientLight = new THREE.AmbientLight(0x3b82f6, 0.65);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x06b6d4, 1.4);
    dirLight1.position.set(30, 40, 30);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x8b5cf6, 0.95);
    dirLight2.position.set(-30, 40, -30);
    scene.add(dirLight2);

    stadiumGroup = new THREE.Group();
    scene.add(stadiumGroup);

    // Ground Grid
    const gridHelper = new THREE.GridHelper(160, 40, 0x06b6d4, 0x1e1b4b);
    gridHelper.position.y = -0.5;
    gridHelper.material.opacity = 0.25;
    gridHelper.material.transparent = true;
    stadiumGroup.add(gridHelper);

    // Field
    const fieldGeo = new THREE.PlaneGeometry(55, 85);
    const fieldMat = new THREE.MeshStandardMaterial({ 
        color: 0x052e16, 
        roughness: 0.85, 
        metalness: 0.15,
        side: THREE.DoubleSide
    });
    const field = new THREE.Mesh(fieldGeo, fieldMat);
    field.rotation.x = -Math.PI / 2;
    field.position.y = 0.02;
    stadiumGroup.add(field);

    const pitchGrid = new THREE.GridHelper(50, 10, 0x10b981, 0x06b6d4);
    pitchGrid.position.y = 0.05;
    pitchGrid.rotation.y = Math.PI/2;
    stadiumGroup.add(pitchGrid);

    // Glossy Extruded Stands Material
    const standMat = new THREE.MeshStandardMaterial({
        color: 0x0c0b32,
        roughness: 0.15,
        metalness: 0.95,
        transparent: true,
        opacity: 0.8
    });

    const standWireMat = new THREE.MeshBasicMaterial({
        color: 0x3b82f6,
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });

    const tiersCount = 3;
    const standsGroup = new THREE.Group();
    stadiumGroup.add(standsGroup);

    for (let i = 0; i < tiersCount; i++) {
        const rad = 42 + i * 8;
        const h = 3.5 + i * 4;
        const ringGeo = new THREE.CylinderGeometry(rad + 3, rad, h + 2, 48, 2, true);
        
        const standMesh = new THREE.Mesh(ringGeo, standMat);
        standMesh.position.y = h/2;
        standsGroup.add(standMesh);

        const standWire = new THREE.Mesh(ringGeo, standWireMat);
        standWire.position.y = h/2;
        standsGroup.add(standWire);
    }

    // Roof Torus
    const roofGeo = new THREE.TorusGeometry(58, 1.8, 12, 64);
    const roofMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        emissive: 0x06b6d4,
        emissiveIntensity: 1.2,
        roughness: 0.1
    });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.rotation.x = Math.PI / 2;
    roof.position.y = 19;
    stadiumGroup.add(roof);

    // Supports
    const pillarMat = new THREE.MeshStandardMaterial({
        color: 0x1e1b4b,
        roughness: 0.4,
        metalness: 0.9
    });
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 19, 8), pillarMat);
        pillar.position.set(Math.cos(angle) * 58, 9.5, Math.sin(angle) * 58);
        stadiumGroup.add(pillar);
    }

    // Sensory particles
    const particleGeo = new THREE.BufferGeometry();
    pPositions = new Float32Array(particleCount * 3);
    const pColors = new Float32Array(particleCount * 3);
    targetColors = new Float32Array(particleCount * 3);
    initialColors = [];

    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 38 + Math.random() * 22;
        const y = 1.5 + Math.random() * 14;

        pPositions[i * 3] = Math.cos(angle) * dist;
        pPositions[i * 3 + 1] = y;
        pPositions[i * 3 + 2] = Math.sin(angle) * dist;

        const ratio = Math.random();
        const r = ratio < 0.5 ? 0.23 : 0.02;
        const g = ratio < 0.5 ? 0.51 : 0.71;
        const b = ratio < 0.5 ? 0.96 : 0.83;

        pColors[i * 3] = r;
        pColors[i * 3 + 1] = g;
        pColors[i * 3 + 2] = b;

        targetColors[i * 3] = r;
        targetColors[i * 3 + 1] = g;
        targetColors[i * 3 + 2] = b;

        initialColors.push({ r, g, b });
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

    const particleMat = new THREE.PointsMaterial({
        size: 0.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.9
    });
    particles = new THREE.Points(particleGeo, particleMat);
    stadiumGroup.add(particles);

    // Dynamic Wayfinding curve
    const pathCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-45, 0.5, 30),
        new THREE.Vector3(-25, 3, 20),
        new THREE.Vector3(-10, 6, -5),
        new THREE.Vector3(20, 10, -25),
        new THREE.Vector3(35, 12, -32)
    ]);
    const pathTubeGeo = new THREE.TubeGeometry(pathCurve, 64, 0.5, 8, false);
    const pathTubeMat = new THREE.MeshBasicMaterial({
        color: 0x06b6d4,
        transparent: true,
        opacity: 0.0,
        wireframe: true
    });
    pathTube = new THREE.Mesh(pathTubeGeo, pathTubeMat);
    stadiumGroup.add(pathTube);

    // Beacons
    beaconGroup = new THREE.Group();
    stadiumGroup.add(beaconGroup);

    beaconPositions.forEach((pos, idx) => {
        const beaconMesh = new THREE.Mesh(
            new THREE.SphereGeometry(1.5, 8, 8),
            new THREE.MeshBasicMaterial({
                color: idx === 3 ? 0xef4444 : 0x10b981,
                transparent: true,
                opacity: 0.0
            })
        );
        beaconMesh.position.copy(pos);
        beaconGroup.add(beaconMesh);
    });

    // Eco solar mesh
    ecoGroup = new THREE.Group();
    stadiumGroup.add(ecoGroup);

    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const ecoRing = new THREE.Mesh(
            new THREE.RingGeometry(0.8, 1.5, 16),
            new THREE.MeshBasicMaterial({
                color: 0x10b981,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.0
            })
        );
        ecoRing.position.set(Math.cos(angle) * 58, 19.1, Math.sin(angle) * 58);
        ecoRing.rotation.x = Math.PI / 2;
        ecoGroup.add(ecoRing);
    }

    // Tick loop (Adjusted for Majestic, Slow, Smooth Rotations)
    function animate() {
        requestAnimationFrame(animate);
        timeTick += 0.005;

        // Slow rotation (from 0.4 to 0.08)
        if (stadiumGroup) stadiumGroup.rotation.y = timeTick * 0.08;
        if (roof) roof.material.emissiveIntensity = 1.0 + Math.sin(timeTick * 4) * 0.25;

        if (beaconGroup) {
            beaconGroup.children.forEach((beacon, idx) => {
                if (beacon.material.opacity > 0) {
                    beacon.material.opacity = 0.5 + Math.sin(timeTick * 10 + idx) * 0.3;
                    const scaleFactor = 1.0 + Math.sin(timeTick * 8 + idx) * 0.15;
                    beacon.scale.set(scaleFactor, scaleFactor, scaleFactor);
                }
            });
        }

        if (ecoGroup) {
            ecoGroup.children.forEach((ecoRing, idx) => {
                if (ecoRing.material.opacity > 0) {
                    ecoRing.rotation.z += 0.005; // Slow eco ring rotation
                    ecoRing.material.opacity = 0.7 + Math.sin(timeTick * 4 + idx) * 0.25;
                }
            });
        }

        if (particles) {
            const positions = particles.geometry.attributes.position.array;
            const colors = particles.geometry.attributes.color.array;
            
            for (let i = 0; i < particleCount; i++) {
                const idx = i * 3;
                // Slow organic wave motion (frequency 0.8, amplitude 0.001)
                positions[idx + 1] += Math.sin(timeTick * 0.8 + positions[idx]) * 0.001;
                
                // Slow color morph blending rate (from 0.08 to 0.03)
                colors[idx] += (targetColors[idx] - colors[idx]) * 0.03;
                colors[idx + 1] += (targetColors[idx + 1] - colors[idx + 1]) * 0.03;
                colors[idx + 2] += (targetColors[idx + 2] - colors[idx + 2]) * 0.03;
            }
            particles.geometry.attributes.position.needsUpdate = true;
            particles.geometry.attributes.color.needsUpdate = true;
        }

        renderer.render(scene, camera);
    }

    animate();

    // Mouse movement
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        camera.position.x += (mouseX * 0.2); // Slower camera tracking
        camera.position.y += (mouseY * 0.15);
        camera.lookAt(0, 0, 0);
    });

    window.addEventListener('resize', () => {
        camera.aspect = canvas.parentElement.clientWidth / canvas.parentElement.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.parentElement.clientWidth, canvas.parentElement.clientHeight);
    });
};

window.toggle3DLayer = function(layer) {
    if (!particles) return;
    
    pathTube.material.opacity = 0.0;
    beaconGroup.children.forEach(b => b.material.opacity = 0.0);
    ecoGroup.children.forEach(e => e.material.opacity = 0.0);

    if (layer === 'crowd') {
        for (let i = 0; i < particleCount; i++) {
            const idx = i * 3;
            const xVal = pPositions[idx];
            const zVal = pPositions[idx + 2];
            const d1 = Math.sqrt((xVal - 30)**2 + (zVal - 30)**2);
            const d2 = Math.sqrt((xVal + 30)**2 + (zVal - 30)**2);
            
            if (d1 < 18 || d2 < 12) {
                targetColors[idx] = 0.93;
                targetColors[idx + 1] = 0.27;
                targetColors[idx + 2] = 0.27;
            } else {
                targetColors[idx] = initialColors[i].r;
                targetColors[idx + 1] = initialColors[i].g;
                targetColors[idx + 2] = initialColors[i].b;
            }
        }
    }
    else if (layer === 'route') {
        pathTube.material.opacity = 0.8;
        for (let i = 0; i < particleCount; i++) {
            const idx = i * 3;
            targetColors[idx] = 0.1;
            targetColors[idx + 1] = 0.15;
            targetColors[idx + 2] = 0.3;
        }
    }
    else if (layer === 'access') {
        beaconGroup.children.forEach(b => b.material.opacity = 0.8);
        for (let i = 0; i < particleCount; i++) {
            const idx = i * 3;
            const xVal = pPositions[idx];
            const yVal = pPositions[idx+1];
            const zVal = pPositions[idx+2];
            
            let closeToAccess = false;
            beaconPositions.forEach(pos => {
                const d = Math.sqrt((xVal - pos.x)**2 + (yVal - pos.y)**2 + (zVal - pos.z)**2);
                if (d < 15) closeToAccess = true;
            });

            if (closeToAccess) {
                targetColors[idx] = 0.06;
                targetColors[idx + 1] = 0.72;
                targetColors[idx + 2] = 0.5;
            } else {
                targetColors[idx] = 0.1;
                targetColors[idx + 1] = 0.1;
                targetColors[idx + 2] = 0.2;
            }
        }
    }
    else if (layer === 'eco') {
        ecoGroup.children.forEach(e => e.material.opacity = 0.9);
        for (let i = 0; i < particleCount; i++) {
            const idx = i * 3;
            const yVal = pPositions[idx + 1];
            
            if (yVal > 11) {
                targetColors[idx] = 0.06;
                targetColors[idx + 1] = 0.72;
                targetColors[idx + 2] = 0.5;
            } else {
                targetColors[idx] = 0.05;
                targetColors[idx + 1] = 0.05;
                targetColors[idx + 2] = 0.1;
            }
        }
    }
    
    logToConsole("SCENE", `Hologram layer switched to: ${layer.toUpperCase()}`);

    // Update active class on layer buttons
    document.querySelectorAll('.layer-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`layerBtn${layer.charAt(0).toUpperCase() + layer.slice(1)}`);
    if (activeBtn) activeBtn.classList.add('active');
};

window.panStadiumCamera = function(gate) {
    if (!camera) return;
    let targetX = 50;
    let targetZ = 65;
    if (gate === 'B') { targetX = -50; targetZ = -65; }
    if (gate === 'C') { targetX = -65; targetZ = 45; }
    
    // Slowed down from 2.2 to 3.8 seconds for smooth transitions
    gsap.to(camera.position, {
        x: targetX,
        y: 32 + Math.random() * 10,
        z: targetZ,
        duration: 3.8,
        ease: 'power2.inOut',
        onUpdate: () => camera.lookAt(0, 0, 0)
    });
};
