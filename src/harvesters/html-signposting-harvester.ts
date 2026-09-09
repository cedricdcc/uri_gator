import type { ExtractedRDF, RDFFormat } from '../core/types';
import type { HarvesterContext } from './types';
import { RDF_ACCEPT, DEFAULT_USER_AGENT } from '../core/constants';
import { baseMime, isRDFMime } from '../core/utils';
import { formatFromMime } from '../core/mime';
import { parseHtmlDiscovery } from '../parsers/html-link';

const HTML_PLAN_URI = 'https://www.w3.org/TR/html5/';

export async function harvestHtmlSignposting(ctx: HarvesterContext): Promise<ExtractedRDF[]> {
  const hits: ExtractedRDF[] = [];
  let htmlText = '';

  if (ctx.initialMime === 'text/html' && ctx.initialBody) {
    htmlText = ctx.initialBody;
  } else {
    // If not HTML from initial response, attempt fetching conceptual URI with text/html
    const targetUrl = ctx.conceptualUri || ctx.targetUri;
    if (ctx.visitedUrls.has(targetUrl + '#html')) return hits;
    ctx.visitedUrls.add(targetUrl + '#html');

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), ctx.timeout);
      const res = await fetch(targetUrl, {
        headers: {
          'Accept': 'text/html, application/xhtml+xml;q=0.9',
          'User-Agent': ctx.userAgent || DEFAULT_USER_AGENT,
        },
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.ok) {
        const mime = baseMime(res.headers.get('content-type') || '');
        if (mime === 'text/html' || mime === 'application/xhtml+xml') {
          htmlText = await res.text();
        }
      }
    } catch {
      return hits;
    }
  }

  if (!htmlText) return hits;

  const actId = ctx.tracker.startActivity('HTML Signposting & Embedded Discovery', HTML_PLAN_URI);
  ctx.tracker.recordUsage(actId, ctx.targetUri);

  try {
    const discovery = parseHtmlDiscovery(htmlText, ctx.targetUri);

    // Update conceptual URI if found in HTML
    if (discovery.selfConceptualUri) {
      ctx.conceptualUri = discovery.selfConceptualUri;
    }

    // 1. Yield embedded scripts directly
    for (const embedded of discovery.embeddedRdf) {
      const outputUri = `${ctx.targetUri}#metadata-embedded-${hits.length + 1}`;
      ctx.tracker.recordOutput(outputUri, embedded.content, actId, HTML_PLAN_URI, ctx.targetUri);

      hits.push({
        uri: ctx.targetUri,
        url: ctx.targetUri,
        content: embedded.content,
        mime: embedded.mime,
        format: embedded.format as RDFFormat,
        source: 'html-signposting',
      });
    }

    // 2. Fetch linked metadata (<link rel="describedby"> or rel="alternate")
    for (const link of discovery.links) {
      if (!link.rel.includes('describedby') && !link.rel.includes('alternate')) {
        continue;
      }

      const linkTarget = link.href;
      if (ctx.visitedUrls.has(linkTarget)) continue;
      ctx.visitedUrls.add(linkTarget);

      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), ctx.timeout);
        const res = await fetch(linkTarget, {
          headers: {
            'Accept': RDF_ACCEPT,
            'User-Agent': ctx.userAgent || DEFAULT_USER_AGENT,
          },
          signal: controller.signal,
        });
        clearTimeout(timer);

        if (res.ok) {
          const mime = baseMime(res.headers.get('content-type') || '');
          const body = await res.text();

          if (isRDFMime(mime) && body.trim().length > 0) {
            const format = formatFromMime(mime);
            const outputUri = `${ctx.targetUri}#metadata`;

            ctx.tracker.recordDerivation(linkTarget, ctx.targetUri, actId, HTML_PLAN_URI);
            ctx.tracker.recordOutput(outputUri, body, actId, HTML_PLAN_URI, linkTarget);

            hits.push({
              uri: ctx.targetUri,
              url: linkTarget,
              content: body,
              mime,
              format,
              source: 'html-signposting',
            });
          }
        }
      } catch {
        // Link fetch failure handled gracefully
      }
    }
  } finally {
    ctx.tracker.endActivity(actId);
  }

  return hits;
}
