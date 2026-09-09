import { resolveRelativeUrl } from '../core/uri';

/**
 * Parses robots.txt content (RFC 9309) and extracts all declared Sitemap URLs.
 */
export function parseRobotsTxtSitemaps(
  robotsContent: string | null | undefined,
  baseOrigin: string
): string[] {
  if (!robotsContent || typeof robotsContent !== 'string') {
    return [];
  }

  const sitemaps = new Set<string>();
  const lines = robotsContent.split(/\r?\n/);

  for (const rawLine of lines) {
    // Strip comments
    const commentIndex = rawLine.indexOf('#');
    const cleanLine = (commentIndex >= 0 ? rawLine.slice(0, commentIndex) : rawLine).trim();
    if (!cleanLine) continue;

    const colonIndex = cleanLine.indexOf(':');
    if (colonIndex === -1) continue;

    const fieldName = cleanLine.slice(0, colonIndex).trim().toLowerCase();
    const fieldValue = cleanLine.slice(colonIndex + 1).trim();

    if (fieldName === 'sitemap' && fieldValue) {
      const resolved = resolveRelativeUrl(fieldValue, baseOrigin);
      sitemaps.add(resolved);
    }
  }

  return [...sitemaps];
}
