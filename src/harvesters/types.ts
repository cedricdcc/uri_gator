import type { ExtractedRDF } from '../core/types';
import type { ProvenanceTracker } from '../provenance/tracker';

export interface HarvesterContext {
  targetUri: string;
  conceptualUri: string;
  tracker: ProvenanceTracker;
  visitedUrls: Set<string>;
  timeout: number;
  userAgent?: string;
  initialResponse?: Response;
  initialBody?: string;
  initialMime?: string;
}

export type HarvesterFn = (ctx: HarvesterContext) => Promise<ExtractedRDF[]>;
