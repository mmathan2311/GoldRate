export default async function handler(req, res) {
  const { city } = req.query;

  try {
 console.log("API started");
    const apiRes = await fetch(
      `https://api.metals.dev/v1/latest?api_key=${process.env.NEXT_PUBLIC_GOLDAPI_KEY}&currency=INR&metals=XAU,XAG,XPT`
    );

    if (!apiRes.ok) {
      throw new Error("Failed to fetch from Metals.dev");
    }

    const data = await apiRes.json();    
    const ounceToGram = 31.1035;
    const pricePerGram24k = data.metals?.gold / ounceToGram;

    const rates = [
      { karat: "24K", unit: "gram", price: Math.round(pricePerGram24k) },
      { karat: "22K", unit: "gram", price: Math.round(pricePerGram24k * 0.916) },
      { karat: "18K", unit: "gram", price: Math.round(pricePerGram24k * 0.750) },
    ];
  res.status(200).json({ city, rates });
  } catch (err) {
    console.error("Metals.dev API error:", err);
    res.status(500).json({
      city,
      rates: [{ karat: "24K", unit: "gram", price: 6000 }],
    });
  }
}
