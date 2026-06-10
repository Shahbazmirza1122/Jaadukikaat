import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let { amount, currency = "PKR", environment = "sandbox" } = req.body;
    const secretKey = process.env.SAFEPAY_SECRET_KEY || "0896abe5b456c3aae0ce02b5fd25ac9ff8c4c183342d00cdee304e9f0ff9827f";
    const clientKey = process.env.VITE_SAFEPAY_PUBLIC_KEY || "sec_710ff60e-c2b7-469f-8aa3-8ff149f5c8fb";
    
    if (!secretKey) {
      return res.status(500).json({ error: "Safepay Secret Key not configured on the server." });
    }

    environment = String(environment).toLowerCase();
    if (environment !== 'production') environment = 'sandbox';

    const baseUrl = environment === "production" 
      ? "https://api.getsafepay.com" 
      : "https://sandbox.api.getsafepay.com";

    const response = await fetch(`${baseUrl}/order/v1/init`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-SFPY-MERCHANT-SECRET": secretKey
      },
      body: JSON.stringify({
        client: clientKey,
        amount: amount,
        currency: currency,
        environment: environment
      })
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error: any) {
    console.error("Safepay Tracker Creation Error:", error);
    res.status(500).json({ error: "Failed to create Safepay tracker", details: error.message });
  }
}
