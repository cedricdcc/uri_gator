# WRX Core Refactor & Discovery Revamp Specification

- **Date:** 2026-09-09
- **Branch:** `refactor/wrx`
- **Scope:** Sub-Project 1 — Core Discovery Engine, Parsers, Traversal Pipeline & Pure W3C PROV-O Provenance

---

## 1. Overview & Objectives

This specification defines the complete architectural overhaul of `wrx` (Web Resource eXtraction). Inspired by the [GRMP RT-Test suite](https://github.com/vliz-be-opsci/grmp-test-implementations/tree/main/rt-test) and the [EOSC Radical Transparency (RT) Linkset Usage Patterns](https://github.com/eosc-semantic-interop/if-solutions-proposals/tree/main/proposals/radical-transparency/linkset-usage-patterns), this revamp replaces the legacy 29-stub strategy files with a streamlined, modular 4-stage discovery cascade powered by dedicated RFC-compliant parsers, conceptual URI resolution (`rel="self"`), and a pure W3C PROV-O provenance audit engine.

### Key Goals
1. **4-Stage Cascading Discovery Hierarchy:**
   - **Stage 1:** Direct Content Negotiation on the target asset URI.
   - **Stage 2:** HTTP `Link` header inspection & RFC 9264 linkset traversal.
   - **Stage 3:** FAIR Signposting in HTML and in-payload embedded JSON-LD scripts.
   - **Stage 4:** Domain hostwide discovery (`robots.txt` $\rightarrow$ XML sitemaps $\rightarrow$ `<xhtml:link>` / `<rs:ln>` link injections).
2. **Pure W3C PROV-O Provenance Trail:**
   - Audit the exact traversal trail using 100% standard W3C PROV-O terms without proprietary `vocab.ttl` dependencies or `@prefix wrx:`.
   - Directly link canonical IETF RFC and W3C specifications as `prov:Plan` instances.
3. **Conceptual URI Resolution via `rel="self"`:**
   - Use `rel="self"` (RFC 8288 / RFC 4287) to resolve the conceptual resource URI when format-specific URLs (e.g. `https://example.org/test.ttl`) are provided, ensuring accurate sitemap matching and landing page discovery.
4. **First-Hit vs. Exhaustive Mode Separation:**
   - Provide a clear, explicit switch in both the library API (`extractRDF` vs `extractAllRDF`, `{ all: boolean }`) and the CLI (`--all` / `-a`).
5. **Two-Phase Delivery Decomposition:**
   - **Sub-Project 1:** Core engine, parsers, harvesters, provenance, and tests.
   - **Sub-Project 2:** Interactive website redesign reflecting the new pipeline and provenance graph.

---

## 2. Architecture & Component Decomposition

```
src/
├── parsers/                         # Pure, network-agnostic RFC & markup parsers
│   ├── rfc8288-link.ts              # HTTP Link header parser (RFC 8288)
│   ├── rfc9264-linkset.ts           # Linkset parser for application/linkset & linkset+json (RFC 9264)
│   ├── html-link.ts                 # HTML <link> elements & <script type="application/ld+json">
│   ├── robots-txt.ts                # robots.txt parser extracting Sitemap directives (RFC 9309)
│   └── sitemap-xml.ts               # XML sitemap parser (<sitemapindex>, <urlset>, <xhtml:link>, <rs:ln>)
│
├── harvesters/                      # Autonomous async network harvesters
│   ├── conneg-harvester.ts          # Stage 1: Direct content negotiation on target URI
│   ├── link-header-harvester.ts     # Stage 2: Link headers, conneg menus, & RFC 9264 linksets
│   ├── html-signposting-harvester.ts# Stage 3: HTML signposting links & embedded JSON-LD
│   └── domain-sitemap-harvester.ts  # Stage 4: robots.txt -> sitemaps -> xhtml:link / rs:ln
│
├── provenance/                      # Pure W3C PROV-O audit trail engine
│   ├── tracker.ts                   # In-flight provenance event accumulator
│   └── serializer.ts                # Pure W3C PROV-O Turtle serializer (no vocab.ttl)
│
├── core/                            # Shared primitives
│   ├── mime.ts                      # RDF MIME definitions and format sniffing
│   ├── fetch.ts                     # Fetch wrapper with timeouts, headers, User-Agent
│   ├── uri.ts                       # URI normalization and conceptual URI resolution (rel="self")
│   ├── types.ts                     # Public & internal TypeScript interfaces
│   └── logger.ts                    # Isomorphic logger
│
├── pipeline.ts                      # Cascading discovery orchestrator (first-hit vs exhaustive)
├── cli/                             # CLI runner & argument parsing
│   ├── args.ts                      # CLI argument parsing (--all, --provenance, etc.)
│   └── run.ts                       # CLI execution entrypoint
└── wrx.ts                           # Main public package entrypoint (extractRDF, extractAllRDF)
```

---

## 3. Discovery Pipeline & LOD Pattern Mapping

### Stage 1: Direct Content Negotiation (RFC 9110 / RFC 7231)
- **Action:** Send HTTP GET/HEAD to the target URI with `Accept: text/turtle, application/ld+json, application/rdf+xml, application/n-triples, application/n-quads, application/trig, text/n3`.
- **LOD Location:** Direct HTTP response body.
- **Pattern Alignment:** RT-P03 (Direct conneg representation).
- **Short-circuit:** If response Content-Type is a supported RDF media type and payload is non-empty, return immediately (in first-hit mode).

### Stage 2: HTTP Link Headers & External Linksets (RFC 8288 / RFC 9264)
- **Action:** Inspect `Link:` headers on response from Stage 1 (or issue HEAD).
- **Target Relations Evaluated:**
  - `rel="self"`: Resolves and updates the conceptual URI.
  - `rel="describedby"`: Points directly to an external RDF metadata document; fetched with RDF Accept headers.
  - `rel="alternate"`: Evaluates conneg menu variants matching RDF types and profiles (RT-P03).
  - `rel="profile"`: Profile conformance declaration (RT-P01).
  - `rel="linkset"`: Dedicated external linkset document (RFC 9264 / RT-P08). Fetches linkset (`application/linkset+json` or `application/linkset`), filters link targets anchored to the target or conceptual URI, and fetches metadata targets.
  - `rel="cite-as"`: Persistent Identifier (PID / DOI / Handle, RT-P04).
  - `rel="item"` / `rel="collection"`: Catalog assistance (RT-P07).
  - `rel="service-desc"`: Subsetting API service descriptions (RT-P05).

### Stage 3: FAIR Signposting & In-Payload HTML Discovery
- **Action:** If target response is HTML (`text/html` or `application/xhtml+xml`), parse `<head>` and `<body>`. If format-specific URI failed, probe the conceptual URI.
- **HTML Links:**
  - `<link rel="self" href="...">`: Confirms conceptual URI.
  - `<link rel="describedby" href="..." type="...">`: Fetches linked metadata.
  - `<link rel="alternate" href="..." type="..." profile="...">`: Alternate formats.
  - `<link rel="linkset" href="..." type="...">`: In-HTML linkset reference.
  - `<link rel="profile" href="...">`: Profile declaration.
- **Embedded Scripts:**
  - `<script type="application/ld+json">`: Extracts embedded JSON-LD directly from payload (zero extra network calls).
  - `<script type="text/turtle">`: Extracts embedded Turtle.

### Stage 4: Domain & Hostwide Discovery (RT-P06 / robots.txt / Sitemaps)
- **Action:** Fallback when the asset provides no direct RDF or link headers.
- **Traversal Sequence:**
  1. Construct `https://<origin>/robots.txt`.
  2. Parse RFC 9309 `Sitemap:` directives.
  3. Fetch XML sitemaps (recursively expanding `<sitemapindex>` up to depth 2).
  4. Search `<url>` blocks whose `<loc>` matches the target URI or the **conceptual URI** (`rel="self"`).
  5. Extract and fetch link injections from the matching `<url>`:
     - `<xhtml:link rel="describedby" href="..." />` or `rel="alternate"` (Google / Adobe pattern).
     - `<rs:ln rel="describedby" href="..." />` (ResourceSync / Signmaps pattern).
     - Host-level linksets (`/.well-known/linkset`).

---

## 4. Conceptual URI Resolution via `rel="self"`

To resolve the discrepancy when users pass format-specific URIs (e.g. `https://example.org/test.ttl`):
1. **`rel="self"` Priority:** Any HTTP `Link` header or HTML `<link>` declaring `rel="self"` takes precedence as the canonical conceptual URI.
2. **Extension Heuristic:** If no `rel="self"` header is provided, known representation extensions (`.ttl`, `.jsonld`, `.rdf`, `.nt`, `.nq`, `.n3`, `.xml`, `.html`) are stripped to derive the conceptual resource URI:
   $$\text{URI} = \text{https://example.org/test.ttl} \longrightarrow \text{Conceptual} = \text{https://example.org/test}$$
3. **Dual-Lookup in Stage 4:** The sitemap parser prioritizes looking up the conceptual URI in `<loc>`, matching sitemaps that list the base asset instead of the `.ttl` endpoint.
4. **Landing Page Fallback in Stage 3:** If `test.ttl` returns a 404 or non-HTML error, the harvester queries the conceptual URI (`https://example.org/test`) with `Accept: text/html` to find the HTML landing page and its signposting links.

---

## 5. Pure W3C PROV-O Provenance Specification

The provenance graph must be 100% valid W3C PROV-O in RDF Turtle syntax with **zero** proprietary vocabulary dependencies.

### Core Class & Property Mappings
- **Target Asset:** `prov:Entity` (with `rdfs:label "Target Resource"`).
- **Agent:** `prov:SoftwareAgent` (with `rdfs:label "wrx v1.0.0"`).
- **Specifications / Standards:** `prov:Plan` (subclass of `prov:Entity`).
  - `<https://www.rfc-editor.org/rfc/rfc9110#section-12>` (Content Negotiation)
  - `<https://www.rfc-editor.org/rfc/rfc8288>` (Web Linking)
  - `<https://www.rfc-editor.org/rfc/rfc9264>` (Linkset)
  - `<https://www.rfc-editor.org/rfc/rfc9309>` (Robots Exclusion Protocol)
  - `<http://www.openarchives.org/rs/1.1/resourcesync>` (ResourceSync Framework)
- **Activities:** `prov:Activity` (with `prov:startedAtTime`, `prov:endedAtTime`, `prov:used`, `prov:wasAssociatedWith`).
- **Associations:** `prov:Association` (linking activity to agent via `prov:hadPlan`).
- **Intermediary Documents:** `prov:Entity` (`robots.txt`, sitemaps, linksets, HTML documents).
- **Derivations:** `prov:wasDerivedFrom` and `prov:qualifiedDerivation` (with `prov:entity`, `prov:hadActivity`, `prov:hadPlan`).
- **Sequential Trace:** `prov:wasInformedBy` connecting sequential activities.
- **Harvested Output Entity:** `prov:Entity` containing `prov:value` (the serialized RDF text), `prov:generatedAtTime`, and `prov:wasGeneratedBy`.

---

## 6. Execution Modes & CLI Interface

### Library Interface
```typescript
export interface DiscoveryOptions {
  /** If true, executes all stages without short-circuiting. Default: false */
  all?: boolean;
  /** Request timeout in milliseconds per stage. Default: 8000 */
  timeout?: number;
  /** Custom user agent */
  userAgent?: string;
}

/** First-hit discovery: short-circuits at first hit */
export async function extractRDF(uri: string, options?: DiscoveryOptions): Promise<ExtractedRDF | null>;

/** Exhaustive discovery: explores all paths and returns complete overview */
export async function extractAllRDF(uri: string, options?: DiscoveryOptions): Promise<DiscoveryOverview>;
```

### CLI Interface
```bash
# First-hit mode (default)
bun run wrx.js https://example.org/dataset/1

# First-hit mode with PROV-O output
bun run wrx.js https://example.org/dataset/1 -p

# Exhaustive mode across all 4 discovery stages
bun run wrx.js https://example.org/dataset/1 --all -p

# Output to file
bun run wrx.js https://example.org/dataset/1 -o result.ttl
```

---

## 7. Error Handling, Timeouts & Safety Guards

1. **Per-Request Timeout:** 8-second timeout using `AbortController`.
2. **Graceful Stage Degradation:** Network or HTTP 4xx/5xx failures in any stage are logged at `debug` level and fall through to subsequent stages without throwing.
3. **Loop Prevention:** An in-memory `Set<string>` tracks visited URLs to prevent circular redirect or linkset loops.
4. **Sitemap Index Recursion Limits:** Maximum recursion depth of 2; maximum of 50 sitemaps per host.
5. **Linkset Nesting Limit:** Depth capped at 1 to prevent linkset chain attacks.

---

## 8. Verification & Test Plan

1. **Unit Tests (`bun test src/parsers/`):**
   - `rfc8288-link.test.ts`: Header parsing, `rel="self"`, multi-links, parameters, quotes.
   - `rfc9264-linkset.test.ts`: JSON format and text format linksets, anchor filtering.
   - `html-link.test.ts`: HTML `<link>` tags and `<script type="application/ld+json">`.
   - `robots-txt.test.ts`: `Sitemap:` directive extraction and normalization.
   - `sitemap-xml.test.ts`: `<sitemapindex>`, `<urlset>`, `<xhtml:link>`, `<rs:ln>`.
2. **Harvester & Pipeline Tests (`bun test src/harvesters/`, `bun test src/pipeline.test.ts`):**
   - Stage 1, 2, 3, 4 mocked flows.
   - Conceptual URI resolution (`test.ttl` $\rightarrow$ `test`) in sitemaps and HTML signposting.
   - First-hit vs. Exhaustive execution mode tests.
3. **Provenance Tests (`bun test src/provenance/`):**
   - Turtle parser validation.
   - Strict assertion: zero `@prefix wrx:` or `vocab.ttl` triples.
   - Accurate multi-hop `prov:wasDerivedFrom`, `prov:wasInformedBy`, `prov:hadPlan`, and `prov:value` assertions.
