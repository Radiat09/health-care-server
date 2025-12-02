import { Admin, Doctor, UserRole } from '@prisma/client';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { roleCreationService, UserService, userService } from './user.service';

const createPatient = catchAsync(async (req: Request, res: Response) => {
  const patient = await roleCreationService.createPatient(req);

  // const result = await UserService.createPatient(req);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Patient created successfully',
    data: patient,
  });
});

const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const admin = await roleCreationService.createRoleBasedUser<Admin>(req, {
    dataField: 'admin',
    role: UserRole.ADMIN,
    model: 'admin',
  });

  // const result = await UserService.createAdmin(req);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Admin Created successfuly!',
    data: admin,
  });
});

const createDoctor = catchAsync(async (req: Request, res: Response) => {
  const doctor = await roleCreationService.createRoleBasedUser<Doctor>(req, {
    dataField: 'doctor',
    role: UserRole.DOCTOR,
    model: 'doctor',
  });

  // const result = await UserService.createDoctor(req);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Doctor Created successfuly!',
    data: doctor,
  });
});

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.getAllFromDB(req.query);
  // const result = await UserService.getAllFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User retrive successfully!',
    ...result,
  });
});


const getMyProfile = catchAsync(async (req: Request, res: Response) => {

  const user = req.user;

  const result = await UserService.getMyProfile(user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My profile data fetched!",
    data: result
  })
});

const changeProfileStatus = catchAsync(async (req: Request, res: Response) => {

  const { id } = req.params;
  const result = await UserService.changeProfileStatus(id, req.body)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users profile status changed!",
    data: result
  })
});

export const UserController = {
  createPatient,
  createAdmin,
  createDoctor,
  getAllFromDB,
  getMyProfile,
  changeProfileStatus
};
