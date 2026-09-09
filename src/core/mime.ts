import { RDF_MIME_SET } from './constants'
import type { RDFFormat } from './types'

export function looksLikeJsonLd(text: string): boolean {
  try {
    const obj = JSON.parse(text) as unknown;
    const records = Array.isArray(obj) ? obj : [obj];
    return records.some(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        ('@context' in (item as Record<string, unknown>) ||
          '@type' in (item as Record<string, unknown>) ||
          '@graph' in (item as Record<string, unknown>))
    );
  } catch {
    return false;
  }
}

export function resolveRdfFormat(
  responseCt: string,
  declaredType: string | undefined,
  body: string
): string | null {
  const ct = (responseCt ?? '').toLowerCase().trim();
  if (RDF_MIME_SET.has(ct)) return ct;
  if (
    declaredType &&
    RDF_MIME_SET.has(declaredType.toLowerCase().trim()) &&
    ct === 'application/json' &&
    looksLikeJsonLd(body)
  ) {
    return declaredType;
  }
  return null;
}

export function formatFromMime(mime: string): RDFFormat {
  const m = (mime || '').toLowerCase().trim();
  if (m === 'text/turtle' || m === 'application/turtle') return 'turtle';
  if (m === 'application/ld+json') return 'jsonld';
  if (m === 'application/n-triples') return 'ntriples';
  if (m === 'application/n-quads') return 'nquads';
  if (m === 'application/rdf+xml') return 'rdfxml';
  if (m === 'application/trig') return 'trig';
  if (m === 'text/n3') return 'n3';
  return 'unknown';
}
