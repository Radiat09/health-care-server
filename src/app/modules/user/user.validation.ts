import z from "zod";
const createPatientValidationSchema = z.object({
  password: z.string({
    error: "Password is required",
  }),
  patient: {
    name: z.string({
      error: "Name is required",
    }),
    email: z.string({
      error: "Email is required",
    }),
  },
  address: z.string().optional(),
});
export const UserValidation = {
  createPatientValidationSchema,
};
