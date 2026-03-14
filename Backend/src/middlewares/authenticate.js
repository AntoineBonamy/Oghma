import jwt from "jsonwebtoken";

export default function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token manquant" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // 🔑 info clé pour la suite
    req.userId = payload.sub;

    next();
  } catch (error) {
    next(error);
  }
}
