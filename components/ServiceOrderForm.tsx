'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';

export default function ServiceOrderForm({ serviceId }: { serviceId?: string }) {
  const t = useTranslations('services');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', message: '' });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    await supabase.from('service_orders').insert({
      user_id: user?.id ?? null,
      service_id: serviceId ?? null,
      contact_name: form.name,
      contact_email: form.email,
      contact_phone: form.phone || null,
      company_name: form.company || null,
      message: form.message || null
    });

    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="card text-center">
        <p className="text-success">{t('formSuccess')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card flex flex-col gap-4">
      <h3 className="font-display text-lg font-semibold">{t('formTitle')}</h3>
      <input
        required
        placeholder={t('formName')}
        className="input"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        required
        type="email"
        placeholder={t('formEmail')}
        className="input"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        placeholder={t('formPhone')}
        className="input"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />
      <input
        placeholder={t('formCompany')}
        className="input"
        value={form.company}
        onChange={(e) => setForm({ ...form, company: e.target.value })}
      />
      <textarea
        placeholder={t('formMessage')}
        rows={4}
        className="input"
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
      />
      <button type="submit" disabled={loading} className="btn btn-primary">
        {loading ? '...' : t('formSubmit')}
      </button>
    </form>
  );
}
