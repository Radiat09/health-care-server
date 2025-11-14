import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryUpload } from "./cloudinary.config";
import { NextFunction, Request, Response } from "express";

interface CustomParams {
  public_id?: (req: Express.Request, file: Express.Multer.File) => string;
  folder?: string;
  format?: string;
  transformation?: Array<object>;
  upload_preset?: string; // Add custom property
}
const storage = new CloudinaryStorage({
  cloudinary: cloudinaryUpload,
  params: {
    public_id: (req, file) => {
      // My Special.Image#!@.png => 4545adsfsadf-45324263452-my-image.png
      // My Special.Image#!@.png => [My Special, Image#!@, png]

      const fileName = file.originalname
        .toLowerCase()
        .replace(/\s+/g, "-") // empty space remove replace with dash
        .replace(/\./g, "-")
        // eslint-disable-next-line no-useless-escape
        .replace(/[^a-z0-9\-\.]/g, ""); // non alpha numeric - !@#$

      const extension = file.originalname.split(".").pop();

      // binary -> 0,1 hexa decimal -> 0-9 A-F base 36 -> 0-9 a-z
      // 0.2312345121 -> "0.hedfa674338sasfamx" ->
      //452384772534
      const uniqueFileName =
        Math.random().toString(36).substring(2) +
        "-" +
        Date.now() +
        "-" +
        fileName +
        "." +
        extension;

      return uniqueFileName;
    },
  },
});

export const multerUpload = multer({ storage: storage });

export const multerWithErrorHandling = {
  // Single file
  single: (fieldName: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
      multerUpload.single(fieldName)(req, res, (err) => {
        handleMulterError(err, res, next);
      });
    };
  },

  // Multiple files
  array: (fieldName: string, maxCount?: number) => {
    return (req: Request, res: Response, next: NextFunction) => {
      multerUpload.array(fieldName, maxCount)(req, res, (err) => {
        handleMulterError(err, res, next);
      });
    };
  },

  // Multiple fields with different files
  fields: (fields: multer.Field[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      multerUpload.fields(fields)(req, res, (err) => {
        handleMulterError(err, res, next);
      });
    };
  },

  // Any file (single or multiple)
  any: () => {
    return (req: Request, res: Response, next: NextFunction) => {
      multerUpload.any()(req, res, (err) => {
        handleMulterError(err, res, next);
      });
    };
  },
};

// Common error handler
const handleMulterError = (err: any, res: Response, next: NextFunction) => {
  if (err) {
    if (err.message.includes("Upload preset must be specified")) {
      return res.status(500).json({
        success: false,
        message: "Server configuration error - file upload service unavailable",
      });
    }

    // Handle other Multer-specific errors
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        message: "File too large",
      });
    }

    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files",
      });
    }

    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Unexpected file field",
      });
    }

    return next(err);
  }
  next();
};
