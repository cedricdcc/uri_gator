import { resolveRelativeUrl } from '../core/uri';

export interface ParsedWebLink {
  uri: string;
  rel: string[];
  type?: string;
  profile?: string;
  anchor?: string;
  title?: string;
  [key: string]: any;
}

/**
 * Splits a header string on commas, respecting quoted strings and angled brackets.
 */
function splitLinkHeaderEntries(headerValue: string): string[] {
  const entries: string[] = [];
  let current = '';
  let inQuotes = false;
  let inBrackets = false;

  for (let i = 0; i < headerValue.length; i++) {
    const char = headerValue[i];

    if (char === '\\' && inQuotes && i + 1 < headerValue.length) {
      current += char + headerValue[i + 1];
      i++;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === '<' && !inQuotes) {
      inBrackets = true;
    } else if (char === '>' && !inQuotes) {
      inBrackets = false;
    } else if (char === ',' && !inQuotes && !inBrackets) {
      if (current.trim()) {
        entries.push(current.trim());
      }
      current = '';
      continue;
    }

    current += char;
  }

  if (current.trim()) {
    entries.push(current.trim());
  }

  return entries;
}

/**
 * Parses parameters from an RFC 8288 link component (e.g. `rel="describedby"; type="text/turtle"`).
 */
function parseParameters(paramString: string): Record<string, string> {
  const params: Record<string, string> = {};
  const parts = paramString.split(';');

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) {
      params[trimmed.toLowerCase()] = '';
      continue;
    }

    const key = trimmed.slice(0, eqIndex).trim().toLowerCase();
    let val = trimmed.slice(eqIndex + 1).trim();

    // Strip quotes if quoted string
    if (val.startsWith('"') && val.endsWith('"') && val.length >= 2) {
      val = val.slice(1, -1).replace(/\\"/g, '"');
    }

    params[key] = val;
  }

  return params;
}

/**
 * Parses an HTTP Link header (RFC 8288) into structured link objects.
 */
export function parseRfc8288LinkHeader(
  headerValue: string | null | undefined,
  baseUri?: string
): ParsedWebLink[] {
  if (!headerValue || typeof headerValue !== 'string') {
    return [];
  }

  const results: ParsedWebLink[] = [];
  const entries = splitLinkHeaderEntries(headerValue);

  for (const entry of entries) {
    const match = entry.match(/^\s*<([^>]+)>(.*)$/);
    if (!match) continue;

    const rawUri = match[1].trim();
    const resolvedUri = baseUri ? resolveRelativeUrl(rawUri, baseUri) : rawUri;
    const paramStr = match[2] || '';
    const params = parseParameters(paramStr);

    const relTokens = (params.rel || '')
      .toLowerCase()
      .split(/\s+/)
      .map((r) => r.trim())
      .filter(Boolean);

    const link: ParsedWebLink = {
      uri: resolvedUri,
      rel: relTokens,
    };

    if (params.type) link.type = params.type.toLowerCase().trim();
    if (params.profile) link.profile = params.profile.trim();
    if (params.anchor) {
      link.anchor = baseUri ? resolveRelativeUrl(params.anchor.trim(), baseUri) : params.anchor.trim();
    }
    if (params.title) link.title = params.title;

    for (const [k, v] of Object.entries(params)) {
      if (!['rel', 'type', 'profile', 'anchor', 'title'].includes(k)) {
        link[k] = v;
      }
    }

    results.push(link);
  }

  return results;
}

/**
 * Returns all links that have the specified relation token.
 */
export function findLinkRelations(links: ParsedWebLink[], rel: string): ParsedWebLink[] {
  const targetRel = rel.toLowerCase().trim();
  return links.filter((link) => link.rel.includes(targetRel));
}

/**
 * Looks for `rel="self"` to determine the conceptual URI.
 * Returns null if not found.
 */
export function getSelfConceptualUri(links: ParsedWebLink[], fallbackBaseUri?: string): string | null {
  const selfLinks = findLinkRelations(links, 'self');
  if (selfLinks.length > 0 && selfLinks[0].uri) {
    return selfLinks[0].uri;
  }
  return null;
}
