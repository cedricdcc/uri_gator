import { describe, expect, test } from 'bun:test';
import { deriveConceptualUri, parseUriInfo, resolveRelativeUrl } from './uri';

describe('URI Utilities', () => {
  test('strips format extensions to derive conceptual URI when no self link given', () => {
    expect(deriveConceptualUri('https://example.org/dataset/1.ttl')).toBe('https://example.org/dataset/1');
    expect(deriveConceptualUri('https://example.org/dataset/1.jsonld')).toBe('https://example.org/dataset/1');
    expect(deriveConceptualUri('https://example.org/dataset/1.html')).toBe('https://example.org/dataset/1');
    expect(deriveConceptualUri('https://example.org/dataset/1.rdf')).toBe('https://example.org/dataset/1');
    expect(deriveConceptualUri('https://example.org/dataset/1.nt')).toBe('https://example.org/dataset/1');
    expect(deriveConceptualUri('https://example.org/dataset/1.nq')).toBe('https://example.org/dataset/1');
    expect(deriveConceptualUri('https://example.org/dataset/1.n3')).toBe('https://example.org/dataset/1');
    expect(deriveConceptualUri('https://example.org/dataset/1.xml')).toBe('https://example.org/dataset/1');
    expect(deriveConceptualUri('https://example.org/dataset/1')).toBe('https://example.org/dataset/1');
  });

  test('rel="self" overrides file extension heuristic', () => {
    expect(deriveConceptualUri('https://example.org/dataset/1.ttl', 'https://example.org/dataset/canonical-1'))
      .toBe('https://example.org/dataset/canonical-1');
  });

  test('resolves relative URLs against base', () => {
    expect(resolveRelativeUrl('/meta/1.ttl', 'https://example.org/data/item'))
      .toBe('https://example.org/meta/1.ttl');
    expect(resolveRelativeUrl('meta/1.ttl', 'https://example.org/data/'))
      .toBe('https://example.org/data/meta/1.ttl');
    expect(resolveRelativeUrl('https://other.org/1.ttl', 'https://example.org/data/'))
      .toBe('https://other.org/1.ttl');
  });

  test('parseUriInfo returns parsed parts and conceptual URI', () => {
    const info = parseUriInfo('https://example.org:8080/data/test.ttl?query=1#frag');
    expect(info.origin).toBe('https://example.org:8080');
    expect(info.pathname).toBe('/data/test.ttl');
    expect(info.extension).toBe('.ttl');
    expect(info.conceptualUri).toBe('https://example.org:8080/data/test');
  });
});
