// src/controllers/todos.controller.js
import { TodosService } from "#services/todos.service.js";

export const TodosController = {
  async create(req, res, next) {
    try {
      const actor = req.user
        ? { id: req.user.sub, email: req.user.email }
        : null;
      const rec = await TodosService.create(req.body, actor);
      res.status(201).json(rec);
    } catch (e) {
      next(e);
    }
  },

  async list(req, res, next) {
    try {
      const rows = await TodosService.list();
      res.json(rows);
    } catch (e) {
      next(e);
    }
  },

  async patch(req, res, next) {
    try {
      const actor = req.user
        ? { id: req.user.sub, email: req.user.email }
        : null;
      const rec = await TodosService.patch(req.params.id, req.body, actor);
      res.json(rec);
    } catch (e) {
      next(e);
    }
  },

  async remove(req, res, next) {
    try {
      const actor = req.user
        ? { id: req.user.sub, email: req.user.email }
        : null;
      await TodosService.remove(req.params.id, actor);
      res.status(204).end();
    } catch (e) {
      next(e);
    }
  },
};
