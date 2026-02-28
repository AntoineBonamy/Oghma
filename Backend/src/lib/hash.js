import bcrypt from "bcrypt";

export const hashToken = (token) => {
  return bcrypt.hash(token, 10);
}

export const verifyToken = (token, hash) => {
  return bcrypt.compare(token, hash);
}

