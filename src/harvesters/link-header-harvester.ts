import type { ExtractedRDF, RDFFormat } from '../core/types';
import type { HarvesterContext } from './types';
import { RDF_ACCEPT, DEFAULT_USER_AGENT } from '../core/constants';
import { baseMime, isRDFMime, isLinksetMime } from '../core/utils';
import { resolveRdfFormat } from '../core/mime';
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
  sourceLabel: string,
  declaredType?: string
): Promise<ExtractedRDF | null> {
  const visitedKey = `${targetUrl}#rdf:${declaredType || ''}`;
  if (ctx.visitedUrls.has(visitedKey)) return null;
  ctx.visitedUrls.add(visitedKey);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ctx.timeout);
    const acceptHeader = declaredType
      ? `${declaredType}, ${RDF_ACCEPT}`
      : RDF_ACCEPT;

    const res = await fetch(targetUrl, {
      headers: {
        'Accept': acceptHeader,
        'User-Agent': ctx.userAgent || DEFAULT_USER_AGENT,
      },
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) return null;

    const rawCt = res.headers.get('content-type') || '';
    const mime = baseMime(rawCt);
    const body = await res.text();

    const format = resolveRdfFormat(mime, declaredType, body);

    if ((isRDFMime(mime) || format) && body.trim().length > 0) {
      const finalFormat = format || mime;
      const outputUri = `${ctx.targetUri}#metadata`;

      ctx.tracker.recordDerivation(targetUrl, derivedFromUri, actId, planUri);
      ctx.tracker.recordOutput(outputUri, body, actId, planUri, targetUrl);

      return {
        uri: ctx.targetUri,
        url: targetUrl,
        content: body,
        mime: finalFormat,
        format: finalFormat,
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

  const actId = ctx.tracker.startActivity('HTTP Link Header Inspection', RFC8288_PLAN_URI);
  ctx.tracker.recordUsage(actId, ctx.targetUri);

  try {
    const parsedLinks = linkHeader ? parseRfc8288LinkHeader(linkHeader, ctx.targetUri) : [];

    // 1. Check for rel="self" to update conceptual URI
    const selfUri = getSelfConceptualUri(parsedLinks, ctx.targetUri);
    if (selfUri) {
      ctx.conceptualUri = selfUri;
    }

    // 2. Process rel="describedby" links and rel="profile" with RDF mime
    const describedByLinks = findLinkRelations(parsedLinks, 'describedby');
    for (const p of findLinkRelations(parsedLinks, 'profile')) {
      if (p.type && isRDFMime(p.type)) {
        describedByLinks.push(p);
      }
    }

    for (const link of describedByLinks) {
      const hit = await fetchMetadataTarget(
        link.uri,
        ctx,
        actId,
        RFC8288_PLAN_URI,
        ctx.targetUri,
        'signposting-link-header',
        link.type
      );
      if (hit) {
        hits.push(hit);
        if (!ctx.all) {
          return hits;
        }
      }
    }

    // 3. Process linkset candidates
    const linksetCandidates = new Set<string>();
    const linksetLinks = findLinkRelations(parsedLinks, 'linkset');
    for (const link of linksetLinks) {
      linksetCandidates.add(link.uri);
    }
    for (const link of findLinkRelations(parsedLinks, 'profile')) {
      if (link.type && (isLinksetMime(link.type) || link.type.includes('linkset'))) {
        linksetCandidates.add(link.uri);
      }
    }

    // Probing targetUri itself for linkset content negotiation (RFC 9264 §4.2 / §5)
    // if no explicit linkset header or in exhaustive mode
    if (linksetCandidates.size === 0 || ctx.all) {
      linksetCandidates.add(ctx.targetUri);
    }

    for (const linksetUrl of linksetCandidates) {
      const visitedKey = `${linksetUrl}#linkset`;
      if (ctx.visitedUrls.has(visitedKey)) continue;
      ctx.visitedUrls.add(visitedKey);

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
          const isLinkset =
            contentType.includes('application/linkset') ||
            contentType.includes('application/ld+json') ||
            (bodyText.trim().startsWith('{') && bodyText.includes('linkset'));

          if (isLinkset) {
            let entries = contentType.includes('application/linkset+json') ||
              contentType.includes('application/ld+json') ||
              bodyText.trim().startsWith('{')
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
                  'linkset',
                  item.type
                );
                if (hit) hits.push(hit);
              }
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
