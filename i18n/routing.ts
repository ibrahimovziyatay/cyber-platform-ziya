import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // Azerbaijani is the default/primary market, English for international users
  locales: ['az', 'en'],
  defaultLocale: 'az',
  localePrefix: 'always' // /az/... and /en/...
});

export type Locale = (typeof routing.locales)[number];
