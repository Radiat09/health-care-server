import { envVars } from "../../config/env";
import bcrypt from "bcryptjs";
import { prisma } from "../../utils/prisma";
import { Request } from "express";
import { AppError } from "../../errorHerlpers/AppError";
import { deleteImageFromCLoudinary } from "../../config/cloudinary.config";
import { Admin, Doctor, Prisma, UserRole } from "@prisma/client";
import { userSearchableFields } from "./user.constants";
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";
import { QueryBuilder } from "../../utils/QueryBuilder";

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

const createAdmin = async (req: Request): Promise<Admin> => {
  if (req.file) {
    req.body.admin.profilePhoto = req.file.path;
  }

  const hashedPassword: string = await bcrypt.hash(
    req.body.password,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  const userData = {
    email: req.body.admin.email,
    password: hashedPassword,
    role: UserRole.ADMIN,
    name: req.body.admin.name,
  } as Prisma.UserCreateInput;

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });

    const createdAdminData = await transactionClient.admin.create({
      data: req.body.admin,
    });

    return createdAdminData;
  });

  return result;
};

const createDoctor = async (req: Request): Promise<Doctor> => {
  if (req.file) {
    req.body.doctor.profilePhoto = req.file.path;
  }
  const hashedPassword: string = await bcrypt.hash(req.body.password, 10);

  const userData = {
    email: req.body.doctor.email,
    password: hashedPassword,
    role: UserRole.DOCTOR,
    name: req.body.doctor.name,
  } as Prisma.UserCreateInput;

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });

    const createdDoctorData = await transactionClient.doctor.create({
      data: req.body.doctor,
    });

    return createdDoctorData;
  });

  return result;
};

// const getAllFromDB = async (params: any, options: IOptions) => {
//   const { page, limit, skip, sortBy, sortOrder } =
//     paginationHelper.calculatePagination(options);
//   const { searchTerm, ...filterData } = params;

//   const andConditions: Prisma.UserWhereInput[] = [];

//   if (searchTerm) {
//     andConditions.push({
//       OR: userSearchableFields.map((field) => ({
//         [field]: {
//           contains: searchTerm,
//           mode: "insensitive",
//         },
//       })),
//     });
//   }

//   if (Object.keys(filterData).length > 0) {
//     andConditions.push({
//       AND: Object.keys(filterData).map((key) => ({
//         [key]: {
//           equals: (filterData as any)[key],
//         },
//       })),
//     });
//   }

//   const whereConditions: Prisma.UserWhereInput =
//     andConditions.length > 0
//       ? {
//           AND: andConditions,
//         }
//       : {};

//   const result = await prisma.user.findMany({
//     skip,
//     take: limit,

//     where: whereConditions,
//     orderBy: {
//       [sortBy]: sortOrder,
//     },
//   });

//   const total = await prisma.user.count({
//     where: whereConditions,
//   });
//   return {
//     meta: {
//       page,
//       limit,
//       total,
//     },
//     data: result,
//   };
// };

const getAllFromDB = async (query: any) => {
  const queryBuilder = new QueryBuilder<
    typeof prisma.user,
    Prisma.UserWhereInput,
    Prisma.UserSelect
  >(prisma, prisma.user, query);

  const [data, meta] = await Promise.all([
    queryBuilder
      .filter()
      .search(userSearchableFields)
      .sort()
      .fields()
      .paginate()
      .build(),
    queryBuilder.getMeta(),
  ]);

  return {
    meta,
    data,
  };
};
export const UserService = {
  createPatient,
  createAdmin,
  createDoctor,
  getAllFromDB,
};
