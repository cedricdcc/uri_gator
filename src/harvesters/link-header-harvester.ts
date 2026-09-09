import type { ExtractedRDF, RDFFormat } from '../core/types';
import type { HarvesterContext } from './types';
import { RDF_ACCEPT, DEFAULT_USER_AGENT } from '../core/constants';
import { baseMime, isRDFMime } from '../core/utils';
import { formatFromMime } from '../core/mime';
import { parseRfc8288LinkHeader, findLinkRelations, getSelfConceptualUri } from '../parsers/rfc8288-link';
import { parseLinksetJson, parseLinksetText, filterLinksetForTarget } from '../parsers/rfc9264-linkset';

const RFC8288_PLAN_URI = 'https://www.rfc-editor.org/rfc/rfc8288';
const RFC9264_PLAN_URI = 'https://www.rfc-editor.org/rfc/rfc9264';

async function fetchMetadataTarget(
  targetUrl: string,
  ctx: HarvesterContext,
  actId: string,
  planUri: string,
  derivedFromUri: string,
  sourceLabel: string
): Promise<ExtractedRDF | null> {
  if (ctx.visitedUrls.has(targetUrl)) return null;
  ctx.visitedUrls.add(targetUrl);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ctx.timeout);
    const res = await fetch(targetUrl, {
      headers: {
        'Accept': RDF_ACCEPT,
        'User-Agent': ctx.userAgent || DEFAULT_USER_AGENT,
      },
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) return null;

    const mime = baseMime(res.headers.get('content-type') || '');
    const body = await res.text();

    if (isRDFMime(mime) && body.trim().length > 0) {
      const format = formatFromMime(mime);
      const outputUri = `${ctx.targetUri}#metadata`;

      ctx.tracker.recordDerivation(targetUrl, derivedFromUri, actId, planUri);
      ctx.tracker.recordOutput(outputUri, body, actId, planUri, targetUrl);

      return {
        uri: ctx.targetUri,
        url: targetUrl,
        content: body,
        mime,
        format,
        source: sourceLabel,
      };
    }
  } catch {
    // Graceful error fallback
  }

  return null;
}

export async function harvestLinkHeaders(ctx: HarvesterContext): Promise<ExtractedRDF[]> {
  const hits: ExtractedRDF[] = [];
  const linkHeader = ctx.initialResponse?.headers.get('link');
  if (!linkHeader) return hits;

  const actId = ctx.tracker.startActivity('HTTP Link Header Inspection', RFC8288_PLAN_URI);
  ctx.tracker.recordUsage(actId, ctx.targetUri);

  try {
    const parsedLinks = parseRfc8288LinkHeader(linkHeader, ctx.targetUri);

    // 1. Check for rel="self" to update conceptual URI
    const selfUri = getSelfConceptualUri(parsedLinks, ctx.targetUri);
    if (selfUri) {
      ctx.conceptualUri = selfUri;
    }

    // 2. Process rel="describedby" links
    const describedByLinks = findLinkRelations(parsedLinks, 'describedby');
    for (const link of describedByLinks) {
      const hit = await fetchMetadataTarget(
        link.uri,
        ctx,
        actId,
        RFC8288_PLAN_URI,
        ctx.targetUri,
        'link-header'
      );
      if (hit) hits.push(hit);
    }

    // 3. Process rel="linkset" links
    const linksetLinks = findLinkRelations(parsedLinks, 'linkset');
    for (const link of linksetLinks) {
      const linksetUrl = link.uri;
      if (ctx.visitedUrls.has(linksetUrl)) continue;
      ctx.visitedUrls.add(linksetUrl);

      const linksetActId = ctx.tracker.startActivity('RFC 9264 Linkset Resolution', RFC9264_PLAN_URI);
      ctx.tracker.recordUsage(linksetActId, linksetUrl);
      ctx.tracker.recordInformedBy(linksetActId, actId);
      ctx.tracker.recordDerivation(linksetUrl, ctx.targetUri, linksetActId, RFC9264_PLAN_URI);

      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), ctx.timeout);
        const res = await fetch(linksetUrl, {
          headers: {
            'Accept': 'application/linkset+json, application/linkset;q=0.9, text/plain;q=0.5',
            'User-Agent': ctx.userAgent || DEFAULT_USER_AGENT,
          },
          signal: controller.signal,
        });
        clearTimeout(timer);

        if (res.ok) {
          const contentType = (res.headers.get('content-type') || '').toLowerCase();
          const bodyText = await res.text();
          let entries = contentType.includes('application/linkset+json') || bodyText.trim().startsWith('{')
            ? parseLinksetJson(bodyText, linksetUrl)
            : parseLinksetText(bodyText, linksetUrl);

          const matched = filterLinksetForTarget(entries, ctx.targetUri, ctx.conceptualUri);
          for (const item of matched) {
            if (item.rel.includes('describedby') || item.rel.includes('alternate') || item.rel.includes('item')) {
              const hit = await fetchMetadataTarget(
                item.href,
                ctx,
                linksetActId,
                RFC9264_PLAN_URI,
                linksetUrl,
                'linkset'
              );
              if (hit) hits.push(hit);
            }
          }
        }
      } catch {
        // Linkset resolution failure handled gracefully
      } finally {
        ctx.tracker.endActivity(linksetActId);
      }
    }
  } finally {
    ctx.tracker.endActivity(actId);
  }

  return hits;
}
