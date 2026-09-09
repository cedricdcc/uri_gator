import type { ExtractedRDF, RDFFormat } from '../core/types';
import type { HarvesterContext } from './types';
import { RDF_ACCEPT, DEFAULT_USER_AGENT } from '../core/constants';
import { baseMime, isRDFMime } from '../core/utils';
import { formatFromMime } from '../core/mime';

const CONNEG_PLAN_URI = 'https://www.rfc-editor.org/rfc/rfc9110#section-12';

export async function harvestConneg(ctx: HarvesterContext): Promise<ExtractedRDF[]> {
  const hits: ExtractedRDF[] = [];
  const actId = ctx.tracker.startActivity('Direct Content Negotiation', CONNEG_PLAN_URI);
  ctx.tracker.recordUsage(actId, ctx.targetUri);

  try {
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
      const format = formatFromMime(mime);
      const outputUri = `${ctx.targetUri}#metadata`;

      ctx.tracker.recordOutput(outputUri, bodyText, actId, CONNEG_PLAN_URI, ctx.targetUri);

      hits.push({
        uri: ctx.targetUri,
        url: ctx.targetUri,
        content: bodyText,
        mime,
        format,
        source: 'conneg',
      });
    }
  } catch {
    // Network or abort errors handled gracefully
  } finally {
    ctx.tracker.endActivity(actId);
  }

  return hits;
}
