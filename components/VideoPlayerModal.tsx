'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import RoadmapView, { type RoadmapSection, type RoadmapTopic } from './RoadmapView';

export default function DashboardRoadmap({ sections }: { sections: RoadmapSection[] }) {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [activeTitle, setActiveTitle] = useState('');
  const [accessError, setAccessError] = useState<string | null>(null);
  const [loadingTopicId, setLoadingTopicId] = useState<string | null>(null);
  const t = useTranslations('checkout');
  const locale = useLocale();

  async function handleTopicClick(topic: RoadmapTopic) {
    setAccessError(null);

    if (topic.video_status !== 'has_video') {
      return; // nothing to open yet
    }

    setLoadingTopicId(topic.id);

    try {
      const res = await fetch(`/api/video/${topic.id}`);
      const data = await res.json();

      if (!res.ok) {
        setAccessError(data.reason === 'requires_subscription' ? 'subscription' : 'error');
        return;
      }

      setActiveTitle(locale === 'az' ? topic.title_az : topic.title_en);
      setEmbedUrl(data.embedUrl);
    } finally {
      setLoadingTopicId(null);
    }
  }

  return (
    <>
      <RoadmapView sections={sections} onTopicClick={handleTopicClick} />

      {/* Subtle fixed indicator while a video request is in flight */}
      <AnimatePresence>
        {loadingTopicId && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-panel border border-border rounded-full px-4 py-2.5 shadow-xl"
          >
            <span className="w-3.5 h-3.5 rounded-full border-2 border-accent-2 border-t-transparent animate-spin" />
            <span className="text-xs text-text-2 font-mono">Video hazırlanır...</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {accessError === 'subscription' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6"
            onClick={() => setAccessError(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              className="card max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-text-1 mb-4">Bu mövzunu izləmək üçün aktiv abunəlik lazımdır.</p>
              <Link href="/checkout" className="btn btn-primary w-full">
                {t('title')}
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {embedUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-6"
            onClick={() => setEmbedUrl(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="w-full max-w-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-display text-lg text-text-1">{activeTitle}</h3>
                <button onClick={() => setEmbedUrl(null)} className="text-text-2 hover:text-text-1 transition-colors">
                  ✕
                </button>
              </div>
              <div className="aspect-video rounded-lg overflow-hidden border border-border">
                <iframe src={embedUrl} className="w-full h-full" allowFullScreen />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
