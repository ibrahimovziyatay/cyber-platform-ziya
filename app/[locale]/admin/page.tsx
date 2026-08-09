import { getTranslations, getLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/server';
import { getRoadmap, getMonetizationEnabled } from '@/lib/roadmap';
import AdminPanel from '@/components/AdminPanel';

export default async function AdminPage() {
  const t = await getTranslations('admin');
  const locale = await getLocale();
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: '/login', locale });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user!.id)
    .single();

  if (!profile?.is_admin) {
    redirect({ href: '/dashboard', locale });
  }

  const sections = await getRoadmap();
  const monetizationEnabled = await getMonetizationEnabled();

  const { data: orders } = await supabase
    .from('service_orders')
    .select('id, contact_name, contact_email, message, status, created_at')
    .order('created_at', { ascending: false });

  return (
    <main className="max-w-[1120px] mx-auto px-6 py-10">
      <h1 className="font-display text-2xl font-semibold mb-8">{t('title')}</h1>
      <AdminPanel
        sections={sections}
        initialMonetization={monetizationEnabled}
        orders={orders ?? []}
      />
    </main>
  );
}
