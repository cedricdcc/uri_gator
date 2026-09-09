import { describe, expect, test, afterEach } from 'bun:test';
import { extractRDF, extractAllRDF } from './pipeline';

const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe('Cascading Discovery Pipeline', () => {
  test('first-hit mode short-circuits at Stage 1 when direct conneg succeeds', async () => {
    let fetchCount = 0;
    const URI = 'https://example.org/conneg-hit';

    globalThis.fetch = (async (input: RequestInfo | URL) => {
      fetchCount++;
      const url = String(input);
      if (url === URI) {
        return new Response('@prefix ex: <http://ex.org/> . ex:a ex:b ex:c .', {
          headers: { 'content-type': 'text/turtle' },
        });
      }
      return new Response('Not found', { status: 404 });
    }) as typeof fetch;

    const hit = await extractRDF(URI);

    expect(hit).not.toBeNull();
    expect(hit?.source).toBe('content-negotiation');
    expect(hit?.provenance).toBeDefined();
    expect(hit?.provenance).toContain('@prefix prov: <http://www.w3.org/ns/prov#>');
    expect(hit?.provenance).not.toContain('@prefix wrx:');
    expect(fetchCount).toBeLessThanOrEqual(2);
  });

  test('first-hit mode falls through to Stage 2 (Link Header) when Stage 1 is HTML', async () => {
    const URI = 'https://example.org/link-hit';
    const META = 'https://example.org/meta.ttl';

    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === URI) {
        return new Response('<html><body>Landing page</body></html>', {
          headers: {
            'content-type': 'text/html',
            'link': `<${META}>; rel="describedby"; type="text/turtle"`,
          },
        });
      }
      if (url === META) {
        return new Response('@prefix dcat: <http://www.w3.org/ns/dcat#> .', {
          headers: { 'content-type': 'text/turtle' },
        });
      }
      return new Response('Not found', { status: 404 });
    }) as typeof fetch;

    const hit = await extractRDF(URI);

    expect(hit).not.toBeNull();
    expect(hit?.source).toBe('signposting-link-header');
    expect(hit?.url).toBe(META);
    expect(hit?.provenance).toContain('prov:wasDerivedFrom');
  });

  test('exhaustive mode executes all stages and returns overview', async () => {
    const URI = 'https://example.org/exhaustive-test';
    const SITEMAP = 'https://example.org/sitemap.xml';
    const META = 'https://example.org/meta.ttl';

    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === URI) {
        return new Response('<html><head><script type="application/ld+json">{"@context":"https://schema.org","@type":"Dataset"}</script></head></html>', {
          headers: {
            'content-type': 'text/html',
            'link': `<${META}>; rel="describedby"; type="text/turtle"`,
          },
        });
      }
      if (url === META) {
        return new Response('@prefix ex: <http://example.org/> .', {
          headers: { 'content-type': 'text/turtle' },
        });
      }
      if (url === 'https://example.org/robots.txt') {
        return new Response(`Sitemap: ${SITEMAP}`, { status: 200 });
      }
      if (url === SITEMAP) {
        return new Response('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', { status: 200 });
      }
      return new Response('Not found', { status: 404 });
    }) as typeof fetch;

    const overview = await extractAllRDF(URI);

    expect(overview).toBeDefined();
    expect(overview.found.length).toBeGreaterThanOrEqual(2);
    expect(overview.trace).toHaveLength(4);
    expect(overview.provenance).toBeDefined();
    expect(overview.provenance).toContain('@prefix prov: <http://www.w3.org/ns/prov#>');
  });

  test('resolves conceptual URI when starting with .ttl and matches in sitemap', async () => {
    const TARGET = 'https://example.org/data/item.ttl';
    const CONCEPTUAL = 'https://example.org/data/item';
    const ROBOTS = 'https://example.org/robots.txt';
    const SITEMAP = 'https://example.org/sitemap.xml';
    const META_TTL = 'https://example.org/rdf/item.ttl';

    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === TARGET) {
        return new Response('Not found', { status: 404 });
      }
      if (url === CONCEPTUAL) {
        return new Response('<html><body>No direct RDF</body></html>', {
          headers: { 'content-type': 'text/html' },
        });
      }
      if (url === ROBOTS) {
        return new Response(`Sitemap: ${SITEMAP}`, { status: 200 });
      }
      if (url === SITEMAP) {
        return new Response(`
          <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
                  xmlns:xhtml="http://www.w3.org/1999/xhtml">
            <url>
              <loc>${CONCEPTUAL}</loc>
              <xhtml:link rel="describedby" href="${META_TTL}" />
            </url>
          </urlset>
        `, { status: 200, headers: { 'content-type': 'application/xml' } });
      }
      if (url === META_TTL) {
        return new Response('@prefix ex: <http://example.org/deep/> .', {
          headers: { 'content-type': 'text/turtle' },
        });
      }
      return new Response('Not found', { status: 404 });
    }) as typeof fetch;

    const hit = await extractRDF(TARGET);

    expect(hit).not.toBeNull();
    expect(hit?.source).toBe('sitemap-signposting');
    expect(hit?.url).toBe(META_TTL);
  });
});
