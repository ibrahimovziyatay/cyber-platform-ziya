import crypto from 'crypto';

/**
 * Bunny.net Stream integration.
 *
 * Video IDs are stored in `roadmap_topics.bunny_video_id` and are never
 * exposed as a raw public URL. Instead, we generate a short-lived signed
 * URL (token authentication) server-side, only after confirming the
 * requesting user has an active subscription (or the topic is a free
 * preview, or monetization is disabled).
 *
 * Docs: https://docs.bunny.net/docs/stream-embed-token-authentication
 */

const BUNNY_CDN_HOSTNAME = process.env.BUNNY_CDN_HOSTNAME;
const BUNNY_TOKEN_AUTH_KEY = process.env.BUNNY_TOKEN_AUTH_KEY;
const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;

export function getSignedBunnyEmbedUrl(videoId: string, expiresInSeconds = 3600): string {
  if (!BUNNY_TOKEN_AUTH_KEY || !BUNNY_LIBRARY_ID) {
    // Not configured yet — return a placeholder so the UI can still render.
    return `https://iframe.mediadelivery.net/embed/PLACEHOLDER_LIBRARY/${videoId}`;
  }

  const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const path = `/${BUNNY_LIBRARY_ID}/${videoId}`;

  // Bunny token auth: sha256(security_key + path + expires)
  const hash = crypto
    .createHash('sha256')
    .update(`${BUNNY_TOKEN_AUTH_KEY}${path}${expires}`)
    .digest('hex');

  return `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}?token=${hash}&expires=${expires}`;
}

export function getBunnyThumbnailUrl(videoId: string): string {
  if (!BUNNY_CDN_HOSTNAME) return '';
  return `https://${BUNNY_CDN_HOSTNAME}/${videoId}/thumbnail.jpg`;
}
