import { UserRole } from "@prisma/client";
import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { AppointmentController } from "./appointment.controller";

const router = express.Router();



router.get(
    "/my-appointments",
    checkAuth(UserRole.PATIENT, UserRole.DOCTOR),
    AppointmentController.getMyAppointments
)
router.post(
    "/",
    checkAuth(UserRole.PATIENT),
    AppointmentController.createAppointment
)

router.patch(
    "/status/:id",
    checkAuth(UserRole.ADMIN, UserRole.DOCTOR),
    AppointmentController.updateAppointmentStatus
)

export const AppointmentRoutes = router;