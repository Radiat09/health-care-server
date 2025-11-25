import { UserRole } from '@prisma/client';
import express from 'express';
import { multerWithErrorHandling } from '../../config/multer.config';
import { checkAuth } from '../../middlewares/checkAuth';
import { validateRequest } from '../../middlewares/validateRequest';
import { SpecialtiesController } from './specialties.controller';
import { SpecialtiesValidtaion } from './specialties.validation';

const router = express.Router();

// Task 1: Retrieve Specialties Data

/**
- Develop an API endpoint to retrieve all specialties data.
- Implement an HTTP GET endpoint returning specialties in JSON format.
- ENDPOINT: /specialties
*/
router.get('/', SpecialtiesController.getAllFromDB);

router.post(
  '/',
  multerWithErrorHandling.single('file'),
  validateRequest(SpecialtiesValidtaion.create),
  SpecialtiesController.inserIntoDB,
);

// Task 2: Delete Specialties Data by ID

/**
- Develop an API endpoint to delete specialties by ID.
- Implement an HTTP DELETE endpoint accepting the specialty ID.
- Delete the specialty from the database and return a success message.
- ENDPOINT: /specialties/:id
*/

router.delete(
  '/:id',
  checkAuth(UserRole.DOCTOR, UserRole.ADMIN),
  SpecialtiesController.deleteFromDB,
);

export const SpecialtiesRoutes = router;
