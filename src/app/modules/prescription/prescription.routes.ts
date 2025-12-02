import { UserRole } from '@prisma/client';
import express from 'express';
import { checkAuth } from '../../middlewares/checkAuth';
import { PrescriptionController } from './prescription.controller';
const router = express.Router();

router.get(
    '/my-prescription',
    checkAuth(UserRole.PATIENT),
    PrescriptionController.patientPrescription
)


router.post(
    "/",
    checkAuth(UserRole.DOCTOR),
    PrescriptionController.createPrescription
);

export const PrescriptionRoutes = router;