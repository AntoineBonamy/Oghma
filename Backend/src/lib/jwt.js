import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

export const signAccessToken = (userId) => {
  return jwt.sign(
    { sub: userId },
    ACCESS_SECRET,
    { expiresIn: "15m" }
  );
}

export const signRefreshToken = (userId) => {
  return jwt.sign(
    { sub: userId },
    REFRESH_SECRET,
    { expiresIn: "7d" }
  );
}

export default {
  signAccessToken,
  signRefreshToken
};