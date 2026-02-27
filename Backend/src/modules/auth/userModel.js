import { prisma } from "../../../prisma.js";

/* CREATE USER */

export const createUser = async ({ email, passwordHash, username }) => {
    return prisma.user.create({
        data : {
            email, passwordHash, username
        },
    });
};

/* GET BY EMAIL */

export const findUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

/* GET BY ID */

export const findUserById = async (id) => {
  return prisma.user.findUnique({
    where: { id },
  });
};

/* GET ALL USERS */

export const findAllUsers = async () => {
    return prisma.user.findMany()
}

/* DELETE */

export const deleteUserById = async (id) => {
  return prisma.user.delete({
    where: { id },
  });
};