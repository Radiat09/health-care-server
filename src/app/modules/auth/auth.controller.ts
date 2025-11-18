import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AuthService } from "./auth.service";
import { setAuthCookie } from "../../utils/setCookie";

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
