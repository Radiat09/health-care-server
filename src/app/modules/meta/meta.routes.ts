import { UserRole } from '@prisma/client';
import express from 'express';
import { checkAuth } from '../../middlewares/checkAuth';
import { MetaController } from './meta.controller';

const router = express.Router();

router.get(
    '/',
    checkAuth(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
    MetaController.fetchDashboardMetaData
)


export const MetaRoutes = router;