export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // erreur "connue", pas un bug
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Ressource introuvable") {
    super(message, 404);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Requête invalide") {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Non autorisé") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Accès refusé") {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflit de ressource") {
    super(message, 409);
  }
}