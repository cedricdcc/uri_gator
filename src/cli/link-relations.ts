import type { LinkRelationObservation } from '../core/types';
import { parseRfc8288LinkHeader } from '../parsers/rfc8288-link';
import { parseHtmlDiscovery } from '../parsers/html-link';
import { parseLinksetJson, parseLinksetText } from '../parsers/rfc9264-linkset';
import { baseMime } from '../core/utils';

/**
 * Collects modeled link relations from HTTP headers, HTML links, and linksets
 * for CLI --extend-links and profile inspection.
 */
export async function collectLinkRelationsForUri(uri: string): Promise<LinkRelationObservation[]> {
  const relations: LinkRelationObservation[] = [];
  const seen = new Set<string>();

  function addRel(
    anchor: string,
    rel: string,
    href: string,
    originType: 'linkset' | 'html' | 'link-header',
    originUri: string,
    options?: Array<{ name: string; value?: string }>
  ) {
    const key = `${anchor}::${rel}::${href}`;
    if (seen.has(key)) return;
    seen.add(key);
    relations.push({
      anchor,
      rel,
      href,
      origin: { type: originType, sourceUri: originUri },
      options,
    });
  }

  try {
    const res = await fetch(uri);
    if (!res.ok) return relations;

    const linkHeader = res.headers.get('link');
    if (linkHeader) {
      const parsed = parseRfc8288LinkHeader(linkHeader, uri);
      for (const l of parsed) {
        for (const r of l.rel) {
          const opts = [];
          if (l.type) opts.push({ name: 'type', value: l.type });
          if (l.profile) opts.push({ name: 'profile', value: l.profile });
          addRel(l.anchor || uri, r, l.uri, 'link-header', uri, opts.length > 0 ? opts : undefined);
        }
      }
    }

    const contentType = baseMime(res.headers.get('content-type') || '');
    const body = await res.text();

    if (contentType === 'text/html' || contentType === 'application/xhtml+xml') {
      const htmlDiscovery = parseHtmlDiscovery(body, uri);
      for (const l of htmlDiscovery.links) {
        for (const r of l.rel) {
          const opts = l.type ? [{ name: 'type', value: l.type }] : undefined;
          addRel(uri, r, l.href, 'html', uri, opts);
        }
      }
    } else if (contentType.includes('linkset') || body.trim().startsWith('{')) {
      const entries = contentType.includes('application/linkset+json') || body.trim().startsWith('{')
        ? parseLinksetJson(body, uri)
        : parseLinksetText(body, uri);
      for (const e of entries) {
        for (const r of e.rel) {
          const opts = e.type ? [{ name: 'type', value: e.type }] : undefined;
          addRel(e.anchor || uri, r, e.href, 'linkset', uri, opts);
        }
      }
    }
  } catch {
    // Ignore network errors gracefully
  }

  return relations;
}
