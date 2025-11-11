import { TodosService } from "../services/todos.service.js";

export const TodosController = {
  async create(req, res, next) {
    try {
      const todo = await TodosService.create(req.body || {});
      res.status(201).json(todo);
    } catch (e) { next(e); }
  },
  async list(_req, res, next) {
    try {
      const items = await TodosService.list();
      res.json(items);
    } catch (e) { next(e); }
  },
  async patch(req, res, next) {
    try {
      const id = Number(req.params.id);
      const updated = await TodosService.patch(id, req.body || {});
      res.json(updated);
    } catch (e) { next(e); }
  },
  async remove(req, res, next) {
    try {
      const id = Number(req.params.id);
      await TodosService.remove(id);
      res.status(204).end();
    } catch (e) { next(e); }
  },
};
