import { AuditRepo } from "#repositories/audit.repo.js";

/**
 * Persist a single audit record via the existing AuditRepo.
 * shape:
 * {
 *   actor: { id, email } | null,
 *   action: string,          // e.g. "user.update"
 *   entity: string,          // e.g. "user"
 *   entityId: number|string, // target id
 *   changes?: object|null,   // { field: { from, to }, ... }
 *   meta?: object|null,      // optional extra
 *   at?: string              // ISO time; default now
 * }
 */
export async function log(entry = {}) {
  const rec = {
    actor: entry.actor
      ? { id: entry.actor.id ?? null, email: entry.actor.email ?? null }
      : null,
    action: String(entry.action || ""),
    entity: String(entry.entity || ""),
    entityId: entry.entityId ?? null,
    changes: entry.changes ?? null,
    meta: entry.meta ?? null,
    at: entry.at || new Date().toISOString(),
  };
  // basic guard: don’t insert empty actions
  if (!rec.action) return null;
  return AuditRepo.insert(rec);
}

export async function list({ limit = 100 } = {}) {
  return AuditRepo.list({ limit });
}
