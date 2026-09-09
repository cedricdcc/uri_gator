import { describe, expect, test } from 'bun:test';
import { parseSitemapXml } from './sitemap-xml';

describe('Sitemap XML Parser', () => {
  test('parses <urlset> with <xhtml:link> and <rs:ln> matching target', () => {
    const xml = `
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
              xmlns:xhtml="http://www.w3.org/1999/xhtml"
              xmlns:rs="http://www.openarchives.org/rs/terms/">
        <url>
          <loc>https://example.org/dataset/1</loc>
          <xhtml:link rel="describedby" href="/meta/1.ttl" type="text/turtle" />
          <rs:ln rel="alternate" href="/meta/1.jsonld" type="application/ld+json" />
        </url>
        <url>
          <loc>https://example.org/dataset/other</loc>
          <xhtml:link rel="describedby" href="/meta/other.ttl" />
        </url>
      </urlset>
    `;
    const res = parseSitemapXml(xml, 'https://example.org', ['https://example.org/dataset/1']);
    expect(res.isIndex).toBe(false);
    expect(res.matchedUrls).toHaveLength(1);
    expect(res.matchedUrls[0].loc).toBe('https://example.org/dataset/1');
    expect(res.matchedUrls[0].links).toHaveLength(2);
    expect(res.matchedUrls[0].links[0].href).toBe('https://example.org/meta/1.ttl');
    expect(res.matchedUrls[0].links[0].rel).toContain('describedby');
    expect(res.matchedUrls[0].links[0].type).toBe('text/turtle');
    expect(res.matchedUrls[0].links[1].href).toBe('https://example.org/meta/1.jsonld');
    expect(res.matchedUrls[0].links[1].rel).toContain('alternate');
  });

  test('matches conceptual URI when loc in sitemap is the conceptual base', () => {
    const xml = `
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
          <loc>https://example.org/test</loc>
          <xhtml:link rel="describedby" href="https://example.org/test.ttl" />
        </url>
      </urlset>
    `;
    const res = parseSitemapXml(
      xml,
      'https://example.org',
      ['https://example.org/test.ttl', 'https://example.org/test']
    );
    expect(res.matchedUrls).toHaveLength(1);
    expect(res.matchedUrls[0].loc).toBe('https://example.org/test');
    expect(res.matchedUrls[0].links[0].href).toBe('https://example.org/test.ttl');
  });

  test('detects <sitemapindex> and extracts sub-sitemap URLs', () => {
    const xml = `
      <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <sitemap>
          <loc>https://example.org/sub-sitemap-1.xml</loc>
        </sitemap>
        <sitemap>
          <loc>/sub-sitemap-2.xml</loc>
        </sitemap>
      </sitemapindex>
    `;
    const res = parseSitemapXml(xml, 'https://example.org', []);
    expect(res.isIndex).toBe(true);
    expect(res.sitemapUrls).toEqual([
      'https://example.org/sub-sitemap-1.xml',
      'https://example.org/sub-sitemap-2.xml',
    ]);
  });

  test('handles empty or malformed XML gracefully', () => {
    const res = parseSitemapXml('invalid xml <><', 'https://example.org', []);
    expect(res.isIndex).toBe(false);
    expect(res.sitemapUrls).toEqual([]);
    expect(res.matchedUrls).toEqual([]);
  });
});
