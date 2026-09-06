export default function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const keyId = (process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || '').trim();
  const isConfigured = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  const isLiveMode = keyId.startsWith('rzp_live_') || (!keyId.startsWith('rzp_test_') && keyId.length > 5);

  return res.status(200).json({
    success: true,
    keyId,
    isConfigured,
    mode: isLiveMode ? 'LIVE' : 'TEST',
    freeShippingThreshold: 999,
    pricesIncludeGst: true,
    supportedMethods: ['UPI', 'CARD', 'NET_BANKING', 'WALLET'],
  });
}
