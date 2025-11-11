import "dotenv/config";
import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();
app.get("/health", (_req, res) => res.json({ ok: true })); // simple ping

const PORT = Number(env.port || 3000);
app.listen(PORT, () => {
  console.log(`[api-express] listening on :${PORT}`);
});
