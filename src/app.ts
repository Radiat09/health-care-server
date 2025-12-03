import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import cron from "node-cron";
import { envVars } from './app/config/env';
import { AppError } from './app/errorHerlpers/AppError';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import { AppointmentService } from './app/modules/appointment/appointment.service';
import { PaymentController } from './app/modules/payment/payment.controller';
import router from './app/routes';

const app: Application = express();

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  PaymentController.handleStripeWebhookEvent
);

// Body parsers FIRST
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Then other middleware
app.use(cookieParser());
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }),
);

cron.schedule("* * * * *", async () => {
  try {
    console.log("Node cron called at", new Date());
    AppointmentService.cancelUnpaidAppointments();
  } catch (error) {
    console.error(error);
    throw new AppError(500, "Failed to cancel unpaid appointments");
  }
})

// Routes last
app.use('/api/v1', router);

app.get('/', (req: Request, res: Response) => {
  res.send({
    message: 'Server is running..',
    environment: envVars.NODE_ENV,
    uptime: process.uptime().toFixed(2) + ' sec',
    timeStamp: new Date().toISOString(),
  });
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
