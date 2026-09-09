import { describe, expect, test, afterEach } from 'bun:test';
import {
  harvestConneg,
  harvestLinkHeaders,
  harvestHtmlSignposting,
  harvestDomainSitemap,
} from './index';
import { ProvenanceTracker } from '../provenance/tracker';
import type { HarvesterContext } from './types';

const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});

function createMockContext(targetUri: string, conceptualUri?: string): HarvesterContext {
  const conc = conceptualUri || targetUri;
  return {
    targetUri,
    conceptualUri: conc,
    tracker: new ProvenanceTracker(targetUri),
    visitedUrls: new Set<string>(),
    timeout: 5000,
  };
}

describe('Discovery Harvesters', () => {
  test('harvestConneg extracts direct RDF payload', async () => {
    const URI = 'https://example.org/dataset/direct';
    const BODY = '@prefix ex: <http://example.org/> . ex:s ex:p ex:o .';

    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === URI) {
        return new Response(BODY, {
          status: 200,
          headers: { 'content-type': 'text/turtle' },
        });
      }
      return new Response('Not found', { status: 404 });
    }) as typeof fetch;

    const ctx = createMockContext(URI);
    const hits = await harvestConneg(ctx);

    expect(hits).toHaveLength(1);
    expect(hits[0].format).toBe('text/turtle');
    expect(hits[0].content).toBe(BODY);
    expect(hits[0].source).toBe('content-negotiation');
    expect(ctx.initialBody).toBe(BODY);
  });

  test('harvestLinkHeaders resolves rel="describedby" and rel="linkset"', async () => {
    const TARGET = 'https://example.org/dataset/link-test';
    const LINKSET = 'https://example.org/linkset.json';
    const META = 'https://example.org/meta.ttl';
    const RDF_BODY = '@prefix dcat: <http://www.w3.org/ns/dcat#> .';

    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === TARGET) {
        return new Response('Landing page', {
          status: 200,
          headers: {
            'content-type': 'text/html',
            'link': `<${LINKSET}>; rel="linkset"; type="application/linkset+json"`
          }
        });
      }
      if (url === LINKSET) {
        return new Response(JSON.stringify({
          linkset: [
            {
              anchor: TARGET,
              describedby: [{ href: META, type: 'text/turtle' }]
            }
          ]
        }), {
          status: 200,
          headers: { 'content-type': 'application/linkset+json' }
        });
      }
      if (url === META) {
        return new Response(RDF_BODY, {
          status: 200,
          headers: { 'content-type': 'text/turtle' }
        });
      }
      return new Response('Not found', { status: 404 });
    }) as typeof fetch;

    const ctx = createMockContext(TARGET);
    // Pretend Stage 1 ran and stored initial response
    ctx.initialResponse = await fetch(TARGET);
    const hits = await harvestLinkHeaders(ctx);

    expect(hits.length).toBeGreaterThanOrEqual(1);
    expect(hits[0].content).toBe(RDF_BODY);
    expect(hits[0].url).toBe(META);
  });

  test('harvestHtmlSignposting extracts embedded JSON-LD from HTML body', async () => {
    const TARGET = 'https://example.org/dataset/html-test';
    const JSONLD = '{"@context":"https://schema.org","@type":"Dataset","name":"Test"}';
    const HTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <script type="application/ld+json">${JSONLD}</script>
        </head>
      </html>
    `;

    const ctx = createMockContext(TARGET);
    ctx.initialBody = HTML;
    ctx.initialMime = 'text/html';

    const hits = await harvestHtmlSignposting(ctx);
    expect(hits).toHaveLength(1);
    expect(hits[0].format).toBe('application/ld+json');
    expect(hits[0].content).toBe(JSONLD);
    expect(hits[0].source).toBe('embedded-script');
  });

  test('harvestDomainSitemap discovers metadata via robots.txt and sitemap.xml', async () => {
    const TARGET = 'https://example.org/data/deep-item.ttl';
    const CONCEPTUAL = 'https://example.org/data/deep-item';
    const ROBOTS = 'https://example.org/robots.txt';
    const SITEMAP = 'https://example.org/sitemap.xml';
    const RDF_URL = 'https://example.org/meta/deep.ttl';
    const RDF_CONTENT = '@prefix skos: <http://www.w3.org/2004/02/skos/core#> .';

    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === ROBOTS) {
        return new Response(`User-agent: *\nSitemap: ${SITEMAP}`, { status: 200 });
      }
      if (url === SITEMAP) {
        return new Response(`
          <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
                  xmlns:rs="http://www.openarchives.org/rs/terms/">
            <url>
              <loc>${CONCEPTUAL}</loc>
              <rs:ln rel="describedby" href="${RDF_URL}" type="text/turtle" />
            </url>
          </urlset>
        `, { status: 200, headers: { 'content-type': 'application/xml' } });
      }
      if (url === RDF_URL) {
        return new Response(RDF_CONTENT, {
          status: 200,
          headers: { 'content-type': 'text/turtle' }
        });
      }
      return new Response('Not found', { status: 404 });
    }) as typeof fetch;

    const ctx = createMockContext(TARGET, CONCEPTUAL);
    const hits = await harvestDomainSitemap(ctx);

    expect(hits).toHaveLength(1);
    expect(hits[0].content).toBe(RDF_CONTENT);
    expect(hits[0].url).toBe(RDF_URL);
    expect(hits[0].source).toBe('sitemap-signposting');
  });
});
