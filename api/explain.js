export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { question, userAnswer, correctAnswer, topic } = req.body;
  if (!question || !correctAnswer) return res.status(400).json({ error: 'Missing fields' });

  const key = process.env.GROQ_API_KEY;
  if (!key) return res.status(500).json({ error: 'GROQ_API_KEY not configured' });

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 512,
        messages: [
          { role: 'system', content: `You are a friendly, encouraging study tutor. Explain answers clearly and concisely in a way a student would understand. Use simple language. Topic context: ${topic || 'general'}.` },
          { role: 'user', content: `Question: ${question}\n${userAnswer ? `Student's answer: ${userAnswer}\n` : ''}Correct answer: ${correctAnswer}\n\nExplain why the correct answer is right. If the student got it wrong, gently explain the mistake.` }
        ]
      })
    });

    if (!groqRes.ok) {
      const err = await groqRes.text();
      return res.status(500).json({ error: 'Groq API error', detail: err });
    }

    const data = await groqRes.json();
    return res.status(200).json({ explanation: data.choices[0].message.content });
  } catch (e) {
    return res.status(500).json({ error: 'Server error', detail: e.message });
  }
}
