import Link from 'next/link';

export default function Home() {
  // example city links
  const cities = ['mumbai','chennai','delhi','kolkata','bangalore'];
  return (
    <main style={{padding:20, fontFamily:'Arial, sans-serif'}}>
      <h1>GoldRates Starter</h1>
      <p>A minimal starter. Click a city to view sample gold page:</p>
      <ul>
        {cities.map(c => <li key={c}><Link href={'/gold/' + c}>{c}</Link></li>)}
      </ul>
    </main>
  );
}
