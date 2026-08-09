'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function Header() {
  const t = useTranslations('nav');
  const brand = useTranslations('brand');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setIsLoggedIn(!!data.user));
  }, []);

  function switchLocale(nextLocale: string) {
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <header className="border-b border-border-soft">
      <div className="max-w-[1120px] mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-display font-semibold text-[15px] whitespace-nowrap">
          <span className="w-[26px] h-[26px] rounded-md bg-gradient-to-br from-accent to-[#2451c9] flex items-center justify-center text-[13px] font-bold text-white">
            C
          </span>
          {brand('name')}
        </Link>

        <nav className="flex items-center gap-8">
          <div className="hidden md:flex gap-7 text-sm text-text-2">
            <Link href="/#how-it-works" className="hover:text-text-1">{t('howItWorks')}</Link>
            <Link href="/services" className="hover:text-text-1">{t('services')}</Link>
            <Link href="/#pricing" className="hover:text-text-1">{t('pricing')}</Link>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="flex border border-border rounded-full overflow-hidden font-mono text-[11px]">
              <button
                onClick={() => switchLocale('az')}
                className={`px-3 py-1.5 ${locale === 'az' ? 'bg-accent-soft text-accent-2' : 'text-text-3'}`}
              >
                AZ
              </button>
              <button
                onClick={() => switchLocale('en')}
                className={`px-3 py-1.5 ${locale === 'en' ? 'bg-accent-soft text-accent-2' : 'text-text-3'}`}
              >
                EN
              </button>
            </div>

            {isLoggedIn ? (
              <Link href="/dashboard" className="btn btn-primary">{t('dashboard')}</Link>
            ) : (
              <>
                <Link href="/login" className="btn btn-ghost">{t('login')}</Link>
                <Link href="/register" className="btn btn-primary">{t('register')}</Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
