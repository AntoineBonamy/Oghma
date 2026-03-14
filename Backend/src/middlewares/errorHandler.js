import { AppError } from "../lib/errors.js";

export const errorHandler = (err, req, res, next) => {
      // Erreur Prisma : violation de contrainte unique (ex: email déjà utilisé)
  if (err.code === "P2002") {
    return res.status(409).json({ message: "Cette ressource existe déjà." });
  }

    // Erreur Prisma : enregistrement introuvable (ex: update/delete sur id inexistant)
  if (err.code === "P2025") {
    return res.status(404).json({ message: "Ressource introuvable." });
  }

    // Erreur métier connue (NotFoundError, BadRequestError, etc)
  if (err.isOperational) {
    return res.status(err.statusCode).json({ message: err.message });
  }

    // Erreur inconnue / bug
  console.error("💥 Erreur inattendue :", err);
  return res.status(500).json({ message: "Erreur serveur interne." });
};
