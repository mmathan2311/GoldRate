import Head from 'next/head';

export async function getServerSideProps(context) {
  const city = context?.params?.city || null;

  if (!city) {
    return {
      notFound: true, // if no city param -> show 404
    };
  }

  // Build API URL (using Next.js API routes or external API)
  const base = process.env.NEXT_PUBLIC_API_BASE || '';
  const apiURL = base + `/api/rates/gold/${city}`;

  let data = { rates: [] };

  try {
    const res = await fetch(apiURL);
    if (res.ok) {
      data = await res.json();
    }
  } catch (err) {
    console.error("API fetch failed:", err);
  }

  // fallback mock if API fails
  if (!data || !data.rates || data.rates.length === 0) {
    data = {
      rates: [{ karat: '24K', unit: 'gram', price: 6000 }],
    };
  }

  return {
    props: { data, city },
  };
}

export default function CityGold({ data, city }) {
  if (!city) {
    return <h1>No city provided</h1>;
  }

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <Head>
        <title>Gold Price in {city}</title>
        <meta name="description" content={`Today's gold price in ${city}`} />
      </Head>

      <h1>Gold Price in {city}</h1>

      {data.rates.length > 0 ? (
        <p>
          {data.rates[0].karat} Gold: ₹{data.rates[0].price} per {data.rates[0].unit}
        </p>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
}
