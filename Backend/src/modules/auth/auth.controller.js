import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prismaClient.js";

import {
  createUser,
  findUserByEmail,
  findAllUsers,
  deleteUserById,
} from "./user.model.js";
import { hashToken, verifyToken } from "../../lib/hash.js";
import { signAccessToken, signRefreshToken } from "../../lib/jwt.js";

import authService from "./auth.service.js";

import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  ConflictError,
} from "../../lib/errors.js";

/* REGISTER */

export const register = async (req, res, next) => {
  try {
    const { email, password, username } = req.body;

    // Vérifications basiques
    if (!email || !password || !username) {
      throw new BadRequestError(
        "Email, mot de passe et nom d'utilisateur requis.",
      );
    }

    // Vérifier si l'utilisateur exister déjà
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      throw new ConflictError("Cet email est déjà utilisé.");
    }

    // Hash du mot de passe
    const passwordHash = await bcrypt.hash(password, 10);

    // Création utilisateur
    const user = await createUser({
      email,
      passwordHash,
      username,
    });

    // Réponse sans infos sensibles
    res.status(201).json({
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
    });
  } catch (err) {
    next(err);
  }
};

/* LOGIN */

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Vérification des champs
    if (!email || !password) {
      throw new BadRequestError("Email et mot de passe requis.");
    }

    // 2️⃣ Vérifier que l'utilisateur existe
    const user = await findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedError("Identifiants invalides.");
    }

    // 3️⃣ Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Identifiants invalides.");
    }

    // 4️⃣ Générer tokens via le service
    const { accessToken, refreshToken } = await authService.login(user);

    // 5️⃣ Réponse
    res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* REFRESH */
export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new UnauthorizedError();

    let payload;
    try {
      payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      throw new UnauthorizedError("Token invalide ou expiré.");
    }

    const tokens = await prisma.refreshToken.findMany({
      where: {
        userId: payload.sub,
        revoked: false,
      },
    });

    const validToken = await Promise.any(
      tokens.map((t) =>
        verifyToken(refreshToken, t.tokenHash).then((valid) =>
          valid ? t : null,
        ),
      ),
    ).catch(() => null);

    if (!validToken) throw new UnauthorizedError();

    // rotation
    await prisma.refreshToken.update({
      where: { id: validToken.id },
      data: { revoked: true },
    });

    const newAccessToken = signAccessToken(payload.sub);
    const newRefreshToken = signRefreshToken(payload.sub);

    const newHash = await hashToken(newRefreshToken);

    await prisma.refreshToken.create({
      data: {
        tokenHash: newHash,
        userId: payload.sub,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    next(error);
  }
};

// #===== PROTECTED =====#

/* GET ALL */

export const getAllUsers = async (req, res, next) => {
  try {
    const data = await findAllUsers();

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

/* ME */

export const me = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError("Utilisateur introuvable.");
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

/* LOGOUT */

export const logout = async (req, res, next) => {
  try {
    await prisma.refreshToken.updateMany({
      where: {
        userId: req.userId,
        revoked: false,
      },
      data: {
        revoked: true,
      },
    });

    res.status(200).json({ message: "Déconnexion réussie" });
  } catch (error) {
    next(error);
  }
};

/* DELETE ME */

export const deleteMe = async (req, res, next) => {
  try {
    const userId = req.userId;

    // 1️⃣ Supprimer tous les refresh tokens liés
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });

    // 2️⃣ Supprimer l'utilisateur
    await deleteUserById(userId);

    res.status(200).json({ message: "Compte supprimé avec succès" });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
