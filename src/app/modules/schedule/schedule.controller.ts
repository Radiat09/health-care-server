import { Request, Response } from 'express';
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
export const ScheduleController = {
  insertIntoDB,
};
