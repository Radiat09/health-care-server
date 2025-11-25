import { UserRole } from "@prisma/client";
import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { AppointmentController } from "./appointment.controller";

const router = express.Router();

router.post(
    "/",
    checkAuth(UserRole.PATIENT),
    AppointmentController.createAppointment
)

export const AppointmentRoutes = router;