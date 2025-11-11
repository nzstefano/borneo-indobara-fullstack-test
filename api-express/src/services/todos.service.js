import { TodosRepo } from "../repositories/todos.repo.js";
import { log as auditLog } from "#services/audit.service.js";
import { diffFields } from "#utils/diff.js";

// Helper to find current record without touching the repo internals
async function findById(id) {
  const all = await TodosRepo.list();
  return all.find((t) => Number(t.id) === Number(id)) || null;
}

export const TodosService = {
  async create({ title, done }, actor = null) {
    if (!String(title || "").trim()) {
      throw Object.assign(new Error("title is required"), { status: 400 });
    }
    const rec = await TodosRepo.create({
      title: String(title).trim(),
      done: Boolean(done),
    });

    // AUDIT: todo.create
    await auditLog({
      actor, // { id, email } or null
      action: "todo.create",
      entity: "todo",
      entityId: rec.id,
      changes: {
        title: { from: null, to: rec.title },
        done: { from: null, to: !!rec.done },
      },
    });

    return rec;
  },

  async list() {
    return TodosRepo.list();
  },

  async patch(id, payload, actor = null) {
    const allowed = ["title", "done"];
    const patch = {};
    for (const k of Object.keys(payload || {})) {
      if (!allowed.includes(k)) continue;
      patch[k] = k === "done" ? Boolean(payload[k]) : String(payload[k]);
    }

    const before = await findById(id);
    if (!before) {
      throw Object.assign(new Error("not found"), { status: 404 });
    }

    const updated = await TodosRepo.update(id, patch);
    if (!updated) {
      throw Object.assign(new Error("not found"), { status: 404 });
    }

    // AUDIT: only record real field changes
    const changes = diffFields(
      { title: before.title, done: !!before.done },
      { title: updated.title, done: !!updated.done }
    );

    if (Object.keys(changes).length) {
      await auditLog({
        actor,
        action: "todo.update",
        entity: "todo",
        entityId: updated.id,
        changes,
      });
    }

    return updated;
  },

  async remove(id, actor = null) {
    const before = await findById(id);
    if (!before) {
      throw Object.assign(new Error("not found"), { status: 404 });
    }

    const ok = await TodosRepo.remove(id);
    if (!ok) {
      throw Object.assign(new Error("not found"), { status: 404 });
    }

    // AUDIT: todo.delete (minimal payload – no sensitive data)
    await auditLog({
      actor,
      action: "todo.delete",
      entity: "todo",
      entityId: before.id,
      changes: {
        deleted: {
          from: { title: before.title, done: !!before.done },
          to: null,
        },
      },
    });
  },
};
