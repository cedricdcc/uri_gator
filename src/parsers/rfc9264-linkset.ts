import { resolveRelativeUrl } from '../core/uri';
import { parseRfc8288LinkHeader } from './rfc8288-link';

export interface LinksetEntry {
  anchor: string;
  href: string;
  rel: string[];
  type?: string;
  profile?: string;
  title?: string;
  [key: string]: any;
}

/**
 * Parses an RFC 9264 JSON Linkset (`application/linkset+json`).
 */
export function parseLinksetJson(
  jsonContent: string | object,
  baseUri: string
): LinksetEntry[] {
  let doc: any;
  if (typeof jsonContent === 'string') {
    try {
      doc = JSON.parse(jsonContent);
    } catch {
      return [];
    }
  } else {
    doc = jsonContent;
  }

  if (!doc || typeof doc !== 'object') {
    return [];
  }

  const linksetArray: any[] = Array.isArray(doc)
    ? doc
    : Array.isArray(doc.linkset)
    ? doc.linkset
    : [];

  const entries: LinksetEntry[] = [];

  for (const block of linksetArray) {
    if (!block || typeof block !== 'object') continue;

    const rawAnchor = typeof block.anchor === 'string' ? block.anchor : baseUri;
    const resolvedAnchor = resolveRelativeUrl(rawAnchor, baseUri);

    for (const [key, value] of Object.entries(block)) {
      if (key === 'anchor') continue;

      const targets = Array.isArray(value) ? value : [value];
      for (const target of targets) {
        if (!target || typeof target !== 'object' || typeof target.href !== 'string') {
          continue;
        }

        const resolvedHref = resolveRelativeUrl(target.href, baseUri);
        const relTokens = key.toLowerCase().split(/\s+/).filter(Boolean);

        const entry: LinksetEntry = {
          anchor: resolvedAnchor,
          href: resolvedHref,
          rel: relTokens,
        };

        if (typeof target.type === 'string') entry.type = target.type.toLowerCase().trim();
        if (typeof target.profile === 'string') entry.profile = target.profile.trim();
        if (typeof target.title === 'string') entry.title = target.title;

        for (const [k, v] of Object.entries(target)) {
          if (!['href', 'type', 'profile', 'title'].includes(k)) {
            entry[k] = v;
          }
        }

        entries.push(entry);
      }
    }
  }

  return entries;
}

/**
 * Parses an RFC 9264 Text Linkset (`application/linkset`).
 * Uses RFC 8288 parsing rules with anchor resolution.
 */
export function parseLinksetText(
  textContent: string,
  baseUri: string
): LinksetEntry[] {
  const webLinks = parseRfc8288LinkHeader(textContent, baseUri);
  return webLinks.map((link) => {
    const anchor = link.anchor ? resolveRelativeUrl(link.anchor, baseUri) : baseUri;
    return {
      anchor,
      href: link.uri,
      rel: link.rel,
      type: link.type,
      profile: link.profile,
      title: link.title,
    };
  });
}

/**
 * Filters linkset entries to those anchored to the target URI or conceptual URI.
 */
export function filterLinksetForTarget(
  entries: LinksetEntry[],
  targetUri: string,
  conceptualUri?: string
): LinksetEntry[] {
  const targetSet = new Set<string>();
  targetSet.add(targetUri);
  if (conceptualUri) {
    targetSet.add(conceptualUri);
  }

  return entries.filter((entry) => targetSet.has(entry.anchor));
}

/**
 * Returns linkset entries matching a specific relation token.
 */
export function findLinksetRelations(
  entries: LinksetEntry[],
  rel: string
): LinksetEntry[] {
  const targetRel = rel.toLowerCase().trim();
  return entries.filter((entry) => entry.rel.includes(targetRel));
}
