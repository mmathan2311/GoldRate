export async function getServerSideProps({ params, req }) {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    `http://${req.headers.host}`;

  const res = await fetch(`${baseUrl}/api/gold/${params.city}`);
  const data = await res.json();

  return { props: { data } };
}

export default function GoldPage({ data }) {
  if (!data) {
    return <p>Unable to fetch gold rate.</p>;
  }

  return (
    <div style={{ fontFamily: "sans-serif", padding: "20px" }}>
      <h1>Gold Rate in {data.city}</h1>
      {data.rates.map((rate, idx) => (
        <p key={idx}>
          {rate.karat} — {rate.price} INR per {rate.unit}
        </p>
      ))}
    </div>
  );
}
