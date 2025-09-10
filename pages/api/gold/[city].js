export default async function handler(req, res) {
  const { city } = req.query;

  try {
    const apiRes = await fetch(
      `https://api.metals.dev/v1/latest?api_key=${process.env.NEXT_PUBLIC_GOLDAPI_KEY}&currency=INR&metals=XAU`
    );

    if (!apiRes.ok) {
      throw new Error("Failed to fetch from Metals.dev");
    }

    const data = await apiRes.json();
    const pricePerOunce = data.metals?.XAU;
    const pricePerGram = pricePerOunce ? pricePerOunce / 31.1035 : null;

    res.status(200).json({
      city,
      rates: [
        {
          karat: "24K",
          unit: "gram",
          price: pricePerGram ? Math.round(pricePerGram) : 6000,
        },
      ],
    });
  } catch (err) {
    console.error("Metals.dev API error:", err);
    res.status(500).json({
      city,
      rates: [{ karat: "24K", unit: "gram", price: 6000 }],
    });
  }
}
