import { UserRole } from '@prisma/client';
import express from 'express';
import { checkAuth } from '../../middlewares/checkAuth';
import { validateRequest } from '../../middlewares/validateRequest';
import { DoctorScheduleController } from './doctorSchedule.controller';
import { DoctorScheduleValidation } from './doctorSchedule.validation';

const router = express.Router();

router.post(
  '/',
  checkAuth(UserRole.DOCTOR, UserRole.ADMIN),
  validateRequest(DoctorScheduleValidation.createDoctorScheduleValidationSchema),
  DoctorScheduleController.insertIntoDB,
);

export const doctorScheduleRoutes = router;
