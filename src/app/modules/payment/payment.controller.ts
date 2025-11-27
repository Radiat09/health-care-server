import { Request, Response } from "express";
import { stripe } from "../../config/stripe";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { PaymentService } from "./payment.service";


const handleStripeWebhookEvent = catchAsync(async (req: Request, res: Response) => {

  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = "whsec_e9c98f0179a2ad29304290ec0845dffdf4d662edb4db3c3d1a48a6567d97af6b"

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error("⚠️ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  const result = await PaymentService.handleStripeWebhookEvent(event);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Webhook req send successfully',
    data: result,
  });
});

export const PaymentController = {
  handleStripeWebhookEvent
}