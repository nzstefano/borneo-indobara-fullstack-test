// Q2 — To-Do REST API (in-memory)
// Run: npm run dev  -> http://localhost:3000
import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));

let TODOS = [];
let nextId = 1;

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/todos", (req, res) => {
  const { title = "", done = false } = req.body || {};
  if (!String(title).trim()) return res.status(400).json({ error: "title is required" });
  const todo = { id: nextId++, title: String(title), done: Boolean(done), createdAt: new Date().toISOString() };
  TODOS.push(todo);
  res.status(201).json(todo);
});

app.get("/todos", (_req, res) => res.json(TODOS));

app.patch("/todos/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = TODOS.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ error: "not found" });

  const allowed = ["title", "done"];
  for (const k of Object.keys(req.body || {})) {
    if (!allowed.includes(k)) continue;
    TODOS[idx][k] = k === "done" ? Boolean(req.body[k]) : String(req.body[k]);
  }
  res.json(TODOS[idx]);
});

app.delete("/todos/:id", (req, res) => {
  const id = Number(req.params.id);
  const before = TODOS.length;
  TODOS = TODOS.filter(t => t.id !== id);
  if (before === TODOS.length) return res.status(404).json({ error: "not found" });
  res.status(204).end();
});

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => console.log(`[api-todos] listening on :${PORT}`));
