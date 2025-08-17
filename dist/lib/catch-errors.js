/**
 * Wrap an async function with error handling
 * @params {function} fn Function to wrap
 * @returns {Promise} Promise with error handling
 */
export function catchErrors(fn) {
    return (req, res, next) => fn(req, res, next).catch(next);
}
//# sourceMappingURL=catch-errors.js.map