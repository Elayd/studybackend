import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { handler } from './helpers/errorHandler';
import { Response, Request, NextFunction } from 'express';
import Redis from 'ioredis';
import deliveryRoute from './routes/calculateDelivery';
dotenv.config();

export const app = express();

export const redisClient = new Redis(process.env.REDIS_URL!);

// todo: поправить корсы под прод
const corsConfig = {
  origin: true,
  credentials: true
};

app.use(cors(corsConfig));
app.options('*', cors(corsConfig));

app.use(express.json());

app.use(cookieParser());

app.use('/api/delivery', deliveryRoute);

app.use(async (err: Error, req: Request, res: Response, _: NextFunction) => {
  await handler.handleError(err, res);
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(process.env.PORT, () => {
    console.log(`RUNNING PORT ${process.env.PORT}`);
  });
}
