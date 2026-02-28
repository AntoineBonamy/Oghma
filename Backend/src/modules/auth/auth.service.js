import { prisma } from "../../lib/prismaClient.js";
import { signAccessToken, signRefreshToken } from "../../lib/jwt.js";
import { hashToken } from "../../lib/hash.js";

async function login(user) {
  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);

  const refreshTokenHash = await hashToken(refreshToken);

  await prisma.refreshToken.create({
    data: {
      tokenHash: refreshTokenHash,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { accessToken, refreshToken };
}

export default { login };
