function authMiddleware(req, res, next) {
  if(req.cookies['auth-sw']) {
    req.isAuthenticated = true;
  }
  next();
}

module.exports = authMiddleware;