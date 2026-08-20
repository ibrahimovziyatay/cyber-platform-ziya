'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="relative group py-1">
      <span className="text-text-2 group-hover:text-text-1 transition-colors">{children}</span>
      <span className="absolute left-0 -bottom-0.5 h-px w-0 bg-accent-2 transition-all duration-300 group-hover:w-full" />
    </Link>
  );
}

export default function Header() {
  const t = useTranslations('nav');
  const brand = useTranslations('brand');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setIsLoggedIn(!!data.user));
  }, []);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function switchLocale(nextLocale: string) {
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-colors duration-300 ${
        scrolled ? 'border-border-soft bg-bg/80 backdrop-blur-md' : 'border-transparent'
      }`}
    >
      <div className="max-w-[1120px] mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-display font-semibold text-[15px] whitespace-nowrap group">
          <motion.span
            whileHover={{ rotate: -6, scale: 1.06 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="w-[26px] h-[26px] rounded-md bg-gradient-to-br from-accent to-[#2451c9] flex items-center justify-center text-[13px] font-bold text-white"
          >
            C
          </motion.span>
          {brand('name')}
        </Link>

        <nav className="flex items-center gap-8">
          <div className="hidden md:flex gap-7 text-sm">
            <NavLink href="/#how-it-works">{t('howItWorks')}</NavLink>
            <NavLink href="/services">{t('services')}</NavLink>
            <NavLink href="/#pricing">{t('pricing')}</NavLink>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="relative flex border border-border rounded-full overflow-hidden font-mono text-[11px] w-[74px] h-[30px]">
              <motion.div
                className="absolute top-0 bottom-0 w-1/2 bg-accent-soft"
                animate={{ x: locale === 'az' ? 0 : '100%' }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
              <button
                onClick={() => switchLocale('az')}
                className={`relative z-10 flex-1 transition-colors ${locale === 'az' ? 'text-accent-2' : 'text-text-3'}`}
              >
                AZ
              </button>
              <button
                onClick={() => switchLocale('en')}
                className={`relative z-10 flex-1 transition-colors ${locale === 'en' ? 'text-accent-2' : 'text-text-3'}`}
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
