import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ReviewService } from "./review.service";


const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const result = await ReviewService.insertIntoDB(user, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Review created successfully',
        data: result,
    });
});

export const ReviewController = {
    insertIntoDB
}