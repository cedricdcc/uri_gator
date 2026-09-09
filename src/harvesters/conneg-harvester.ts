import type { ExtractedRDF } from '../core/types';
import type { HarvesterContext } from './types';
import { RDF_ACCEPT, RDF_MIMES, DEFAULT_USER_AGENT } from '../core/constants';
import { baseMime, isRDFMime } from '../core/utils';

const CONNEG_PLAN_URI = 'https://www.rfc-editor.org/rfc/rfc9110#section-12';

export async function harvestConneg(ctx: HarvesterContext): Promise<ExtractedRDF[]> {
  const hits: ExtractedRDF[] = [];
  const actId = ctx.tracker.startActivity('Direct Content Negotiation', CONNEG_PLAN_URI);
  ctx.tracker.recordUsage(actId, ctx.targetUri);

  try {
    if (ctx.all) {
      const seenMimes = new Set<string>();
      for (const mime of RDF_MIMES) {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), ctx.timeout);
          const res = await fetch(ctx.targetUri, {
            headers: {
              'Accept': mime,
              'User-Agent': ctx.userAgent || DEFAULT_USER_AGENT,
            },
            signal: controller.signal,
          });
          clearTimeout(timer);

          if (res.ok) {
            const resCt = baseMime(res.headers.get('content-type') || '');
            const body = await res.text();
            if (!ctx.initialResponse) {
              ctx.initialResponse = res;
              ctx.initialMime = resCt;
              ctx.initialBody = body;
            }
            if (isRDFMime(resCt) && body.trim().length > 0 && !seenMimes.has(resCt)) {
              seenMimes.add(resCt);
              const outputUri = `${ctx.targetUri}#metadata-${resCt}`;
              ctx.tracker.recordOutput(outputUri, body, actId, CONNEG_PLAN_URI, ctx.targetUri);
              hits.push({
                uri: ctx.targetUri,
                url: ctx.targetUri,
                content: body,
                mime: resCt,
                format: resCt,
                source: 'content-negotiation',
              });
            }
          }
        } catch {
          // ignore individual probe failure
        }
      }
    } else {
      let res = ctx.initialResponse;
      if (!res) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), ctx.timeout);
        res = await fetch(ctx.targetUri, {
          headers: {
            'Accept': `${RDF_ACCEPT}, text/html;q=0.9, */*;q=0.1`,
            'User-Agent': ctx.userAgent || DEFAULT_USER_AGENT,
          },
          signal: controller.signal,
        });
        clearTimeout(timer);
        ctx.initialResponse = res;
      }

      const contentType = res.headers.get('content-type') || '';
      const mime = baseMime(contentType);
      ctx.initialMime = mime;

      const bodyText = await res.text();
      ctx.initialBody = bodyText;

      if (res.ok && isRDFMime(mime) && bodyText.trim().length > 0) {
        const outputUri = `${ctx.targetUri}#metadata`;
        ctx.tracker.recordOutput(outputUri, bodyText, actId, CONNEG_PLAN_URI, ctx.targetUri);

        hits.push({
          uri: ctx.targetUri,
          url: ctx.targetUri,
          content: bodyText,
          mime,
          format: mime,
          source: 'content-negotiation',
        });
      }
    }
  } catch {
    // Network or abort errors handled gracefully
  } finally {
    ctx.tracker.endActivity(actId);
  }

  return hits;
}
