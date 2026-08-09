'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import RoadmapView, { type RoadmapSection, type RoadmapTopic } from './RoadmapView';

export default function DashboardRoadmap({ sections }: { sections: RoadmapSection[] }) {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [activeTitle, setActiveTitle] = useState('');
  const [accessError, setAccessError] = useState<string | null>(null);
  const t = useTranslations('checkout');
  const locale = useLocale();

  async function handleTopicClick(topic: RoadmapTopic) {
    setAccessError(null);

    if (topic.video_status !== 'has_video') {
      return; // nothing to open yet
    }

    const res = await fetch(`/api/video/${topic.id}`);
    const data = await res.json();

    if (!res.ok) {
      setAccessError(data.reason === 'requires_subscription' ? 'subscription' : 'error');
      return;
    }

    setActiveTitle(locale === 'az' ? topic.title_az : topic.title_en);
    setEmbedUrl(data.embedUrl);
  }

  return (
    <>
      <RoadmapView sections={sections} onTopicClick={handleTopicClick} />

      {accessError === 'subscription' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6" onClick={() => setAccessError(null)}>
          <div className="card max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <p className="text-text-1 mb-4">Bu mövzunu izləmək üçün aktiv abunəlik lazımdır.</p>
            <Link href="/checkout" className="btn btn-primary w-full">
              {t('title')}
            </Link>
          </div>
        </div>
      )}

      {embedUrl && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-6"
          onClick={() => setEmbedUrl(null)}
        >
          <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-display text-lg text-text-1">{activeTitle}</h3>
              <button onClick={() => setEmbedUrl(null)} className="text-text-2 hover:text-text-1">
                ✕
              </button>
            </div>
            <div className="aspect-video rounded-lg overflow-hidden border border-border">
              <iframe src={embedUrl} className="w-full h-full" allowFullScreen />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
