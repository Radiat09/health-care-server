// import { NextFunction, Request, Response } from "express"
// import httpStatus from "http-status"

// const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {

//     let statusCode = httpStatus.INTERNAL_SERVER_ERROR;
//     let success = false;
//     let message = err.message || "Something went wrong!";
//     let error = err;

//     res.status(statusCode).json({
//         success,
//         message,
//         error
//     })
// };

// export default globalErrorHandler;

import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import { handlerDuplicateError } from "../helpers/handleDuplicateError";
import { TErrorSources } from "../interfaces/error.types";
import { AppError } from "../errorHerlpers/AppError";
import { handlePrismaValidationError } from "../helpers/handlePrismaValidationError";
import { handlerZodError } from "../helpers/handlerZodError";
import multer from "multer";
import { handleMulterError } from "../helpers/handleMulterError";

const globalErrorHandler = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (envVars.NODE_ENV === "development") {
    console.log("🚀 Global Error Handler:", err);
  }

  let errorSources: TErrorSources[] = [];
  let statusCode = 500;
  let message = "Something Went Wrong!!";

  // Multer Errors - Handle first since they're most specific
  if (err instanceof multer.MulterError) {
    const simplifiedError = handleMulterError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources || [];
  }
  // Prisma Client Validation Errors
  else if (err.name === "PrismaClientValidationError") {
    statusCode = 400;
    message = "Invalid database operation";
    errorSources = [
      {
        path: "data",
        message: "The request contains invalid fields for the database schema",
      },
    ];
  }
  // Prisma Errors (by error code)
  else if (err.code) {
    switch (err.code) {
      // Unique constraint violation (like duplicate key)
      case "P2002":
        const simplifiedError = handlerDuplicateError(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorSources = simplifiedError.errorSources || [
          {
            path: err.meta?.target?.[0] || "unknown",
            message: `Duplicate value for field: ${
              err.meta?.target?.[0] || "unknown"
            }`,
          },
        ];
        break;

      // Record not found
      case "P2025":
        statusCode = 404;
        message = err.meta?.cause || "Record not found";
        errorSources = [
          {
            path: "id",
            message: err.meta?.cause || "The requested record was not found",
          },
        ];
        break;

      // Foreign key constraint failed
      case "P2003":
        statusCode = 400;
        message = "Foreign key constraint failed";
        errorSources = [
          {
            path: err.meta?.field_name || "unknown",
            message: `Invalid reference: ${err.meta?.field_name || "unknown"}`,
          },
        ];
        break;

      // Required relation violation
      case "P2018":
        statusCode = 400;
        message = "Required relation not found";
        errorSources = [
          {
            path: "relation",
            message: "The required connected records were not found",
          },
        ];
        break;

      // Query parameter validation error
      case "P2020":
        statusCode = 400;
        message = "Value out of range for the type";
        errorSources = [
          {
            path: err.meta?.target || "unknown",
            message: `Value is too large for the field type: ${
              err.meta?.target || "unknown"
            }`,
          },
        ];
        break;

      // Prisma validation errors
      case "P2000":
      case "P2001":
      case "P2006":
        const validationError = handlePrismaValidationError(err);
        statusCode = validationError.statusCode;
        message = validationError.message;
        errorSources = validationError.errorSources || [];
        break;

      // Connection and timeout errors
      case "P1000":
      case "P1001":
      case "P1002":
      case "P1003":
      case "P1008":
      case "P1009":
        statusCode = 503;
        message = "Database connection error";
        errorSources = [
          {
            path: "database",
            message: "Unable to connect to the database",
          },
        ];
        break;

      // Database schema issues
      case "P1010":
      case "P1011":
      case "P1012":
      case "P1013":
      case "P1014":
      case "P1015":
      case "P1016":
      case "P1017":
        statusCode = 500;
        message = "Database schema error";
        errorSources = [
          {
            path: "database",
            message: "There is an issue with the database schema",
          },
        ];
        break;

      // Transaction errors
      case "P2028":
        statusCode = 500;
        message = "Transaction error";
        errorSources = [
          {
            path: "transaction",
            message: "A transaction error occurred",
          },
        ];
        break;

      // Timeout errors
      case "P2024":
        statusCode = 408;
        message = "Database operation timeout";
        errorSources = [
          {
            path: "database",
            message: "The database operation timed out",
          },
        ];
        break;

      default:
        // Handle other Prisma error codes
        statusCode = 400;
        message = err.message || "Database operation failed";
        errorSources = [
          {
            path: "database",
            message: err.message || "An unexpected database error occurred",
          },
        ];
    }
  }
  // Zod Validation Errors
  else if (err.name === "ZodError") {
    const simplifiedError = handlerZodError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources || [];
  }
  // Custom AppError
  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorSources = err.errorSources || [];
  }
  // Generic JavaScript Errors
  else if (err instanceof Error) {
    statusCode = 500;
    message = err.message;

    // Handle common non-Prisma errors
    if (err.name === "JsonWebTokenError") {
      statusCode = 401;
      message = "Invalid token";
    } else if (err.name === "TokenExpiredError") {
      statusCode = 401;
      message = "Token has expired";
    } else if (err.name === "SyntaxError" && err.message.includes("JSON")) {
      statusCode = 400;
      message = "Invalid JSON in request body";
    }
  }

  // Log detailed error in development
  if (envVars.NODE_ENV === "development") {
    console.log("📋 Error Details:", {
      statusCode,
      message,
      errorSources,
      stack: err.stack,
      prismaCode: err.code,
      prismaMeta: err.meta,
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorSources: errorSources.length > 0 ? errorSources : undefined,
    ...(envVars.NODE_ENV === "development" && {
      error: {
        name: err.name,
        ...(err.clientVersion && { clientVersion: err.clientVersion }),
      },
      stack: err.stack,
      prismaCode: err.code,
      prismaMeta: err.meta,
    }),
  });
};

export default globalErrorHandler;
