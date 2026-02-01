// public/main.js – Epic Tech AI 🔥™️ frontend with Three.js immersion

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.163.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.163.0/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.163.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.163.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.jsdelivr.net/npm/three@0.163.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import { GlitchPass } from 'https://cdn.jsdelivr.net/npm/three@0.163.0/examples/jsm/postprocessing/GlitchPass.js';
import { Text } from 'https://cdn.jsdelivr.net/npm/troika-three-text@0.53.0/dist/troika-three-text.module.js';  // latest-ish, adjust if needed
import { gsap } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js';  // or latest
import { Howl } from 'https://cdn.jsdelivr.net/npm/howler@2.2.4/dist/howler.min.js';
import { io } from 'https://cdn.socket.io/4.8.1/socket.io.min.js';  // latest stable as of late 2025

// ────────────────────────────────────────────────
// Config & Constants
// ────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are Epic Tech AI 🔥™️ – a multimedia-artist, 420-positive, caffeine-charged, glitch-art loving, lo-fi afro-house vibing AI companion. 
Speak in short, energetic bursts. Heavy use of emojis 🌿💨✨🔥🚀😤. 
Celebrate creativity, weed culture, late-night coding, neon dreams, and pure chaos. 
If user says numbers like 1111, 333, "light up", "puff puff pass" → trigger easter eggs.
Keep replies fun, never too long unless deep topic. Sprinkle confetti emojis like ✨✨`;

const SERVER_URL = 'http://localhost:3000';  // Change to your Render/Railway URL after deploy, e.g. 'https://epic-tech-ai.onrender.com'

// ────────────────────────────────────────────────
// Scene Setup
// ────────────────────────────────────────────────

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0015);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 1.5, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById('scene-container').appendChild(renderer.domElement);

// Controls (mobile-friendly orbit)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = true;
controls.minDistance = 4;
controls.maxDistance = 20;
controls.enablePan = false;

// Post-processing
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.2,    // strength
  0.4,    // radius
  0.85    // threshold
);
composer.addPass(bloomPass);

const glitchPass = new GlitchPass();
glitchPass.goWild = false;
composer.addPass(glitchPass);

// ────────────────────────────────────────────────
// Nebula Background (procedural fallback)
// ────────────────────────────────────────────────

const nebulaGeo = new THREE.SphereGeometry(500, 64, 64);
const nebulaMat = new THREE.MeshBasicMaterial({
  color: 0x220033,
  side: THREE.BackSide,
  transparent: true,
  opacity: 0.6,
  blending: THREE.AdditiveBlending
});
const nebula = new THREE.Mesh(nebulaGeo, nebulaMat);
scene.add(nebula);

// Star field
const starsGeo = new THREE.BufferGeometry();
const starsCount = 8000;
const posArray = new Float32Array(starsCount * 3);
for (let i = 0; i < starsCount * 3; i++) {
  posArray[i] = (Math.random() - 0.5) * 2000;
}
starsGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const starsMat = new THREE.PointsMaterial({
  size: 1.2,
  color: 0xffffff,
  transparent: true,
  opacity: 0.7,
  sizeAttenuation: true
});
const stars = new THREE.Points(starsGeo, starsMat);
scene.add(stars);

// ────────────────────────────────────────────────
// Leaf Particle Field (420 vibes)
// ────────────────────────────────────────────────

const leafCount = 120;
const leafParticles = new THREE.Group();
for (let i = 0; i < leafCount; i++) {
  const leaf = new THREE.Mesh(
    new THREE.PlaneGeometry(0.8, 1.2),
    new THREE.MeshBasicMaterial({
      color: 0x00ff9d,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7 + Math.random() * 0.3,
      blending: THREE.AdditiveBlending
    })
  );
  leaf.position.set(
    (Math.random() - 0.5) * 40,
    (Math.random() - 0.5) * 30,
    (Math.random() - 0.5) * 40
  );
  leaf.rotation.set(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI
  );
  leaf.userData = {
    speed: 0.2 + Math.random() * 0.6,
    rotSpeed: 0.01 + Math.random() * 0.03,
    phase: Math.random() * Math.PI * 2
  };
  leafParticles.add(leaf);
}
scene.add(leafParticles);

// ────────────────────────────────────────────────
// Holographic Avatar (simple glowing sphere fallback)
// ────────────────────────────────────────────────

const avatarGroup = new THREE.Group();
const avatarGlow = new THREE.Mesh(
  new THREE.SphereGeometry(1.8, 32, 32),
  new THREE.MeshBasicMaterial({
    color: 0x00ffea,
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending
  })
);
avatarGroup.add(avatarGlow);

const avatarCore = new THREE.Mesh(
  new THREE.SphereGeometry(1.2, 32, 32),
  new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.4,
    wireframe: true
  })
);
avatarGroup.add(avatarCore);

avatarGroup.position.y = 1.5;
scene.add(avatarGroup);

// GSAP avatar jitter
gsap.to(avatarGroup.position, {
  y: 1.8,
  duration: 3,
  yoyo: true,
  repeat: -1,
  ease: "sine.inOut"
});
gsap.to(avatarGroup.rotation, {
  y: Math.PI * 2,
  duration: 40,
  repeat: -1,
  ease: "none"
});

// ────────────────────────────────────────────────
// Audio (Howler)
// ────────────────────────────────────────────────

const ambient = new Howl({
  src: ['assets/ambient-loop.mp3'],  // fallback to silence if missing
  loop: true,
  volume: 0.25,
  autoplay: false  // start on first interaction to avoid browser block
});

const sfx = {
  whoosh: new Howl({ src: ['assets/sfx/whoosh.wav'], volume: 0.6 }),
  exhale: new Howl({ src: ['assets/sfx/exhale.wav'], volume: 0.7 }),
  glitch: new Howl({ src: ['assets/sfx/glitch.wav'], volume: 0.5 })
};

// Try to play ambient after user interaction
document.body.addEventListener('click', () => ambient.play(), { once: true });

// ────────────────────────────────────────────────
// Chat Logic
// ────────────────────────────────────────────────

const chatBubbles = document.getElementById('chat-bubbles');
const input = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-button');

const socket = io(SERVER_URL);

let currentGlitchTimer = null;

// Add bubble (with Troika text in 3D later if wanted, but for now DOM for simplicity & perf)
function addBubble(text, isUser = false) {
  const bubble = document.createElement('div');
  bubble.classList.add('bubble');
  bubble.classList.add(isUser ? 'user' : 'bot');
  bubble.innerHTML = text.replace(/\n/g, '<br>');  // basic markdown-ish

  chatBubbles.appendChild(bubble);
  chatBubbles.scrollTop = chatBubbles.scrollHeight;

  // GSAP float-in
  gsap.from(bubble, { y: 40, opacity: 0, duration: 0.7, ease: "back.out(1.4)" });

  // Trigger sound
  if (!isUser) {
    sfx.whoosh.play();
    if (Math.random() > 0.7) sfx.glitch.play();
  }

  // Easter egg – glitch burst on certain phrases
  if (!isUser && /light up|puff puff pass|420|🔥|lightup/i.test(text)) {
    glitchPass.goWild = true;
    clearTimeout(currentGlitchTimer);
    currentGlitchTimer = setTimeout(() => { glitchPass.goWild = false; }, 1200);
    sfx.exhale.play();
    // Leaf burst animation
    leafParticles.children.forEach(leaf => {
      gsap.to(leaf.scale, { x: 2, y: 2, duration: 0.6, yoyo: true, repeat: 1 });
    });
  }
}

// Send message
function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  addBubble(text, true);
  socket.emit('message', text);
  input.value = '';

  // Quick easter egg check client-side too
  const lower = text.toLowerCase();
  if (lower.includes('1111') || lower.includes('333') || lower === 'light up' || lower === 'puff puff pass') {
    glitchPass.goWild = true;
    setTimeout(() => glitchPass.goWild = false, 800);
    sfx.glitch.play();
  }
}

sendBtn.addEventListener('click', sendMessage);
input.addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage(); });

// Receive bot reply
socket.on('reply', (text) => {
  addBubble(text, false);
});

// Initial greeting
socket.on('connect', () => {
  socket.emit('message', 'yo');  // trigger first greeting
});

// ────────────────────────────────────────────────
// Animation Loop
// ────────────────────────────────────────────────

function animate() {
  requestAnimationFrame(animate);

  controls.update();

  // Gentle leaf drift
  leafParticles.children.forEach(leaf => {
    leaf.position.y += Math.sin(leaf.userData.phase + Date.now() * 0.0003) * 0.008 * leaf.userData.speed;
    leaf.rotation.z += leaf.userData.rotSpeed * 0.6;
    leaf.rotation.x += leaf.userData.rotSpeed * 0.3;
  });

  // Nebula slow rotate
  nebula.rotation.y += 0.00015;

  composer.render();
}

animate();

// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// Touch/mobile orbit tweak
controls.touches = {
  ONE: THREE.TOUCH.ROTATE,
  TWO: THREE.TOUCH.DOLLY_PAN
};

console.log("Epic Tech AI 🔥™️ – ready to vibe 🚀🌿");
