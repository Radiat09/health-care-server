import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import {
  RoleCreationService,
  UserService,
  UserServiceClass,
} from "./user.service";
import sendResponse from "../../utils/sendResponse";
import { Admin, Doctor, Patient, PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();
const userService = new UserServiceClass(prisma);
const roleCreationService = new RoleCreationService(prisma, userService);

const createPatient = catchAsync(async (req: Request, res: Response) => {
  const patient = await roleCreationService.createPatient(req);

  // const result = await UserService.createPatient(req);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Patient created successfully",
    data: patient,
  });
});

const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const admin = await roleCreationService.createRoleBasedUser<Admin>(req, {
    dataField: "admin",
    role: UserRole.ADMIN,
    model: "admin",
  });

  // const result = await UserService.createAdmin(req);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Admin Created successfuly!",
    data: admin,
  });
});

const createDoctor = catchAsync(async (req: Request, res: Response) => {
  const doctor = await roleCreationService.createRoleBasedUser<Doctor>(req, {
    dataField: "doctor",
    role: UserRole.DOCTOR,
    model: "doctor",
  });

  // const result = await UserService.createDoctor(req);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Doctor Created successfuly!",
    data: doctor,
  });
});

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User retrive successfully!",
    meta: result.meta,
    data: result.data,
  });
});

export const UserController = {
  createPatient,
  createAdmin,
  createDoctor,
  getAllFromDB,
};
