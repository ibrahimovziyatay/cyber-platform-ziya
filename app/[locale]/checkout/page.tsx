'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';

export default function CheckoutPage() {
  const t = useTranslations('checkout');
  const locale = useLocale();
  const [loading, setLoading] = useState<'payriff' | 'stripe' | null>(null);

  async function handlePay(provider: 'payriff' | 'stripe') {
    setLoading(provider);
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, locale })
    });
    const data = await res.json();
    setLoading(null);

    if (data.url) {
      window.location.href = data.url;
    }
  }

  return (
    <main className="max-w-[560px] mx-auto px-6 py-20">
      <div className="card">
        <h1 className="font-display text-2xl font-semibold mb-2">{t('title')}</h1>
        <div className="font-display text-3xl font-semibold text-accent-2 mb-6">{t('monthlyPrice')}</div>

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs text-text-3 mb-2">{t('azUsers')}</p>
            <button
              onClick={() => handlePay('payriff')}
              disabled={loading !== null}
              className="btn btn-primary w-full"
            >
              {loading === 'payriff' ? '...' : t('payWithPayriff')}
            </button>
          </div>

          <div>
            <p className="text-xs text-text-3 mb-2">{t('intlUsers')}</p>
            <button
              onClick={() => handlePay('stripe')}
              disabled={loading !== null}
              className="btn btn-ghost w-full"
            >
              {loading === 'stripe' ? '...' : t('payWithStripe')}
            </button>
          </div>
        </div>

        <p className="text-text-3 text-xs mt-6 text-center">{t('mockNotice')}</p>
      </div>
    </main>
  );
}
