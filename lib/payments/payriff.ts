/**
 * Payriff integration (Azerbaijan market).
 *
 * Runs in MOCK mode by default (PAYRIFF_MODE=mock) so the checkout flow
 * can be fully tested without real merchant credentials. Swap PAYRIFF_MODE
 * to "live" and fill in real credentials in .env when you're ready to go live.
 *
 * Real Payriff docs: https://docs.payriff.com (create an "Order" then
 * redirect the user to the returned paymentUrl; Payriff calls your webhook
 * on completion).
 */

const PAYRIFF_MODE = process.env.PAYRIFF_MODE ?? 'mock';
const PAYRIFF_BASE_URL = process.env.PAYRIFF_BASE_URL ?? 'https://api.payriff.com';

export interface PayriffOrderInput {
  amount: number; // in AZN, e.g. 10
  description: string;
  userId: string;
  successRedirectUrl: string;
  cancelRedirectUrl: string;
}

export interface PayriffOrderResult {
  orderId: string;
  paymentUrl: string;
}

export async function createPayriffOrder(
  input: PayriffOrderInput
): Promise<PayriffOrderResult> {
  if (PAYRIFF_MODE === 'mock') {
    // Simulate what Payriff's API would return, so the UI/redirect flow
    // can be built and tested end-to-end before real credentials exist.
    const mockOrderId = `mock_${Date.now()}`;
    return {
      orderId: mockOrderId,
      paymentUrl: `${input.successRedirectUrl}?provider=payriff&mock=1&order=${mockOrderId}`
    };
  }

  // ---- LIVE MODE ----
  const merchantId = process.env.PAYRIFF_MERCHANT_ID;
  const secretKey = process.env.PAYRIFF_SECRET_KEY;

  if (!merchantId || !secretKey) {
    throw new Error('Payriff live credentials are missing in environment variables.');
  }

  const response = await fetch(`${PAYRIFF_BASE_URL}/api/v3/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${secretKey}`
    },
    body: JSON.stringify({
      merchant: merchantId,
      amount: input.amount,
      description: input.description,
      metadata: { userId: input.userId },
      callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payriff/webhook`,
      successRedirectUrl: input.successRedirectUrl,
      cancelRedirectUrl: input.cancelRedirectUrl
    })
  });

  if (!response.ok) {
    throw new Error(`Payriff order creation failed: ${response.statusText}`);
  }

  const data = await response.json();
  return { orderId: data.orderId, paymentUrl: data.paymentUrl };
}

/**
 * Verifies the signature Payriff sends on webhook callbacks.
 * Replace with the exact HMAC scheme from Payriff's docs before going live.
 */
export function verifyPayriffSignature(rawBody: string, signature: string): boolean {
  if (PAYRIFF_MODE === 'mock') return true;

  const crypto = require('crypto');
  const secretKey = process.env.PAYRIFF_SECRET_KEY!;
  const expected = crypto.createHmac('sha256', secretKey).update(rawBody).digest('hex');
  return expected === signature;
}
