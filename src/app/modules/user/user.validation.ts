import z from "zod";
const createPatientValidationSchema = z.object({
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
  patient: z.object({
    name: z
      .string()
      .min(1, "Name is required")
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be less than 50 characters"),
    email: z.string().min(1, "Email is required").email("Invalid email format"),
  }),
  address: z
    .string()
    .max(200, "Address must be less than 200 characters")
    .optional(),
});
export const UserValidation = {
  createPatientValidationSchema,
};
