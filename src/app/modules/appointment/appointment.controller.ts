import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AppointmentService } from "./appointment.service";




const createAppointment = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const result = await AppointmentService.createAppointment(user, req.body);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Appointment created successfully!",
        data: result
    })
});

export const AppointmentController = {
    createAppointment,
}