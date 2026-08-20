import { getTranslations } from 'next-intl/server';
import { getLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import ServiceOrderForm from '@/components/ServiceOrderForm';
import Reveal from '@/components/Reveal';

export default async function ServicesPage() {
  const t = await getTranslations('services');
  const locale = await getLocale();
  const supabase = await createClient();

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('order_index');

  return (
    <main className="max-w-[1120px] mx-auto px-6 py-16">
      <Reveal>
        <div className="max-w-[560px] mb-12">
          <h1 className="font-display text-3xl font-semibold mb-3">{t('title')}</h1>
          <p className="text-text-2 text-[15px]">{t('subtitle')}</p>
        </div>
      </Reveal>

      <div className="grid lg:grid-cols-[1fr_380px] gap-8">
        <div className="grid sm:grid-cols-2 gap-5">
          {(services ?? []).map((service, i) => {
            const features: string[] = locale === 'az' ? service.features_az : service.features_en;
            return (
              <Reveal delay={i * 0.08} key={service.id}>
                <div className="card card-hover h-full">
                  <h3 className="font-display text-lg font-semibold mb-2">
                    {locale === 'az' ? service.name_az : service.name_en}
                  </h3>
                  <p className="text-text-2 text-[13.5px] mb-4">
                    {locale === 'az' ? service.description_az : service.description_en}
                  </p>
                  <div className="font-display text-xl font-semibold text-accent-2 mb-4">
                    {service.price_from ? `${service.price_from} ${service.currency}+` : '—'}
                  </div>
                  <ul className="flex flex-col gap-1.5">
                    {features?.map((f, i) => (
                      <li key={i} className="flex gap-2 text-[13px] text-text-2">
                        <span className="text-success">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.15}>
          <ServiceOrderForm />
        </Reveal>
      </div>
    </main>
  );
}
