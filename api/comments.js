import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT id, section, message, created_at FROM comments ORDER BY id DESC LIMIT 100`;
      return res.status(200).json(rows);
    }
    if (req.method === 'POST') {
      const { section, message } = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body ?? {});
      const sec = String(section ?? '').trim().slice(0, 200);
      const msg = String(message ?? '').trim().slice(0, 2000);
      if (!msg) return res.status(400).json({ error: 'Message is required' });
      const [row] = await sql`INSERT INTO comments (section, message) VALUES (${sec}, ${msg}) RETURNING id, section, message, created_at`;
      return res.status(201).json(row);
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}
