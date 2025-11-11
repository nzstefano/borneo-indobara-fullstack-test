import { verifyToken } from "../utils/jwt.js";

export function requireAuth(req, res, next) {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ error: "missing token" });
  try {
    req.user = verifyToken(token);
    return next();
  } catch {
    return res.status(401).json({ error: "invalid token" });
  }
}
