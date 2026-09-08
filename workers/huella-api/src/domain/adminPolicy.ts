/** Port de list_users/src/domain/security/adminPolicy.js */
export function isAdminByLabels(
  labels: unknown,
  allowedAdminLabelsLower: string[],
): boolean {
  const list = Array.isArray(labels) ? labels : [];
  const lower = list.map((l) => String(l).toLowerCase());
  return lower.some((l) => allowedAdminLabelsLower.includes(l));
}

export function isOperadorByLabels(labels: unknown): boolean {
  const list = Array.isArray(labels) ? labels : [];
  const lower = list.map((l) => String(l).toLowerCase());
  return lower.includes('admin') || lower.includes('operador');
}

export function allowedAdminLabels(env: { ADMIN_LABELS?: string }): string[] {
  const raw = env.ADMIN_LABELS ?? 'admin';
  return String(raw)
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}
