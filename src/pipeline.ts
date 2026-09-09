import type {
  ExtractedRDF,
  DiscoveryOptions,
  DiscoveryOverview,
  StrategyTraceStep,
} from './core/types';
import { RDF_ACCEPT, DEFAULT_USER_AGENT } from './core/constants';
import { logger } from './core/logger';
import { deriveConceptualUri } from './core/uri';
import { ProvenanceTracker } from './provenance/tracker';
import {
  harvestConneg,
  harvestLinkHeaders,
  harvestHtmlSignposting,
  harvestDomainSitemap,
  type HarvesterContext,
} from './harvesters/index';

const STAGE_CONFIGS = [
  {
    stage: 1,
    source: 'content-negotiation',
    label: 'Direct Content Negotiation',
    standard: 'RFC 9110',
    fn: harvestConneg,
  },
  {
    stage: 2,
    source: 'signposting-link-header',
    label: 'HTTP Link Headers & Linkset',
    standard: 'RFC 8288 / RFC 9264',
    fn: harvestLinkHeaders,
  },
  {
    stage: 3,
    source: 'signposting-html-link',
    label: 'FAIR HTML Signposting & Embedded Scripts',
    standard: 'W3C HTML5 / FAIR Signposting',
    fn: harvestHtmlSignposting,
  },
  {
    stage: 4,
    source: 'sitemap-signposting',
    label: 'Domain & Sitemap Discovery',
    standard: 'RFC 9309 / ResourceSync (RT-P06)',
    fn: harvestDomainSitemap,
  },
];

/**
 * First-hit discovery: tries the cascading stages in order and short-circuits
 * as soon as valid RDF metadata is discovered.
 */
export async function extractRDF(
  uri: string,
  options?: DiscoveryOptions
): Promise<ExtractedRDF | null> {
  logger.info({ uri }, 'Starting RDF discovery cascade');
  const tracker = new ProvenanceTracker(uri);
  const conceptualUri = deriveConceptualUri(uri);
  const timeout = options?.timeout ?? 8000;

  const ctx: HarvesterContext = {
    targetUri: uri,
    conceptualUri,
    tracker,
    visitedUrls: new Set<string>(),
    timeout,
    userAgent: options?.userAgent,
  };

  // HEAD Signposting Preflight (FAIR Signposting recommendation)
  try {
    const headController = new AbortController();
    const headTimer = setTimeout(() => headController.abort(), Math.min(timeout, 3000));
    const headRes = await fetch(uri, {
      method: 'HEAD',
      headers: {
        'Accept': `${RDF_ACCEPT}, text/html;q=0.9, */*;q=0.1`,
        'User-Agent': options?.userAgent || DEFAULT_USER_AGENT,
      },
      signal: headController.signal,
    });
    clearTimeout(headTimer);

    if (headRes.ok) {
      const linkHdr = headRes.headers.get('link');
      if (linkHdr && (linkHdr.includes('describedby') || linkHdr.includes('linkset') || linkHdr.includes('profile'))) {
        ctx.initialResponse = headRes;
        const preflightHits = await harvestLinkHeaders(ctx);
        if (preflightHits.length > 0) {
          const firstHit = preflightHits[0];
          firstHit.provenance = tracker.toTurtle();
          return firstHit;
        }
      }
    }
  } catch {
    // Graceful fallback to GET cascade
  }

  for (const stage of STAGE_CONFIGS) {
    try {
      const hits = await stage.fn(ctx);
      if (hits.length > 0) {
        const firstHit = hits[0];
        if (stage.stage === 1) {
          logger.info(
            { uri, source: 'content-negotiation', url: uri, stage: 1 },
            'Initial response is already RDF (MIME: %s) via content-negotiation',
            firstHit.mime
          );
        }
        firstHit.provenance = tracker.toTurtle();
        return firstHit;
      }
    } catch {
      // Graceful fallback to next stage
    }
  }

  return null;
}

/**
 * Exhaustive discovery: executes all 4 stages across the target URI and its domain,
 * collecting all available RDF payloads, trace steps, and full provenance.
 */
export async function extractAllRDF(
  uri: string,
  options?: DiscoveryOptions
): Promise<DiscoveryOverview> {
  logger.info({ uri }, 'Starting RDF discovery cascade (exhaustive mode) for URI: %s', uri);
  const tracker = new ProvenanceTracker(uri);
  const conceptualUri = deriveConceptualUri(uri);
  const timeout = options?.timeout ?? 8000;

  const ctx: HarvesterContext = {
    targetUri: uri,
    conceptualUri,
    tracker,
    visitedUrls: new Set<string>(),
    timeout,
    all: true,
    userAgent: options?.userAgent,
  };

  const found: ExtractedRDF[] = [];
  const notFound: string[] = [];
  const trace: StrategyTraceStep[] = [];
  const seenPayloads = new Set<string>();

  for (const stage of STAGE_CONFIGS) {
    let stageHits: ExtractedRDF[] = [];
    try {
      stageHits = await stage.fn(ctx);
    } catch {
      // Handled gracefully
    }

    const uniqueStageHits: ExtractedRDF[] = [];
    for (const h of stageHits) {
      const hashKey = `${h.format || ''}::${h.content.trim()}`;
      if (!seenPayloads.has(hashKey)) {
        seenPayloads.add(hashKey);
        uniqueStageHits.push(h);
        found.push(h);
      }
    }

    const isFound = uniqueStageHits.length > 0;
    if (!isFound) {
      notFound.push(stage.source);
    }

    trace.push({
      stage: stage.stage,
      strategy: stage.stage,
      source: stage.source,
      label: stage.label,
      standard: stage.standard,
      found: isFound,
      hits: uniqueStageHits.map((h) => ({
        format: h.format || h.mime || 'unknown',
        url: h.url || uri,
        chars: h.content.length,
      })),
    });
  }

  const provenance = tracker.toTurtle();

  return {
    found,
    notFound,
    trace,
    provenance,
  };
}
