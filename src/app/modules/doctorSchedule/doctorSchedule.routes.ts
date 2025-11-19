import { UserRole } from '@prisma/client';
import express from 'express';
import { checkAuth } from '../../middlewares/checkAuth';
import { DoctorScheduleController } from './doctorSchedule.controller';

const router = express.Router();

router.post('/', checkAuth(UserRole.DOCTOR), DoctorScheduleController.insertIntoDB);

export const doctorScheduleRoutes = router;
