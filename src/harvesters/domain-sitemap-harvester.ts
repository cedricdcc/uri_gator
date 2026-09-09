import type { ExtractedRDF, RDFFormat } from '../core/types';
import type { HarvesterContext } from './types';
import { RDF_ACCEPT, DEFAULT_USER_AGENT } from '../core/constants';
import { baseMime, isRDFMime } from '../core/utils';
import { formatFromMime } from '../core/mime';
import { parseRobotsTxtSitemaps } from '../parsers/robots-txt';
import { parseSitemapXml } from '../parsers/sitemap-xml';

const ROBOTS_PLAN_URI = 'https://www.rfc-editor.org/rfc/rfc9309';
const SITEMAP_PLAN_URI = 'http://www.openarchives.org/rs/1.1/resourcesync';

export async function harvestDomainSitemap(ctx: HarvesterContext): Promise<ExtractedRDF[]> {
  const hits: ExtractedRDF[] = [];
  let origin: string;

  try {
    origin = new URL(ctx.conceptualUri || ctx.targetUri).origin;
  } catch {
    return hits;
  }

  const robotsUrl = `${origin}/robots.txt`;
  let sitemapQueue: Array<{ url: string; depth: number }> = [];

  // 1. Interrogate robots.txt
  const robotsActId = ctx.tracker.startActivity('Interrogate Host robots.txt', ROBOTS_PLAN_URI);
  ctx.tracker.recordUsage(robotsActId, ctx.targetUri);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ctx.timeout);
    const robotsRes = await fetch(robotsUrl, {
      headers: { 'User-Agent': ctx.userAgent || DEFAULT_USER_AGENT },
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (robotsRes.ok) {
      const robotsText = await robotsRes.text();
      ctx.tracker.recordDerivation(robotsUrl, ctx.targetUri, robotsActId, ROBOTS_PLAN_URI);
      const sitemaps = parseRobotsTxtSitemaps(robotsText, origin);
      for (const s of sitemaps) {
        sitemapQueue.push({ url: s, depth: 1 });
      }
    }
  } catch {
    // robots.txt error handled gracefully
  } finally {
    ctx.tracker.endActivity(robotsActId);
  }

  // Fallback to /sitemap.xml if no sitemaps found in robots.txt
  if (sitemapQueue.length === 0) {
    sitemapQueue.push({ url: `${origin}/sitemap.xml`, depth: 1 });
  }

  // 2. Traverse Sitemaps
  const visitedSitemaps = new Set<string>();
  const sitemapActId = ctx.tracker.startActivity('Harvest Sitemaps & ResourceSync Links', SITEMAP_PLAN_URI);
  ctx.tracker.recordUsage(sitemapActId, robotsUrl);
  ctx.tracker.recordInformedBy(sitemapActId, robotsActId);

  try {
    while (sitemapQueue.length > 0 && visitedSitemaps.size < 50) {
      const item = sitemapQueue.shift()!;
      if (visitedSitemaps.has(item.url)) continue;
      visitedSitemaps.add(item.url);

      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), ctx.timeout);
        const res = await fetch(item.url, {
          headers: {
            'Accept': 'application/xml, text/xml;q=0.9, */*;q=0.1',
            'User-Agent': ctx.userAgent || DEFAULT_USER_AGENT,
          },
          signal: controller.signal,
        });
        clearTimeout(timer);

        if (!res.ok) continue;

        const xmlText = await res.text();
        ctx.tracker.recordDerivation(item.url, robotsUrl, sitemapActId, SITEMAP_PLAN_URI);

        const parsed = parseSitemapXml(xmlText, item.url, [ctx.targetUri, ctx.conceptualUri]);

        // Expand sub-sitemaps
        if (parsed.isIndex && item.depth < 2) {
          for (const sub of parsed.sitemapUrls) {
            if (!visitedSitemaps.has(sub)) {
              sitemapQueue.push({ url: sub, depth: item.depth + 1 });
            }
          }
          continue;
        }

        // Process matching <url> links
        for (const urlEntry of parsed.matchedUrls) {
          for (const link of urlEntry.links) {
            if (ctx.visitedUrls.has(link.href)) continue;
            ctx.visitedUrls.add(link.href);

            try {
              const linkController = new AbortController();
              const linkTimer = setTimeout(() => linkController.abort(), ctx.timeout);
              const metaRes = await fetch(link.href, {
                headers: {
                  'Accept': RDF_ACCEPT,
                  'User-Agent': ctx.userAgent || DEFAULT_USER_AGENT,
                },
                signal: linkController.signal,
              });
              clearTimeout(linkTimer);

              if (metaRes.ok) {
                const mime = baseMime(metaRes.headers.get('content-type') || '');
                const body = await metaRes.text();

                if (isRDFMime(mime) && body.trim().length > 0) {
                  const format = formatFromMime(mime);
                  const outputUri = `${ctx.targetUri}#metadata`;

                  ctx.tracker.recordDerivation(link.href, item.url, sitemapActId, SITEMAP_PLAN_URI);
                  ctx.tracker.recordOutput(outputUri, body, sitemapActId, SITEMAP_PLAN_URI, link.href);

                  hits.push({
                    uri: ctx.targetUri,
                    url: link.href,
                    content: body,
                    mime,
                    format: mime,
                    source: 'sitemap-signposting',
                  });
                }
              }
            } catch {
              // Ignore single target failure
            }
          }
        }
      } catch {
        // Ignore single sitemap failure
      }
    }
  } finally {
    ctx.tracker.endActivity(sitemapActId);
  }

  return hits;
}
