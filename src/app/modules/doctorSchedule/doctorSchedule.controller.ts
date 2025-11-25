import { Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { doctorScheduleService } from './doctorSchedule.service';

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const user: JwtPayload = req.user;
  const result = await doctorScheduleService.insertIntoDB(user, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Doctor Schedule created successfully!',
    data: result,
  });
});

export const DoctorScheduleController = {
  insertIntoDB,
};
