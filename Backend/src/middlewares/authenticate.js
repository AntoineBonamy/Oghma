import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../lib/errors.js";

export default function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new UnauthorizedError("Token manquant."));
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // 🔑 info clé pour la suite
    req.userId = payload.sub;

    next();
  } catch (error) {
    // TokenExpiredError, JsonWebTokenError, NotBeforeError → toujours 401
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new UnauthorizedError("Token invalide ou expiré."));
    }
    next(error);
  }
}
