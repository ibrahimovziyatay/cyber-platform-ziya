'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';

export interface RoadmapTopic {
  id: string;
  order_index: number;
  title_az: string;
  title_en: string;
  video_status: 'text_only' | 'has_video' | 'coming_soon';
  bunny_video_id: string | null;
  thumbnail_url?: string | null;
}

export interface RoadmapSection {
  id: string;
  order_index: number;
  title_az: string;
  title_en: string;
  topics: RoadmapTopic[];
}

function StatusTag({ status }: { status: RoadmapTopic['video_status'] }) {
  const t = useTranslations('dashboard');

  if (status === 'has_video') {
    return <span className="badge badge-video">🎬 {t('hasVideo')}</span>;
  }
  if (status === 'text_only') {
    return <span className="badge badge-none">📄 {t('textOnly')}</span>;
  }
  return <span className="badge badge-soon">⏳ {t('comingSoon')}</span>;
}

export default function RoadmapView({
  sections,
  compact = false,
  onTopicClick
}: {
  sections: RoadmapSection[];
  compact?: boolean;
  onTopicClick?: (topic: RoadmapTopic) => void;
}) {
  const locale = useLocale();
  const t = useTranslations('dashboard');

  const visibleSections = compact ? sections.slice(0, 2) : sections;

  return (
    <div className="relative">
      {visibleSections.map((section, sIdx) => {
        const topics = compact ? section.topics.slice(0, 3) : section.topics;
        const isLast = sIdx === visibleSections.length - 1;

        return (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: sIdx * 0.08 }}
            className="relative pl-7 pb-6 last:pb-0"
          >
            {!isLast && (
              <span className="absolute left-2 top-6 bottom-0 w-0.5 bg-border" aria-hidden />
            )}
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: sIdx * 0.08 + 0.1, type: 'spring', stiffness: 400, damping: 20 }}
              className="absolute left-0.5 top-0.5 w-[15px] h-[15px] rounded-full bg-accent-soft border-2 border-accent"
              aria-hidden
            />

            <div className="flex items-center justify-between mb-3">
              <div className="font-mono text-[11.5px] font-semibold uppercase tracking-wide text-text-1">
                {section.order_index} · {locale === 'az' ? section.title_az : section.title_en}
              </div>
              <div className="font-mono text-[11px] text-text-3">
                {topics.length} {t('topicsCount')}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              {topics.map((topic, tIdx) => {
                const content = (
                  <>
                    <span className="flex items-center gap-2.5">
                      {topic.thumbnail_url && (
                        <img
                          src={topic.thumbnail_url}
                          alt=""
                          className="w-8 h-8 rounded object-cover border border-border flex-shrink-0"
                        />
                      )}
                      <span className="text-text-1 text-[13.5px] font-medium">
                        {locale === 'az' ? topic.title_az : topic.title_en}
                      </span>
                    </span>
                    <StatusTag status={topic.video_status} />
                  </>
                );

                const rowDelay = sIdx * 0.08 + tIdx * 0.04 + 0.12;

                if (!onTopicClick) {
                  return (
                    <motion.div
                      key={topic.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, delay: rowDelay }}
                      className="bg-panel border border-border rounded-lg px-4 py-2.5 flex items-center justify-between gap-2.5"
                    >
                      {content}
                    </motion.div>
                  );
                }

                return (
                  <motion.button
                    key={topic.id}
                    onClick={() => onTopicClick(topic)}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: rowDelay }}
                    whileHover={{ x: 4, borderColor: 'rgba(76,130,247,0.35)' }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-panel border border-border rounded-lg px-4 py-2.5 flex items-center justify-between gap-2.5 text-left"
                  >
                    {content}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
