import { NextFunction, Request, Response } from 'express';
import { AppError } from '../helpers/errorHandler';
import HttpStatusCode from '../enums/httpStatusCodes';
import { ErrorsDescriptions } from '../enums/errorsDescriptions';
import { cacheManager } from '../helpers/redisCache';
import { GetDeliveryCostRequestSchema } from '../schemas/getDeliveryCostRequestSchema';
import { getCoords } from '../utils/getCoords';
import { getRouteDistance } from '../utils/getRouteDistance';
import { DeliveryCostCalculator } from '../utils/calculateCost';

interface GetDeliveryCostRequest extends Request {
  query: {
    width: string;
    height: string;
    weight: string;
    from: string;
    to: string;
    isStrict: string;
    depth: string;
  };
}

interface GetDeliveryCostResponse {
  cost: string;
}

export const getDeliveryCost = async (req: GetDeliveryCostRequest, res: Response, next: NextFunction) => {
  try {
    const { width, height, weight, from, to, isStrict, depth } = GetDeliveryCostRequestSchema.parse(req.query);

    const widthNumber = parseFloat(width);
    const heightNumber = parseFloat(height);
    const weightNumber = parseFloat(weight);
    const depthNumber = parseFloat(depth);
    const isStrictMode = isStrict === 'true';

    const cacheKey = `deliveryCost:${width}_${height}_${weight}_${from}_${to}_${isStrict}`;

    const deliveryCost = await cacheManager.cacheRequest<GetDeliveryCostResponse>(cacheKey, async () => {
      try {
        const fromCoords = await getCoords(from);
        const toCoords = await getCoords(to);

        const distance = await getRouteDistance(fromCoords, toCoords);

        const deliveryCostCalculator = new DeliveryCostCalculator();
        const cost = deliveryCostCalculator.calculateCost(
          widthNumber,
          heightNumber,
          depthNumber,
          weightNumber,
          distance,
          isStrictMode
        );

        return { cost: cost.toFixed(2) };
      } catch (error) {
        throw error;
      }
    });

    res.status(HttpStatusCode.OK).json(deliveryCost);
  } catch (error) {
    return next(new AppError(ErrorsDescriptions.GET_DELIVERY_COST_ERROR, true, error));
  }
};
