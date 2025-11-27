import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import { envVars } from './app/config/env';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
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
