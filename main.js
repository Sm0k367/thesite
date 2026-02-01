/* -------------------------------------------------
   Epic Tech AI – client side (Three.js + Socket.io)
   ------------------------------------------------- */
(() => {
  // ------------------- GLOBALS --------------------
  const canvas = document.getElementById('glCanvas');
  const socket = io(); // assumes same origin
  const chatLog = document.getElementById('chat-log');
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-btn');

  // three.js essentials
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(0, 2, 8);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // orbit controls (touch friendly)
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 5;
  controls.maxDistance = 15;

  // ------------------- POST‑PROCESSING --------------------
  const composer = new THREE.EffectComposer(renderer);
  const renderPass = new THREE.RenderPass(scene, camera);
  composer.addPass(renderPass);

  const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.2, 0.4, 0.85);
  bloomPass.threshold = 0;
  bloomPass.strength = 1.8;
  bloomPass.radius = 0.6;
  composer.addPass(bloomPass);

  const glitchPass = new THREE.GlitchPass();
  glitchPass.goWild = false; // set true for occasional mega‑glitches
  composer.addPass(glitchPass);

  // ------------------- BACKGROUND (nebula) --------------------
  const texLoader = new THREE.TextureLoader();
  
  // Create a simple gradient nebula if image fails to load
  const canvas2d = document.createElement('canvas');
  canvas2d.width = 512;
  canvas2d.height = 512;
  const ctx = canvas2d.getContext('2d');
  const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 512);
  gradient.addColorStop(0, '#1a0033');
  gradient.addColorStop(0.5, '#330066');
  gradient.addColorStop(1, '#000000');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);
  const nebulaTexture = new THREE.CanvasTexture(canvas2d);
  scene.background = nebulaTexture;

  // ------------------- PARTICLE FIELD (cannabis leaf) --------------------
  // Create a simple leaf shape if image fails
  const leafCanvas = document.createElement('canvas');
  leafCanvas.width = 64;
  leafCanvas.height = 64;
  const leafCtx = leafCanvas.getContext('2d');
  leafCtx.fillStyle = '#00ff88';
  leafCtx.beginPath();
  leafCtx.ellipse(32, 32, 20, 28, 0.3, 0, Math.PI * 2);
  leafCtx.fill();
  const leafTexture = new THREE.CanvasTexture(leafCanvas);

  const leafGeo = new THREE.PlaneGeometry(0.8, 0.8);
  const leafMat = new THREE.MeshBasicMaterial({
    map: leafTexture,
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const leafParticles = new THREE.Group();
  const leafCount = 120;
  for (let i = 0; i < leafCount; i++) {
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.position.set(
      (Math.random() - 0.5) * 30,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 30
    );
    leaf.rotation.z = Math.random() * Math.PI * 2;
    leaf.scale.setScalar(0.5 + Math.random() * 0.8);
    leafParticles.add(leaf);
  }
  scene.add(leafParticles);

  // ------------------- CENTRAL AI AVATAR --------------------
  // Create a simple glowing sphere avatar if image fails
  const avatarGeo = new THREE.IcosahedronGeometry(1, 4);
  const avatarMat = new THREE.MeshBasicMaterial({
    color: 0xff00ff,
    wireframe: false,
    emissive: 0xff00ff,
    emissiveIntensity: 0.8,
  });
  const avatar = new THREE.Mesh(avatarGeo, avatarMat);
  avatar.position.set(0, 1, 0);
  scene.add(avatar);

  // subtle pulse animation (idle)
  const pulse = { scale: 1 };
  gsap.to(pulse, {
    scale: 1.08,
    duration: 2,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
    onUpdate: () => avatar.scale.setScalar(pulse.scale),
  });

  // ------------------- SOUND SETUP --------------------
  const sounds = {
    ambient: new Howl({ 
      src: ['data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=='], 
      loop: true, 
      volume: 0.3 
    }),
    whoosh: new Howl({ 
      src: ['data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=='], 
      volume: 0.6 
    }),
    exhale: new Howl({ 
      src: ['data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=='], 
      volume: 0.5 
    }),
    glitch: new Howl({ 
      src: ['data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=='], 
      volume: 0.4 
    })
  };
  sounds.ambient.play();

  // ------------------- TEXT MESH HELPERS --------------------
  const textGroup = new THREE.Group(); // holds all floating messages
  scene.add(textGroup);

  const createFloatingText = (msg, isUser = true) => {
    const txt = new TroikaText();
    txt.text = msg;
    txt.fontSize = 0.4;
    txt.color = isUser ? '#00ffae' : '#ff00ff';
    txt.anchorX = 'center';
    txt.anchorY = 'middle';
    txt.outlineWidth = 0.02;
    txt.outlineColor = isUser ? '#004d33' : '#660066';
    txt.position.set(
      (Math.random() - 0.5) * 6,
      isUser ? -2 : 4, // start off‑screen (bottom vs top)
      (Math.random() - 0.5) * 4
    );
    txt.sync(); // required for Troika

    // animate into view
    const targetY = isUser ? Math.random() * 2 + 0.5 : Math.random() * -1 - 0.5;
    gsap.to(txt.position, {
      y: targetY,
      duration: 1.2,
      ease: 'power2.out',
      onComplete: () => {
        // fade out after a while
        gsap.to(txt.material, {
          opacity: 0,
          delay: 8,
          duration: 2,
          onComplete: () => textGroup.remove(txt)
        });
      }
    });

    textGroup.add(txt);
  };

  // ------------------- SOCKET.IO HANDLERS --------------------
  socket.on('connect', () => console.log('🔗 socket connected'));

  socket.on('bot-reply', (payload) => {
    // payload: { text:string, isEaster?:boolean }
    addMessageToLog('bot', payload.text);
    createFloatingText(payload.text, false);
    sounds.exhale.play();

    // typing indicator handling (see later)
    hideTypingIndicator();
  });

  // typing indicator (simple glitchy dots)
  const typingDots = new TroikaText();
  typingDots.text = '...';
  typingDots.fontSize = 0.5;
  typingDots.color = '#ff66ff';
  typingDots.anchorX = 'center';
  typingDots.anchorY = 'bottom';
  typingDots.position.set(0, -2.2, 0);
  typingDots.visible = false;
  typingDots.sync();
  textGroup.add(typingDots);

  const showTypingIndicator = () => {
    typingDots.visible = true;
    gsap.fromTo(
      typingDots.material,
      { opacity: 0 },
      { opacity: 1, repeat: -1, yoyo: true, duration: 0.8 }
    );
  };
  const hideTypingIndicator = () => {
    typingDots.visible = false;
    gsap.killTweensOf(typingDots.material);
    typingDots.material.opacity = 0;
  };

  // ------------------- UI LOGIC --------------------
  const addMessageToLog = (who, txt) => {
    const el = document.createElement('div');
    el.innerHTML = `<strong>${who === 'user' ? '🧑‍🚀' : '🤖'}:</strong> ${txt}`;
    chatLog.appendChild(el);
    chatLog.scrollTop = chatLog.scrollHeight;
  };

  const sendMessage = () => {
    const raw = input.value.trim();
    if (!raw) return;
    input.value = '';
    addMessageToLog('user', raw);
    createFloatingText(raw, true);
    sounds.whoosh.play();

    // Avatar "caffeine jitter" reaction
    gsap.fromTo(
      avatar.rotation,
      { z: 0 },
      { z: Math.random() * 0.2 - 0.1, duration: 0.12, yoyo: true, repeat: 5, ease: 'elastic.out(1,0.4)' }
    );

    // Easter‑egg handling before hitting server
    if (/light\s*up|puff\s*puff\s*pass/i.test(raw)) {
      // smoke burst
      emitSmokeBurst();
      // still forward to bot (so it can reply)
    }
    if (raw === '1111') {
      // awakening flash
      flashScreen('#ff00ff');
      addMessageToLog('bot', '✨ 1111 – the universe winks. Keep vibing! ✨');
      return; // don't hit server (demo)
    }
    if (raw === '333') {
      flashScreen('#00ffae');
      addMessageToLog('bot', '🙌 333 gratitude overload! Thank you for the love 🙏');
      return;
    }

    // emit to server
    socket.emit('user-message', raw);
    showTypingIndicator();
  };

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  // ------------------- VISUAL FX HELPERS --------------------
  function emitSmokeBurst() {
    const particleGeo = new THREE.SphereGeometry(0.08, 6, 6);
    const particleMat = new THREE.MeshBasicMaterial({
      color: 0x88ff88,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });
    const burst = new THREE.Group();
    for (let i = 0; i < 30; i++) {
      const p = new THREE.Mesh(particleGeo, particleMat);
      p.position.copy(avatar.position);
      const dir = new THREE.Vector3(
        (Math.random() - 0.5),
        Math.random() * 0.8 + 0.2,
        (Math.random() - 0.5)
      ).normalize();
      p.userData.vel = dir.multiplyScalar(0.02 + Math.random() * 0.02);
      burst.add(p);
    }
    scene.add(burst);
    gsap.to(burst.position, { y: '+=' + 2, duration: 1.2, ease: 'power2.out' });
    gsap.to(burst.scale, { x: 2, y: 2, z: 2, duration: 1.2 });
    gsap.to(burst.children.map(c => c.material), { opacity: 0, duration: 1.2, onComplete: () => scene.remove(burst) });
    sounds.exhale.play();
  }

  function flashScreen(color = '#ff00ff') {
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.inset = '0';
    flash.style.background = color;
    flash.style.opacity = '0';
    flash.style.pointerEvents = 'none';
    document.body.appendChild(flash);
    gsap.fromTo(flash, { opacity: 0.7 }, { opacity: 0, duration: 0.6, ease: 'power2.out', onComplete: () => flash.remove() });
  }

  // ------------------- RENDER LOOP --------------------
  function animate() {
    requestAnimationFrame(animate);
    controls.update();

    // slowly rotate leaf particles for a floating vibe
    leafParticles.rotation.y += 0.0002;

    // camera subtle bobbing (to keep things "alive")
    camera.position.y = 2 + Math.sin(Date.now() * 0.0015) * 0.1;

    composer.render();
  }
  animate();

  // ------------------- Resize Handler --------------------
  window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer.setSize(w, h);
  });
})();
