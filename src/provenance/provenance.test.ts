import { describe, expect, test } from 'bun:test';
import { ProvenanceTracker } from './tracker';

describe('Pure W3C PROV-O Provenance Tracker', () => {
  test('generates 100% valid PROV-O Turtle without wrx vocab prefix', () => {
    const tracker = new ProvenanceTracker('https://example.org/dataset/1');
    const actId = tracker.startActivity('Conneg Harvest', 'https://www.rfc-editor.org/rfc/rfc9110#section-12');
    tracker.recordUsage(actId, 'https://example.org/dataset/1');
    tracker.recordOutput(
      'https://example.org/dataset/1#metadata',
      '@prefix dcat: <http://www.w3.org/ns/dcat#> .',
      actId,
      'https://www.rfc-editor.org/rfc/rfc9110#section-12',
      'https://example.org/dataset/1'
    );
    tracker.endActivity(actId);

    const ttl = tracker.toTurtle();
    expect(ttl).toContain('@prefix prov: <http://www.w3.org/ns/prov#>');
    expect(ttl).toContain('@prefix xsd: <http://www.w3.org/2001/XMLSchema#>');
    expect(ttl).toContain('@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>');
    expect(ttl).not.toContain('@prefix wrx:');
    expect(ttl).not.toContain('vocab.ttl');
    expect(ttl).toContain('a prov:SoftwareAgent');
    expect(ttl).toContain('a prov:Activity');
    expect(ttl).toContain('a prov:Plan');
    expect(ttl).toContain('prov:wasDerivedFrom <https://example.org/dataset/1>');
    expect(ttl).toContain('prov:value');
    expect(ttl).toContain('prov:startedAtTime');
    expect(ttl).toContain('prov:endedAtTime');
  });

  test('records multi-hop derivation chain and wasInformedBy sequence', () => {
    const tracker = new ProvenanceTracker('https://example.org/data/deep');

    // Step 1: Robots
    const act1 = tracker.startActivity('Robots Discovery', 'https://www.rfc-editor.org/rfc/rfc9309');
    tracker.recordUsage(act1, 'https://example.org/data/deep');
    tracker.recordDerivation('https://example.org/robots.txt', 'https://example.org/data/deep', act1, 'https://www.rfc-editor.org/rfc/rfc9309');
    tracker.endActivity(act1);

    // Step 2: Sitemap
    const act2 = tracker.startActivity('Sitemap Harvest', 'http://www.openarchives.org/rs/1.1/resourcesync');
    tracker.recordUsage(act2, 'https://example.org/robots.txt');
    tracker.recordInformedBy(act2, act1);
    tracker.recordDerivation('https://example.org/sitemap.xml', 'https://example.org/robots.txt', act2, 'http://www.openarchives.org/rs/1.1/resourcesync');
    tracker.recordOutput(
      'https://example.org/data/deep#metadata',
      '@prefix ex: <http://ex.org/> .',
      act2,
      'http://www.openarchives.org/rs/1.1/resourcesync',
      'https://example.org/sitemap.xml'
    );
    tracker.endActivity(act2);

    const ttl = tracker.toTurtle();
    expect(ttl).toContain('<https://example.org/robots.txt> a prov:Entity');
    expect(ttl).toContain('<https://example.org/sitemap.xml> a prov:Entity');
    expect(ttl).toContain('prov:wasInformedBy');
    expect(ttl).toContain('prov:wasDerivedFrom <https://example.org/robots.txt>');
    expect(ttl).toContain('prov:wasDerivedFrom <https://example.org/sitemap.xml>');
  });
});
