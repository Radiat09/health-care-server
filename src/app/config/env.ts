import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

interface EnvConfig {
  PORT: string;
  DATABASE_URL: string;
  NODE_ENV: "development" | "production";
  BCRYPT_SALT_ROUND: string;
  CLOUDINARY: {
    CLOUDINARY_CLOUD_NAME: string;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_API_SECRET: string;
  };
  JWT_REFRESH_EXPIRES: string;
  JWT_ACCESS_EXPIRES: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  SUPER_ADMIN_EMAIL: string;
  SUPER_ADMIN_PASSWORD: string;
  OPENAI_API_KEY: string;
}

const loadEnvVariables = (): EnvConfig => {
  const requiredEnvVariables: string[] = [
    "PORT",
    "DATABASE_URL",
    "NODE_ENV",
    "BCRYPT_SALT_ROUND",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "JWT_REFRESH_SECRET",
    "JWT_REFRESH_EXPIRES",
    "JWT_ACCESS_EXPIRES",
    "JWT_ACCESS_SECRET",
    "SUPER_ADMIN_EMAIL",
    "SUPER_ADMIN_PASSWORD",
    "OPENAI_API_KEY",
  ];

  requiredEnvVariables.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable ${key}`);
    }
  });

  return {
    PORT: process.env.PORT as string,
    DATABASE_URL: process.env.DATABASE_URL as string,
    NODE_ENV: process.env.NODE_ENV as "development" | "production",
    BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND as string,
    CLOUDINARY: {
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
    },
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
    JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES as string,
    JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES as string,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
    SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL as string,
    SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD as string,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY as string,
  };
};

export const envVars: EnvConfig = loadEnvVariables();
