import { useTranslations } from 'next-intl';

export default function Footer() {
  const brand = useTranslations('brand');
  const t = useTranslations('footer');

  return (
    <footer className="border-t border-border-soft mt-10 py-9">
      <div className="max-w-[1120px] mx-auto px-6 flex flex-wrap items-center justify-between gap-3 text-sm text-text-3">
        <div className="flex items-center gap-2.5 font-display font-semibold text-text-1">
          <span className="w-[26px] h-[26px] rounded-md bg-gradient-to-br from-accent to-[#2451c9] flex items-center justify-center text-[13px] font-bold text-white">
            C
          </span>
          {brand('name')}
        </div>
        <div>© {new Date().getFullYear()} {brand('name')} — {t('rights')}</div>
      </div>
    </footer>
  );
}
