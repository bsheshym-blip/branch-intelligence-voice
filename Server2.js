const express = require('express');
const OpenAI = require('openai');

const app = express();

app.use(express.json({ limit: '1mb' }));

// Serve the website from the repository root
app.use(express.static('.'));

// Voice API
app.post('/api/speak', async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'OPENAI_API_KEY غير مضبوط على الخادم'
      });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const text = String(req.body.text || '').trim();

    if (!text) {
      return res.status(400).json({
        error: 'لا يوجد نص'
      });
    }

    const voice = req.body.voice || 'marin';
    const speed = Number(req.body.speed || 1);

    const response = await client.audio.speech.create({
      model: 'gpt-4o-mini-tts',
      voice: voice,
      input: text,
      instructions:
        'Speak in clear natural Arabic. Use a professional Libyan/Arabic business tone. Do not use an Indian, Kashmiri, Urdu, or South Asian accent.',
      speed: Math.max(0.7, Math.min(1.2, speed)),
      response_format: 'mp3'
    });

    const buffer = Buffer.from(await response.arrayBuffer());

    res.set('Content-Type', 'audio/mpeg');
    res.send(buffer);

  } catch (error) {
    res.status(500).json({
      error: error.message || 'فشل توليد الصوت'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Branch Intelligence Voice v4 running');
});
