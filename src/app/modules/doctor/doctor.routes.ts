import express from "express";
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
export const doctorRoutes = router;