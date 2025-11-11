import { TodosRepo } from "../repositories/todos.repo.js";

export const TodosService = {
  async create({ title, done }) {
    if (!String(title || "").trim()) throw Object.assign(new Error("title is required"), { status: 400 });
    return TodosRepo.create({ title, done });
  },
  async list() {
    return TodosRepo.list();
  },
  async patch(id, payload) {
    const allowed = ["title", "done"];
    const patch = {};
    for (const k of Object.keys(payload || {})) {
      if (!allowed.includes(k)) continue;
      patch[k] = k === "done" ? Boolean(payload[k]) : String(payload[k]);
    }
    const updated = await TodosRepo.update(id, patch);
    if (!updated) throw Object.assign(new Error("not found"), { status: 404 });
    return updated;
  },
  async remove(id) {
    const ok = await TodosRepo.remove(id);
    if (!ok) throw Object.assign(new Error("not found"), { status: 404 });
  },
};
