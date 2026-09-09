import { describe, expect, test } from 'bun:test';
import { parseRobotsTxtSitemaps } from './robots-txt';

describe('Robots.txt Parser', () => {
  test('extracts Sitemap directives case-insensitively and ignores comments', () => {
    const text = `
      # Comment line
      User-agent: *
      Disallow: /private # inline comment
      Sitemap: https://example.org/sitemap.xml
      sitemap: /sitemap2.xml
      SITEMAP: https://example.org/sitemap3.xml
      # Sitemap: https://example.org/ignored-sitemap.xml
    `;
    const sitemaps = parseRobotsTxtSitemaps(text, 'https://example.org');
    expect(sitemaps).toEqual([
      'https://example.org/sitemap.xml',
      'https://example.org/sitemap2.xml',
      'https://example.org/sitemap3.xml',
    ]);
  });

  test('handles empty, null, or undefined input', () => {
    expect(parseRobotsTxtSitemaps('', 'https://example.org')).toEqual([]);
    expect(parseRobotsTxtSitemaps(null as any, 'https://example.org')).toEqual([]);
  });

  test('deduplicates identical sitemap URLs', () => {
    const text = `
      Sitemap: https://example.org/sitemap.xml
      Sitemap: https://example.org/sitemap.xml
    `;
    expect(parseRobotsTxtSitemaps(text, 'https://example.org')).toEqual([
      'https://example.org/sitemap.xml',
    ]);
  });
});
