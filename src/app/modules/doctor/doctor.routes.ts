import { UserRole } from "@prisma/client";
import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { DoctorController } from "./doctor.controller";
const router = express.Router();

router.post("/suggestion", DoctorController.getAISuggestions);

router.get(
    "/",
    DoctorController.getAllFromDB
)

router.patch(
    "/:id",
    DoctorController.updateIntoDB
)

router.get('/:id', DoctorController.getByIdFromDB);

router.patch(
    "/:id",
    checkAuth(UserRole.ADMIN, UserRole.DOCTOR),
    DoctorController.updateIntoDB
);

router.delete(
    '/:id',
    checkAuth(UserRole.ADMIN),
    DoctorController.deleteFromDB
);

router.delete(
    '/soft/:id',
    checkAuth(UserRole.ADMIN),
    DoctorController.softDelete);
export const doctorRoutes = router;