import { Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import pick from '../../helpers/pick';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { scheduleService } from './schedule.service';

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await scheduleService.create(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Schedule created successfully!',
    data: result,
  });
});
const schedulesForDoctor = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
  const fillters = pick(req.query, ['startDateTime', 'endDateTime']);

  const user: JwtPayload = req.user;
  const result = await scheduleService.schedulesForDoctor(user, fillters, options);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Schedule fetched successfully!',
    meta: result.meta,
    data: result.data,
  });
});

const deleteScheduleFromDB = catchAsync(async (req: Request, res: Response) => {
  const result = await scheduleService.delete(req?.params?.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Schedule deleted successfully!',
    data: result,
  });
});

export const ScheduleController = {
  insertIntoDB,
  schedulesForDoctor,
  deleteScheduleFromDB,
};
