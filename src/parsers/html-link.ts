import { resolveRelativeUrl } from '../core/uri';
import { isRDFMime } from '../core/utils';

export interface HtmlDiscoveryResult {
  links: Array<{
    rel: string[];
    href: string;
    type?: string;
    profile?: string;
    title?: string;
  }>;
  embeddedRdf: Array<{
    content: string;
    mime: string;
    format: string;
  }>;
  selfConceptualUri: string | null;
}

/**
 * Parses an HTML string to extract <link> tags and embedded RDF <script> tags.
 */
export function parseHtmlDiscovery(
  htmlContent: string | null | undefined,
  baseUri: string
): HtmlDiscoveryResult {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return {
      links: [],
      embeddedRdf: [],
      selfConceptualUri: null,
    };
  }

  const links: HtmlDiscoveryResult['links'] = [];
  const embeddedRdf: HtmlDiscoveryResult['embeddedRdf'] = [];
  let selfConceptualUri: string | null = null;

  // 1. Extract <link ...> elements
  const linkTagRegex = /<link\b([^>]*)\/?>/gi;
  let match: RegExpExecArray | null;

  while ((match = linkTagRegex.exec(htmlContent)) !== null) {
    const attrString = match[1];

    const relMatch = attrString.match(/\brel\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const hrefMatch = attrString.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const typeMatch = attrString.match(/\btype\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const profileMatch = attrString.match(/\bprofile\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const titleMatch = attrString.match(/\btitle\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);

    const rawHref = (hrefMatch ? hrefMatch[1] ?? hrefMatch[2] ?? hrefMatch[3] : '')?.trim();
    if (!rawHref) continue;

    const rawRel = (relMatch ? relMatch[1] ?? relMatch[2] ?? relMatch[3] : '')?.trim() || '';
    const relTokens = rawRel.toLowerCase().split(/\s+/).filter(Boolean);

    const resolvedHref = resolveRelativeUrl(rawHref, baseUri);
    const linkItem: HtmlDiscoveryResult['links'][0] = {
      rel: relTokens,
      href: resolvedHref,
    };

    if (typeMatch) {
      linkItem.type = (typeMatch[1] ?? typeMatch[2] ?? typeMatch[3])?.trim().toLowerCase();
    }
    if (profileMatch) {
      linkItem.profile = (profileMatch[1] ?? profileMatch[2] ?? profileMatch[3])?.trim();
    }
    if (titleMatch) {
      linkItem.title = (titleMatch[1] ?? titleMatch[2] ?? titleMatch[3])?.trim();
    }

    if (relTokens.includes('self') && !selfConceptualUri) {
      selfConceptualUri = resolvedHref;
    }

    links.push(linkItem);
  }

  // 2. Extract embedded RDF <script type="application/ld+json|text/turtle">...</script>
  const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  while ((match = scriptRegex.exec(htmlContent)) !== null) {
    const attrString = match[1];
    const scriptBody = match[2]?.trim();

    if (!scriptBody) continue;

    const typeMatch = attrString.match(/\btype\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const mime = (typeMatch ? typeMatch[1] ?? typeMatch[2] ?? typeMatch[3] : '')?.trim().toLowerCase();

    if (mime === 'application/ld+json') {
      embeddedRdf.push({
        content: scriptBody,
        mime: 'application/ld+json',
        format: 'jsonld',
      });
    } else if (mime === 'text/turtle' || mime === 'application/turtle') {
      embeddedRdf.push({
        content: scriptBody,
        mime: 'text/turtle',
        format: 'turtle',
      });
    } else if (mime === 'application/rdf+xml') {
      embeddedRdf.push({
        content: scriptBody,
        mime: 'application/rdf+xml',
        format: 'rdfxml',
      });
    } else if (mime === 'text/n3') {
      embeddedRdf.push({
        content: scriptBody,
        mime: 'text/n3',
        format: 'n3',
      });
    }
  }

  return {
    links,
    embeddedRdf,
    selfConceptualUri,
  };
}
