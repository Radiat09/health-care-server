import { UserRole } from "@prisma/client";
import express from "express";
import { multerWithErrorHandling } from "../../config/multer.config";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { UserController } from "./user.controller";
import { UserValidation } from "./user.validation";

const router = express.Router();

router.get(
  "/",
  checkAuth(UserRole.ADMIN),
  UserController.getAllFromDB);

router.get(
  '/me',
  checkAuth(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  UserController.getMyProfile
)

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

router.patch(
  '/:id/status',
  checkAuth(UserRole.ADMIN),
  UserController.changeProfileStatus
);
export const userRoutes = router;
