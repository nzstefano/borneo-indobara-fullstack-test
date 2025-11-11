export function notFound(_req, res) {
  res.status(404).json({ error: "route not found" });
}

export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const message = err.message || "internal server error";
  res.status(status).json({ error: message });
}
