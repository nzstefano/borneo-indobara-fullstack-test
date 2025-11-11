export function diffFields(before, after) {
  const changes = {};
  const keys = new Set([
    ...Object.keys(before || {}),
    ...Object.keys(after || {}),
  ]);
  for (const k of keys) {
    const from = norm(before?.[k]);
    const to = norm(after?.[k]);
    if (!isEqual(from, to)) {
      changes[k] = { from, to };
    }
  }
  return changes;
}

function norm(v) {
  if (v === undefined) return null;
  if (typeof v === "string") return v;
  if (v === null) return null;
  return JSON.stringify(v);
}
function isEqual(a, b) {
  return a === b;
}
