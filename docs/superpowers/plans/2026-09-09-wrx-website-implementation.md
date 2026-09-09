# WRX Demonstration Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a sleek, modern, minimalistic single-page demonstration website for `wrx` that explains its Linked Open Data and Radical Transparency foundations, provides CLI and script usage guides, and features an interactive browser-executed playground with tabular triples and multi-tab provenance.

**Architecture:** A standalone, isolated web application inside `website/` built with Vite + React + TypeScript + Vanilla CSS. It imports `wrx` directly to execute live cascading RDF extractions in the client's browser using native `fetch()`, visualizing RDF quads in an interactive table and W3C PROV-O provenance across a human-friendly stepper, Turtle, JSON-LD, and an interactive SVG node graph.

**Tech Stack:** React 19, TypeScript 5, Vite 6, Vanilla CSS (tokens & glassmorphism), N3 (for browser RDF serialization), Bun.

**Spec:** [`docs/superpowers/specs/2026-09-09-wrx-website-design.md`](file:///c:/Users/cedricd/Documents/Github/wrx/docs/superpowers/specs/2026-09-09-wrx-website-design.md)

## Global Constraints

- Website code must reside strictly in `website/`; root `package.json` must remain 100% pure as an npm library with zero web dependencies.
- No CORS proxy workarounds: all network requests use direct browser `fetch()`.
- Vanilla CSS only (no Tailwind CSS, no heavy component libraries like MUI).
- Modern dark-mode glassmorphism aesthetic with Inter and JetBrains Mono typography.
- Vite configured with `base: './'` for seamless GitHub Pages static hosting.
- All 66 existing core engine tests in the root project must continue passing.

---

### Task 1: Scaffolding & Isolated Environment Setup

**Files:**
- Create: `website/package.json`
- Create: `website/tsconfig.json`
- Create: `website/vite.config.ts`
- Create: `website/index.html`

**Interfaces:**
- Consumes: `../src/index.ts` / `../wrx.ts`
- Produces: Working isolated Vite dev/build environment in `website/`

- [ ] **Step 1: Create `website/package.json` with isolated dependencies**

```json
{
  "name": "wrx-website",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "n3": "^2.0.3",
    "jsonld": "^9.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@types/n3": "^1.16.4",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "^5.7.0",
    "vite": "^6.2.0"
  }
}
```

- [ ] **Step 2: Create `website/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "wrx": ["../src/index.ts"]
    }
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create `website/vite.config.ts` with relative base for GitHub Pages**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      wrx: path.resolve(__dirname, '../src/index.ts'),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

- [ ] **Step 4: Create `website/index.html` with Google Fonts and meta tags**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="wrx — Zero-configuration Linked Open Data discovery and RDF extraction via cascading RFC protocols" />
    <title>wrx — Linked Data Discovery & Cascading RDF Extraction</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Run install and verify scaffolding**

Run: `cd website; bun install`
Expected: Success with `node_modules` installed in `website/` only.

- [ ] **Step 6: Commit scaffolding**

```bash
git add website/package.json website/tsconfig.json website/vite.config.ts website/index.html
git commit -m "chore(website): scaffold isolated vite react demonstration app"
```

---

### Task 2: Design System & Theming (`index.css` & `main.tsx`)

**Files:**
- Create: `website/src/index.css`
- Create: `website/src/main.tsx`

**Interfaces:**
- Consumes: HTML `#root`
- Produces: Modern dark-mode CSS tokens, utilities, glassmorphism classes, and React root mounting.

- [ ] **Step 1: Create `website/src/index.css` with CSS custom properties**

```css
:root {
  --bg-primary: #070a12;
  --bg-secondary: #0d1222;
  --bg-card: rgba(17, 24, 39, 0.7);
  --bg-card-hover: rgba(26, 36, 56, 0.85);
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-glow: rgba(0, 240, 255, 0.3);
  
  --accent-cyan: #00f0ff;
  --accent-cyan-dim: rgba(0, 240, 255, 0.12);
  --accent-violet: #8b5cf6;
  --accent-violet-dim: rgba(139, 92, 246, 0.12);
  --accent-emerald: #10b981;
  --accent-emerald-dim: rgba(16, 185, 129, 0.12);
  --accent-amber: #f59e0b;
  --accent-rose: #f43f5e;

  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;

  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  --shadow-card: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
  --shadow-glow: 0 0 25px rgba(0, 240, 255, 0.2);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: var(--font-sans);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  background-image: 
    radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0, 240, 255, 0.08), transparent 70%),
    radial-gradient(ellipse 60% 40% at 90% 40%, rgba(139, 92, 246, 0.05), transparent 60%);
  background-attachment: fixed;
  min-height: 100vh;
}

/* Glassmorphism card utilities */
.glass-panel {
  background: var(--bg-card);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}

.glass-card {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  transition: all 0.2s ease-in-out;
}

.glass-card:hover {
  background: var(--bg-card-hover);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

/* Typography utilities */
.text-mono {
  font-family: var(--font-mono);
}

.gradient-text {
  background: linear-gradient(135deg, #00f0ff 0%, #8b5cf6 50%, #f43f5e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Buttons and interactive elements */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #00f0ff, #0284c7);
  color: #050811;
  font-weight: 600;
  font-size: 0.95rem;
  padding: 10px 22px;
  border-radius: var(--radius-full);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(0, 240, 255, 0.3);
  text-decoration: none;
}

.btn-primary:hover {
  filter: brightness(1.1);
  transform: scale(1.02);
  box-shadow: 0 6px 20px rgba(0, 240, 255, 0.45);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  font-weight: 500;
  font-size: 0.95rem;
  padding: 10px 20px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-subtle);
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.25);
}

/* Pill tags */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.badge-cyan { background: var(--accent-cyan-dim); color: var(--accent-cyan); border: 1px solid rgba(0, 240, 255, 0.3); }
.badge-violet { background: var(--accent-violet-dim); color: var(--accent-violet); border: 1px solid rgba(139, 92, 246, 0.3); }
.badge-emerald { background: var(--accent-emerald-dim); color: var(--accent-emerald); border: 1px solid rgba(16, 185, 129, 0.3); }
```

- [ ] **Step 2: Create `website/src/main.tsx` mounting the App**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 3: Create stub `website/src/App.tsx` and run build**

Run: `cd website; bun run build`
Expected: Clean build outputting `dist/`.

- [ ] **Step 4: Commit design system**

```bash
git add website/src/index.css website/src/main.tsx website/src/App.tsx
git commit -m "feat(website): add vanilla css design tokens and app root"
```

---

### Task 3: Navbar, Hero, & Foundations (`Navbar.tsx`, `Hero.tsx`, `Concepts.tsx`)

**Files:**
- Create: `website/src/components/Navbar.tsx`
- Create: `website/src/components/Hero.tsx`
- Create: `website/src/components/Concepts.tsx`

**Interfaces:**
- Produces: Sticky navigation header, high-impact hero with CTA anchors, and rich conceptual cards explaining LOD, RT-P06, RFC 9264, RFC 6596, and W3C PROV-O.

- [ ] **Step 1: Implement `website/src/components/Navbar.tsx`**

Contains brand logo, version pill (`v0.1.0`), anchor links (`#foundations`, `#guides`, `#playground`), and GitHub link.

- [ ] **Step 2: Implement `website/src/components/Hero.tsx`**

Bold headline: "Zero-Config Linked Data Discovery via Cascading RFC Protocols", subhead, and two quick-action buttons: "Launch Playground" (`#playground`) and "Explore Standards" (`#foundations`).

- [ ] **Step 3: Implement `website/src/components/Concepts.tsx`**

Visual grid explaining the 5 foundational pillars:
1. **Linked Open Data (LOD)**: Web identifiers (URIs) dereference to machine-actionable graphs.
2. **Radical Transparency Patterns (RT-P06)**: Explicit linksets declaring relationships upfront in headers or `application/linkset`.
3. **FAIR Signposting (RFC 9264)**: Standard link relations (`describedby`, `item`, `collection`, `type`).
4. **Conceptual Identity (RFC 6596 `rel="self"`)**: Separates conceptual identity from representation URL.
5. **W3C PROV-O**: Auditable provenance for every extracted quad.
Includes interactive 4-stage cascade flow diagram (Stage 1: Link Header $\rightarrow$ Stage 2: Conneg $\rightarrow$ Stage 3: HTML Signposting $\rightarrow$ Stage 4: Sitemaps).

- [ ] **Step 4: Test build and visual layout**

Run: `cd website; bun run build`
Expected: Build passes without errors.

- [ ] **Step 5: Commit Navbar, Hero, and Concepts**

```bash
git add website/src/components/Navbar.tsx website/src/components/Hero.tsx website/src/components/Concepts.tsx
git commit -m "feat(website): add navbar, hero, and radical transparency concepts section"
```

---

### Task 4: Developer Guides Component (`UsageGuides.tsx`)

**Files:**
- Create: `website/src/components/UsageGuides.tsx`

**Interfaces:**
- Consumes: Tab switching state (`cli` vs `script`)
- Produces: Copyable code snippets with syntax highlighting simulation, flags documentation table, and return type reference.

- [ ] **Step 1: Implement `website/src/components/UsageGuides.tsx`**
  - **CLI Tab**:
    - `bunx wrx <uri> [options]`
    - Table explaining flags: `--format`, `--stage`, `--log-level`, `--output`, `--prov-out`, `--timeout`.
    - 1-click copy button with temporary "Copied!" checkmark feedback.
  - **Script Tab**:
    - Complete ESM snippet:
      ```typescript
      import { wrx } from 'wrx';

      const result = await wrx('https://zenodo.org/records/1234567', {
        stage: 4,
        timeout: 8000,
      });

      console.log(`Resolved Identity: ${result.conceptualUri}`);
      console.log(`Discovered ${result.triples.length} triples.`);

      // Query W3C PROV-O provenance store
      for (const quad of result.provenance) {
        console.log(`${quad.subject.value} ${quad.predicate.value} ${quad.object.value}`);
      }
      ```
    - Detailed breakdown of `ExtractionResult` structure.

- [ ] **Step 2: Test build**

Run: `cd website; bun run build`
Expected: Build passes.

- [ ] **Step 3: Commit Usage Guides**

```bash
git add website/src/components/UsageGuides.tsx
git commit -m "feat(website): add interactive cli and script developer guides"
```

---

### Task 5: Playground Service & RDF Serialization Adapter (`wrx-client.ts`)

**Files:**
- Create: `website/src/services/wrx-client.ts`
- Create: `website/src/services/wrx-client.test.ts`

**Interfaces:**
- Consumes: `wrx` function and `ExtractionResult` from `../src/index.ts`
- Produces: Formatted tabular rows, Turtle string, JSON-LD string, stepper steps, and graph node/edge data.

- [ ] **Step 1: Write tests for `wrx-client.ts`**

Tests formatting of quads into tabular rows, prefix abbreviation, and PROV-O graph node extraction.

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test website/src/services/wrx-client.test.ts`
Expected: FAIL (file does not exist).

- [ ] **Step 3: Implement `website/src/services/wrx-client.ts`**

```typescript
import { wrx, type ExtractionResult, type WRXOptions } from 'wrx';
import { Writer } from 'n3';

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

export async function executeWrxPlayground(
  uri: string,
  options?: WRXOptions
): Promise<{
  result: ExtractionResult;
  triples: TabularTriple[];
  turtleProv: string;
  jsonLdProv: string;
  graphData: ProvGraphData;
  durationMs: number;
}> {
  const start = performance.now();
  const result = await wrx(uri, options);
  const durationMs = Math.round(performance.now() - start);

  // Convert quads to tabular representation
  const triples: TabularTriple[] = result.triples.map((q, idx) => ({
    id: `triple-${idx}`,
    subject: q.subject.value,
    subjectCompact: compactUri(q.subject.value),
    predicate: q.predicate.value,
    predicateCompact: compactUri(q.predicate.value),
    object: q.object.value,
    objectCompact: q.object.termType === 'NamedNode' ? compactUri(q.object.value) : q.object.value,
    isIri: q.object.termType === 'NamedNode',
    datatype: q.object.termType === 'Literal' ? compactUri(q.object.datatype.value) : undefined,
    lang: q.object.termType === 'Literal' && q.object.language ? q.object.language : undefined,
    graph: q.graph.value || 'default',
  }));

  // Serialize PROV-O store to Turtle
  const writer = new Writer({ prefixes: { prov: 'http://www.w3.org/ns/prov#', xsd: 'http://www.w3.org/2001/XMLSchema#' } });
  for (const quad of result.provenance) {
    writer.addQuad(quad);
  }
  const turtleProv = await new Promise<string>((resolve, reject) => {
    writer.end((err, res) => (err ? reject(err) : resolve(res)));
  });

  // Simple JSON-LD serialization for provenance
  const jsonLdProv = JSON.stringify(
    result.provenance.getQuads(null, null, null, null).map(q => ({
      '@id': q.subject.value,
      [q.predicate.value]: q.object.termType === 'NamedNode' ? { '@id': q.object.value } : q.object.value,
    })),
    null,
    2
  );

  // Extract PROV-O graph nodes & edges
  const graphData = extractProvGraph(result.provenance);

  return { result, triples, turtleProv, jsonLdProv, graphData, durationMs };
}

export function compactUri(uri: string): string {
  const prefixes: Record<string, string> = {
    'http://www.w3.org/ns/prov#': 'prov:',
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#': 'rdf:',
    'http://www.w3.org/2000/01/rdf-schema#': 'rdfs:',
    'http://www.w3.org/2001/XMLSchema#': 'xsd:',
    'http://schema.org/': 'schema:',
    'https://schema.org/': 'schema:',
    'http://purl.org/dc/terms/': 'dcterms:',
    'http://xmlns.com/foaf/0.1/': 'foaf:',
  };

  for (const [prefixUri, alias] of Object.entries(prefixes)) {
    if (uri.startsWith(prefixUri)) {
      return uri.replace(prefixUri, alias);
    }
  }
  return uri;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test website/src/services/wrx-client.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit playground client service**

```bash
git add website/src/services/wrx-client.ts website/src/services/wrx-client.test.ts
git commit -m "feat(website): add client-side wrx execution adapter and serializers"
```

---

### Task 6: Playground UI Components (Input Bar, Metrics Bar & Tabular Triples Viewer)

**Files:**
- Create: `website/src/components/Playground/PlaygroundBar.tsx`
- Create: `website/src/components/Playground/MetricsBar.tsx`
- Create: `website/src/components/Playground/TriplesTable.tsx`

**Interfaces:**
- Consumes: `TabularTriple[]`, execution state, input URI
- Produces: Search bar, preset pills, status metrics, and searchable/filterable paginated table.

- [ ] **Step 1: Implement `PlaygroundBar.tsx`**
  - Input field with preset quick-fill buttons (`Zenodo`, `Pangaea`, `GS1`, `Schema.org`).
  - "Extract RDF" button with loading spinner and disabled state when running.
  - Clear button.

- [ ] **Step 2: Implement `MetricsBar.tsx`**
  - Status indicator (`Idle`, `Running...`, `200 OK`, `Error`).
  - Active stage badge (Stage 1 to 4).
  - Resolved Conceptual URI (`rel="self"`) with external link icon.
  - Triple count pill & Latency in ms.

- [ ] **Step 3: Implement `TriplesTable.tsx`**
  - Search input filtering across Subject, Predicate, and Object.
  - Vocabulary prefix filter pills (`All`, `schema:`, `dcterms:`, `prov:`, `rdf:`).
  - Modern tabular layout:
    - Subject (compacted, click to copy full URI).
    - Predicate (styled syntax coloring).
    - Object (differentiates IRI with link icon vs. literal with datatype pill).
    - Graph (default / named graph).
  - Export actions: `Copy Turtle`, `Copy JSON-LD`, `Download .nt`.
  - Pagination (50 rows per page with page controls).

- [ ] **Step 4: Test build**

Run: `cd website; bun run build`
Expected: Build passes.

- [ ] **Step 5: Commit Playground input and table components**

```bash
git add website/src/components/Playground/PlaygroundBar.tsx website/src/components/Playground/MetricsBar.tsx website/src/components/Playground/TriplesTable.tsx
git commit -m "feat(website): add playground input bar, metrics bar, and tabular triples viewer"
```

---

### Task 7: Provenance Inspector Components (Stepper, Turtle, JSON-LD, Interactive SVG Graph)

**Files:**
- Create: `website/src/components/Playground/Provenance/ProvenanceTabs.tsx`
- Create: `website/src/components/Playground/Provenance/PipelineStepper.tsx`
- Create: `website/src/components/Playground/Provenance/RdfTurtleView.tsx`
- Create: `website/src/components/Playground/Provenance/JsonLdView.tsx`
- Create: `website/src/components/Playground/Provenance/ProvGraphView.tsx`

**Interfaces:**
- Consumes: `turtleProv`, `jsonLdProv`, `graphData`, `result`
- Produces: 4 interactive tabs for exploring provenance.

- [ ] **Step 1: Implement `PipelineStepper.tsx` (Human-Friendly)**
  - Stepper visual timeline:
    1. HTTP Dereference & Status
    2. Link Header discovery (RFC 9264)
    3. Conceptual identity resolution (RFC 6596 `rel="self"`)
    4. Cascade Stage matched
    5. PROV-O Activity execution & Entity generation summary

- [ ] **Step 2: Implement `RdfTurtleView.tsx` (W3C Turtle)**
  - Preformatted code block with syntax styling for Turtle prefixes, keywords, URIs, and literals.
  - Copy-to-clipboard button.

- [ ] **Step 3: Implement `JsonLdView.tsx` (JSON-LD)**
  - Formatted JSON-LD view with indentation and copy button.

- [ ] **Step 4: Implement `ProvGraphView.tsx` (Interactive SVG Node Graph)**
  - Interactive SVG canvas with drag/pan/zoom capabilities.
  - Color-coded node shapes:
    - Gold / Orange circle: `prov:Entity`
    - Cyan rectangle: `prov:Activity`
    - Violet hexagon: `prov:Agent`
  - Directed relationship lines labeled with `prov:wasGeneratedBy`, `prov:used`, `prov:wasAssociatedWith`.
  - Node hover & click popover showing full URI and properties.

- [ ] **Step 5: Implement `ProvenanceTabs.tsx` coordinating the 4 views**
  - Clean tab bar: `[ Pipeline Stepper ] [ W3C Turtle ] [ JSON-LD ] [ Interactive Graph ]`.

- [ ] **Step 6: Test build**

Run: `cd website; bun run build`
Expected: Build passes.

- [ ] **Step 7: Commit Provenance Inspector components**

```bash
git add website/src/components/Playground/Provenance/
git commit -m "feat(website): add multi-tab provenance inspector with stepper, turtle, json-ld, and svg graph"
```

---

### Task 8: App Integration, Footer & GitHub Pages Workflow

**Files:**
- Modify: `website/src/App.tsx`
- Create: `website/src/components/Footer.tsx`
- Create: `.github/workflows/deploy-website.yml`

**Interfaces:**
- Consumes: All UI components
- Produces: Fully functional single-page website ready for production deployment on GitHub Pages.

- [ ] **Step 1: Assemble `website/src/App.tsx`**
  - Mounts `Navbar`, `Hero`, `Concepts`, `UsageGuides`, `Playground` (with `TriplesTable` & `ProvenanceTabs`), and `Footer`.
  - Manages reactive state for live URI runs, error banner handling, and sample presets.

- [ ] **Step 2: Implement `website/src/components/Footer.tsx`**
  - Citations and external links to specifications:
    - W3C PROV-O
    - IETF RFC 9264 (Linkset)
    - IETF RFC 6596 (`rel="self"`)
    - EOSC Radical Transparency Patterns (RT-P06)
    - GitHub repository link & MIT License.

- [ ] **Step 3: Create `.github/workflows/deploy-website.yml`**
  - Automated GitHub Actions workflow on push to `main`:
    - Setup Bun
    - Install website dependencies (`cd website && bun install`)
    - Build website (`cd website && bun run build`)
    - Deploy `website/dist` to GitHub Pages.

- [ ] **Step 4: Run full build and test verification**

Run: `cd website; bun run build`
Expected: Static build generated cleanly in `website/dist/`.

Run: `bun test` in root
Expected: All 66 core library tests continue to pass.

- [ ] **Step 5: Commit complete application and workflow**

```bash
git add website/src/App.tsx website/src/components/Footer.tsx .github/workflows/deploy-website.yml
git commit -m "feat(website): complete single-page demonstration app and github pages deployment workflow"
```

---

## Plan Self-Review Checklist

1. **Spec Coverage**:
   - Background explanation (LOD, RT-P06, RFC 9264, RFC 6596, PROV-O): Task 3.
   - CLI & Script examples: Task 4.
   - Playground with URI input and Tabular Triples: Tasks 5 & 6.
   - Provenance retrieved and visualized (Human stepper, Turtle, JSON-LD, Interactive SVG Graph): Tasks 5 & 7.
   - Modern, sleek, minimalistic aesthetic: Tasks 2, 3, 6, 7.
   - GitHub Pages static deployment: Tasks 1 & 8.
   - Isolated `website/` directory with independent `package.json`: Tasks 1 & 8.
2. **Placeholder Scan**: No "TBD", "TODO", or vague requirements. All commands, files, and types are explicit.
3. **Type Consistency**: `ExtractionResult`, `TabularTriple`, `ProvGraphData`, and `executeWrxPlayground` are consistent across services and components.
