import {
  extractAllRDF,
} from '../../../src/pipeline';
import type {
  ExtractedRDF,
  DiscoveryOverview,
  StrategyTraceStep,
} from '../../../src/core/types';

export type {
  ExtractedRDF,
  DiscoveryOverview,
  StrategyTraceStep,
};
import { Parser as N3Parser, Store as N3Store, Writer as N3Writer, type Quad } from 'n3';

export interface TabularTriple {
  id: string;
  subject: string;
  subjectCompact: string;
  predicate: string;
  predicateCompact: string;
  object: string;
  objectCompact: string;
  isIri: boolean;
  datatype?: string;
  lang?: string;
  graph: string;
}

export interface ProvNode {
  id: string;
  label: string;
  type: 'entity' | 'activity' | 'agent';
}

export interface ProvEdge {
  source: string;
  target: string;
  label: string;
}

export interface ProvGraphData {
  nodes: ProvNode[];
  edges: ProvEdge[];
}

export interface PlaygroundExecutionResult {
  overview: DiscoveryOverview;
  triples: TabularTriple[];
  turtleProv: string;
  jsonLdProv: string;
  graphData: ProvGraphData;
  trace: StrategyTraceStep[];
  matchedStage: string;
  conceptualUri: string;
  durationMs: number;
}

export function compactUri(uri: string): string {
  if (!uri || typeof uri !== 'string') return '';
  const prefixes: [string, string][] = [
    ['http://www.w3.org/ns/prov#', 'prov:'],
    ['http://www.w3.org/1999/02/22-rdf-syntax-ns#', 'rdf:'],
    ['http://www.w3.org/2000/01/rdf-schema#', 'rdfs:'],
    ['http://www.w3.org/2001/XMLSchema#', 'xsd:'],
    ['https://schema.org/', 'schema:'],
    ['http://schema.org/', 'schema:'],
    ['http://purl.org/dc/terms/', 'dcterms:'],
    ['http://xmlns.com/foaf/0.1/', 'foaf:'],
    ['http://www.w3.org/ns/dcat#', 'dcat:'],
    ['http://www.w3.org/2004/02/skos/core#', 'skos:'],
  ];

  for (const [prefixUri, alias] of prefixes) {
    if (uri.startsWith(prefixUri)) {
      return uri.replace(prefixUri, alias);
    }
  }
  return uri;
}

export function extractProvGraph(provStore: N3Store): ProvGraphData {
  const nodeMap = new Map<string, ProvNode>();
  const edges: ProvEdge[] = [];

  const quads = provStore.getQuads(null, null, null, null);

  for (const q of quads) {
    const s = q.subject.value;
    const p = q.predicate.value;
    const o = q.object.value;

    // Detect node types
    if (p === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') {
      if (o === 'http://www.w3.org/ns/prov#Activity') {
        nodeMap.set(s, { id: s, label: compactUri(s), type: 'activity' });
      } else if (o === 'http://www.w3.org/ns/prov#Agent' || o === 'http://www.w3.org/ns/prov#SoftwareAgent') {
        nodeMap.set(s, { id: s, label: compactUri(s), type: 'agent' });
      } else if (o === 'http://www.w3.org/ns/prov#Entity') {
        nodeMap.set(s, { id: s, label: compactUri(s), type: 'entity' });
      }
    }

    // Detect relationships
    if (
      p === 'http://www.w3.org/ns/prov#wasGeneratedBy' ||
      p === 'http://www.w3.org/ns/prov#used' ||
      p === 'http://www.w3.org/ns/prov#wasAssociatedWith' ||
      p === 'http://www.w3.org/ns/prov#wasDerivedFrom' ||
      p === 'http://www.w3.org/ns/prov#wasAttributedTo'
    ) {
      if (!nodeMap.has(s)) {
        nodeMap.set(s, { id: s, label: compactUri(s), type: 'entity' });
      }
      if (!nodeMap.has(o)) {
        nodeMap.set(o, { id: o, label: compactUri(o), type: 'entity' });
      }

      edges.push({
        source: s,
        target: o,
        label: compactUri(p),
      });
    }
  }

  return {
    nodes: Array.from(nodeMap.values()),
    edges,
  };
}

export async function parseRdfPayloadToQuads(item: ExtractedRDF): Promise<Quad[]> {
  const quads: Quad[] = [];
  const content = item.content.trim();
  if (!content) return quads;

  // If JSON-LD
  if (
    item.format === 'jsonld' ||
    item.mime?.includes('json') ||
    content.startsWith('{') ||
    content.startsWith('[')
  ) {
    try {
      // Dynamic import jsonld if needed or parse standard keys
      const jsonld = (await import('jsonld')).default || (await import('jsonld'));
      const parsed = JSON.parse(content);
      const nquadsString = (await (jsonld as any).toRDF(parsed, { format: 'application/n-quads' })) as string;
      const parser = new N3Parser({ format: 'N-Quads' });
      return parser.parse(nquadsString);
    } catch {
      // Fallback: try parsing line by line or return empty
      return quads;
    }
  }

  // Otherwise Turtle / N-Triples / N3
  try {
    const parser = new N3Parser({ baseIRI: item.url || item.uri });
    return parser.parse(content);
  } catch {
    return quads;
  }
}

export async function executeWrxPlayground(
  uri: string,
  options?: { timeout?: number }
): Promise<PlaygroundExecutionResult> {
  const start = performance.now();
  const overview = await extractAllRDF(uri, {
    all: true,
    timeout: options?.timeout || 8000,
  });
  const durationMs = Math.round(performance.now() - start);

  // Parse all discovered RDF quads
  const allQuads: Quad[] = [];
  for (const item of overview.found) {
    const quads = await parseRdfPayloadToQuads(item);
    allQuads.push(...quads);
  }

  // Convert quads to tabular representation
  const triples: TabularTriple[] = allQuads.map((q, idx) => ({
    id: `triple-${idx}`,
    subject: q.subject.value,
    subjectCompact: compactUri(q.subject.value),
    predicate: q.predicate.value,
    predicateCompact: compactUri(q.predicate.value),
    object: q.object.value,
    objectCompact: q.object.termType === 'NamedNode' ? compactUri(q.object.value) : q.object.value,
    isIri: q.object.termType === 'NamedNode',
    datatype: q.object.termType === 'Literal' ? compactUri(q.object.datatype?.value || '') : undefined,
    lang: q.object.termType === 'Literal' && q.object.language ? q.object.language : undefined,
    graph: q.graph.value || 'default',
  }));

  // Provenance Turtle
  const turtleProv = overview.provenance || '';

  // Parse PROV-O Turtle into N3Store
  const provStore = new N3Store();
  if (turtleProv) {
    try {
      const provParser = new N3Parser();
      const provQuads = provParser.parse(turtleProv);
      provStore.addQuads(provQuads);
    } catch {
      // If parsing turtle fails, keep store empty
    }
  }

  // Construct structured JSON-LD for provenance
  const jsonLdProv = JSON.stringify(
    {
      '@context': {
        prov: 'http://www.w3.org/ns/prov#',
        xsd: 'http://www.w3.org/2001/XMLSchema#',
      },
      '@graph': provStore.getQuads(null, null, null, null).map(q => ({
        '@id': q.subject.value,
        [compactUri(q.predicate.value)]:
          q.object.termType === 'NamedNode' ? { '@id': q.object.value } : q.object.value,
      })),
    },
    null,
    2
  );

  // Extract graph data
  const graphData = extractProvGraph(provStore);

  // Derive conceptual URI & matched stage from trace
  const firstFoundStep = overview.trace.find(t => t.found);
  const matchedStage = firstFoundStep ? `Stage ${firstFoundStep.stage}: ${firstFoundStep.label}` : 'None';
  const firstHit = overview.found[0];
  const conceptualUri = firstHit?.uri || uri;

  return {
    overview,
    triples,
    turtleProv,
    jsonLdProv,
    graphData,
    trace: overview.trace,
    matchedStage,
    conceptualUri,
    durationMs,
  };
}
