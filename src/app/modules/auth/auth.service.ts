import { UserStatus } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import bcrypt from "bcryptjs";
import { AppError } from "../../errorHerlpers/AppError";
import { createUserTokens } from "../../shared/userTokens";

const login = async (payload: { email: string; password: string }) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  const isCorrectPasswrd = await bcrypt.compare(
    payload.password,
    user.password
  );
  if (!isCorrectPasswrd) {
    throw new AppError(401, "Password is incorrect");
  }
  const userTokens = createUserTokens(user);
  return {
    ...userTokens,
    needPasswordChange: user.needPasswordChange,
  };
};

export const AuthService = {
  login,
};
