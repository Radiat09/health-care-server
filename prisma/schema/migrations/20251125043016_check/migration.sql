/*
  Warnings:

  - You are about to drop the `Schedule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `admins` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `appointments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `doctor_schedules` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `doctor_specialities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `doctors` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `patients` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `prescriptions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `specialities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "admins" DROP CONSTRAINT "admins_email_fkey";

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_patientId_fkey";

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_scheduleId_fkey";

-- DropForeignKey
ALTER TABLE "doctor_schedules" DROP CONSTRAINT "doctor_schedules_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "doctor_schedules" DROP CONSTRAINT "doctor_schedules_scheduleId_fkey";

-- DropForeignKey
ALTER TABLE "doctor_specialities" DROP CONSTRAINT "doctor_specialities_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "doctor_specialities" DROP CONSTRAINT "doctor_specialities_specialitiesId_fkey";

-- DropForeignKey
ALTER TABLE "doctors" DROP CONSTRAINT "doctors_email_fkey";

-- DropForeignKey
ALTER TABLE "patients" DROP CONSTRAINT "patients_email_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_appointmentId_fkey";

-- DropForeignKey
ALTER TABLE "prescriptions" DROP CONSTRAINT "prescriptions_appointmentId_fkey";

-- DropForeignKey
ALTER TABLE "prescriptions" DROP CONSTRAINT "prescriptions_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "prescriptions" DROP CONSTRAINT "prescriptions_patientId_fkey";

-- DropTable
DROP TABLE "Schedule";

-- DropTable
DROP TABLE "admins";

-- DropTable
DROP TABLE "appointments";

-- DropTable
DROP TABLE "doctor_schedules";

-- DropTable
DROP TABLE "doctor_specialities";

-- DropTable
DROP TABLE "doctors";

-- DropTable
DROP TABLE "patients";

-- DropTable
DROP TABLE "payments";

-- DropTable
DROP TABLE "prescriptions";

-- DropTable
DROP TABLE "specialities";

-- DropTable
DROP TABLE "users";

-- DropEnum
DROP TYPE "AppointmentStatus";

-- DropEnum
DROP TYPE "PaymentStatus";

-- DropEnum
DROP TYPE "UserGender";

-- DropEnum
DROP TYPE "UserRole";

-- DropEnum
DROP TYPE "UserStatus";
