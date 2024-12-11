import { ErrorsDescriptions } from '../enums/errorsDescriptions';
import HttpStatusCode from '../enums/httpStatusCodes';
import { AppError } from '../helpers/errorHandler';

interface SizePricing {
  width: number;
  height: number;
  depth: number;
  maxWeight: number;
  sizeCoef: number;
  weightCoef: number;
}

export class DeliveryCostCalculator {
  private readonly baseCost = 500;
  private readonly sizePricing: SizePricing[] = [
    { width: 34, height: 27, depth: 2, maxWeight: 0.5, sizeCoef: 1.1, weightCoef: 1.1 },
    { width: 17, height: 12, depth: 9, maxWeight: 0.5, sizeCoef: 1.1, weightCoef: 1.1 },
    { width: 23, height: 19, depth: 10, maxWeight: 2, sizeCoef: 1.2, weightCoef: 1.25 },
    { width: 33, height: 25, depth: 25, maxWeight: 5, sizeCoef: 1.3, weightCoef: 1.35 },
    { width: 60, height: 35, depth: 30, maxWeight: 18, sizeCoef: 1.4, weightCoef: 1.45 },
    { width: 60, height: 60, depth: 30, maxWeight: 20, sizeCoef: 1.5, weightCoef: 1.55 }
  ];

  private interpolate(coef1: number, coef2: number, value1: number, value2: number, value: number): number {
    if (value1 === value2) {
      return coef1;
    }

    const ratio = (value - value1) / (value2 - value1);
    return coef1 + ratio * (coef2 - coef1);
  }

  private calculateVolumeCoef(volume: number): number {
    const firstSize = this.sizePricing[0];
    const lastSize = this.sizePricing[this.sizePricing.length - 1];
    const firstSizeVolume = firstSize.width * firstSize.height * firstSize.depth;
    const lastSizeVolume = lastSize.width * lastSize.height * lastSize.depth;

    switch (true) {
      case volume <= firstSizeVolume:
        return firstSize.sizeCoef;
      case volume >= lastSizeVolume:
        return lastSize.sizeCoef * Math.pow(1.03, (volume - lastSizeVolume) / lastSizeVolume);
      default:
        for (let i = 0; i < this.sizePricing.length - 1; i++) {
          const currentSize = this.sizePricing[i];
          const nextSize = this.sizePricing[i + 1];
          const currentVolume = currentSize.width * currentSize.height * currentSize.depth;
          const nextVolume = nextSize.width * nextSize.height * nextSize.depth;

          if (volume >= currentVolume && volume <= nextVolume) {
            return this.interpolate(currentSize.sizeCoef, nextSize.sizeCoef, currentVolume, nextVolume, volume);
          }
        }
        return 1;
    }
  }

  private calculateWeightCoef(weight: number): number {
    const firstSize = this.sizePricing[0];
    const lastSize = this.sizePricing[this.sizePricing.length - 1];

    switch (true) {
      case weight <= firstSize.maxWeight:
        return firstSize.weightCoef;
      case weight >= lastSize.maxWeight:
        return lastSize.weightCoef * Math.pow(1.05, (weight - lastSize.maxWeight) / lastSize.maxWeight);
      default:
        for (let i = 0; i < this.sizePricing.length - 1; i++) {
          const currentSize = this.sizePricing[i];
          const nextSize = this.sizePricing[i + 1];

          if (weight >= currentSize.maxWeight && weight <= nextSize.maxWeight) {
            return this.interpolate(
              currentSize.weightCoef,
              nextSize.weightCoef,
              currentSize.maxWeight,
              nextSize.maxWeight,
              weight
            );
          }
        }
        return 1;
    }
  }

  private calculateInterpolatedSizeCoef(width: number, height: number, depth: number, weight: number): number {
    const volume = width * height * depth;

    if (weight > 100) throw new AppError(ErrorsDescriptions.OVERWEIGHT_ERROR, true, null, HttpStatusCode.BAD_REQUEST);

    const sizeCoef = this.calculateVolumeCoef(volume);
    const weightCoef = this.calculateWeightCoef(weight);

    return sizeCoef * weightCoef;
  }

  private calculateDistanceCoef(distance: number): number {
    const distanceInThousands = Math.ceil(distance / 10000);
    return Math.pow(1.005, distanceInThousands);
  }

  private calculateStrictSizeCoef(width: number, height: number, depth: number, weight: number): number {
    const size = this.sizePricing.find(
      (size) => width === size.width && height === size.height && depth === size.depth && weight <= size.maxWeight
    );

    if (!size) {
      throw new AppError(ErrorsDescriptions.NO_TEMPLATE_SIZE_ERROR, true, null, HttpStatusCode.BAD_REQUEST);
    }

    return size.sizeCoef * size.weightCoef;
  }

  public calculateCost(
    width: number,
    height: number,
    depth: number,
    weight: number,
    distance: number,
    isStrict: boolean
  ): number {
    let sizeCoef: number;

    if (isStrict) {
      sizeCoef = this.calculateStrictSizeCoef(width, height, depth, weight);
    } else {
      sizeCoef = this.calculateInterpolatedSizeCoef(width, height, depth, weight);
    }

    const distanceCoef = this.calculateDistanceCoef(distance);

    return this.baseCost * sizeCoef * distanceCoef;
  }
}
