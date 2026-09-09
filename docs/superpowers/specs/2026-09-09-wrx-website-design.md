# WRX Demonstration Website Design Specification

**Date**: 2026-09-09  
**Author**: Cedric & Antigravity  
**Status**: Approved  
**Target Subsystem**: `website/` (Isolated demo application)

---

## 1. Executive Summary & Goals

`wrx` is a zero-configuration TypeScript/Bun module and CLI tool for dereferencing web URIs and discovering RDF metadata via cascading strategies.

The goal of this project is to create a modern, sleek, minimalistic web application demonstrating `wrx`. The site will:
1. Explain the conceptual foundations of `wrx`: **Linked Open Data (LOD)**, **Radical Transparency Patterns (RT-P06)**, **FAIR Signposting (RFC 9264)**, **Conceptual Identity (RFC 6596 `rel="self"`)**, and **W3C PROV-O**.
2. Provide copy-pasteable, interactive examples for **CLI** and **Programmatic Script** usage.
3. Feature an interactive **Live Playground** where visitors provide any web URI, run `wrx` directly in the browser, view extracted RDF triples in a clean tabular format, and inspect provenance across multiple human-friendly and linked-data tabs.
4. Run cleanly on **GitHub Pages** as a static client-side application.
5. Reside in an isolated `website/` directory with its own independent `package.json`, preserving the root `wrx` package as a clean, unpolluted npm library.

---

## 2. Information Architecture & Page Sections

The application is structured as a unified single-page developer experience with a sticky glassmorphism header, smooth anchor navigation, and distinct modules:

```
+-----------------------------------------------------------------------------------------+
| [wrx] v0.1.0        Foundations       CLI & Script       Playground       [GitHub ↗]    |
+-----------------------------------------------------------------------------------------+
| HERO SECTION                                                                            |
|   - Brand headline: "Zero-Config Linked Data Discovery via Cascading RFC Protocols"     |
|   - Quick action buttons: "Launch Playground" & "Explore Docs"                          |
+-----------------------------------------------------------------------------------------+
| 1. FOUNDATIONS & RADICAL TRANSPARENCY                                                   |
|   - Linked Open Data (LOD) & FAIR Principles                                            |
|   - Radical Transparency Patterns (RT-P06 Linksets)                                     |
|   - FAIR Signposting (RFC 9264) & RFC 6596 rel="self" conceptual URIs                   |
|   - 4-Stage Discovery Cascade Flowchart                                                 |
+-----------------------------------------------------------------------------------------+
| 2. DEVELOPER GUIDES (CLI & SCRIPT)                                                      |
|   - CLI Tab: bunx wrx <uri> [options] with flags table                                  |
|   - Script Tab: import { wrx } from 'wrx' with TypeScript types                         |
|   - 1-click copy buttons and syntax highlighted blocks                                  |
+-----------------------------------------------------------------------------------------+
| 3. LIVE PLAYGROUND (Direct Browser Execution)                                           |
|   - Search bar + 1-click real-world presets (Zenodo, Pangaea, GS1, Schema.org)          |
|   - Execution status & metrics bar (Stage matched, Latency, Triples, rel="self")        |
|   - Tabular Triples Viewer (Search, prefix filter, sorting, copy)                       |
|   - Provenance Inspector (4 Tabbed Views):                                              |
|     * Tab 1: Human-Friendly Pipeline Stepper                                            |
|     * Tab 2: W3C Turtle (PROV-O)                                                        |
|     * Tab 3: JSON-LD (PROV-O)                                                           |
|     * Tab 4: Interactive SVG Node Graph (Entities, Activities, Agents)                 |
+-----------------------------------------------------------------------------------------+
| 4. FOOTER: Spec citations (W3C PROV-O, IETF RFCs 9264/6596/9205, EOSC RT-P06), GitHub  |
+-----------------------------------------------------------------------------------------+
```

---

## 3. Detailed Component Specifications

### 3.1 Foundations & Radical Transparency (`Concepts.tsx`)
This section provides clear, accessible explanations of the standards driving `wrx`:
* **Linked Open Data (LOD)**: Web identifiers (URIs) dereference to structured statements connecting global knowledge graphs.
* **Radical Transparency Patterns (RT-P06)**: Linkset patterns that explicitly declare relationship topology upfront in HTTP headers or dedicated linkset documents (`application/linkset` or `application/linkset+json`), eliminating guessing games.
* **FAIR Signposting (RFC 9264)**: Standardized link relations (`describedby`, `item`, `collection`, `type`, `author`, `license`) for machine-navigable scholarly and research artifacts.
* **Conceptual Identity (RFC 6596 `rel="self"`)**: When dereferencing a landing page or representation, `wrx` resolves the true conceptual URI rather than conflating it with the representation URL.
* **4-Stage Discovery Cascade**:
  * **Stage 1**: RFC 9264 Link Header Signposting & RFC 9205 Linksets.
  * **Stage 2**: HTTP Content Negotiation (`Accept: text/turtle, application/ld+json...`).
  * **Stage 3**: HTML Signposting (`<link rel="...">`) & Embedded RDF (`<script type="application/ld+json">`).
  * **Stage 4**: Domain Sitemaps & robots.txt metadata discovery.
* **W3C PROV-O**: Explicit, verifiable provenance generated for every extraction run.

### 3.2 Developer Guides (`UsageGuides.tsx`)
Tabbed interface showcasing real-world usage:
* **CLI Tab**:
  * Quick start: `bunx wrx https://zenodo.org/records/1234567`
  * Standard flags: `--format [turtle|jsonld|ntriples]`, `--stage [1-4]`, `--log-level [debug|info|warn]`, `--output [file]`, `--prov-out [file]`.
  * Common recipes (e.g. pipe to `grep`, inspect provenance).
* **Script / TypeScript Tab**:
  * Programmatic usage example importing `wrx` from the module:
    ```typescript
    import { wrx } from 'wrx';

    const result = await wrx('https://zenodo.org/records/1234567', {
      stage: 4,
      timeout: 8000,
    });

    console.log(`Conceptual URI: ${result.conceptualUri}`);
    console.log(`Discovered ${result.triples.length} triples.`);

    // Access W3C PROV-O store
    const provStore = result.provenance;
    ```
  * Syntax highlighted with copy-to-clipboard feedback.

### 3.3 Live Playground (`Playground/`)

#### A. Input & Presets Bar (`PlaygroundBar.tsx`)
* Input field with placeholder: `"Enter any web URI (e.g. https://zenodo.org/records/...)"`.
* "Extract RDF" button with loading spinner state and keyboard shortcut (`Enter`).
* Preset quick-fill pills:
  * **Zenodo Record** (`https://zenodo.org/records/1234567`)
  * **Pangaea Dataset** (`https://doi.pangaea.de/10.1594/PANGAEA.942714`)
  * **GS1 Digital Link** (`https://id.gs1.org/01/09521234543213`)
  * **Schema.org Article** (`https://schema.org`)

#### B. Execution Metrics Bar (`MetricsBar.tsx`)
* Real-time metrics badges:
  * **Status**: `200 OK` (Green badge) / `Error` (Red badge).
  * **Stage Matched**: E.g. `Stage 2: Signposting` or `Stage 3: Embedded JSON-LD`.
  * **Conceptual URI**: E.g. `https://zenodo.org/records/1234567` (`rel="self"`).
  * **Triple Count**: Number of quads extracted.
  * **Duration**: Total execution time in milliseconds.

#### C. Tabular Triples Viewer (`TriplesTable.tsx`)
* **Search / Filter**: Filters quads by text in Subject, Predicate, or Object.
* **Prefix Filters**: One-click filter by common vocabulary prefixes (`schema:`, `dcterms:`, `prov:`, `foaf:`).
* **Table Columns**:
  * **Subject**: Compact URI with full URI in tooltip, clickable to copy.
  * **Predicate**: Compact URI / CURIE with distinctive syntax color.
  * **Object**: Renders URI links, string literals with quotes, and datatype/lang tags (`^^xsd:dateTime`, `@en`).
  * **Graph**: Default graph or named graph identifier.
* **Export Actions**: Buttons for `Copy Turtle`, `Copy JSON-LD`, `Download .nt`.

#### D. Provenance Inspector (`ProvenanceTabs.tsx`)
Provides 4 distinct tabs to explore the extraction provenance:
1. **Pipeline Stepper (Human-Friendly)** (`PipelineStepper.tsx`):
   * Step 1: **Initial Dereference** (Target URI, HTTP request, Status code).
   * Step 2: **Link Header Discovery** (Parsed RFC 9264 relations).
   * Step 3: **Identity Resolution** (`rel="self"` inspection, conceptual URI established).
   * Step 4: **Cascade Stage Activated** (Stage name, matched content type, parser invoked).
   * Step 5: **Provenance Summary** (W3C PROV Activity ID, Agent, timestamp, quad count).
2. **W3C Turtle (PROV-O)** (`RdfTurtleView.tsx`):
   * Full PROV-O RDF serialized in Turtle using standard W3C PROV-O terms (`prov:Activity`, `prov:wasGeneratedBy`, `prov:wasAssociatedWith`, `prov:used`, `prov:startedAtTime`, `prov:endedAtTime`).
   * Syntax highlighted with 1-click copy.
3. **JSON-LD (PROV-O)** (`JsonLdView.tsx`):
   * Formatted JSON-LD representation of the PROV-O graph.
4. **Interactive Node Graph** (`ProvGraphView.tsx`):
   * Interactive SVG node-link diagram mapping W3C PROV-O entities:
     * **Entities** (Golden yellow rounded nodes): Input URI, Discovered Document, Extracted Dataset.
     * **Activities** (Cyan rectangular nodes): Cascading Extraction Run.
     * **Agents** (Violet hexagonal nodes): `wrx` Software Agent.
     * **Edges**: Directed arrows labeled with PROV relationships (`wasGeneratedBy`, `used`, `wasAssociatedWith`).
     * Pan, zoom, and node click to inspect properties.

---

## 4. Technical & Execution Architecture

### 4.1 Client-Side Execution in Browser
* **Zero Backend**: The demo site runs 100% in the client's browser.
* **Direct Fetch**: Network requests are performed using native browser `fetch()`. Per user specification, no CORS proxy services or proxy fallbacks are used; servers dereferenced are expected to allow cross-origin access.
* **Error Handling**: If a target server fails to respond, times out, or blocks CORS, the UI displays a clean diagnostic banner explaining the cross-origin constraint with suggestions to test with the verified presets.
* **RDF Serialization**: `N3.Writer` and standard JSON-LD serialization run directly in-browser.

### 4.2 Repository & Directory Isolation
To ensure the root `package.json` remains 100% pure as the npm package, the website resides in a self-contained `website/` directory:

```
wrx/
├── package.json              # Root package.json (Pure npm library, zero web dependencies)
├── src/                      # Core wrx engine
│   ├── core/
│   ├── harvesters/
│   ├── parsers/
│   ├── provenance/
│   └── pipeline.ts
├── wrx.ts                    # Main library entry point
└── website/                  # Completely isolated demo web application
    ├── package.json          # Independent dependencies: react, react-dom, vite, etc.
    ├── tsconfig.json         # Website TypeScript configuration
    ├── vite.config.ts        # Vite configuration (base: './' for GitHub Pages)
    ├── index.html            # Entry HTML
    └── src/
        ├── index.css         # Modern dark-mode Vanilla CSS design system
        ├── main.tsx          # React application root
        ├── App.tsx           # Page coordinator
        └── components/       # UI components (Concepts, Guides, Playground, etc.)
```

### 4.3 Styling & Aesthetics
* **Vanilla CSS**: Clean, modular CSS custom properties for theming, avoiding bloated CSS frameworks.
* **Modern Palette**: Dark obsidian background (`#080c14`, `#0d1527`), subtle borders (`rgba(255, 255, 255, 0.08)`), glassmorphic card overlays (`backdrop-filter: blur(16px)`), with electric cyan (`#00f0ff`), violet (`#8b5cf6`), and emerald (`#10b981`) accents.
* **Typography**: Clean sans-serif (`Inter`) paired with monospace (`JetBrains Mono`) for code and RDF triples.

### 4.4 GitHub Pages Deployment
* `vite.config.ts` configured with `base: './'` for universal path resolution on `https://<username>.github.io/wrx/`.
* `npm run build` in `website/` outputs production assets to `website/dist/`.
* A GitHub Actions workflow (`.github/workflows/deploy-website.yml`) automatically builds `website/` and deploys to GitHub Pages upon pushing to `main`.

---

## 5. Verification & Acceptance Criteria

1. **Isolation**: Root `package.json` has zero frontend dependencies added.
2. **Build & Dev**: `cd website && bun install && bun run dev` starts the local server without errors; `bun run build` produces clean static HTML/JS/CSS.
3. **Core Engine Tests**: All 66 unit and pipeline tests in the core `wrx` package continue to pass (`bun test`).
4. **Live Playground**:
   - Accepts any URI and executes `wrx` in the browser.
   - Accurately parses and displays RDF triples in a searchable, filterable table.
   - Formats provenance into all 4 tabs: Pipeline Stepper, Turtle PROV-O, JSON-LD PROV-O, and Interactive SVG Graph.
5. **Aesthetics & Performance**: High visual quality, sleek dark-mode glassmorphism, responsive across desktop and mobile screens.
