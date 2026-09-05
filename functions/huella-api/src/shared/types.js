/** @typedef {'public'|'user'|'admin'|'internal'} AuthLevel */

/**
 * @typedef {Object} RouteDef
 * @property {AuthLevel} auth
 * @property {(ctx: any, payload: any) => Promise<any>} handler
 * @property {(payload: any) => any} [validate]
 */
