import { Router } from "express";
import { TodosController } from "../controllers/todos.controller.js";
import { requireAuth } from "../middlewares/auth.js";

const r = Router();
r.use(requireAuth);
r.post("/", TodosController.create);
r.get("/", TodosController.list);
r.patch("/:id", TodosController.patch);
r.delete("/:id", TodosController.remove);

export default r;
