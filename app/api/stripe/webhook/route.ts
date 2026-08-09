import { NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature') ?? '';
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = webhookSecret
      ? stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
      : JSON.parse(rawBody); // mock mode: no signature verification
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const userId = session.metadata?.userId;

    if (userId) {
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      await supabase.from('subscriptions').upsert(
        {
          user_id: userId,
          status: 'active',
          payment_provider: 'stripe',
          provider_subscription_id: session.subscription,
          current_period_end: periodEnd.toISOString(),
          updated_at: new Date().toISOString()
        },
        { onConflict: 'user_id' }
      );
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as any;
    await supabase
      .from('subscriptions')
      .update({ status: 'canceled', updated_at: new Date().toISOString() })
      .eq('provider_subscription_id', subscription.id);
  }

  return NextResponse.json({ received: true });
}
