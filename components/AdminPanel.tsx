'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import type { RoadmapSection, RoadmapTopic } from './RoadmapView';

interface ServiceOrder {
  id: string;
  contact_name: string;
  contact_email: string;
  message: string | null;
  status: string;
  created_at: string;
}

export default function AdminPanel({
  sections,
  initialMonetization,
  orders
}: {
  sections: RoadmapSection[];
  initialMonetization: boolean;
  orders: ServiceOrder[];
}) {
  const t = useTranslations('admin');
  const [monetization, setMonetization] = useState(initialMonetization);
  const [editingTopic, setEditingTopic] = useState<RoadmapTopic | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [addingToSection, setAddingToSection] = useState<string | null>(null);
  const [newTopic, setNewTopic] = useState({
    title_az: '',
    title_en: '',
    description_az: '',
    description_en: '',
    video_status: 'coming_soon',
    bunny_video_id: '',
    thumbnail_url: '' as string | null
  });
  const [addingSection, setAddingSection] = useState(false);
  const [newSection, setNewSection] = useState({ title_az: '', title_en: '' });

  async function toggleMonetization() {
    const supabase = createClient();
    const next = !monetization;
    setMonetization(next);
    await supabase
      .from('site_settings')
      .update({ value: next, updated_at: new Date().toISOString() })
      .eq('key', 'monetization_enabled');
  }

  async function saveTopic(topic: RoadmapTopic & { description_az?: string; description_en?: string; thumbnail_url?: string | null }) {
    setSavingId(topic.id);
    const supabase = createClient();
    await supabase
      .from('roadmap_topics')
      .update({
        title_az: topic.title_az,
        title_en: topic.title_en,
        description_az: topic.description_az ?? null,
        description_en: topic.description_en ?? null,
        video_status: topic.video_status,
        bunny_video_id: topic.bunny_video_id,
        thumbnail_url: topic.thumbnail_url ?? null
      })
      .eq('id', topic.id);
    setSavingId(null);
    setEditingTopic(null);
    window.location.reload();
  }

  async function createTopic(sectionId: string) {
    const supabase = createClient();
    const section = sections.find((s) => s.id === sectionId);
    const nextOrder = (section?.topics.length ?? 0) + 1;

    await supabase.from('roadmap_topics').insert({
      section_id: sectionId,
      order_index: nextOrder,
      title_az: newTopic.title_az,
      title_en: newTopic.title_en,
      description_az: newTopic.description_az || null,
      description_en: newTopic.description_en || null,
      video_status: newTopic.video_status,
      bunny_video_id: newTopic.bunny_video_id || null,
      thumbnail_url: newTopic.thumbnail_url || null
    });

    setAddingToSection(null);
    setNewTopic({
      title_az: '',
      title_en: '',
      description_az: '',
      description_en: '',
      video_status: 'coming_soon',
      bunny_video_id: '',
      thumbnail_url: ''
    });
    window.location.reload();
  }

  async function deleteTopic(topicId: string) {
    if (!confirm('Bu mövzunu silmək istədiyinizə əminsiniz?')) return;
    const supabase = createClient();
    await supabase.from('roadmap_topics').delete().eq('id', topicId);
    window.location.reload();
  }

  async function createSection() {
    const supabase = createClient();
    const nextOrder = sections.length + 1;

    await supabase.from('roadmap_sections').insert({
      order_index: nextOrder,
      title_az: newSection.title_az,
      title_en: newSection.title_en
    });

    setAddingSection(false);
    setNewSection({ title_az: '', title_en: '' });
    window.location.reload();
  }

  async function updateOrderStatus(orderId: string, status: string) {
    const supabase = createClient();
    await supabase.from('service_orders').update({ status }).eq('id', orderId);
  }

  return (
    <div className="flex flex-col gap-10">
      {/* ---- Monetization toggle ---- */}
      <div className="card flex items-center justify-between gap-6">
        <div>
          <h3 className="font-semibold text-text-1 mb-1">{t('monetization')}</h3>
          <p className="text-text-3 text-[13px]">{t('monetizationDesc')}</p>
        </div>
        <button
          onClick={toggleMonetization}
          className={`w-14 h-8 rounded-full flex items-center px-1 transition-colors ${
            monetization ? 'bg-accent justify-end' : 'bg-panel-2 border border-border justify-start'
          }`}
        >
          <span className="w-6 h-6 rounded-full bg-white block" />
        </button>
      </div>

      {/* ---- Topics editor ---- */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold">{t('topics')}</h2>
          <button onClick={() => setAddingSection(true)} className="btn btn-ghost !py-1.5 !px-3 text-xs">
            + {t('sections')}
          </button>
        </div>

        {addingSection && (
          <div className="card mb-5 flex flex-col gap-3">
            <h3 className="font-semibold text-sm">Yeni bölmə</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                className="input"
                placeholder={t('titleAz')}
                value={newSection.title_az}
                onChange={(e) => setNewSection({ ...newSection, title_az: e.target.value })}
              />
              <input
                className="input"
                placeholder={t('titleEn')}
                value={newSection.title_en}
                onChange={(e) => setNewSection({ ...newSection, title_en: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <button onClick={createSection} className="btn btn-primary !py-1.5 !px-4 text-xs">
                {t('save')}
              </button>
              <button onClick={() => setAddingSection(false)} className="btn btn-ghost !py-1.5 !px-4 text-xs">
                {t('cancel')}
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-6">
          {sections.map((section) => (
            <div key={section.id}>
              <div className="flex items-center justify-between mb-2">
                <div className="font-mono text-xs text-text-3 uppercase">
                  {section.order_index} · {section.title_az}
                </div>
                <button
                  onClick={() => setAddingToSection(section.id)}
                  className="font-mono text-[11px] text-accent-2 hover:underline"
                >
                  + {t('addTopic')}
                </button>
              </div>

              {addingToSection === section.id && (
                <div className="card !p-4 mb-2">
                  <TopicEditForm
                    topic={newTopic}
                    onChange={setNewTopic}
                    onSave={() => createTopic(section.id)}
                    onCancel={() => setAddingToSection(null)}
                    saving={false}
                    t={t}
                  />
                </div>
              )}

              <div className="flex flex-col gap-2">
                {section.topics.map((topic) => (
                  <div key={topic.id} className="card !p-4">
                    {editingTopic?.id === topic.id ? (
                      <TopicEditForm
                        topic={editingTopic}
                        onChange={setEditingTopic}
                        onSave={() => saveTopic(editingTopic)}
                        onCancel={() => setEditingTopic(null)}
                        saving={savingId === topic.id}
                        t={t}
                      />
                    ) : (
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-text-1 text-sm font-medium">{topic.title_az}</div>
                          <div className="text-text-3 text-xs">{topic.title_en}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="badge badge-none">{topic.video_status}</span>
                          <button
                            onClick={() => setEditingTopic(topic as any)}
                            className="btn btn-ghost !py-1.5 !px-3 text-xs"
                          >
                            {t('editTopic')}
                          </button>
                          <button
                            onClick={() => deleteTopic(topic.id)}
                            className="text-danger text-xs hover:underline"
                          >
                            Sil
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---- Service orders ---- */}
      <div>
        <h2 className="font-display text-xl font-semibold mb-4">{t('orders')}</h2>
        <div className="flex flex-col gap-2">
          {orders.map((order) => (
            <div key={order.id} className="card !p-4 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="text-text-1 text-sm font-medium">{order.contact_name}</div>
                <div className="text-text-3 text-xs">{order.contact_email}</div>
              </div>
              <select
                defaultValue={order.status}
                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                className="input !w-auto !py-1.5 text-xs"
              >
                <option value="new">new</option>
                <option value="contacted">contacted</option>
                <option value="in_progress">in_progress</option>
                <option value="completed">completed</option>
                <option value="cancelled">cancelled</option>
              </select>
            </div>
          ))}
          {orders.length === 0 && <p className="text-text-3 text-sm">—</p>}
        </div>
      </div>
    </div>
  );
}

function TopicEditForm({
  topic,
  onChange,
  onSave,
  onCancel,
  saving,
  t
}: {
  topic: any;
  onChange: (t: any) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  t: any;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleThumbnailUpload(file: File) {
    setUploading(true);
    setUploadError(null);

    const supabase = createClient();
    const ext = file.name.split('.').pop();
    const path = `${topic.id || 'new'}-${Date.now()}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from('thumbnails')
      .upload(path, file, { upsert: true });

    if (uploadErr) {
      setUploadError(uploadErr.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from('thumbnails').getPublicUrl(path);
    onChange({ ...topic, thumbnail_url: data.publicUrl });
    setUploading(false);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-text-3 mb-1">{t('titleAz')}</label>
          <input
            className="input"
            value={topic.title_az}
            onChange={(e) => onChange({ ...topic, title_az: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs text-text-3 mb-1">{t('titleEn')}</label>
          <input
            className="input"
            value={topic.title_en}
            onChange={(e) => onChange({ ...topic, title_en: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs text-text-3 mb-1">{t('descAz')}</label>
          <textarea
            className="input"
            rows={2}
            value={topic.description_az ?? ''}
            onChange={(e) => onChange({ ...topic, description_az: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs text-text-3 mb-1">{t('descEn')}</label>
          <textarea
            className="input"
            rows={2}
            value={topic.description_en ?? ''}
            onChange={(e) => onChange({ ...topic, description_en: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs text-text-3 mb-1">{t('videoStatus')}</label>
          <select
            className="input"
            value={topic.video_status}
            onChange={(e) => onChange({ ...topic, video_status: e.target.value })}
          >
            <option value="coming_soon">coming_soon</option>
            <option value="text_only">text_only</option>
            <option value="has_video">has_video</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-text-3 mb-1">{t('bunnyVideoId')}</label>
          <input
            className="input"
            value={topic.bunny_video_id ?? ''}
            onChange={(e) => onChange({ ...topic, bunny_video_id: e.target.value })}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs text-text-3 mb-1">Şəkil (thumbnail)</label>
          <div className="flex items-center gap-3">
            {topic.thumbnail_url && (
              <img
                src={topic.thumbnail_url}
                alt=""
                className="w-16 h-16 rounded-lg object-cover border border-border"
              />
            )}
            <label className="btn btn-ghost !py-1.5 !px-3 text-xs cursor-pointer">
              {uploading ? 'Yüklənir...' : topic.thumbnail_url ? 'Şəkli dəyiş' : 'Şəkil yüklə'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => e.target.files?.[0] && handleThumbnailUpload(e.target.files[0])}
              />
            </label>
            {topic.thumbnail_url && (
              <button
                onClick={() => onChange({ ...topic, thumbnail_url: null })}
                className="text-danger text-xs hover:underline"
              >
                Sil
              </button>
            )}
          </div>
          {uploadError && <p className="text-danger text-xs mt-1">{uploadError}</p>}
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onSave} disabled={saving} className="btn btn-primary !py-1.5 !px-4 text-xs">
          {saving ? '...' : t('save')}
        </button>
        <button onClick={onCancel} className="btn btn-ghost !py-1.5 !px-4 text-xs">
          {t('cancel')}
        </button>
      </div>
    </div>
  );
}
