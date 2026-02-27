import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { createUser, findUserByEmail, findAllUsers } from "./userModel.js";

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

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérification des champs
    if (!email || !password) {
      return res.status(400).json({
        message: "Email et mot de passe requis",
      });
    }

    // Vérification de la validité de l'email
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        message: "Identifiants invalides",
      });
    }

    // Vérification de la validité du mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Identifiants invalides",
      });
    }

    // Génération du Json Web Token
    const token = jwt.sign(
      {
        userId: user.id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    // Réponse
    res.json({
      token,
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


/* GET ALL */

export const getAllUsers = async (req, res) => {
    try {
        const data = await findAllUsers()

        res.status(200).json(data)
    } catch (error) {
        
    }
}