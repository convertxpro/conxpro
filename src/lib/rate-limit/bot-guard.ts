/**
 * List of recognized and legitimate search engine crawler user agents
 */
export const SEARCH_ENGINE_BOT_AGENTS: readonly string[] = [
  'googlebot',
  'bingbot',
  'slurp',
  'duckduckbot',
  'baiduspider',
  'yandexbot',
  'sogou',
  'exabot',
  'facebot',
  'ia_archiver',
  'applebot',
  'twitterbot',
  'linkedinbot',
  'pinterestbot',
  'ahrefsbot',
  'semrushbot',
] as const;

/**
 * Checks whether the incoming request is originating from a legitimate search engine crawler.
 * Search bots indexing public tool and category pages must not be throttled or returned HTTP 429.
 */
export function isSearchEngineBot(userAgent?: string | null): boolean {
  if (!userAgent || typeof userAgent !== 'string') return false;
  const ua = userAgent.toLowerCase();
  return SEARCH_ENGINE_BOT_AGENTS.some((bot) => ua.includes(bot));
}
