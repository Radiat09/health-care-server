import z from 'zod';

const createDoctorScheduleValidationSchema = z.object({
  scheduleIds: z.array(z.string()),
});

export const DoctorScheduleValidation = {
  createDoctorScheduleValidationSchema,
};
