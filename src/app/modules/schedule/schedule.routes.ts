import { UserRole } from '@prisma/client';
import express from 'express';
import { checkAuth } from '../../middlewares/checkAuth';
import { ScheduleController } from './schedule.controller';

const router = express.Router();

router.get('/', checkAuth(UserRole.DOCTOR, UserRole.ADMIN), ScheduleController.schedulesForDoctor);

router.post('/', ScheduleController.insertIntoDB);

router.delete('/:id', ScheduleController.deleteScheduleFromDB);

export const scheduleRoutes = router;
