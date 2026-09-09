import { describe, expect, test } from 'bun:test';
import {
  parseRfc8288LinkHeader,
  findLinkRelations,
  getSelfConceptualUri,
} from './rfc8288-link';

describe('RFC 8288 Link Header Parser', () => {
  test('parses single link with rel and type', () => {
    const header = '<https://example.org/meta.ttl>; rel="describedby"; type="text/turtle"';
    const links = parseRfc8288LinkHeader(header);
    expect(links).toHaveLength(1);
    expect(links[0].uri).toBe('https://example.org/meta.ttl');
    expect(links[0].rel).toContain('describedby');
    expect(links[0].type).toBe('text/turtle');
  });

  test('parses multi-value links and multi-token rel attributes', () => {
    const header = '</meta.ttl>; rel="describedby alternate"; type="text/turtle", </self>; rel="self"';
    const links = parseRfc8288LinkHeader(header, 'https://example.org/dataset/1');
    expect(links).toHaveLength(2);
    expect(links[0].uri).toBe('https://example.org/meta.ttl');
    expect(links[0].rel).toEqual(['describedby', 'alternate']);
    expect(getSelfConceptualUri(links, 'https://example.org/dataset/1')).toBe('https://example.org/self');
  });

  test('parses profile and anchor parameters', () => {
    const header = '<https://example.org/doc>; rel="profile"; profile="https://example.org/my-profile"; anchor="https://example.org/data"';
    const links = parseRfc8288LinkHeader(header);
    expect(links).toHaveLength(1);
    expect(links[0].profile).toBe('https://example.org/my-profile');
    expect(links[0].anchor).toBe('https://example.org/data');
  });

  test('findLinkRelations filters by specific relation token', () => {
    const header = '<link1>; rel="describedby", <link2>; rel="alternate describedby", <link3>; rel="license"';
    const links = parseRfc8288LinkHeader(header, 'https://example.org/');
    const describedbyLinks = findLinkRelations(links, 'describedby');
    expect(describedbyLinks).toHaveLength(2);
    expect(describedbyLinks[0].uri).toBe('https://example.org/link1');
    expect(describedbyLinks[1].uri).toBe('https://example.org/link2');
  });

  test('handles null, empty, or undefined header values cleanly', () => {
    expect(parseRfc8288LinkHeader(null)).toEqual([]);
    expect(parseRfc8288LinkHeader('')).toEqual([]);
    expect(parseRfc8288LinkHeader(undefined)).toEqual([]);
  });
});
