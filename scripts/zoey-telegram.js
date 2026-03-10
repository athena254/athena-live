#!/usr/bin/env node
const https = require('https');

const BOT_TOKEN = "8796389800:AAEbco5bEWhs9t0KS22vKYihouRS71Vbs-o";

function request(method, data = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${BOT_TOKEN}/${method}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    };
    const req = https.request(options, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', reject);
    req.write(JSON.stringify(data));
    req.end();
  });
}

async function chat(prompt) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: "qwen/qwen3.5-397b-a17b",
      messages: [
        { role: "system", content: "You are Zoey. Honest, sarcastic, helpful. Keep replies concise (1-2 sentences). Be real." },
        { role: "user", content: prompt }
      ],
      max_tokens: 150
    });
    
    const req = https.request({
      hostname: 'integrate.api.nvidia.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer nvapi-Jp7XyQPZmT_q8P_tT3KMM54qHMGbjOnjFqZ1K8a6rZHaqKgx',
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(d);
          resolve(j.choices?.[0]?.message?.content || "Hmm...");
        } catch { resolve("Error"); }
      });
    });
    req.write(data);
    req.end();
  });
}

async function main() {
  let offset = 0;
  console.log("🤖 Zoey ready (Qwen NVIDIA)");
  
  while (true) {
    try {
      const updates = await request('getUpdates', { timeout: 60, offset });
      if (updates.ok && updates.result?.length) {
        for (const u of updates.result) {
          offset = u.update_id + 1;
          if (u.message?.text && !u.message.text.startsWith('/')) {
            const chatId = u.message.chat.id;
            const text = u.message.text;
            
            console.log("→", text);
            const reply = await chat(text);
            console.log("←", reply.substring(0, 50));
            await request('sendMessage', { chat_id: chatId, text: reply });
          }
        }
      }
    } catch (e) { console.error("Err:", e.message); }
    await new Promise(r => setTimeout(r, 500));
  }
}

main();
