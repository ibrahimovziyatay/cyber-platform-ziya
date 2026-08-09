import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createPayriffOrder, createStripeCheckoutSession } from '@/lib/payments';

export async function POST(request: Request) {
  const { provider, locale } = await request.json();
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const successUrl = `${siteUrl}/${locale}/dashboard`;
  const cancelUrl = `${siteUrl}/${locale}/checkout`;

  if (provider === 'payriff') {
    const order = await createPayriffOrder({
      amount: 10,
      description: 'CyberSecurity Fundamentals — Monthly Subscription',
      userId: user.id,
      successRedirectUrl: successUrl,
      cancelRedirectUrl: cancelUrl
    });
    return NextResponse.json({ url: order.paymentUrl });
  }

  if (provider === 'stripe') {
    const session = await createStripeCheckoutSession({
      userId: user.id,
      userEmail: user.email!,
      successUrl,
      cancelUrl
    });
    return NextResponse.json({ url: session.url });
  }

  return NextResponse.json({ error: 'Unknown provider' }, { status: 400 });
}
