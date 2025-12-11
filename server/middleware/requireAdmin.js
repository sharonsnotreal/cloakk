// Requires req.user to be set by auth middleware
module.exports = function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'missing_auth' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'admin_required' });
  next();
};