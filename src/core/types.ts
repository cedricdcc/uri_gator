export type RDFFormat =
  | 'turtle'
  | 'jsonld'
  | 'ntriples'
  | 'nquads'
  | 'rdfxml'
  | 'trig'
  | 'n3'
  | 'text/turtle'
  | 'application/ld+json'
  | 'application/rdf+xml'
  | 'application/n-triples'
  | 'application/n-quads'
  | 'application/trig'
  | 'text/n3'
  | string;

export interface ExtractedRDF {
  uri: string
  content: string
  mime: string
  format?: RDFFormat
  source?: string
  url?: string
  provenance?: string
}

export interface DiscoveryOptions {
  /** If true, executes all stages without short-circuiting. Default: false */
  all?: boolean;
  /** Request timeout in milliseconds per stage. Default: 8000 */
  timeout?: number;
  /** Custom user agent */
  userAgent?: string;
}

export interface StrategyTraceStep {
  stage: number;
  strategy?: number;
  source: string;
  label: string;
  found: boolean;
  standard?: string;
  extraInfo?: string;
  hits: Array<{
    format: string;
    url: string;
    chars: number;
  }>;
}

export interface DiscoveryOverview {
  found: ExtractedRDF[];
  notFound: string[];
  trace: StrategyTraceStep[];
  provenance?: string;
}

export interface ContentNegotiationResult {
  uri: string
  mime: string
  status: number
  body?: string
}

export interface LinkRelationOption {
  name: string
  value?: string
}

export interface LinkRelationOrigin {
  type: 'linkset' | 'html' | 'link-header' | 'other'
  sourceUri: string
}

export interface LinkRelationObservation {
  anchor?: string
  rel: string
  href: string
  title?: string
  hreflang?: string
  media?: string
  options?: LinkRelationOption[]
  origin?: LinkRelationOrigin
}

export interface ParsedCliArgs {
  all?: boolean
  extendLinks?: boolean
  help?: boolean
  input?: string
  output?: string
  profile?: boolean
  provenance?: boolean
  report?: boolean
  verbose?: boolean
}
