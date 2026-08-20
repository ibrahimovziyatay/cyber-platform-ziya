import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getRoadmap, getMonetizationEnabled } from '@/lib/roadmap';
import RoadmapView from '@/components/RoadmapView';
import Reveal from '@/components/Reveal';

export default async function LandingPage() {
  const t = await getTranslations('landing');
  const sections = await getRoadmap();
  const monetizationEnabled = await getMonetizationEnabled();

  return (
    <main className="max-w-[1120px] mx-auto px-6">
      {/* ---------- HERO ---------- */}
      <section className="grid md:grid-cols-[1.1fr_0.9fr] gap-14 items-center py-16 md:py-24">
        <Reveal>
          <div className="inline-flex items-center gap-2 font-mono text-xs text-success bg-success-soft border border-success/25 px-3 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-success pulse-live" />
            {t('eyebrow')}
          </div>

          <h1 className="font-display font-semibold text-4xl md:text-[44px] leading-[1.1] mb-5">
            {t('title')}
          </h1>

          <p className="text-text-2 text-base max-w-[480px] mb-8">{t('subtitle')}</p>

          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard" className="btn btn-primary">
              {t('ctaPrimary')} →
            </Link>
            <a href="#how-it-works" className="btn btn-ghost">
              {t('ctaSecondary')}
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.15} y={24}>
          <Link
            href="/dashboard"
            className="block card card-hover !p-0 overflow-hidden"
          >
            <div className="px-4.5 py-3.5 border-b border-border-soft bg-panel-2 flex items-center justify-between">
              <span className="font-mono text-[11px] text-text-2">{t('roadmapPreviewTitle')}</span>
              <div className="flex gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-border" />
                <span className="w-1.5 h-1.5 rounded-full bg-border" />
                <span className="w-1.5 h-1.5 rounded-full bg-border" />
              </div>
            </div>
            <div className="p-5">
              <RoadmapView sections={sections} compact />
              <div className="text-center mt-4">
                <span className="font-mono text-[11.5px] text-accent-2">{t('viewFullRoadmap')} →</span>
              </div>
            </div>
          </Link>
        </Reveal>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section id="how-it-works" className="py-16 md:py-20">
        <Reveal>
          <div className="max-w-[560px] mb-12">
            <span className="font-mono text-xs text-accent-2 mb-3 block">// {t('ctaSecondary').toLowerCase()}</span>
            <h2 className="font-display font-semibold text-3xl mb-3.5">{t('howItWorksTitle')}</h2>
            <p className="text-text-2 text-[15px]">{t('howItWorksSubtitle')}</p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: '①', title: t('step1Title'), desc: t('step1Desc') },
            { icon: '②', title: t('step2Title'), desc: t('step2Desc') },
            { icon: '③', title: t('step3Title'), desc: t('step3Desc') }
          ].map((step, i) => (
            <Reveal delay={i * 0.1} key={step.icon}>
              <div className="card card-hover h-full">
                <div className="w-[38px] h-[38px] rounded-lg bg-accent-soft flex items-center justify-center mb-4.5 text-accent-2 text-base">
                  {step.icon}
                </div>
                <h3 className="text-base font-semibold mb-2">{step.title}</h3>
                <p className="text-text-2 text-[13.5px]">{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- PRICING ---------- */}
      <section id="pricing" className="py-16 md:py-20 pt-0">
        <Reveal>
          <div className="max-w-[560px] mb-12">
            <span className="font-mono text-xs text-accent-2 mb-3 block">// {t('pricingTitle').toLowerCase()}</span>
            <h2 className="font-display font-semibold text-3xl">{t('pricingTitle')}</h2>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-5 max-w-[820px]">
          <Reveal>
            <div className="card card-hover relative border-accent-soft-2 bg-gradient-to-b from-accent-soft to-panel h-full">
              <h3 className="text-[15px] text-text-2 font-medium mb-3.5">{t('planSubscription')}</h3>
              <div className="font-display text-[38px] font-semibold mb-1">
                10 ₼<span className="text-[15px] text-text-3 font-body font-normal"> / {t('planSubscriptionDesc').toLowerCase().includes('month') ? 'mo' : 'ay'}</span>
              </div>
              <div className="text-text-3 text-[13px] mb-5">
                {monetizationEnabled ? t('planSubscriptionDesc') : t('planFreeNotice')}
              </div>
              <Link href="/checkout" className="btn btn-primary w-full">
                {t('ctaSubscribe')}
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="card card-hover h-full">
              <h3 className="text-[15px] text-text-2 font-medium mb-3.5">{t('planServices')}</h3>
              <div className="font-display text-[38px] font-semibold mb-1">{t('planCustom')}</div>
              <div className="text-text-3 text-[13px] mb-5">{t('planServicesDesc')}</div>
              <Link href="/services" className="btn btn-ghost w-full">
                {t('ctaServices')}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
