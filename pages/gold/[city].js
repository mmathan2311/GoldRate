export default function handler(req, res) {
  const { city } = req.query;

  // Mock gold rates
  const mockRates = {
    delhi: { karat: '24K', unit: 'gram', price: 6000 },
    chennai: { karat: '24K', unit: 'gram', price: 6050 },
    mumbai: { karat: '24K', unit: 'gram', price: 6020 },
    default: { karat: '24K', unit: 'gram', price: 5990 }
  };

  const rate = mockRates[city.toLowerCase()] || mockRates.default;

  res.status(200).json({
    city,
    rates: [rate]
  });
}
