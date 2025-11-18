import express from "express";
import { UserController } from "./user.controller";
import { multerWithErrorHandling } from "../../config/multer.config";
import { validateRequest } from "../../middlewares/validateRequest";
import { UserValidation } from "./user.validation";
import { UserRole } from "@prisma/client";
import { checkAuth } from "../../middlewares/checkAuth";

const router = express.Router();

router.get("/", checkAuth(UserRole.ADMIN), UserController.getAllFromDB);

router.post(
  "/create-patient",
  multerWithErrorHandling.single("file"),
  validateRequest(UserValidation.createPatientValidationSchema),
  UserController.createPatient
);

router.post(
  "/create-admin",
  checkAuth(UserRole.ADMIN),
  multerWithErrorHandling.single("file"),
  validateRequest(UserValidation.createAdminValidationSchema),
  UserController.createAdmin
);

router.post(
  "/create-doctor",
  checkAuth(UserRole.ADMIN),
  multerWithErrorHandling.single("file"),
  validateRequest(UserValidation.createDoctorValidationSchema),
  UserController.createDoctor
);
export const userRoutes = router;
