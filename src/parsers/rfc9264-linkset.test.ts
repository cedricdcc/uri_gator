import { describe, expect, test } from 'bun:test';
import {
  parseLinksetJson,
  parseLinksetText,
  filterLinksetForTarget,
  findLinksetRelations,
} from './rfc9264-linkset';

describe('RFC 9264 Linkset Parser', () => {
  test('parses application/linkset+json structure', () => {
    const raw = JSON.stringify({
      linkset: [
        {
          anchor: 'https://example.org/dataset/1',
          describedby: [
            { href: '/meta/1.ttl', type: 'text/turtle' },
            { href: '/meta/1.jsonld', type: 'application/ld+json' }
          ],
          profile: [
            { href: 'https://example.org/profiles/p1' }
          ]
        }
      ]
    });

    const entries = parseLinksetJson(raw, 'https://example.org/linkset.json');
    expect(entries).toHaveLength(3);
    expect(entries[0].anchor).toBe('https://example.org/dataset/1');
    expect(entries[0].href).toBe('https://example.org/meta/1.ttl');
    expect(entries[0].rel).toContain('describedby');
    expect(entries[0].type).toBe('text/turtle');

    expect(entries[1].href).toBe('https://example.org/meta/1.jsonld');
    expect(entries[2].rel).toContain('profile');
  });

  test('parses application/linkset text format', () => {
    const text = '<https://example.org/meta.ttl>; rel="describedby"; anchor="https://example.org/dataset/1"; type="text/turtle"';
    const entries = parseLinksetText(text, 'https://example.org/linkset');
    expect(entries).toHaveLength(1);
    expect(entries[0].anchor).toBe('https://example.org/dataset/1');
    expect(entries[0].href).toBe('https://example.org/meta.ttl');
    expect(entries[0].rel).toContain('describedby');
  });

  test('filters linkset entries matching target or conceptual URI', () => {
    const entries = [
      { anchor: 'https://example.org/dataset/1', href: 'https://example.org/meta1.ttl', rel: ['describedby'] },
      { anchor: 'https://example.org/dataset/2', href: 'https://example.org/meta2.ttl', rel: ['describedby'] },
      { anchor: 'https://example.org/dataset/1.ttl', href: 'https://example.org/meta1-direct.ttl', rel: ['describedby'] }
    ];

    const filtered = filterLinksetForTarget(
      entries,
      'https://example.org/dataset/1.ttl',
      'https://example.org/dataset/1'
    );

    expect(filtered).toHaveLength(2);
    expect(filtered.map((f) => f.href)).toContain('https://example.org/meta1.ttl');
    expect(filtered.map((f) => f.href)).toContain('https://example.org/meta1-direct.ttl');
  });

  test('findLinksetRelations returns matching relation items', () => {
    const entries = [
      { anchor: 'a', href: 'h1', rel: ['describedby'] },
      { anchor: 'a', href: 'h2', rel: ['alternate', 'describedby'] },
      { anchor: 'a', href: 'h3', rel: ['license'] }
    ];
    const res = findLinksetRelations(entries, 'describedby');
    expect(res).toHaveLength(2);
  });
});
