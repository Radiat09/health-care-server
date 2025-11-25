import { Admin, Doctor, Patient, Prisma, PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Request } from "express";
import { deleteImageFromCloudinary } from "../../config/cloudinary.config";
import { envVars } from "../../config/env";
import { AppError } from "../../errorHerlpers/AppError";
import { BaseService, ModelName } from "../../utils/BaseService";
import { prisma } from "../../utils/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { userSearchableFields } from "./user.constants";


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
      await deleteImageFromCloudinary(req.file?.path as string).catch(
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

//User Service Class using BaseService
// user.service.ts - Focused only on User operations
export class UserServiceClass extends BaseService<"user"> {
  constructor(prisma: PrismaClient) {
    super(prisma, "user", ["name", "email"]);
  }
  // Define safe fields to select
  private get safeFieldsString(): string {
    return "id,name,email,role,needPasswordChange,status,createdAt,updatedAt";
  }

  // Override getAllFromDB to exclude password field
  async getAllFromDB(query: any) {
    const queryWithSafeSelect = {
      ...query,
      fields: this.safeFieldsString, // Database only returns safe fields
    };

    return super.getAllFromDB(queryWithSafeSelect);
  }

  async getUserByEmail(email: string) {
    return this.modelDelegate.findUnique({ where: { email } });
  }

  async createUserWithRole(userData: {
    email: string;
    password: string;
    role: UserRole;
    name: string;
  }) {
    const existingUser = await this.getUserByEmail(userData.email);
    if (existingUser) {
      throw new AppError(409, "User with this email already exists");
    }
    return this.create(userData);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, Number(envVars.BCRYPT_SALT_ROUND));
  }
}

// role-creation.service.ts - Handles role-based user creation
export class RoleCreationService {
  constructor(
    private prisma: PrismaClient,
    private userService: UserServiceClass
  ) { }

  private async handleImageUpload(req: Request, dataField: string) {
    if (req.file) {
      req.body[dataField].profilePhoto = req.file.path;
    }
  }

  async createRoleBasedUser<T>(
    req: Request,
    config: {
      dataField: string;
      role: UserRole;
      model: ModelName;
    }
  ): Promise<T> {
    const { dataField, role, model } = config;

    await this.handleImageUpload(req, dataField);

    const hashedPassword = await this.userService.hashPassword(
      req.body.password
    );

    const userData = {
      email: req.body[dataField].email,
      password: hashedPassword,
      role: role,
      name: req.body[dataField].name,
    };

    const result = await this.prisma.$transaction(async (transactionClient) => {
      // Check for existing user WITHIN the transaction context
      const existingUser = await transactionClient.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        throw new AppError(409, "User with this email already exists");
      }

      // Create user within transaction
      await transactionClient.user.create({
        data: userData,
      });

      const createdData = await (transactionClient as any)[model].create({
        data: req.body[dataField],
      });

      return createdData;
    });

    return result;
  }

  async createPatient(req: Request): Promise<Patient> {
    const hashedPassword = await this.userService.hashPassword(
      req.body?.password
    );

    if (req.file) {
      req.body.patient.profilePhoto = req.file?.path;
    }

    try {
      const result = await this.prisma.$transaction(async (tnx) => {
        const userData = {
          name: req.body?.patient?.name,
          email: req.body?.patient?.email,
          password: hashedPassword,
          role: UserRole.PATIENT,
        };

        // Check for existing user WITHIN the transaction
        const existingUser = await tnx.user.findUnique({
          where: { email: userData.email },
        });

        if (existingUser) {
          throw new AppError(409, "User with this email already exists");
        }

        // Create user within transaction
        await tnx.user.create({
          data: userData,
        });

        const patient = await tnx.patient.create({
          data: req.body.patient,
        });

        return patient;
      });

      return result;
    } catch (error) {
      if (req.file) {
        await deleteImageFromCloudinary(req.file?.path as string).catch(
          (deleteError) => {
            console.error(
              "Failed to delete image from Cloudinary:",
              deleteError
            );
          }
        );
      }
      throw error;
    }
  }
}


export const userService = new UserServiceClass(prisma);
export const roleCreationService = new RoleCreationService(prisma, userService);
