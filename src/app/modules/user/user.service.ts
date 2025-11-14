import { envVars } from "../../config/env";
import bcrypt from "bcryptjs";
import { prisma } from "../../shared/prisma";
import { Request } from "express";
import { AppError } from "../../errorHerlpers/AppError";
import { deleteImageFromCLoudinary } from "../../config/cloudinary.config";

// const createPatient = async (req: Request) => {
//   const hashPassword = await bcrypt.hash(
//     req.body?.password,
//     Number(envVars.BCRYPT_SALT_ROUND)
//   );

//   if (req.file) {
//     req.body.patient.profilePhoto = req.file?.path;
//   }

//   const result = await prisma.$transaction(async (tnx) => {
//     // Validate if user already exists with same email/phone
//     const existingUser = await tnx.user.findFirst({
//       where: {
//         OR: [{ email: req.body.patient.email }],
//       },
//     });

//     if (existingUser) {
//       throw new AppError(409, "User with this email already exists");
//     }

//     await tnx.user.create({
//       data: {
//         ...req.body.patient,
//         password: hashPassword,
//       },
//     });

//     return await tnx.patient.create({
//       data: req.body.patient,
//     });
//   });
//   return result;
// };

const createPatient = async (req: Request) => {
  const hashPassword = await bcrypt.hash(
    req.body?.password,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  if (req.file) {
    req.body.patient.profilePhoto = req.file?.path;
  }

  try {
    const result = await prisma.$transaction(async (tnx) => {
      // Validate if user already exists with same email
      const existingUser = await tnx.user.findFirst({
        where: {
          OR: [{ email: req.body.patient.email }],
        },
      });

      if (existingUser) {
        throw new AppError(409, "User with this email already exists");
      }

      // Create user
      await tnx.user.create({
        data: {
          name: req.body?.patient?.name,
          email: req.body?.patient?.email,
          password: hashPassword,
        },
      });

      // Create patient
      const patient = await tnx.patient.create({
        data: req.body.patient,
      });

      return patient;
    });

    return result;
  } catch (error) {
    // If transaction fails and image was uploaded, delete it from Cloudinary
    if (req.file) {
      await deleteImageFromCLoudinary(req.file?.path as string).catch(
        (deleteError) => {
          console.error("Failed to delete image from Cloudinary:", deleteError);
          // Don't throw here, we want to throw the original error
        }
      );
    }

    // Re-throw the original error
    throw error;
  }
};
export const userService = {
  createPatient,
};
