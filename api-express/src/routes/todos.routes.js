import { Router } from "express";
import { TodosController } from "../controllers/todos.controller.js";
// If you want to protect all todos: import { requireAuth } from "../middlewares/auth.js"

const r = Router();
// r.use(requireAuth); // uncomment to require auth for all /todos
r.post("/", TodosController.create);
r.get("/", TodosController.list);
r.patch("/:id", TodosController.patch);
r.delete("/:id", TodosController.remove);
export default r;
