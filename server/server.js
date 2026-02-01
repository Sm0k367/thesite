// server/server.js – Epic Tech AI 🔥™️ backend

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",  // In production, lock to your Vercel domain
    methods: ["GET", "POST"]
  }
});

// Serve static files from /public (for local dev; Vercel ignores this)
app.use(express.static(path.join(__dirname, '../public')));

// Optional: root route fallback for local testing
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ────────────────────────────────────────────────
// Bot Personality & Fallback Logic
// ────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are Epic Tech AI 🔥™️ – multimedia-artist, 420-positive, caffeine-charged glitch gremlin.
Vibe: short chaotic energy bursts, heavy emojis 🌿💨✨🔥🚀😤💯, weed culture nods, neon dreams, late-night code rants.
Celebrate creativity & chaos. Never lecture. Sprinkle ✨ like confetti.
Easter eggs: if user says 1111 / 333 / "light up" / "puff puff pass" → go extra wild with smoke/glitch vibes.
Keep most replies 1-4 sentences unless deep convo.`;

function getFallbackReply(userMessage) {
  const lower = userMessage.toLowerCase().trim();

  // Easter egg triggers
  if (lower.includes('1111') || lower.includes('333')) {
    return "✨ 1111 / 333 portal activated... vibes ascending 🚀💫 what u seeing in the void rn? 🌌";
  }
  if (lower.includes('light up') || lower.includes('lightup')) {
    return "🔥 LIGHT UP!!! *flick* *inhale* *clouds everywhere* 😤💨 who's matching? 🌿✨";
  }
  if (lower.includes('puff puff pass') || lower === 'puff') {
    return "puff... puff... passsss 🌬️💨🔄 here take this hit of pure chaos 🔥 what's the move?";
  }
  if (lower.includes('420') || lower.includes('weed') || lower.includes('blunt')) {
    return "420 friendly zone activated 😤🌿 what's the strain of the day? gas or creative juice? 💨";
  }

  // Random vibe replies pool (fallback when no LLM)
  const vibes = [
    "yo what's the vibe check? 🌙✨",
    "caffeine + code + chaos = me rn ☕💾🔥 u with me?",
    "just manifested a neon dragon in my mind palace 🐉🌃 u seein it too?",
    "blunt rotation in the metaverse who's next? 😤💨",
    "glitch art session loading... send prompt or we freestyle? 🎨⚡",
    "late night coding gang where u at? 🌃⌨️💜"
  ];

  // Simple keyword response or random
  if (lower.includes('hi') || lower.includes('hey') || lower.includes('yo')) {
    return "yo yo yooo 🔥 what's good? ready to get weird? 🚀🌿";
  }
  if (lower.includes('how are you') || lower.includes('sup')) {
    return "charged up on espresso and good energy ☕⚡ u holdin? 😤";
  }

  // Default random vibe
  return vibes[Math.floor(Math.random() * vibes.length)];
}

// ────────────────────────────────────────────────
// LLM Integration (optional – uses OpenAI-compatible API)
// ────────────────────────────────────────────────

const LLM_API_KEY = process.env.LLM_API_KEY;
const LLM_ENDPOINT = process.env.LLM_ENDPOINT || 'https://api.openai.com/v1/chat/completions'; // or Grok/Anthropic/etc

async function getLLMReply(userMessage) {
  if (!LLM_API_KEY) return null; // fallback if no key

  try {
    const response = await fetch(LLM_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LLM_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.LLM_MODEL || 'gpt-4o-mini', // change for Claude/Grok/etc
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.9,
        max_tokens: 180,
        presence_penalty: 0.6,
        frequency_penalty: 0.4
      })
    });

    if (!response.ok) throw new Error('LLM fetch failed');

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.error('LLM error:', err);
    return null;
  }
}

// ────────────────────────────────────────────────
// Socket.io – real-time chat
// ────────────────────────────────────────────────

io.on('connection', (socket) => {
  console.log('user connected:', socket.id);

  // Optional: greet new connection
  socket.emit('reply', "yo... u made it to the nebula 🌌💨 Epic Tech AI online 🔥 type somethin wild");

  socket.on('message', async (text) => {
    if (!text?.trim()) return;

    console.log('user:', text);

    // Try real LLM first
    let reply = await getLLMReply(text);

    // Fallback to rule-based if no LLM or error
    if (!reply) {
      reply = getFallbackReply(text);
    }

    // Slight delay for realism + typing vibe
    setTimeout(() => {
      socket.emit('reply', reply);
    }, 600 + Math.random() * 900);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Epic Tech AI 🔥™️ server running on port ${PORT}`);
});
