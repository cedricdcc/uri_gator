export interface ParsedUriInfo {
  raw: string;
  normalized: string;
  origin: string;
  pathname: string;
  extension?: string;
  conceptualUri: string;
}

const KNOWN_EXTENSIONS = new Set([
  '.ttl',
  '.jsonld',
  '.rdf',
  '.nt',
  '.nq',
  '.n3',
  '.trig',
  '.xml',
  '.html',
  '.htm',
  '.json',
]);

/**
 * Derives the conceptual URI for a resource.
 * If an explicit `rel="self"` link is provided, it takes highest precedence.
 * Otherwise, if the URL ends with a known representation file extension,
 * that extension is stripped.
 */
export function deriveConceptualUri(uri: string, selfHeaderHref?: string): string {
  if (selfHeaderHref && selfHeaderHref.trim()) {
    return resolveRelativeUrl(selfHeaderHref.trim(), uri);
  }

  try {
    const urlObj = new URL(uri);
    const lastSlash = urlObj.pathname.lastIndexOf('/');
    const filename = lastSlash >= 0 ? urlObj.pathname.slice(lastSlash + 1) : urlObj.pathname;
    const dotIndex = filename.lastIndexOf('.');

    if (dotIndex > 0) {
      const ext = filename.slice(dotIndex).toLowerCase();
      if (KNOWN_EXTENSIONS.has(ext)) {
        urlObj.pathname = urlObj.pathname.slice(0, urlObj.pathname.length - ext.length);
        // Strip trailing slash if generated from stripping extension unless it's root
        if (urlObj.pathname.length > 1 && urlObj.pathname.endsWith('/')) {
          urlObj.pathname = urlObj.pathname.slice(0, -1);
        }
        urlObj.search = '';
        urlObj.hash = '';
        return urlObj.toString();
      }
    }

    urlObj.search = '';
    urlObj.hash = '';
    return urlObj.toString();
  } catch {
    // If invalid URL, return as-is
    return uri;
  }
}

/**
 * Resolves a relative URL against a base URL.
 */
export function resolveRelativeUrl(href: string, base: string): string {
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}

/**
 * Parses a URI into its core structural components and computes the conceptual URI.
 */
export function parseUriInfo(uri: string, selfHeaderHref?: string): ParsedUriInfo {
  let normalized = uri;
  let origin = '';
  let pathname = '';
  let extension: string | undefined;

  try {
    const parsed = new URL(uri);
    normalized = parsed.toString();
    origin = parsed.origin;
    pathname = parsed.pathname;

    const lastSlash = pathname.lastIndexOf('/');
    const filename = lastSlash >= 0 ? pathname.slice(lastSlash + 1) : pathname;
    const dotIndex = filename.lastIndexOf('.');
    if (dotIndex > 0) {
      const ext = filename.slice(dotIndex).toLowerCase();
      if (KNOWN_EXTENSIONS.has(ext)) {
        extension = ext;
      }
    }
  } catch {
    // Fallback if not valid URL
  }

  const conceptualUri = deriveConceptualUri(uri, selfHeaderHref);

  return {
    raw: uri,
    normalized,
    origin,
    pathname,
    extension,
    conceptualUri,
  };
}
