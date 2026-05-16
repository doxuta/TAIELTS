/**
 * Public response shapes (V1) shared between the web API and any future
 * mobile / 3rd-party client. Treat fields here as the API contract:
 *
 *   - Adding a new optional field is backward-compatible.
 *   - Renaming or removing a field is a breaking change → bump API_VERSION.
 *
 * IDs are CUIDs and are stable across releases.
 */

export const API_VERSION = 1

export * from './today'
export * from './module'
export * from './source'
export * from './feedback'
export * from './assignment'
