import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prismaClient.js";
import { signAccessToken, signRefreshToken } from "../../lib/jwt.js";
import { hashToken, verifyToken } from "../../lib/hash.js";


import { createUser, findUserByEmail, findAllUsers } from "./user.model.js";

/* REGISTER */

export const register = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Vérifications basiques
    if (!email || !password || !username) {
      return res.status(400).json({
        message: "Tous les champs sont obligatoires.",
      });
    }

    // Vérifier si l'utilisateur exister déjà
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        message: "Cet email est déjà utilisé.",
      });
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
    console.error(err);
    res.status(500).json({
      message: "Erreur lors de l'inscription",
    });
  }
};

/* LOGIN */

import authService from "./auth.service.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Vérification des champs
    if (!email || !password) {
      return res.status(400).json({
        message: "Email et mot de passe requis",
      });
    }

    // 2️⃣ Vérifier que l'utilisateur existe
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        message: "Identifiants invalides",
      });
    }

    // 3️⃣ Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Identifiants invalides",
      });
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
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la connexion",
    });
  }
};

/* REFRESH */
export const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.sendStatus(401);

  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    return res.sendStatus(401);
  }

  const tokens = await prisma.refreshToken.findMany({
    where: {
      userId: payload.sub,
      revoked: false
    }
  });

  const validToken = await Promise.any(
    tokens.map(t =>
      verifyToken(refreshToken, t.tokenHash).then(valid => valid ? t : null)
    )
  ).catch(() => null);

  if (!validToken) return res.sendStatus(401);

  // rotation
  await prisma.refreshToken.update({
    where: { id: validToken.id },
    data: { revoked: true }
  });

  const newAccessToken = signAccessToken(payload.sub);
  const newRefreshToken = signRefreshToken(payload.sub);

  const newHash = await hashToken(newRefreshToken);

  await prisma.refreshToken.create({
    data: {
      tokenHash: newHash,
      userId: payload.sub,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  res.json({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  });
}

// #===== PROTECTED =====#

/* GET ALL */

export const getAllUsers = async (req, res) => {
    try {
        const data = await findAllUsers()

        res.status(200).json(data)
    } catch (error) {
        
    }
}

/* ME */

export const me = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/* LOGOUT */

export const logout = async (req, res) => {
  try {
    const userId = req.userId;

    await prisma.refreshToken.updateMany({
      where: {
        userId,
        revoked: false,
      },
      data: {
        revoked: true,
      },
    });

    res.status(200).json({ message: "Déconnexion réussie" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la déconnexion" });
  }
};