import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  const { city } = req.query;

  try {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const stateKey = city?.toLowerCase() || "default";
    const cacheKey = `goldprice:${stateKey}:${today}`;

    // 1. Check KV first
    const cached = await kv.get(cacheKey);
    if (cached) {
      console.log("✅ Serving from KV cache");
      return res.status(200).json(cached);
    }

    console.log("🌐 Fetching fresh price from Metals.dev API...");

    // 2. Fetch from Metals.dev (only first time for the day)
    const apiRes = await fetch(
      `https://api.metals.dev/v1/latest?api_key=${process.env.NEXT_PUBLIC_GOLDAPI_KEY}&currency=INR&metals=XAU,XAG,XPT`
    );

    if (!apiRes.ok) {
      throw new Error("Failed to fetch from Metals.dev");
    }

    const data = await apiRes.json();
    const ounceToGram = 31.1035;
    const pricePerGram24k = data.metals?.gold / ounceToGram;

    // --- Pricing Logic ---
    const baseMarkup = 1.06;
    const stateAdjustments = {
      chennai: 0.012,
      mumbai: 0.010,
      delhi: 0.009,
      kolkata: 0.011,
      bangalore: 0.010,
      hyderabad: 0.010,
    };
    const adjustment = stateAdjustments[stateKey] || 0.010;
    const finalFactor = baseMarkup * (1 + adjustment);

    // 3. Rates Calculation
    const rates = [
      { karat: "24K", unit: "gram", price: Math.round(pricePerGram24k * finalFactor) },
      { karat: "22K", unit: "gram", price: Math.round(pricePerGram24k * 0.916 * finalFactor) },
      { karat: "18K", unit: "gram", price: Math.round(pricePerGram24k * 0.750 * finalFactor) },
    ];

    const responseData = { city: stateKey, date: today, rates };

    // 4. Save to KV for 7 days (but practically, you’ll fetch daily)
    await kv.set(cacheKey, responseData, { ex: 60 * 60 * 24 * 7 });

    res.status(200).json(responseData);
  } catch (err) {
    console.error("Metals.dev API error:", err);
    res.status(500).json({
      city,
      rates: [{ karat: "24K", unit: "gram", price: 6000 }],
    });
  }
}
