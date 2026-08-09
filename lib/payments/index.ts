/**
 * Central place that decides which payment provider to use.
 * Azerbaijani-locale users -> Payriff (local cards, AZN).
 * English-locale users -> Stripe (international cards, USD/EUR).
 *
 * The user can still be offered a manual choice in the checkout UI —
 * this just picks a sensible default based on their selected language.
 */
export type PaymentProvider = 'payriff' | 'stripe';

export function getDefaultProviderForLocale(locale: string): PaymentProvider {
  return locale === 'az' ? 'payriff' : 'stripe';
}

export { createPayriffOrder, verifyPayriffSignature } from './payriff';
export { createStripeCheckoutSession, stripe } from './stripe';
