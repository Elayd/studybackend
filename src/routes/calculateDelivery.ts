import express from 'express';
import { getDeliveryCost } from '../controllers/getDeliveryCost';

const deliveryRoute = express.Router();

deliveryRoute.get('/cost', getDeliveryCost);

export default deliveryRoute;
