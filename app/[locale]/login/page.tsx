'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    const redirect = searchParams.get('redirect');
    router.push(redirect ?? '/dashboard');
    router.refresh();
  }

  return (
    <main className="max-w-[420px] mx-auto px-6 py-20">
      <div className="card">
        <h1 className="font-display text-2xl font-semibold mb-6">{t('loginTitle')}</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-text-2 mb-1.5">{t('email')}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-xs text-text-2 mb-1.5">{t('password')}</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
          </div>

          {error && <p className="text-danger text-sm">{error}</p>}

          <button type="submit" disabled={loading} className="btn btn-primary mt-2">
            {t('loginButton')}
          </button>
        </form>

        <p className="text-sm text-text-2 mt-6 text-center">
          {t('noAccount')}{' '}
          <Link href="/register" className="text-accent-2">
            {t('goRegister')}
          </Link>
        </p>
      </div>
    </main>
  );
}
