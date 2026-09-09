# WRX Core Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor `wrx` into a modular 4-stage cascading discovery engine with dedicated RFC parsers, conceptual URI resolution (`rel="self"`), pure W3C PROV-O provenance, and a comprehensive test suite.

**Architecture:** Decouples pure RFC parsers (RFC 8288, RFC 9264, HTML links, robots.txt, sitemap XML) from async network harvesters across 4 cascading stages. Traversal events feed a pure W3C PROV-O provenance tracker that serializes without proprietary ontologies. Orchestrated via a pipeline supporting first-hit and exhaustive modes.

**Tech Stack:** TypeScript, Bun runtime (`bun:test`, `bun run`), N3.js, jsonld, pino.

**Spec:** [docs/superpowers/specs/2026-09-09-wrx-core-refactor-design.md](file:///c:/Users/cedricd/Documents/Github/wrx/docs/superpowers/specs/2026-09-09-wrx-core-refactor-design.md)

## Global Constraints

- Runtime: Bun only (`bun test`, `bun run`).
- No external HTTP libraries; use standard `fetch` with `AbortController`.
- Zero proprietary vocabulary in generated provenance: standard `prov:`, `xsd:`, `rdfs:` only, no `@prefix wrx:`.
- Use `rel="self"` (RFC 8288 / RFC 4287) to identify the conceptual URI; avoid using the term "canonical".
- Maintain backward-compatible public exports: `extractRDF(uri, options?)`, `extractAllRDF(uri, options?)`.

---

### Task 1: Core Types, URI Utilities & Conceptual URI (`rel="self"`) Normalization

**Files:**
- Create: `src/core/uri.ts`
- Create: `src/core/uri.test.ts`
- Modify: `src/core/types.ts`

**Interfaces:**
- Produces:
  ```typescript
  export interface ParsedUriInfo {
    raw: string;
    normalized: string;
    origin: string;
    pathname: string;
    extension?: string;
    conceptualUri: string;
  }
  export function parseUriInfo(uri: string): ParsedUriInfo;
  export function deriveConceptualUri(uri: string, selfHeaderHref?: string): string;
  export function resolveRelativeUrl(href: string, base: string): string;
  ```

- [ ] **Step 1: Write the failing test**

```typescript
// src/core/uri.test.ts
import { describe, expect, test } from 'bun:test';
import { deriveConceptualUri, parseUriInfo, resolveRelativeUrl } from './uri';

describe('URI Utilities', () => {
  test('strips format extensions to derive conceptual URI when no self link given', () => {
    expect(deriveConceptualUri('https://example.org/dataset/1.ttl')).toBe('https://example.org/dataset/1');
    expect(deriveConceptualUri('https://example.org/dataset/1.jsonld')).toBe('https://example.org/dataset/1');
    expect(deriveConceptualUri('https://example.org/dataset/1.html')).toBe('https://example.org/dataset/1');
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
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/core/uri.test.ts`
Expected: FAIL ("Cannot find module './uri'")

- [ ] **Step 3: Write implementation**

Create `src/core/uri.ts` implementing `parseUriInfo`, `deriveConceptualUri`, and `resolveRelativeUrl`, and update `src/core/types.ts` with updated types.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/core/uri.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/core/uri.ts src/core/uri.test.ts src/core/types.ts
git commit -m "feat: add URI and conceptual URI normalization utilities"
```

---

### Task 2: Pure RFC 8288 HTTP Link Header Parser

**Files:**
- Create: `src/parsers/rfc8288-link.ts`
- Create: `src/parsers/rfc8288-link.test.ts`

**Interfaces:**
- Produces:
  ```typescript
  export interface ParsedWebLink {
    uri: string;
    rel: string[];
    type?: string;
    profile?: string;
    anchor?: string;
    title?: string;
    [key: string]: any;
  }
  export function parseRfc8288LinkHeader(headerValue: string | null | undefined, baseUri?: string): ParsedWebLink[];
  export function findLinkRelations(links: ParsedWebLink[], rel: string): ParsedWebLink[];
  export function getSelfConceptualUri(links: ParsedWebLink[], fallbackBaseUri: string): string | null;
  ```

- [ ] **Step 1: Write the failing test**

```typescript
// src/parsers/rfc8288-link.test.ts
import { describe, expect, test } from 'bun:test';
import { parseRfc8288LinkHeader, findLinkRelations, getSelfConceptualUri } from './rfc8288-link';

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
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/parsers/rfc8288-link.test.ts`
Expected: FAIL ("Cannot find module './rfc8288-link'")

- [ ] **Step 3: Write implementation**

Create `src/parsers/rfc8288-link.ts` parsing RFC 8288 headers with regex-safe parameter extraction and relative URI resolution.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/parsers/rfc8288-link.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/parsers/rfc8288-link.ts src/parsers/rfc8288-link.test.ts
git commit -m "feat: add RFC 8288 HTTP link header parser"
```

---

### Task 3: Pure RFC 9264 Linkset Parser (JSON & Text formats)

**Files:**
- Create: `src/parsers/rfc9264-linkset.ts`
- Create: `src/parsers/rfc9264-linkset.test.ts`

**Interfaces:**
- Consumes: `parseRfc8288LinkHeader` from `src/parsers/rfc8288-link.ts`
- Produces:
  ```typescript
  export interface LinksetEntry {
    anchor: string;
    href: string;
    rel: string[];
    type?: string;
    profile?: string;
  }
  export function parseLinksetJson(jsonContent: string | object, baseUri: string): LinksetEntry[];
  export function parseLinksetText(textContent: string, baseUri: string): LinksetEntry[];
  export function filterLinksetForTarget(entries: LinksetEntry[], targetUri: string, conceptualUri?: string): LinksetEntry[];
  ```

- [ ] **Step 1: Write the failing test**

```typescript
// src/parsers/rfc9264-linkset.test.ts
import { describe, expect, test } from 'bun:test';
import { parseLinksetJson, parseLinksetText, filterLinksetForTarget } from './rfc9264-linkset';

describe('RFC 9264 Linkset Parser', () => {
  test('parses application/linkset+json', () => {
    const raw = JSON.stringify({
      linkset: [
        {
          anchor: 'https://example.org/dataset/1',
          describedby: [{ href: 'https://example.org/meta/1.ttl', type: 'text/turtle' }]
        }
      ]
    });
    const entries = parseLinksetJson(raw, 'https://example.org/dataset/1');
    expect(entries).toHaveLength(1);
    expect(entries[0].anchor).toBe('https://example.org/dataset/1');
    expect(entries[0].href).toBe('https://example.org/meta/1.ttl');
    expect(entries[0].rel).toContain('describedby');
  });

  test('filters linkset entries matching conceptual URI', () => {
    const entries = [
      { anchor: 'https://example.org/dataset/1', href: 'https://example.org/meta.ttl', rel: ['describedby'] },
      { anchor: 'https://example.org/dataset/2', href: 'https://example.org/other.ttl', rel: ['describedby'] }
    ];
    const filtered = filterLinksetForTarget(entries, 'https://example.org/dataset/1.ttl', 'https://example.org/dataset/1');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].href).toBe('https://example.org/meta.ttl');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/parsers/rfc9264-linkset.test.ts`
Expected: FAIL

- [ ] **Step 3: Write implementation**

Create `src/parsers/rfc9264-linkset.ts` implementing RFC 9264 JSON and text linkset document parsers.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/parsers/rfc9264-linkset.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/parsers/rfc9264-linkset.ts src/parsers/rfc9264-linkset.test.ts
git commit -m "feat: add RFC 9264 Linkset parser for JSON and text formats"
```

---

### Task 4: Pure HTML Link & Embedded Script Parser

**Files:**
- Create: `src/parsers/html-link.ts`
- Create: `src/parsers/html-link.test.ts`

**Interfaces:**
- Produces:
  ```typescript
  export interface HtmlDiscoveryResult {
    links: Array<{ rel: string[]; href: string; type?: string; profile?: string }>;
    embeddedRdf: Array<{ content: string; mime: string; format: string }>;
    selfConceptualUri: string | null;
  }
  export function parseHtmlDiscovery(htmlContent: string, baseUri: string): HtmlDiscoveryResult;
  ```

- [ ] **Step 1: Write the failing test**

```typescript
// src/parsers/html-link.test.ts
import { describe, expect, test } from 'bun:test';
import { parseHtmlDiscovery } from './html-link';

describe('HTML Link & Embedded Script Parser', () => {
  test('extracts <link> tags and embedded ld+json script', () => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <link rel="self" href="/item" />
          <link rel="describedby" href="/item.ttl" type="text/turtle" />
          <script type="application/ld+json">{"@context":"https://schema.org","@type":"Dataset"}</script>
        </head>
        <body></body>
      </html>
    `;
    const res = parseHtmlDiscovery(html, 'https://example.org/item.html');
    expect(res.selfConceptualUri).toBe('https://example.org/item');
    expect(res.links).toHaveLength(2);
    expect(res.embeddedRdf).toHaveLength(1);
    expect(res.embeddedRdf[0].mime).toBe('application/ld+json');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/parsers/html-link.test.ts`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

Create `src/parsers/html-link.ts` using DOMParser or Regex fallback in Bun.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/parsers/html-link.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/parsers/html-link.ts src/parsers/html-link.test.ts
git commit -m "feat: add HTML link and embedded script parser"
```

---

### Task 5: Pure RFC 9309 Robots.txt Parser

**Files:**
- Create: `src/parsers/robots-txt.ts`
- Create: `src/parsers/robots-txt.test.ts`

**Interfaces:**
- Produces:
  ```typescript
  export function parseRobotsTxtSitemaps(robotsContent: string, baseOrigin: string): string[];
  ```

- [ ] **Step 1: Write the failing test**

```typescript
// src/parsers/robots-txt.test.ts
import { describe, expect, test } from 'bun:test';
import { parseRobotsTxtSitemaps } from './robots-txt';

describe('Robots.txt Parser', () => {
  test('extracts Sitemap directives case-insensitively and ignores comments', () => {
    const text = `
      # Comment line
      User-agent: *
      Disallow: /private
      Sitemap: https://example.org/sitemap.xml
      sitemap: /sitemap2.xml
    `;
    const sitemaps = parseRobotsTxtSitemaps(text, 'https://example.org');
    expect(sitemaps).toEqual([
      'https://example.org/sitemap.xml',
      'https://example.org/sitemap2.xml'
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/parsers/robots-txt.test.ts`
Expected: FAIL

- [ ] **Step 3: Write implementation**

Create `src/parsers/robots-txt.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/parsers/robots-txt.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/parsers/robots-txt.ts src/parsers/robots-txt.test.ts
git commit -m "feat: add RFC 9309 robots.txt sitemap directive parser"
```

---

### Task 6: Pure XML Sitemap Parser (`<sitemapindex>`, `<urlset>`, `<xhtml:link>`, `<rs:ln>`)

**Files:**
- Create: `src/parsers/sitemap-xml.ts`
- Create: `src/parsers/sitemap-xml.test.ts`

**Interfaces:**
- Produces:
  ```typescript
  export interface SitemapParsedResult {
    isIndex: boolean;
    sitemapUrls: string[];
    matchedUrls: Array<{
      loc: string;
      links: Array<{ rel: string[]; href: string; type?: string }>;
    }>;
  }
  export function parseSitemapXml(xmlContent: string, baseUri: string, targetUris: string[]): SitemapParsedResult;
  ```

- [ ] **Step 1: Write the failing test**

```typescript
// src/parsers/sitemap-xml.test.ts
import { describe, expect, test } from 'bun:test';
import { parseSitemapXml } from './sitemap-xml';

describe('Sitemap XML Parser', () => {
  test('parses <urlset> with <xhtml:link> and <rs:ln> matching target', () => {
    const xml = `
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
              xmlns:xhtml="http://www.w3.org/1999/xhtml"
              xmlns:rs="http://www.openarchives.org/rs/terms/">
        <url>
          <loc>https://example.org/dataset/1</loc>
          <xhtml:link rel="describedby" href="/meta/1.ttl" />
          <rs:ln rel="alternate" href="/meta/1.jsonld" />
        </url>
      </urlset>
    `;
    const res = parseSitemapXml(xml, 'https://example.org', ['https://example.org/dataset/1']);
    expect(res.isIndex).toBe(false);
    expect(res.matchedUrls).toHaveLength(1);
    expect(res.matchedUrls[0].links).toHaveLength(2);
    expect(res.matchedUrls[0].links[0].href).toBe('https://example.org/meta/1.ttl');
  });

  test('detects <sitemapindex>', () => {
    const xml = `
      <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <sitemap><loc>https://example.org/sub-sitemap.xml</loc></sitemap>
      </sitemapindex>
    `;
    const res = parseSitemapXml(xml, 'https://example.org', []);
    expect(res.isIndex).toBe(true);
    expect(res.sitemapUrls).toEqual(['https://example.org/sub-sitemap.xml']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/parsers/sitemap-xml.test.ts`
Expected: FAIL

- [ ] **Step 3: Write implementation**

Create `src/parsers/sitemap-xml.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/parsers/sitemap-xml.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/parsers/sitemap-xml.ts src/parsers/sitemap-xml.test.ts
git commit -m "feat: add XML sitemap parser with index, xhtml:link, and rs:ln support"
```

---

### Task 7: Pure W3C PROV-O Provenance Tracker & Serializer

**Files:**
- Create: `src/provenance/tracker.ts`
- Create: `src/provenance/serializer.ts`
- Create: `src/provenance/provenance.test.ts`

**Interfaces:**
- Produces:
  ```typescript
  export class ProvenanceTracker {
    constructor(targetUri: string, agentLabel?: string);
    startActivity(label: string, planUri: string): string;
    endActivity(activityId: string): void;
    recordUsage(activityId: string, entityUri: string): void;
    recordDerivation(targetEntityUri: string, derivedFromUri: string, activityId?: string, planUri?: string): void;
    recordOutput(outputUri: string, payload: string, activityId: string, planUri: string): void;
    toTurtle(): string;
  }
  ```

- [ ] **Step 1: Write the failing test**

```typescript
// src/provenance/provenance.test.ts
import { describe, expect, test } from 'bun:test';
import { ProvenanceTracker } from './tracker';

describe('Pure W3C PROV-O Provenance Tracker', () => {
  test('generates 100% valid PROV-O Turtle without wrx vocab prefix', () => {
    const tracker = new ProvenanceTracker('https://example.org/dataset/1');
    const actId = tracker.startActivity('Conneg Harvest', 'https://www.rfc-editor.org/rfc/rfc9110#section-12');
    tracker.recordUsage(actId, 'https://example.org/dataset/1');
    tracker.recordOutput('https://example.org/dataset/1#metadata', '@prefix dcat: <http://www.w3.org/ns/dcat#> .', actId, 'https://www.rfc-editor.org/rfc/rfc9110#section-12');
    tracker.endActivity(actId);

    const ttl = tracker.toTurtle();
    expect(ttl).toContain('@prefix prov: <http://www.w3.org/ns/prov#>');
    expect(ttl).not.toContain('@prefix wrx:');
    expect(ttl).not.toContain('vocab.ttl');
    expect(ttl).toContain('a prov:SoftwareAgent');
    expect(ttl).toContain('a prov:Activity');
    expect(ttl).toContain('a prov:Plan');
    expect(ttl).toContain('prov:wasDerivedFrom <https://example.org/dataset/1>');
    expect(ttl).toContain('prov:value');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/provenance/provenance.test.ts`
Expected: FAIL

- [ ] **Step 3: Write implementation**

Create `src/provenance/tracker.ts` and `src/provenance/serializer.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/provenance/provenance.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/provenance/tracker.ts src/provenance/serializer.ts src/provenance/provenance.test.ts
git commit -m "feat: implement pure W3C PROV-O provenance tracker and Turtle serializer"
```

---

### Task 8: Discovery Harvesters for Stages 1, 2, 3, and 4

**Files:**
- Create: `src/harvesters/conneg-harvester.ts`
- Create: `src/harvesters/link-header-harvester.ts`
- Create: `src/harvesters/html-signposting-harvester.ts`
- Create: `src/harvesters/domain-sitemap-harvester.ts`
- Create: `src/harvesters/harvesters.test.ts`

**Interfaces:**
- Consumes: Parsers (Tasks 2-6), ProvenanceTracker (Task 7), URI utilities (Task 1).
- Produces:
  ```typescript
  export interface HarvesterContext {
    targetUri: string;
    conceptualUri: string;
    tracker: ProvenanceTracker;
    visitedUrls: Set<string>;
    timeout: number;
    initialResponse?: Response;
  }
  export function harvestConneg(ctx: HarvesterContext): Promise<ExtractedRDF[]>;
  export function harvestLinkHeaders(ctx: HarvesterContext): Promise<ExtractedRDF[]>;
  export function harvestHtmlSignposting(ctx: HarvesterContext): Promise<ExtractedRDF[]>;
  export function harvestDomainSitemap(ctx: HarvesterContext): Promise<ExtractedRDF[]>;
  ```

- [ ] **Step 1: Write the failing test**

```typescript
// src/harvesters/harvesters.test.ts
import { describe, expect, test, afterEach } from 'bun:test';
import { harvestConneg, harvestLinkHeaders, harvestHtmlSignposting, harvestDomainSitemap } from './index';
import { ProvenanceTracker } from '../provenance/tracker';

const origFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = origFetch; });

describe('Discovery Harvesters', () => {
  test('harvestConneg returns direct RDF payload', async () => {
    globalThis.fetch = (async () => new Response('@prefix ex: <http://ex.org/> .', {
      headers: { 'content-type': 'text/turtle' }
    })) as typeof fetch;

    const tracker = new ProvenanceTracker('https://example.org/dataset');
    const hits = await harvestConneg({
      targetUri: 'https://example.org/dataset',
      conceptualUri: 'https://example.org/dataset',
      tracker,
      visitedUrls: new Set(),
      timeout: 5000
    });
    expect(hits).toHaveLength(1);
    expect(hits[0].format).toBe('text/turtle');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/harvesters/harvesters.test.ts`
Expected: FAIL

- [ ] **Step 3: Write implementation of all 4 harvesters**

Create `src/harvesters/conneg-harvester.ts`, `src/harvesters/link-header-harvester.ts`, `src/harvesters/html-signposting-harvester.ts`, and `src/harvesters/domain-sitemap-harvester.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/harvesters/harvesters.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/harvesters/
git commit -m "feat: implement discovery harvesters for 4 cascading stages"
```

---

### Task 9: Cascading Pipeline Orchestrator & Public API

**Files:**
- Create: `src/pipeline.ts`
- Create: `src/pipeline.test.ts`
- Modify: `wrx.ts`
- Delete: `src/strategies/` (removes 29 legacy stub files)

**Interfaces:**
- Produces:
  ```typescript
  export async function extractRDF(uri: string, options?: DiscoveryOptions): Promise<ExtractedRDF | null>;
  export async function extractAllRDF(uri: string, options?: DiscoveryOptions): Promise<DiscoveryOverview>;
  ```

- [ ] **Step 1: Write the failing test**

```typescript
// src/pipeline.test.ts
import { describe, expect, test, afterEach } from 'bun:test';
import { extractRDF, extractAllRDF } from './pipeline';

const origFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = origFetch; });

describe('Pipeline Orchestrator', () => {
  test('first-hit mode short circuits at Stage 1', async () => {
    let fetchCount = 0;
    globalThis.fetch = (async () => {
      fetchCount++;
      return new Response('@prefix ex: <http://ex.org/> .', {
        headers: { 'content-type': 'text/turtle' }
      });
    }) as typeof fetch;

    const hit = await extractRDF('https://example.org/dataset/1');
    expect(hit).not.toBeNull();
    expect(hit?.provenance).toContain('@prefix prov: <http://www.w3.org/ns/prov#>');
    expect(fetchCount).toBe(1);
  });

  test('exhaustive mode executes all stages and returns overview', async () => {
    globalThis.fetch = (async () => {
      return new Response('<html></html>', {
        headers: { 'content-type': 'text/html' }
      });
    }) as typeof fetch;

    const overview = await extractAllRDF('https://example.org/dataset/1');
    expect(overview).toBeDefined();
    expect(overview.trace.length).toBeGreaterThan(0);
    expect(overview.provenance).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/pipeline.test.ts`
Expected: FAIL

- [ ] **Step 3: Write pipeline implementation and update wrx.ts**

Implement `src/pipeline.ts`, wire into `wrx.ts`, and delete `src/strategies/`.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/pipeline.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pipeline.ts src/pipeline.test.ts wrx.ts
git commit -m "feat: implement cascading pipeline orchestrator and clean legacy strategies"
```

---

### Task 10: CLI Runner & Argument Parsing

**Files:**
- Modify: `src/cli/args.ts`
- Modify: `src/cli/run.ts`
- Create: `src/cli/cli.test.ts`

- [ ] **Step 1: Write CLI argument test**

```typescript
// src/cli/cli.test.ts
import { describe, expect, test } from 'bun:test';
import { parseCliArgs } from './args';

describe('CLI Argument Parser', () => {
  test('parses --all, -p, and -o correctly', () => {
    const args = parseCliArgs(['node', 'wrx', 'https://example.org', '--all', '-p', '-o', 'out.ttl']);
    expect(args.input).toBe('https://example.org');
    expect(args.all).toBe(true);
    expect(args.provenance).toBe(true);
    expect(args.output).toBe('out.ttl');
  });
});
```

- [ ] **Step 2: Run test to verify it fails or needs update**

Run: `bun test src/cli/cli.test.ts`

- [ ] **Step 3: Update `src/cli/args.ts` and `src/cli/run.ts`**

Wire the new pipeline functions and handle the `--all` switch cleanly.

- [ ] **Step 4: Run CLI test**

Run: `bun test src/cli/cli.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/cli/args.ts src/cli/run.ts src/cli/cli.test.ts
git commit -m "feat: wire CLI runner with new pipeline and --all switch"
```

---

### Task 11: Full Test Suite Verification & Lint Check

**Files:**
- Entire codebase.

- [ ] **Step 1: Run all unit and integration tests**

Run: `bun test`
Expected: 100% tests pass.

- [ ] **Step 2: Verify pure PROV-O compliance**

Run: `bun test src/provenance/provenance.test.ts`
Expected: Zero `wrx:` prefix, valid W3C PROV-O Turtle.

- [ ] **Step 3: Commit any remaining polish**

```bash
git add .
git commit -m "chore: verify full test suite passes for refactored discovery engine"
```
