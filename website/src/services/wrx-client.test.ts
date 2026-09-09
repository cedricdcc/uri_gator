import { describe, it, expect } from 'bun:test';
import { compactUri, extractProvGraph } from './wrx-client';
import { Store, DataFactory } from 'n3';

const { namedNode, quad } = DataFactory;

describe('wrx-client service', () => {
  it('compacts URIs with common semantic prefixes', () => {
    expect(compactUri('http://www.w3.org/ns/prov#Activity')).toBe('prov:Activity');
    expect(compactUri('https://schema.org/name')).toBe('schema:name');
    expect(compactUri('http://purl.org/dc/terms/title')).toBe('dcterms:title');
    expect(compactUri('https://example.org/custom')).toBe('https://example.org/custom');
  });

  it('extracts PROV-O graph nodes and edges', () => {
    const store = new Store();
    
    // prov:Activity
    store.addQuad(
      quad(
        namedNode('urn:uuid:act-1'),
        namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
        namedNode('http://www.w3.org/ns/prov#Activity')
      )
    );

    // prov:SoftwareAgent
    store.addQuad(
      quad(
        namedNode('urn:wrx:agent'),
        namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
        namedNode('http://www.w3.org/ns/prov#SoftwareAgent')
      )
    );

    // Activity wasAssociatedWith Agent
    store.addQuad(
      quad(
        namedNode('urn:uuid:act-1'),
        namedNode('http://www.w3.org/ns/prov#wasAssociatedWith'),
        namedNode('urn:wrx:agent')
      )
    );

    const graph = extractProvGraph(store);
    expect(graph.nodes.length).toBe(2);
    expect(graph.edges.length).toBe(1);
    expect(graph.edges[0].label).toBe('prov:wasAssociatedWith');
  });
});
