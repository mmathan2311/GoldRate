import Head from 'next/head';
import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export async function getServerSideProps(context) {
  const city = context.params.city;
  const base = process.env.NEXT_PUBLIC_API_BASE || '';
  const apiUrl = base + `/api/rates/gold/${city}`;
  const res = await fetch(apiUrl).catch(()=>null);
  if (!res || !res.ok) return { notFound: true };
  const data = await res.json();
  // Basic mock for history (frontend can call a history API later)
  const hist = [];
  // create a simple 7-day mock history using current 24K price if available
  const row24 = data.rates.find(r => r.karat === '24K' && r.unit === 'gram');
  const price24 = row24 ? Number(row24.price) : null;
  if (price24) {
    for (let i = 6; i >= 0; --i) {
      hist.push({ ts: new Date(Date.now() - i*24*3600*1000).toISOString(), price: price24 * (1 + (Math.random()-0.5)/100) });
    }
  }
  return { props: { data, hist } };
}

export default function CityGold({ data, hist }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!hist || !hist.length) return;
    const ctx = canvasRef.current.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: hist.map(h => new Date(h.ts).toLocaleDateString()),
        datasets: [{
          label: '24K (₹/g)',
          data: hist.map(h => Number(h.price.toFixed(2))),
          tension: 0.2
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
    return () => chart.destroy();
  }, [hist]);

  const row24 = data.rates.find(r => r.karat === '24K' && r.unit === 'gram');
  const row22 = data.rates.find(r => r.karat === '22K' && r.unit === 'gram');

  return (
    <>
      <Head>
        <title>Gold price in {data.city} — {row24 ? `₹${row24.price}/g (24K)` : ''}</title>
        <meta name="description" content={`Live gold price in ${data.city}. Updated ${data.rates[0]?.fetched_at || ''}`} />
      </Head>
      <main style={{padding:20, fontFamily:'Arial, sans-serif'}}>
        <h1>Gold Price — {data.city}</h1>
        <div style={{display:'flex', gap:20, marginBottom:12}}>
          <div>24K: ₹{row24 ? row24.price : '—'} / g</div>
          <div>22K: ₹{row22 ? row22.price : '—'} / g</div>
        </div>

        {/* AdSense placeholder */}
        <div style={{border:'1px dashed #ccc', padding:12, marginBottom:12}}>AdSense slot — paste your code here</div>

        <div style={{height:300}}>
          <canvas ref={canvasRef}></canvas>
        </div>
      </main>
    </>
  );
}
