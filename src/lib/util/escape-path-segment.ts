/**
 * Escapes a JSON Pointer segment per RFC 6901.
 * `~` must be escaped first to avoid double-escaping.
 *
 *   ~ → ~0
 *   / → ~1
 */
const TILDE_RE = /~/g;
const SLASH_RE = /\//g;

export function escapePathSegment(segment: string): string {
  if (segment.indexOf("~") === -1 && segment.indexOf("/") === -1) {
    return segment;
  }
  return segment.replace(TILDE_RE, "~0").replace(SLASH_RE, "~1");
}
