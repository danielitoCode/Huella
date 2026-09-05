export function ok(data = {}) {
  return { success: true, data };
}

export function fail(code, message) {
  return { success: false, error: { code, message } };
}
