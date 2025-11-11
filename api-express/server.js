// api-express: Combined Backend (JWT Auth + To-Do)
// Run: npm run dev  -> http://localhost:3000
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*", credentials: false }));

const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "1h";

/* ------------------------ Auth (JWT) ------------------------ */
const users = [
  // password: password
  {
    id: 1,
    email: "demo@demo.com",
    name: "Demo User",
    passwordHash: bcrypt.hashSync("password", 10),
    roles: ["user"]
  }
];

function issueToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, roles: user.roles },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

function requireAuth(req, res, next) {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ error: "missing token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: "invalid token" });
  }
}

// Health
app.get("/health", (_req, res) => res.json({ ok: true }));

// Login
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "email and password are required" });
  const user = users.find(u => u.email === String(email).toLowerCase());
  if (!user) return res.status(401).json({ error: "invalid credentials" });
  const ok = await bcrypt.compare(String(password), user.passwordHash);
  if (!ok) return res.status(401).json({ error: "invalid credentials" });
  const token = issueToken(user);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, roles: user.roles } });
});

// Who am I
app.get("/auth/me", requireAuth, (req, res) => {
  const user = users.find(u => u.id === req.user.sub);
  if (!user) return res.status(404).json({ error: "not found" });
  res.json({ id: user.id, name: user.name, email: user.email, roles: user.roles });
});

/* ------------------------ To-Do (in-memory) ------------------------ */
let TODOS = [];
let nextId = 1;

// Uncomment to protect all /todos with JWT
// app.use("/todos", requireAuth);

// Create
app.post("/todos", (req, res) => {
  const { title = "", done = false } = req.body || {};
  if (!String(title).trim()) return res.status(400).json({ error: "title is required" });
  const todo = { id: nextId++, title: String(title), done: Boolean(done), createdAt: new Date().toISOString() };
  TODOS.push(todo);
  res.status(201).json(todo);
});

// List
app.get("/todos", (_req, res) => res.json(TODOS));

// Patch
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

// Delete
app.delete("/todos/:id", (req, res) => {
  const id = Number(req.params.id);
  const before = TODOS.length;
  TODOS = TODOS.filter(t => t.id !== id);
  if (before === TODOS.length) return res.status(404).json({ error: "not found" });
  res.status(204).end();
});

/* ------------------------ Start ------------------------ */
app.listen(PORT, () => console.log(`[api-express] listening on :${PORT}`));
