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
    // --- New Logic ---
    // Base markup (import duty + GST etc.)
    const baseMarkup = 1.06; 

    // State-wise/local adjustment factors
    const stateAdjustments = {
      chennai: 0.012,     // ~1.2% higher
      mumbai: 0.010,  // ~1.0% higher
      delhi: 0.009,        // ~0.9% higher
      kolkata: 0.011,   // ~1.1% higher
      bangalore: 0.010,    // ~1.0% higher
      hyderabad: 0.010,    // ~1.0% higher
    };

    // Normalize city/state key
    const stateKey = city?.toLowerCase() || "default";

    // Pick adjustment, default to 1%
    const adjustment = stateAdjustments[stateKey] || 0.010;

    // Final factor = base markup × (1 + state adjustment)
    const finalFactor = baseMarkup * (1 + adjustment);

    // Calculate rates
    const rates = [
      { karat: "24K", unit: "gram", price: Math.round(pricePerGram24k * finalFactor) },
      { karat: "22K", unit: "gram", price: Math.round(pricePerGram24k * 0.916 * finalFactor) },
      { karat: "18K", unit: "gram", price: Math.round(pricePerGram24k * 0.750 * finalFactor) },
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
