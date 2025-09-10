// Minimal API route that reads from Postgres and returns latest rates.
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:example@localhost:5432/metals'
});

export default async function handler(req, res) {
  const { metal, city } = req.query;
  if (!metal || !city) return res.status(400).json({ error: 'metal and city required' });
  const q = `
    SELECT metal, city, unit, karat, price, source, fetched_at
    FROM metals_latest
    WHERE metal=$1 AND LOWER(city)=LOWER($2)
    ORDER BY unit, karat
  `;
  try {
    const { rows } = await pool.query(q, [metal, city]);
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.json({ city, metal, rates: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
}
