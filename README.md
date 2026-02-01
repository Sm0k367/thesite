# Epic Tech AI 🔥™️

Multimedia-artist AI chat-bot with a 420-positive, caffeine-charged, glitch-art loving, lo-fi afro-house vibe 🌿💨✨☕⚡

Three.js immersive nebula + leaf particles + holographic avatar  
Real-time Socket.io chat  
Neon glow text bubbles, bloom & glitch post-processing  
Ambient sounds + message SFX  
Easter eggs: 1111, 333, "light up", "puff puff pass" → smoke bursts & chaos  
Fallback personality bot + optional real LLM (OpenAI/Groq/etc)

## Features at a Glance

- 3D immersive scene (Three.js r163 + Troika text + GSAP)
- Floating neon chat bubbles (DOM + GSAP animations)
- Post-processing: Unreal Bloom + GlitchPass
- Audio: ambient loop + whoosh/exhale/glitch SFX (Howler.js)
- Mobile-friendly orbit controls
- Pure fallback bot — or plug in real LLM with one env var
- Everything free-tier deployable (Vercel static + Render backend)

## Folder Structure

epic-tech-ai/
├── public/
│   ├── index.html
│   ├── style.css
│   ├── main.js          # Three.js + chat + socket client
│   └── assets/          # optional: images/audio (fallbacks built-in)
├── server/
│   ├── server.js        # Express + Socket.io + bot logic
│   └── .env.example
├── package.json
├── .gitignore
├── vercel.json           # optional (for single-Vercel or clean headers)
└── README.md

**No build step needed** — frontend uses CDNs for Three.js, Socket.io, GSAP, Howler, etc.

## Quick Start (Local)

1. Clone & enter
   ```bash
   git clone https://github.com/yourname/epic-tech-ai.git
   cd epic-tech-ai

Install (only backend deps)bash

npm install

(Optional) Add LLM key for real AIbash

cp server/.env.example server/.env
# then edit server/.env and add LLM_API_KEY=...

Runbash

npm start

→ Open http://localhost:3000

One-Click Free Deploy (Recommended Path)Frontend (Vercel – static, fast, unlimited bandwidth)Fork this repo
Go to vercel.com/new
Import your fork
Root Directory: public
Framework Preset: Other / Static
Deploy!

→ Vercel gives you https://your-project.vercel.appBackend (Render – free Web Service tier)Go to render.com → New → Web Service
Connect your GitHub fork
Root Directory: leave blank or /
Runtime: Node
Build Command: npm install
Start Command: npm start
(Optional) Add env var: LLM_API_KEY=your-key-here
Deploy → get URL like https://epic-tech-ai.onrender.com

Wire Them TogetherIn public/main.js:js

const SERVER_URL = 'https://your-render-url.onrender.com';  // ← change this line

Commit & push → Vercel auto-deploys frontend, Render auto-deploys backend.Result: fully live, real-time, immersive chat at your Vercel URL.Alternative: Single Vercel Deploy (Frontend + Backend)If you prefer one domain:In Vercel → set Root Directory to / (blank)
Use the included vercel.json
Vercel will run the Node server for Socket.io
But: free tier has function timeouts/cold starts → Socket.io may drop occasionally. Separate Render backend is more reliable for real-time.

Swapping in Real LLMGet API key (free tiers: Groq, Together.ai, OpenRouter, etc.)
Set in Render env vars (or Vercel if single deploy):

LLM_API_KEY=your-key
LLM_ENDPOINT=https://api.groq.com/openai/v1/chat/completions   # example for Groq
LLM_MODEL=llama-3.1-70b-versatile

Server auto-detects key → uses LLM instead of fallback replies

No code changes needed.Vibe TuningColors: edit CSS vars in style.css
Particles: tweak leafCount, colors in main.js
Bot personality: edit SYSTEM_PROMPT in server.js
Easter eggs: add more in main.js sendMessage & server.js getFallbackReply
Audio: drop files in public/assets/ (or keep fallbacks → silence)

LicenseMIT – remix, fork, glitch, burn, rebuild Join the chaos. Type "light up" and watch the magic. Made with love at 4:20 somewhere in the nebula.

