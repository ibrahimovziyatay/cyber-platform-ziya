'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // If "Confirm email" is enabled in Supabase Auth settings, signUp()
    // creates the user but returns no active session until the user
    // clicks the confirmation link sent to their inbox.
    if (data.user && !data.session) {
      setCheckEmail(true);
      return;
    }

    // Confirm email is disabled -> session is already active.
    router.push('/dashboard');
    router.refresh();
  }

  if (checkEmail) {
    return (
      <main className="max-w-[420px] mx-auto px-6 py-20">
        <div className="card text-center">
          <h1 className="font-display text-xl font-semibold mb-3">📩 {email}</h1>
          <p className="text-text-2 text-sm">
            {t('checkEmailNotice')}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-[420px] mx-auto px-6 py-20">
      <div className="card">
        <h1 className="font-display text-2xl font-semibold mb-6">{t('registerTitle')}</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-text-2 mb-1.5">{t('fullName')}</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input"
            />
          </div>
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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
          </div>

          {error && <p className="text-danger text-sm">{error}</p>}

          <button type="submit" disabled={loading} className="btn btn-primary mt-2">
            {t('registerButton')}
          </button>
        </form>

        <p className="text-sm text-text-2 mt-6 text-center">
          {t('haveAccount')}{' '}
          <Link href="/login" className="text-accent-2">
            {t('goLogin')}
          </Link>
        </p>
      </div>
    </main>
  );
}
