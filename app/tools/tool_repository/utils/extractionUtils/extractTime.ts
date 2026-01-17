/**
 * Extract time parameter from query string.
 */
export function extractTime(query: string): string {
  const matches = query.match(/time:\s*(\S+)/);
  return matches ? matches[1] : "";
}
