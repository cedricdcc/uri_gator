import { describe, expect, test } from 'bun:test';
import { parseHtmlDiscovery } from './html-link';

describe('HTML Link & Embedded Script Parser', () => {
  test('extracts <link> tags and embedded ld+json script', () => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <link rel="self" href="/item" />
          <link rel="describedby" href="/item.ttl" type="text/turtle" />
          <link rel="alternate" href="/item.jsonld" type="application/ld+json" />
          <script type="application/ld+json">{"@context":"https://schema.org","@type":"Dataset","name":"Test"}</script>
        </head>
        <body>
          <script type="text/turtle">@prefix ex: <http://example.org/> .</script>
        </body>
      </html>
    `;

    const res = parseHtmlDiscovery(html, 'https://example.org/item.html');
    expect(res.selfConceptualUri).toBe('https://example.org/item');
    expect(res.links).toHaveLength(3);
    expect(res.links[0].rel).toContain('self');
    expect(res.links[1].href).toBe('https://example.org/item.ttl');
    expect(res.links[1].type).toBe('text/turtle');

    expect(res.embeddedRdf).toHaveLength(2);
    expect(res.embeddedRdf[0].mime).toBe('application/ld+json');
    expect(res.embeddedRdf[0].content).toContain('"@type":"Dataset"');
    expect(res.embeddedRdf[1].mime).toBe('text/turtle');
  });

  test('handles multi-rel tokens and extra whitespace', () => {
    const html = `
      <html>
        <head>
          <link rel="  describedby   alternate " href="metadata.ttl" />
        </head>
      </html>
    `;
    const res = parseHtmlDiscovery(html, 'https://example.org/base/');
    expect(res.links).toHaveLength(1);
    expect(res.links[0].rel).toEqual(['describedby', 'alternate']);
    expect(res.links[0].href).toBe('https://example.org/base/metadata.ttl');
  });

  test('tolerates empty or invalid HTML strings', () => {
    expect(parseHtmlDiscovery('', 'https://example.org')).toEqual({
      links: [],
      embeddedRdf: [],
      selfConceptualUri: null,
    });
  });
});
