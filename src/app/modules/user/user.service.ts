import { envVars } from "../../../config/env";
import { CreatePatientInput } from "./user.interface";
import bcrypt from "bcryptjs";
import { prisma } from "../../shared/prisma";

const createPatient = async (payload: CreatePatientInput) => {
  const hashPassword = await bcrypt.hash(
    payload?.password,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  const result = await prisma.$transaction(async (tnx) => {
    await tnx.user.create({
      data: {
        email: payload.email,
        password: hashPassword,
        name: payload.name,
      },
    });

    return await tnx.patient.create({
      data: {
        name: payload.name,
        email: payload.email,
      },
    });
  });
  return result;
};

export const userService = {
  createPatient,
};
