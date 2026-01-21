/**
 * Builds a query string from a params object, filtering out undefined, null, and empty string values.
 *
 * @param params - Object containing query parameters
 * @returns Query string with leading '?' if params exist, or empty string if no valid params
 *
 * @example
 * buildQueryString({ status: 'active', id: 123 }) // "?status=active&id=123"
 * buildQueryString({ status: undefined, id: 123 }) // "?id=123"
 * buildQueryString({ status: undefined }) // ""
 * buildQueryString(undefined) // ""
 */
export function buildQueryString(params?: Record<string, any>): string {
  if (!params) {
    return '';
  }

  // Filter out undefined, null, and empty string values
  const filteredParams: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      filteredParams[key] = String(value);
    }
  }

  // If no valid params remain, return empty string
  if (Object.keys(filteredParams).length === 0) {
    return '';
  }

  // Build query string with URLSearchParams
  return `?${new URLSearchParams(filteredParams).toString()}`;
}
