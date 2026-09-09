/**
 * Core MIME and utility helpers for WRX discovery.
 */

export function baseMime(contentType: string | null): string {
  if (!contentType) return '';
  const semi = contentType.indexOf(';');
  return (semi === -1 ? contentType : contentType.slice(0, semi)).trim().toLowerCase();
}

export function isRDFMime(mime: string): boolean {
  const normalized = (mime ?? '').toLowerCase().trim();
  return (
    normalized === 'text/turtle' ||
    normalized === 'application/ld+json' ||
    normalized === 'application/rdf+xml' ||
    normalized === 'application/n-triples' ||
    normalized === 'application/n-quads' ||
    normalized === 'application/trig' ||
    normalized === 'text/n3'
  );
}

export function isLinksetMime(mime: string): boolean {
  const normalized = (mime ?? '').toLowerCase().trim();
  return normalized === 'application/linkset+json' || normalized === 'application/linkset';
}
