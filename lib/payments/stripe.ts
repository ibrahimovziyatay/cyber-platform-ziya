import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

// Falls back to a placeholder in dev so the app doesn't crash before keys exist.
export const stripe = new Stripe(STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-06-20'
});

export interface StripeCheckoutInput {
  userId: string;
  userEmail: string;
  successUrl: string;
  cancelUrl: string;
}

export async function createStripeCheckoutSession(input: StripeCheckoutInput) {
  const priceId = process.env.STRIPE_PRICE_ID_MONTHLY;

  if (!STRIPE_SECRET_KEY || !priceId) {
    // Mock mode: no real Stripe keys configured yet.
    return {
      url: `${input.successUrl}?provider=stripe&mock=1`
    };
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: input.userEmail,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    metadata: { userId: input.userId }
  });

  return { url: session.url };
}
