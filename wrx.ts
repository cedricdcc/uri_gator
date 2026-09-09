// wrx.ts
// TypeScript module for Bun to extract web resources and RDF metadata from a URI using cascading discovery.
// Run with: bun run wrx.js (or import the function in your Bun project)

import type {
  ExtractedRDF,
  DiscoveryOptions,
  DiscoveryOverview,
  StrategyTraceStep,
  RDFFormat,
} from './src/core/types';

export type {
  ExtractedRDF,
  DiscoveryOptions,
  DiscoveryOverview,
  StrategyTraceStep,
  RDFFormat,
};

export { extractRDF, extractAllRDF } from './src/pipeline';
export { deriveConceptualUri, parseUriInfo, resolveRelativeUrl } from './src/core/uri';
export { ProvenanceTracker } from './src/provenance/tracker';
export { parseRfc8288LinkHeader, findLinkRelations } from './src/parsers/rfc8288-link';
export { parseLinksetJson, parseLinksetText, filterLinksetForTarget } from './src/parsers/rfc9264-linkset';
export { parseHtmlDiscovery } from './src/parsers/html-link';
export { parseRobotsTxtSitemaps } from './src/parsers/robots-txt';
export { parseSitemapXml } from './src/parsers/sitemap-xml';

export { setLogLevel, addLogListener, removeLogListener } from './src/core/logger';
export type { LogEvent, LogListener } from './src/core/logger';
export { runWrxCli } from './src/cli/run';

if (import.meta.main) {
  (async () => {
    const cliPath = './src/cli/run.ts';
    const { runWrxCli } = await import(/* @vite-ignore */ cliPath);
    await runWrxCli();
  })();
}
