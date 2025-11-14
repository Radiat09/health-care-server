import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { AuthService } from "./auth.service";
import { setAuthCookie } from "../../shared/setCookie";

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.login(req.body);

  setAuthCookie(res, {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Logged in successfully",
    data: {
      needPasswordChange: result.needPasswordChange,
    },
  });
});

export const authController = {
  login,
};
