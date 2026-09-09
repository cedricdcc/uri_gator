import { resolveRelativeUrl } from '../core/uri';

export interface SitemapLink {
  rel: string[];
  href: string;
  type?: string;
  profile?: string;
}

export interface SitemapUrlEntry {
  loc: string;
  links: SitemapLink[];
}

export interface SitemapParsedResult {
  isIndex: boolean;
  sitemapUrls: string[];
  matchedUrls: SitemapUrlEntry[];
}

/**
 * Extracts links (<xhtml:link> and <rs:ln>) from a <url> block.
 */
function extractLinksFromUrlBlock(urlBlock: string, baseUri: string): SitemapLink[] {
  const links: SitemapLink[] = [];

  // Match both <xhtml:link .../> and <rs:ln .../>
  const linkRegex = /<(?:(?:xhtml:)?link|rs:ln)\b([^>]*)\/?>/gi;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(urlBlock)) !== null) {
    const attrString = match[1];

    const relMatch = attrString.match(/\brel\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const hrefMatch = attrString.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const typeMatch = attrString.match(/\btype\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const profileMatch = attrString.match(/\bprofile\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);

    const rawHref = (hrefMatch ? hrefMatch[1] ?? hrefMatch[2] ?? hrefMatch[3] : '')?.trim();
    if (!rawHref) continue;

    const rawRel = (relMatch ? relMatch[1] ?? relMatch[2] ?? relMatch[3] : '')?.trim() || '';
    const relTokens = rawRel.toLowerCase().split(/\s+/).filter(Boolean);

    const link: SitemapLink = {
      rel: relTokens,
      href: resolveRelativeUrl(rawHref, baseUri),
    };

    if (typeMatch) {
      link.type = (typeMatch[1] ?? typeMatch[2] ?? typeMatch[3])?.trim().toLowerCase();
    }
    if (profileMatch) {
      link.profile = (profileMatch[1] ?? profileMatch[2] ?? profileMatch[3])?.trim();
    }

    links.push(link);
  }

  return links;
}

/**
 * Parses XML sitemap documents (both <sitemapindex> and <urlset>).
 */
export function parseSitemapXml(
  xmlContent: string | null | undefined,
  baseUri: string,
  targetUris: string[] = []
): SitemapParsedResult {
  if (!xmlContent || typeof xmlContent !== 'string') {
    return {
      isIndex: false,
      sitemapUrls: [],
      matchedUrls: [],
    };
  }

  const cleanXml = xmlContent.trim();
  const normalizedTargets = new Set(targetUris.map((u) => u.trim()).filter(Boolean));

  // 1. Check if <sitemapindex>
  if (/<sitemapindex\b/i.test(cleanXml)) {
    const sitemapUrls: string[] = [];
    const sitemapBlockRegex = /<sitemap\b[^>]*>([\s\S]*?)<\/sitemap>/gi;
    let sitemapMatch: RegExpExecArray | null;

    while ((sitemapMatch = sitemapBlockRegex.exec(cleanXml)) !== null) {
      const block = sitemapMatch[1];
      const locMatch = block.match(/<loc\b[^>]*>([\s\S]*?)<\/loc>/i);
      if (locMatch && locMatch[1]) {
        const rawLoc = locMatch[1].trim();
        if (rawLoc) {
          sitemapUrls.push(resolveRelativeUrl(rawLoc, baseUri));
        }
      }
    }

    return {
      isIndex: true,
      sitemapUrls,
      matchedUrls: [],
    };
  }

  // 2. Otherwise process <urlset>
  const matchedUrls: SitemapUrlEntry[] = [];
  const urlBlockRegex = /<url\b[^>]*>([\s\S]*?)<\/url>/gi;
  let urlMatch: RegExpExecArray | null;

  while ((urlMatch = urlBlockRegex.exec(cleanXml)) !== null) {
    const block = urlMatch[1];
    const locMatch = block.match(/<loc\b[^>]*>([\s\S]*?)<\/loc>/i);
    if (!locMatch || !locMatch[1]) continue;

    const rawLoc = locMatch[1].trim();
    const resolvedLoc = resolveRelativeUrl(rawLoc, baseUri);

    // If targetUris filter is provided, check match
    if (normalizedTargets.size > 0 && !normalizedTargets.has(resolvedLoc) && !normalizedTargets.has(rawLoc)) {
      continue;
    }

    const links = extractLinksFromUrlBlock(block, baseUri);
    matchedUrls.push({
      loc: resolvedLoc,
      links,
    });
  }

  return {
    isIndex: false,
    sitemapUrls: [],
    matchedUrls,
  };
}
