import express from "express";
import { UserController } from "./user.controller";
import { multerWithErrorHandling } from "../../config/multer.config";
import { validateRequest } from "../../middlewares/validateRequest";
import { UserValidation } from "./user.validation";
const router = express.Router();

router.post(
  "/create-patient",
  multerWithErrorHandling.single("file"),
  validateRequest(UserValidation.createPatientValidationSchema),
  UserController.createPatient
);
export const userRoutes = router;
