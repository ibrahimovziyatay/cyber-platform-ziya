import { NextResponse } from 'next/server';
import { verifyPayriffSignature } from '@/lib/payments/payriff';
import { createServiceRoleClient } from '@/lib/supabase/server';

/**
 * Payriff calls this endpoint when a payment succeeds/fails.
 * In mock mode, you can simulate a call with:
 *
 *   curl -X POST http://localhost:3000/api/payriff/webhook \
 *     -H "Content-Type: application/json" \
 *     -d '{"userId":"<uuid>","status":"success","orderId":"mock_123"}'
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-payriff-signature') ?? '';

  if (!verifyPayriffSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const { userId, status, orderId } = payload;

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  if (status === 'success') {
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await supabase.from('subscriptions').upsert(
      {
        user_id: userId,
        status: 'active',
        payment_provider: 'payriff',
        provider_subscription_id: orderId,
        current_period_end: periodEnd.toISOString(),
        updated_at: new Date().toISOString()
      },
      { onConflict: 'user_id' }
    );
  } else {
    await supabase
      .from('subscriptions')
      .update({ status: 'past_due', updated_at: new Date().toISOString() })
      .eq('user_id', userId);
  }

  return NextResponse.json({ received: true });
}
