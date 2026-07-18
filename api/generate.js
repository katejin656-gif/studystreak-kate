export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { topic, count, difficulty } = req.body;
  if (!topic) return res.status(400).json({ error: 'Missing topic' });

  const key = process.env.GROQ_API_KEY;
  if (!key) return res.status(500).json({ error: 'GROQ_API_KEY not configured' });

  const num = Math.min(Math.max(parseInt(count) || 5, 1), 20);
  const diff = difficulty || 'Medium';

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.8,
        max_tokens: 2048,
        messages: [
          { role: 'system', content: 'You generate multiple-choice quiz questions. Always respond with valid JSON only, no markdown, no explanation.' },
          { role: 'user', content: `Generate ${num} multiple-choice questions about "${topic}" at ${diff} difficulty level.\n\nReturn a JSON array like:\n[\n  {\n    "q": "Question text?",\n    "opts": ["A", "B", "C", "D"],\n    "answer": 0,\n    "explain": "Brief explanation"\n  }\n]\n\nRules:\n- "answer" is the 0-based index of the correct option\n- Each question has exactly 4 options\n- Make questions educational and accurate\n- Vary question types (definitions, applications, comparisons)\n- Return ONLY the JSON array, nothing else` }
        ]
      })
    });

    if (!groqRes.ok) {
      const err = await groqRes.text();
      return res.status(500).json({ error: 'Groq API error', detail: err });
    }

    const data = await groqRes.json();
    const content = data.choices[0].message.content;

    let questions;
    try {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      questions = JSON.parse(cleaned);
    } catch {
      return res.status(500).json({ error: 'Failed to parse AI response as JSON', raw: content });
    }

    return res.status(200).json({ questions });
  } catch (e) {
    return res.status(500).json({ error: 'Server error', detail: e.message });
  }
}
