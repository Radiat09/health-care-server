import { UserGender } from "@prisma/client";
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

const createAdminValidationSchema = z.object({
  password: z.string({
    error: "Password is required",
  }),
  admin: z.object({
    name: z.string({
      error: "Name is required!",
    }),
    email: z.string({
      error: "Email is required!",
    }),
    contactNumber: z.string({
      error: "Contact Number is required!",
    }),
  }),
});

const createDoctorValidationSchema = z.object({
  password: z.string({
    error: "Password is required",
  }),
  doctor: z.object({
    name: z.string({
      error: "Name is required!",
    }),
    email: z.string({
      error: "Email is required!",
    }),
    contactNumber: z.string({
      error: "Contact Number is required!",
    }),
    address: z.string().optional(),
    registrationNumber: z.string({
      error: "Reg number is required",
    }),
    experience: z.number().optional(),
    gender: z.enum([UserGender.MALE, UserGender.FEMALE]),
    appointmentFee: z.number({
      error: "appointment fee is required",
    }),
    qualification: z.string({
      error: "quilification is required",
    }),
    currentWorkingPlace: z.string({
      error: "Current working place is required!",
    }),
    designation: z.string({
      error: "Designation is required!",
    }),
  }),
});
export const UserValidation = {
  createPatientValidationSchema,
  createAdminValidationSchema,
  createDoctorValidationSchema,
};
