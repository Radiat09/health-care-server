import { Request, Response } from "express";
import httpStatus from 'http-status';
import pick from "../../helpers/pick";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { PrescriptionService } from "./prescription.service";

const createPrescription = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const result = await PrescriptionService.createPrescription(user, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "prescription created successfully!",
        data: result
    })
})


const patientPrescription = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder'])
    const result = await PrescriptionService.patientPrescription(user, options);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Prescription fetched successfully',
        meta: result.meta,
        data: result.data
    });
});
export const PrescriptionController = {
    createPrescription,
    patientPrescription
}